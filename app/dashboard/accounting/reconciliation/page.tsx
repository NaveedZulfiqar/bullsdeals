"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Pencil } from "lucide-react";

const ACCOUNTS = [
  "General Account",
  "Commission Trust Account",
  "Real Estate Trust Account",
] as const;

type AccountType = (typeof ACCOUNTS)[number];
type Tab = "reconcile" | "history";

interface Entry {
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
  status: "Cleared" | "Pending";
}

interface HistoryItem {
  _id: string;
  accountType: AccountType;
  bankBalance: number;
  asOn: string;
  rows: Array<{
    entryId: string;
    reconciledDate: string;
    status: "Cleared" | "Pending";
  }>;
  createdAt: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const formatDate = (value: string) => {
  if (!value) return "-";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(value || 0);

export default function ReconciliationPage() {
  const [activeTab, setActiveTab] = useState<Tab>("reconcile");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [accountType, setAccountType] = useState<AccountType | "">("");
  const [historyAccount, setHistoryAccount] = useState<AccountType>("General Account");
  const [bankBalance, setBankBalance] = useState("0.00");
  const [asOn, setAsOn] = useState(today());
  const [reconciledDates, setReconciledDates] = useState<Record<string, string>>({});
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ message: string; ok: boolean } | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/reconciliation");
      if (!response.ok) throw new Error("Unable to load reconciliation data");
      const data = await response.json();
      const nextEntries: Entry[] = data.entries || [];
      setEntries(nextEntries);
      setHistory(data.history || []);
      setReconciledDates(
        Object.fromEntries(nextEntries.map((entry) => [entry.id, entry.reconciledDate || ""]))
      );
    } catch {
      setNotice({ message: "Could not load reconciliation data.", ok: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadData, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const visibleEntries = useMemo(() => {
    if (!accountType) return [];
    return entries.filter(
      (entry) => entry.accountType === accountType && (!asOn || entry.date <= asOn)
    );
  }, [accountType, asOn, entries]);

  const rowsWithBalance = useMemo(() => {
    return visibleEntries.reduce<Array<Entry & { balance: number }>>((rows, entry) => {
      const previousBalance = rows.at(-1)?.balance || 0;
      return [
        ...rows,
        { ...entry, balance: previousBalance + entry.deposit - entry.withdrawal },
      ];
    }, []);
  }, [visibleEntries]);

  const totals = useMemo(
    () =>
      rowsWithBalance.reduce(
        (result, entry) => ({
          deposits: result.deposits + entry.deposit,
          withdrawals: result.withdrawals + entry.withdrawal,
          balance: entry.balance,
        }),
        { deposits: 0, withdrawals: 0, balance: 0 }
      ),
    [rowsWithBalance]
  );

  const accountHistory = useMemo(
    () => history.filter((item) => item.accountType === historyAccount),
    [history, historyAccount]
  );

  const saveReconciliation = async () => {
    if (!accountType) {
      setNotice({ message: "Please select an account type.", ok: false });
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/reconciliation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountType,
          bankBalance: Number(bankBalance || 0),
          asOn,
          rows: visibleEntries.map((entry) => ({
            entryId: entry.id,
            reconciledDate: reconciledDates[entry.id] || "",
            status: reconciledDates[entry.id] ? "Cleared" : "Pending",
          })),
        }),
      });

      if (!response.ok) throw new Error("Save failed");
      setNotice({ message: "Reconciliation saved successfully.", ok: true });
      await loadData();
    } catch {
      setNotice({ message: "Could not save the reconciliation.", ok: false });
    } finally {
      setSaving(false);
    }
  };

  const selectClass =
    "h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-9 text-sm text-[#2C2C2C] outline-none transition focus:border-[#FD7E14] focus:ring-2 focus:ring-orange-100";

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1900px] flex-1 flex-col">
        <header className="mb-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#FD7E14]">
            Accounting
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#1B2559] sm:text-3xl">
            Reconciliation
          </h1>
        </header>

        <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 pt-1 sm:px-7">
            <div className="flex gap-1" role="tablist" aria-label="Reconciliation sections">
              {([
                ["reconcile", "Reconcile"],
                ["history", "Reconcile History"],
              ] as const).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setNotice(null);
                  }}
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

          {activeTab === "reconcile" ? (
            <div className="flex flex-1 flex-col">
              <div className="px-5 py-5 sm:px-7">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
                  <label className="block w-full xl:w-[290px]">
                    <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                      Account type <span className="text-red-500">*</span>
                    </span>
                    <span className="relative block">
                      <select
                        aria-label="Account type"
                        value={accountType}
                        onChange={(event) => setAccountType(event.target.value as AccountType | "")}
                        className={selectClass}
                      >
                        <option value="">Select Bank Account</option>
                        {ACCOUNTS.map((account) => (
                          <option key={account} value={account}>{account}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </span>
                  </label>

                  <label className="block w-full xl:flex xl:w-auto xl:items-center xl:gap-2">
                    <span className="mb-1.5 block text-xs font-semibold text-gray-600 xl:mb-0 xl:whitespace-nowrap">Bank Balance</span>
                    <div className="relative xl:w-[210px]">
                      <span className="absolute left-3 top-2.5 text-sm text-gray-400">$</span>
                      <input
                        aria-label="Bank Balance"
                        inputMode="decimal"
                        value={bankBalance}
                        onChange={(event) => setBankBalance(event.target.value.replace(/[^0-9.-]/g, ""))}
                        onBlur={() => setBankBalance(Number(bankBalance || 0).toFixed(2))}
                        className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-7 pr-3 text-sm outline-none transition focus:border-[#FD7E14] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                  </label>

                  <label className="block w-full xl:flex xl:w-auto xl:items-center xl:gap-2">
                    <span className="mb-1.5 block text-xs font-semibold text-gray-600 xl:mb-0 xl:whitespace-nowrap">As on</span>
                    <span className="relative block xl:w-[240px]">
                      <input
                        aria-label="As on"
                        type="date"
                        value={asOn}
                        onChange={(event) => setAsOn(event.target.value)}
                        className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-[#FD7E14] focus:ring-2 focus:ring-orange-100"
                      />
                    </span>
                  </label>

                  {accountType && (
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-[#1B2559] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#111940]"
                    >
                      Print
                    </button>
                  )}
                </div>
              </div>

              {notice && (
                <div className={`mx-5 mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm sm:mx-7 ${
                  notice.ok
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}>
                  {notice.ok && <Check className="h-4 w-4" />}
                  {notice.message}
                </div>
              )}

              {accountType && (
                <div className="mx-5 mb-7 overflow-hidden rounded-xl border border-gray-200 shadow-sm sm:mx-7">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1120px] text-left text-xs text-[#344054]">
                      <thead className="border-b border-orange-200 bg-orange-50/80 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9A4A09]">
                        <tr>
                          <th className="px-3 py-3">Dated</th>
                          <th className="px-3 py-3">Trade #</th>
                          <th className="px-3 py-3">Address</th>
                          <th className="px-3 py-3">Description</th>
                          <th className="px-3 py-3">Method</th>
                          <th className="px-3 py-3 text-right">Deposits</th>
                          <th className="px-3 py-3 text-right">Withdrawal</th>
                          <th className="px-3 py-3 text-right">Balance</th>
                          <th className="px-3 py-3">Reconciled Date</th>
                          <th className="px-3 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {loading ? (
                          <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400">Loading transactions...</td></tr>
                        ) : rowsWithBalance.length === 0 ? (
                          <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400">No transactions found for this account and date.</td></tr>
                        ) : rowsWithBalance.map((entry) => {
                          const reconciledDate = reconciledDates[entry.id] || "";
                          return (
                            <tr key={entry.id} className="transition-colors hover:bg-orange-50/30">
                              <td className="whitespace-nowrap px-3 py-3">{formatDate(entry.date)}</td>
                              <td className="px-3 py-3">{entry.tradeNumber || "-"}</td>
                              <td className="max-w-[210px] truncate px-3 py-3" title={entry.address}>{entry.address || "-"}</td>
                              <td className="max-w-[280px] truncate px-3 py-3" title={entry.description}>{entry.description}</td>
                              <td className="px-3 py-3">{entry.method || "-"}</td>
                              <td className="whitespace-nowrap px-3 py-3 text-right">{entry.deposit ? formatMoney(entry.deposit) : "-"}</td>
                              <td className="whitespace-nowrap px-3 py-3 text-right">{entry.withdrawal ? formatMoney(entry.withdrawal) : "-"}</td>
                              <td className="whitespace-nowrap px-3 py-3 text-right font-semibold">{formatMoney(entry.balance)}</td>
                              <td className="min-w-[160px] px-3 py-2">
                                {editingDateId === entry.id ? (
                                  <input
                                    autoFocus
                                    aria-label={`Reconciled date for trade ${entry.tradeNumber}`}
                                    type="date"
                                    value={reconciledDate}
                                    max={asOn}
                                    onChange={(event) => setReconciledDates((previous) => ({ ...previous, [entry.id]: event.target.value }))}
                                    onBlur={() => setEditingDateId(null)}
                                    className="h-8 rounded-md border border-orange-300 px-2 outline-none ring-2 ring-orange-100"
                                  />
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setEditingDateId(entry.id)}
                                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-1.5 py-1 hover:bg-orange-50 hover:text-[#FD7E14]"
                                  >
                                    {formatDate(reconciledDate)}
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                <span className={`inline-flex rounded-md px-3 py-1.5 font-semibold text-white ${reconciledDate ? "bg-green-600" : "bg-amber-500"}`}>
                                  {reconciledDate ? "Cleared" : "Pending"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="border-t border-gray-200 bg-gray-50/80 font-semibold text-[#1B2559]">
                        <tr>
                          <td colSpan={5} className="px-3 py-3">Total</td>
                          <td className="whitespace-nowrap px-3 py-3 text-right">{formatMoney(totals.deposits)}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-right">{formatMoney(totals.withdrawals)}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-right">{formatMoney(totals.balance)}</td>
                          <td colSpan={2} />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col px-5 py-5 sm:px-7">
              <label className="block w-full max-w-[350px]">
                <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Account type <span className="text-red-500">*</span>
                </span>
                <span className="relative block">
                  <select
                    aria-label="History account type"
                    value={historyAccount}
                    onChange={(event) => setHistoryAccount(event.target.value as AccountType)}
                    className={selectClass}
                  >
                    {ACCOUNTS.map((account) => (
                      <option key={account} value={account}>{account}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </span>
              </label>

              {accountHistory.length > 0 && (
              <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-xs text-[#344054]">
                    <thead className="border-b border-orange-200 bg-orange-50/80 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9A4A09]">
                      <tr>
                        <th className="px-4 py-3">Reconciled On</th>
                        <th className="px-4 py-3">As On</th>
                        <th className="px-4 py-3 text-right">Bank Balance</th>
                        <th className="px-4 py-3 text-right">Transactions</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loading ? (
                        <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">Loading history...</td></tr>
                      ) : accountHistory.map((item) => (
                        <tr key={item._id} className="hover:bg-orange-50/30">
                          <td className="px-4 py-3">{formatDate(item.createdAt)}</td>
                          <td className="px-4 py-3">{formatDate(item.asOn)}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatMoney(item.bankBalance)}</td>
                          <td className="px-4 py-3 text-right">{item.rows.length}</td>
                          <td className="px-4 py-3"><span className="rounded-md bg-green-600 px-3 py-1.5 font-semibold text-white">Saved</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              )}
            </div>
          )}
        </section>
      </div>

      {activeTab === "reconcile" && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(16,24,40,0.04)] backdrop-blur sm:px-6 lg:px-8 print:hidden">
          <div className="mx-auto flex max-w-[1900px] items-center justify-end">
            <button
              type="button"
              onClick={saveReconciliation}
              disabled={saving || !accountType}
              className="h-10 rounded-lg bg-[#FD7E14] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E96C08] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          nav, [role="tablist"], button, select, input[type="date"]::-webkit-calendar-picker-indicator {
            display: none !important;
          }
          main {
            padding: 0 !important;
          }
          section {
            border: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </main>
  );
}
