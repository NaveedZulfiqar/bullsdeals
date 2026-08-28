import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { syncAllBrokerageIncome } from "@/lib/brokerageIncome";
import { buildDealCentreReport, isDealCentreReportId } from "@/lib/dealCentreReports";
import { connectToDatabase } from "@/lib/mongodb";

const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
  }
  try {
    const reportId = request.nextUrl.searchParams.get("reportId") || "profitLoss";
    if (!isDealCentreReportId(reportId)) {
      return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
    }
    const today = new Date().toISOString().slice(0, 10);
    const year = Math.min(2100, Math.max(2000, Number(request.nextUrl.searchParams.get("year")) || Number(today.slice(0, 4))));
    const startDateParam = request.nextUrl.searchParams.get("startDate") || `${year}-01-01`;
    const endDateParam = request.nextUrl.searchParams.get("endDate") || today;
    const asOfParam = request.nextUrl.searchParams.get("asOf") || endDateParam;
    const startDate = validDate(startDateParam) ? startDateParam : `${year}-01-01`;
    const endDate = validDate(endDateParam) ? endDateParam : today;
    const asOf = validDate(asOfParam) ? asOfParam : endDate;
    if (startDate > endDate) {
      return NextResponse.json({ error: "Start date cannot be after end date" }, { status: 400 });
    }
    const models = await connectToDatabase();
    await syncAllBrokerageIncome(models);
    const report = await buildDealCentreReport(models, reportId, {
      startDate,
      endDate,
      asOf,
      year,
      agentId: request.nextUrl.searchParams.get("agentId") || undefined,
      includeOpenFirmed: request.nextUrl.searchParams.get("includeOpenFirmed") === "true",
      excludeZero: request.nextUrl.searchParams.get("excludeZero") === "true",
      reportMode: request.nextUrl.searchParams.get("reportMode") === "summary" ? "summary" : "detailed",
    });
    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
