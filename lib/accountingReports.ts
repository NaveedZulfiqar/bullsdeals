import type { DatabaseModels } from "@/lib/mongodb";

type ReportModels = Pick<
  DatabaseModels,
  "Agent" | "Expenditure" | "Income" | "PayrollRun" | "Reconciliation" | "Trade"
>;

interface PaymentRowSource {
  paymentDate?: string;
  description?: string;
  paymentMethod?: string;
}

interface AccountingDocument {
  _id: unknown;
  invoiceDate?: string;
  category?: string;
  customer?: string;
  supplierNickName?: string;
  subtotal?: number;
  hstAmount?: number;
  amount?: number;
  paymentRows?: PaymentRowSource[];
}

interface AgentSource {
  _id: unknown;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  officeNickName?: string;
  tradeName?: string;
  precName?: string;
  sin?: string;
  precBusinessNumber?: string;
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

interface TradeSource {
  _id: unknown;
  tradeNumber?: number;
  agreementStatus?: string;
  tradeStatus?: string;
  tradeType?: string;
  ourRole?: string;
  completionDate?: Date | string;
  commissionAmount?: number;
  agents?: Array<{ agentId?: unknown; agentName?: string }>;
  deposits?: Array<{ depositDate?: Date | string; depositAmount?: number }>;
  depositTransfers?: Array<{ transferDate?: Date | string; amount?: number }>;
  receipts?: Array<{ receiptDate?: Date | string; amount?: number }>;
}

interface ReconciliationSource {
  accountType?: string;
  bankBalance?: number;
  asOn?: string;
}

interface PayrollSource {
  status?: "Generated" | "Paid";
  payDueDate?: string;
  salary?: number;
}

export interface ReportAccountRow {
  account: string;
  amount: number;
}

export interface TrialBalanceRow {
  section: "Asset" | "Liability" | "Equity" | "Income" | "Expense";
  account: string;
  debit: number;
  credit: number;
}

export interface T4ARow {
  agentId: string;
  recipient: string;
  recipientNumber: string;
  address: string;
  box20Commission: number;
  hstExcluded: number;
  payments: number;
}

const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const asDateKey = (value: unknown) => {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
};
const inRange = (value: unknown, startDate: string, endDate: string) => {
  const key = asDateKey(value);
  return Boolean(key && key >= startDate && key <= endDate);
};
const onOrBefore = (value: unknown, endDate: string) => {
  const key = asDateKey(value);
  return Boolean(key && key <= endDate);
};
const normalize = (value: unknown) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const fullName = (agent: AgentSource) =>
  [agent.firstName, agent.middleName, agent.lastName].filter(Boolean).join(" ");
const documentNet = (document: AccountingDocument) =>
  round(Number(document.subtotal ?? Number(document.amount || 0) - Number(document.hstAmount || 0)));
const documentGross = (document: AccountingDocument) => round(Number(document.amount || 0));
const paidDate = (document: AccountingDocument, asOf?: string) => (document.paymentRows || [])
  .map((payment) => asDateKey(payment.paymentDate))
  .filter((date) => date && (!asOf || date <= asOf))
  .sort()[0] || "";
const accountType = (document: AccountingDocument) => {
  const text = [document.category, document.customer, document.supplierNickName, ...(document.paymentRows || []).map((payment) => `${payment.description || ""} ${payment.paymentMethod || ""}`)]
    .join(" ")
    .toLowerCase();
  if (/real estate trust|deposit trust|trust deposit/.test(text)) return "Real Estate Trust Account";
  if (/commission trust|commission/.test(text)) return "Commission Trust Account";
  return "General Account";
};

function groupDocuments(documents: AccountingDocument[], startDate: string, endDate: string) {
  const grouped = new Map<string, number>();
  documents
    .filter((document) => inRange(document.invoiceDate, startDate, endDate))
    .forEach((document) => {
      const category = document.category?.trim() || "Uncategorized";
      grouped.set(category, round((grouped.get(category) || 0) + documentNet(document)));
    });
  return [...grouped.entries()]
    .map(([account, amount]) => ({ account, amount }))
    .sort((left, right) => right.amount - left.amount || left.account.localeCompare(right.account));
}

function sumRows(rows: ReportAccountRow[]) {
  return round(rows.reduce((sum, row) => sum + row.amount, 0));
}

function deriveT4A(
  agents: AgentSource[],
  expenditures: AccountingDocument[],
  startDate: string,
  endDate: string
) {
  const agentAliases = agents.map((agent) => ({
    agent,
    aliases: [fullName(agent), agent.officeNickName, agent.tradeName, agent.precName]
      .map(normalize)
      .filter(Boolean),
  }));
  const totals = new Map<string, T4ARow>();
  const unmatched: Array<{ payee: string; amount: number; date: string }> = [];

  expenditures
    .filter((document) => /commission/i.test(document.category || ""))
    .forEach((document) => {
      const paymentDate = paidDate(document);
      if (!inRange(paymentDate, startDate, endDate)) return;
      const payeeKey = normalize(document.supplierNickName);
      const match = agentAliases.find(({ aliases }) => aliases.some((alias) => alias === payeeKey || (alias.length > 4 && payeeKey.includes(alias))));
      if (!match) {
        unmatched.push({ payee: document.supplierNickName || "Unknown payee", amount: documentNet(document), date: paymentDate });
        return;
      }
      const id = String(match.agent._id);
      const current = totals.get(id) || {
        agentId: id,
        recipient: match.agent.precName || match.agent.tradeName || fullName(match.agent),
        recipientNumber: match.agent.precBusinessNumber || match.agent.sin || "",
        address: [match.agent.street, match.agent.city, match.agent.province, match.agent.postalCode].filter(Boolean).join(", "),
        box20Commission: 0,
        hstExcluded: 0,
        payments: 0,
      };
      current.box20Commission = round(current.box20Commission + documentNet(document));
      current.hstExcluded = round(current.hstExcluded + Number(document.hstAmount || 0));
      current.payments += 1;
      totals.set(id, current);
    });

  const rows = [...totals.values()].sort((left, right) => right.box20Commission - left.box20Commission);
  return {
    rows,
    unmatched,
    totalBox20: round(rows.reduce((sum, row) => sum + row.box20Commission, 0)),
    totalHstExcluded: round(rows.reduce((sum, row) => sum + row.hstExcluded, 0)),
  };
}

function deriveBalanceSheet(
  incomes: AccountingDocument[],
  expenditures: AccountingDocument[],
  trades: TradeSource[],
  reconciliations: ReconciliationSource[],
  payrollRuns: PayrollSource[],
  asOf: string,
  currentEarnings: number
) {
  const incomeToDate = incomes.filter((document) => onOrBefore(document.invoiceDate, asOf));
  const expensesToDate = expenditures.filter((document) => onOrBefore(document.invoiceDate, asOf));
  const receivables = round(incomeToDate.filter((document) => !paidDate(document, asOf)).reduce((sum, document) => sum + documentGross(document), 0));
  const payables = round(expensesToDate.filter((document) => !paidDate(document, asOf)).reduce((sum, document) => sum + documentGross(document), 0));

  const accountNames = ["General Account", "Commission Trust Account", "Real Estate Trust Account"];
  const cashRows = accountNames.map((name) => {
    const reconciled = reconciliations
      .filter((row) => row.accountType === name && onOrBefore(row.asOn, asOf))
      .sort((left, right) => asDateKey(right.asOn).localeCompare(asDateKey(left.asOn)))[0];
    if (reconciled) return { account: name, amount: round(Number(reconciled.bankBalance || 0)) };
    const received = incomeToDate
      .filter((document) => accountType(document) === name && paidDate(document, asOf))
      .reduce((sum, document) => sum + documentGross(document), 0);
    const paid = expensesToDate
      .filter((document) => accountType(document) === name && paidDate(document, asOf))
      .reduce((sum, document) => sum + documentGross(document), 0);
    return { account: name, amount: round(received - paid) };
  });

  const trustBalance = round(trades.reduce((sum, trade) => {
    const deposits = (trade.deposits || []).filter((deposit) => onOrBefore(deposit.depositDate, asOf)).reduce((value, deposit) => value + Number(deposit.depositAmount || 0), 0);
    const transfers = (trade.depositTransfers || []).filter((transfer) => onOrBefore(transfer.transferDate, asOf)).reduce((value, transfer) => value + Number(transfer.amount || 0), 0);
    return sum + deposits - transfers;
  }, 0));
  const realEstateCash = cashRows.find((row) => row.account === "Real Estate Trust Account");
  if (realEstateCash && realEstateCash.amount === 0 && trustBalance > 0) realEstateCash.amount = trustBalance;

  const outputHst = incomeToDate.reduce((sum, document) => sum + Number(document.hstAmount || 0), 0);
  const inputHst = expensesToDate.reduce((sum, document) => sum + Number(document.hstAmount || 0), 0);
  const hstPayable = round(outputHst - inputHst);
  const payrollPayable = round(payrollRuns
    .filter((run) => run.status === "Generated" && onOrBefore(run.payDueDate, asOf))
    .reduce((sum, run) => sum + Number(run.salary || 0), 0));

  const assets: ReportAccountRow[] = [
    ...cashRows.filter((row) => row.amount > 0),
    ...(receivables > 0 ? [{ account: "Accounts Receivable", amount: receivables }] : []),
    ...(hstPayable < 0 ? [{ account: "HST Recoverable", amount: Math.abs(hstPayable) }] : []),
  ];
  const liabilities: ReportAccountRow[] = [
    ...cashRows.filter((row) => row.amount < 0).map((row) => ({ account: `${row.account} Overdraft`, amount: Math.abs(row.amount) })),
    ...(payables > 0 ? [{ account: "Accounts Payable", amount: payables }] : []),
    ...(hstPayable > 0 ? [{ account: "HST Payable", amount: hstPayable }] : []),
    ...(payrollPayable > 0 ? [{ account: "Payroll Payable", amount: payrollPayable }] : []),
    ...(trustBalance > 0 ? [{ account: "Client Trust Funds Payable", amount: trustBalance }] : []),
  ];
  const totalAssets = sumRows(assets);
  const totalLiabilities = sumRows(liabilities);
  const openingEquity = round(totalAssets - totalLiabilities - currentEarnings);
  const equity: ReportAccountRow[] = [
    { account: "Opening / Retained Earnings (derived)", amount: openingEquity },
    { account: "Current Period Earnings", amount: currentEarnings },
  ];
  const totalEquity = sumRows(equity);
  return {
    assets,
    liabilities,
    equity,
    totalAssets,
    totalLiabilities,
    totalEquity,
    totalLiabilitiesAndEquity: round(totalLiabilities + totalEquity),
    difference: round(totalAssets - totalLiabilities - totalEquity),
  };
}

export async function buildAccountingReports(
  models: ReportModels,
  options: { startDate: string; endDate: string; asOf: string; year: number }
) {
  const [incomeDocuments, expenditureDocuments, tradeDocuments, agentDocuments, reconciliationDocuments, payrollDocuments] = await Promise.all([
    models.Income.find({}).lean(),
    models.Expenditure.find({}).lean(),
    models.Trade.find({ isActive: { $ne: false } }).lean(),
    models.Agent.find({}).lean(),
    models.Reconciliation.find({}).lean(),
    models.PayrollRun.find({}).lean(),
  ]);
  const incomes = incomeDocuments as unknown as AccountingDocument[];
  const expenditures = expenditureDocuments as unknown as AccountingDocument[];
  const trades = tradeDocuments as unknown as TradeSource[];
  const agents = agentDocuments as unknown as AgentSource[];
  const reconciliations = reconciliationDocuments as unknown as ReconciliationSource[];
  const payrollRuns = payrollDocuments as unknown as PayrollSource[];

  const incomeRows = groupDocuments(incomes, options.startDate, options.endDate);
  const expenseRows = groupDocuments(expenditures, options.startDate, options.endDate);
  const totalIncome = sumRows(incomeRows);
  const totalExpenses = sumRows(expenseRows);
  const netIncome = round(totalIncome - totalExpenses);
  const yearStart = `${options.asOf.slice(0, 4)}-01-01`;
  const balanceIncomeRows = groupDocuments(incomes, yearStart, options.asOf);
  const balanceExpenseRows = groupDocuments(expenditures, yearStart, options.asOf);
  const currentEarnings = round(sumRows(balanceIncomeRows) - sumRows(balanceExpenseRows));
  const balanceSheet = deriveBalanceSheet(incomes, expenditures, trades, reconciliations, payrollRuns, options.asOf, currentEarnings);

  const trialBalance: TrialBalanceRow[] = [
    ...balanceSheet.assets.map((row) => ({ section: "Asset" as const, account: row.account, debit: row.amount, credit: 0 })),
    ...balanceSheet.liabilities.map((row) => ({ section: "Liability" as const, account: row.account, debit: 0, credit: row.amount })),
    ...balanceSheet.equity
      .filter((row) => row.account !== "Current Period Earnings")
      .map((row) => ({
        section: "Equity" as const,
        account: row.account,
        debit: row.amount < 0 ? Math.abs(row.amount) : 0,
        credit: row.amount > 0 ? row.amount : 0,
      })),
    ...balanceIncomeRows.map((row) => ({ section: "Income" as const, account: row.account, debit: 0, credit: row.amount })),
    ...balanceExpenseRows.map((row) => ({ section: "Expense" as const, account: row.account, debit: row.amount, credit: 0 })),
  ];
  const totalDebits = round(trialBalance.reduce((sum, row) => sum + row.debit, 0));
  const totalCredits = round(trialBalance.reduce((sum, row) => sum + row.credit, 0));
  const t4aStart = `${options.year}-01-01`;
  const t4aEnd = `${options.year}-12-31`;

  return {
    meta: { ...options, basis: "Accrual", currency: "CAD", generatedAt: new Date().toISOString() },
    t4a: deriveT4A(agents, expenditures, t4aStart, t4aEnd),
    profitLoss: { incomeRows, expenseRows, totalIncome, totalExpenses, netIncome },
    balanceSheet,
    trialBalance: { rows: trialBalance, totalDebits, totalCredits, difference: round(totalDebits - totalCredits) },
  };
}

export type AccountingReports = Awaited<ReturnType<typeof buildAccountingReports>>;
