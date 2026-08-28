"use client";

import { use } from "react";
import AgentEditor from "@/components/agents/AgentEditor";

export default function EditAgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AgentEditor id={id} />;
}
