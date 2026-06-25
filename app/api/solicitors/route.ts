import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Solicitor from "@/models/Solicitor";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const sortField = searchParams.get("sortField") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const filterName = searchParams.get("filterName") || "";
    const filterPhone = searchParams.get("filterPhone") || "";
    const filterCompanyName = searchParams.get("filterCompanyName") || "";
    const filterFax = searchParams.get("filterFax") || "";
    const filterEmail = searchParams.get("filterEmail") || "";
    const filterAddress = searchParams.get("filterAddress") || "";

    const query: any = {};
    if (filterName) query.name = { $regex: filterName, $options: "i" };
    if (filterPhone) query.phone = { $regex: filterPhone, $options: "i" };
    if (filterCompanyName) query.companyName = { $regex: filterCompanyName, $options: "i" };
    if (filterFax) query.fax = { $regex: filterFax, $options: "i" };
    if (filterEmail) query.email = { $regex: filterEmail, $options: "i" };
    if (filterAddress) {
      query.$or = [
        { street: { $regex: filterAddress, $options: "i" } },
        { city: { $regex: filterAddress, $options: "i" } },
        { province: { $regex: filterAddress, $options: "i" } },
        { postalCode: { $regex: filterAddress, $options: "i" } },
      ];
    }

    const sortObj: any = {};
    sortObj[sortField] = sortOrder === "asc" ? 1 : -1;

    const solicitors = await Solicitor.find(query).sort(sortObj).lean();
    return NextResponse.json({ solicitors }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching solicitors:", error);
    return NextResponse.json({ error: "Failed to fetch solicitors" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const solicitor = await Solicitor.create(body);
    return NextResponse.json({ solicitor }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating solicitor:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create solicitor" }, { status: 500 });
  }
}
