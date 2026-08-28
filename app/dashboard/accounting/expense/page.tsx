"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowUpDown, ArrowUp, ArrowDown,
  Plus, Upload, Download, Trash2, X, Pencil, ChevronLeft,
  ChevronRight, ChevronsLeft, ChevronsRight, Calendar, FileText,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvoiceItem {
  _id?: string;
  item: string;
  price: number;
  quantity: number;
  amount: number;
  hstAmount: number;
}

interface PaymentRow {
  _id?: string;
  description: string;
  paymentDate: string;
  paymentMethod: string;
  transactionRefNo: string;
}

interface Expenditure {
  _id: string;
  invoiceNumber: number;
  invoiceDate: string;
  category: string;
  supplierNickName: string;
  address: string;
  hstNumber: string;
  phone: string;
  email: string;
  invoiceItems: InvoiceItem[];
  subtotal: number;
  hstAmount: number;
  hstExempted: boolean;
  amount: number;
  paymentRows: PaymentRow[];
}

interface ExpenditureFormData {
  invoiceNumber: string;
  invoiceDate: string;
  category: string;
  supplierNickName: string;
  address: string;
  hstNumber: string;
  phone: string;
  email: string;
  invoiceItems: InvoiceItem[];
  subtotal: string;
  hstAmount: string;
  hstExempted: boolean;
  amount: string;
  paymentRows: PaymentRow[];
}

interface Category {
  _id: string;
  name: string;
  type: string;
}

interface Supplier {
  supplierNickName: string;
  address: string;
  hstNumber: string;
  phone: string;
  email: string;
}

type SortField = "invoiceNumber" | "invoiceDate" | "supplierNickName" | "category" | "amount";
type SortOrder = "asc" | "desc";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  "EFT", "Cheque", "Bank Draft", "Cash", "Wire Transfer", "Credit Card", "Other",
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const emptyItem = (): InvoiceItem => ({
  item: "", price: 0, quantity: 1, amount: 0, hstAmount: 0,
});

const emptyPaymentRow = (): PaymentRow => ({
  description: "", paymentDate: "", paymentMethod: "", transactionRefNo: "",
});

const emptyForm = (): ExpenditureFormData => ({
  invoiceNumber: "",
  invoiceDate: new Date().toISOString().split("T")[0],
  category: "",
  supplierNickName: "",
  address: "",
  hstNumber: "",
  phone: "",
  email: "",
  invoiceItems: [emptyItem()],
  subtotal: "0.00",
  hstAmount: "0.00",
  hstExempted: false,
  amount: "0.00",
  paymentRows: [emptyPaymentRow()],
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d: string) => {
  if (!d) return "-";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt.getTime())) return d;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${String(dt.getDate()).padStart(2, "0")}-${months[dt.getMonth()]}-${dt.getFullYear()}`;
};

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency", currency: "CAD", minimumFractionDigits: 2,
  }).format(n || 0);

// ─── Small UI atoms ───────────────────────────────────────────────────────────

const Label = ({ children, req }: { children: React.ReactNode; req?: boolean }) => (
  <label className="block text-xs font-medium text-[#2C2C2C] mb-1">
    {children}{req && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const Field = ({
  cls = "", ...p
}: React.InputHTMLAttributes<HTMLInputElement> & { cls?: string }) => (
  <input
    {...p}
    className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559] bg-white placeholder-gray-400 ${cls}`}
  />
);

const Sel = ({
  children, cls = "", ...p
}: React.SelectHTMLAttributes<HTMLSelectElement> & { cls?: string; children: React.ReactNode }) => (
  <select
    {...p}
    className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559] bg-white appearance-none ${cls}`}
  >
    {children}
  </select>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ExpenditurePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Table state
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<SortField>("invoiceNumber");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  // Filters
  const [filterDate, setFilterDate] = useState("");
  const [filterInvoiceNo, setFilterInvoiceNo] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterRefNo, setFilterRefNo] = useState("");
  const [filterMethod, setFilterMethod] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExpenditureFormData>(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Add-category quick modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [savingCat, setSavingCat] = useState(false);

  // Lists from backend
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");

  // ── Fetch categories ─────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        const all: Category[] = data.data || [];
        setCategories(all.filter((c) => c.type === "EXPENSE"));
      }
    } catch { }
  }, []);

  // ── Fetch suppliers ──────────────────────────────────────────────────────
  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await fetch("/api/expenditure/suppliers");
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data.suppliers || []);
      }
    } catch { }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
  }, [fetchCategories, fetchSuppliers]);

  // ── Fetch expenditures ───────────────────────────────────────────────────
  const fetchExpenditures = useCallback(async () => {
    try {
      setLoading(true);
      const p = new URLSearchParams();
      p.set("page", String(page));
      p.set("pageSize", String(pageSize));
      p.set("sortField", sortField);
      p.set("sortOrder", sortOrder);
      if (filterDate) p.set("filterDate", filterDate);
      if (filterInvoiceNo) p.set("filterInvoiceNo", filterInvoiceNo);
      if (filterSupplier) p.set("filterSupplier", filterSupplier);
      if (filterCategory) p.set("filterCategory", filterCategory);
      if (filterRefNo) p.set("filterRefNo", filterRefNo);
      if (filterMethod) p.set("filterMethod", filterMethod);

      const res = await fetch(`/api/expenditure?${p.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setExpenditures(data.expenditures || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Error fetching expenditure:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortField, sortOrder, filterDate, filterInvoiceNo,
    filterSupplier, filterCategory, filterRefNo, filterMethod]);

  useEffect(() => {
    const t = setTimeout(fetchExpenditures, 300);
    return () => clearTimeout(t);
  }, [fetchExpenditures]);

  // ── Sort ─────────────────────────────────────────────────────────────────
  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortOrder("asc"); }
    setPage(1);
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortOrder === "asc"
      ? <ArrowUp className="w-3 h-3 text-[#FD7E14]" />
      : <ArrowDown className="w-3 h-3 text-[#FD7E14]" />;
  };

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/expenditure/${id}`, { method: "DELETE" });
    if (res.ok) {
      setExpenditures(p => p.filter(i => i._id !== id));
      setDeleteConfirm(null);
      setTotal(t => t - 1);
      fetchSuppliers();
    }
  };

  const openAdd = async () => {
    // Get next invoice number
    const res = await fetch("/api/expenditure?pageSize=1&sortField=invoiceNumber&sortOrder=desc");
    let nextNum = 1;
    if (res.ok) {
      const data = await res.json();
      if (data.expenditures?.length > 0) nextNum = (data.expenditures[0].invoiceNumber || 0) + 1;
    }
    const f = emptyForm();
    f.invoiceNumber = String(nextNum);
    setEditingId(null);
    setForm(f);
    setSelectedSupplierId("");
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (exp: Expenditure) => {
    setEditingId(exp._id);
    setForm({
      invoiceNumber: String(exp.invoiceNumber || ""),
      invoiceDate: exp.invoiceDate || "",
      category: exp.category || "",
      supplierNickName: exp.supplierNickName || "",
      address: exp.address || "",
      hstNumber: exp.hstNumber || "",
      phone: exp.phone || "",
      email: exp.email || "",
      invoiceItems: exp.invoiceItems?.length ? exp.invoiceItems : [emptyItem()],
      subtotal: String(exp.subtotal ?? "0.00"),
      hstAmount: String(exp.hstAmount ?? "0.00"),
      hstExempted: exp.hstExempted || false,
      amount: String(exp.amount ?? "0.00"),
      paymentRows: exp.paymentRows?.length ? exp.paymentRows : [emptyPaymentRow()],
    });
    // Check if supplier matches an existing supplier
    const matched = suppliers.find(s => s.supplierNickName === exp.supplierNickName);
    setSelectedSupplierId(matched ? matched.supplierNickName : "custom");
    setFormErrors({});
    setShowModal(true);
  };

  // ── Form field handlers ───────────────────────────────────────────────────
  const setField = (name: keyof ExpenditureFormData, value: any) => {
    setForm(p => ({ ...p, [name]: value }));
    if (formErrors[name]) setFormErrors(p => { const u = { ...p }; delete u[name]; return u; });
  };

  // ── Supplier dropdown change ──────────────────────────────────────────────
  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedSupplierId(val);

    if (val === "custom" || val === "") {
      setForm(p => ({
        ...p,
        supplierNickName: "",
        address: "",
        hstNumber: "",
        phone: "",
        email: "",
      }));
    } else {
      const match = suppliers.find(s => s.supplierNickName === val);
      if (match) {
        setForm(p => ({
          ...p,
          supplierNickName: match.supplierNickName,
          address: match.address || "",
          hstNumber: match.hstNumber || "",
          phone: match.phone || "",
          email: match.email || "",
        }));
      }
    }
  };

  // ── Invoice items ─────────────────────────────────────────────────────────
  const addItem = () => setForm(p => ({ ...p, invoiceItems: [...p.invoiceItems, emptyItem()] }));

  const updateItem = (idx: number, key: keyof InvoiceItem, val: string | number) => {
    setForm(p => {
      const items = p.invoiceItems.map((it, i) => {
        if (i !== idx) return it;
        const updated = { ...it, [key]: val };
        // Recalculate amount = price * quantity
        if (key === "price" || key === "quantity") {
          const price = key === "price" ? Number(val) : it.price;
          const qty = key === "quantity" ? Number(val) : it.quantity;
          updated.amount = parseFloat((price * qty).toFixed(2));
          updated.hstAmount = parseFloat((updated.amount * 0.13).toFixed(2));
        }
        return updated;
      });
      // Recalc totals
      const subtotal = items.reduce((s, it) => s + (it.amount || 0), 0);
      const hstAmount = p.hstExempted ? 0 : items.reduce((s, it) => s + (it.hstAmount || 0), 0);
      const amount = subtotal + hstAmount;
      return {
        ...p,
        invoiceItems: items,
        subtotal: subtotal.toFixed(2),
        hstAmount: hstAmount.toFixed(2),
        amount: amount.toFixed(2),
      };
    });
  };

  const removeItem = (idx: number) => {
    setForm(p => {
      const items = p.invoiceItems.filter((_, i) => i !== idx);
      const subtotal = items.reduce((s, it) => s + (it.amount || 0), 0);
      const hstAmount = p.hstExempted ? 0 : items.reduce((s, it) => s + (it.hstAmount || 0), 0);
      return {
        ...p,
        invoiceItems: items,
        subtotal: subtotal.toFixed(2),
        hstAmount: hstAmount.toFixed(2),
        amount: (subtotal + hstAmount).toFixed(2),
      };
    });
  };

  // HST Exempted toggle recalc
  const toggleHstExempted = () => {
    setForm(p => {
      const exempt = !p.hstExempted;
      const subtotal = parseFloat(p.subtotal) || 0;
      const hstAmount = exempt ? 0 : p.invoiceItems.reduce((s, it) => s + (it.hstAmount || 0), 0);
      return {
        ...p,
        hstExempted: exempt,
        hstAmount: hstAmount.toFixed(2),
        amount: (subtotal + hstAmount).toFixed(2),
      };
    });
  };

  // ── Payment rows ──────────────────────────────────────────────────────────
  const addPaymentRow = () => setForm(p => ({ ...p, paymentRows: [...p.paymentRows, emptyPaymentRow()] }));

  const updatePaymentRow = (idx: number, key: keyof PaymentRow, val: string) => {
    setForm(p => ({
      ...p,
      paymentRows: p.paymentRows.map((r, i) => i === idx ? { ...r, [key]: val } : r),
    }));
  };

  // ── Validate & Save ───────────────────────────────────────────────────────
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.invoiceDate) errs.invoiceDate = "Invoice date is required";
    if (!form.supplierNickName.trim()) errs.supplierNickName = "Supplier nickname is required";
    if (!form.category) errs.category = "Category is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        invoiceNumber: parseInt(form.invoiceNumber) || 1,
        invoiceDate: form.invoiceDate,
        category: form.category,
        supplierNickName: form.supplierNickName,
        address: form.address,
        hstNumber: form.hstNumber,
        phone: form.phone,
        email: form.email,
        invoiceItems: form.invoiceItems.filter(it => it.item),
        subtotal: parseFloat(form.subtotal) || 0,
        hstAmount: parseFloat(form.hstAmount) || 0,
        hstExempted: form.hstExempted,
        amount: parseFloat(form.amount) || 0,
        paymentRows: form.paymentRows.filter(r => r.description || r.paymentDate || r.paymentMethod || r.transactionRefNo),
      };
      const url = editingId ? `/api/expenditure/${editingId}` : "/api/expenditure";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        setShowModal(false);
        fetchExpenditures();
        fetchSuppliers();
      } else {
        const d = await res.json();
        setFormErrors({ form: d.error || "Failed to save" });
      }
    } catch {
      setFormErrors({ form: "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  // ── Add category ──────────────────────────────────────────────────────────
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setSavingCat(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim(), type: "EXPENSE" }),
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(p => [...p, data.data]);
        setForm(f => ({ ...f, category: data.data.name }));
        setNewCatName("");
        setShowCatModal(false);
      }
    } catch { }
    finally { setSavingCat(false); }
  };

  // ── Export / Import ───────────────────────────────────────────────────────
  const handleExport = () => {
    const ids = Array.from(selectedIds).join(",");
    window.location.href = ids ? `/api/expenditure/export?ids=${encodeURIComponent(ids)}` : "/api/expenditure/export";
  };
  const toggleAll = () => setSelectedIds(
    expenditures.length > 0 && expenditures.every((expenditure) => selectedIds.has(expenditure._id))
      ? new Set()
      : new Set(expenditures.map((expenditure) => expenditure._id))
  );

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus({ msg: "Importing…", ok: true });
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/expenditure/import", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setImportStatus({ msg: `✓ Imported ${data.imported} record${data.imported !== 1 ? "s" : ""} successfully!`, ok: true });
        fetchExpenditures();
        fetchSuppliers();
      } else {
        setImportStatus({ msg: `Error: ${data.error}`, ok: false });
      }
    } catch { setImportStatus({ msg: "Import failed", ok: false }); }
    setTimeout(() => setImportStatus(null), 5000);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const firstRec = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRec = Math.min(page * pageSize, total);

  // ── Column header helper ─────────────────────────────────────────────────
  const SH = ({ field, label, cls = "" }: { field: SortField; label: string; cls?: string }) => (
    <th className={`px-3 py-3 text-left ${cls}`}>
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 text-xs font-semibold text-[#FD7E14] uppercase tracking-wider cursor-pointer hover:text-[#e06c0a] whitespace-nowrap"
      >
        {label} {sortIcon(field)}
      </button>
    </th>
  );

  const TH = ({ label, cls = "" }: { label: string; cls?: string }) => (
    <th className={`px-3 py-3 text-left text-xs font-semibold text-[#FD7E14] uppercase tracking-wider ${cls}`}>
      {label}
    </th>
  );

  const FI = (value: string, onChange: (v: string) => void, type = "text") => (
    <input
      type={type}
      value={value}
      onChange={e => { onChange(e.target.value); setPage(1); }}
      placeholder="Filter…"
      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FD7E14] focus:border-[#FD7E14]"
    />
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="flex-1 w-full px-4 sm:px-6 py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1B2559]">Expense</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {/* icon-style toolbar from screenshot */}
          <button onClick={() => { }} title="Print / Calendar" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 cursor-pointer">
            <Calendar className="w-4 h-4" />
          </button>
          <button onClick={() => { }} title="Export PDF" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-red-500 cursor-pointer">
            <FileText className="w-4 h-4" />
          </button>
          <button onClick={() => { }} title="Export Word" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-500 cursor-pointer">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 11.5c0 .83-.67 1.5-1.5 1.5H10v-6h3.5c.83 0 1.5.67 1.5 1.5v3zm-3.5-1.5h2v-1.5h-2v1.5z" /></svg>
          </button>
          <button onClick={handleExport} title={selectedIds.size ? `Export ${selectedIds.size} selected records` : "Export all CSV records"} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-green-600 cursor-pointer">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 18l2.5-4-2.5-4h1.8l1.7 2.9 1.7-2.9H15l-2.5 4 2.5 4h-1.8l-1.7-2.9-1.7 2.9H8.5z" /></svg>
          </button>
          <a href="/api/expenditure/import" download title="Download import sample" className="p-2 border border-gray-200 rounded-lg hover:bg-blue-50 text-blue-600 cursor-pointer">
            <Download className="w-4 h-4" />
          </a>
          <button onClick={() => fileInputRef.current?.click()} title="Import CSV" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 cursor-pointer">
            <Upload className="w-4 h-4" />
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0B132B] hover:bg-[#1C2541] text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap">
            <Plus className="w-4 h-4" />Add Expense
          </button>
        </div>
      </div>

      {/* Import status */}
      {importStatus && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium border ${importStatus.ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {importStatus.msg}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-[#2C2C2C] mb-2">Delete Expense Record</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure? This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-3 py-3 w-10"><input type="checkbox" checked={expenditures.length > 0 && expenditures.every((expenditure) => selectedIds.has(expenditure._id))} onChange={toggleAll} aria-label="Select all expense records on this page" className="w-4 h-4 cursor-pointer" /></th>
                <SH field="invoiceDate" label="Dated" />
                <SH field="invoiceNumber" label="Invoice No" />
                <SH field="supplierNickName" label="Head Name" />
                <SH field="category" label="Category" />
                <SH field="amount" label="Amount" />
                <TH label="Remarks" />
                <TH label="Reference No." />
                <TH label="Method" />
                <TH label="Paid" />
                <TH label="Action" cls="w-20" />
              </tr>
              {/* Filter row */}
              <tr className="border-b border-gray-200 bg-white">
                <td className="px-3 py-2" />
                <td className="px-3 py-2">
                  <input type="date" value={filterDate} onChange={e => { setFilterDate(e.target.value); setPage(1); }}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FD7E14]" />
                </td>
                <td className="px-3 py-2">{FI(filterInvoiceNo, setFilterInvoiceNo)}</td>
                <td className="px-3 py-2">{FI(filterSupplier, setFilterSupplier)}</td>
                <td className="px-3 py-2">{FI(filterCategory, setFilterCategory)}</td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2" />
                <td className="px-3 py-2">{FI(filterRefNo, setFilterRefNo)}</td>
                <td className="px-3 py-2">{FI(filterMethod, setFilterMethod)}</td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={11} className="px-3 py-12 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-[#FD7E14] rounded-full animate-spin" />
                    Loading…
                  </div>
                </td></tr>
              ) : expenditures.length === 0 ? (
                <tr><td colSpan={11} className="px-3 py-12 text-center text-gray-400 text-sm">No Data available</td></tr>
              ) : expenditures.map((exp) => {
                const pr = exp.paymentRows?.[0];
                const isPaid = pr?.paymentDate ? "Yes" : "No";

                return (
                  <tr key={exp._id} className={`hover:bg-gray-50/50 transition-colors ${isPaid === "Yes" ? "bg-[#E8F8F0]/40" : ""}`}>
                    <td className="px-3 py-3"><input type="checkbox" checked={selectedIds.has(exp._id)} onChange={() => setSelectedIds((previous) => { const next = new Set(previous); if (next.has(exp._id)) next.delete(exp._id); else next.add(exp._id); return next; })} aria-label={`Select invoice ${exp.invoiceNumber}`} className="w-4 h-4 cursor-pointer" /></td>
                    <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap">{fmtDate(exp.invoiceDate)}</td>
                    <td className="px-3 py-3 text-sm font-medium text-[#1B2559]">{exp.invoiceNumber}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 max-w-[140px] truncate" title={exp.supplierNickName}>{exp.supplierNickName || "-"}</td>
                    <td className="px-3 py-3 text-sm text-gray-700">{exp.category || "-"}</td>
                    <td className="px-3 py-3 text-sm font-medium text-gray-800 whitespace-nowrap">{fmtCurrency(exp.amount)}</td>
                    <td className="px-3 py-3 text-sm text-gray-500 max-w-[140px] truncate" title={pr?.description}>{pr?.description || "-"}</td>
                    <td className="px-3 py-3 text-sm text-gray-700">{pr?.transactionRefNo || "-"}</td>
                    <td className="px-3 py-3 text-sm text-gray-700">{pr?.paymentMethod || "-"}</td>
                    <td className="px-3 py-3 text-sm font-semibold whitespace-nowrap">
                      <span className={isPaid === "Yes" ? "text-green-600" : "text-gray-400"}>{isPaid}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(exp)}
                          className="p-1.5 text-gray-400 hover:text-[#1B2559] hover:bg-gray-100 rounded transition-colors cursor-pointer" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteConfirm(exp._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/40">
          <p className="text-xs text-gray-500">
            Showing {firstRec} to {lastRec} of {total} rows
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
              <ChevronsRight className="w-4 h-4" />
            </button>
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="ml-2 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#FD7E14] bg-white cursor-pointer">
              {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Add/Edit Expense Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-xl">
              <h2 className="text-lg font-bold text-[#2C2C2C]">{editingId ? "Edit Expense" : "Add Expense"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formErrors.form && (
              <div className="mx-6 mt-4 px-4 py-2 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
                {formErrors.form}
              </div>
            )}

            <div className="px-6 py-5 space-y-4">

              {/* Row 1: Invoice #, Invoice Date, Category */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label req>Invoice #</Label>
                  <Field
                    type="number"
                    value={form.invoiceNumber}
                    onChange={e => setField("invoiceNumber", e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label req>Invoice Date</Label>
                  <Field
                    type="date"
                    value={form.invoiceDate}
                    onChange={e => setField("invoiceDate", e.target.value)}
                    cls={formErrors.invoiceDate ? "border-red-400" : ""}
                  />
                  {formErrors.invoiceDate && <p className="text-xs text-red-500 mt-1">{formErrors.invoiceDate}</p>}
                </div>
                <div>
                  <Label req>Category</Label>
                  <div className="flex gap-1.5">
                    <Sel
                      value={form.category}
                      onChange={e => setField("category", e.target.value)}
                      cls={`flex-1 ${formErrors.category ? "border-red-400" : ""}`}
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))}
                    </Sel>
                    <button
                      onClick={() => setShowCatModal(true)}
                      className="flex-shrink-0 w-9 h-[38px] flex items-center justify-center bg-[#1B2559] hover:bg-[#151d47] text-white rounded-lg text-lg font-bold cursor-pointer"
                      title="Add category"
                    >+</button>
                  </div>
                  {formErrors.category && <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>}
                </div>
              </div>

              {/* Row 2: Supplier Dropdown + Supplier Nick Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier</Label>
                  <div className="flex gap-1.5">
                    <Sel
                      value={selectedSupplierId}
                      onChange={handleSupplierChange}
                      cls="flex-1"
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((s) => (
                        <option key={s.supplierNickName} value={s.supplierNickName}>
                          {s.supplierNickName}
                        </option>
                      ))}
                      <option value="custom">New Supplier / Manual</option>
                    </Sel>
                    <button
                      className="flex-shrink-0 w-9 h-[38px] flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
                      title="Edit supplier"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSupplierId("custom");
                        setForm(p => ({
                          ...p,
                          supplierNickName: "",
                          address: "",
                          hstNumber: "",
                          phone: "",
                          email: "",
                        }));
                      }}
                      className="flex-shrink-0 w-9 h-[38px] flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
                      title="Add supplier"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div>
                  <Label req>Supplier Nick Name</Label>
                  <Field
                    value={form.supplierNickName}
                    onChange={e => setField("supplierNickName", e.target.value)}
                    placeholder="Nick Name"
                    cls={formErrors.supplierNickName ? "border-red-400" : ""}
                  />
                  {formErrors.supplierNickName && <p className="text-xs text-red-500 mt-1">{formErrors.supplierNickName}</p>}
                </div>
              </div>

              {/* Row 3: Address, HST #, Phone, Email */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Address</Label>
                  <Field value={form.address} onChange={e => setField("address", e.target.value)} placeholder="Address" />
                </div>
                <div>
                  <Label>HST #</Label>
                  <Field value={form.hstNumber} onChange={e => setField("hstNumber", e.target.value)} placeholder="HST #" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Field value={form.phone} onChange={e => setField("phone", e.target.value)} placeholder="(905) 123-2255" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Field type="email" value={form.email} onChange={e => setField("email", e.target.value)} placeholder="Email" />
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#2C2C2C]">Invoice Items</span>
                  <button
                    onClick={addItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B2559] hover:bg-[#151d47] text-white rounded-lg text-xs font-medium cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />Add Item
                  </button>
                </div>

                {form.invoiceItems.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-gray-600">Item <span className="text-red-500">*</span></th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-600">Price <span className="text-red-500">*</span></th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-600">Quantity</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-600">Amount</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-600">HST Amount <span className="text-red-500">*</span></th>
                          <th className="px-3 py-2 w-8" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {form.invoiceItems.map((it, idx) => (
                          <tr key={idx} className="bg-white">
                            <td className="px-2 py-1.5">
                              <input
                                value={it.item}
                                onChange={e => updateItem(idx, "item", e.target.value)}
                                placeholder="Item"
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#1B2559]"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                value={it.price}
                                onChange={e => updateItem(idx, "price", parseFloat(e.target.value) || 0)}
                                className="w-24 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#1B2559]"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                value={it.quantity}
                                min={1}
                                onChange={e => updateItem(idx, "quantity", parseInt(e.target.value) || 1)}
                                className="w-16 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#1B2559]"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                readOnly
                                value={`$${it.amount.toFixed(2)}`}
                                className="w-24 px-2 py-1.5 border border-gray-100 rounded text-xs bg-gray-50 text-gray-500 cursor-default"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                readOnly
                                value={`$${it.hstAmount.toFixed(2)}`}
                                className="w-24 px-2 py-1.5 border border-gray-100 rounded text-xs bg-gray-50 text-gray-500 cursor-default"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <button onClick={() => removeItem(idx)} className="p-1 text-gray-400 hover:text-red-600 cursor-pointer">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Subtotal / HST / Amount row */}
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <Label req>Subtotal</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <Field
                        readOnly
                        value={form.subtotal}
                        cls="pl-7 bg-gray-50 text-gray-600 cursor-default"
                      />
                    </div>
                  </div>
                  <div>
                    <Label req>HST Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <Field
                        readOnly
                        value={form.hstAmount}
                        cls="pl-7 bg-gray-50 text-gray-600 cursor-default"
                      />
                    </div>
                  </div>
                  <div>
                    <Label req>Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <Field
                        readOnly
                        value={form.amount}
                        cls="pl-7 bg-gray-50 text-gray-600 cursor-default font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* HST Exempted */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="hstExempted"
                    checked={form.hstExempted}
                    onChange={toggleHstExempted}
                    className="w-4 h-4 accent-[#1B2559] cursor-pointer"
                  />
                  <label htmlFor="hstExempted" className="text-sm text-gray-600 cursor-pointer">HST Exempted</label>
                </div>
              </div>

              {/* Payment Rows */}
              <div className="space-y-3">
                {form.paymentRows.map((pr, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-3 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <Label>Description</Label>
                      <Field
                        value={pr.description}
                        onChange={e => updatePaymentRow(idx, "description", e.target.value)}
                        placeholder="Description"
                      />
                    </div>
                    <div>
                      <Label>Payment Date</Label>
                      <Field
                        type="date"
                        value={pr.paymentDate}
                        onChange={e => updatePaymentRow(idx, "paymentDate", e.target.value)}
                        placeholder="Payment Date"
                      />
                    </div>
                    <div>
                      <Label>Payment Method</Label>
                      <Sel
                        value={pr.paymentMethod}
                        onChange={e => updatePaymentRow(idx, "paymentMethod", e.target.value)}
                      >
                        <option value="">Select Payment Method</option>
                        {PAYMENT_METHODS.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </Sel>
                    </div>
                    <div>
                      <Label>Transaction Ref. No.</Label>
                      <Field
                        value={pr.transactionRefNo}
                        onChange={e => updatePaymentRow(idx, "transactionRefNo", e.target.value)}
                        placeholder="Transaction Ref. No."
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add payment row button */}
              <div>
                <button
                  onClick={addPaymentRow}
                  className="w-10 h-10 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#1B2559] rounded-lg text-gray-400 hover:text-[#1B2559] transition-colors cursor-pointer"
                  title="Add payment row"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/40 rounded-b-xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 text-sm font-semibold text-white bg-[#0B132B] hover:bg-[#1C2541] disabled:opacity-60 rounded-lg cursor-pointer transition-colors"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Category Quick Modal ── */}
      {showCatModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#2C2C2C]">Add Category</h3>
              <button onClick={() => setShowCatModal(false)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mb-4">
              <Label req>Category Name</Label>
              <Field
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="e.g. Board Fee"
                onKeyDown={e => e.key === "Enter" && handleAddCategory()}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCatModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer">
                Cancel
              </button>
              <button onClick={handleAddCategory} disabled={savingCat}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#1B2559] hover:bg-[#151d47] disabled:opacity-60 rounded-lg cursor-pointer">
                {savingCat ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
