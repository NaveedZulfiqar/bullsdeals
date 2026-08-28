"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TradeForm from "@/components/trades/TradeForm";

export default function AgentAddTradePage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => ({ ok: response.ok, data: await response.json() }))
      .then(({ ok, data }) => {
        if (!ok || data.user?.role !== "agent") router.replace("/login");
        else setAuthorized(true);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!authorized) return <main className="flex min-h-screen items-center justify-center bg-[#F8F9FC] text-gray-500">Loading trade form...</main>;
  return <TradeForm agentMode />;
}
