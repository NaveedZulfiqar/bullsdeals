"use client";
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { FL, FI, FS, Caret, THead, EmptyRow, ActionBtns, Modal, ModalFooter } from "./ui";
import { Seller, Buyer, mkSeller } from "./types";

interface Props {
  sellers: Seller[];
  buyers: Buyer[];
  sellerNote: string;
  onSellersChange: (s: Seller[]) => void;
  onNoteChange: (n: string) => void;
}

export default function TabSeller({ sellers, buyers, sellerNote, onSellersChange, onNoteChange }: Props) {
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<Seller | null>(null);
  const [form, setForm] = useState<Seller>(mkSeller());

  const open = (s?: Seller) => { setForm(s ? { ...s } : mkSeller()); setEditing(s ?? null); setShow(true); };
  const save = () => {
    if (!form.name.trim()) return;
    editing ? onSellersChange(sellers.map(x => x.id === editing.id ? form : x)) : onSellersChange([...sellers, form]);
    setShow(false);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => open()} className="flex items-center gap-1.5 px-4 py-2 bg-[#1B2559] hover:bg-[#151d47] text-white rounded-lg text-sm font-semibold cursor-pointer"><Plus className="w-4 h-4" />Add Seller</button>
      </div>
      <h3 className="text-sm font-semibold text-[#1B2559] mb-2">Seller</h3>
      <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <THead cols={["SELLER","PHONE","EMAIL","STREET","CITY","PROVINCE","POSTAL CODE","ACTION"]} />
          <tbody className="divide-y divide-gray-100">
            {sellers.length === 0 ? <EmptyRow cols={8} msg="No sellers added" /> : sellers.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-3 py-2.5">{s.name}</td><td className="px-3 py-2.5">{s.phone}</td><td className="px-3 py-2.5">{s.email}</td>
                <td className="px-3 py-2.5">{s.street}</td><td className="px-3 py-2.5">{s.city}</td><td className="px-3 py-2.5">{s.province}</td><td className="px-3 py-2.5">{s.postalCode}</td>
                <td className="px-3 py-2.5"><ActionBtns onEdit={() => open(s)} onDelete={() => onSellersChange(sellers.filter(x => x.id !== s.id))} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3 mb-2"><label className="text-sm font-medium text-[#2C2C2C]">Note</label></div>
      <textarea value={sellerNote} onChange={e => onNoteChange(e.target.value)} placeholder="Note" rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] resize-none" />
      {show && (
        <Modal title="Add Seller" onClose={() => setShow(false)}>
          <div className="grid grid-cols-2 gap-4">
            <div><FL>Same address as</FL><div className="relative"><FS value={form.sameAddressAs} onChange={e => setForm(p => ({ ...p, sameAddressAs: e.target.value }))}><option value="">Same address as</option>{buyers.map(b => <option key={b.id} value={b.id}>Buyer - {b.name}</option>)}</FS><Caret /></div></div>
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
