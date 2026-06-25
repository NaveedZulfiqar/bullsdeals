import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Agent from "@/models/Agent";

export async function GET() {
  try {
    await connectToDatabase();

    const agents = await Agent.find({}).lean();

    const headers = [
      "First Name",
      "Middle Name",
      "Last Name",
      "Office Nick Name",
      "Trade Name",
      "Date Of Birth",
      "HST#",
      "Sin#",
      "Street",
      "City",
      "Province",
      "Postal Code",
      "Email",
      "Cell Phone",
      "Home Phone",
      "Website",
      "Agent Type",
      "Agent Mentor",
      "Pay To PREC",
      "PREC Name",
      "PREC Street",
      "PREC City",
      "PREC Province",
      "PREC Postal Code",
      "PREC HST",
      "PREC Business Number",
      "RECO #",
      "RECO LIC Expiry",
      "Agent Code",
      "Is Active",
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

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

    const rows = agents.map((a: any) =>
      [
        a.firstName,
        a.middleName,
        a.lastName,
        a.officeNickName,
        a.tradeName,
        formatDate(a.dateOfBirth),
        a.hst,
        a.sin,
        a.street,
        a.city,
        a.province,
        a.postalCode,
        a.email,
        a.cellPhone,
        a.homePhone,
        a.website,
        a.agentType,
        a.agentMentor,
        a.payToPrec ? "Yes" : "No",
        a.precName,
        a.precStreet,
        a.precCity,
        a.precProvince,
        a.precPostalCode,
        a.precHst,
        a.precBusinessNumber,
        a.recoNumber,
        formatDate(a.recoLicExpiry),
        a.agentCode,
        a.isActive ? "Yes" : "No",
      ]
        .map(escapeCSV)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

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
