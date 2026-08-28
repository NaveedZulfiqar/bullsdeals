"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, FileBarChart2, Printer, Search, SlidersHorizontal } from "lucide-react";
import type { GeneratedReport, ReportId } from "@/lib/dealCentreReports";

type ReportDefinition = { id: ReportId; name: string; description: string; group: "General Reports" | "Compliance Reports" | "Financial Statements" };
type AgentOption = { _id: string; firstName?: string; lastName?: string; agentCode?: string };

const REPORTS: ReportDefinition[] = [
  { id: "activeTermCertificates", name: "Active Term Certificates", description: "Active agent terms, registration and licence expiry dates.", group: "General Reports" },
  { id: "agentGrossCommission", name: "Agent Gross Commission", description: "Gross commission allocated to each assigned agent.", group: "General Reports" },
  { id: "agentHst", name: "Agent HST Report", description: "HST calculated on agent commissions for the selected period.", group: "General Reports" },
  { id: "agentNetCommission", name: "Agent Net Commission", description: "Agent commission after brokerage and franchise deductions.", group: "General Reports" },
  { id: "brokerageCommissionEarning", name: "Brokerage Commission Earning", description: "Brokerage commission share earned from transactions.", group: "General Reports" },
  { id: "closedTrades", name: "Closed Trades", description: "Completed trade, property and commission details.", group: "General Reports" },
  { id: "comprehensiveCommission", name: "Comprehensive Commission Report", description: "Trade, agent, brokerage and franchise commission detail.", group: "General Reports" },
  { id: "expense", name: "Expense Report", description: "Supplier expense invoices, HST and payment status.", group: "General Reports" },
  { id: "franchisor", name: "Franchisor Report", description: "Calculated franchise fees by agent and transaction.", group: "General Reports" },
  { id: "income", name: "Income Report", description: "Customer income invoices, HST and payment status.", group: "General Reports" },
  { id: "otherBrokerageAgent", name: "Other Brokerage Agent", description: "Co-operating brokerage, agent and commission details.", group: "General Reports" },
  { id: "payrollRemittance", name: "Payroll Remittance", description: "Generated payroll records for a remittance period.", group: "General Reports" },
  { id: "sellerBuyers", name: "Seller & Buyers", description: "Buyer and seller contact information by trade.", group: "General Reports" },
  { id: "supplier", name: "Supplier Report", description: "Expenses summarized by supplier.", group: "General Reports" },
  { id: "trade", name: "Trade Report", description: "All trade status, property, parties and commission records.", group: "General Reports" },
  { id: "agents", name: "Agents", description: "Agent roster and RECO registration details.", group: "Compliance Reports" },
  { id: "complianceClosedTrades", name: "Closed Trades", description: "Closed-trade compliance register for the selected period.", group: "Compliance Reports" },
  { id: "trustLiability", name: "Trust Liability", description: "Client deposit liability by trade as of a selected date.", group: "Compliance Reports" },
  { id: "ledger", name: "Ledger", description: "Income and expense activity with a running balance.", group: "Compliance Reports" },
  { id: "t4a", name: "T4A Commission Summary", description: "Paid self-employed commission for CRA Box 020, excluding HST.", group: "Financial Statements" },
  { id: "profitLoss", name: "Profit and Loss Statement", description: "Income and expenses by account on an accrual basis.", group: "Financial Statements" },
  { id: "balanceSheet", name: "Balance Sheet", description: "Assets, liabilities and derived equity as of a selected date.", group: "Financial Statements" },
  { id: "trialBalance", name: "Trial Balance", description: "Debit and credit balances by account.", group: "Financial Statements" },
];

const today = () => new Date().toISOString().slice(0, 10);
const yearStart = () => `${new Date().getFullYear()}-01-01`;
const money = (value: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(value || 0);
const escapeCsv = (value: unknown) => {
  const output = String(value ?? "");
  return /[",\n]/.test(output) ? `"${output.replace(/"/g, '""')}"` : output;
};
const asOfReports = new Set<ReportId>(["activeTermCertificates", "agents", "trustLiability", "balanceSheet", "trialBalance"]);
const agentReports = new Set<ReportId>(["activeTermCertificates", "agentGrossCommission", "agentHst", "agentNetCommission", "brokerageCommissionEarning", "comprehensiveCommission", "franchisor", "agents"]);
const commissionReports = new Set<ReportId>(["agentGrossCommission", "agentHst", "agentNetCommission", "brokerageCommissionEarning", "comprehensiveCommission", "franchisor"]);

export default function ReportsPage() {
  const [selected, setSelected] = useState<ReportDefinition | null>(null);
  const [query, setQuery] = useState("");
  const [startDate, setStartDate] = useState(yearStart());
  const [endDate, setEndDate] = useState(today());
  const [asOf, setAsOf] = useState(today());
  const [year, setYear] = useState(new Date().getFullYear());
  const [agentId, setAgentId] = useState("");
  const [includeOpenFirmed, setIncludeOpenFirmed] = useState(false);
  const [excludeZero, setExcludeZero] = useState(false);
  const [reportMode, setReportMode] = useState<"summary" | "detailed">("detailed");
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/agents?sortField=firstName&sortOrder=asc", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Could not load agents")))
      .then((result) => setAgents(result.agents || []))
      .catch(() => setAgents([]));
  }, []);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return REPORTS.filter((item) => !normalized || `${item.name} ${item.description} ${item.group}`.toLowerCase().includes(normalized));
  }, [query]);

  const selectReport = (definition: ReportDefinition) => {
    setSelected(definition);
    setReport(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const generate = async () => {
    if (!selected) return;
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ reportId: selected.id, startDate, endDate, asOf, year: String(year), reportMode, includeOpenFirmed: String(includeOpenFirmed), excludeZero: String(excludeZero) });
      if (agentId) params.set("agentId", agentId);
      const response = await fetch(`/api/reports?${params.toString()}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not generate report");
      setReport(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not generate report");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = () => {
    if (!report) return;
    const csv = [report.columns.map((column) => column.label), ...report.rows.map((row) => report.columns.map((column) => row[column.key]))]
      .map((row) => row.map(escapeCsv).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.id}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderValue = (value: unknown, format?: string) => {
    if (value === "" || value === null || value === undefined) return "—";
    if (format === "currency") return money(Number(value));
    if (format === "number") return new Intl.NumberFormat("en-CA").format(Number(value));
    if (format === "percent") return `${Number(value).toFixed(2)}%`;
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  if (!selected) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex-1 bg-[#F7F8FA] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1500px]">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><h1 className="text-2xl font-bold text-[#1B2559] sm:text-3xl">Reports</h1><p className="mt-1 text-sm text-gray-500">Choose a report, apply filters, then export or print the result.</p></div>
            <label className="relative w-full sm:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reports" className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-[#FD7E14]" /></label>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {(["General Reports", "Compliance Reports", "Financial Statements"] as const).map((group) => {
              const groupReports = visible.filter((item) => item.group === group);
              if (!groupReports.length) return null;
              return <section key={group}><div className="border-y border-gray-100 bg-[#FFF5EB] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#A64B00] first:border-t-0">{group}</div><div className="grid grid-cols-[minmax(190px,0.8fr)_minmax(280px,1.6fr)] border-b border-gray-200 bg-gray-50 px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500"><span>Report</span><span>Report Description</span></div>{groupReports.map((item) => <button type="button" key={`${group}:${item.id}`} onClick={() => selectReport(item)} className="grid w-full grid-cols-[minmax(190px,0.8fr)_minmax(280px,1.6fr)] items-center border-b border-gray-100 px-5 py-4 text-left transition last:border-b-0 hover:bg-orange-50/60"><span className="pr-4 text-sm font-semibold text-[#1B2559]">{item.name}</span><span className="text-sm leading-5 text-gray-500">{item.description}</span></button>)}</section>;
            })}
            {!visible.length && <div className="py-16 text-center text-sm text-gray-400">No reports match your search.</div>}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] flex-1 bg-[#F7F8FA] px-4 py-6 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="mx-auto w-full max-w-[1600px]">
        <button type="button" onClick={() => { setSelected(null); setReport(null); }} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#FD7E14] print:hidden"><ArrowLeft className="h-4 w-4" />Back to Reports</button>
        <div className="mb-5 flex items-start justify-between gap-4"><div><h1 className="text-2xl font-bold text-[#1B2559] sm:text-3xl">{selected.name}</h1><p className="mt-1 text-sm text-gray-500">{selected.description}</p></div><FileBarChart2 className="hidden h-9 w-9 text-[#FD7E14] sm:block" /></div>
        <section className="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm print:hidden">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-[#1B2559]"><SlidersHorizontal className="h-4 w-4 text-[#FD7E14]" />Report Filters</div>
          <div className="flex flex-wrap items-end gap-3">
            {selected.id === "t4a" ? <label><span className="mb-1 block text-xs font-semibold text-gray-600">Tax Year</span><input type="number" min="2000" max="2100" value={year} onChange={(event) => setYear(Number(event.target.value))} className="h-10 w-32 rounded-lg border border-gray-200 px-3 text-sm" /></label> : asOfReports.has(selected.id) ? <label><span className="mb-1 block text-xs font-semibold text-gray-600">As of</span><input type="date" value={asOf} onChange={(event) => setAsOf(event.target.value)} className="h-10 rounded-lg border border-gray-200 px-3 text-sm" /></label> : <><label><span className="mb-1 block text-xs font-semibold text-gray-600">From</span><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="h-10 rounded-lg border border-gray-200 px-3 text-sm" /></label><label><span className="mb-1 block text-xs font-semibold text-gray-600">To</span><input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="h-10 rounded-lg border border-gray-200 px-3 text-sm" /></label></>}
            {agentReports.has(selected.id) && <label><span className="mb-1 block text-xs font-semibold text-gray-600">Agent</span><select value={agentId} onChange={(event) => setAgentId(event.target.value)} className="h-10 min-w-56 rounded-lg border border-gray-200 bg-white px-3 text-sm"><option value="">All Agents</option>{agents.map((agent) => <option key={agent._id} value={agent._id}>{[agent.firstName, agent.lastName].filter(Boolean).join(" ")}{agent.agentCode ? ` (${agent.agentCode})` : ""}</option>)}</select></label>}
            {commissionReports.has(selected.id) && <label><span className="mb-1 block text-xs font-semibold text-gray-600">View</span><select value={reportMode} onChange={(event) => setReportMode(event.target.value as "summary" | "detailed")} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"><option value="detailed">Detailed</option><option value="summary">Summary by Agent</option></select></label>}
            {commissionReports.has(selected.id) && <label className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-600"><input type="checkbox" checked={includeOpenFirmed} onChange={(event) => setIncludeOpenFirmed(event.target.checked)} className="accent-[#FD7E14]" />Include Open / Firm</label>}
            {["trustLiability", "comprehensiveCommission", "agentGrossCommission", "agentNetCommission"].includes(selected.id) && <label className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-600"><input type="checkbox" checked={excludeZero} onChange={(event) => setExcludeZero(event.target.checked)} className="accent-[#FD7E14]" />Exclude zero</label>}
            <button type="button" onClick={() => void generate()} disabled={loading} className="h-10 rounded-lg bg-[#FD7E14] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#e86f0c] disabled:opacity-60">{loading ? "Generating…" : "Generate Report"}</button>
          </div>
          {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        </section>
        {!report && !loading && <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center"><FileBarChart2 className="mx-auto mb-3 h-10 w-10 text-gray-300" /><p className="text-sm font-semibold text-gray-500">Select your filters and generate the report.</p></div>}
        {loading && <div className="rounded-xl border border-gray-200 bg-white py-20 text-center text-sm text-gray-400">Calculating report from your brokerage records…</div>}
        {report && !loading && <section className="rounded-xl border border-gray-200 bg-white shadow-sm print:border-0 print:shadow-none">
          <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-start sm:justify-between print:px-0"><div><h2 className="text-xl font-bold text-[#1B2559]">{report.title}</h2><p className="mt-1 text-xs text-gray-500">{report.period} · Generated {new Date(report.generatedAt).toLocaleString("en-CA")}</p></div><div className="flex gap-2 print:hidden"><button type="button" onClick={downloadCsv} className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-xs font-bold text-gray-700"><Download className="h-4 w-4" />CSV</button><button type="button" onClick={() => window.print()} className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-xs font-bold text-gray-700"><Printer className="h-4 w-4" />Print / PDF</button></div></div>
          {report.metrics.length > 0 && <div className="grid gap-3 border-b border-gray-100 p-5 sm:grid-cols-2 lg:grid-cols-4 print:px-0">{report.metrics.map((metric) => <div key={metric.label} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{metric.label}</p><p className="mt-1 text-xl font-bold text-[#1B2559]">{metric.format === "currency" ? money(metric.value) : new Intl.NumberFormat("en-CA").format(metric.value)}</p></div>)}</div>}
          <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-xs"><thead className="bg-[#FFF5EB] text-[10px] font-bold uppercase tracking-wider text-[#9A4A09]"><tr>{report.columns.map((column) => <th key={column.key} className={`whitespace-nowrap px-4 py-3 ${column.format === "currency" || column.format === "number" ? "text-right" : ""}`}>{column.label}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{report.rows.length ? report.rows.map((row, rowIndex) => <tr key={rowIndex} className="hover:bg-gray-50">{report.columns.map((column) => <td key={column.key} className={`max-w-sm px-4 py-3 text-gray-700 ${column.format === "currency" || column.format === "number" ? "text-right tabular-nums" : ""}`}>{renderValue(row[column.key], column.format)}</td>)}</tr>) : <tr><td colSpan={report.columns.length} className="px-4 py-14 text-center text-gray-400">No records match the selected filters.</td></tr>}</tbody></table></div>
          {report.notes.length > 0 && <div className="space-y-1 border-t border-gray-100 bg-amber-50 px-5 py-4 text-xs leading-5 text-amber-800 print:px-0">{report.notes.map((note) => <p key={note}>{note}</p>)}</div>}
        </section>}
      </div>
    </main>
  );
}
