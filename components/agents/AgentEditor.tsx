"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Plus, X, Trash2 } from "lucide-react";
import AgentDocumentsTab, { type AgentDocument } from "@/components/agents/AgentDocumentsTab";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BoardRow {
  board: string;
  membershipNo: string;
}

interface Deduction {
  id: string;
  deductionType: string;
  amount: string;
  deductionPercent: string;
  date: string;
  deductionStartDate: string;
  note: string;
  isActive: boolean;
  accountReferenceNo: string;
  payableTo: string;
  isActive2: boolean;
}

interface AgentFormData {
  // Agent Information
  firstName: string;
  middleName: string;
  lastName: string;
  officeNickName: string;
  tradeName: string;
  dateOfBirth: string;
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
  addressIsSameAsAbove: boolean;
  precName: string;
  precStreet: string;
  precCity: string;
  precProvince: string;
  precPostalCode: string;
  precHst: string;
  precBusinessNumber: string;
  recoNumber: string;
  recoLicExpiry: string;
  agentCode: string;
  isActive: boolean;

  // Dates Tab
  startDate: string;
  contractAnniversaryDate: string;
  terminationDate: string;
  recoLicenseNo: string;
  recoLicenseExpiryDate: string;
  boardRows: BoardRow[];

  // Banking Information for EFT
  personalBank: string;
  personalInstituteNo: string;
  personalTransitNo: string;
  personalAccountNo: string;
  precBank: string;
  precInstituteNo: string;
  precTransitNo: string;
  precAccountNo: string;

  // Commission Split
  brokerageSharePercent: string;
  brokerageShareDollar: string;
  perTransactionDollar: string;
  transactionFeeFirstOnly: string;
  commissionFrom: string;
  commissionTo: string;
  afterThatPercent: string;
  afterThatDollar: string;
  maxToBrokerage: string;
  franchiseFeePercent: string;
  franchiseFeeMax: string;
  deskFeeHstPerMonth: string;
  deskFeeStartDate: string;
  deskFeeOption: string;
  commissionNote: string;
  documents: AgentDocument[];
}

const today = new Date().toISOString().split("T")[0];

const tabs = [
  "Agent Information",
  "Dates",
  "Banking Information for EFT",
  "Commission Split",
  "Documents",
  "Other Deduction",
];

const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559] bg-white";
const labelCls = "block text-sm font-medium text-[#2C2C2C] mb-1.5";

// ─── Component ────────────────────────────────────────────────────────────────
export default function AgentEditor({ id, profileMode = false }: { id: string; profileMode?: boolean }) {
  const router = useRouter();
  const returnPath = profileMode ? "/agent/profile" : "/dashboard/agents";
  const [activeTab, setActiveTab] = useState("Agent Information");
  const [formData, setFormData] = useState<AgentFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Other Deduction state
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState<Deduction | null>(null);
  const [deductionForm, setDeductionForm] = useState<Omit<Deduction, "id">>({
    deductionType: "",
    amount: "$0.00",
    deductionPercent: "0.00",
    date: today,
    deductionStartDate: "",
    note: "",
    isActive: true,
    accountReferenceNo: "",
    payableTo: "The Realty Bulls Inc. - General Account",
    isActive2: true,
  });

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const res = await fetch(`/api/agents/${id}`);
        if (res.ok) {
          const data = await res.json();
          const a = data.agent;
          setFormData({
            firstName: a.firstName || "",
            middleName: a.middleName || "",
            lastName: a.lastName || "",
            officeNickName: a.officeNickName || "",
            tradeName: a.tradeName || "",
            dateOfBirth: a.dateOfBirth ? new Date(a.dateOfBirth).toISOString().split("T")[0] : "",
            hst: a.hst || "",
            sin: a.sin || "",
            street: a.street || "",
            city: a.city || "",
            province: a.province || "ONT",
            postalCode: a.postalCode || "",
            email: a.email || "",
            cellPhone: a.cellPhone || "",
            homePhone: a.homePhone || "",
            website: a.website || "",
            agentType: a.agentType || "Agent",
            agentMentor: a.agentMentor || "",
            payToPrec: a.payToPrec || false,
            addressIsSameAsAbove: a.addressIsSameAsAbove || false,
            precName: a.precName || "",
            precStreet: a.precStreet || "",
            precCity: a.precCity || "",
            precProvince: a.precProvince || "ONT",
            precPostalCode: a.precPostalCode || "",
            precHst: a.precHst || "",
            precBusinessNumber: a.precBusinessNumber || "",
            recoNumber: a.recoNumber || "",
            recoLicExpiry: a.recoLicExpiry ? new Date(a.recoLicExpiry).toISOString().split("T")[0] : "",
            agentCode: a.agentCode || "",
            isActive: a.isActive ?? true,

            startDate: a.startDate ? new Date(a.startDate).toISOString().split("T")[0] : "",
            contractAnniversaryDate: a.contractAnniversaryDate ? new Date(a.contractAnniversaryDate).toISOString().split("T")[0] : "",
            terminationDate: a.terminationDate ? new Date(a.terminationDate).toISOString().split("T")[0] : "",
            recoLicenseNo: a.recoLicenseNo || "",
            recoLicenseExpiryDate: a.recoLicenseExpiryDate ? new Date(a.recoLicenseExpiryDate).toISOString().split("T")[0] : "",
            boardRows: a.boardRows || [{ board: "", membershipNo: "" }],

            personalBank: a.personalBank || "",
            personalInstituteNo: a.personalInstituteNo || "",
            personalTransitNo: a.personalTransitNo || "",
            personalAccountNo: a.personalAccountNo || "",
            precBank: a.precBank || "",
            precInstituteNo: a.precInstituteNo || "",
            precTransitNo: a.precTransitNo || "",
            precAccountNo: a.precAccountNo || "",

            brokerageSharePercent: a.brokerageSharePercent || "10.00",
            brokerageShareDollar: a.brokerageShareDollar || "$0.00",
            perTransactionDollar: a.perTransactionDollar || "$0.00",
            transactionFeeFirstOnly: a.transactionFeeFirstOnly || "",
            commissionFrom: a.commissionFrom || "06-May",
            commissionTo: a.commissionTo || "31-Dec",
            afterThatPercent: a.afterThatPercent || "",
            afterThatDollar: a.afterThatDollar || "",
            maxToBrokerage: a.maxToBrokerage || "$0.00",
            franchiseFeePercent: a.franchiseFeePercent || "",
            franchiseFeeMax: a.franchiseFeeMax || "",
            deskFeeHstPerMonth: a.deskFeeHstPerMonth || "$0.00",
            deskFeeStartDate: a.deskFeeStartDate ? new Date(a.deskFeeStartDate).toISOString().split("T")[0] : today,
            deskFeeOption: a.deskFeeOption || "agent_pay",
            commissionNote: a.commissionNote || "",
            documents: (a.documents || []).map((document: any) => ({
              ...document,
              id: document.id || document._id || crypto.randomUUID(),
            })),
          });
          setDeductions((a.deductions || []).map((deduction: any) => ({
            ...deduction,
            id: deduction.id || deduction._id || crypto.randomUUID(),
            date: deduction.date ? new Date(deduction.date).toISOString().split("T")[0] : "",
            deductionStartDate: deduction.deductionStartDate
              ? new Date(deduction.deductionStartDate).toISOString().split("T")[0]
              : "",
          })));
        } else {
          router.push(returnPath);
        }
      } catch (err) {
        console.error("Error fetching agent:", err);
        router.push(returnPath);
      } finally {
        setLoading(false);
      }
    };
    fetchAgent();
  }, [id, router, returnPath]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, [name]: checked };
        if (name === "addressIsSameAsAbove" && checked) {
          updated.precStreet = prev.street;
          updated.precCity = prev.city;
          updated.precProvince = prev.province;
          updated.precPostalCode = prev.postalCode;
        }
        return updated;
      });
    } else {
      setFormData((prev) => prev ? { ...prev, [name]: value } : prev);
    }
    if (errors[name]) setErrors((prev) => { const u = { ...prev }; delete u[name]; return u; });
  };

  // Board rows
  const addBoardRow = () => setFormData(p => p ? ({ ...p, boardRows: [...p.boardRows, { board: "", membershipNo: "" }] }) : p);
  const removeBoardRow = (i: number) => setFormData(p => p ? ({ ...p, boardRows: p.boardRows.filter((_, idx) => idx !== i) }) : p);
  const updateBoardRow = (i: number, key: keyof BoardRow, val: string) =>
    setFormData(p => p ? ({ ...p, boardRows: p.boardRows.map((r, idx) => idx === i ? { ...r, [key]: val } : r) }) : p);

  // Deduction modal
  const openAddDeduction = () => {
    setEditingDeduction(null);
    setDeductionForm({
      deductionType: "", amount: "$0.00", deductionPercent: "0.00",
      date: today, deductionStartDate: "", note: "", isActive: true,
      accountReferenceNo: "", payableTo: "The Realty Bulls Inc. - General Account", isActive2: true,
    });
    setShowDeductionModal(true);
  };

  const saveDeduction = () => {
    if (editingDeduction) {
      setDeductions(d => d.map(x => x.id === editingDeduction.id ? { ...deductionForm, id: x.id } : x));
    } else {
      setDeductions(d => [...d, { ...deductionForm, id: Date.now().toString() }]);
    }
    setShowDeductionModal(false);
  };

  const deleteDeduction = (id: string) => setDeductions(d => d.filter(x => x.id !== id));

  const validate = () => {
    if (!formData) return false;
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First Name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.agentType) newErrors.agentType = "Agent Type is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !formData) return;
    setSaving(true);
    try {
      const payload: any = { ...formData, deductions };
      [
        "dateOfBirth", "recoLicExpiry", "startDate", "contractAnniversaryDate",
        "terminationDate", "recoLicenseExpiryDate", "deskFeeStartDate",
      ].forEach((field) => {
        payload[field] = payload[field] ? new Date(`${payload[field]}T00:00:00.000Z`).toISOString() : null;
      });
      payload.deductions = deductions.map((deduction) => ({
        ...deduction,
        date: deduction.date ? new Date(`${deduction.date}T00:00:00.000Z`).toISOString() : null,
        deductionStartDate: deduction.deductionStartDate
          ? new Date(`${deduction.deductionStartDate}T00:00:00.000Z`).toISOString()
          : null,
      }));

      const res = await fetch(`/api/agents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        router.push(returnPath);
      } else {
        const data = await res.json();
        setErrors({ form: data.error || "Failed to update agent" });
      }
    } catch {
      setErrors({ form: "Failed to update agent" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 w-full px-4 sm:px-6 py-6 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-[#FD7E14] rounded-full animate-spin" />
          Loading agent...
        </div>
      </main>
    );
  }

  if (!formData) return null;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="flex-1 w-full px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1B2559]">{profileMode ? "My Profile" : "Edit Agent"}</h1>
        {!profileMode && <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300 text-[#1B2559] focus:ring-[#1B2559] cursor-pointer"
          />
          Active
        </label>}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeTab === tab
                  ? "border-[#1B2559] text-[#1B2559]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {errors.form && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          {errors.form}
        </div>
      )}

      {/* ── Agent Information Tab ── */}
      {activeTab === "Agent Information" && (
        <div className="flex gap-6">
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div>
                <label className={labelCls}>First Name <span className="text-red-500">*</span></label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name *"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 ${errors.firstName ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-[#1B2559] focus:border-[#1B2559]"}`} />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className={labelCls}>Middle Name</label>
                <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} placeholder="Middle Name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Last Name <span className="text-red-500">*</span></label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name *"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 ${errors.lastName ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-[#1B2559] focus:border-[#1B2559]"}`} />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
              </div>
              <div>
                <label className={labelCls}>Office Nick Name</label>
                <input type="text" name="officeNickName" value={formData.officeNickName} onChange={handleChange} placeholder="Office nick Name" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div><label className={labelCls}>Trade Name</label><input type="text" name="tradeName" value={formData.tradeName} onChange={handleChange} placeholder="Trade Name" className={inputCls} /></div>
              <div><label className={labelCls}>Date Of Birth</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={inputCls} /></div>
              <div><label className={labelCls}>HST#</label><input type="text" name="hst" value={formData.hst} onChange={handleChange} placeholder="hst" className={inputCls} /></div>
              <div><label className={labelCls}>Sin#</label><input type="text" name="sin" value={formData.sin} onChange={handleChange} placeholder="Sin#" className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div><label className={labelCls}>Street</label><input type="text" name="street" value={formData.street} onChange={handleChange} placeholder="Street" className={inputCls} /></div>
              <div><label className={labelCls}>City</label><input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className={inputCls} /></div>
              <div><label className={labelCls}>Province</label><input type="text" name="province" value={formData.province} onChange={handleChange} placeholder="ONT" className={inputCls} /></div>
              <div><label className={labelCls}>Postal Code</label><input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Postal Code" className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div>
                <label className={labelCls}>Email <span className="text-red-500">*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email *"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 ${errors.email ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-[#1B2559] focus:border-[#1B2559]"}`} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div><label className={labelCls}>Cell Phone</label><input type="text" name="cellPhone" value={formData.cellPhone} onChange={handleChange} placeholder="(905) 123-2255" className={inputCls} /></div>
              <div><label className={labelCls}>Home Phone</label><input type="text" name="homePhone" value={formData.homePhone} onChange={handleChange} placeholder="Home Phone" className={inputCls} /></div>
              <div><label className={labelCls}>Website</label><input type="text" name="website" value={formData.website} onChange={handleChange} placeholder="Website" className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div>
                <label className={labelCls}>Agent Type <span className="text-red-500">*</span></label>
                <select name="agentType" value={formData.agentType} onChange={handleChange} className={inputCls}>
                  <option value="Agent">Agent</option>
                  <option value="Broker">Broker</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Agent Mentor</label>
                <select name="agentMentor" value={formData.agentMentor} onChange={handleChange} className={inputCls}>
                  <option value="">Select Agent Mentor</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-6 mb-5">
              <label className="flex items-center gap-2 text-sm text-[#2C2C2C] cursor-pointer select-none">
                <input type="checkbox" name="payToPrec" checked={formData.payToPrec} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-[#1B2559] focus:ring-[#1B2559] cursor-pointer" />
                Pay to PREC
              </label>
              <label className="flex items-center gap-2 text-sm text-[#2C2C2C] cursor-pointer select-none">
                <input type="checkbox" name="addressIsSameAsAbove" checked={formData.addressIsSameAsAbove} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-[#1B2559] focus:ring-[#1B2559] cursor-pointer" />
                Address is Same as Above
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
              <div><label className={labelCls}>Prec Name</label><input type="text" name="precName" value={formData.precName} onChange={handleChange} placeholder="Prec Name" className={inputCls} /></div>
              <div><label className={labelCls}>Prec Street</label><input type="text" name="precStreet" value={formData.precStreet} onChange={handleChange} placeholder="Prec Street" className={inputCls} /></div>
              <div><label className={labelCls}>Prec City</label><input type="text" name="precCity" value={formData.precCity} onChange={handleChange} placeholder="Prec City" className={inputCls} /></div>
              <div><label className={labelCls}>Prec Province</label><input type="text" name="precProvince" value={formData.precProvince} onChange={handleChange} placeholder="ONT" className={inputCls} /></div>
              <div><label className={labelCls}>Prec Postal Code</label><input type="text" name="precPostalCode" value={formData.precPostalCode} onChange={handleChange} placeholder="Prec Postal Code" className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div><label className={labelCls}>Prec HST</label><input type="text" name="precHst" value={formData.precHst} onChange={handleChange} placeholder="Prec HST" className={inputCls} /></div>
              <div><label className={labelCls}>Prec Business Number</label><input type="text" name="precBusinessNumber" value={formData.precBusinessNumber} onChange={handleChange} placeholder="Prec Business Number" className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div><label className={labelCls}>RECO #</label><input type="text" name="recoNumber" value={formData.recoNumber} onChange={handleChange} placeholder="RECO #" className={inputCls} /></div>
              <div><label className={labelCls}>RECO LIC Expiry</label><input type="date" name="recoLicExpiry" value={formData.recoLicExpiry} onChange={handleChange} className={inputCls} /></div>
              <div><label className={labelCls}>Agent Code</label><input type="text" name="agentCode" value={formData.agentCode} onChange={handleChange} placeholder="Agent Code" className={inputCls} /></div>
            </div>
          </div>
          <div className="hidden lg:flex flex-col items-center flex-shrink-0 w-[180px]">
            <label className="text-sm font-medium text-[#2C2C2C] mb-2">Profile Picture</label>
            <div className="w-[160px] h-[160px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              <ImageIcon className="w-12 h-12 text-gray-300" />
            </div>
          </div>
        </div>
      )}

      {/* ── Dates Tab ── */}
      {activeTab === "Dates" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className={labelCls}>Start Date</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Contract Anniversary Date</label>
              <input type="date" name="contractAnniversaryDate" value={formData.contractAnniversaryDate} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Termination Date</label>
              <input type="date" name="terminationDate" value={formData.terminationDate} onChange={handleChange} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Reco License No</label>
              <input type="text" name="recoLicenseNo" value={formData.recoLicenseNo} onChange={handleChange} placeholder="Reco License No" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Reco License Expiry Date</label>
              <input type="date" name="recoLicenseExpiryDate" value={formData.recoLicenseExpiryDate} onChange={handleChange} className={inputCls} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1B2559]">Real Estate Board</h2>
              <button
                onClick={addBoardRow}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1B2559] hover:bg-[#151d47] text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" /> Board Membership
              </button>
            </div>

            {formData.boardRows.length > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 mb-1">
                  <label className="text-sm font-medium text-[#2C2C2C]">Select a Board</label>
                  <label className="text-sm font-medium text-[#2C2C2C]">Board Membership#</label>
                </div>
                {formData.boardRows.map((row, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4 items-center">
                    <input
                      type="text"
                      value={row.board}
                      onChange={e => updateBoardRow(i, "board", e.target.value)}
                      placeholder="Select a board"
                      className={inputCls}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={row.membershipNo}
                        onChange={e => updateBoardRow(i, "membershipNo", e.target.value)}
                        placeholder="Board Membership No"
                        className={inputCls}
                      />
                      <button
                        onClick={() => removeBoardRow(i)}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Banking Information for EFT Tab ── */}
      {activeTab === "Banking Information for EFT" && (
        <div className="space-y-8">
          <div>
            <h2 className="text-base font-bold text-[#1B2559] mb-4">Personal:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div><label className={labelCls}>Bank</label><input type="text" name="personalBank" value={formData.personalBank} onChange={handleChange} placeholder="Bank" className={inputCls} /></div>
              <div><label className={labelCls}>Institute #</label><input type="text" name="personalInstituteNo" value={formData.personalInstituteNo} onChange={handleChange} placeholder="Institute #" className={inputCls} /></div>
              <div><label className={labelCls}>Transit #</label><input type="text" name="personalTransitNo" value={formData.personalTransitNo} onChange={handleChange} placeholder="Transit #" className={inputCls} /></div>
              <div><label className={labelCls}>Account #</label><input type="text" name="personalAccountNo" value={formData.personalAccountNo} onChange={handleChange} placeholder="Account #" className={inputCls} /></div>
            </div>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1B2559] mb-4">Prec:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div><label className={labelCls}>Bank</label><input type="text" name="precBank" value={formData.precBank} onChange={handleChange} placeholder="Bank" className={inputCls} /></div>
              <div><label className={labelCls}>Institute #</label><input type="text" name="precInstituteNo" value={formData.precInstituteNo} onChange={handleChange} placeholder="Institute #" className={inputCls} /></div>
              <div><label className={labelCls}>Transit #</label><input type="text" name="precTransitNo" value={formData.precTransitNo} onChange={handleChange} placeholder="Transit #" className={inputCls} /></div>
              <div><label className={labelCls}>Account #</label><input type="text" name="precAccountNo" value={formData.precAccountNo} onChange={handleChange} placeholder="Account #" className={inputCls} /></div>
            </div>
          </div>
        </div>
      )}

      {/* ── Commission Split Tab ── */}
      {activeTab === "Commission Split" && (
        <div className="space-y-5 max-w-4xl">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-44">
              <label className={labelCls}>Brokerage Share % <span className="text-red-500">*</span></label>
              <input type="text" name="brokerageSharePercent" value={formData.brokerageSharePercent} onChange={handleChange} className={inputCls} />
            </div>
            <span className="text-sm text-gray-500 mt-5">or</span>
            <div className="w-44">
              <label className={labelCls}>Brokerage Share $</label>
              <input type="text" name="brokerageShareDollar" value={formData.brokerageShareDollar} onChange={handleChange} className={inputCls} />
            </div>
          </div>

          <div className="flex items-end gap-4 flex-wrap">
            <div className="w-32">
              <label className={labelCls}>Per transaction $</label>
              <input type="text" name="perTransactionDollar" value={formData.perTransactionDollar} onChange={handleChange} className={inputCls} />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className={labelCls}>Transaction fee for only first Transactions.</label>
              <input type="text" name="transactionFeeFirstOnly" value={formData.transactionFeeFirstOnly} onChange={handleChange} placeholder="Transaction" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>From</label>
              <input type="text" name="commissionFrom" value={formData.commissionFrom} onChange={handleChange} className={inputCls} style={{ width: "100px" }} />
            </div>
            <div>
              <label className={labelCls}>To</label>
              <input type="text" name="commissionTo" value={formData.commissionTo} onChange={handleChange} className={inputCls} style={{ width: "100px" }} />
            </div>
            <div>
              <label className={labelCls}>after that only</label>
              <input type="text" name="afterThatPercent" value={formData.afterThatPercent} onChange={handleChange} placeholder="Percent" className={inputCls} style={{ width: "100px" }} />
            </div>
            <span className="text-sm text-gray-500 mb-2.5">or</span>
            <div>
              <label className={labelCls}>&nbsp;</label>
              <input type="text" name="afterThatDollar" value={formData.afterThatDollar} onChange={handleChange} placeholder="Transaction Amount Aftr" className={inputCls} style={{ width: "160px" }} />
            </div>
          </div>

          <div className="w-44">
            <label className={labelCls}>Max to Brokerage (in a calendar year)</label>
            <input type="text" name="maxToBrokerage" value={formData.maxToBrokerage} onChange={handleChange} className={inputCls} />
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="w-44">
              <label className={labelCls}>Franchise Fee %</label>
              <input type="text" name="franchiseFeePercent" value={formData.franchiseFeePercent} onChange={handleChange} placeholder="Franchise Fee %" className={inputCls} />
            </div>
            <div className="w-44">
              <label className={labelCls}>Franchise Fee Max $</label>
              <input type="text" name="franchiseFeeMax" value={formData.franchiseFeeMax} onChange={handleChange} placeholder="Franchise Fee Max $" className={inputCls} />
            </div>
          </div>

          <div className="w-44">
            <label className={labelCls}>Desk Fee plus HST per month</label>
            <input type="text" name="deskFeeHstPerMonth" value={formData.deskFeeHstPerMonth} onChange={handleChange} className={inputCls} />
          </div>
          <div className="w-44">
            <label className={labelCls}>Desk Fee Start date</label>
            <input type="date" name="deskFeeStartDate" value={formData.deskFeeStartDate} onChange={handleChange} className={inputCls} />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="deskFeeOption"
                value="deducted"
                checked={formData.deskFeeOption === "deducted"}
                onChange={handleChange}
                className="w-4 h-4 text-[#1B2559] focus:ring-[#1B2559] cursor-pointer"
              />
              Desk fee is to be deducted from commission{" "}
              <span className="text-[#1B2559] font-medium cursor-pointer hover:underline">View Deducted</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="deskFeeOption"
                value="agent_pay"
                checked={formData.deskFeeOption === "agent_pay"}
                onChange={handleChange}
                className="w-4 h-4 text-[#1B2559] focus:ring-[#1B2559] cursor-pointer"
              />
              Agent will pay per month, via EFT/Chequa (Add to Monthly Collection)
            </label>
          </div>

          <div>
            <label className={labelCls}>Note</label>
            <textarea
              name="commissionNote"
              value={formData.commissionNote}
              onChange={handleChange}
              placeholder="Note"
              rows={4}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559] resize-none"
            />
          </div>
        </div>
      )}

      {/* ── Other Deduction Tab ── */}
      {activeTab === "Other Deduction" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#1B2559]">Agent Other Deductions</h2>
            <button
              onClick={openAddDeduction}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1B2559] hover:bg-[#151d47] text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors"
            >
              Add Deduction
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dated</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Deduction %</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deductions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">No deductions added yet</td>
                  </tr>
                ) : deductions.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700">{d.deductionType || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{d.date || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{d.amount}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{d.deductionPercent}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {d.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingDeduction(d);
                            setDeductionForm({ deductionType: d.deductionType, amount: d.amount, deductionPercent: d.deductionPercent, date: d.date, deductionStartDate: d.deductionStartDate, note: d.note, isActive: d.isActive, accountReferenceNo: d.accountReferenceNo, payableTo: d.payableTo, isActive2: d.isActive2 });
                            setShowDeductionModal(true);
                          }}
                          className="text-xs px-2 py-1 text-gray-500 hover:text-[#1B2559] hover:bg-gray-100 rounded cursor-pointer"
                        >
                          Edit
                        </button>
                        <button onClick={() => deleteDeduction(d.id)} className="text-xs px-2 py-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer">
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
      )}

      {activeTab === "Documents" && (
        <AgentDocumentsTab
          documents={formData.documents}
          onChange={(documents) => setFormData((previous) => previous ? ({ ...previous, documents }) : previous)}
        />
      )}

      {/* ── Add Deduction Modal ── */}
      {showDeductionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#2C2C2C]">{editingDeduction ? "Edit Deduction" : "Add Deduction"}</h3>
              <button onClick={() => setShowDeductionModal(false)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Deduction Type <span className="text-red-500">*</span></label>
                  <select value={deductionForm.deductionType} onChange={e => setDeductionForm(p => ({ ...p, deductionType: e.target.value }))} className={inputCls}>
                    <option value="">Select Type</option>
                    <option value="Commission Advance">Commission Advance</option>
                    <option value="Desk Fee">Desk Fee</option>
                    <option value="Board Fee">Board Fee</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Amount <span className="text-red-500">*</span></label>
                  <input type="text" value={deductionForm.amount} onChange={e => setDeductionForm(p => ({ ...p, amount: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Deduction % (per transaction) <span className="text-red-500">*</span></label>
                  <input type="text" value={deductionForm.deductionPercent} onChange={e => setDeductionForm(p => ({ ...p, deductionPercent: e.target.value }))} className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Date <span className="text-red-500">*</span></label>
                  <input type="date" value={deductionForm.date} onChange={e => setDeductionForm(p => ({ ...p, date: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Deduction Start Date <span className="text-red-500">*</span></label>
                  <input type="date" value={deductionForm.deductionStartDate} onChange={e => setDeductionForm(p => ({ ...p, deductionStartDate: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Note</label>
                  <textarea value={deductionForm.note} onChange={e => setDeductionForm(p => ({ ...p, note: e.target.value }))} placeholder="Note" rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] resize-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-start">
                <div className="flex items-center gap-2 pt-7">
                  <input type="checkbox" id="editDeductionIsActive" checked={deductionForm.isActive} onChange={e => setDeductionForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 accent-[#1B2559] cursor-pointer" />
                  <label htmlFor="editDeductionIsActive" className="text-sm text-[#2C2C2C] cursor-pointer">Is Active</label>
                </div>
                <div>
                  <label className={labelCls}>Account Reference No.</label>
                  <input type="text" value={deductionForm.accountReferenceNo} onChange={e => setDeductionForm(p => ({ ...p, accountReferenceNo: e.target.value }))} placeholder="Account Reference No." className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Payable To <span className="text-red-500">*</span></label>
                  <div className="flex gap-1.5">
                    <select value={deductionForm.payableTo} onChange={e => setDeductionForm(p => ({ ...p, payableTo: e.target.value }))} className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] bg-white appearance-none">
                      <option value="The Realty Bulls Inc. - General Account">The Realty Bulls Inc. - General Account</option>
                      <option value="Other">Other</option>
                    </select>
                    <button className="flex-shrink-0 w-9 h-[42px] flex items-center justify-center bg-[#1B2559] hover:bg-[#151d47] text-white rounded-lg font-bold cursor-pointer">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <button className="w-10 h-10 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#1B2559] rounded-lg text-gray-400 hover:text-[#1B2559] transition-colors cursor-pointer">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/40 rounded-b-xl">
              <button onClick={() => setShowDeductionModal(false)} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg cursor-pointer">Cancel</button>
              <button onClick={saveDeduction} className="px-6 py-2 text-sm font-semibold text-white bg-[#1B2559] hover:bg-[#151d47] rounded-lg cursor-pointer">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={() => router.push(returnPath)}
          className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-[#1B2559] hover:bg-[#151d47] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </main>
  );
}
