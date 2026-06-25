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

    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());

    const headerMap: Record<string, string> = {
      "first name": "firstName",
      "middle name": "middleName",
      "last name": "lastName",
      "office nick name": "officeNickName",
      "trade name": "tradeName",
      "date of birth": "dateOfBirth",
      "hst#": "hst",
      "sin#": "sin",
      street: "street",
      city: "city",
      province: "province",
      "postal code": "postalCode",
      email: "email",
      "cell phone": "cellPhone",
      "home phone": "homePhone",
      website: "website",
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
      "reco #": "recoNumber",
      "reco lic expiry": "recoLicExpiry",
      "agent code": "agentCode",
      "is active": "isActive",
    };

    const agents: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const agentData: any = {};

      headers.forEach((header, idx) => {
        const field = headerMap[header];
        if (field && idx < values.length) {
          const val = values[idx];
          if (field === "dateOfBirth" || field === "recoLicExpiry") {
            agentData[field] = parseDate(val);
          } else if (field === "payToPrec" || field === "isActive") {
            agentData[field] = val.toLowerCase() === "yes" || val === "true";
          } else {
            agentData[field] = val;
          }
        }
      });

      if (!agentData.firstName || !agentData.lastName || !agentData.email) {
        errors.push(
          `Row ${i + 1}: Missing required fields (First Name, Last Name, or Email)`
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
