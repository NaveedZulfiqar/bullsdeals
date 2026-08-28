import type { Metadata } from "next";
import { AgentApplicationForm } from "@/app/dashboard/agents/add/page";

export const metadata: Metadata = {
  title: "Agent Registration | Bulls Deals",
  description: "Apply for a Bulls Deals agent account.",
};

export default function RegisterPage() {
  return <AgentApplicationForm registration />;
}
