import { buildAccountingReports } from "@/lib/accountingReports";
import type { DatabaseModels } from "@/lib/mongodb";

export const REPORT_IDS = [
  "activeTermCertificates", "agentGrossCommission", "agentHst", "agentNetCommission",
  "brokerageCommissionEarning", "closedTrades", "comprehensiveCommission", "expense",
  "franchisor", "income", "otherBrokerageAgent", "payrollRemittance", "sellerBuyers",
  "supplier", "trade", "agents", "complianceClosedTrades", "trustLiability", "ledger",
  "t4a", "profitLoss", "balanceSheet", "trialBalance",
] as const;

export type ReportId = (typeof REPORT_IDS)[number];
export const isDealCentreReportId = (value: string): value is ReportId =>
  (REPORT_IDS as readonly string[]).includes(value);

type RowValue = string | number | boolean | null;
export interface ReportColumn {
  key: string;
  label: string;
  format?: "currency" | "date" | "number" | "percent";
}
export interface GeneratedReport {
  id: ReportId;
  title: string;
  description: string;
  period: string;
  columns: ReportColumn[];
  rows: Array<Record<string, RowValue>>;
  metrics: Array<{ label: string; value: number; format?: "currency" | "number" }>;
  notes: string[];
  generatedAt: string;
}

type LooseRecord = Record<string, unknown>;
type ReportModels = Pick<DatabaseModels, "Agent" | "Employee" | "Expenditure" | "Income" | "PayrollRun" | "Reconciliation" | "Trade">;
export interface ReportFilters {
  startDate: string;
  endDate: string;
  asOf: string;
  year: number;
  agentId?: string;
  includeOpenFirmed?: boolean;
  excludeZero?: boolean;
  reportMode?: "summary" | "detailed";
}

const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const number = (value: unknown) => Number(value || 0);
const text = (value: unknown) => String(value || "").trim();
const dateKey = (value: unknown) => value instanceof Date ? value.toISOString().slice(0, 10) : text(value).slice(0, 10);
const inRange = (value: unknown, start: string, end: string) => {
  const key = dateKey(value);
  return Boolean(key && key >= start && key <= end);
};
const moneyText = (value: unknown) => number(text(value).replace(/[^0-9.-]/g, ""));
const fullName = (record: LooseRecord) => [record.firstName, record.middleName, record.lastName].map(text).filter(Boolean).join(" ");
const address = (record: LooseRecord) => [record.street, record.city, record.province, record.postalCode].map(text).filter(Boolean).join(", ");
const netDocument = (record: LooseRecord) => round(number(record.subtotal) || number(record.amount) - number(record.hstAmount));
const periodLabel = (filters: ReportFilters) => `${filters.startDate} to ${filters.endDate}`;
const columns = (...items: Array<[string, string, ReportColumn["format"]?]>): ReportColumn[] =>
  items.map(([key, label, format]) => ({ key, label, ...(format ? { format } : {}) }));

function base(id: ReportId, title: string, description: string, period: string): GeneratedReport {
  return { id, title, description, period, columns: [], rows: [], metrics: [], notes: [], generatedAt: new Date().toISOString() };
}

function documentRows(documents: LooseRecord[], kind: "income" | "expense", filters: ReportFilters) {
  return documents.filter((row) => inRange(row.invoiceDate, filters.startDate, filters.endDate)).map((row) => ({
    invoiceNumber: number(row.invoiceNumber),
    date: dateKey(row.invoiceDate),
    party: text(kind === "income" ? row.customer || row.customerNickName : row.supplierNickName) || "Unspecified",
    category: text(row.category) || "Uncategorized",
    subtotal: netDocument(row),
    hst: round(number(row.hstAmount)),
    total: round(number(row.amount)),
    paid: Array.isArray(row.paymentRows) && row.paymentRows.some((payment) => dateKey((payment as LooseRecord).paymentDate)),
  })).sort((left, right) => right.date.localeCompare(left.date));
}

interface CommissionRow extends Record<string, RowValue> {
  tradeId: string;
  tradeNumber: number;
  date: string;
  status: string;
  address: string;
  tradeType: string;
  ourRole: string;
  agentId: string;
  agent: string;
  grossCommission: number;
  hst: number;
  otherBrokerage: number;
  agentGross: number;
  brokerageEarning: number;
  franchiseFee: number;
  agentNet: number;
}

function commissionRows(trades: LooseRecord[], agents: LooseRecord[], filters: ReportFilters) {
  const agentMap = new Map(agents.map((agent) => [text(agent._id), agent]));
  const rows: CommissionRow[] = [];
  trades.forEach((trade) => {
    const closedDate = dateKey(trade.completionDate || trade.firmDate || trade.offerDate);
    const status = text(trade.tradeStatus) || text(trade.agreementStatus);
    const includedStatus = /closed/i.test(status) || (filters.includeOpenFirmed && /open|firm/i.test(`${trade.tradeStatus || ""} ${trade.agreementStatus || ""}`));
    if (!includedStatus || !inRange(closedDate, filters.startDate, filters.endDate)) return;
    const grossCommission = round(number(trade.commissionAmount));
    const otherBrokerages = Array.isArray(trade.otherBrokerages) ? trade.otherBrokerages as LooseRecord[] : [];
    const otherBrokerage = round(otherBrokerages.reduce((sum, item) => sum + (number(item.commission) || number(item.totalCommission) / 1.13), 0));
    const houseGross = Math.max(0, round(grossCommission - otherBrokerage));
    const assigned = Array.isArray(trade.agents) ? (trade.agents as LooseRecord[]).filter((item) => item.agentId || item.agentName) : [];
    const targets = assigned.length ? assigned : [{ agentId: "", agentName: "Unassigned" }];
    targets.forEach((assignment) => {
      const agentId = text(assignment.agentId);
      if (filters.agentId && filters.agentId !== agentId) return;
      const agentRecord = agentMap.get(agentId) || {};
      const agentGross = round(houseGross / targets.length);
      const sharePercent = number(agentRecord.brokerageSharePercent);
      const fixedShare = moneyText(agentRecord.brokerageShareDollar);
      const perTransaction = moneyText(agentRecord.perTransactionDollar);
      const brokerageEarning = round(Math.min(agentGross, agentGross * sharePercent / 100 + fixedShare + perTransaction));
      const franchisePercent = number(agentRecord.franchiseFeePercent);
      const franchiseCap = moneyText(agentRecord.franchiseFeeMax);
      const uncappedFranchise = agentGross * franchisePercent / 100;
      const franchiseFee = round(franchiseCap > 0 ? Math.min(uncappedFranchise, franchiseCap) : uncappedFranchise);
      const agentNet = round(Math.max(0, agentGross - brokerageEarning - franchiseFee));
      rows.push({
        tradeId: text(trade._id), tradeNumber: number(trade.tradeNumber), date: closedDate, status,
        address: [trade.street, trade.city, trade.province].map(text).filter(Boolean).join(", "),
        tradeType: text(trade.tradeType) || "Unspecified", ourRole: text(trade.ourRole) || "Unspecified",
        agentId, agent: fullName(agentRecord) || text(assignment.agentName) || "Unassigned",
        grossCommission, hst: round(grossCommission * number(trade.tax || 13) / 100), otherBrokerage,
        agentGross, brokerageEarning, franchiseFee, agentNet,
      });
    });
  });
  return rows.filter((row) => !filters.excludeZero || row.grossCommission !== 0).sort((a, b) => b.date.localeCompare(a.date));
}

function summarizeCommission(rows: CommissionRow[], key: "agent" | "tradeType" | "ourRole") {
  const grouped = new Map<string, CommissionRow>();
  rows.forEach((row) => {
    const label = text(row[key]) || "Unspecified";
    const current = grouped.get(label) || { ...row, tradeNumber: 0, date: "", status: "", address: "", tradeId: "", agentId: "", [key]: label, grossCommission: 0, hst: 0, otherBrokerage: 0, agentGross: 0, brokerageEarning: 0, franchiseFee: 0, agentNet: 0 };
    current.tradeNumber += 1;
    (["grossCommission", "hst", "otherBrokerage", "agentGross", "brokerageEarning", "franchiseFee", "agentNet"] as const).forEach((field) => { current[field] = round(number(current[field]) + number(row[field])); });
    grouped.set(label, current);
  });
  return [...grouped.values()].sort((left, right) => right.agentNet - left.agentNet);
}

export async function buildDealCentreReport(models: ReportModels, id: ReportId, filters: ReportFilters): Promise<GeneratedReport> {
  if (["t4a", "profitLoss", "balanceSheet", "trialBalance"].includes(id)) {
    const reports = await buildAccountingReports(models, filters);
    if (id === "t4a") {
      const report = base(id, "T4A Commission Summary", "Paid self-employed commission for CRA Box 020, excluding HST.", `Calendar year ${filters.year}`);
      report.columns = columns(["recipient", "Recipient"], ["recipientNumber", "SIN / BN"], ["address", "Address"], ["box20Commission", "Box 020", "currency"], ["hstExcluded", "HST Excluded", "currency"], ["payments", "Payments", "number"]);
      report.rows = reports.t4a.rows as unknown as Array<Record<string, RowValue>>;
      report.metrics = [{ label: "Total Box 020", value: reports.t4a.totalBox20, format: "currency" }, { label: "HST Excluded", value: reports.t4a.totalHstExcluded, format: "currency" }];
      report.notes = ["Preparation aid only. Review recipient classification and tax identifiers before filing."];
      return report;
    }
    if (id === "profitLoss") {
      const report = base(id, "Profit and Loss Statement", "Income and expenses by account on an accrual basis.", periodLabel(filters));
      report.columns = columns(["section", "Section"], ["account", "Account"], ["amount", "Amount", "currency"]);
      report.rows = [...reports.profitLoss.incomeRows.map((row) => ({ section: "Income", ...row })), ...reports.profitLoss.expenseRows.map((row) => ({ section: "Expense", ...row }))];
      report.metrics = [{ label: "Total Income", value: reports.profitLoss.totalIncome, format: "currency" }, { label: "Total Expenses", value: reports.profitLoss.totalExpenses, format: "currency" }, { label: "Net Income", value: reports.profitLoss.netIncome, format: "currency" }];
      return report;
    }
    if (id === "balanceSheet") {
      const report = base(id, "Balance Sheet", "Assets, liabilities and derived equity.", `As of ${filters.asOf}`);
      report.columns = columns(["section", "Section"], ["account", "Account"], ["amount", "Amount", "currency"]);
      report.rows = [...reports.balanceSheet.assets.map((row) => ({ section: "Asset", ...row })), ...reports.balanceSheet.liabilities.map((row) => ({ section: "Liability", ...row })), ...reports.balanceSheet.equity.map((row) => ({ section: "Equity", ...row }))];
      report.metrics = [{ label: "Total Assets", value: reports.balanceSheet.totalAssets, format: "currency" }, { label: "Liabilities + Equity", value: reports.balanceSheet.totalLiabilitiesAndEquity, format: "currency" }];
      report.notes = ["Bank balances use the latest reconciliation where available; retained earnings is derived until a formal chart of accounts is configured."];
      return report;
    }
    const report = base(id, "Trial Balance", "Debit and credit balances by account.", `As of ${filters.asOf}`);
    report.columns = columns(["section", "Section"], ["account", "Account"], ["debit", "Debit", "currency"], ["credit", "Credit", "currency"]);
    report.rows = reports.trialBalance.rows as unknown as Array<Record<string, RowValue>>;
    report.metrics = [{ label: "Total Debits", value: reports.trialBalance.totalDebits, format: "currency" }, { label: "Total Credits", value: reports.trialBalance.totalCredits, format: "currency" }, { label: "Difference", value: reports.trialBalance.difference, format: "currency" }];
    return report;
  }

  const [agentsRaw, tradesRaw, incomesRaw, expensesRaw, payrollRaw, employeesRaw] = await Promise.all([
    models.Agent.find({}).lean(), models.Trade.find({ isActive: { $ne: false } }).lean(), models.Income.find({}).lean(),
    models.Expenditure.find({}).lean(), models.PayrollRun.find({}).lean(), models.Employee.find({}).lean(),
  ]);
  const agents = agentsRaw as unknown as LooseRecord[];
  const trades = tradesRaw as unknown as LooseRecord[];
  const incomes = incomesRaw as unknown as LooseRecord[];
  const expenses = expensesRaw as unknown as LooseRecord[];
  const payroll = payrollRaw as unknown as LooseRecord[];
  const employees = employeesRaw as unknown as LooseRecord[];
  const commissions = commissionRows(trades, agents, filters);

  if (["agentGrossCommission", "agentHst", "agentNetCommission", "brokerageCommissionEarning", "comprehensiveCommission", "franchisor"].includes(id)) {
    const details = filters.reportMode === "summary" ? summarizeCommission(commissions, "agent") : commissions;
    const names: Record<string, [string, string]> = {
      agentGrossCommission: ["Agent Gross Commission", "Gross commission allocated to each assigned agent."],
      agentHst: ["Agent HST Report", "HST calculated on agent commission for the selected period."],
      agentNetCommission: ["Agent Net Commission", "Commission payable after brokerage and franchise deductions."],
      brokerageCommissionEarning: ["Brokerage Commission Earning", "Brokerage share earned from completed transactions."],
      comprehensiveCommission: ["Comprehensive Commission Report", "Trade, agent, brokerage and franchise commission detail."],
      franchisor: ["Franchisor Report", "Calculated franchise fee by agent and transaction."],
    };
    const report = base(id, names[id][0], names[id][1], periodLabel(filters));
    report.columns = filters.reportMode === "summary"
      ? columns(["agent", "Agent"], ["tradeNumber", "Trades", "number"], ["agentGross", "Gross", "currency"], ["brokerageEarning", "Brokerage", "currency"], ["franchiseFee", "Franchise", "currency"], ["agentNet", "Net", "currency"])
      : columns(["tradeNumber", "Trade #", "number"], ["date", "Date", "date"], ["agent", "Agent"], ["address", "Property"], ["agentGross", "Gross", "currency"], ["brokerageEarning", "Brokerage", "currency"], ["franchiseFee", "Franchise", "currency"], ["agentNet", "Net", "currency"]);
    report.rows = details;
    report.metrics = [{ label: "Agent Gross", value: round(commissions.reduce((sum, row) => sum + row.agentGross, 0)), format: "currency" }, { label: "Brokerage Earned", value: round(commissions.reduce((sum, row) => sum + row.brokerageEarning, 0)), format: "currency" }, { label: "Agent Net", value: round(commissions.reduce((sum, row) => sum + row.agentNet, 0)), format: "currency" }];
    report.notes = ["When a trade has multiple assigned agents, its available commission is divided equally because the current trade record does not store an agent-specific split."];
    return report;
  }

  if (["closedTrades", "complianceClosedTrades", "trade"].includes(id)) {
    const rows = trades.filter((trade) => id === "trade" ? inRange(trade.completionDate || trade.firmDate || trade.offerDate, filters.startDate, filters.endDate) : text(trade.tradeStatus) === "Closed" && inRange(trade.completionDate, filters.startDate, filters.endDate)).map((trade) => ({
      tradeNumber: number(trade.tradeNumber), mls: text(trade.mlsNumber), status: text(trade.tradeStatus), agreement: text(trade.agreementStatus), completionDate: dateKey(trade.completionDate),
      property: [trade.street, trade.city, trade.province].map(text).filter(Boolean).join(", "), tradeType: text(trade.tradeType), ourRole: text(trade.ourRole),
      price: round(number(trade.apsPrice)), commission: round(number(trade.commissionAmount)), agents: Array.isArray(trade.agents) ? (trade.agents as LooseRecord[]).map((agent) => text(agent.agentName)).filter(Boolean).join(", ") : "",
    })).sort((a, b) => b.completionDate.localeCompare(a.completionDate));
    const title = id === "trade" ? "Trade Report" : id === "complianceClosedTrades" ? "Closed Trades — Compliance" : "Closed Trades";
    const report = base(id, title, "Trade status, property, parties and commission records.", periodLabel(filters));
    report.columns = columns(["tradeNumber", "Trade #", "number"], ["mls", "MLS"], ["status", "Status"], ["agreement", "Agreement"], ["completionDate", "Closing", "date"], ["property", "Property"], ["tradeType", "Type"], ["ourRole", "Role"], ["agents", "Agent(s)"], ["price", "Price", "currency"], ["commission", "Commission", "currency"]);
    report.rows = rows; report.metrics = [{ label: "Trades", value: rows.length, format: "number" }, { label: "Commission", value: round(rows.reduce((sum, row) => sum + row.commission, 0)), format: "currency" }];
    return report;
  }

  if (id === "income" || id === "expense") {
    const rows = documentRows(id === "income" ? incomes : expenses, id, filters);
    const report = base(id, id === "income" ? "Income Report" : "Expense Report", `${id === "income" ? "Customer income" : "Supplier expense"} invoices and payment status.`, periodLabel(filters));
    report.columns = columns(["invoiceNumber", "Invoice #", "number"], ["date", "Date", "date"], ["party", id === "income" ? "Customer" : "Supplier"], ["category", "Category"], ["subtotal", "Subtotal", "currency"], ["hst", "HST", "currency"], ["total", "Total", "currency"], ["paid", "Paid"]);
    report.rows = rows; report.metrics = [{ label: "Subtotal", value: round(rows.reduce((sum, row) => sum + row.subtotal, 0)), format: "currency" }, { label: "HST", value: round(rows.reduce((sum, row) => sum + row.hst, 0)), format: "currency" }, { label: "Total", value: round(rows.reduce((sum, row) => sum + row.total, 0)), format: "currency" }];
    return report;
  }

  if (id === "supplier") {
    const rows = documentRows(expenses, "expense", filters);
    const grouped = new Map<string, { supplier: string; invoices: number; subtotal: number; hst: number; total: number }>();
    rows.forEach((row) => { const current = grouped.get(row.party) || { supplier: row.party, invoices: 0, subtotal: 0, hst: 0, total: 0 }; current.invoices += 1; current.subtotal = round(current.subtotal + row.subtotal); current.hst = round(current.hst + row.hst); current.total = round(current.total + row.total); grouped.set(row.party, current); });
    const report = base(id, "Supplier Report", "Expenses summarized by supplier.", periodLabel(filters));
    report.columns = columns(["supplier", "Supplier"], ["invoices", "Invoices", "number"], ["subtotal", "Subtotal", "currency"], ["hst", "HST", "currency"], ["total", "Total", "currency"]); report.rows = [...grouped.values()];
    report.metrics = [{ label: "Suppliers", value: report.rows.length, format: "number" }, { label: "Total", value: round(rows.reduce((sum, row) => sum + row.total, 0)), format: "currency" }]; return report;
  }

  if (id === "agents" || id === "activeTermCertificates") {
    const rows = agents.filter((agent) => id === "agents" || agent.isActive !== false).map((agent) => ({
      agent: fullName(agent), code: text(agent.agentCode), email: text(agent.email), phone: text(agent.cellPhone), type: text(agent.agentType), active: agent.isActive !== false,
      recoNumber: text(agent.recoNumber || agent.recoLicenseNo), expiry: dateKey(agent.recoLicExpiry || agent.recoLicenseExpiryDate), startDate: dateKey(agent.startDate), terminationDate: dateKey(agent.terminationDate),
    })).filter((row) => !filters.agentId || agents.some((agent) => text(agent._id) === filters.agentId && fullName(agent) === row.agent));
    const report = base(id, id === "agents" ? "Agents — Compliance" : "Active Term Certificates", id === "agents" ? "Agent roster and registration details." : "Active agent term and licence dates.", id === "agents" ? `As of ${filters.asOf}` : periodLabel(filters));
    report.columns = columns(["agent", "Agent"], ["code", "Code"], ["email", "Email"], ["phone", "Phone"], ["type", "Type"], ["active", "Active"], ["recoNumber", "RECO #"], ["expiry", "RECO Expiry", "date"], ["startDate", "Start", "date"], ["terminationDate", "Termination", "date"]); report.rows = rows; report.metrics = [{ label: "Agents", value: rows.length, format: "number" }]; return report;
  }

  if (id === "sellerBuyers") {
    const rows = trades.filter((trade) => inRange(trade.completionDate || trade.firmDate || trade.offerDate, filters.startDate, filters.endDate)).flatMap((trade) => [
      ...(Array.isArray(trade.buyers) ? trade.buyers as LooseRecord[] : []).map((party) => ({ tradeNumber: number(trade.tradeNumber), partyType: "Buyer", name: text(party.name), email: text(party.email), phone: text(party.phone), address: address(party), property: [trade.street, trade.city].map(text).filter(Boolean).join(", ") })),
      ...(Array.isArray(trade.sellers) ? trade.sellers as LooseRecord[] : []).map((party) => ({ tradeNumber: number(trade.tradeNumber), partyType: "Seller", name: text(party.name), email: text(party.email), phone: text(party.phone), address: address(party), property: [trade.street, trade.city].map(text).filter(Boolean).join(", ") })),
    ]);
    const report = base(id, "Seller & Buyers", "Buyer and seller contact details by trade.", periodLabel(filters)); report.columns = columns(["tradeNumber", "Trade #", "number"], ["partyType", "Party"], ["name", "Name"], ["email", "Email"], ["phone", "Phone"], ["address", "Mailing Address"], ["property", "Property"]); report.rows = rows; report.metrics = [{ label: "Contacts", value: rows.length, format: "number" }]; return report;
  }

  if (id === "otherBrokerageAgent") {
    const rows = trades.filter((trade) => inRange(trade.completionDate || trade.firmDate, filters.startDate, filters.endDate)).flatMap((trade) => (Array.isArray(trade.otherBrokerages) ? trade.otherBrokerages as LooseRecord[] : []).map((item) => ({ tradeNumber: number(trade.tradeNumber), date: dateKey(trade.completionDate), property: [trade.street, trade.city].map(text).filter(Boolean).join(", "), brokerage: text(item.brokerageName), agent: text(item.agentName), email: text(item.email), phone: text(item.phone), commission: round(number(item.commission)), hst: round(number(item.tax)), total: round(number(item.totalCommission)) })));
    const report = base(id, "Other Brokerage Agent", "Co-operating brokerage and agent commission details.", periodLabel(filters)); report.columns = columns(["tradeNumber", "Trade #", "number"], ["date", "Closing", "date"], ["property", "Property"], ["brokerage", "Brokerage"], ["agent", "Agent"], ["email", "Email"], ["commission", "Commission", "currency"], ["hst", "HST", "currency"], ["total", "Total", "currency"]); report.rows = rows; report.metrics = [{ label: "Total", value: round(rows.reduce((sum, row) => sum + row.total, 0)), format: "currency" }]; return report;
  }

  if (id === "payrollRemittance") {
    const employeeMap = new Map(employees.map((employee) => [text(employee._id), fullName(employee)]));
    const rows = payroll.filter((row) => inRange(row.payDueDate, filters.startDate, filters.endDate)).map((row) => ({ employee: employeeMap.get(text(row.employeeId)) || "Employee", periodStart: dateKey(row.periodStartDate), periodEnd: dateKey(row.periodEndDate), dueDate: dateKey(row.payDueDate), status: text(row.status), grossPay: round(number(row.salary)) }));
    const report = base(id, "Payroll Remittance", "Generated payroll runs for the selected remittance period.", periodLabel(filters)); report.columns = columns(["employee", "Employee"], ["periodStart", "Period Start", "date"], ["periodEnd", "Period End", "date"], ["dueDate", "Pay Due", "date"], ["status", "Status"], ["grossPay", "Gross Pay", "currency"]); report.rows = rows; report.metrics = [{ label: "Gross Payroll", value: round(rows.reduce((sum, row) => sum + row.grossPay, 0)), format: "currency" }]; report.notes = ["The current payroll model stores gross salary and status only; statutory CPP, EI and tax deductions require payroll deduction fields before a remittance total can be calculated."]; return report;
  }

  if (id === "trustLiability") {
    const rows = trades.map((trade) => {
      const deposits = (Array.isArray(trade.deposits) ? trade.deposits as LooseRecord[] : []).filter((row) => dateKey(row.depositDate) <= filters.asOf).reduce((sum, row) => sum + number(row.depositAmount), 0);
      const transfers = (Array.isArray(trade.depositTransfers) ? trade.depositTransfers as LooseRecord[] : []).filter((row) => dateKey(row.transferDate) <= filters.asOf).reduce((sum, row) => sum + number(row.amount), 0);
      return { tradeNumber: number(trade.tradeNumber), property: [trade.street, trade.city].map(text).filter(Boolean).join(", "), deposits: round(deposits), transfers: round(transfers), liability: round(deposits - transfers) };
    }).filter((row) => !filters.excludeZero || row.liability !== 0);
    const report = base(id, "Trust Liability", "Client deposit liability by trade.", `As of ${filters.asOf}`); report.columns = columns(["tradeNumber", "Trade #", "number"], ["property", "Property"], ["deposits", "Deposits", "currency"], ["transfers", "Transfers", "currency"], ["liability", "Liability", "currency"]); report.rows = rows; report.metrics = [{ label: "Trust Liability", value: round(rows.reduce((sum, row) => sum + row.liability, 0)), format: "currency" }]; return report;
  }

  const incomeRows = documentRows(incomes, "income", filters).map((row) => ({ date: row.date, account: row.category, reference: `Income #${row.invoiceNumber}`, description: row.party, debit: 0, credit: row.subtotal }));
  const expenseRows = documentRows(expenses, "expense", filters).map((row) => ({ date: row.date, account: row.category, reference: `Expense #${row.invoiceNumber}`, description: row.party, debit: row.subtotal, credit: 0 }));
  const rows = [...incomeRows, ...expenseRows].sort((a, b) => a.date.localeCompare(b.date));
  let balance = 0;
  const ledgerRows = rows.map((row) => { balance = round(balance + row.debit - row.credit); return { ...row, balance }; });
  const report = base("ledger", "Ledger", "Income and expense activity with a running balance.", periodLabel(filters)); report.columns = columns(["date", "Date", "date"], ["account", "Account"], ["reference", "Reference"], ["description", "Description"], ["debit", "Debit", "currency"], ["credit", "Credit", "currency"], ["balance", "Balance", "currency"]); report.rows = ledgerRows; report.metrics = [{ label: "Debits", value: round(rows.reduce((sum, row) => sum + row.debit, 0)), format: "currency" }, { label: "Credits", value: round(rows.reduce((sum, row) => sum + row.credit, 0)), format: "currency" }, { label: "Balance", value: balance, format: "currency" }]; return report;
}
