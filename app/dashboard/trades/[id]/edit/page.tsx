"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import TradeForm from "@/components/trades/TradeForm";

export default function EditTradePage() {
  const params = useParams();
  const id = params?.id as string;
  const [trade, setTrade] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/trades/${id}`)
      .then(r => r.json())
      .then(d => { setTrade(d.trade); setLoading(false); })
      .catch(() => { setError("Failed to load trade"); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <main className="flex-1 w-full px-6 py-6">
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-[#FD7E14] rounded-full animate-spin" />
          Loading trade...
        </div>
      </main>
    );
  }

  if (error || !trade) {
    return (
      <main className="flex-1 w-full px-6 py-6">
        <p className="text-red-600">{error || "Trade not found"}</p>
      </main>
    );
  }

  return <TradeForm initialData={trade} tradeId={id} tradeNumber={trade.tradeNumber} />;
}
