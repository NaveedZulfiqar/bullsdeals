import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { csvSampleResponse } from "@/lib/csvSample";

export async function GET() {
  return csvSampleResponse("employees_import_sample.csv",
    ["Employee Id", "First Name", "Middle Name", "Last Name", "Nick Name", "Email", "Home Phone", "Mobile", "Street", "City", "Province", "Postal Code", "Date Of Birth", "Social Insurance No", "Employee Status", "Employment Start Date", "Employment End Date", "Work Location", "Department", "Job Title", "Federal Claim Code", "Federal TD1 Claim Amount", "Provincial Claim Code", "Provincial Claim Amount", "CPP Exempted", "CPP Exemption Reason", "EI Exempted", "EI Exemption Reason", "Pay Type", "Pay Frequency", "Pay Rate", "Hours Per Day", "Vacation Policy", "Vacation Rate", "Payment Method", "Bank Name", "Institution No", "Transit No", "Account No", "Is Active"],
    ["EMP-001", "Jane", "", "Doe", "Jane", "jane@example.com", "", "416-555-0100", "123 Main St", "Toronto", "ONT", "M5V 1A1", "1990-08-15", "", "Full Time", "2026-01-01", "", "Toronto", "Administration", "Coordinator", "FC01 - 16,452", "$16,452.00", "PC01 - 12,989.00", "$12,989.00", "No", "", "No", "", "Salary", "Bi-Weekly", "50000", "8", "4%", "4%", "Direct Deposit", "Example Bank", "001", "12345", "0001234", "Yes"]);
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

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === "-") return null;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  const months: Record<string, number> = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = months[parts[1]];
    const year = parseInt(parts[2]);
    if (!isNaN(day) && month !== undefined && !isNaN(year)) return new Date(year, month, day);
  }
  return null;
}

const HEADER_MAP: Record<string, string> = {
  employeeid: "employeeId", firstname: "firstName", middlename: "middleName",
  lastname: "lastName", nickname: "nickName", email: "email",
  homephone: "homePhone", mobile: "mobile", street: "street", city: "city",
  province: "province", postalcode: "postalCode", dateofbirth: "dateOfBirth",
  socialinsuranceno: "socialInsuranceNo", employeestatus: "employeeStatus",
  employmentstartdate: "employmentStartDate", employmentenddate: "employmentEndDate",
  worklocation: "workLocation", department: "department", jobtitle: "jobTitle",
  federalclaimcode: "federalClaimCode", federaltd1claimamount: "federalTD1ClaimAmount",
  provincialclaimcode: "provincialClaimCode", provincialclaimamount: "provincialClaimAmount",
  cppexempted: "cppExempted", cppexemptionreason: "cppExemptionReason",
  eiexempted: "eiExempted", eiexemptionreason: "eiExemptionReason",
  paytype: "payType", payfrequency: "payFrequency", payrate: "payRate",
  hoursperday: "hoursPerDay", vacationpolicy: "vacationPolicy", vacationrate: "vacationRate",
  paymentmethod: "paymentMethod", bankname: "bankName", institutionno: "institutionNo",
  transitno: "transitNo", accountno: "accountNo", isactive: "isActive",
};

export async function POST(request: NextRequest) {
  try {
    const { Employee } = await connectToDatabase();
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
    if (lines.length < 2) return NextResponse.json({ error: "CSV must have header + data rows" }, { status: 400 });

    const rawHeaders = parseCSVLine(lines[0]);
    const fieldByIndex = rawHeaders.map(h => HEADER_MAP[h.toLowerCase().replace(/[^a-z0-9]/g, "")]);

    const employees: Array<Record<string, string | boolean | Date | null>> = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const data: Record<string, string | boolean | Date | null> = {};
      fieldByIndex.forEach((field, idx) => {
        if (!field || idx >= values.length) return;
        const val = values[idx];
        if (["dateOfBirth","employmentStartDate","employmentEndDate"].includes(field)) data[field] = parseDate(val);
        else if (["cppExempted","eiExempted","isActive"].includes(field)) data[field] = val.toLowerCase() === "yes" || val.toLowerCase() === "true";
        else data[field] = val;
      });
      if (!data.firstName || !data.lastName || !data.email) {
        errors.push(`Row ${i + 1}: Missing required fields`);
        continue;
      }
      employees.push(data);
    }

    let imported = 0;
    if (employees.length > 0) {
      const result = await Employee.insertMany(employees, { ordered: false });
      imported = result.length;
    }

    return NextResponse.json({ message: `Successfully imported ${imported} employees`, imported, errors, total: lines.length - 1 }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to import employees: " + message }, { status: 500 });
  }
}
