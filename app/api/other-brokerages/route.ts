import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import OtherBrokerage from "@/models/OtherBrokerage";

// GET /api/other-brokerages - List with search, sort, filter
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const sortField = searchParams.get("sortField") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    const filterName = searchParams.get("filterName") || "";
    const filterPhone = searchParams.get("filterPhone") || "";
    const filterEmail = searchParams.get("filterEmail") || "";
    const filterStreet = searchParams.get("filterStreet") || "";
    const filterCity = searchParams.get("filterCity") || "";
    const filterProvince = searchParams.get("filterProvince") || "";
    const filterPostalCode = searchParams.get("filterPostalCode") || "";

    const query: any = {};

    if (filterName) query.name = { $regex: filterName, $options: "i" };
    if (filterPhone) query.phone = { $regex: filterPhone, $options: "i" };
    if (filterEmail) query.email = { $regex: filterEmail, $options: "i" };
    if (filterStreet) query.street = { $regex: filterStreet, $options: "i" };
    if (filterCity) query.city = { $regex: filterCity, $options: "i" };
    if (filterProvince) query.province = { $regex: filterProvince, $options: "i" };
    if (filterPostalCode) query.postalCode = { $regex: filterPostalCode, $options: "i" };

    const sortObj: any = {};
    sortObj[sortField] = sortOrder === "asc" ? 1 : -1;

    const brokerages = await OtherBrokerage.find(query).sort(sortObj).lean();

    return NextResponse.json({ brokerages }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching brokerages:", error);
    return NextResponse.json(
      { error: "Failed to fetch brokerages" },
      { status: 500 }
    );
  }
}

// POST /api/other-brokerages - Create
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const brokerage = await OtherBrokerage.create(body);
    return NextResponse.json({ brokerage }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating brokerage:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create brokerage" },
      { status: 500 }
    );
  }
}
