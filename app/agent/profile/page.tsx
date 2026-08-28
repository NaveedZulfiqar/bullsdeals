"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Plus, UserRound } from "lucide-react";
import AgentEditor from "@/components/agents/AgentEditor";

export default function AgentProfilePage() {
  const router = useRouter();
  const [agentId, setAgentId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => ({ ok: response.ok, data: await response.json() }))
      .then(({ ok, data }) => {
        if (!ok || data.user?.role !== "agent" || !data.user?.agentId) {
          router.replace("/login");
          return;
        }
        setAgentId(data.user.agentId);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (!agentId) {
    return <main className="flex min-h-screen items-center justify-center bg-[#F8F9FC] text-gray-500">Loading your profile...</main>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#2C2C2C]">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FD7E14]"><UserRound className="h-5 w-5" /></div>
          <div><p className="font-bold text-[#1B2559]">Bulls Deals</p><p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Agent portal</p></div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/agent/trades/add")} className="flex items-center gap-2 rounded-lg bg-[#1B2559] px-3 py-2 text-sm font-semibold text-white hover:bg-[#151d47]"><Plus className="h-4 w-4" /> Submit trade</button>
          <button onClick={logout} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </header>
      <AgentEditor id={agentId} profileMode />
    </div>
  );
}
