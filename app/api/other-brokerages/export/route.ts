import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import OtherBrokerage from "@/models/OtherBrokerage";

export async function GET() {
  try {
    await connectToDatabase();
    const brokerages = await OtherBrokerage.find({}).lean();

    const headers = [
      "Name",
      "Phone",
      "Email",
      "HST#",
      "Street",
      "City",
      "Province",
      "Postal Code",
      "Bank Name",
      "Institute #",
      "Transit #",
      "Account #",
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = brokerages.map((b: any) =>
      [
        b.name,
        b.phone,
        b.email,
        b.hst,
        b.street,
        b.city,
        b.province,
        b.postalCode,
        b.bankName,
        b.instituteNumber,
        b.transitNumber,
        b.accountNumber,
      ]
        .map(escapeCSV)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="other_brokerages_export_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting brokerages:", error);
    return NextResponse.json({ error: "Failed to export brokerages" }, { status: 500 });
  }
}
