import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Agent from "@/models/Agent";

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

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === "-") return null;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  // Try DD-Mon-YYYY format
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = months[parts[1]];
    const year = parseInt(parts[2]);
    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  return null;
}

// Normalize a header string: lowercase + remove spaces/special chars for comparison
function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Maps normalized header → model field name
// Handles both camelCase exports ("firstname", "cellphone") and
// human-readable headers ("first name", "cell phone", "hst#", etc.)
const HEADER_MAP: Record<string, string> = {
  // camelCase variants (from CSV export)
  firstname: "firstName",
  middlename: "middleName",
  lastname: "lastName",
  officenickname: "officeNickName",
  tradename: "tradeName",
  dateofbirth: "dateOfBirth",
  hst: "hst",
  sin: "sin",
  street: "street",
  city: "city",
  province: "province",
  postalcode: "postalCode",
  email: "email",
  cellphone: "cellPhone",
  homephone: "homePhone",
  website: "website",
  agenttype: "agentType",
  agentmentor: "agentMentor",
  paytoprec: "payToPrec",
  precname: "precName",
  precstreet: "precStreet",
  preccity: "precCity",
  precprovince: "precProvince",
  precpostalcode: "precPostalCode",
  prechst: "precHst",
  precbusinessnumber: "precBusinessNumber",
  reconumber: "recoNumber",
  recolicense: "recoLicExpiry",
  recoliceexpiry: "recoLicExpiry",
  recoliecexpiry: "recoLicExpiry",
  agentcode: "agentCode",
  isactive: "isActive",
  photo: "photo",

  // Human-readable / spaced variants
  "first name": "firstName",
  "middle name": "middleName",
  "last name": "lastName",
  "office nick name": "officeNickName",
  "trade name": "tradeName",
  "date of birth": "dateOfBirth",
  "postal code": "postalCode",
  "cell phone": "cellPhone",
  "home phone": "homePhone",
  "agent type": "agentType",
  "agent mentor": "agentMentor",
  "pay to prec": "payToPrec",
  "prec name": "precName",
  "prec street": "precStreet",
  "prec city": "precCity",
  "prec province": "precProvince",
  "prec postal code": "precPostalCode",
  "prec hst": "precHst",
  "prec business number": "precBusinessNumber",
  "reco": "recoNumber",
  "reco lic expiry": "recoLicExpiry",
  "agent code": "agentCode",
  "is active": "isActive",
};

function resolveField(rawHeader: string): string | undefined {
  // 1. Try normalized (strips all non-alphanumeric)
  const normalized = normalizeHeader(rawHeader);
  if (HEADER_MAP[normalized]) return HEADER_MAP[normalized];

  // 2. Try lowercased with spaces preserved (for "first name" etc.)
  const lower = rawHeader.toLowerCase().trim();
  if (HEADER_MAP[lower]) return HEADER_MAP[lower];

  // 3. Try stripping trailing # or * symbols then normalizing
  const stripped = normalizeHeader(rawHeader.replace(/[#*]/g, ""));
  if (HEADER_MAP[stripped]) return HEADER_MAP[stripped];

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
    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV file must have a header row and at least one data row" },
        { status: 400 }
      );
    }

    const rawHeaders = parseCSVLine(lines[0]);
    // Map each column index → model field name (or undefined if unknown)
    const fieldByIndex: (string | undefined)[] = rawHeaders.map((h) =>
      resolveField(h)
    );

    const agents: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const agentData: any = {};

      fieldByIndex.forEach((field, idx) => {
        if (!field || idx >= values.length) return;
        const val = values[idx];

        if (field === "dateOfBirth" || field === "recoLicExpiry") {
          agentData[field] = parseDate(val);
        } else if (field === "payToPrec" || field === "isActive") {
          agentData[field] =
            val.toLowerCase() === "yes" ||
            val.toLowerCase() === "true" ||
            val === "1";
        } else {
          agentData[field] = val;
        }
      });

      if (!agentData.firstName || !agentData.lastName || !agentData.email) {
        errors.push(
          `Row ${i + 1}: Missing required fields (firstName="${agentData.firstName}", lastName="${agentData.lastName}", email="${agentData.email}")`
        );
        continue;
      }

      agents.push(agentData);
    }

    let imported = 0;
    if (agents.length > 0) {
      const result = await Agent.insertMany(agents, { ordered: false });
      imported = result.length;
    }

    return NextResponse.json(
      {
        message: `Successfully imported ${imported} agents`,
        imported,
        errors,
        total: lines.length - 1,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error importing agents:", error);
    return NextResponse.json(
      { error: "Failed to import agents: " + error.message },
      { status: 500 }
    );
  }
}