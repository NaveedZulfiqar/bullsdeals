"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Upload,
  Download,
  Trash2,
  X,
} from "lucide-react";

interface Brokerage {
  _id: string;
  name: string;
  phone: string;
  email: string;
  hst: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  bankName: string;
  instituteNumber: string;
  transitNumber: string;
  accountNumber: string;
}

interface BrokerageFormData {
  name: string;
  phone: string;
  email: string;
  hst: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  bankName: string;
  instituteNumber: string;
  transitNumber: string;
  accountNumber: string;
}

const emptyForm: BrokerageFormData = {
  name: "",
  phone: "",
  email: "",
  hst: "",
  street: "",
  city: "",
  province: "ONT",
  postalCode: "",
  bankName: "",
  instituteNumber: "",
  transitNumber: "",
  accountNumber: "",
};

type SortField = "name" | "phone" | "email" | "street" | "city" | "province" | "postalCode";
type SortOrder = "asc" | "desc";

export default function OtherBrokeragePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [brokerages, setBrokerages] = useState<Brokerage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BrokerageFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Column filters
  const [filterName, setFilterName] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterStreet, setFilterStreet] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterProvince, setFilterProvince] = useState("");
  const [filterPostalCode, setFilterPostalCode] = useState("");

  const fetchBrokerages = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("sortField", sortField);
      params.set("sortOrder", sortOrder);
      if (filterName) params.set("filterName", filterName);
      if (filterPhone) params.set("filterPhone", filterPhone);
      if (filterEmail) params.set("filterEmail", filterEmail);
      if (filterStreet) params.set("filterStreet", filterStreet);
      if (filterCity) params.set("filterCity", filterCity);
      if (filterProvince) params.set("filterProvince", filterProvince);
      if (filterPostalCode) params.set("filterPostalCode", filterPostalCode);

      const res = await fetch(`/api/other-brokerages?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBrokerages(data.brokerages);
      }
    } catch (err) {
      console.error("Error fetching brokerages:", err);
    } finally {
      setLoading(false);
    }
  }, [sortField, sortOrder, filterName, filterPhone, filterEmail, filterStreet, filterCity, filterProvince, filterPostalCode]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchBrokerages();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchBrokerages]);

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
      const res = await fetch(`/api/other-brokerages/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBrokerages(brokerages.filter((b) => b._id !== id));
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error("Error deleting brokerage:", err);
    }
  };

  const handleExport = () => {
    window.location.href = "/api/other-brokerages/export";
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus("Importing...");
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/other-brokerages/import", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setImportStatus(`Imported ${data.imported} brokerages successfully!`);
        fetchBrokerages();
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus(`Error: ${data.error}`);
        setTimeout(() => setImportStatus(null), 5000);
      }
    } catch {
      setImportStatus("Import failed");
      setTimeout(() => setImportStatus(null), 3000);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Modal handlers
  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (b: Brokerage) => {
    setEditingId(b._id);
    setFormData({
      name: b.name,
      phone: b.phone,
      email: b.email || "",
      hst: b.hst || "",
      street: b.street || "",
      city: b.city || "",
      province: b.province || "ONT",
      postalCode: b.postalCode || "",
      bankName: b.bankName || "",
      instituteNumber: b.instituteNumber || "",
      transitNumber: b.transitNumber || "",
      accountNumber: b.accountNumber || "",
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const u = { ...prev };
        delete u[name];
        return u;
      });
    }
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.phone.trim()) errs.phone = "Phone is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const url = editingId
        ? `/api/other-brokerages/${editingId}`
        : "/api/other-brokerages";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchBrokerages();
      } else {
        const data = await res.json();
        setFormErrors({ form: data.error || "Failed to save" });
      }
    } catch {
      setFormErrors({ form: "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex-1 w-full px-4 sm:px-6 py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1B2559]">
          Other Brokerage
        </h1>

        <div className="flex items-center gap-3 flex-wrap">
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

          {/* Add Other Brokerage */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1B2559] hover:bg-[#151d47] text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Other Brokerage
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
            <h3 className="text-lg font-bold text-[#2C2C2C] mb-2">Delete Brokerage</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this brokerage? This action cannot be undone.</p>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[780px] mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-xl font-bold text-[#2C2C2C]">
                {editingId ? "Edit Other Brokerage" : "Add Other Brokerage"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formErrors.form && (
              <div className="mx-6 mb-3 px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
                {formErrors.form}
              </div>
            )}

            <div className="px-6 pb-6 space-y-4">
              {/* Row 1: Name, Phone, Email, HST */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Name"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 ${
                      formErrors.name ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-[#1B2559] focus:border-[#1B2559]"
                    }`}
                  />
                  {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="(999) 123-4455"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 ${
                      formErrors.phone ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-[#1B2559] focus:border-[#1B2559]"
                    }`}
                  />
                  {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Email</label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="Email"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">HST#</label>
                  <input
                    type="text"
                    name="hst"
                    value={formData.hst}
                    onChange={handleFormChange}
                    placeholder="HST#"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                  />
                </div>
              </div>

              {/* Row 2: Street, City, Province, Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Street</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleFormChange}
                    placeholder="Street"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    placeholder="City"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Province</label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleFormChange}
                    placeholder="ONT"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleFormChange}
                    placeholder="Postal Code"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                  />
                </div>
              </div>

              {/* Row 3: Bank Name, Institute #, Transit #, Account # */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleFormChange}
                    placeholder="Bank Name"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Institute #</label>
                  <input
                    type="text"
                    name="instituteNumber"
                    value={formData.instituteNumber}
                    onChange={handleFormChange}
                    placeholder="Institute #"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Transit #</label>
                  <input
                    type="text"
                    name="transitNumber"
                    value={formData.transitNumber}
                    onChange={handleFormChange}
                    placeholder="Transit #"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Account #</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleFormChange}
                    placeholder="Account #"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1B2559] hover:bg-[#151d47] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
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
                <th className="px-3 py-3 text-left">
                  <button onClick={() => handleSort("name")} className="flex items-center gap-1 text-xs font-semibold text-[#FD7E14] uppercase tracking-wider cursor-pointer hover:text-[#e06c0a]">
                    Brokerage Name {getSortIcon("name")}
                  </button>
                </th>
                <th className="px-3 py-3 text-left">
                  <button onClick={() => handleSort("phone")} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#FD7E14]">
                    Phone {getSortIcon("phone")}
                  </button>
                </th>
                <th className="px-3 py-3 text-left">
                  <button onClick={() => handleSort("email")} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#FD7E14]">
                    Email {getSortIcon("email")}
                  </button>
                </th>
                <th className="px-3 py-3 text-left">
                  <button onClick={() => handleSort("street")} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#FD7E14]">
                    Street {getSortIcon("street")}
                  </button>
                </th>
                <th className="px-3 py-3 text-left">
                  <button onClick={() => handleSort("city")} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#FD7E14]">
                    City {getSortIcon("city")}
                  </button>
                </th>
                <th className="px-3 py-3 text-left">
                  <button onClick={() => handleSort("province")} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#FD7E14]">
                    Province {getSortIcon("province")}
                  </button>
                </th>
                <th className="px-3 py-3 text-left">
                  <button onClick={() => handleSort("postalCode")} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#FD7E14]">
                    Postal Code {getSortIcon("postalCode")}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                  Action
                </th>
              </tr>

              {/* Filter Row */}
              <tr className="border-b border-gray-200 bg-white">
                <td className="px-3 py-2">
                  <input type="text" value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="Filter..." className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FD7E14] focus:border-[#FD7E14]" />
                </td>
                <td className="px-3 py-2">
                  <input type="text" value={filterPhone} onChange={(e) => setFilterPhone(e.target.value)} placeholder="Filter..." className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FD7E14] focus:border-[#FD7E14]" />
                </td>
                <td className="px-3 py-2">
                  <input type="text" value={filterEmail} onChange={(e) => setFilterEmail(e.target.value)} placeholder="Filter..." className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FD7E14] focus:border-[#FD7E14]" />
                </td>
                <td className="px-3 py-2">
                  <input type="text" value={filterStreet} onChange={(e) => setFilterStreet(e.target.value)} placeholder="Filter..." className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FD7E14] focus:border-[#FD7E14]" />
                </td>
                <td className="px-3 py-2">
                  <input type="text" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} placeholder="Filter..." className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FD7E14] focus:border-[#FD7E14]" />
                </td>
                <td className="px-3 py-2">
                  <input type="text" value={filterProvince} onChange={(e) => setFilterProvince(e.target.value)} placeholder="Filter..." className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FD7E14] focus:border-[#FD7E14]" />
                </td>
                <td className="px-3 py-2">
                  <input type="text" value={filterPostalCode} onChange={(e) => setFilterPostalCode(e.target.value)} placeholder="Filter..." className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FD7E14] focus:border-[#FD7E14]" />
                </td>
                <td className="px-3 py-2"></td>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-[#FD7E14] rounded-full animate-spin" />
                      Loading brokerages...
                    </div>
                  </td>
                </tr>
              ) : brokerages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-12 text-center text-gray-400">
                    No brokerages found
                  </td>
                </tr>
              ) : (
                brokerages.map((b) => (
                  <tr
                    key={b._id}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => openEditModal(b)}
                  >
                    <td className="px-3 py-3 font-medium text-[#2C2C2C] whitespace-nowrap max-w-[250px] truncate">
                      {b.name}
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                      {b.phone || "-"}
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap max-w-[200px] truncate">
                      {b.email || "-"}
                    </td>
                    <td className="px-3 py-3 text-gray-600 max-w-[200px] truncate">
                      {b.street || "-"}
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                      {b.city || "-"}
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                      {b.province || "-"}
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                      {b.postalCode || "-"}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(b._id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
