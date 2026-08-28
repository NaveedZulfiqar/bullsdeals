"use client";
import React, { useState } from "react";
import { FL, FS, Caret } from "./ui";
import { DOCUMENT_CATEGORIES, PRE_CONSTRUCTION_DOCS } from "./types";

interface Props {
  docCategory: string;
  docNote: string;
  checkedDocs: string[];
  onCategoryChange: (c: string) => void;
  onNoteChange: (n: string) => void;
  onCheckedChange: (docs: string[]) => void;
}

export default function TabDocuments({ docCategory, docNote, checkedDocs, onCategoryChange, onNoteChange, onCheckedChange }: Props) {
  const [subTab, setSubTab] = useState<"Documents" | "Letter and Invoice">("Documents");

  const toggle = (doc: string, checked: boolean) => {
    if (checked) onCheckedChange([...checkedDocs, doc]);
    else onCheckedChange(checkedDocs.filter(d => d !== doc));
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-1 border-b border-gray-200">
        {(["Documents", "Letter and Invoice"] as const).map(t => (
          <button key={t} onClick={() => setSubTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${subTab === t ? "border-[#1B2559] text-[#1B2559]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>{t}</button>
        ))}
      </div>
      {subTab === "Documents" && (
        <>
          <div>
            <FL req>Document Category</FL>
            <div className="relative max-w-xl"><FS value={docCategory} onChange={e => onCategoryChange(e.target.value)}>{DOCUMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</FS><Caret /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5">
            {PRE_CONSTRUCTION_DOCS.map(doc => (
              <label key={doc} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={checkedDocs.includes(doc)} onChange={e => toggle(doc, e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#FD7E14] focus:ring-[#FD7E14] cursor-pointer" />
                {doc}
              </label>
            ))}
          </div>
          <div>
            <FL>Document Note</FL>
            <textarea value={docNote} onChange={e => onNoteChange(e.target.value)} placeholder="Document Note" rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] resize-none" />
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
              <p className="text-sm text-gray-500">Drag &amp; Drop Files here</p>
              <p className="text-xs text-gray-400">or</p>
              <label className="px-4 py-2 bg-[#1B2559] hover:bg-[#151d47] text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">Browse File<input type="file" multiple className="hidden" /></label>
            </div>
          </div>
        </>
      )}
      {subTab === "Letter and Invoice" && (
        <p className="text-sm text-gray-400 py-8 text-center">Letter and Invoice content will appear here after saving the trade.</p>
      )}
    </div>
  );
}
