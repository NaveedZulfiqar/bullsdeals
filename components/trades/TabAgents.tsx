"use client";
import React, { useState } from "react";
import { ChevronDown, Plus, User, X } from "lucide-react";
import { AgentOption, TradeAgent } from "./types";
import { FI, FL, Modal, ModalFooter } from "./ui";

interface Props {
  agentOptions: AgentOption[];
  tradeAgents: TradeAgent[];
  onChange: (agents: TradeAgent[]) => void;
  onAgentCreated: (agent: AgentOption) => void;
}

export default function TabAgents({ agentOptions, tradeAgents, onChange, onAgentCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [showNewAgent, setShowNewAgent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newAgent, setNewAgent] = useState({ firstName: "", lastName: "", email: "", cellPhone: "", agentType: "Agent" });

  const filtered = agentOptions.filter(a =>
    `${a.firstName} ${a.lastName} ${a.cellPhone}`.toLowerCase().includes(search.toLowerCase())
  );
  const selected = agentOptions.find(a => a._id === selectedId);

  const assign = () => {
    if (!selectedId) return;
    const a = agentOptions.find(x => x._id === selectedId);
    if (!a || tradeAgents.some(x => x.agentId === selectedId)) return;
    onChange([...tradeAgents, { agentId: a._id, agentName: `${a.firstName} ${a.lastName}`, photo: a.photo || "" }]);
    setSelectedId(""); setOpen(false); setSearch("");
  };

  const createAndAssign = async () => {
    if (!newAgent.firstName.trim() || !newAgent.lastName.trim() || !newAgent.email.trim()) {
      setError("First name, last name, and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAgent),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create agent");
      const agent: AgentOption = data.agent;
      onAgentCreated(agent);
      onChange([...tradeAgents, {
        agentId: agent._id,
        agentName: `${agent.firstName} ${agent.lastName}`,
        photo: agent.photo || "",
      }]);
      setNewAgent({ firstName: "", lastName: "", email: "", cellPhone: "", agentType: "Agent" });
      setShowNewAgent(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to create agent");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="relative w-64">
          <button onClick={() => setOpen(p => !p)} className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer">
            <span className="text-gray-500">{selected ? `${selected.firstName} ${selected.lastName}` : "Select an agent"}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {open && (
            <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="p-2 border-b border-gray-100">
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agents..." className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none" autoFocus />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filtered.map(a => (
                  <button key={a._id} onClick={() => { setSelectedId(a._id); setOpen(false); setSearch(""); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm cursor-pointer text-left">
                    {a.photo ? <img src={a.photo} alt="" className="w-6 h-6 rounded-full object-cover" /> : <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"><User className="w-3 h-3 text-gray-400" /></div>}
                    <span>{a.firstName} {a.lastName}</span>
                    {a.cellPhone && <span className="text-gray-400 text-xs">- {a.cellPhone}</span>}
                  </button>
                ))}
                {filtered.length === 0 && <p className="px-3 py-2 text-sm text-gray-400">No agents found</p>}
              </div>
            </div>
          )}
        </div>
        <button onClick={assign} disabled={!selectedId} className="px-4 py-2 bg-[#1B2559] hover:bg-[#151d47] text-white rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Assign Agent</button>
        <button onClick={() => setShowNewAgent(true)} className="flex items-center gap-1.5 px-4 py-2 border border-[#1B2559] text-[#1B2559] hover:bg-[#1B2559] hover:text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors"><Plus className="w-4 h-4" />New Agent</button>
      </div>
      <div className="flex flex-wrap gap-4">
        {tradeAgents.length === 0 && <p className="text-sm text-gray-400">No agents assigned yet</p>}
        {tradeAgents.map(a => (
          <div key={a.agentId} className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-2 border-white shadow">
              {a.photo ? <img src={a.photo} alt={a.agentName} className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-gray-400" />}
            </div>
            <button onClick={() => onChange(tradeAgents.filter(x => x.agentId !== a.agentId))} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center cursor-pointer"><X className="w-3 h-3" /></button>
            <p className="text-xs text-center mt-1 text-gray-600 max-w-[72px] truncate">{a.agentName.split(" ")[0]}</p>
          </div>
        ))}
      </div>
      {showNewAgent && (
        <Modal title="Create and Assign Agent" onClose={() => setShowNewAgent(false)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><FL req>First Name</FL><FI value={newAgent.firstName} onChange={(event) => setNewAgent((previous) => ({ ...previous, firstName: event.target.value }))} /></div>
            <div><FL req>Last Name</FL><FI value={newAgent.lastName} onChange={(event) => setNewAgent((previous) => ({ ...previous, lastName: event.target.value }))} /></div>
            <div><FL req>Email</FL><FI type="email" value={newAgent.email} onChange={(event) => setNewAgent((previous) => ({ ...previous, email: event.target.value }))} /></div>
            <div><FL>Cell Phone</FL><FI value={newAgent.cellPhone} onChange={(event) => setNewAgent((previous) => ({ ...previous, cellPhone: event.target.value }))} /></div>
            <div>
              <FL req>Agent Type</FL>
              <select value={newAgent.agentType} onChange={(event) => setNewAgent((previous) => ({ ...previous, agentType: event.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">
                <option>Agent</option><option>Broker</option>
              </select>
            </div>
          </div>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          <ModalFooter onCancel={() => setShowNewAgent(false)} onSave={createAndAssign} saving={saving} />
        </Modal>
      )}
    </div>
  );
}
