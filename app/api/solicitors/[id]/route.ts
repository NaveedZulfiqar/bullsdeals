import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Solicitor from "@/models/Solicitor";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const solicitor = await Solicitor.findById(id).lean();
    if (!solicitor) return NextResponse.json({ error: "Solicitor not found" }, { status: 404 });
    return NextResponse.json({ solicitor }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch solicitor" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const solicitor = await Solicitor.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();
    if (!solicitor) return NextResponse.json({ error: "Solicitor not found" }, { status: 404 });
    return NextResponse.json({ solicitor }, { status: 200 });
  } catch (error: any) {
    if (error.name === "ValidationError") return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "Failed to update solicitor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const solicitor = await Solicitor.findByIdAndDelete(id);
    if (!solicitor) return NextResponse.json({ error: "Solicitor not found" }, { status: 404 });
    return NextResponse.json({ message: "Solicitor deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete solicitor" }, { status: 500 });
  }
}
