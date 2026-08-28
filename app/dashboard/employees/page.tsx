"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Image as ImageIcon, Pencil, Plus, Trash2, Upload } from "lucide-react";
import type { EmployeeRecord } from "@/components/employees/EmployeeForm";

type Employee = EmployeeRecord & { _id: string };
type FilterKey = "firstName" | "lastName" | "street" | "city" | "province" | "postalCode" | "mobile" | "payFrequency" | "payType";
type SortKey = FilterKey;

const emptyFilters: Record<FilterKey, string> = {
  firstName: "", lastName: "", street: "", city: "", province: "", postalCode: "", mobile: "", payFrequency: "", payType: "",
};

const columns: Array<{ key: SortKey; label: string }> = [
  { key: "firstName", label: "First Name" }, { key: "lastName", label: "Last Name" },
  { key: "street", label: "Street" }, { key: "city", label: "City" },
  { key: "province", label: "Province" }, { key: "postalCode", label: "Postal Code" },
  { key: "mobile", label: "Mobile" }, { key: "payFrequency", label: "Frequency" },
  { key: "payType", label: "Pay Type" },
];

export default function EmployeesPage() {
  const router = useRouter();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState(emptyFilters);
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>({ key: "firstName", direction: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/employees", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load employees");
      setEmployees(data.employees || []);
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : "Could not load employees");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadEmployees(), 0);
    return () => window.clearTimeout(timer);
  }, [loadEmployees]);

  const filteredEmployees = useMemo(() => {
    const rows = employees.filter((employee) => columns.every(({ key }) => {
      const query = filters[key].trim().toLowerCase();
      return !query || String(employee[key] || "").toLowerCase().includes(query);
    }));
    return rows.sort((left, right) => {
      const comparison = String(left[sort.key] || "").localeCompare(String(right[sort.key] || ""), undefined, { numeric: true });
      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [employees, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredEmployees.slice((safePage - 1) * pageSize, safePage * pageSize);
  const firstRow = filteredEmployees.length ? (safePage - 1) * pageSize + 1 : 0;
  const lastRow = Math.min(safePage * pageSize, filteredEmployees.length);

  const changeSort = (key: SortKey) => setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));

  const toggleAll = () => {
    const pageIds = pageRows.map((employee) => employee._id);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((current) => {
      const next = new Set(current);
      pageIds.forEach((id) => {
        if (allSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  const exportRows = () => {
    const ids = Array.from(selectedIds).join(",");
    window.location.href = ids ? `/api/employees/export?ids=${encodeURIComponent(ids)}` : "/api/employees/export";
  };

  const importCsv = async (file?: File) => {
    if (!file) return;
    setStatus("Importing employees...");
    const body = new FormData(); body.append("file", file);
    try {
      const response = await fetch("/api/employees/import", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Import failed");
      setStatus(`Imported ${data.imported} employee${data.imported === 1 ? "" : "s"}.`);
      await loadEmployees();
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : "Import failed");
    } finally { if (importInputRef.current) importInputRef.current.value = ""; }
  };

  const remove = async (employee: Employee) => {
    if (!window.confirm(`Delete ${employee.firstName} ${employee.lastName}?`)) return;
    const response = await fetch(`/api/employees/${employee._id}`, { method: "DELETE" });
    if (response.ok) {
      setSelectedIds((current) => { const next = new Set(current); next.delete(employee._id); return next; });
      await loadEmployees();
    } else setStatus("Could not delete employee.");
  };

  const filterClass = "h-8 w-full min-w-[64px] rounded-md border border-[#D6DFEA] bg-white px-2 text-xs font-normal text-[#344054] outline-none focus:border-[#FD7E14] focus:ring-1 focus:ring-[#FD7E14]";

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col bg-white px-4 py-5 sm:px-6">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[#304467] sm:text-3xl">Employees</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={exportRows} className="inline-flex h-10 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"><Download className="h-4 w-4" />{selectedIds.size ? `Export (${selectedIds.size})` : "Export All"}</button>
          <a href="/api/employees/import" download className="inline-flex h-10 items-center gap-2 rounded-md border border-[#D6DFEA] bg-white px-3 text-sm font-semibold text-[#304467] hover:bg-[#F6F8FB]"><Download className="h-4 w-4" />Sample</a>
          <button type="button" onClick={() => importInputRef.current?.click()} className="inline-flex h-10 items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"><Upload className="h-4 w-4" />Import</button>
          <input ref={importInputRef} type="file" accept=".csv,text/csv" onChange={(event) => void importCsv(event.target.files?.[0])} className="hidden" />
          <button type="button" onClick={() => router.push("/dashboard/employees/add")} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#050B20] px-4 text-sm font-semibold text-white hover:bg-[#FD7E14]"><Plus className="h-4 w-4" />Add Employee</button>
        </div>
      </div>

      {status && <div className="mb-3 flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700"><span>{status}</span><button type="button" onClick={() => setStatus("")} className="font-bold">×</button></div>}

      <section className="overflow-hidden rounded-md bg-white shadow-[0_16px_35px_rgba(31,45,61,0.08)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1450px] table-fixed text-left text-xs text-[#344054]">
            <colgroup><col className="w-[64px]" /><col className="w-[170px]" /><col className="w-[170px]" /><col className="w-[145px]" /><col className="w-[78px]" /><col className="w-[98px]" /><col className="w-[104px]" /><col className="w-[245px]" /><col className="w-[215px]" /><col className="w-[120px]" /><col className="w-[88px]" /></colgroup>
            <thead className="border-b border-orange-200 bg-orange-50/80 text-[10px] font-bold uppercase tracking-[0.06em] text-[#9A4A09]">
              <tr>
                <th className="px-2 py-3"><input aria-label="Select all employees" type="checkbox" checked={pageRows.length > 0 && pageRows.every((employee) => selectedIds.has(employee._id))} onChange={toggleAll} className="h-4 w-4 accent-[#FD7E14]" /></th>
                {columns.map(({ key, label }) => <th key={key} className="px-2 py-3"><button type="button" onClick={() => changeSort(key)} className="inline-flex items-center gap-1 text-left uppercase"><span>{label}</span><span className="text-[11px]">{sort.key === key ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>)}
                <th className="px-2 py-3 text-center">Action</th>
              </tr>
              <tr className="border-t border-orange-200 bg-orange-50/60">
                <th className="px-2 py-2" />
                {columns.map(({ key, label }) => <th key={key} className="px-2 py-2"><input aria-label={`Filter ${label}`} value={filters[key]} onChange={(event) => { setFilters((current) => ({ ...current, [key]: event.target.value })); setPage(1); }} className={filterClass} /></th>)}
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4ED]">
              {loading ? <tr><td colSpan={11} className="px-4 py-12 text-center text-[#70809A]">Loading employees...</td></tr> : pageRows.length === 0 ? <tr><td colSpan={11} className="px-4 py-12 text-center text-[#70809A]">No employees found</td></tr> : pageRows.map((employee) => (
                <tr key={employee._id} onDoubleClick={() => router.push(`/dashboard/employees/${employee._id}/edit`)} className="hover:bg-orange-50/30">
                  <td className="px-2 py-2"><div className="flex items-center gap-2"><input aria-label={`Select ${employee.firstName}`} type="checkbox" checked={selectedIds.has(employee._id)} onChange={() => setSelectedIds((current) => { const next = new Set(current); if (next.has(employee._id)) next.delete(employee._id); else next.add(employee._id); return next; })} className="h-4 w-4 accent-[#FD7E14]" /><div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-[#D1D1D1] text-white">{employee.photo ? <Image src={employee.photo} alt="" width={36} height={36} unoptimized className="h-full w-full object-cover" /> : <ImageIcon className="h-4 w-4" />}</div></div></td>
                  <td className="px-2 py-3">{employee.firstName || "-"}</td><td className="px-2 py-3">{employee.lastName || "-"}</td><td className="px-2 py-3">{employee.street || "-"}</td><td className="px-2 py-3">{employee.city || "-"}</td><td className="px-2 py-3">{employee.province || "-"}</td><td className="px-2 py-3">{employee.postalCode || "-"}</td><td className="px-2 py-3">{employee.mobile || "-"}</td><td className="px-2 py-3">{employee.payFrequency || "-"}</td><td className="px-2 py-3">{employee.payType || "-"}</td>
                  <td className="px-2 py-2"><div className="flex justify-center gap-1"><button type="button" aria-label={`Edit ${employee.firstName}`} onClick={() => router.push(`/dashboard/employees/${employee._id}/edit`)} className="rounded-md p-2 text-[#050B20] hover:bg-orange-50 hover:text-[#FD7E14]"><Pencil className="h-4 w-4" /></button><button type="button" aria-label={`Delete ${employee.firstName}`} onClick={() => void remove(employee)} className="rounded-md p-2 text-[#050B20] hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 border-t border-[#DCE4ED] px-4 py-3 text-sm text-[#70809A]">
          <span>Showing {firstRow} to {lastRow} of {filteredEmployees.length} rows</span>
          <div className="flex items-center gap-2"><button type="button" aria-label="First page" disabled={safePage === 1} onClick={() => setPage(1)} className="disabled:opacity-30"><ChevronsLeft className="h-4 w-4" /></button><button type="button" aria-label="Previous page" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F6F8] font-medium text-[#111827]">{safePage}</span><button type="button" aria-label="Next page" disabled={safePage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button><button type="button" aria-label="Last page" disabled={safePage === totalPages} onClick={() => setPage(totalPages)} className="disabled:opacity-30"><ChevronsRight className="h-4 w-4" /></button></div>
          <label className="relative"><select aria-label="Rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="h-8 appearance-none rounded-md border border-[#A9D7FF] bg-white pl-3 pr-8 text-xs text-[#2788CC] outline-none"><option>10</option><option>25</option><option>50</option><option>100</option></select><ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-[#2788CC]" /></label>
        </div>
      </section>
    </main>
  );
}
