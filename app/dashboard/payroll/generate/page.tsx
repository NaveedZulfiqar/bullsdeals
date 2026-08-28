"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Check, Image as ImageIcon } from "lucide-react";

interface PayrollRow {
  id: string;
  employeeId: string;
  photo: string;
  name: string;
  paymentType: string;
  paymentFrequency: string;
  periodStartDate: string;
  periodEndDate: string;
  payDueDate: string;
  employeeStatus: string;
  cppExempt: boolean;
  eiExempt: boolean;
  vacationPolicy: string;
  salary: number;
  payrollStatus: "Not Generated" | "Generated" | "Paid";
}

const today = () => new Date().toISOString().slice(0, 10);
const displayDate = (value: string) => new Intl.DateTimeFormat("en-CA", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
const money = (value: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(value || 0);

const initialFilters = {
  name: "", paymentType: "", paymentFrequency: "", periodStartDate: "", periodEndDate: "",
  payDueDate: "", employeeStatus: "", cppExempt: "", eiExempt: "", vacationPolicy: "", salary: "",
};

export default function GeneratePayrollPage() {
  const [periodEndDate, setPeriodEndDate] = useState(today());
  const [showPaid, setShowPaid] = useState(false);
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ message: string; ok: boolean } | null>(null);

  const loadPayroll = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ periodEndDate, showPaid: String(showPaid) });
      const response = await fetch(`/api/payroll?${params.toString()}`);
      if (!response.ok) throw new Error("Load failed");
      const data = await response.json();
      setRows(data.rows || []);
    } catch {
      setNotice({ message: "Could not load payroll employees.", ok: false });
    } finally {
      setLoading(false);
    }
  }, [periodEndDate, showPaid]);

  useEffect(() => {
    const timer = window.setTimeout(loadPayroll, 0);
    return () => window.clearTimeout(timer);
  }, [loadPayroll]);

  const visibleRows = useMemo(() => rows.filter((row) => {
    const includes = (value: unknown, filter: string) => !filter || String(value).toLowerCase().includes(filter.toLowerCase());
    return includes(row.name, filters.name) && includes(row.paymentType, filters.paymentType) &&
      includes(row.paymentFrequency, filters.paymentFrequency) && includes(row.periodStartDate, filters.periodStartDate) &&
      includes(row.periodEndDate, filters.periodEndDate) && includes(row.payDueDate, filters.payDueDate) &&
      includes(row.employeeStatus, filters.employeeStatus) && includes(row.cppExempt ? "Yes" : "No", filters.cppExempt) &&
      includes(row.eiExempt ? "Yes" : "No", filters.eiExempt) && includes(row.vacationPolicy, filters.vacationPolicy) &&
      includes(row.salary, filters.salary);
  }), [filters, rows]);

  const saveRun = async (row: PayrollRow) => {
    const nextStatus = row.payrollStatus === "Not Generated" ? "Generated" : "Paid";
    try {
      setSavingId(row.id);
      const response = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...row, status: nextStatus }),
      });
      if (!response.ok) throw new Error("Save failed");
      setNotice({ message: `${row.name} payroll ${nextStatus === "Paid" ? "marked paid" : "generated"}.`, ok: true });
      await loadPayroll();
    } catch {
      setNotice({ message: "Could not update payroll.", ok: false });
    } finally {
      setSavingId(null);
    }
  };

  const inputClass = "h-8 w-full min-w-[86px] rounded-md border border-gray-200 bg-white px-2 text-xs font-normal text-[#344054] outline-none focus:border-[#FD7E14] focus:ring-2 focus:ring-orange-100";
  const filterKeys = Object.keys(initialFilters) as Array<keyof typeof initialFilters>;

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1900px] flex-1 flex-col">
        <header className="mb-5"><p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#FD7E14]">Payroll</p><h1 className="text-2xl font-bold text-[#1B2559] sm:text-3xl">Generate Payroll</h1></header>
        <section className="flex flex-1 flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <label className="block w-full sm:w-[240px]"><span className="mb-1.5 block text-xs font-semibold text-gray-600">Period End Date</span><input type="date" value={periodEndDate} onChange={(event) => setPeriodEndDate(event.target.value)} className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#FD7E14] focus:ring-2 focus:ring-orange-100" /></label>
            <label className="inline-flex h-10 items-center gap-2 text-xs font-medium text-gray-500"><input type="checkbox" checked={showPaid} onChange={(event) => setShowPaid(event.target.checked)} className="h-5 w-5 rounded accent-[#FD7E14]" />Show paid</label>
          </div>
          <h2 className="mb-3 mt-5 text-xl font-bold text-[#1B2559]">Payroll</h2>
          {notice && <div className={`mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${notice.ok ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>{notice.ok && <Check className="h-4 w-4" />}{notice.message}</div>}
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1650px] table-fixed text-left text-xs text-[#344054]">
                <colgroup><col className="w-[85px]" /><col className="w-[190px]" /><col className="w-[120px]" /><col className="w-[145px]" /><col className="w-[125px]" /><col className="w-[125px]" /><col className="w-[125px]" /><col className="w-[135px]" /><col className="w-[115px]" /><col className="w-[115px]" /><col className="w-[150px]" /><col className="w-[120px]" /><col className="w-[120px]" /></colgroup>
                <thead className="border-b border-orange-200 bg-orange-50/80 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9A4A09]">
                  <tr><th className="px-2 py-3">Photo</th><th className="px-2 py-3">Name</th><th className="px-2 py-3">Payment Type</th><th className="px-2 py-3">Payment Frequency</th><th className="px-2 py-3">Period Start Date</th><th className="px-2 py-3">Period End Date</th><th className="px-2 py-3">Pay Due Date</th><th className="px-2 py-3">Employee Status</th><th className="px-2 py-3">CPP Exempt</th><th className="px-2 py-3">EI Exempt</th><th className="px-2 py-3">Vacation Policy</th><th className="px-2 py-3">Salary</th><th className="px-2 py-3">Action</th></tr>
                  <tr className="border-t border-orange-200 bg-orange-50/60"><th />{filterKeys.map((key) => <th key={key} className="px-2 py-2"><input aria-label={`Filter ${key}`} value={filters[key]} onChange={(event) => setFilters((previous) => ({ ...previous, [key]: event.target.value }))} className={inputClass} /></th>)}<th /></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? <tr><td colSpan={13} className="px-4 py-12 text-center text-gray-400">Loading payroll...</td></tr> : visibleRows.map((row) => (
                    <tr key={row.id} className="hover:bg-orange-50/30"><td className="px-2 py-2"><div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-400">{row.photo ? <Image src={row.photo} alt="" width={36} height={36} unoptimized className="h-full w-full object-cover" /> : <ImageIcon className="h-4 w-4" />}</div></td><td className="px-2 py-3 font-medium">{row.name}</td><td className="px-2 py-3">{row.paymentType}</td><td className="px-2 py-3">{row.paymentFrequency}</td><td className="px-2 py-3">{displayDate(row.periodStartDate)}</td><td className="px-2 py-3">{displayDate(row.periodEndDate)}</td><td className="px-2 py-3">{displayDate(row.payDueDate)}</td><td className="px-2 py-3">{row.employeeStatus}</td><td className="px-2 py-3">{row.cppExempt ? "Yes" : "No"}</td><td className="px-2 py-3">{row.eiExempt ? "Yes" : "No"}</td><td className="px-2 py-3">{row.vacationPolicy}</td><td className="px-2 py-3 font-semibold">{money(row.salary)}</td><td className="px-2 py-2">{row.payrollStatus === "Paid" ? <span className="rounded-md bg-green-100 px-3 py-1.5 font-semibold text-green-700">Paid</span> : <button type="button" disabled={savingId === row.id} onClick={() => saveRun(row)} className="rounded-md bg-[#1B2559] px-3 py-1.5 font-semibold text-white hover:bg-[#FD7E14] disabled:opacity-60">{savingId === row.id ? "Saving..." : row.payrollStatus === "Generated" ? "Mark Paid" : "Generate"}</button>}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
