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
    const { Income } = await connectToDatabase();
    const incomes = await Income.find(getExportFilter(request)).sort({ invoiceNumber: -1 }).lean() as any[];

    const headers = [
      "Invoice #",
      "Invoice Date",
      "Category",
      "Customer",
      "Customer Nick Name",
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

    const rows = incomes.map((inc) => {
      // Flatten first payment row for CSV (most common case)
      const pr = inc.paymentRows?.[0] || {};
      return [
        inc.invoiceNumber,
        inc.invoiceDate,
        inc.category,
        inc.customer,
        inc.customerNickName,
        inc.address,
        inc.hstNumber,
        inc.phone,
        inc.email,
        inc.subtotal,
        inc.hstAmount,
        inc.hstExempted ? "Yes" : "No",
        inc.amount,
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
        "Content-Disposition": `attachment; filename="income_export_${date}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting income:", error);
    return NextResponse.json({ error: "Failed to export income" }, { status: 500 });
  }
}
