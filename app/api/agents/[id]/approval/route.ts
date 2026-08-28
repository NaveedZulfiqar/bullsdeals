import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { isAdmin } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
  }

  try {
    const { status } = await request.json();
    if (!(["approved", "rejected"] as const).includes(status)) {
      return NextResponse.json({ error: "Invalid approval status" }, { status: 400 });
    }

    const { Agent } = await connectToDatabase();
    const { id } = await params;
    const agent = await Agent.findByIdAndUpdate(
      id,
      { approvalStatus: status, reviewedAt: new Date() },
      { returnDocument: "after", runValidators: true }
    ).lean();

    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    return NextResponse.json({ agent });
  } catch (error) {
    console.error("Agent approval error:", error);
    return NextResponse.json({ error: "Could not update application" }, { status: 500 });
  }
}
