"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon } from "lucide-react";

interface AgentFormData {
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
}

const initialFormData: AgentFormData = {
  firstName: "",
  middleName: "",
  lastName: "",
  officeNickName: "",
  tradeName: "",
  dateOfBirth: "",
  hst: "",
  sin: "",
  street: "",
  city: "",
  province: "ONT",
  postalCode: "",
  email: "",
  cellPhone: "",
  homePhone: "",
  website: "",
  agentType: "Agent",
  agentMentor: "",
  payToPrec: false,
  addressIsSameAsAbove: false,
  precName: "",
  precStreet: "",
  precCity: "",
  precProvince: "ONT",
  precPostalCode: "",
  precHst: "",
  precBusinessNumber: "",
  recoNumber: "",
  recoLicExpiry: "",
  agentCode: "",
};

const tabs = [
  "Agent Information",
  "Dates",
  "Banking Information for EFT",
  "Commission Split",
];

export default function AddAgentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Agent Information");
  const [formData, setFormData] = useState<AgentFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => {
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
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First Name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.agentType) newErrors.agentType = "Agent Type is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const payload: any = { ...formData };
      if (payload.dateOfBirth) payload.dateOfBirth = new Date(payload.dateOfBirth).toISOString();
      else payload.dateOfBirth = null;
      if (payload.recoLicExpiry) payload.recoLicExpiry = new Date(payload.recoLicExpiry).toISOString();
      else payload.recoLicExpiry = null;

      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/dashboard/agents");
      } else {
        const data = await res.json();
        setErrors({ form: data.error || "Failed to create agent" });
      }
    } catch (err) {
      setErrors({ form: "Failed to create agent" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex-1 w-full px-4 sm:px-6 py-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1B2559] mb-6">
        Create Agent
      </h1>

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

      {/* Agent Information Tab */}
      {activeTab === "Agent Information" && (
        <div className="flex gap-6">
          <div className="flex-1">
            {/* Row 1: Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name *"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 ${
                    errors.firstName
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-200 focus:ring-[#1B2559] focus:border-[#1B2559]"
                  }`}
                />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  placeholder="Middle Name"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name *"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 ${
                    errors.lastName
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-200 focus:ring-[#1B2559] focus:border-[#1B2559]"
                  }`}
                />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Office Nick Name</label>
                <input
                  type="text"
                  name="officeNickName"
                  value={formData.officeNickName}
                  onChange={handleChange}
                  placeholder="Office nick Name"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                />
              </div>
            </div>

            {/* Row 2: Trade Name, DOB, HST, SIN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Trade Name</label>
                <input
                  type="text"
                  name="tradeName"
                  value={formData.tradeName}
                  onChange={handleChange}
                  placeholder="Trade Name"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Date Of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">HST#</label>
                <input
                  type="text"
                  name="hst"
                  value={formData.hst}
                  onChange={handleChange}
                  placeholder="hst"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Sin#</label>
                <input
                  type="text"
                  name="sin"
                  value={formData.sin}
                  onChange={handleChange}
                  placeholder="Sin#"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                />
              </div>
            </div>

            {/* Row 3: Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Street</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                  placeholder="Postal Code"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                />
              </div>
            </div>

            {/* Row 4: Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email *"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 ${
                    errors.email
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-200 focus:ring-[#1B2559] focus:border-[#1B2559]"
                  }`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Cell Phone</label>
                <input
                  type="text"
                  name="cellPhone"
                  value={formData.cellPhone}
                  onChange={handleChange}
                  placeholder="(905) 123-2255"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Home Phone</label>
                <input
                  type="text"
                  name="homePhone"
                  value={formData.homePhone}
                  onChange={handleChange}
                  placeholder="Home Phone"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Website</label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Website"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                />
              </div>
            </div>

            {/* Row 5: Agent Type + Mentor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                  Agent Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="agentType"
                  value={formData.agentType}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559] bg-white cursor-pointer"
                >
                  <option value="Agent">Agent</option>
                  <option value="Broker">Broker</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Agent Mentor</label>
                <select
                  name="agentMentor"
                  value={formData.agentMentor}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559] bg-white cursor-pointer"
                >
                  <option value="">Select Agent Mentor</option>
                </select>
              </div>
            </div>

            {/* Row 6: Checkboxes */}
            <div className="flex items-center gap-6 mb-5">
              <label className="flex items-center gap-2 text-sm text-[#2C2C2C] cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="payToPrec"
                  checked={formData.payToPrec}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#1B2559] focus:ring-[#1B2559] cursor-pointer"
                />
                Pay to PREC
              </label>
              <label className="flex items-center gap-2 text-sm text-[#2C2C2C] cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="addressIsSameAsAbove"
                  checked={formData.addressIsSameAsAbove}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#1B2559] focus:ring-[#1B2559] cursor-pointer"
                />
                Address is Same as Above
              </label>
            </div>

            {/* Row 7: PREC Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Prec Name</label>
                <input
                  type="text"
                  name="precName"
                  value={formData.precName}
                  onChange={handleChange}
                  placeholder="Prec Name"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Prec Street</label>
                <input
                  type="text"
                  name="precStreet"
                  value={formData.precStreet}
                  onChange={handleChange}
                  placeholder="Prec Street"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Prec City</label>
                <input
                  type="text"
                  name="precCity"
                  value={formData.precCity}
                  onChange={handleChange}
                  placeholder="Prec City"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Prec Province</label>
                <input
                  type="text"
                  name="precProvince"
                  value={formData.precProvince}
                  onChange={handleChange}
                  placeholder="ONT"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Prec Postal Code</label>
                <input
                  type="text"
                  name="precPostalCode"
                  value={formData.precPostalCode}
                  onChange={handleChange}
                  placeholder="Prec Postal Code"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                />
              </div>
            </div>

            {/* Row 8: PREC HST + Business Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Prec HST</label>
                <input
                  type="text"
                  name="precHst"
                  value={formData.precHst}
                  onChange={handleChange}
                  placeholder="Prec HST"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Prec Business Number</label>
                <input
                  type="text"
                  name="precBusinessNumber"
                  value={formData.precBusinessNumber}
                  onChange={handleChange}
                  placeholder="Prec Business Number"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                />
              </div>
            </div>

            {/* Row 9: RECO + Agent Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">RECO #</label>
                <input
                  type="text"
                  name="recoNumber"
                  value={formData.recoNumber}
                  onChange={handleChange}
                  placeholder="RECO #"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">RECO LIC Expiry</label>
                <input
                  type="date"
                  name="recoLicExpiry"
                  value={formData.recoLicExpiry}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">Agent Code</label>
                <input
                  type="text"
                  name="agentCode"
                  value={formData.agentCode}
                  onChange={handleChange}
                  placeholder="Agent Code"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559]"
                />
              </div>
            </div>
          </div>

          {/* Profile Picture */}
          <div className="hidden lg:flex flex-col items-center flex-shrink-0 w-[180px]">
            <label className="text-sm font-medium text-[#2C2C2C] mb-2">Profile Picture</label>
            <div className="w-[160px] h-[160px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              <ImageIcon className="w-12 h-12 text-gray-300" />
            </div>
          </div>
        </div>
      )}

      {/* Other Tabs - Placeholder */}
      {activeTab !== "Agent Information" && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">{activeTab}</p>
          <p className="text-sm mt-1">Coming soon</p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={() => router.push("/dashboard/agents")}
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
