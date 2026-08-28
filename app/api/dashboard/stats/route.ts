import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

interface AgentSource {
  _id: unknown;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date | string;
  photo?: string;
  email?: string;
  cellPhone?: string;
  recoLicExpiry?: Date | string;
}
interface TradeSource {
  tradeStatus?: string;
  agreementStatus?: string;
  tradeType?: string;
  ourRole?: string;
  offerDate?: Date | string;
  firmDate?: Date | string;
  completionDate?: Date | string;
  commissionAmount?: number;
  agents?: Array<{ agentId?: unknown; agentName?: string }>;
  receipts?: Array<{ receiptDate?: Date | string; amount?: number }>;
}
interface AccountingSource {
  invoiceDate?: string;
  subtotal?: number;
  amount?: number;
  hstAmount?: number;
  paymentRows?: Array<{ paymentDate?: string }>;
}
interface CommissionEvent {
  date: string;
  amount: number;
  trade: TradeSource;
  source: "receipt" | "closed-trade";
}

const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const dateKey = (value: unknown) => {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
};
const net = (document: AccountingSource) => Number(document.subtotal ?? Number(document.amount || 0) - Number(document.hstAmount || 0));

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
  try {
    const { Agent, Employee, Expenditure, Income, PayrollRun, Reconciliation, Trade } = await connectToDatabase();
    const now = new Date();
    const today = dateKey(now);
    const currentYear = today.slice(0, 4);
    const currentMonth = today.slice(0, 7);
    const startOfYear = `${currentYear}-01-01`;
    const startOfMonth = `${currentMonth}-01`;
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).toISOString().slice(0, 10);

    const [agentDocuments, tradeDocuments, incomeDocuments, expenseDocuments, latestReconciliation, payrollDocuments, employeeDocuments] = await Promise.all([
      Agent.find({ isActive: true }).lean(),
      Trade.find({ isActive: { $ne: false } }).lean(),
      Income.find({}).lean(),
      Expenditure.find({}).lean(),
      Reconciliation.findOne({ asOn: { $lte: today } }).sort({ asOn: -1, createdAt: -1 }).lean(),
      PayrollRun.find({ status: "Generated" }).lean(),
      Employee.find({ isActive: { $ne: false } }).lean(),
    ]);
    const agents = agentDocuments as unknown as AgentSource[];
    const trades = tradeDocuments as unknown as TradeSource[];
    const incomes = incomeDocuments as unknown as AccountingSource[];
    const expenses = expenseDocuments as unknown as AccountingSource[];
    const payrollRuns = payrollDocuments as unknown as Array<{ employeeId?: unknown; salary?: number; payDueDate?: string }>;
    const employees = employeeDocuments as unknown as Array<{ _id: unknown; firstName?: string; lastName?: string }>;

    const activeTrades = trades.filter((trade) => !/collapsed/i.test(trade.agreementStatus || ""));
    // Imported closed trades often have a commission total but no receipt rows.
    // Use real receipts whenever present; otherwise recognize the closed trade on
    // its completion date so the dashboard remains useful after a data import.
    const commissionEvents: CommissionEvent[] = [];
    activeTrades.forEach((trade) => {
      const recordedReceipts = (trade.receipts || []).map((receipt) => ({
        date: dateKey(receipt.receiptDate),
        amount: Number(receipt.amount || 0),
        trade,
        source: "receipt" as const,
      })).filter((receipt) => receipt.date && receipt.amount !== 0);
      if (recordedReceipts.length) {
        commissionEvents.push(...recordedReceipts);
        return;
      }
      if (trade.tradeStatus !== "Closed" || Number(trade.commissionAmount || 0) === 0) return;
      const fallbackDate = dateKey(trade.completionDate || trade.firmDate || trade.offerDate);
      if (fallbackDate) commissionEvents.push({ date: fallbackDate, amount: Number(trade.commissionAmount || 0), trade, source: "closed-trade" });
    });
    const ytdReceipts = commissionEvents.filter((receipt) => receipt.date >= startOfYear && receipt.date <= today);
    const grossCommissionYTD = round(ytdReceipts.reduce((sum, receipt) => sum + receipt.amount, 0));
    const pendingTrades = activeTrades.map((trade) => {
      const received = (trade.receipts || []).reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0);
      return Math.max(0, Number(trade.commissionAmount || 0) - received);
    }).filter((amount) => amount > 0.009);

    const monthStarts = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + index, 1));
      return date.toISOString().slice(0, 7);
    });
    const monthlyTrend = monthStarts.map((month) => ({
      month,
      amount: round(commissionEvents.filter((receipt) => receipt.date.startsWith(month)).reduce((sum, receipt) => sum + receipt.amount, 0)),
    }));
    const groupReceipts = (field: "tradeType" | "ourRole") => {
      const grouped = new Map<string, number>();
      ytdReceipts.forEach((receipt) => {
        const label = receipt.trade[field]?.trim() || "Unspecified";
        grouped.set(label, (grouped.get(label) || 0) + receipt.amount);
      });
      return [...grouped.entries()].map(([label, amount]) => ({ label, amount: round(amount) })).sort((left, right) => right.amount - left.amount);
    };

    const agentNames = new Map(agents.map((agent) => [String(agent._id), `${agent.firstName || ""} ${agent.lastName || ""}`.trim()]));
    const performers = new Map<string, { agentId: string; name: string; commission: number; deals: number }>();
    const addPerformance = (trade: TradeSource, amount: number, deal: boolean) => {
      const assigned = (trade.agents || []).filter((agent) => agent.agentId || agent.agentName);
      if (!assigned.length) return;
      assigned.forEach((agent) => {
        const id = String(agent.agentId || agent.agentName);
        const current = performers.get(id) || { agentId: id, name: agentNames.get(id) || agent.agentName || "Agent", commission: 0, deals: 0 };
        current.commission += amount / assigned.length;
        if (deal) current.deals += 1;
        performers.set(id, current);
      });
    };
    ytdReceipts.forEach((receipt) => addPerformance(receipt.trade, receipt.amount, false));
    activeTrades.filter((trade) => trade.tradeStatus === "Closed" && dateKey(trade.completionDate) >= startOfYear && dateKey(trade.completionDate) <= today).forEach((trade) => addPerformance(trade, 0, true));
    const topPerformers = [...performers.values()].map((row) => ({ ...row, commission: round(row.commission), deals: Math.round(row.deals) })).sort((left, right) => right.commission - left.commission);

    const monthlyPerformers = new Map<string, { agentId: string; name: string; commission: number; deals: number }>();
    commissionEvents.filter((receipt) => receipt.date.startsWith(currentMonth)).forEach((receipt) => {
      const assigned = (receipt.trade.agents || []).filter((agent) => agent.agentId || agent.agentName);
      assigned.forEach((agent) => {
        const id = String(agent.agentId || agent.agentName);
        const current = monthlyPerformers.get(id) || { agentId: id, name: agentNames.get(id) || agent.agentName || "Agent", commission: 0, deals: 0 };
        current.commission += receipt.amount / Math.max(1, assigned.length);
        monthlyPerformers.set(id, current);
      });
    });
    activeTrades.filter((trade) => trade.tradeStatus === "Closed" && dateKey(trade.completionDate) >= startOfMonth && dateKey(trade.completionDate) <= monthEnd).forEach((trade) => {
      (trade.agents || []).filter((agent) => agent.agentId || agent.agentName).forEach((agent) => {
        const id = String(agent.agentId || agent.agentName);
        const current = monthlyPerformers.get(id) || { agentId: id, name: agentNames.get(id) || agent.agentName || "Agent", commission: 0, deals: 0 };
        current.deals += 1;
        monthlyPerformers.set(id, current);
      });
    });

    const todayDate = new Date(`${today}T00:00:00Z`);
    const birthdayWindowEnd = new Date(todayDate);
    birthdayWindowEnd.setUTCDate(birthdayWindowEnd.getUTCDate() + 15);
    const birthdays = agents.filter((agent) => agent.dateOfBirth).map((agent) => {
      const birthDate = new Date(agent.dateOfBirth as Date | string);
      let nextBirthday = new Date(Date.UTC(todayDate.getUTCFullYear(), birthDate.getUTCMonth(), birthDate.getUTCDate()));
      if (nextBirthday < todayDate) nextBirthday = new Date(Date.UTC(todayDate.getUTCFullYear() + 1, birthDate.getUTCMonth(), birthDate.getUTCDate()));
      return { ...agent, nextBirthday };
    }).filter((agent) => agent.nextBirthday <= birthdayWindowEnd).sort((left, right) => left.nextBirthday.getTime() - right.nextBirthday.getTime());
    const recoWindowEnd = new Date(todayDate);
    recoWindowEnd.setUTCDate(recoWindowEnd.getUTCDate() + 30);
    const recoExpiries = agents.filter((agent) => {
      const expiry = dateKey(agent.recoLicExpiry);
      return expiry >= today && expiry <= dateKey(recoWindowEnd);
    }).sort((left, right) => dateKey(left.recoLicExpiry).localeCompare(dateKey(right.recoLicExpiry)));

    const employeeNames = new Map(employees.map((employee) => [String(employee._id), `${employee.firstName || ""} ${employee.lastName || ""}`.trim()]));
    const payrollDue = payrollRuns.filter((run) => !run.payDueDate || run.payDueDate <= monthEnd).map((run) => ({
      employeeId: String(run.employeeId || ""),
      name: employeeNames.get(String(run.employeeId || "")) || "Employee",
      amount: Number(run.salary || 0),
      dueDate: run.payDueDate || "",
    }));
    const ytdIncome = incomes.filter((document) => dateKey(document.invoiceDate) >= startOfYear && dateKey(document.invoiceDate) <= today).reduce((sum, document) => sum + net(document), 0);
    const ytdExpenses = expenses.filter((document) => dateKey(document.invoiceDate) >= startOfYear && dateKey(document.invoiceDate) <= today).reduce((sum, document) => sum + net(document), 0);

    return NextResponse.json({
      activeAgentsCount: agents.length,
      birthdays,
      recoExpiriesCount: recoExpiries.length,
      recoExpiries,
      tradesOpenCount: activeTrades.filter((trade) => trade.tradeStatus === "Open").length,
      tradesClosingThisMonthCount: activeTrades.filter((trade) => dateKey(trade.completionDate) >= startOfMonth && dateKey(trade.completionDate) <= monthEnd).length,
      tradesClosingTodayCount: activeTrades.filter((trade) => dateKey(trade.completionDate) === today).length,
      tradesClosedCountYTD: activeTrades.filter((trade) => trade.tradeStatus === "Closed" && dateKey(trade.completionDate) >= startOfYear && dateKey(trade.completionDate) <= today).length,
      grossCommissionYTD,
      pendingReceiptsCount: pendingTrades.length,
      pendingReceiptsAmount: round(pendingTrades.reduce((sum, amount) => sum + amount, 0)),
      lastReconciliation: latestReconciliation ? { accountType: latestReconciliation.accountType, asOn: latestReconciliation.asOn, bankBalance: latestReconciliation.bankBalance } : null,
      payrollDue,
      payrollDueTotal: round(payrollDue.reduce((sum, row) => sum + row.amount, 0)),
      netIncomeYTD: round(ytdIncome - ytdExpenses),
      monthlyTrend,
      byTradeType: groupReceipts("tradeType"),
      byOurRole: groupReceipts("ourRole"),
      topPerformers,
      monthlyPerformers: [...monthlyPerformers.values()].map((row) => ({ ...row, commission: round(row.commission), deals: Math.round(row.deals) })).sort((left, right) => right.commission - left.commission),
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
