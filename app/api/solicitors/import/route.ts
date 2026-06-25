import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Solicitor from "@/models/Solicitor";

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = false;
      } else current += char;
    } else {
      if (char === '"') inQuotes = true;
      else if (char === ",") { result.push(current.trim()); current = ""; }
      else current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length < 2) return NextResponse.json({ error: "CSV must have a header and at least one data row" }, { status: 400 });

    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
    const headerMap: Record<string, string> = {
      name: "name", "company name": "companyName", phone: "phone", fax: "fax",
      email: "email", street: "street", city: "city", province: "province", "postal code": "postalCode",
    };

    const solicitors: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const data: any = {};
      headers.forEach((header, idx) => {
        const field = headerMap[header];
        if (field && idx < values.length) data[field] = values[idx];
      });
      if (!data.name) { errors.push(`Row ${i + 1}: Missing required field (Name)`); continue; }
      solicitors.push(data);
    }

    let imported = 0;
    if (solicitors.length > 0) {
      const result = await Solicitor.insertMany(solicitors, { ordered: false });
      imported = result.length;
    }

    return NextResponse.json({ message: `Successfully imported ${imported} solicitors`, imported, errors, total: lines.length - 1 }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to import solicitors: " + error.message }, { status: 500 });
  }
}
