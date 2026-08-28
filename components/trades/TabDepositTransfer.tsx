"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { ActionBtns, EmptyRow, FI, FL, Modal, ModalFooter, THead } from "./ui";
import { DepositTransfer, mkDepositTransfer } from "./types";

interface Props {
  transfers: DepositTransfer[];
  onChange: (transfers: DepositTransfer[]) => void;
}

export default function TabDepositTransfer({ transfers, onChange }: Props) {
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<DepositTransfer | null>(null);
  const [form, setForm] = useState<DepositTransfer>(mkDepositTransfer());

  const open = (transfer?: DepositTransfer) => {
    setForm(transfer ? { ...transfer } : mkDepositTransfer());
    setEditing(transfer || null);
    setShow(true);
  };

  const save = () => {
    if (editing) onChange(transfers.map((transfer) => transfer.id === editing.id ? form : transfer));
    else onChange([...transfers, form]);
    setShow(false);
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => open()} className="flex items-center gap-1.5 rounded-lg bg-[#1B2559] px-4 py-2 text-sm font-semibold text-white hover:bg-[#151d47] cursor-pointer">
          <Plus className="h-4 w-4" />Add Deposit Transfer
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <THead cols={["DATE / TIME", "FROM", "TO", "AMOUNT", "REFERENCE", "PURPOSE / STORY", "ACTION"]} />
          <tbody className="divide-y divide-gray-100">
            {transfers.length === 0 ? <EmptyRow cols={7} msg="No deposit transfers added" /> : transfers.map((transfer) => (
              <tr key={transfer.id} className="hover:bg-gray-50">
                <td className="px-3 py-2.5 whitespace-nowrap">{transfer.transferDate || "-"} {transfer.depositTime || ""}</td>
                <td className="px-3 py-2.5">{transfer.from || "-"}</td>
                <td className="px-3 py-2.5">{transfer.to || "-"}</td>
                <td className="px-3 py-2.5">${Number(transfer.amount).toFixed(2)}</td>
                <td className="px-3 py-2.5">{transfer.referenceNo || "-"}</td>
                <td className="px-3 py-2.5 max-w-[220px] truncate" title={transfer.purposeStory}>{transfer.purposeStory || "-"}</td>
                <td className="px-3 py-2.5"><ActionBtns onEdit={() => open(transfer)} onDelete={() => onChange(transfers.filter((item) => item.id !== transfer.id))} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {show && (
        <Modal title={editing ? "Edit Deposit Transfer" : "Add Deposit Transfer"} onClose={() => setShow(false)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><FL>Transfer Date</FL><FI type="date" value={form.transferDate} onChange={(event) => setForm((previous) => ({ ...previous, transferDate: event.target.value }))} /></div>
            <div><FL>Deposit Time</FL><FI type="time" value={form.depositTime} onChange={(event) => setForm((previous) => ({ ...previous, depositTime: event.target.value }))} /></div>
            <div><FL>From</FL><FI value={form.from} onChange={(event) => setForm((previous) => ({ ...previous, from: event.target.value }))} placeholder="Transferred from" /></div>
            <div><FL>To</FL><FI value={form.to} onChange={(event) => setForm((previous) => ({ ...previous, to: event.target.value }))} placeholder="Transferred to" /></div>
            <div><FL>Amount</FL><FI type="number" value={form.amount} onChange={(event) => setForm((previous) => ({ ...previous, amount: Number(event.target.value) || 0 }))} /></div>
            <div><FL>Reference Number</FL><FI value={form.referenceNo} onChange={(event) => setForm((previous) => ({ ...previous, referenceNo: event.target.value }))} /></div>
            <div className="sm:col-span-2">
              <FL>Purpose / Story</FL>
              <textarea value={form.purposeStory} onChange={(event) => setForm((previous) => ({ ...previous, purposeStory: event.target.value }))} rows={4} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559]" placeholder="Purpose or transfer story" />
            </div>
          </div>
          <ModalFooter onCancel={() => setShow(false)} onSave={save} />
        </Modal>
      )}
    </div>
  );
}
