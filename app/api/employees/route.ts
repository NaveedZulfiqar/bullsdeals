import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

// GET /api/employees
export async function GET(request: NextRequest) {
  try {
    const { Employee } = await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const filterFirstName = searchParams.get("filterFirstName") || "";
    const filterLastName = searchParams.get("filterLastName") || "";
    const filterStreet = searchParams.get("filterStreet") || "";
    const filterCity = searchParams.get("filterCity") || "";
    const filterProvince = searchParams.get("filterProvince") || "";
    const filterPostalCode = searchParams.get("filterPostalCode") || "";
    const filterMobile = searchParams.get("filterMobile") || "";

    const query: Record<string, unknown> = {};
    const andClauses: Array<Record<string, unknown>> = [];

    if (filterFirstName) andClauses.push({ firstName: { $regex: filterFirstName, $options: "i" } });
    if (filterLastName) andClauses.push({ lastName: { $regex: filterLastName, $options: "i" } });
    if (filterStreet) andClauses.push({ street: { $regex: filterStreet, $options: "i" } });
    if (filterCity) andClauses.push({ city: { $regex: filterCity, $options: "i" } });
    if (filterProvince) andClauses.push({ province: { $regex: filterProvince, $options: "i" } });
    if (filterPostalCode) andClauses.push({ postalCode: { $regex: filterPostalCode, $options: "i" } });
    if (filterMobile) andClauses.push({ mobile: { $regex: filterMobile, $options: "i" } });

    if (andClauses.length > 0) query.$and = andClauses;

    const employees = await Employee.find(query).sort({ firstName: 1 }).lean();
    return NextResponse.json({ employees }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

// POST /api/employees
export async function POST(request: NextRequest) {
  try {
    const { Employee } = await connectToDatabase();
    const body = await request.json();
    if (!body.employeeId) {
      const employeeCount = await Employee.countDocuments();
      body.employeeId = `EMP-${String(employeeCount + 1).padStart(4, "0")}`;
    }
    const employee = await Employee.create(body);
    return NextResponse.json({ employee }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating employee:", error);
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}
