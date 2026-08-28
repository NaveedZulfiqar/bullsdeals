import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { csvSampleResponse } from "@/lib/csvSample";

export async function GET() {
  return csvSampleResponse("income_import_sample.csv",
    ["Invoice #", "Invoice Date", "Category", "Customer", "Customer Nick Name", "Address", "HST #", "Phone", "Email", "Subtotal", "HST Amount", "HST Exempted", "Amount", "Description", "Payment Date", "Payment Method", "Transaction Ref. No."],
    ["1", "2026-07-21", "Commission", "Example Customer", "Example", "Toronto", "", "416-555-0100", "customer@example.com", "1000", "130", "No", "1130", "Payment", "2026-07-21", "EFT", "REF-001"]);
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = false;
      } else current += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { result.push(current.trim()); current = ""; }
      else current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function norm(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Map normalized CSV header → Income model field
const HEADER_MAP: Record<string, string> = {
  "invoice": "invoiceNumber",
  "invoiceno": "invoiceNumber",
  "invoice#": "invoiceNumber",
  "invoicenumber": "invoiceNumber",
  "invoicedate": "invoiceDate",
  "date": "invoiceDate",
  "category": "category",
  "customer": "customer",
  "customernickname": "customerNickName",
  "nickname": "customerNickName",
  "nickName": "customerNickName",
  "address": "address",
  "hst": "hstNumber",
  "hst#": "hstNumber",
  "hstnumber": "hstNumber",
  "phone": "phone",
  "email": "email",
  "subtotal": "subtotal",
  "hstamount": "hstAmount",
  "hstexempted": "hstExempted",
  "amount": "amount",
  "description": "description_pr",
  "desc": "description_pr",
  "paymentdate": "paymentDate_pr",
  "paymentmethod": "paymentMethod_pr",
  "method": "paymentMethod_pr",
  "transactionrefno": "transactionRefNo_pr",
  "transactionref": "transactionRefNo_pr",
  "refno": "transactionRefNo_pr",
  "ref": "transactionRefNo_pr",
  "referenceno": "transactionRefNo_pr",
};

export async function POST(request: NextRequest) {
  try {
    const { Income } = await connectToDatabase();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length < 2)
      return NextResponse.json(
        { error: "CSV must have a header row and at least one data row" },
        { status: 400 }
      );

    const rawHeaders = parseCSVLine(lines[0]);
    const fieldByIndex = rawHeaders.map((h) => HEADER_MAP[norm(h)] || null);

    const toInsert: any[] = [];
    const errors: string[] = [];

    // Determine next invoice number
    const last = await Income.findOne({}).sort({ invoiceNumber: -1 }).lean() as any;
    let nextInvoice = last ? (last.invoiceNumber || 0) + 1 : 1;

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const rec: any = {
        paymentRows: [{}],
      };

      fieldByIndex.forEach((field, idx) => {
        if (!field || idx >= values.length) return;
        const val = values[idx];
        if (val === "" || val === undefined) return;

        // Fields that belong to the first paymentRow
        if (field.endsWith("_pr")) {
          const key = field.replace("_pr", "");
          rec.paymentRows[0][key] = val;
        } else if (field === "invoiceNumber") {
          rec.invoiceNumber = parseInt(val) || nextInvoice++;
        } else if (["subtotal", "hstAmount", "amount"].includes(field)) {
          rec[field] = parseFloat(val) || 0;
        } else if (field === "hstExempted") {
          rec[field] = val.toLowerCase() === "yes" || val === "1" || val.toLowerCase() === "true";
        } else {
          rec[field] = val;
        }
      });

      if (!rec.invoiceNumber) rec.invoiceNumber = nextInvoice++;

      // Clean up empty paymentRow
      if (Object.keys(rec.paymentRows[0]).length === 0) rec.paymentRows = [];

      toInsert.push(rec);
    }

    let imported = 0;
    if (toInsert.length > 0) {
      const result = await Income.insertMany(toInsert, { ordered: false });
      imported = result.length;
    }

    return NextResponse.json(
      {
        message: `Successfully imported ${imported} income record${imported !== 1 ? "s" : ""}`,
        imported,
        errors,
        total: lines.length - 1,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error importing income:", error);
    return NextResponse.json({ error: "Failed to import income: " + error.message }, { status: 500 });
  }
}
