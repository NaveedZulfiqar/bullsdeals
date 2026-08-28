import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { csvSampleResponse } from "@/lib/csvSample";

export async function GET() {
  return csvSampleResponse("solicitors_import_sample.csv",
    ["Name", "Company Name", "Phone", "Fax", "Email", "Street", "City", "Province", "Postal Code"],
    ["Jane Lawyer", "Example Law LLP", "416-555-0100", "", "jane@example.com", "123 Main St", "Toronto", "ONT", "M5V 1A1"]);
}

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

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Covers camelCase exports, plain lowercase, and spaced human-readable headers
const HEADER_MAP: Record<string, string> = {
  // normalized / camelCase
  name: "name",
  companyname: "companyName",
  phone: "phone",
  fax: "fax",
  email: "email",
  street: "street",
  city: "city",
  province: "province",
  postalcode: "postalCode",
  // spaced variants
  "company name": "companyName",
  "postal code": "postalCode",
};

function resolveField(rawHeader: string): string | undefined {
  // 1. Normalize (strip all non-alphanumeric)
  const normalized = normalizeHeader(rawHeader);
  if (HEADER_MAP[normalized]) return HEADER_MAP[normalized];

  // 2. Lowercase + trim with spaces kept
  const lower = rawHeader.toLowerCase().trim();
  if (HEADER_MAP[lower]) return HEADER_MAP[lower];

  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const { Solicitor } = await connectToDatabase();
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length < 2) return NextResponse.json({ error: "CSV must have a header and at least one data row" }, { status: 400 });

    const rawHeaders = parseCSVLine(lines[0]);
    const fieldByIndex: (string | undefined)[] = rawHeaders.map((h) => resolveField(h));

    const solicitors: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const data: any = {};

      fieldByIndex.forEach((field, idx) => {
        if (!field || idx >= values.length) return;
        data[field] = values[idx];
      });

      if (!data.name) {
        errors.push(`Row ${i + 1}: Missing required field (name="${data.name ?? ""}")`);
        continue;
      }

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
