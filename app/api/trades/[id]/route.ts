import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSession, isAdmin } from "@/lib/auth";
import { syncTradeBrokerageIncome } from "@/lib/brokerageIncome";

// GET /api/trades/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { Trade } = await connectToDatabase();
    const { id } = await params;
    const session = getSession(request);
    if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const agentFilter = session.role === "agent" && session.agentId
      ? { $or: [{ submittedByAgentId: session.agentId }, { "agents.agentId": session.agentId }] }
      : {};
    if (session.role !== "admin" && !session.agentId) return NextResponse.json({ error: "Access denied" }, { status: 403 });
    const trade = await Trade.findOne({ _id: id, ...agentFilter }).lean();
    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }
    return NextResponse.json({ trade }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching trade:", error);
    return NextResponse.json({ error: "Failed to fetch trade" }, { status: 500 });
  }
}

// PUT /api/trades/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Only administrators can change submitted trades" }, { status: 403 });
  }
  try {
    const models = await connectToDatabase();
    const { Trade } = models;
    const { id } = await params;
    const body = await request.json();

    // Don't allow overwriting tradeNumber
    delete body.tradeNumber;

    const trade = await Trade.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    try {
      await syncTradeBrokerageIncome(models, trade);
    } catch (incomeError) {
      // The trade update must not be reported as failed after it was committed.
      console.error("Trade updated but brokerage income sync failed:", incomeError);
    }

    return NextResponse.json({ trade }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating trade:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update trade" }, { status: 500 });
  }
}

// DELETE /api/trades/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Only administrators can delete trades" }, { status: 403 });
  }
  try {
    const { Trade, Income } = await connectToDatabase();
    const { id } = await params;
    const trade = await Trade.findByIdAndDelete(id);
    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }
    await Income.deleteMany({ sourceType: "trade", sourceId: id });
    return NextResponse.json({ message: "Trade deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting trade:", error);
    return NextResponse.json({ error: "Failed to delete trade" }, { status: 500 });
  }
}
