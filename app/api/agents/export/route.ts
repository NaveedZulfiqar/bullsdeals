import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { AGENT_CSV_FIELDS, escapeCsv } from "@/lib/agentCsv";
import { getExportFilter } from "@/lib/exportIds";

export async function GET(request: Request) {
  try {
    const { Agent } = await connectToDatabase();

    const agents = await Agent.find(getExportFilter(request)).lean();

    const formatDate = (date: any) => {
      if (!date) return "";
      const d = new Date(date);
      if (isNaN(d.getTime())) return "";
      const day = String(d.getDate()).padStart(2, "0");
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      const mon = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day}-${mon}-${year}`;
    };

    const rows = agents.map((agent: any) =>
      AGENT_CSV_FIELDS.map((column) => {
        const value = agent[column.field];
        if (column.type === "date") return escapeCsv(formatDate(value));
        if (column.type === "boolean") return escapeCsv(value ? "Yes" : "No");
        if (column.type === "json") return escapeCsv(JSON.stringify(value || []));
        return escapeCsv(value);
      }).join(",")
    );

    const csv = [AGENT_CSV_FIELDS.map((column) => escapeCsv(column.header)).join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="agents_export_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting agents:", error);
    return NextResponse.json(
      { error: "Failed to export agents" },
      { status: 500 }
    );
  }
}
