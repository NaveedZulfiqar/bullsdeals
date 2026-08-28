"use client";
import React from "react";
import { ChevronDown } from "lucide-react";

export const FL = ({ children, req }: { children: React.ReactNode; req?: boolean }) => (
  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
    {children}{req && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

export const FI = ({ cls = "", ...p }: React.InputHTMLAttributes<HTMLInputElement> & { cls?: string }) => (
  <input {...p} className={`w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] focus:border-[#1B2559] bg-white ${cls}`} />
);

export const FS = ({ cls = "", children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement> & { cls?: string; children: React.ReactNode }) => (
  <select {...p} className={`w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] bg-white appearance-none ${cls}`}>{children}</select>
);

export const Caret = () => <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />;

export const THead = ({ cols }: { cols: string[] }) => (
  <thead>
    <tr className="bg-[#1B2559]/5 border-b border-gray-100">
      {cols.map(h => <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-[#FD7E14] uppercase tracking-wider">{h}</th>)}
    </tr>
  </thead>
);

export const EmptyRow = ({ cols, msg }: { cols: number; msg: string }) => (
  <tr><td colSpan={cols} className="px-3 py-6 text-center text-sm text-gray-400">{msg}</td></tr>
);

export const ActionBtns = ({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) => (
  <div className="flex gap-2">
    <button onClick={onEdit} className="p-1 text-gray-400 hover:text-[#1B2559] cursor-pointer"><span className="text-base leading-none">✎</span></button>
    <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-600 cursor-pointer">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
    </button>
  </div>
);

export const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold text-[#2C2C2C]">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      {children}
    </div>
  </div>
);

export const ModalFooter = ({ onCancel, onSave, saving = false }: { onCancel: () => void; onSave: () => void; saving?: boolean }) => (
  <div className="flex justify-end gap-3 mt-4">
    <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer">Cancel</button>
    <button onClick={onSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-[#1B2559] hover:bg-[#151d47] rounded-lg cursor-pointer disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
  </div>
);
