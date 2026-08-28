"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { CalendarDays, Image as ImageIcon, Plus, X } from "lucide-react";
import AgentDocumentsTab, { type AgentDocument } from "@/components/agents/AgentDocumentsTab";

export interface EmployeeRecord {
  _id?: string;
  employeeId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  nickName: string;
  email: string;
  homePhone: string;
  mobile: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  dateOfBirth: string;
  socialInsuranceNo: string;
  photo: string;
  employeeStatus: string;
  employmentStartDate: string;
  employmentEndDate: string;
  workLocation: string;
  department: string;
  jobTitle: string;
  federalClaimCode: string;
  federalTD1ClaimAmount: string;
  provincialClaimCode: string;
  provincialClaimAmount: string;
  cppExempted: boolean;
  cppExemptionReason: string;
  eiExempted: boolean;
  eiExemptionReason: string;
  payType: string;
  payFrequency: string;
  payRate: string;
  hoursPerDay: string;
  vacationPolicy: string;
  vacationRate: string;
  paymentMethod: string;
  bankName: string;
  institutionNo: string;
  transitNo: string;
  accountNo: string;
  isActive: boolean;
  documents: AgentDocument[];
}

const emptyEmployee: EmployeeRecord = {
  employeeId: "", firstName: "", middleName: "", lastName: "", nickName: "", email: "",
  homePhone: "", mobile: "", street: "", city: "", province: "ONT", postalCode: "",
  dateOfBirth: "", socialInsuranceNo: "", photo: "", employeeStatus: "Full Time",
  employmentStartDate: "", employmentEndDate: "", workLocation: "", department: "", jobTitle: "",
  federalClaimCode: "FC01 - 16,452", federalTD1ClaimAmount: "$16,452.00",
  provincialClaimCode: "PC01 - 12,989.00", provincialClaimAmount: "$12,989.00",
  cppExempted: false, cppExemptionReason: "", eiExempted: false, eiExemptionReason: "",
  payType: "", payFrequency: "", payRate: "0", hoursPerDay: "0", vacationPolicy: "",
  vacationRate: "0%", paymentMethod: "", bankName: "", institutionNo: "", transitNo: "",
  accountNo: "", isActive: true, documents: [],
};

const tabs = ["Profile", "Employment Details", "Tax Details", "Pay Type", "Documents"] as const;
type Tab = (typeof tabs)[number];

const departments = ["Accounting", "IT", "Administration", "Admin", "Front Desk", "Sales"];
const inputClass = "h-10 w-full rounded-md border border-[#D6DFEA] bg-white px-3 text-sm text-[#253858] outline-none transition placeholder:text-[#64748B] focus:border-[#FD7E14] focus:ring-1 focus:ring-[#FD7E14]";

function toInputDate(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function Field({ label, required, children, className = "" }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return <label className={className}><span className="mb-1.5 block text-xs font-medium text-[#344054]">{label}{required && <span className="text-red-600">*</span>}</span>{children}</label>;
}

function DateField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <div className="relative"><input type="date" value={value} onChange={(event) => onChange(event.target.value)} aria-label={placeholder} className={`${inputClass} pr-10`} /><CalendarDays className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[#58708F]" /></div>;
}

export default function EmployeeForm({ employeeId }: { employeeId?: string }) {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<EmployeeRecord>(emptyEmployee);
  const [activeTab, setActiveTab] = useState<Tab>("Profile");
  const [loading, setLoading] = useState(Boolean(employeeId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [departmentOptions, setDepartmentOptions] = useState(departments);
  const [showDepartmentAdd, setShowDepartmentAdd] = useState(false);
  const [newDepartment, setNewDepartment] = useState("");

  useEffect(() => {
    if (!employeeId) return;
    let cancelled = false;
    fetch(`/api/employees/${employeeId}`)
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json()).error || "Could not load employee");
        return response.json();
      })
      .then(({ employee }) => {
        if (cancelled) return;
        setForm({
          ...emptyEmployee,
          ...employee,
          _id: String(employee._id),
          dateOfBirth: toInputDate(employee.dateOfBirth),
          employmentStartDate: toInputDate(employee.employmentStartDate),
          employmentEndDate: toInputDate(employee.employmentEndDate),
          documents: employee.documents || [],
        });
        if (employee.department && !departments.includes(employee.department)) {
          setDepartmentOptions((current) => [...current, employee.department]);
        }
      })
      .catch((caught: Error) => setError(caught.message))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [employeeId]);

  const update = <K extends keyof EmployeeRecord>(key: K, value: EmployeeRecord[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const choosePhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Profile picture must be an image."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("Profile picture cannot exceed 2 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => update("photo", String(reader.result));
    reader.readAsDataURL(file);
  };

  const addDepartment = () => {
    const value = newDepartment.trim();
    if (!value) return;
    setDepartmentOptions((current) => current.includes(value) ? current : [...current, value]);
    update("department", value);
    setNewDepartment("");
    setShowDepartmentAdd(false);
  };

  const save = async () => {
    setError("");
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.dateOfBirth) {
      setActiveTab("Profile"); setError("First name, last name, email, and date of birth are required."); return;
    }
    if (!form.employeeStatus || !form.employmentStartDate) {
      setActiveTab("Employment Details"); setError("Employee status and employment start date are required."); return;
    }
    if (!form.payType || !form.payFrequency || !form.paymentMethod) {
      setActiveTab("Pay Type"); setError("Pay type, payment frequency, and payment method are required."); return;
    }
    setSaving(true);
    try {
      const response = await fetch(employeeId ? `/api/employees/${employeeId}` : "/api/employees", {
        method: employeeId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, dateOfBirth: form.dateOfBirth || null, employmentStartDate: form.employmentStartDate || null, employmentEndDate: form.employmentEndDate || null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save employee");
      router.push("/dashboard/employees");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save employee");
    } finally { setSaving(false); }
  };

  const employeeName = [form.firstName, form.lastName].filter(Boolean).join(" ");

  if (loading) return <main className="flex-1 px-4 py-8 text-sm text-[#64748B] sm:px-6">Loading employee...</main>;

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col bg-white px-4 pt-5 sm:px-6">
      <h1 className="text-2xl font-bold text-[#304467] sm:text-3xl">Employee Details{employeeName && <> | {employeeName}</>}</h1>

      <nav className="mt-5 flex gap-0 overflow-x-auto border-b border-[#DCE4ED]" aria-label="Employee details tabs">
        {tabs.map((tab) => <button key={tab} type="button" onClick={() => { setActiveTab(tab); setError(""); }} className={`whitespace-nowrap border-b px-5 py-3 text-sm font-semibold ${activeTab === tab ? "border-[#111827] text-[#111827]" : "border-transparent text-[#70809A] hover:text-[#304467]"}`}>{tab}</button>)}
      </nav>

      {error && <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div>}

      <section className="flex-1 py-5 pb-24">
        {activeTab === "Profile" && <div className="grid gap-x-2 gap-y-4 xl:grid-cols-[repeat(4,minmax(0,1fr))_168px]">
          <Field label="Employee Id"><input value={form.employeeId} disabled placeholder="Employee Id" className={`${inputClass} bg-[#F0F3F7] text-[#98A2B3]`} /></Field>
          <Field label="First Name" required><input value={form.firstName} onChange={(event) => update("firstName", event.target.value)} placeholder="First Name *" className={inputClass} /></Field>
          <Field label="Middle Name"><input value={form.middleName} onChange={(event) => update("middleName", event.target.value)} placeholder="Middle Name" className={inputClass} /></Field>
          <Field label="Last Name" required><input value={form.lastName} onChange={(event) => update("lastName", event.target.value)} placeholder="Last Name *" className={inputClass} /></Field>
          <div className="row-span-4 px-2"><h2 className="mb-5 text-lg font-bold text-[#304467]">Profile Picture</h2><button type="button" onClick={() => photoInputRef.current?.click()} className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-xl bg-[#D1D1D1] text-white hover:ring-2 hover:ring-[#FD7E14]">{form.photo ? <Image src={form.photo} alt="Employee profile" width={144} height={144} unoptimized className="h-full w-full object-cover" /> : <ImageIcon className="h-14 w-14" />}</button><input ref={photoInputRef} type="file" accept="image/*" onChange={(event) => choosePhoto(event.target.files?.[0])} className="hidden" /></div>
          <Field label="Nick Name"><input value={form.nickName} onChange={(event) => update("nickName", event.target.value)} placeholder="Nick Name" className={inputClass} /></Field>
          <Field label="Email" required><input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="Email *" className={inputClass} /></Field>
          <Field label="Home Phone"><input value={form.homePhone} onChange={(event) => update("homePhone", event.target.value)} placeholder="(905) 123-2255" className={inputClass} /></Field>
          <Field label="Mobile"><input value={form.mobile} onChange={(event) => update("mobile", event.target.value)} placeholder="(905) 123-2255" className={inputClass} /></Field>
          <Field label="Street"><input value={form.street} onChange={(event) => update("street", event.target.value)} placeholder="Street" className={inputClass} /></Field>
          <Field label="City"><input value={form.city} onChange={(event) => update("city", event.target.value)} placeholder="City" className={inputClass} /></Field>
          <Field label="Province"><input value={form.province} onChange={(event) => update("province", event.target.value)} placeholder="ONT" className={inputClass} /></Field>
          <Field label="Postal Code"><input value={form.postalCode} onChange={(event) => update("postalCode", event.target.value)} placeholder="Postal Code" className={inputClass} /></Field>
          <Field label="Date Of Birth" required><DateField value={form.dateOfBirth} onChange={(value) => update("dateOfBirth", value)} placeholder="Date Of Birth" /></Field>
          <Field label="Social Insurance No."><input value={form.socialInsuranceNo} onChange={(event) => update("socialInsuranceNo", event.target.value)} placeholder="Social Insurance No." className={inputClass} /></Field>
        </div>}

        {activeTab === "Employment Details" && <div className="grid gap-x-2 gap-y-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Employee Status" required><select value={form.employeeStatus} onChange={(event) => update("employeeStatus", event.target.value)} className={inputClass}><option>Full Time</option><option>Part Time</option><option>Contract</option><option>On Leave</option><option>Terminated</option></select></Field>
          <Field label="Employment Start Date" required><DateField value={form.employmentStartDate} onChange={(value) => update("employmentStartDate", value)} placeholder="Employment Start Date" /></Field>
          <Field label="Employment End Date"><DateField value={form.employmentEndDate} onChange={(value) => update("employmentEndDate", value)} placeholder="Employment End Date" /></Field>
          <Field label="Work Location"><input value={form.workLocation} onChange={(event) => update("workLocation", event.target.value)} placeholder="Work Location" className={inputClass} /></Field>
          <Field label="Department" className="relative"><div className="flex gap-1"><select value={form.department} onChange={(event) => update("department", event.target.value)} className={inputClass}><option value="">Select Department</option>{departmentOptions.map((department) => <option key={department}>{department}</option>)}</select><button type="button" onClick={() => setShowDepartmentAdd((current) => !current)} className="flex h-10 w-11 items-center justify-center rounded-md bg-[#050B20] text-white"><Plus className="h-5 w-5" /></button></div>{showDepartmentAdd && <div className="absolute right-0 top-[64px] z-10 w-56 rounded-md border border-[#D6DFEA] bg-white p-3 shadow-lg"><div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#304467]">New Department<button type="button" onClick={() => setShowDepartmentAdd(false)}><X className="h-4 w-4" /></button></div><input value={newDepartment} onChange={(event) => setNewDepartment(event.target.value)} placeholder="New Department Name" className={inputClass} /><button type="button" onClick={addDepartment} className="mt-2 ml-auto block rounded-md bg-[#050B20] px-3 py-2 text-xs font-semibold text-white">Add</button></div>}</Field>
          <Field label="Job Title"><input value={form.jobTitle} onChange={(event) => update("jobTitle", event.target.value)} placeholder="Job Title" className={inputClass} /></Field>
        </div>}

        {activeTab === "Tax Details" && <div className="space-y-5">
          <div className="grid gap-x-2 gap-y-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Federal Claim Code" required><select value={form.federalClaimCode} onChange={(event) => update("federalClaimCode", event.target.value)} className={inputClass}><option>FC01 - 16,452</option><option>FC02 - 18,000</option><option>Other</option></select></Field>
            <Field label="Federal TD1 Claim Amount" required><input value={form.federalTD1ClaimAmount} onChange={(event) => update("federalTD1ClaimAmount", event.target.value)} className={inputClass} /></Field>
            <Field label="Provincial Claim Code" required><select value={form.provincialClaimCode} onChange={(event) => update("provincialClaimCode", event.target.value)} className={inputClass}><option>PC01 - 12,989.00</option><option>PC02 - 15,000.00</option><option>Other</option></select></Field>
            <Field label="Provincial Claim Amount" required><input value={form.provincialClaimAmount} onChange={(event) => update("provincialClaimAmount", event.target.value)} className={inputClass} /></Field>
          </div>
          <div className="grid max-w-3xl gap-4 md:grid-cols-[126px_1fr]">
            <label className="flex items-center gap-2 pt-7 text-sm text-[#344054]"><input type="checkbox" checked={form.cppExempted} onChange={(event) => update("cppExempted", event.target.checked)} className="h-5 w-5 accent-[#FD7E14]" />CPP Exempted</label>
            <Field label="CPP Exemption Reason" required={form.cppExempted}><select disabled={!form.cppExempted} value={form.cppExemptionReason} onChange={(event) => update("cppExemptionReason", event.target.value)} className={`${inputClass} disabled:bg-[#F0F3F7]`}><option value="">Select CPP Exemption Reason</option><option>Under 18</option><option>Over 70</option><option>Retired & drawing CPP</option></select></Field>
            <label className="flex items-center gap-2 pt-7 text-sm text-[#344054]"><input type="checkbox" checked={form.eiExempted} onChange={(event) => update("eiExempted", event.target.checked)} className="h-5 w-5 accent-[#FD7E14]" />EI Exempted</label>
            <Field label="Exemption Reason" required={form.eiExempted}><input disabled={!form.eiExempted} value={form.eiExemptionReason} onChange={(event) => update("eiExemptionReason", event.target.value)} placeholder="Exemption Reason" className={`${inputClass} disabled:bg-[#F0F3F7]`} /></Field>
          </div>
        </div>}

        {activeTab === "Pay Type" && <div className="space-y-5">
          <div className="grid gap-x-4 gap-y-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Pay type" required><select value={form.payType} onChange={(event) => update("payType", event.target.value)} className={inputClass}><option value="">Select Pay Type</option><option>Salary</option><option>Hourly</option><option>Commission</option></select></Field>
            <Field label="Payment Frequency" required><select value={form.payFrequency} onChange={(event) => update("payFrequency", event.target.value)} className={inputClass}><option value="">Select Payment Frequency</option><option>Weekly</option><option>Bi-Weekly</option><option>Semi-Monthly</option><option>Monthly</option></select></Field>
            <Field label="Hourly/Salary (As per payment frequency)"><input value={form.payRate} onChange={(event) => update("payRate", event.target.value)} placeholder="$0" className={inputClass} /></Field>
            <Field label="Hours (In a day)"><input type="number" min="0" value={form.hoursPerDay} onChange={(event) => update("hoursPerDay", event.target.value)} placeholder="0" className={inputClass} /></Field>
            <Field label="Vacation Pay Rate (%)"><select value={form.vacationPolicy} onChange={(event) => { update("vacationPolicy", event.target.value); update("vacationRate", event.target.value || "0%"); }} className={inputClass}><option value="">Select Vacation Policy</option><option>4%</option><option>6%</option><option>8%</option></select></Field>
            <Field label="Vacation Rate" required><input value={form.vacationRate} onChange={(event) => update("vacationRate", event.target.value)} placeholder="0%" className={inputClass} /></Field>
          </div>
          <p className="text-sm font-bold text-[#344054]">Important: Vacation pay is paid on a “paid as earned” basis with each payroll.</p>
          <div className="max-w-md"><Field label="Payment Method" required><select value={form.paymentMethod} onChange={(event) => update("paymentMethod", event.target.value)} className={inputClass}><option value="">Select Payment Method</option><option>Direct Deposit</option><option>Cheque</option><option>Cash</option></select></Field></div>
          <div className="grid gap-x-2 gap-y-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Bank Name"><input value={form.bankName} onChange={(event) => update("bankName", event.target.value)} placeholder="Bank Name" className={inputClass} /></Field>
            <Field label="Institute No."><input value={form.institutionNo} onChange={(event) => update("institutionNo", event.target.value)} placeholder="Institute No." className={inputClass} /></Field>
            <Field label="Transit No."><input value={form.transitNo} onChange={(event) => update("transitNo", event.target.value)} placeholder="Transit No." className={inputClass} /></Field>
            <Field label="Account No."><input value={form.accountNo} onChange={(event) => update("accountNo", event.target.value)} placeholder="Account No." className={inputClass} /></Field>
          </div>
        </div>}

        {activeTab === "Documents" && <div className="max-w-5xl"><AgentDocumentsTab documents={form.documents} onChange={(documents) => update("documents", documents)} ownerLabel="Employee" /></div>}
      </section>

      <footer className="fixed inset-x-0 bottom-0 z-20 flex justify-end gap-3 border-t border-[#CFD8E3] bg-white px-4 py-4 sm:px-6">
        <button type="button" onClick={() => router.push("/dashboard/employees")} className="h-10 rounded-md border border-[#9AA8BA] px-4 text-sm font-medium text-[#111827]">Cancel</button>
        <button type="button" onClick={save} disabled={saving} className="h-10 rounded-md bg-[#050B20] px-5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
      </footer>
    </main>
  );
}
