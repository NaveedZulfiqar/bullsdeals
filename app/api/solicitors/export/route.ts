import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Solicitor from "@/models/Solicitor";

export async function GET() {
  try {
    await connectToDatabase();
    const solicitors = await Solicitor.find({}).lean();

    const headers = ["Name", "Company Name", "Phone", "Fax", "Email", "Street", "City", "Province", "Postal Code"];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) return `"${str.replace(/"/g, '""')}"`;
      return str;
    };

    const rows = solicitors.map((s: any) =>
      [s.name, s.companyName, s.phone, s.fax, s.email, s.street, s.city, s.province, s.postalCode].map(escapeCSV).join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="solicitors_export_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to export solicitors" }, { status: 500 });
  }
}
