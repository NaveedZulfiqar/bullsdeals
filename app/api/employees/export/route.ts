import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getExportFilter } from "@/lib/exportIds";

export async function GET(request: Request) {
  try {
    const { Employee } = await connectToDatabase();
    const employees: Array<Record<string, unknown>> = await Employee.find(getExportFilter(request)).lean();

    const headers = [
      "Employee Id", "First Name", "Middle Name", "Last Name", "Nick Name",
      "Email", "Home Phone", "Mobile", "Street", "City", "Province", "Postal Code",
      "Date Of Birth", "Social Insurance No",
      "Employee Status", "Employment Start Date", "Employment End Date",
      "Work Location", "Department", "Job Title",
      "Federal Claim Code", "Federal TD1 Claim Amount",
      "Provincial Claim Code", "Provincial Claim Amount",
      "CPP Exempted", "CPP Exemption Reason", "EI Exempted", "EI Exemption Reason",
      "Pay Type", "Pay Frequency", "Pay Rate", "Hours Per Day",
      "Vacation Policy", "Vacation Rate", "Payment Method", "Bank Name",
      "Institution No", "Transit No", "Account No", "Is Active",
    ];

    const escapeCSV = (val: unknown) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const formatDate = (date: unknown) => {
      if (!date) return "";
      const d = new Date(String(date));
      if (isNaN(d.getTime())) return "";
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      return `${String(d.getDate()).padStart(2,"0")}-${months[d.getMonth()]}-${d.getFullYear()}`;
    };

    const rows = employees.map((e) =>
      [
        e.employeeId, e.firstName, e.middleName, e.lastName, e.nickName,
        e.email, e.homePhone, e.mobile, e.street, e.city, e.province, e.postalCode,
        formatDate(e.dateOfBirth), e.socialInsuranceNo,
        e.employeeStatus, formatDate(e.employmentStartDate), formatDate(e.employmentEndDate),
        e.workLocation, e.department, e.jobTitle,
        e.federalClaimCode, e.federalTD1ClaimAmount,
        e.provincialClaimCode, e.provincialClaimAmount,
        e.cppExempted ? "Yes" : "No", e.cppExemptionReason,
        e.eiExempted ? "Yes" : "No", e.eiExemptionReason,
        e.payType, e.payFrequency, e.payRate, e.hoursPerDay,
        e.vacationPolicy, e.vacationRate, e.paymentMethod, e.bankName,
        e.institutionNo, e.transitNo, e.accountNo,
        e.isActive ? "Yes" : "No",
      ].map(escapeCSV).join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="employees_export_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to export employees" }, { status: 500 });
  }
}
