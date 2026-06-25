import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import OtherBrokerage from "@/models/OtherBrokerage";

// GET /api/other-brokerages/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const brokerage = await OtherBrokerage.findById(id).lean();
    if (!brokerage) {
      return NextResponse.json({ error: "Brokerage not found" }, { status: 404 });
    }
    return NextResponse.json({ brokerage }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching brokerage:", error);
    return NextResponse.json({ error: "Failed to fetch brokerage" }, { status: 500 });
  }
}

// PUT /api/other-brokerages/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const brokerage = await OtherBrokerage.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!brokerage) {
      return NextResponse.json({ error: "Brokerage not found" }, { status: 404 });
    }
    return NextResponse.json({ brokerage }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating brokerage:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update brokerage" }, { status: 500 });
  }
}

// DELETE /api/other-brokerages/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const brokerage = await OtherBrokerage.findByIdAndDelete(id);
    if (!brokerage) {
      return NextResponse.json({ error: "Brokerage not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Brokerage deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting brokerage:", error);
    return NextResponse.json({ error: "Failed to delete brokerage" }, { status: 500 });
  }
}
