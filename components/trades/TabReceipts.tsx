"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { ActionBtns, Caret, EmptyRow, FI, FL, FS, Modal, ModalFooter, THead } from "./ui";
import { Deposit, Receipt, mkReceipt } from "./types";

interface Props {
  receipts: Receipt[];
  deposits: Deposit[];
  onChange: (receipts: Receipt[]) => void;
}

export default function TabReceipts({ receipts, deposits, onChange }: Props) {
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<Receipt | null>(null);
  const [form, setForm] = useState<Receipt>(mkReceipt());

  const open = (receipt?: Receipt) => {
    setForm(receipt ? { ...receipt } : mkReceipt());
    setEditing(receipt || null);
    setShow(true);
  };

  const linkDeposit = (depositId: string) => {
    const deposit = deposits.find((item) => item.id === depositId);
    setForm((previous) => ({
      ...previous,
      linkedDepositId: depositId,
      receiptDate: deposit?.depositDate || previous.receiptDate,
      receiptTime: deposit?.depositTime || previous.receiptTime,
      amount: deposit?.depositAmount ?? previous.amount,
      receiptType: deposit ? "Deposit Receipt" : previous.receiptType,
      note: deposit?.purpose || previous.note,
    }));
  };

  const save = () => {
    if (editing) onChange(receipts.map((receipt) => receipt.id === editing.id ? form : receipt));
    else onChange([...receipts, form]);
    setShow(false);
  };

  return (
    <div>
      <div className="mb-4 flex justify-end"><button onClick={() => open()} className="flex items-center gap-1.5 rounded-lg bg-[#1B2559] px-4 py-2 text-sm font-semibold text-white hover:bg-[#151d47] cursor-pointer"><Plus className="h-4 w-4" />Add Receipt</button></div>
      <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <THead cols={["DATE / TIME", "TYPE", "ENTRY", "AMOUNT", "NOTE", "ACTION"]} />
          <tbody className="divide-y divide-gray-100">
            {receipts.length === 0 ? <EmptyRow cols={6} msg="No receipts added" /> : receipts.map((receipt) => (
              <tr key={receipt.id} className="hover:bg-gray-50">
                <td className="px-3 py-2.5 whitespace-nowrap">{receipt.receiptDate || "-"} {receipt.receiptTime || ""}</td>
                <td className="px-3 py-2.5">{receipt.receiptType || "-"}</td>
                <td className="px-3 py-2.5"><span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{receipt.entryMode}</span></td>
                <td className="px-3 py-2.5">${Number(receipt.amount).toFixed(2)}</td>
                <td className="px-3 py-2.5 max-w-[220px] truncate" title={receipt.note}>{receipt.note || "-"}</td>
                <td className="px-3 py-2.5"><ActionBtns onEdit={() => open(receipt)} onDelete={() => onChange(receipts.filter((item) => item.id !== receipt.id))} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {show && (
        <Modal title={editing ? "Edit Receipt" : "Add Receipt"} onClose={() => setShow(false)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><FL>Entry Method</FL><div className="relative"><FS value={form.entryMode} onChange={(event) => setForm((previous) => ({ ...previous, entryMode: event.target.value as Receipt["entryMode"], linkedDepositId: "" }))}><option>Manual</option><option>Linked Deposit</option></FS><Caret /></div></div>
            {form.entryMode === "Linked Deposit" && <div><FL>Link Deposit</FL><div className="relative"><FS value={form.linkedDepositId} onChange={(event) => linkDeposit(event.target.value)}><option value="">Select deposit</option>{deposits.map((deposit) => <option key={deposit.id} value={deposit.id}>{deposit.depositDate || "No date"} — ${Number(deposit.depositAmount).toFixed(2)} — {deposit.depositHolder || "Deposit"}</option>)}</FS><Caret /></div></div>}
            <div><FL>Receipt Date</FL><FI type="date" value={form.receiptDate} onChange={(event) => setForm((previous) => ({ ...previous, receiptDate: event.target.value }))} /></div>
            <div><FL>Receipt Time</FL><FI type="time" value={form.receiptTime} onChange={(event) => setForm((previous) => ({ ...previous, receiptTime: event.target.value }))} /></div>
            <div><FL>Receipt Type</FL><FI value={form.receiptType} onChange={(event) => setForm((previous) => ({ ...previous, receiptType: event.target.value }))} /></div>
            <div><FL>Amount</FL><FI type="number" value={form.amount} onChange={(event) => setForm((previous) => ({ ...previous, amount: Number(event.target.value) || 0 }))} /></div>
            <div className="sm:col-span-2"><FL>Note</FL><textarea value={form.note} onChange={(event) => setForm((previous) => ({ ...previous, note: event.target.value }))} rows={3} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559]" /></div>
          </div>
          <ModalFooter onCancel={() => setShow(false)} onSave={save} />
        </Modal>
      )}
    </div>
  );
}
