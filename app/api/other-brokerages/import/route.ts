import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import OtherBrokerage from "@/models/OtherBrokerage";

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}

// Strip all non-alphanumeric chars and lowercase — used for fuzzy header matching
function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Covers camelCase exports, spaced human-readable, and variants with # symbols
const HEADER_MAP: Record<string, string> = {
  // camelCase / normalized
  name: "name",
  phone: "phone",
  email: "email",
  hst: "hst",
  street: "street",
  city: "city",
  province: "province",
  postalcode: "postalCode",
  bankname: "bankName",
  institutenumber: "instituteNumber",
  institutenum: "instituteNumber",
  institute: "instituteNumber",
  transitnumber: "transitNumber",
  transitnum: "transitNumber",
  transit: "transitNumber",
  accountnumber: "accountNumber",
  accountnum: "accountNumber",
  account: "accountNumber",
};

function resolveField(rawHeader: string): string | undefined {
  // 1. Normalize (strip all non-alphanumeric)
  const normalized = normalizeHeader(rawHeader);
  if (HEADER_MAP[normalized]) return HEADER_MAP[normalized];

  // 2. Lowercase + trim with spaces kept (e.g. "bank name", "postal code")
  const lower = rawHeader.toLowerCase().trim();
  const spacedMap: Record<string, string> = {
    "name": "name",
    "phone": "phone",
    "email": "email",
    "hst#": "hst",
    "hst": "hst",
    "street": "street",
    "city": "city",
    "province": "province",
    "postal code": "postalCode",
    "bank name": "bankName",
    "institute #": "instituteNumber",
    "institute#": "instituteNumber",
    "transit #": "transitNumber",
    "transit#": "transitNumber",
    "account #": "accountNumber",
    "account#": "accountNumber",
  };
  if (spacedMap[lower]) return spacedMap[lower];

  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV must have a header row and at least one data row" },
        { status: 400 }
      );
    }

    const rawHeaders = parseCSVLine(lines[0]);
    const fieldByIndex: (string | undefined)[] = rawHeaders.map((h) =>
      resolveField(h)
    );

    const brokerages: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const data: any = {};

      fieldByIndex.forEach((field, idx) => {
        if (!field || idx >= values.length) return;
        data[field] = values[idx];
      });

      if (!data.name || !data.phone) {
        errors.push(
          `Row ${i + 1}: Missing required fields (name="${data.name ?? ""}", phone="${data.phone ?? ""}")`
        );
        continue;
      }

      brokerages.push(data);
    }

    let imported = 0;
    if (brokerages.length > 0) {
      const result = await OtherBrokerage.insertMany(brokerages, { ordered: false });
      imported = result.length;
    }

    return NextResponse.json(
      {
        message: `Successfully imported ${imported} brokerages`,
        imported,
        errors,
        total: lines.length - 1,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error importing brokerages:", error);
    return NextResponse.json(
      { error: "Failed to import brokerages: " + error.message },
      { status: 500 }
    );
  }
}