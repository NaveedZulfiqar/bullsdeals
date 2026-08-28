import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getExportFilter } from "@/lib/exportIds";

const esc = (val: any): string => {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export async function GET(request: Request) {
  try {
    const { Expenditure } = await connectToDatabase();
    const expenditures = await Expenditure.find(getExportFilter(request)).sort({ invoiceNumber: -1 }).lean() as any[];

    const headers = [
      "Invoice #",
      "Invoice Date",
      "Category",
      "Supplier Nick Name",
      "Address",
      "HST #",
      "Phone",
      "Email",
      "Subtotal",
      "HST Amount",
      "HST Exempted",
      "Amount",
      // First payment row columns
      "Description",
      "Payment Date",
      "Payment Method",
      "Transaction Ref. No.",
    ];

    const rows = expenditures.map((exp) => {
      // Flatten first payment row for CSV
      const pr = exp.paymentRows?.[0] || {};
      return [
        exp.invoiceNumber,
        exp.invoiceDate,
        exp.category,
        exp.supplierNickName,
        exp.address,
        exp.hstNumber,
        exp.phone,
        exp.email,
        exp.subtotal,
        exp.hstAmount,
        exp.hstExempted ? "Yes" : "No",
        exp.amount,
        pr.description,
        pr.paymentDate,
        pr.paymentMethod,
        pr.transactionRefNo,
      ]
        .map(esc)
        .join(",");
    });

    const csv = [headers.map(esc).join(","), ...rows].join("\n");
    const date = new Date().toISOString().split("T")[0];

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="expenditure_export_${date}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting expenditure:", error);
    return NextResponse.json({ error: "Failed to export expenditure" }, { status: 500 });
  }
}
