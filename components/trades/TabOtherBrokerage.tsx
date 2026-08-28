"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { FL, FI, THead, EmptyRow, ActionBtns, Modal, ModalFooter } from "./ui";
import { BrokerageOption, OtherBrokerage, mkOB } from "./types";

interface Props {
  brokerageOptions: BrokerageOption[];
  otherBrokerages: OtherBrokerage[];
  onChange: (brokerages: OtherBrokerage[]) => void;
  onBrokerageCreated: (brokerage: BrokerageOption) => void;
}

export default function TabOtherBrokerage({ brokerageOptions, otherBrokerages, onChange, onBrokerageCreated }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<OtherBrokerage | null>(null);
  const [creatingMaster, setCreatingMaster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<OtherBrokerage>(mkOB());

  const assignSelected = () => {
    const selected = brokerageOptions.find((brokerage) => brokerage._id === selectedId);
    if (!selected || otherBrokerages.some((brokerage) => brokerage.brokerageName === selected.name)) return;
    onChange([...otherBrokerages, {
      ...mkOB(),
      brokerageName: selected.name,
      phone: selected.phone || "",
      email: selected.email || "",
    }]);
    setSelectedId("");
  };

  const openNew = () => {
    setForm(mkOB());
    setEditing(null);
    setCreatingMaster(true);
    setError("");
    setShow(true);
  };

  const openEdit = (brokerage: OtherBrokerage) => {
    setForm({ ...brokerage });
    setEditing(brokerage);
    setCreatingMaster(false);
    setError("");
    setShow(true);
  };

  const save = async () => {
    if (!form.brokerageName.trim() || !form.phone.trim()) {
      setError("Brokerage name and phone are required.");
      return;
    }
    if (editing) {
      onChange(otherBrokerages.map((brokerage) => brokerage.id === editing.id ? form : brokerage));
      setShow(false);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/other-brokerages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.brokerageName, phone: form.phone, email: form.email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create brokerage");
      onBrokerageCreated(data.brokerage);
      onChange([...otherBrokerages, form]);
      setShow(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to create brokerage");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          className="w-full sm:w-80 px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#1B2559]"
        >
          <option value="">Select an existing brokerage</option>
          {brokerageOptions.map((brokerage) => (
            <option key={brokerage._id} value={brokerage._id}>{brokerage.name} {brokerage.phone ? `— ${brokerage.phone}` : ""}</option>
          ))}
        </select>
        <button onClick={assignSelected} disabled={!selectedId} className="px-4 py-2.5 bg-[#1B2559] hover:bg-[#151d47] text-white rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50">Assign Brokerage</button>
        <button onClick={openNew} className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-[#1B2559] text-[#1B2559] hover:bg-[#1B2559] hover:text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors"><Plus className="w-4 h-4" />New Brokerage</button>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <THead cols={["BROKERAGE NAME", "AGENT NAME", "PHONE", "EMAIL", "PERCENTAGE %", "ACTION"]} />
          <tbody className="divide-y divide-gray-100">
            {otherBrokerages.length === 0 ? <EmptyRow cols={6} msg="No other brokerages assigned" /> : otherBrokerages.map((brokerage) => (
              <tr key={brokerage.id} className="hover:bg-gray-50">
                <td className="px-3 py-2.5">{brokerage.brokerageName}</td>
                <td className="px-3 py-2.5">{brokerage.agentName || "-"}</td>
                <td className="px-3 py-2.5">{brokerage.phone}</td>
                <td className="px-3 py-2.5">{brokerage.email}</td>
                <td className="px-3 py-2.5">{brokerage.percentage}%</td>
                <td className="px-3 py-2.5"><ActionBtns onEdit={() => openEdit(brokerage)} onDelete={() => onChange(otherBrokerages.filter((item) => item.id !== brokerage.id))} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {show && (
        <Modal title={creatingMaster ? "Create and Assign Brokerage" : "Edit Assigned Brokerage"} onClose={() => setShow(false)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><FL req>Brokerage Name</FL><FI value={form.brokerageName} onChange={(event) => setForm((previous) => ({ ...previous, brokerageName: event.target.value }))} /></div>
            <div><FL req>Phone</FL><FI value={form.phone} onChange={(event) => setForm((previous) => ({ ...previous, phone: event.target.value }))} /></div>
            <div><FL>Email</FL><FI type="email" value={form.email} onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))} /></div>
            <div><FL>Agent Name</FL><FI value={form.agentName} onChange={(event) => setForm((previous) => ({ ...previous, agentName: event.target.value }))} /></div>
            <div><FL>Percentage %</FL><FI type="number" value={form.percentage} onChange={(event) => setForm((previous) => ({ ...previous, percentage: Number(event.target.value) || 0 }))} /></div>
          </div>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          <ModalFooter onCancel={() => setShow(false)} onSave={save} saving={saving} />
        </Modal>
      )}
    </div>
  );
}
