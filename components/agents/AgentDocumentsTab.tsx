"use client";

import React, { useRef, useState } from "react";
import { FileText, Trash2, Upload } from "lucide-react";

export interface AgentDocument {
  id: string;
  name: string;
  category: string;
  note: string;
  fileName: string;
  mimeType: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
}

interface Props {
  documents: AgentDocument[];
  onChange: (documents: AgentDocument[]) => void;
  ownerLabel?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_TOTAL_SIZE = 10 * 1024 * 1024;

export default function AgentDocumentsTab({ documents, onChange, ownerLabel = "Agent" }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState("License");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");

    const validFiles = Array.from(files).filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} is larger than 5 MB.`);
        return false;
      }
      return true;
    });

    const currentSize = documents.reduce((total, document) => total + document.size, 0);
    const addedSize = validFiles.reduce((total, file) => total + file.size, 0);
    if (currentSize + addedSize > MAX_TOTAL_SIZE) {
      setError(`${ownerLabel} documents cannot exceed 10 MB in total.`);
      return;
    }

    const added = await Promise.all(validFiles.map(async (file): Promise<AgentDocument> => ({
      id: crypto.randomUUID(),
      name: file.name,
      category,
      note,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      dataUrl: await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      }),
      uploadedAt: new Date().toISOString(),
    })));

    onChange([...documents, ...added]);
    setNote("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#2C2C2C]">Document Category</label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#1B2559] focus:outline-none focus:ring-1 focus:ring-[#1B2559]"
          >
            <option>License</option>
            <option>Agreement</option>
            <option>Identification</option>
            <option>Banking</option>
            <option>Tax</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#2C2C2C]">Note</label>
          <input
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional note for selected files"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#1B2559] focus:outline-none focus:ring-1 focus:ring-[#1B2559]"
          />
        </div>
      </div>

      <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
        <Upload className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-3 text-sm text-gray-500">Upload {ownerLabel.toLowerCase()} documents up to 5 MB each</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 rounded-lg bg-[#1B2559] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#FD7E14] cursor-pointer"
        >
          Browse Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(event) => addFiles(event.target.files)}
          className="hidden"
        />
        {error && <p className="mt-3 text-xs font-medium text-red-600">{error}</p>}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100">
        <div className="grid grid-cols-[1fr_140px_100px_48px] gap-3 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <span>Document</span><span>Category</span><span>Size</span><span />
        </div>
        {documents.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-gray-400">No documents added</p>
        ) : documents.map((document) => (
          <div key={document.id} className="grid grid-cols-[1fr_140px_100px_48px] items-center gap-3 border-t border-gray-100 px-4 py-3 text-sm hover:bg-gray-50">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-4 w-4 flex-shrink-0 text-[#1B2559]" />
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-700">{document.name}</p>
                {document.note && <p className="truncate text-xs text-gray-400">{document.note}</p>}
              </div>
            </div>
            <span className="text-gray-500">{document.category}</span>
            <span className="text-gray-500">{(document.size / 1024).toFixed(1)} KB</span>
            <button
              type="button"
              onClick={() => onChange(documents.filter((item) => item.id !== document.id))}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
              title="Remove document"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
