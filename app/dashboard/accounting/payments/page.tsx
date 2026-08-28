"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Mail, Printer, X } from "lucide-react";

const PAYMENT_METHODS = ["Bank Draft", "Bank Transfer", "Cheque", "Credit Card", "Direct Deposit (Branch)"] as const;
const ACCOUNTS = ["General Account", "Commission Trust Account", "Real Estate Trust Account"] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];
type AccountType = (typeof ACCOUNTS)[number];
type FilterKey = "chequeNo" | "tradeNo" | "date" | "fileNumber" | "amount" | "issuedTo";

interface Payment {
  id: string;
  sourceType: string;
  paymentMethod: string;
  accountType: AccountType;
  chequeNo: string;
  tradeNo: string | number;
  date: string;
  fileNumber: string | number;
  amount: number;
  issuedTo: string;
  description: string;
  referenceNo: string;
  propertyAddress: string;
  transferFrom: string;
  transferTo: string;
  printed: boolean;
  cancelled: boolean;
}

const emptyFilters: Record<FilterKey, string> = { chequeNo: "", tradeNo: "", date: "", fileNumber: "", amount: "", issuedTo: "" };
const today = () => new Date().toISOString().slice(0, 10);
const money = (value: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(value || 0);
const displayDate = (value: string) => {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date).replace(/ /g, "-");
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cheque");
  const [accountType, setAccountType] = useState<AccountType>("Commission Trust Account");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState(today());
  const [printedOnly, setPrintedOnly] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  const [sort, setSort] = useState<{ key: FilterKey; direction: "asc" | "desc" }>({ key: "date", direction: "desc" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [previewRows, setPreviewRows] = useState<Payment[]>([]);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payments", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load payments");
      setPayments(data.payments || []);
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : "Could not load payments");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadPayments(), 0);
    return () => window.clearTimeout(timer);
  }, [loadPayments]);

  const visiblePayments = useMemo(() => {
    const rows = payments.filter((payment) => {
      if (payment.paymentMethod !== paymentMethod || payment.accountType !== accountType) return false;
      if (startDate && payment.date < startDate) return false;
      if (endDate && payment.date > endDate) return false;
      if (printedOnly && !payment.printed) return false;
      if (!showCancelled && payment.cancelled) return false;
      return (Object.keys(filters) as FilterKey[]).every((key) => {
        const query = filters[key].trim().toLowerCase();
        const value = key === "amount" ? String(payment.amount) : String(payment[key] || "");
        return !query || value.toLowerCase().includes(query);
      });
    });
    return rows.sort((left, right) => {
      const leftValue = sort.key === "amount" ? left.amount : String(left[sort.key] || "");
      const rightValue = sort.key === "amount" ? right.amount : String(right[sort.key] || "");
      const comparison = typeof leftValue === "number" && typeof rightValue === "number" ? leftValue - rightValue : String(leftValue).localeCompare(String(rightValue), undefined, { numeric: true });
      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [accountType, endDate, filters, paymentMethod, payments, printedOnly, showCancelled, sort, startDate]);

  const totalPages = Math.max(1, Math.ceil(visiblePayments.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = visiblePayments.slice((safePage - 1) * pageSize, safePage * pageSize);
  const firstRow = visiblePayments.length ? (safePage - 1) * pageSize + 1 : 0;
  const lastRow = Math.min(safePage * pageSize, visiblePayments.length);

  const resetResults = () => { setPage(1); setSelectedIds(new Set()); };
  const changeSort = (key: FilterKey) => setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));
  const toggleAll = () => {
    const ids = pageRows.map((payment) => payment.id);
    const allSelected = ids.length > 0 && ids.every((id) => selectedIds.has(id));
    setSelectedIds((current) => { const next = new Set(current); ids.forEach((id) => { if (allSelected) next.delete(id); else next.add(id); }); return next; });
  };

  const downloadCsv = () => {
    const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = visiblePayments.map((payment) => [payment.chequeNo, payment.tradeNo, payment.date, payment.fileNumber, payment.amount.toFixed(2), payment.issuedTo, payment.paymentMethod, payment.accountType, payment.printed ? "Yes" : "No", payment.cancelled ? "Yes" : "No"].map(escape).join(","));
    const csv = [["Cheque No", "Trade No", "Date", "File Number", "Amount", "Issued To", "Payment Method", "Account", "Printed", "Cancelled"].map(escape).join(","), ...rows].join("\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); link.download = `payments_${today()}.csv`; link.click(); URL.revokeObjectURL(link.href);
  };

  const markPrinted = async () => {
    if (!previewRows.length) return;
    const ids = previewRows.map((payment) => payment.id);
    await fetch("/api/payments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids, printed: true }) });
    setPayments((current) => current.map((payment) => ids.includes(payment.id) ? { ...payment, printed: true } : payment));
    window.print();
  };

  const printSelectedCheques = () => {
    const selected = visiblePayments.filter((payment) => selectedIds.has(payment.id));
    if (!selected.length) { setNotice("Select at least one cheque to print."); return; }
    setPreviewRows(selected);
  };

  const downloadNote = (payment: Payment) => {
    const text = [`Save Max Bulls Realty`, payment.paymentMethod === "Bank Transfer" ? "Transfer Note" : "Payment Note", `Transferred From: ${payment.transferFrom || payment.accountType}`, `Transferred To: ${payment.transferTo || payment.issuedTo}`, `Property Address: ${payment.propertyAddress || "-"}`, `Trade: ${payment.tradeNo || "-"}`, `Amount: ${money(payment.amount)}`, `Method: ${payment.paymentMethod}`, `Reference #: ${payment.referenceNo || "-"}`, `Date: ${displayDate(payment.date)}`, `Description: ${payment.description}`].join("\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([text], { type: "text/plain" })); link.download = `payment-note-${payment.tradeNo || payment.fileNumber || "payment"}.txt`; link.click(); URL.revokeObjectURL(link.href);
  };

  const inputClass = "h-10 w-full rounded-md border border-[#D6DFEA] bg-white px-3 text-sm text-[#253858] outline-none focus:border-[#FD7E14] focus:ring-1 focus:ring-[#FD7E14]";
  const filterClass = "h-8 w-full rounded-md border border-[#D6DFEA] bg-white px-2 text-xs font-normal text-[#344054] outline-none focus:border-[#FD7E14]";
  const tableColumns: Array<{ key: FilterKey; label: string }> = [{ key: "chequeNo", label: "Cheque No" }, { key: "tradeNo", label: "Trade No" }, { key: "date", label: "Date" }, { key: "fileNumber", label: "File Number" }, { key: "amount", label: "Amount" }, { key: "issuedTo", label: "Issued To" }];

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col bg-white px-4 py-5 sm:px-6">
      <h1 className="mb-4 text-2xl font-bold text-[#304467] sm:text-3xl">Payments</h1>
      <section className="mb-4 flex flex-wrap items-end gap-3">
        <label className="w-[166px]"><span className="mb-1.5 block text-xs font-medium text-[#5A6B84]">Payment Method</span><span className="relative block"><select value={paymentMethod} onChange={(event) => { setPaymentMethod(event.target.value as PaymentMethod); resetResults(); }} className={`${inputClass} appearance-none pr-9`}>{PAYMENT_METHODS.map((method) => <option key={method}>{method}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[#7990AD]" /></span></label>
        <label className="w-[252px]"><span className="mb-1.5 block text-xs font-medium text-[#5A6B84]">Select Account</span><span className="relative block"><select value={accountType} onChange={(event) => { setAccountType(event.target.value as AccountType); resetResults(); }} className={`${inputClass} appearance-none pr-9`}>{ACCOUNTS.map((account) => <option key={account}>{account}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[#7990AD]" /></span></label>
        <label className="w-[242px]"><span className="mb-1.5 block text-xs font-medium text-[#5A6B84]">Start Date</span><span className="relative block"><input type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); resetResults(); }} className={`${inputClass} pr-10`} /><CalendarDays className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[#58708F]" /></span></label>
        <label className="w-[242px]"><span className="mb-1.5 block text-xs font-medium text-[#5A6B84]">End Date</span><span className="relative block"><input type="date" value={endDate} onChange={(event) => { setEndDate(event.target.value); resetResults(); }} className={`${inputClass} pr-10`} /><CalendarDays className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[#58708F]" /></span></label>
        <label className="mb-2 flex items-center gap-2 text-xs text-[#64748B]"><input type="checkbox" checked={printedOnly} onChange={(event) => { setPrintedOnly(event.target.checked); resetResults(); }} className="h-5 w-5 accent-[#FD7E14]" />Printed</label>
        <label className="mb-2 flex items-center gap-2 text-xs text-[#64748B]"><input type="checkbox" checked={showCancelled} onChange={(event) => { setShowCancelled(event.target.checked); resetResults(); }} className="h-5 w-5 accent-[#FD7E14]" />Show Cancelled Cheque</label>
        <button type="button" disabled={!visiblePayments.length} onClick={downloadCsv} className="h-10 rounded-md bg-[#050B20] px-4 text-sm font-medium text-white hover:bg-[#FD7E14] disabled:bg-[#8B8E96]">Download CSV</button>
        {paymentMethod === "Cheque" && <button type="button" onClick={printSelectedCheques} className="h-10 rounded-md bg-[#050B20] px-4 text-sm font-medium text-white hover:bg-[#FD7E14] disabled:bg-[#8B8E96]">Print Multiple Cheques</button>}
      </section>

      {notice && <div className="mb-3 flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700"><span>{notice}</span><button type="button" onClick={() => setNotice("")}>×</button></div>}

      <section className="overflow-hidden rounded-md bg-white shadow-[0_16px_35px_rgba(31,45,61,0.08)]">
        <div className="overflow-x-auto"><table className="w-full min-w-[1180px] table-fixed text-left text-xs text-[#344054]">
          <colgroup><col className="w-10" /><col className="w-[120px]" /><col className="w-[145px]" /><col className="w-[180px]" /><col className="w-[145px]" /><col className="w-[170px]" /><col className="w-[220px]" /><col className="w-[120px]" /></colgroup>
          <thead className="border-b border-orange-200 bg-orange-50/80 text-[10px] font-bold uppercase tracking-[0.06em] text-[#9A4A09]"><tr><th className="px-2 py-3"><input type="checkbox" aria-label="Select all payments" checked={pageRows.length > 0 && pageRows.every((payment) => selectedIds.has(payment.id))} onChange={toggleAll} className="h-5 w-5 accent-[#FD7E14]" /></th>{tableColumns.map(({ key, label }) => <th key={key} className={`px-2 py-3 ${key === "amount" ? "text-right" : ""}`}><button type="button" onClick={() => changeSort(key)} className="inline-flex items-center gap-1 uppercase">{label}<span>{sort.key === key ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>)}<th className="px-2 py-3 text-center">Action</th></tr>
          <tr className="border-t border-orange-200 bg-orange-50/60"><th />{tableColumns.map(({ key, label }) => <th key={key} className="px-2 py-2"><input aria-label={`Filter ${label}`} value={filters[key]} onChange={(event) => { setFilters((current) => ({ ...current, [key]: event.target.value })); setPage(1); }} className={filterClass} /></th>)}<th /></tr></thead>
          <tbody className="divide-y divide-[#DCE4ED]">{loading ? <tr><td colSpan={8} className="px-4 py-12 text-center text-[#70809A]">Loading payments...</td></tr> : pageRows.length === 0 ? <tr><td colSpan={8} className="px-4 py-12 text-center text-[#70809A]">No payments found</td></tr> : pageRows.map((payment) => <tr key={payment.id} className={`${payment.cancelled ? "bg-red-50 text-red-700" : "hover:bg-orange-50/30"}`}><td className="px-2 py-2"><input type="checkbox" aria-label={`Select payment ${payment.id}`} checked={selectedIds.has(payment.id)} onChange={() => setSelectedIds((current) => { const next = new Set(current); if (next.has(payment.id)) next.delete(payment.id); else next.add(payment.id); return next; })} className="h-5 w-5 accent-[#FD7E14]" /></td><td className="px-2 py-3">{payment.chequeNo || ""}</td><td className="px-2 py-3">{payment.tradeNo || "-"}</td><td className="px-2 py-3">{displayDate(payment.date)}</td><td className="px-2 py-3">{payment.fileNumber || "-"}</td><td className="px-2 py-3 text-right font-medium">{money(payment.amount)}</td><td className="truncate px-2 py-3" title={payment.issuedTo}>{payment.issuedTo || "-"}{payment.printed && <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">Printed</span>}</td><td className="px-2 py-2 text-center"><button type="button" aria-label={`Print payment ${payment.id}`} onClick={() => setPreviewRows([payment])} className="rounded-md p-2 text-[#050B20] hover:bg-orange-50 hover:text-[#FD7E14]"><Printer className="h-4 w-4" /></button></td></tr>)}</tbody>
        </table></div>
        <div className="flex flex-wrap items-center justify-center gap-4 border-t border-[#DCE4ED] px-4 py-3 text-sm text-[#70809A]"><span>Showing {firstRow} to {lastRow} of {visiblePayments.length} rows</span><div className="flex items-center gap-3"><button type="button" disabled={safePage === 1} onClick={() => setPage(1)} className="disabled:opacity-30"><ChevronsLeft className="h-4 w-4" /></button><button type="button" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F6F8] text-[#111827]">{safePage}</span><button type="button" disabled={safePage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button><button type="button" disabled={safePage === totalPages} onClick={() => setPage(totalPages)} className="disabled:opacity-30"><ChevronsRight className="h-4 w-4" /></button></div><span className="relative"><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="h-8 appearance-none rounded-md border border-[#A9D7FF] bg-white pl-3 pr-8 text-xs text-[#2788CC]"><option>10</option><option>25</option><option>50</option></select><ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-[#2788CC]" /></span></div>
      </section>

      {previewRows.length > 0 && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 print:static print:block print:bg-white print:p-0"><div className="flex h-[82vh] w-full max-w-6xl flex-col rounded-xl bg-white p-5 shadow-2xl print:h-auto print:max-w-none print:rounded-none print:p-0 print:shadow-none"><div className="mb-3 flex items-center justify-between gap-4 print:hidden"><h2 className="truncate text-lg font-bold text-[#304467]">Save Max Bulls Realty - {previewRows[0].accountType} - {previewRows[0].paymentMethod} - Trade# {previewRows[0].tradeNo || "-"}</h2><div className="flex items-center gap-2"><a href={`mailto:?subject=${encodeURIComponent(`Payment Note - Trade ${previewRows[0].tradeNo}`)}`} className="rounded-md p-2 text-[#5A6B84] hover:bg-orange-50"><Mail className="h-5 w-5" /></a><button type="button" onClick={markPrinted} className="rounded-md p-2 text-[#5A6B84] hover:bg-orange-50" title="Print"><Printer className="h-5 w-5" /></button><button type="button" onClick={() => downloadNote(previewRows[0])} className="rounded-md p-2 text-[#5A6B84] hover:bg-orange-50" title="Download"><Download className="h-5 w-5" /></button><button type="button" onClick={() => setPreviewRows([])} className="rounded-md p-2 text-[#5A6B84] hover:bg-gray-100"><X className="h-5 w-5" /></button></div></div><div className="flex-1 overflow-y-auto bg-[#D3D4D7] p-7 print:overflow-visible print:bg-white print:p-0">{previewRows.map((payment) => <article key={payment.id} className="mx-auto mb-7 min-h-[900px] max-w-5xl bg-white px-16 py-16 text-black shadow-lg print:mb-0 print:min-h-screen print:max-w-none print:break-after-page print:px-14 print:py-14 print:shadow-none"><header className="text-center"><h3 className="text-2xl font-bold">Save Max Bulls Realty</h3><p className="mt-2">145 Clarence St. Unit: 29-B, Brampton, ON - L6W 1T2</p><p>Phone: 905-699-6700, Email: teamsmsoffice@gmail.com</p><h4 className="mt-9 text-3xl">{payment.paymentMethod === "Bank Transfer" ? "Transfer Note" : payment.paymentMethod === "Cheque" ? "Cheque Payment" : "Payment Note"}</h4></header><dl className="mx-auto mt-12 grid max-w-4xl grid-cols-[250px_1fr] gap-y-3 text-base"><dt>Transferred From:</dt><dd>{payment.transferFrom || payment.accountType}</dd><dt>Transferred To:</dt><dd>{payment.transferTo || payment.issuedTo}</dd><dt>Property Address:</dt><dd>{payment.propertyAddress || "-"}</dd><dt>Trade:</dt><dd>{payment.tradeNo || "-"}</dd><dt>Amount:</dt><dd>{money(payment.amount)}</dd><dt>Method:</dt><dd>{payment.paymentMethod}</dd><dt>Reference #:</dt><dd>{payment.referenceNo || "-"}</dd><dt>Date:</dt><dd>{displayDate(payment.date)}</dd><dt>Instrument #:</dt><dd>{payment.chequeNo || "-"}</dd><dt>Transfer Type:</dt><dd>{payment.description}</dd></dl></article>)}</div></div></div>}
    </main>
  );
}
