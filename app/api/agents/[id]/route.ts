import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";

function canAccessAgent(request: NextRequest, id: string) {
  const session = getSession(request);
  return session?.role === "admin" || (session?.role === "agent" && session.agentId === id);
}

// GET /api/agents/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { Agent } = await connectToDatabase();
    const { id } = await params;
    if (!canAccessAgent(request, id)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    const agent = await Agent.findById(id).lean();

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ agent }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching agent:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent" },
      { status: 500 }
    );
  }
}

// PUT /api/agents/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { Agent } = await connectToDatabase();
    const { id } = await params;
    const session = getSession(request);
    if (!canAccessAgent(request, id)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    const body = await request.json();

    delete body.password;
    delete body.approvalStatus;
    delete body.registeredByAgent;
    delete body.reviewedAt;
    if (session?.role === "agent") {
      delete body.isActive;
      delete body.email;
    }

    const agent = await Agent.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ agent }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating agent:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { Agent } = await connectToDatabase();
    const { id } = await params;

    if (getSession(request)?.role !== "admin") {
      return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
    }

    const agent = await Agent.findByIdAndDelete(id);

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Agent deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting agent:", error);
    return NextResponse.json(
      { error: "Failed to delete agent" },
      { status: 500 }
    );
  }
}
