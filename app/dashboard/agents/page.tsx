"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Upload,
  Download,
  Pencil,
  Trash2,
  User,
  X,
} from "lucide-react";

interface Agent {
  _id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  officeNickName: string;
  tradeName: string;
  dateOfBirth: string | null;
  hst: string;
  sin: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  email: string;
  cellPhone: string;
  homePhone: string;
  website: string;
  agentType: string;
  agentMentor: string;
  payToPrec: boolean;
  precName: string;
  precStreet: string;
  precCity: string;
  precProvince: string;
  precPostalCode: string;
  precHst: string;
  precBusinessNumber: string;
  photo: string;
  recoNumber: string;
  recoLicExpiry: string | null;
  agentCode: string;
  isActive: boolean;
}

type SortField = "firstName" | "cellPhone" | "email" | "precName" | "recoNumber" | "recoLicExpiry" | "agentCode";
type SortOrder = "asc" | "desc";

export default function AgentsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [precAgents, setPrecAgents] = useState(false);
  const [sortField, setSortField] = useState<SortField>("firstName");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Column filters
  const [filterName, setFilterName] = useState("");
  const [filterAddress, setFilterAddress] = useState("");
  const [filterTradeName, setFilterTradeName] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterPrecName, setFilterPrecName] = useState("");
  const [filterReco, setFilterReco] = useState("");
  const [filterRecoExpiry, setFilterRecoExpiry] = useState("");
  const [filterAgentCode, setFilterAgentCode] = useState("");

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("sortField", sortField);
      params.set("sortOrder", sortOrder);
      if (showInactive) params.set("showInactive", "true");
      if (precAgents) params.set("precAgents", "true");
      if (filterName) params.set("filterName", filterName);
      if (filterAddress) params.set("filterAddress", filterAddress);
      if (filterTradeName) params.set("filterTradeName", filterTradeName);
      if (filterPhone) params.set("filterPhone", filterPhone);
      if (filterEmail) params.set("filterEmail", filterEmail);
      if (filterPrecName) params.set("filterPrecName", filterPrecName);
      if (filterReco) params.set("filterReco", filterReco);
      if (filterAgentCode) params.set("filterAgentCode", filterAgentCode);

      const res = await fetch(`/api/agents?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents);
      }
    } catch (err) {
      console.error("Error fetching agents:", err);
    } finally {
      setLoading(false);
    }
  }, [sortField, sortOrder, showInactive, precAgents, filterName, filterAddress, filterTradeName, filterPhone, filterEmail, filterPrecName, filterReco, filterAgentCode]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchAgents();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchAgents]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-[#FD7E14]" /> : <ArrowDown className="w-3 h-3 text-[#FD7E14]" />;
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/agents/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAgents(agents.filter((a) => a._id !== id));
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error("Error deleting agent:", err);
    }
  };

  const handleExport = () => {
    window.location.href = "/api/agents/export";
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus("Importing...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/agents/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setImportStatus(`Imported ${data.imported} agents successfully!`);
        fetchAgents();
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus(`Error: ${data.error}`);
        setTimeout(() => setImportStatus(null), 5000);
      }
    } catch (err) {
      setImportStatus("Import failed");
      setTimeout(() => setImportStatus(null), 3000);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    const day = String(d.getDate()).padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
  };

  const getAddress = (agent: Agent) => {
    const parts = [agent.street, agent.city, agent.province].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "-";
  };

  return (
    <main className="flex-1 w-full px-4 sm:px-6 py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1B2559]">
          Agents
        </h1>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Show Inactive Agents */}
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#FD7E14] focus:ring-[#FD7E14] cursor-pointer"
            />
            Show Inactive Agents
          </label>

          {/* Prec Agents */}
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={precAgents}
              onChange={(e) => setPrecAgents(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#FD7E14] focus:ring-[#FD7E14] cursor-pointer"
            />
            Prec Agents
          </label>

          {/* Export CSV */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Import CSV */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
            title="Import CSV"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />

          {/* Add Agent */}
          <button
            onClick={() => router.push("/dashboard/agents/add")}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1B2559] hover:bg-[#151d47] text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Agent
          </button>
        </div>
      </div>

      {/* Import Status */}
      {importStatus && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          importStatus.startsWith("Error") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"
        }`}>
          {importStatus}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-[#2C2C2C] mb-2">Delete Agent</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this agent? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agents Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                  Photo
                </th>
                <th className="px-3 py-3 text-left">
                  <button onClick={() => handleSort("firstName")} className="flex items-center gap-1 text-xs font-semibold text-[#FD7E14] uppercase tracking-wider cursor-pointer hover:text-[#e06c0a]">
                    Agent Name {getSortIcon("firstName")}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Trade Name
                </th>
                <th className="px-3 py-3 text-left">
                  <button onClick={() => handleSort("cellPhone")} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#FD7E14]">
                    Phone {getSortIcon("cellPhone")}
                  </button>
                </th>
                <th className="px-3 py-3 text-left">
                  <button onClick={() => handleSort("email")} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#FD7E14]">
                    Email {getSortIcon("email")}
                  </button>
                </th>
                <th className="px-3 py-3 text-left">
                  <button onClick={() => handleSort("precName")} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#FD7E14]">
                    PREC Name {getSortIcon("precName")}
                  </button>
                </th>
                <th className="px-3 py-3 text-left">
                  <button onClick={() => handleSort("recoNumber")} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#FD7E14]">
                    RECO # {getSortIcon("recoNumber")}
                  </button>
                </th>
                <th className="px-3 py-3 text-left">
                  <button onClick={() => handleSort("recoLicExpiry")} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#FD7E14]">
                    RECO LIC Expiry {getSortIcon("recoLicExpiry")}
                  </button>
                </th>
                <th className="px-3 py-3 text-left">
                  <button onClick={() => handleSort("agentCode")} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#FD7E14]">
                    Agent Code {getSortIcon("agentCode")}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>

              {/* Filter Row */}
              <tr className="border-b border-gray-200 bg-white">
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    placeholder="Filter..."
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FD7E14] focus:border-[#FD7E14]"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={filterAddress}
                    onChange={(e) => setFilterAddress(e.target.value)}
                    placeholder="Filter..."
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FD7E14] focus:border-[#FD7E14]"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={filterTradeName}
                    onChange={(e) => setFilterTradeName(e.target.value)}
                    placeholder="Filter..."
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FD7E14] focus:border-[#FD7E14]"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={filterPhone}
                    onChange={(e) => setFilterPhone(e.target.value)}
                    placeholder="Filter..."
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FD7E14] focus:border-[#FD7E14]"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={filterEmail}
                    onChange={(e) => setFilterEmail(e.target.value)}
                    placeholder="Filter..."
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FD7E14] focus:border-[#FD7E14]"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={filterPrecName}
                    onChange={(e) => setFilterPrecName(e.target.value)}
                    placeholder="Filter..."
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FD7E14] focus:border-[#FD7E14]"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={filterReco}
                    onChange={(e) => setFilterReco(e.target.value)}
                    placeholder="Filter..."
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FD7E14] focus:border-[#FD7E14]"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={filterRecoExpiry}
                    onChange={(e) => setFilterRecoExpiry(e.target.value)}
                    placeholder="Filter..."
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FD7E14] focus:border-[#FD7E14]"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={filterAgentCode}
                    onChange={(e) => setFilterAgentCode(e.target.value)}
                    placeholder="Filter..."
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FD7E14] focus:border-[#FD7E14]"
                  />
                </td>
                <td className="px-3 py-2"></td>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-3 py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-[#FD7E14] rounded-full animate-spin" />
                      Loading agents...
                    </div>
                  </td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-3 py-12 text-center text-gray-400">
                    No agents found
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr
                    key={agent._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-3 py-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden flex-shrink-0">
                        {agent.photo ? (
                          <img src={agent.photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-medium text-[#2C2C2C] whitespace-nowrap">
                      {agent.firstName} {agent.lastName}
                    </td>
                    <td className="px-3 py-3 text-gray-600 max-w-[200px] truncate">
                      {getAddress(agent)}
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                      {agent.tradeName || "-"}
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                      {agent.cellPhone || "-"}
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                      {agent.email || "-"}
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                      {agent.precName || "-"}
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                      {agent.recoNumber || "-"}
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                      {formatDate(agent.recoLicExpiry)}
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                      {agent.agentCode || "-"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => router.push(`/dashboard/agents/${agent._id}/edit`)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(agent._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
