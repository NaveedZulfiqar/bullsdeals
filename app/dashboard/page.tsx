"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowUpRight, BarChart3, Calendar, FileText, Gift, Handshake, RefreshCw, TrendingUp, Users, Wallet } from "lucide-react";

interface BreakdownRow { label: string; amount: number; }
interface PerformerRow { agentId: string; name: string; commission: number; deals: number; }
interface DashboardStats {
  activeAgentsCount: number;
  birthdays: Array<{ _id: string; firstName: string; lastName: string; nextBirthday: string }>;
  recoExpiriesCount: number;
  recoExpiries: Array<{ _id: string; firstName: string; lastName: string; recoLicExpiry: string }>;
  tradesOpenCount: number;
  tradesClosingThisMonthCount: number;
  tradesClosingTodayCount: number;
  tradesClosedCountYTD: number;
  grossCommissionYTD: number;
  pendingReceiptsCount: number;
  pendingReceiptsAmount: number;
  lastReconciliation: { accountType: string; asOn: string; bankBalance: number } | null;
  payrollDue: Array<{ employeeId: string; name: string; amount: number; dueDate: string }>;
  payrollDueTotal: number;
  netIncomeYTD: number;
  monthlyTrend: Array<{ month: string; amount: number }>;
  byTradeType: BreakdownRow[];
  byOurRole: BreakdownRow[];
  topPerformers: PerformerRow[];
  monthlyPerformers: PerformerRow[];
}

const money = (value: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value || 0);
const shortMoney = (value: number) => value >= 1_000_000 ? `$${(value / 1_000_000).toFixed(1)}m` : value >= 1_000 ? `$${(value / 1_000).toFixed(1)}k` : `$${Math.round(value)}`;
const displayDate = (value: string) => value ? new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" }) : "-";

function EmptyChart() {
  return <div className="flex h-full min-h-32 items-center justify-center text-xs text-gray-400">No recorded activity yet</div>;
}

function MonthlyChart({ rows }: { rows: Array<{ month: string; amount: number }> }) {
  const max = Math.max(...rows.map((row) => row.amount), 0);
  if (max === 0) return <EmptyChart />;
  const width = 720;
  const height = 260;
  const left = 54;
  const right = 16;
  const top = 18;
  const bottom = 38;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const slotWidth = plotWidth / Math.max(1, rows.length);
  const barWidth = Math.min(34, slotWidth * 0.58);
  const grid = Array.from({ length: 5 }, (_, index) => ({
    y: top + index * plotHeight / 4,
    value: max * (1 - index / 4),
  }));

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-64 min-w-[640px] w-full" role="img" aria-label="Commission received during the last twelve months">
        {grid.map((line) => <g key={line.y}><line x1={left} x2={width - right} y1={line.y} y2={line.y} stroke="#E5E7EB" strokeDasharray="4 5" /><text x={left - 8} y={line.y + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">{shortMoney(line.value)}</text></g>)}
        {rows.map((row, index) => {
          const barHeight = row.amount / max * plotHeight;
          const x = left + index * slotWidth + (slotWidth - barWidth) / 2;
          const y = top + plotHeight - barHeight;
          return <g key={row.month}><rect x={x} y={y} width={barWidth} height={Math.max(1, barHeight)} rx="5" fill="#5B67F1"><title>{`${row.month}: ${money(row.amount)}`}</title></rect><text x={x + barWidth / 2} y={height - 12} textAnchor="middle" fontSize="10" fill="#6B7280">{new Date(`${row.month}-01T00:00:00`).toLocaleDateString("en-CA", { month: "short" })}</text></g>;
        })}
      </svg>
    </div>
  );
}

const chartColors = ["#5B67F1", "#FD7E14", "#10B981", "#0EA5E9", "#D946EF", "#F59E0B"];

function BreakdownChart({ rows, label }: { rows: BreakdownRow[]; label: string }) {
  const visibleRows = rows.filter((row) => row.amount > 0).slice(0, 6);
  const total = visibleRows.reduce((sum, row) => sum + row.amount, 0);
  if (!visibleRows.length || total === 0) return <EmptyChart />;
  const percentages = visibleRows.map((row) => row.amount / total * 100);
  const segments = percentages.map((percentage, index) => {
    const start = percentages.slice(0, index).reduce((sum, value) => sum + value, 0);
    return `${chartColors[index % chartColors.length]} ${start}% ${start + percentage}%`;
  });
  return (
    <div className="grid items-center gap-5 sm:grid-cols-[150px_minmax(0,1fr)]">
      <div className="relative mx-auto h-36 w-36 rounded-full" role="img" aria-label={`${label}: ${money(total)} total`} style={{ background: `conic-gradient(${segments.join(", ")})` }}>
        <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner"><span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total</span><span className="mt-1 text-sm font-bold text-[#1B2559]">{shortMoney(total)}</span></div>
      </div>
      <div className="space-y-2.5">{visibleRows.map((row, index) => <div key={row.label} className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-2 text-[11px]"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} /><span className="truncate font-medium text-gray-700">{row.label}</span><span className="text-right font-semibold text-gray-500">{Math.round(row.amount / total * 100)}% · {shortMoney(row.amount)}</span></div>)}</div>
    </div>
  );
}

function Performers({ rows, metric }: { rows: PerformerRow[]; metric: "commission" | "deals" }) {
  const max = Math.max(...rows.map((row) => row[metric]), 0);
  if (!rows.length || max === 0) return <EmptyChart />;
  return <div className="space-y-3">{rows.slice(0, 7).map((row, index) => <div key={row.agentId} className="grid grid-cols-[24px_minmax(0,1fr)_90px] items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-50 text-[10px] font-bold text-[#FD7E14]">{index + 1}</span><div className="min-w-0"><div className="mb-1 truncate text-xs font-medium text-gray-700">{row.name}</div><div className="h-1.5 rounded-full bg-gray-100"><div className="h-1.5 rounded-full bg-[#5B67F1]" style={{ width: `${Math.max(3, row[metric] / max * 100)}%` }} /></div></div><span className="text-right text-[11px] font-semibold text-[#1B2559]">{metric === "commission" ? money(row.commission) : `${row.deals} deal${row.deals === 1 ? "" : "s"}`}</span></div>)}</div>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [metric, setMetric] = useState<"commission" | "deals">("commission");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/dashboard/stats", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load dashboard");
      setStats(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => void loadStats(), 0);
    const refreshTimer = window.setInterval(() => void loadStats(), 60_000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(refreshTimer);
    };
  }, [loadStats]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const formattedDate = new Intl.DateTimeFormat("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(new Date());
  const cards = [
    { label: "Gross Commission Received (YTD)", value: money(stats?.grossCommissionYTD || 0), color: "#5b67f1", icon: RefreshCw },
    { label: "Pending Receipts", value: `${stats?.pendingReceiptsCount || 0} · ${money(stats?.pendingReceiptsAmount || 0)}`, color: "#0dcaf0", icon: FileText },
    { label: "Last Reconciliation Done", value: stats?.lastReconciliation ? displayDate(stats.lastReconciliation.asOn) : "Not completed", color: "#d63384", icon: Handshake },
    { label: "Number of Active Agents", value: String(stats?.activeAgentsCount || 0), color: "#dc3545", icon: Users },
    { label: "Trades Open", value: String(stats?.tradesOpenCount || 0), color: "#3f51b5", icon: ArrowUpRight },
    { label: "Trades Closing This Month", value: String(stats?.tradesClosingThisMonthCount || 0), color: "#28a745", icon: Calendar },
    { label: "Trades Closing Today", value: String(stats?.tradesClosingTodayCount || 0), color: "#ffc107", icon: TrendingUp },
    { label: "Trades Closed (YTD)", value: String(stats?.tradesClosedCountYTD || 0), color: "#fd7e14", icon: BarChart3 },
  ];

  return (
    <main className="w-full flex-1 space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-2 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight text-[#2C2C2C] sm:text-3xl">{greeting}</h1><p className="mt-1 text-sm font-medium text-gray-400">{formattedDate}</p></div><button type="button" onClick={() => void loadStats()} disabled={loading} className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-[#FD7E14] hover:text-[#FD7E14] disabled:opacity-50 sm:self-auto"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />{loading ? "Refreshing" : "Refresh dashboard"}</button></div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">{cards.map((card) => { const Icon = card.icon; return <div key={card.label} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md" style={{ borderLeft: `4px solid ${card.color}` }}><div className="min-w-0 pr-2"><span className="block text-[10px] font-semibold uppercase leading-tight tracking-wider text-gray-400 sm:text-xs">{card.label}</span><span className="mt-1 block truncate text-lg font-bold text-[#2C2C2C] sm:text-xl">{card.value}</span></div><div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: card.color }}><Icon className="h-5 w-5" /></div></div>; })}</div>

      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4"><BarChart3 className="h-5 w-5 text-[#FD7E14]" /><div><h2 className="text-sm font-bold">Commission Received</h2><p className="text-[11px] text-gray-400">Last 12 months from receipts, with closed-trade import fallback</p></div></div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(300px,0.8fr)_minmax(300px,0.8fr)]">
          <div className="min-w-0"><h3 className="mb-2 text-xs font-bold text-gray-600">Monthly Commission</h3><MonthlyChart rows={stats?.monthlyTrend || []} /></div>
          <div className="border-t border-gray-100 pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0"><h3 className="mb-5 text-xs font-bold text-gray-600">By Trade Type (YTD)</h3><BreakdownChart rows={stats?.byTradeType || []} label="Commission by trade type" /></div>
          <div className="border-t border-gray-100 pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0"><h3 className="mb-5 text-xs font-bold text-gray-600">By Our Role (YTD)</h3><BreakdownChart rows={stats?.byOurRole || []} label="Commission by brokerage role" /></div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><Gift className="h-4 w-4 text-green-600" /><h2 className="text-sm font-bold">Birthdays in Next 15 Days</h2></div><div className="space-y-2">{stats?.birthdays.length ? stats.birthdays.map((agent) => <button key={agent._id} type="button" onClick={() => router.push(`/dashboard/agents/${agent._id}/edit`)} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs hover:bg-green-50"><span className="font-medium">{agent.firstName} {agent.lastName}</span><span className="text-gray-500">{displayDate(agent.nextBirthday)}</span></button>) : <p className="py-6 text-center text-xs text-gray-400">No upcoming birthdays</p>}</div></section>
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-[#FD7E14]" /><h2 className="text-sm font-bold">RECO Licences Expiring</h2></div><div className="space-y-2">{stats?.recoExpiries.length ? stats.recoExpiries.map((agent) => <button key={agent._id} type="button" onClick={() => router.push(`/dashboard/agents/${agent._id}/edit`)} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs hover:bg-orange-50"><span className="font-medium">{agent.firstName} {agent.lastName}</span><span className="text-red-500">{displayDate(agent.recoLicExpiry)}</span></button>) : <p className="py-6 text-center text-xs text-gray-400">No expiries in the next 30 days</p>}</div></section>
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><Wallet className="h-4 w-4 text-indigo-600" /><div><h2 className="text-sm font-bold">Employee Payroll Due</h2><p className="text-[11px] text-gray-400">{money(stats?.payrollDueTotal || 0)}</p></div></div><div className="space-y-2">{stats?.payrollDue.length ? stats.payrollDue.slice(0, 6).map((row) => <div key={`${row.employeeId}:${row.dueDate}`} className="flex items-center justify-between rounded-lg px-2 py-2 text-xs hover:bg-indigo-50"><span className="font-medium">{row.name}</span><span className="text-right"><span className="block font-semibold">{money(row.amount)}</span><span className="text-[10px] text-gray-400">{displayDate(row.dueDate)}</span></span></div>) : <p className="py-6 text-center text-xs text-gray-400">No generated payroll awaiting payment</p>}</div></section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2"><section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold">Top Performers (YTD)</h2><select value={metric} onChange={(event) => setMetric(event.target.value as "commission" | "deals")} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs"><option value="commission">Commission</option><option value="deals">Deals Closed</option></select></div><Performers rows={stats?.topPerformers || []} metric={metric} /></section><section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"><h2 className="mb-4 text-sm font-bold">Monthly Performers</h2><Performers rows={stats?.monthlyPerformers || []} metric={metric} /></section></div>
    </main>
  );
}
