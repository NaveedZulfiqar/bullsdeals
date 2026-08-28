"use client";
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { FL, FI, FS, Caret, THead, EmptyRow, ActionBtns, Modal, ModalFooter } from "./ui";
import { Buyer, Seller, mkBuyer } from "./types";

interface Props {
  buyers: Buyer[];
  sellers: Seller[];
  buyerNote: string;
  onBuyersChange: (b: Buyer[]) => void;
  onNoteChange: (n: string) => void;
}

export default function TabBuyer({ buyers, sellers, buyerNote, onBuyersChange, onNoteChange }: Props) {
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<Buyer | null>(null);
  const [form, setForm] = useState<Buyer>(mkBuyer());

  const open = (b?: Buyer) => { setForm(b ? { ...b } : mkBuyer()); setEditing(b ?? null); setShow(true); };
  const save = () => {
    if (!form.name.trim()) return;
    editing ? onBuyersChange(buyers.map(x => x.id === editing.id ? form : x)) : onBuyersChange([...buyers, form]);
    setShow(false);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => open()} className="flex items-center gap-1.5 px-4 py-2 bg-[#1B2559] hover:bg-[#151d47] text-white rounded-lg text-sm font-semibold cursor-pointer"><Plus className="w-4 h-4" />Add Buyer</button>
      </div>
      <h3 className="text-sm font-semibold text-[#1B2559] mb-2">Buyer</h3>
      <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <THead cols={["BUYER","PHONE","EMAIL","STREET","CITY","PROVINCE","POSTAL CODE","ACTION"]} />
          <tbody className="divide-y divide-gray-100">
            {buyers.length === 0 ? <EmptyRow cols={8} msg="No buyers added" /> : buyers.map(b => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-3 py-2.5">{b.name}</td><td className="px-3 py-2.5">{b.phone}</td><td className="px-3 py-2.5">{b.email}</td>
                <td className="px-3 py-2.5">{b.street}</td><td className="px-3 py-2.5">{b.city}</td><td className="px-3 py-2.5">{b.province}</td><td className="px-3 py-2.5">{b.postalCode}</td>
                <td className="px-3 py-2.5"><ActionBtns onEdit={() => open(b)} onDelete={() => onBuyersChange(buyers.filter(x => x.id !== b.id))} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3 mb-2"><label className="text-sm font-medium text-[#2C2C2C]">Note</label></div>
      <textarea value={buyerNote} onChange={e => onNoteChange(e.target.value)} placeholder="Note" rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] resize-none" />
      {show && (
        <Modal title="Add Buyer" onClose={() => setShow(false)}>
          <div className="grid grid-cols-2 gap-4">
            <div><FL>Same address as</FL><div className="relative"><FS value={form.sameAddressAs} onChange={e => setForm(p => ({ ...p, sameAddressAs: e.target.value }))}><option value="">Same address as</option>{sellers.map(s => <option key={s.id} value={s.id}>Seller - {s.name}</option>)}</FS><Caret /></div></div>
            <div><FL req>Name</FL><FI value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Name" /></div>
            <div><FL>Phone</FL><FI value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="(905) 123-2255" /></div>
            <div><FL>Email</FL><FI type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" /></div>
            <div><FL>Street</FL><FI value={form.street} onChange={e => setForm(p => ({ ...p, street: e.target.value }))} placeholder="Street" /></div>
            <div><FL>City</FL><FI value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="City" /></div>
            <div><FL>Province</FL><FI value={form.province} onChange={e => setForm(p => ({ ...p, province: e.target.value }))} placeholder="ONT" /></div>
            <div><FL>Postal Code</FL><FI value={form.postalCode} onChange={e => setForm(p => ({ ...p, postalCode: e.target.value }))} placeholder="Postal Code" /></div>
          </div>
          <ModalFooter onCancel={() => setShow(false)} onSave={save} />
        </Modal>
      )}
    </div>
  );
}
