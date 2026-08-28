"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Save,
  X,
} from "lucide-react";

type Category = "" | "Desk Fee" | "Rent Receivables";
type SortDirection = "asc" | "desc";

interface CollectionRow {
  id: string;
  persisted: boolean;
  sourceType: "agent" | "tenant";
  sourceId: string;
  category: Exclude<Category, "">;
  name: string;
  netAmount: number;
  hst: number;
  grossAmount: number;
  paymentMethod: string;
  referenceNo: string;
  month: number;
  year: number;
  receiptDate: string;
  invoiceNo: string | number;
  status: "Pending" | "Received";
}

interface TenantForm {
  tenantName: string;
  additionalName: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  monthlyRent: string;
  rentStartDate: string;
  hstNumber: string;
}

const emptyTenant = (): TenantForm => ({
  tenantName: "",
  additionalName: "",
  street: "",
  city: "",
  province: "ONT",
  postalCode: "",
  monthlyRent: "",
  rentStartDate: "",
  hstNumber: "",
});

const currentMonth = () => new Date().toISOString().slice(0, 7);
const today = () => new Date().toISOString().slice(0, 10);

const money = (value: number) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(value || 0);

const filterInitial = {
  name: "",
  netAmount: "",
  hst: "",
  grossAmount: "",
  paymentMethod: "",
  referenceNo: "",
  month: "",
  year: "",
  receiptDate: "",
  invoiceNo: "",
};

type FilterKey = keyof typeof filterInitial;
type SortKey = FilterKey | "status";

export default function MonthlyCollectionPage() {
  const [category, setCategory] = useState<Category>("Desk Fee");
  const [month, setMonth] = useState(currentMonth());
  // Desk fees are pending until paid, so keep them visible by default.
  const [showPending, setShowPending] = useState(true);
  const [includeZero, setIncludeZero] = useState(false);
  const [bulkDate, setBulkDate] = useState(today());
  const [rows, setRows] = useState<CollectionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(filterInitial);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [notice, setNotice] = useState<{ message: string; ok: boolean } | null>(null);
  const [tenantOpen, setTenantOpen] = useState(false);
  const [tenantForm, setTenantForm] = useState<TenantForm>(emptyTenant());
  const [tenantErrors, setTenantErrors] = useState<Record<string, string>>({});
  const [savingTenant, setSavingTenant] = useState(false);

  const fetchRows = useCallback(async () => {
    if (!category) {
      setRows([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({ category, month });
      const response = await fetch(`/api/monthly-collection?${params.toString()}`);
      if (!response.ok) throw new Error("Unable to load collections");
      const data = await response.json();
      setRows(data.rows || []);
      setNotice(null);
    } catch {
      setNotice({ message: "Could not load monthly collection records.", ok: false });
    } finally {
      setLoading(false);
    }
  }, [category, month]);

  useEffect(() => {
    const timer = window.setTimeout(fetchRows, 0);
    return () => window.clearTimeout(timer);
  }, [fetchRows]);

  const filteredRows = useMemo(() => {
    const query = (key: FilterKey) => filters[key].trim().toLowerCase();
    return rows.filter((row) => {
      if (!includeZero && row.grossAmount === 0) return false;
      if (!showPending && row.status === "Pending") return false;
      return (
        (!query("name") || row.name.toLowerCase().includes(query("name"))) &&
        (!query("netAmount") || String(row.netAmount).includes(query("netAmount"))) &&
        (!query("hst") || String(row.hst).includes(query("hst"))) &&
        (!query("grossAmount") || String(row.grossAmount).includes(query("grossAmount"))) &&
        (!query("paymentMethod") || row.paymentMethod.toLowerCase().includes(query("paymentMethod"))) &&
        (!query("referenceNo") || row.referenceNo.toLowerCase().includes(query("referenceNo"))) &&
        (!query("month") || String(row.month).includes(query("month"))) &&
        (!query("year") || String(row.year).includes(query("year"))) &&
        (!query("receiptDate") || row.receiptDate.toLowerCase().includes(query("receiptDate"))) &&
        (!query("invoiceNo") || String(row.invoiceNo).includes(query("invoiceNo")))
      );
    });
  }, [filters, includeZero, rows, showPending]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((left, right) => {
      const leftValue = left[sortKey as keyof CollectionRow] ?? "";
      const rightValue = right[sortKey as keyof CollectionRow] ?? "";
      const result = typeof leftValue === "number" && typeof rightValue === "number"
        ? leftValue - rightValue
        : String(leftValue).localeCompare(String(rightValue), undefined, { numeric: true });
      return sortDirection === "asc" ? result : -result;
    });
  }, [filteredRows, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sortedRows.slice((safePage - 1) * pageSize, safePage * pageSize);
  const firstShown = sortedRows.length ? (safePage - 1) * pageSize + 1 : 0;
  const lastShown = Math.min(safePage * pageSize, sortedRows.length);

  const sort = (key: SortKey) => {
    if (sortKey === key) setSortDirection((previous) => previous === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setPage(1);
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    return sortDirection === "asc"
      ? <ArrowUp className="h-3 w-3 text-[#FD7E14]" />
      : <ArrowDown className="h-3 w-3 text-[#FD7E14]" />;
  };

  const updateRow = <K extends keyof CollectionRow>(id: string, key: K, value: CollectionRow[K]) => {
    setRows((previous) => previous.map((row) => row.id === id ? { ...row, [key]: value } : row));
  };

  const persistRows = async (records: CollectionRow[], successMessage: string) => {
    if (!category || records.length === 0) return;
    try {
      const response = await fetch("/api/monthly-collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "saveRows", month, rows: records }),
      });
      if (!response.ok) throw new Error("Save failed");
      setNotice({ message: successMessage, ok: true });
      await fetchRows();
    } catch {
      setNotice({ message: "Could not save monthly collection records.", ok: false });
    }
  };

  const applyDateToAll = () => {
    const updated = rows.map((row) => ({ ...row, receiptDate: bulkDate, status: "Received" as const }));
    setRows(updated);
    void persistRows(updated, "Receipt date applied to all rows.");
  };

  const generateInvoices = async () => {
    if (!category || filteredRows.length === 0) {
      setNotice({ message: "There are no rows available for invoice generation.", ok: false });
      return;
    }
    try {
      const response = await fetch("/api/monthly-collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generateInvoices", month, rows: filteredRows }),
      });
      if (!response.ok) throw new Error("Generation failed");
      const data = await response.json();
      const generatedRows: CollectionRow[] = data.rows || [];
      const generatedBySource = new Map(generatedRows.map((row) => [`${row.sourceType}:${row.sourceId}`, row]));
      setRows((previous) => previous.map((row) => generatedBySource.get(`${row.sourceType}:${row.sourceId}`) || row));
      setNotice({ message: "Invoice numbers generated successfully.", ok: true });
      await fetchRows();
    } catch {
      setNotice({ message: "Could not generate invoice numbers.", ok: false });
    }
  };

  const saveTenant = async () => {
    const errors: Record<string, string> = {};
    if (!tenantForm.tenantName.trim()) errors.tenantName = "Tenant name is required";
    if (!tenantForm.monthlyRent || Number(tenantForm.monthlyRent) < 0) errors.monthlyRent = "Monthly rent is required";
    if (!tenantForm.rentStartDate) errors.rentStartDate = "Rent start date is required";
    setTenantErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      setSavingTenant(true);
      const response = await fetch("/api/monthly-collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addTenant", ...tenantForm }),
      });
      if (!response.ok) throw new Error("Tenant save failed");
      setTenantOpen(false);
      setTenantForm(emptyTenant());
      setNotice({ message: "Tenant added successfully.", ok: true });
      await fetchRows();
    } catch {
      setTenantErrors({ form: "Could not save the tenant." });
    } finally {
      setSavingTenant(false);
    }
  };

  const header = (key: SortKey, label: string) => (
    <button type="button" onClick={() => sort(key)} className="inline-flex items-center gap-1 whitespace-nowrap">
      {label}{sortIcon(key)}
    </button>
  );

  const filterInput = "h-8 w-full min-w-[90px] rounded-md border border-gray-200 bg-white px-2 text-xs font-normal text-[#344054] outline-none transition focus:border-[#FD7E14] focus:ring-2 focus:ring-orange-100";
  const fieldClass = "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#FD7E14] focus:ring-2 focus:ring-orange-100";

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1900px] flex-1 flex-col">
        <header className="mb-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#FD7E14]">Accounting</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#1B2559] sm:text-3xl">Monthly Collection</h1>
        </header>

        <section className="flex flex-1 flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <select aria-label="Collection category" value={category} onChange={(event) => { setCategory(event.target.value as Category); setPage(1); }} className="h-10 min-w-[200px] rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#FD7E14] focus:ring-2 focus:ring-orange-100">
                <option value="">Select Category</option>
                <option value="Desk Fee">Desk Fee</option>
                <option value="Rent Receivables">Rent Receivables</option>
              </select>
              <input aria-label="Collection month" type="month" value={month} onChange={(event) => { setMonth(event.target.value); setPage(1); }} className="h-10 min-w-[200px] rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#FD7E14] focus:ring-2 focus:ring-orange-100" />

              <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-500">
                <input type="checkbox" checked={showPending} onChange={(event) => { setShowPending(event.target.checked); setPage(1); }} className="h-5 w-5 rounded border-gray-300 accent-[#FD7E14]" />
                Show Pending
              </label>
              <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-500">
                <input type="checkbox" checked={includeZero} onChange={(event) => { setIncludeZero(event.target.checked); setPage(1); }} className="h-5 w-5 rounded border-gray-300 accent-[#FD7E14]" />
                Include zero
              </label>

              {category === "Rent Receivables" && (
                <button type="button" onClick={() => { setTenantForm(emptyTenant()); setTenantErrors({}); setTenantOpen(true); }} className="h-10 rounded-lg bg-[#1B2559] px-4 text-sm font-semibold text-white transition hover:bg-[#111940]">
                  Add New Tenant
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="button" onClick={generateInvoices} className="h-10 rounded-lg bg-[#1B2559] px-4 text-sm font-semibold text-white transition hover:bg-[#111940]">Generate Invoice No.</button>
              <input aria-label="Bulk receipt date" type="date" value={bulkDate} onChange={(event) => setBulkDate(event.target.value)} className="h-10 min-w-[200px] rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#FD7E14] focus:ring-2 focus:ring-orange-100" />
              <button type="button" onClick={applyDateToAll} disabled={!category || rows.length === 0} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#FD7E14] px-4 text-sm font-semibold text-white transition hover:bg-[#E96C08] disabled:cursor-not-allowed disabled:bg-gray-300">
                <ArrowLeft className="h-4 w-4" /> Apply this date to all
              </button>
            </div>
          </div>

          {notice && (
            <div className={`mt-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${notice.ok ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
              {notice.ok && <Check className="h-4 w-4" />}{notice.message}
            </div>
          )}

          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1500px] table-fixed text-left text-xs text-[#344054]">
                <colgroup>
                  <col className="w-[190px]" /><col className="w-[135px]" /><col className="w-[120px]" /><col className="w-[145px]" />
                  <col className="w-[150px]" /><col className="w-[130px]" /><col className="w-[105px]" /><col className="w-[105px]" />
                  <col className="w-[145px]" /><col className="w-[130px]" /><col className="w-[105px]" />
                </colgroup>
                <thead className="border-b border-orange-200 bg-orange-50/80 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9A4A09]">
                  <tr>
                    <th className="px-3 py-3">{header("name", "Name")}</th><th className="px-3 py-3 text-right">{header("netAmount", "Net Amount")}</th>
                    <th className="px-3 py-3 text-right">{header("hst", "HST")}</th><th className="px-3 py-3 text-right">{header("grossAmount", "Gross Amount")}</th>
                    <th className="px-3 py-3">{header("paymentMethod", "Payment Method")}</th><th className="px-3 py-3">{header("referenceNo", "Ref No.")}</th>
                    <th className="px-3 py-3">{header("month", "Month")}</th><th className="px-3 py-3">{header("year", "Year")}</th>
                    <th className="px-3 py-3">{header("receiptDate", "Receipt Date")}</th><th className="px-3 py-3">{header("invoiceNo", "Invoice No")}</th>
                    <th className="px-3 py-3">{header("status", "Action")}</th>
                  </tr>
                  <tr className="border-t border-orange-200 bg-orange-50/60 normal-case tracking-normal">
                    {(Object.keys(filterInitial) as FilterKey[]).map((key) => (
                      <th key={key} className="px-2 py-2"><input aria-label={`Filter ${key}`} value={filters[key]} onChange={(event) => { setFilters((previous) => ({ ...previous, [key]: event.target.value })); setPage(1); }} className={filterInput} /></th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading ? (
                    <tr><td colSpan={11} className="px-4 py-12 text-center text-gray-400">Loading monthly collections...</td></tr>
                  ) : pageRows.map((row) => (
                    <tr key={row.id} className="hover:bg-orange-50/30">
                      <td className="truncate px-3 py-3 font-medium" title={row.name}>{row.name}</td>
                      <td className="px-3 py-3 text-right">{money(row.netAmount)}</td><td className="px-3 py-3 text-right">{money(row.hst)}</td><td className="px-3 py-3 text-right font-semibold">{money(row.grossAmount)}</td>
                      <td className="px-2 py-2"><input aria-label={`Payment method for ${row.name}`} value={row.paymentMethod} onChange={(event) => updateRow(row.id, "paymentMethod", event.target.value)} className={filterInput} /></td>
                      <td className="px-2 py-2"><input aria-label={`Reference number for ${row.name}`} value={row.referenceNo} onChange={(event) => updateRow(row.id, "referenceNo", event.target.value)} className={filterInput} /></td>
                      <td className="px-3 py-3">{String(row.month).padStart(2, "0")}</td><td className="px-3 py-3">{row.year}</td>
                      <td className="px-2 py-2"><input aria-label={`Receipt date for ${row.name}`} type="date" value={row.receiptDate} onChange={(event) => { updateRow(row.id, "receiptDate", event.target.value); updateRow(row.id, "status", event.target.value ? "Received" : "Pending"); }} className={filterInput} /></td>
                      <td className="px-2 py-2"><input aria-label={`Invoice number for ${row.name}`} inputMode="numeric" value={row.invoiceNo} onChange={(event) => updateRow(row.id, "invoiceNo", event.target.value.replace(/\D/g, ""))} className={filterInput} /></td>
                      <td className="px-3 py-2"><button type="button" aria-label={`Save ${row.name}`} title="Save row" onClick={() => void persistRows([row], `${row.name} saved.`)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#1B2559] text-white transition hover:bg-[#FD7E14]"><Save className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 border-t border-gray-100 bg-white px-4 py-3 text-xs text-gray-500 sm:flex-row">
              <span>Showing {firstShown} to {lastShown} of {sortedRows.length} rows</span>
              <div className="flex items-center gap-1">
                <button type="button" aria-label="First page" disabled={safePage === 1} onClick={() => setPage(1)} className="rounded p-1.5 hover:bg-orange-50 disabled:opacity-30"><ChevronsLeft className="h-4 w-4" /></button>
                <button type="button" aria-label="Previous page" disabled={safePage === 1} onClick={() => setPage((previous) => Math.max(1, previous - 1))} className="rounded p-1.5 hover:bg-orange-50 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
                <button type="button" aria-label="Next page" disabled={safePage === totalPages} onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))} className="rounded p-1.5 hover:bg-orange-50 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
                <button type="button" aria-label="Last page" disabled={safePage === totalPages} onClick={() => setPage(totalPages)} className="rounded p-1.5 hover:bg-orange-50 disabled:opacity-30"><ChevronsRight className="h-4 w-4" /></button>
              </div>
              <select aria-label="Rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="h-8 rounded-lg border border-gray-200 bg-white px-2 outline-none focus:border-[#FD7E14]">
                {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </div>
          </div>
        </section>
      </div>

      {tenantOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-labelledby="tenant-modal-title">
          <div className="w-full max-w-3xl rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <h2 id="tenant-modal-title" className="text-xl font-bold text-[#1B2559]">Add Tenant</h2>
              <button type="button" aria-label="Close tenant modal" onClick={() => setTenantOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#FD7E14]"><X className="h-5 w-5" /></button>
            </div>

            <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
              {([
                ["tenantName", "Tenant Name", "Tenant Name *", true],
                ["additionalName", "Additional Name", "Additional Name", false],
                ["street", "Street", "Street", false],
                ["city", "City", "City", false],
                ["province", "Province", "Province", false],
                ["postalCode", "Postal Code", "Postal Code", false],
                ["monthlyRent", "Monthly Rent (Without HST $)", "Monthly Rent (Without HST $)", true],
              ] as const).map(([key, label, placeholder, required]) => (
                <label key={key} className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-gray-600">{label}{required && <span className="text-red-500"> *</span>}</span>
                  <input type={key === "monthlyRent" ? "number" : "text"} min={key === "monthlyRent" ? "0" : undefined} step={key === "monthlyRent" ? "0.01" : undefined} value={tenantForm[key]} placeholder={placeholder} onChange={(event) => setTenantForm((previous) => ({ ...previous, [key]: event.target.value }))} className={`${fieldClass} ${tenantErrors[key] ? "border-red-400" : ""}`} />
                  {tenantErrors[key] && <span className="mt-1 block text-[11px] text-red-500">{tenantErrors[key]}</span>}
                </label>
              ))}

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-600">Rent Start Date <span className="text-red-500">*</span></span>
                <input type="date" value={tenantForm.rentStartDate} onChange={(event) => setTenantForm((previous) => ({ ...previous, rentStartDate: event.target.value }))} className={`${fieldClass} ${tenantErrors.rentStartDate ? "border-red-400" : ""}`} />
                {tenantErrors.rentStartDate && <span className="mt-1 block text-[11px] text-red-500">{tenantErrors.rentStartDate}</span>}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-600">HST #</span>
                <input value={tenantForm.hstNumber} placeholder="HST" onChange={(event) => setTenantForm((previous) => ({ ...previous, hstNumber: event.target.value }))} className={fieldClass} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-600">Category</span>
                <select value="Rent Receivables" disabled className={`${fieldClass} disabled:bg-gray-50 disabled:text-gray-700`}><option>Rent Receivables</option></select>
              </label>
            </div>

            {tenantErrors.form && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{tenantErrors.form}</p>}
            <div className="mt-5 flex justify-end">
              <button type="button" onClick={saveTenant} disabled={savingTenant} className="h-10 rounded-lg bg-[#FD7E14] px-5 text-sm font-semibold text-white transition hover:bg-[#E96C08] disabled:opacity-60">{savingTenant ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
