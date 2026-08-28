"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown, ArrowUp, ArrowDown,
  Plus, Pencil, Trash2, Download, Upload,
} from "lucide-react";

interface TradeAgent { agentId?: string; agentName: string; photo?: string; }

interface Trade {
  _id: string; tradeNumber: number; mlsNumber: string; agreementStatus: string;
  tradeType: string; tradeCategory: string; ourRole: string; other: string;
  apsPrice: number; street: string; city: string; province: string; postalCode: string;
  tradeStatus: string; agents: TradeAgent[]; completionDate: string | null;
  pendingCommission: number; pendingDisbursement: number;
}

type SortField = "tradeNumber" | "agreementStatus" | "tradeType" | "tradeCategory" | "ourRole" | "apsPrice" | "street" | "tradeStatus" | "completionDate" | "pendingCommission" | "pendingDisbursement";
type SortOrder = "asc" | "desc";
type TradeTab = "Open" | "Closed";

export default function TradesPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [tradeTab, setTradeTab] = useState<TradeTab>("Open");
  const [sortField, setSortField] = useState<SortField>("tradeNumber");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  const [filterTradeNumber, setFilterTradeNumber] = useState("");
  const [filterAgreementStatus, setFilterAgreementStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterWeAre, setFilterWeAre] = useState("");
  const [filterAddress, setFilterAddress] = useState("");
  const [filterTradeStatus, setFilterTradeStatus] = useState("");
  const [filterAgents, setFilterAgents] = useState("");

  const fetchTrades = useCallback(async () => {
    try {
      setLoading(true);
      const p = new URLSearchParams();
      p.set("sortField", sortField); p.set("sortOrder", sortOrder);
      p.set("status", tradeTab);
      if (filterTradeNumber) p.set("filterTradeNumber", filterTradeNumber);
      if (filterAgreementStatus) p.set("filterAgreementStatus", filterAgreementStatus);
      if (filterType) p.set("filterType", filterType);
      if (filterCategory) p.set("filterCategory", filterCategory);
      if (filterWeAre) p.set("filterWeAre", filterWeAre);
      if (filterAddress) p.set("filterAddress", filterAddress);
      if (filterTradeStatus) p.set("filterTradeStatus", filterTradeStatus);
      if (filterAgents) p.set("filterAgents", filterAgents);
      const res = await fetch(`/api/trades?${p.toString()}`);
      if (res.ok) setTrades((await res.json()).trades);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [sortField, sortOrder, tradeTab, filterTradeNumber, filterAgreementStatus,
    filterType, filterCategory, filterWeAre, filterAddress, filterTradeStatus, filterAgents]);

  useEffect(() => { const t = setTimeout(fetchTrades, 300); return () => clearTimeout(t); }, [fetchTrades]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortOrder("asc"); }
  };
  const sortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-[#FD7E14]" /> : <ArrowDown className="w-3 h-3 text-[#FD7E14]" />;
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/trades/${id}`, { method: "DELETE" });
    if (res.ok) { setTrades(p => p.filter(t => t._id !== id)); setDeleteConfirm(null); }
  };

  const handleExport = () => {
    const ids = Array.from(selectedIds).join(",");
    const p = new URLSearchParams({ status: tradeTab });
    if (ids) p.set("ids", ids);
    window.location.href = `/api/trades/export?${p.toString()}`;
  };
  const switchTradeTab = (tab: TradeTab) => {
    setTradeTab(tab);
    setSelectedIds(new Set());
  };
  const toggleAll = () => setSelectedIds(
    trades.length > 0 && trades.every((trade) => selectedIds.has(trade._id))
      ? new Set()
      : new Set(trades.map((trade) => trade._id))
  );

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus({ msg: "Importing…", ok: true });
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await fetch("/api/trades/import", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setImportStatus({ msg: `✓ Imported ${data.imported} trade${data.imported !== 1 ? "s" : ""} successfully!`, ok: true });
        fetchTrades();
      } else {
        setImportStatus({ msg: `Error: ${data.error}`, ok: false });
      }
    } catch { setImportStatus({ msg: "Import failed", ok: false }); }
    setTimeout(() => setImportStatus(null), 5000);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fmtDate = (d: string | null) => {
    if (!d) return "-";
    const dt = new Date(d); if (isNaN(dt.getTime())) return "-";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${String(dt.getDate()).padStart(2, "0")}-${months[dt.getMonth()]}-${dt.getFullYear()}`;
  };
  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2 }).format(n || 0);
  const getAddress = (t: Trade) => [t.street, t.city, t.province].filter(Boolean).join(", ") || "-";
  const getAgents = (a: TradeAgent[]) => a?.length ? a.map(x => x.agentName).filter(Boolean).join(", ") || "-" : "-";
  const getWeAre = (t: Trade) => t.ourRole === "Other" ? (t.other || t.ourRole || "-") : (t.ourRole || "-");

  const SH = ({ field, label, cls = "" }: { field: SortField; label: string; cls?: string }) => (
    <th className={`px-3 py-3 text-left ${cls}`}>
      <button onClick={() => handleSort(field)} className="flex items-center gap-1 text-xs font-semibold text-[#FD7E14] uppercase tracking-wider cursor-pointer hover:text-[#e06c0a]">
        {label} {sortIcon(field)}
      </button>
    </th>
  );

  const filterInput = (value: string, onChange: (v: string) => void) => (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder="Filter…"
      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FD7E14] focus:border-[#FD7E14]" />
  );

  return (
    <main className="flex-1 w-full px-4 sm:px-6 py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1B2559]">Trades</h1>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Export */}
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
            title="Export CSV">
            <Download className="w-4 h-4" /><span className="hidden sm:inline">{selectedIds.size ? `Export (${selectedIds.size})` : "Export All"}</span>
          </button>

          {/* Import */}
          <a href="/api/trades/import" download
            className="flex items-center gap-1.5 px-3 py-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
            title="Download import sample">
            <Download className="w-4 h-4" /><span className="hidden sm:inline">Sample</span>
          </a>
          <button onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
            title="Import CSV">
            <Upload className="w-4 h-4" /><span className="hidden sm:inline">Import</span>
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />

          {/* Add */}
          <button onClick={() => router.push("/dashboard/trades/add")}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1B2559] hover:bg-[#151d47] text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />Add Trade
          </button>
        </div>
      </div>

      {/* Import status banner */}
      {importStatus && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium border ${importStatus.ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {importStatus.msg}
        </div>
      )}

      {/* Open and closed trade views */}
      <div className="mb-4 inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm" role="tablist" aria-label="Trade status">
        {(["Open", "Closed"] as TradeTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={tradeTab === tab}
            onClick={() => switchTradeTab(tab)}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors cursor-pointer ${
              tradeTab === tab
                ? "bg-[#1B2559] text-white"
                : "text-gray-600 hover:bg-orange-50 hover:text-[#FD7E14]"
            }`}
          >
            {tab} Trades
          </button>
        ))}
      </div>

      {/* Delete modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-[#2C2C2C] mb-2">Delete Trade</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this trade? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer">Delete</button>
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
                <th className="px-3 py-3 w-10"><input type="checkbox" checked={trades.length > 0 && trades.every((trade) => selectedIds.has(trade._id))} onChange={toggleAll} aria-label="Select all trades" className="w-4 h-4 cursor-pointer" /></th>
                <SH field="tradeNumber" label="Trade #" />
                <SH field="agreementStatus" label="Agreement Status" />
                <SH field="tradeType" label="Type" />
                <SH field="tradeCategory" label="Category" />
                <SH field="ourRole" label="We Are" />
                <SH field="apsPrice" label="APS Price" />
                <SH field="street" label="Address" />
                <SH field="tradeStatus" label="Trade Status" />
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#FD7E14] uppercase tracking-wider min-w-[140px]">Agents</th>
                <SH field="completionDate" label="Completion D..." />
                <SH field="pendingCommission" label="Pending Comm." />
                <SH field="pendingDisbursement" label="Pending Disbursement" />
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Actions</th>
              </tr>
              {/* Filter row */}
              <tr className="border-b border-gray-200 bg-white">
                <td className="px-3 py-2" />
                <td className="px-3 py-2">{filterInput(filterTradeNumber, setFilterTradeNumber)}</td>
                <td className="px-3 py-2">{filterInput(filterAgreementStatus, setFilterAgreementStatus)}</td>
                <td className="px-3 py-2">{filterInput(filterType, setFilterType)}</td>
                <td className="px-3 py-2">{filterInput(filterCategory, setFilterCategory)}</td>
                <td className="px-3 py-2">{filterInput(filterWeAre, setFilterWeAre)}</td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2">{filterInput(filterAddress, setFilterAddress)}</td>
                <td className="px-3 py-2">{filterInput(filterTradeStatus, setFilterTradeStatus)}</td>
                <td className="px-3 py-2">{filterInput(filterAgents, setFilterAgents)}</td>
                <td className="px-3 py-2" /><td className="px-3 py-2" /><td className="px-3 py-2" /><td className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={14} className="px-3 py-12 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-[#FD7E14] rounded-full animate-spin" />
                    Loading trades…
                  </div>
                </td></tr>
              ) : trades.length === 0 ? (
                <tr><td colSpan={14} className="px-3 py-12 text-center text-gray-400">No trades found</td></tr>
              ) : trades.map(trade => (
                <tr key={trade._id} onClick={() => router.push(`/dashboard/trades/${trade._id}/edit`)}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                  <td className="px-3 py-3" onClick={event => event.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.has(trade._id)} onChange={() => setSelectedIds((previous) => { const next = new Set(previous); if (next.has(trade._id)) next.delete(trade._id); else next.add(trade._id); return next; })} aria-label={`Select trade ${trade.tradeNumber}`} className="w-4 h-4 cursor-pointer" />
                  </td>
                  <td className="px-3 py-3 text-sm font-medium text-[#1B2559]">{trade.tradeNumber}</td>
                  <td className="px-3 py-3 text-sm text-gray-700">{trade.agreementStatus || "-"}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 max-w-[160px] truncate" title={trade.tradeType}>{trade.tradeType || "-"}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 max-w-[160px] truncate" title={trade.tradeCategory}>{trade.tradeCategory || "-"}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 max-w-[140px] truncate" title={getWeAre(trade)}>{getWeAre(trade)}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap">{fmtCurrency(trade.apsPrice)}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 max-w-[200px] truncate" title={getAddress(trade)}>{getAddress(trade)}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${trade.tradeStatus === "Open" ? "bg-green-100 text-green-700" : trade.tradeStatus === "Closed" ? "bg-gray-100 text-gray-600" : "bg-yellow-100 text-yellow-700"}`}>
                      {trade.tradeStatus || "Open"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-700 max-w-[160px] truncate" title={getAgents(trade.agents)}>{getAgents(trade.agents)}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap">{fmtDate(trade.completionDate)}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap">{fmtCurrency(trade.pendingCommission)}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap">{trade.pendingDisbursement?.toFixed(2) ?? "0.00"}</td>
                  <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button onClick={() => router.push(`/dashboard/trades/${trade._id}/edit`)}
                        className="p-1.5 text-gray-400 hover:text-[#1B2559] hover:bg-gray-100 rounded transition-colors cursor-pointer" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(trade._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
