import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { syncTradeBrokerageIncome } from "@/lib/brokerageIncome";

// GET /api/trades
export async function GET(request: NextRequest) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  try {
    const { Trade } = await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const sortField = searchParams.get("sortField") || "tradeNumber";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const status = searchParams.get("status");
    const includeClosed = searchParams.get("includeClosed") === "true";

    // Column filters
    const filterTradeNumber = searchParams.get("filterTradeNumber") || "";
    const filterAgreementStatus = searchParams.get("filterAgreementStatus") || "";
    const filterType = searchParams.get("filterType") || "";
    const filterCategory = searchParams.get("filterCategory") || "";
    const filterWeAre = searchParams.get("filterWeAre") || "";
    const filterAddress = searchParams.get("filterAddress") || "";
    const filterTradeStatus = searchParams.get("filterTradeStatus") || "";
    const filterAgents = searchParams.get("filterAgents") || "";

    const query: any = {};
    if (session.role === "agent") {
      if (!session.agentId) {
        return NextResponse.json({ error: "Agent account is not configured" }, { status: 403 });
      }
      query.$and = [{ $or: [
        { submittedByAgentId: session.agentId },
        { "agents.agentId": session.agentId },
      ] }];
    }

    if (status === "Open" || status === "Closed") {
      query.tradeStatus = status;
    } else if (!includeClosed) {
      query.tradeStatus = { $ne: "Closed" };
    }

    if (filterTradeNumber) {
      const n = parseInt(filterTradeNumber);
      if (!isNaN(n)) query.tradeNumber = n;
    }
    if (filterAgreementStatus) {
      query.agreementStatus = { $regex: filterAgreementStatus, $options: "i" };
    }
    if (filterType) {
      query.tradeType = { $regex: filterType, $options: "i" };
    }
    if (filterCategory) {
      query.tradeCategory = { $regex: filterCategory, $options: "i" };
    }
    if (filterWeAre) {
      query.ourRole = { $regex: filterWeAre, $options: "i" };
    }
    if (filterAddress) {
      query.$or = [
        { street: { $regex: filterAddress, $options: "i" } },
        { city: { $regex: filterAddress, $options: "i" } },
        { province: { $regex: filterAddress, $options: "i" } },
      ];
    }
    if (filterTradeStatus) {
      query.$and = [
        ...(query.$and || []),
        { tradeStatus: { $regex: filterTradeStatus, $options: "i" } },
      ];
    }
    if (filterAgents) {
      query["agents.agentName"] = { $regex: filterAgents, $options: "i" };
    }

    const sortObj: any = {};
    sortObj[sortField] = sortOrder === "asc" ? 1 : -1;

    const trades = await Trade.find(query).sort(sortObj).lean();

    return NextResponse.json({ trades }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching trades:", error);
    return NextResponse.json({ error: "Failed to fetch trades" }, { status: 500 });
  }
}

// POST /api/trades
export async function POST(request: NextRequest) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  try {
    const models = await connectToDatabase();
    const { Trade, Agent } = models;
    const body = await request.json();

    if (session.role === "agent") {
      if (!session.agentId) {
        return NextResponse.json({ error: "Agent account is not configured" }, { status: 403 });
      }
      const agent = await Agent.findById(session.agentId).lean() as any;
      if (!agent || !agent.isActive || agent.approvalStatus !== "approved") {
        return NextResponse.json({ error: "Only approved active agents can submit trades" }, { status: 403 });
      }

      body.agents = [{ agentId: agent._id, agentName: `${agent.firstName} ${agent.lastName}`.trim(), photo: agent.photo || "" }];
      body.submittedByAgentId = agent._id;
      body.deposits = [];
      body.depositTransfers = [];
      body.receipts = [];
    } else if (session.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Auto-increment tradeNumber
    const lastTrade = await Trade.findOne({}, {}, { sort: { tradeNumber: -1 } }).lean() as any;
    const nextNumber = lastTrade?.tradeNumber ? lastTrade.tradeNumber + 1 : 1;

    const trade = await Trade.create({ ...body, tradeNumber: nextNumber });
    try {
      await syncTradeBrokerageIncome(models, trade.toObject());
    } catch (incomeError) {
      // The trade is already saved. Income GET performs a safe backfill later.
      console.error("Trade saved but brokerage income sync failed:", incomeError);
    }
    return NextResponse.json({ trade }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating trade:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create trade" }, { status: 500 });
  }
}
