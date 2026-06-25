import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Agent from "@/models/Agent";

// GET /api/agents - List agents with search, sort, filter
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sortField = searchParams.get("sortField") || "firstName";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const showInactive = searchParams.get("showInactive") === "true";
    const precAgents = searchParams.get("precAgents") === "true";

    // Column-specific filters
    const filterName = searchParams.get("filterName") || "";
    const filterAddress = searchParams.get("filterAddress") || "";
    const filterTradeName = searchParams.get("filterTradeName") || "";
    const filterPhone = searchParams.get("filterPhone") || "";
    const filterEmail = searchParams.get("filterEmail") || "";
    const filterPrecName = searchParams.get("filterPrecName") || "";
    const filterReco = searchParams.get("filterReco") || "";
    const filterRecoExpiry = searchParams.get("filterRecoExpiry") || "";
    const filterAgentCode = searchParams.get("filterAgentCode") || "";

    // Build query
    const query: any = {};

    if (!showInactive) {
      query.isActive = true;
    }

    if (precAgents) {
      query.precName = { $nin: ["", null] };
    }

    // Global search
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { cellPhone: { $regex: search, $options: "i" } },
        { tradeName: { $regex: search, $options: "i" } },
        { recoNumber: { $regex: search, $options: "i" } },
        { agentCode: { $regex: search, $options: "i" } },
      ];
    }

    // Column filters
    if (filterName) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { firstName: { $regex: filterName, $options: "i" } },
          { lastName: { $regex: filterName, $options: "i" } },
        ],
      });
    }
    if (filterAddress) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { street: { $regex: filterAddress, $options: "i" } },
          { city: { $regex: filterAddress, $options: "i" } },
          { province: { $regex: filterAddress, $options: "i" } },
        ],
      });
    }
    if (filterTradeName) {
      query.tradeName = { $regex: filterTradeName, $options: "i" };
    }
    if (filterPhone) {
      query.cellPhone = { $regex: filterPhone, $options: "i" };
    }
    if (filterEmail) {
      query.email = { $regex: filterEmail, $options: "i" };
    }
    if (filterPrecName) {
      query.precName = { $regex: filterPrecName, $options: "i" };
    }
    if (filterReco) {
      query.recoNumber = { $regex: filterReco, $options: "i" };
    }
    if (filterAgentCode) {
      query.agentCode = { $regex: filterAgentCode, $options: "i" };
    }

    // Sort
    const sortObj: any = {};
    sortObj[sortField] = sortOrder === "asc" ? 1 : -1;

    const agents = await Agent.find(query).sort(sortObj).lean();

    return NextResponse.json({ agents }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();

    const agent = await Agent.create(body);

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating agent:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}
