"use client";
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { FL, FI, FS, Caret, THead, EmptyRow, ActionBtns, Modal, ModalFooter } from "./ui";
import { Deposit, Buyer, Seller, mkDeposit, DEPOSIT_METHODS } from "./types";

interface Props {
  deposits: Deposit[];
  buyers: Buyer[];
  sellers: Seller[];
  onChange: (deps: Deposit[]) => void;
}

export default function TabDeposit({ deposits, buyers, sellers, onChange }: Props) {
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<Deposit | null>(null);
  const [form, setForm] = useState<Deposit>(mkDeposit());

  const open = (d?: Deposit) => { setForm(d ? { ...d } : mkDeposit()); setEditing(d ?? null); setShow(true); };
  const save = () => {
    if (editing) onChange(deposits.map(x => x.id === editing.id ? form : x));
    else onChange([...deposits, form]);
    setShow(false);
  };
  const holderOpts = [
    ...buyers.map(b => ({ val: `Buyer - ${b.name}`, label: `Buyer - ${b.name}` })),
    ...sellers.map(s => ({ val: `Seller - ${s.name}`, label: `Seller - ${s.name}` })),
    { val: "Tenant", label: "Tenant" },
    { val: "Our Company", label: "Our Company" },
    { val: "Other", label: "Other" },
  ];

  return (
    <div>
      <div className="flex justify-end gap-3 mb-4">
        <button onClick={() => open()} className="flex items-center gap-1.5 px-4 py-2 bg-[#1B2559] hover:bg-[#151d47] text-white rounded-lg text-sm font-semibold cursor-pointer"><Plus className="w-4 h-4" />Add Deposit</button>
      </div>
      <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <THead cols={["DEPOSIT HOLDER","HOLDING FOR","DATE / TIME","PROPERTY","PURPOSE","METHOD","AMOUNT","ACTION"]} />
          <tbody className="divide-y divide-gray-100">
            {deposits.length === 0 ? <EmptyRow cols={8} msg="No deposits added" /> : deposits.map(d => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-3 py-2.5">{d.depositHolder}</td><td className="px-3 py-2.5">{d.holdingFor}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">{d.depositDate || "-"} {d.depositTime || ""}</td>
                <td className="px-3 py-2.5 max-w-[180px] truncate" title={d.propertyAddress}>{d.propertyAddress || "-"}</td>
                <td className="px-3 py-2.5 max-w-[160px] truncate" title={d.purpose}>{d.purpose || "-"}</td>
                <td className="px-3 py-2.5">{d.depositMethod}</td>
                <td className="px-3 py-2.5">${Number(d.depositAmount).toFixed(2)}</td>
                <td className="px-3 py-2.5"><ActionBtns onEdit={() => open(d)} onDelete={() => onChange(deposits.filter(x => x.id !== d.id))} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {show && (
        <Modal title="Add Deposit" onClose={() => setShow(false)}>
          <div className="grid grid-cols-2 gap-4">
            <div><FL req>Deposit Holder</FL><div className="relative"><FS value={form.depositHolder} onChange={e => setForm(p => ({ ...p, depositHolder: e.target.value }))}><option value="">Select Deposit Holder</option>{holderOpts.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}</FS><Caret /></div></div>
            <div><FL req>Holding For</FL><div className="relative"><FS value={form.holdingFor} onChange={e => setForm(p => ({ ...p, holdingFor: e.target.value }))}><option value="">Select Holding For</option>{holderOpts.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}</FS><Caret /></div></div>
            {form.depositHolder === "Other" && <div><FL>Deposit Holder Other</FL><FI value={form.depositHolderOther} onChange={e => setForm(p => ({ ...p, depositHolderOther: e.target.value }))} placeholder="Other" /></div>}
            {form.holdingFor === "Other" && <div><FL>Holding For Other</FL><FI value={form.holdingForOther} onChange={e => setForm(p => ({ ...p, holdingForOther: e.target.value }))} placeholder="Other" /></div>}
            <div><FL req>Deposit Date</FL><FI type="date" value={form.depositDate} onChange={e => setForm(p => ({ ...p, depositDate: e.target.value }))} /></div>
            <div><FL>Deposit Time</FL><FI type="time" value={form.depositTime} onChange={e => setForm(p => ({ ...p, depositTime: e.target.value }))} /></div>
            <div><FL>Property Address</FL><FI value={form.propertyAddress} onChange={e => setForm(p => ({ ...p, propertyAddress: e.target.value }))} placeholder="Property Address" /></div>
            <div><FL>MLS Number (Optional)</FL><FI value={form.mlsNumber} onChange={e => setForm(p => ({ ...p, mlsNumber: e.target.value }))} placeholder="MLS Number" /></div>
            <div className="col-span-2"><FL>Purpose</FL><FI value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} placeholder="Purpose" /></div>
            <div><FL req>Deposit Method</FL><div className="relative"><FS value={form.depositMethod} onChange={e => setForm(p => ({ ...p, depositMethod: e.target.value }))}>{DEPOSIT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}</FS><Caret /></div></div>
            <div><FL>Deposit Ref. No</FL><FI value={form.depositRefNo} onChange={e => setForm(p => ({ ...p, depositRefNo: e.target.value }))} placeholder="Deposit Ref. No" /></div>
            <div><FL req>Deposit Amount $</FL><FI type="number" value={form.depositAmount} onChange={e => setForm(p => ({ ...p, depositAmount: parseFloat(e.target.value) || 0 }))} placeholder="$0.00" /></div>
            <div><FL>Deposit Amount in Words</FL><FI value={form.depositAmountInWords} onChange={e => setForm(p => ({ ...p, depositAmountInWords: e.target.value }))} placeholder="Deposit Amount in Words" /></div>
            <div><FL>Other Deposit</FL><FI value={form.otherDeposit} onChange={e => setForm(p => ({ ...p, otherDeposit: e.target.value }))} placeholder="Other Deposit" /></div>
            <div><FL>Received From</FL><FI value={form.receivedFrom} onChange={e => setForm(p => ({ ...p, receivedFrom: e.target.value }))} placeholder="Received From" /></div>
            <div><FL>Received By</FL><FI value={form.receivedBy} onChange={e => setForm(p => ({ ...p, receivedBy: e.target.value }))} placeholder="Received By" /></div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="payInt" checked={form.payingInterestOnDeposit} onChange={e => setForm(p => ({ ...p, payingInterestOnDeposit: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 cursor-pointer" />
              <label htmlFor="payInt" className="text-sm text-gray-600 cursor-pointer">We are Paying interest on Deposit.</label>
            </div>
          </div>
          <ModalFooter onCancel={() => setShow(false)} onSave={save} />
        </Modal>
      )}
    </div>
  );
}
