import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { AGENT_CSV_FIELDS, escapeCsv, normalizeCsvHeader } from "@/lib/agentCsv";

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
      return new Date(Date.UTC(year, month, day));
    }
  }
  return null;
}

const FIELD_BY_HEADER = new Map(
  AGENT_CSV_FIELDS.flatMap((column) => [
    [normalizeCsvHeader(column.header), column],
    [normalizeCsvHeader(column.field), column],
  ])
);

// Backwards compatibility for previously exported files with misspelled headings.
FIELD_BY_HEADER.set("recolicense", AGENT_CSV_FIELDS.find((column) => column.field === "recoLicExpiry")!);
FIELD_BY_HEADER.set("recoliceexpiry", AGENT_CSV_FIELDS.find((column) => column.field === "recoLicExpiry")!);

export async function GET() {
  const headers = AGENT_CSV_FIELDS.map((column) => escapeCsv(column.header)).join(",");
  const example = AGENT_CSV_FIELDS.map((column) => escapeCsv(column.sample || "")).join(",");
  const csv = `\uFEFF${headers}\n${example}\n`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="agents_import_sample.csv"',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { Agent } = await connectToDatabase();

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
    const fieldByIndex = rawHeaders.map((header) =>
      FIELD_BY_HEADER.get(normalizeCsvHeader(header.replace(/^\uFEFF/, "")))
    );

    const agents: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const agentData: any = {};

      let rowHasInvalidJson = false;
      fieldByIndex.forEach((column, idx) => {
        if (!column || idx >= values.length) return;
        const val = values[idx];

        if (column.type === "date") {
          agentData[column.field] = parseDate(val);
        } else if (column.type === "boolean") {
          agentData[column.field] =
            val.toLowerCase() === "yes" ||
            val.toLowerCase() === "true" ||
            val === "1";
        } else if (column.type === "json") {
          if (!val) {
            agentData[column.field] = [];
          } else {
            try {
              const parsed = JSON.parse(val);
              if (!Array.isArray(parsed)) throw new Error("value must be an array");
              agentData[column.field] = parsed;
            } catch {
              errors.push(`Row ${i + 1}: ${column.header} must contain a valid JSON array`);
              rowHasInvalidJson = true;
            }
          }
        } else {
          agentData[column.field] = val;
        }
      });

      if (rowHasInvalidJson) continue;

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
