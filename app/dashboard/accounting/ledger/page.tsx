"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Pencil, Search, X } from "lucide-react";

const ACCOUNTS = [
  "General Account",
  "Commission Trust Account",
  "Real Estate Trust Account",
] as const;

type AccountType = (typeof ACCOUNTS)[number];
type AccountValue = AccountType | "";
type LedgerTab = "trade" | "journal";

interface LedgerEntry {
  id: string;
  accountType: AccountType;
  date: string;
  tradeNumber: string | number;
  address: string;
  description: string;
  method: string;
  deposit: number;
  withdrawal: number;
  reconciledDate: string;
  status: "Deposited" | "Withdrawn" | "Pending";
}

interface DateFilters {
  accountType: AccountValue;
  startDate: string;
  endDate: string;
}

interface ColumnFilters {
  tradeNumber: string;
  address: string;
  description: string;
  method: string;
}

const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initialDates = (tab: LedgerTab): DateFilters => {
  const current = new Date();
  const start = tab === "trade"
    ? new Date(current.getFullYear(), 0, 1)
    : new Date(current.getFullYear(), current.getMonth(), 1);
  return {
    accountType: "General Account",
    startDate: dateKey(start),
    endDate: dateKey(current),
  };
};

const EMPTY_COLUMNS: ColumnFilters = {
  tradeNumber: "",
  address: "",
  description: "",
  method: "",
};

const formatDate = (value: string) => {
  if (!value) return "-";
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const formatLongDate = (value: string) => {
  if (!value) return "-";
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(value || 0);

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function AccountSelector({
  value,
  onChange,
}: {
  value: AccountValue;
  onChange: (value: AccountValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const choices = ACCOUNTS.filter((account) =>
    account.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Account type"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className="flex h-10 w-full items-center rounded-lg border border-gray-200 bg-white px-3 pr-16 text-left text-sm outline-none transition focus:border-[#FD7E14] focus:ring-2 focus:ring-orange-100"
      >
        <span className={`min-w-0 flex-1 truncate ${value ? "text-[#2C2C2C]" : "text-gray-400"}`}>
          {value || "Select Bank Account"}
        </span>
      </button>
      {value && (
        <button
          type="button"
          aria-label="Clear account"
          onClick={() => onChange("")}
          className="absolute right-8 top-2.5 text-gray-400 transition hover:text-[#FD7E14]"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <ChevronDown className={`pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400 transition ${open ? "rotate-180" : ""}`} />

      {open && (
        <div className="absolute inset-x-0 top-[calc(100%+4px)] z-40 rounded-lg border border-gray-200 bg-white p-1 shadow-xl">
          <div className="relative m-2">
            <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              autoFocus
              aria-label="Search accounts"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-9 w-full rounded-md border border-gray-200 px-3 pr-9 text-sm outline-none focus:border-[#FD7E14] focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {choices.map((account) => (
              <button
                key={account}
                type="button"
                onClick={() => {
                  onChange(account);
                  setQuery("");
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition ${
                  value === account
                    ? "bg-orange-50 font-semibold text-[#FD7E14]"
                    : "text-[#344054] hover:bg-gray-50"
                }`}
              >
                {account}
                {value === account && <Check className="h-4 w-4" />}
              </button>
            ))}
            {choices.length === 0 && (
              <p className="px-3 py-4 text-center text-xs text-gray-400">No account found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LedgerPage() {
  const [activeTab, setActiveTab] = useState<LedgerTab>("trade");
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftFilters, setDraftFilters] = useState<DateFilters>(() => initialDates("trade"));
  const [appliedFilters, setAppliedFilters] = useState<DateFilters>(() => initialDates("trade"));
  const [columns, setColumns] = useState<ColumnFilters>(EMPTY_COLUMNS);
  const [error, setError] = useState("");

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ledger");
      if (!response.ok) throw new Error("Unable to load ledger");
      const data = await response.json();
      setEntries(data.entries || []);
      setError("");
    } catch {
      setError("Could not load ledger transactions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadEntries, 0);
    return () => window.clearTimeout(timer);
  }, [loadEntries]);

  const changeTab = (tab: LedgerTab) => {
    const next = initialDates(tab);
    next.accountType = draftFilters.accountType;
    setActiveTab(tab);
    setDraftFilters(next);
    setAppliedFilters(next);
    setColumns(EMPTY_COLUMNS);
    setError("");
  };

  const accountEntries = useMemo(
    () => entries.filter((entry) => entry.accountType === appliedFilters.accountType),
    [appliedFilters.accountType, entries]
  );

  const openingBalance = useMemo(
    () => accountEntries
      .filter((entry) => entry.date < appliedFilters.startDate)
      .reduce((sum, entry) => sum + entry.deposit - entry.withdrawal, 0),
    [accountEntries, appliedFilters.startDate]
  );

  const periodEntries = useMemo(
    () => accountEntries.filter(
      (entry) => entry.date >= appliedFilters.startDate && entry.date <= appliedFilters.endDate
    ),
    [accountEntries, appliedFilters.endDate, appliedFilters.startDate]
  );

  const rowsWithBalance = useMemo(
    () => periodEntries.reduce<Array<LedgerEntry & { balance: number }>>((rows, entry) => {
      const prior = rows.at(-1)?.balance ?? openingBalance;
      return [...rows, { ...entry, balance: prior + entry.deposit - entry.withdrawal }];
    }, []),
    [openingBalance, periodEntries]
  );

  const displayedRows = useMemo(() => {
    const lower = (value: string) => value.trim().toLowerCase();
    return rowsWithBalance.filter((entry) =>
      (!columns.tradeNumber || String(entry.tradeNumber).toLowerCase().includes(lower(columns.tradeNumber))) &&
      (!columns.address || entry.address.toLowerCase().includes(lower(columns.address))) &&
      (!columns.description || entry.description.toLowerCase().includes(lower(columns.description))) &&
      (!columns.method || entry.method.toLowerCase().includes(lower(columns.method)))
    );
  }, [columns, rowsWithBalance]);

  const totals = useMemo(
    () => periodEntries.reduce(
      (result, entry) => ({
        deposits: result.deposits + entry.deposit,
        withdrawals: result.withdrawals + entry.withdrawal,
      }),
      { deposits: 0, withdrawals: 0 }
    ),
    [periodEntries]
  );

  const closingBalance = openingBalance + totals.deposits - totals.withdrawals;

  const submitFilters = () => {
    if (!draftFilters.accountType) {
      setError("Account type is required.");
      return;
    }
    if (!draftFilters.startDate || !draftFilters.endDate) {
      setError("Start date and end date are required.");
      return;
    }
    if (draftFilters.startDate > draftFilters.endDate) {
      setError("Start date cannot be after end date.");
      return;
    }
    setAppliedFilters(draftFilters);
    setError("");
  };

  const reportRows = displayedRows.map((entry) => [
    formatDate(entry.date),
    entry.tradeNumber || "-",
    entry.address || "-",
    entry.description,
    entry.method,
    formatMoney(entry.deposit),
    formatMoney(entry.withdrawal),
    formatMoney(entry.balance),
    formatDate(entry.reconciledDate),
    entry.status,
  ]);

  const reportHtml = () => {
    const headers = ["Dated", "Trade No.", "Address", "Description", "Method", "Deposit", "Withdrawal", "Balance", "Withdrawal/Deposit Date", "Status"];
    return `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;color:#1B2559}h1{font-size:22px}p{font-size:12px}table{border-collapse:collapse;width:100%;font-size:10px}th,td{border:1px solid #ddd;padding:6px;text-align:left}th{background:#fff3e8;color:#9a4a09}</style></head><body><h1>Ledger / Journal — ${escapeHtml(activeTab === "trade" ? "Trade Ledger" : "Journal")}</h1><p>${escapeHtml(appliedFilters.accountType)} | ${escapeHtml(formatDate(appliedFilters.startDate))} – ${escapeHtml(formatDate(appliedFilters.endDate))}</p><table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${reportRows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
  };

  const download = (content: string, mimeType: string, extension: string) => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${activeTab === "trade" ? "trade-ledger" : "journal"}-${appliedFilters.endDate}.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const setAccount = (accountType: AccountValue) => {
    const next = { ...draftFilters, accountType };
    setDraftFilters(next);
    setAppliedFilters((previous) => ({ ...previous, accountType }));
  };

  const tableInput = "h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-xs outline-none transition focus:border-[#FD7E14] focus:ring-2 focus:ring-orange-100";

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1900px] flex-1 flex-col">
        <header className="mb-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#FD7E14]">Accounting</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#1B2559] sm:text-3xl">Ledger/Journal</h1>
        </header>

        <section className="flex flex-1 flex-col overflow-visible rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 pt-1 sm:px-7">
            <div className="flex gap-1" role="tablist" aria-label="Ledger sections">
              {([
                ["trade", "Trade Ledger"],
                ["journal", "Journal"],
              ] as const).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => changeTab(tab)}
                  className={`relative px-4 py-4 text-sm font-semibold transition-colors ${
                    activeTab === tab
                      ? "text-[#1B2559] after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-[#FD7E14]"
                      : "text-gray-400 hover:text-[#1B2559]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-5 py-5 sm:px-7">
            <div className="grid gap-4 xl:grid-cols-[minmax(300px,1.8fr)_240px_240px_auto_auto] xl:items-end">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-600">Account type <span className="text-red-500">*</span></span>
                <AccountSelector value={draftFilters.accountType} onChange={setAccount} />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-600">Start Date <span className="text-red-500">*</span></span>
                <input
                  aria-label="Start Date"
                  type="date"
                  value={draftFilters.startDate}
                  onChange={(event) => setDraftFilters((previous) => ({ ...previous, startDate: event.target.value }))}
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-[#FD7E14] focus:ring-2 focus:ring-orange-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-600">End Date <span className="text-red-500">*</span></span>
                <input
                  aria-label="End Date"
                  type="date"
                  value={draftFilters.endDate}
                  onChange={(event) => setDraftFilters((previous) => ({ ...previous, endDate: event.target.value }))}
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-[#FD7E14] focus:ring-2 focus:ring-orange-100"
                />
              </label>

              <button
                type="button"
                onClick={submitFilters}
                className="h-10 rounded-lg bg-[#1B2559] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#111940]"
              >
                Submit
              </button>

              <div className="flex h-10 items-center gap-2 print:hidden" aria-label="Export ledger">
                <button type="button" title="Export PDF" aria-label="Export PDF" onClick={() => window.print()} className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-xs font-black text-red-600 transition hover:bg-red-100">PDF</button>
                <button type="button" title="Export Word" aria-label="Export Word" onClick={() => download(reportHtml(), "application/msword", "doc")} className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm font-black text-blue-700 transition hover:bg-blue-100">W</button>
                <button type="button" title="Export Excel" aria-label="Export Excel" onClick={() => download(reportHtml(), "application/vnd.ms-excel", "xls")} className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-sm font-black text-green-700 transition hover:bg-green-100">X</button>
              </div>
            </div>

            {error && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            {activeTab === "trade" && accountEntries.length > 0 && !error && (
              <p className="mt-4 text-center text-sm font-bold text-[#344054]">
                Closing Balance as of {formatLongDate(appliedFilters.endDate)}: {formatMoney(closingBalance)}
              </p>
            )}
          </div>

          <div className="mx-5 mb-7 overflow-hidden rounded-xl border border-gray-200 shadow-sm sm:mx-7">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1320px] table-fixed text-left text-xs text-[#344054]">
                <colgroup>
                  <col className="w-[100px]" /><col className="w-[85px]" /><col className="w-[190px]" />
                  <col className="w-[330px]" /><col className="w-[210px]" /><col className="w-[115px]" />
                  <col className="w-[115px]" /><col className="w-[115px]" /><col className="w-[145px]" /><col className="w-[110px]" />
                </colgroup>
                <thead className="border-b border-orange-200 bg-orange-50/80 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9A4A09]">
                  <tr>
                    <th className="px-2 py-3">Dated</th><th className="px-2 py-3">Trade No.</th><th className="px-2 py-3">Address</th>
                    <th className="px-2 py-3">Description</th><th className="px-2 py-3">Method</th><th className="px-2 py-3 text-right">Deposit</th>
                    <th className="px-2 py-3 text-right">Withdrawal</th><th className="px-2 py-3 text-right">Balance</th>
                    <th className="px-2 py-3">Withdrawal/Deposit Date</th><th className="px-2 py-3">Status</th>
                  </tr>
                  <tr className="border-t border-orange-200 bg-orange-50/60 normal-case tracking-normal">
                    <th className="px-2 py-2" />
                    <th className="px-2 py-2"><input aria-label="Filter trade number" value={columns.tradeNumber} onChange={(event) => setColumns((previous) => ({ ...previous, tradeNumber: event.target.value }))} className={tableInput} /></th>
                    <th className="px-2 py-2"><input aria-label="Filter address" value={columns.address} onChange={(event) => setColumns((previous) => ({ ...previous, address: event.target.value }))} className={tableInput} /></th>
                    <th className="px-2 py-2"><input aria-label="Filter description" value={columns.description} onChange={(event) => setColumns((previous) => ({ ...previous, description: event.target.value }))} className={tableInput} /></th>
                    <th className="px-2 py-2"><input aria-label="Filter method" value={columns.method} onChange={(event) => setColumns((previous) => ({ ...previous, method: event.target.value }))} className={tableInput} /></th>
                    <th colSpan={5} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading ? (
                    <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400">Loading ledger...</td></tr>
                  ) : displayedRows.map((entry) => (
                    <tr key={entry.id} className="transition-colors hover:bg-orange-50/30">
                      <td className="whitespace-nowrap px-2 py-3">{formatDate(entry.date)}</td>
                      <td className="px-2 py-3">{entry.tradeNumber || "-"}</td>
                      <td className="truncate px-2 py-3" title={entry.address}>{entry.address || "-"}</td>
                      <td className="truncate px-2 py-3" title={entry.description}>{entry.description}</td>
                      <td className="truncate px-2 py-3" title={entry.method}>{entry.method}</td>
                      <td className="whitespace-nowrap px-2 py-3 text-right">{entry.deposit ? formatMoney(entry.deposit) : "-"}</td>
                      <td className="whitespace-nowrap px-2 py-3 text-right">{entry.withdrawal ? formatMoney(entry.withdrawal) : "-"}</td>
                      <td className="whitespace-nowrap px-2 py-3 text-right font-semibold">{formatMoney(entry.balance)}</td>
                      <td className="whitespace-nowrap px-2 py-3">{formatDate(entry.reconciledDate)} {entry.reconciledDate && <Pencil className="ml-1 inline h-3.5 w-3.5" />}</td>
                      <td className="px-2 py-2"><span className={`inline-flex rounded-md px-3 py-1.5 font-semibold text-white ${entry.status === "Pending" ? "bg-amber-500" : "bg-green-600"}`}>{entry.status}</span></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-gray-200 bg-gray-50/80 font-semibold text-[#1B2559]">
                  <tr>
                    <td className="px-2 py-3">Total</td>
                    <td colSpan={2} />
                    <td className="px-2 py-3">{activeTab === "journal" ? `Opening balance as on ${formatLongDate(appliedFilters.startDate)}` : ""}</td>
                    <td className="whitespace-nowrap px-2 py-3">{activeTab === "journal" ? formatMoney(openingBalance) : ""}</td>
                    <td className="whitespace-nowrap px-2 py-3 text-right">{formatMoney(totals.deposits)}</td>
                    <td className="whitespace-nowrap px-2 py-3 text-right">{formatMoney(totals.withdrawals)}</td>
                    <td className="whitespace-nowrap px-2 py-3 text-right">{activeTab === "journal" ? formatMoney(closingBalance) : ""}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        @media print {
          nav, [role="tablist"], button, input, .print\\:hidden { display: none !important; }
          main { padding: 0 !important; }
          section { border: 0 !important; box-shadow: none !important; }
        }
      `}</style>
    </main>
  );
}
