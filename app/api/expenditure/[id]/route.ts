import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { Expenditure } = await connectToDatabase();
    const { id } = await params;
    const expenditure = await Expenditure.findById(id).lean();
    if (!expenditure)
      return NextResponse.json({ error: "Expenditure not found" }, { status: 404 });
    return NextResponse.json({ expenditure }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch expenditure" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { Expenditure } = await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const expenditure = await Expenditure.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!expenditure)
      return NextResponse.json({ error: "Expenditure not found" }, { status: 404 });
    return NextResponse.json({ expenditure }, { status: 200 });
  } catch (error: any) {
    if (error.name === "ValidationError")
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "Failed to update expenditure" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { Expenditure } = await connectToDatabase();
    const { id } = await params;
    const expenditure = await Expenditure.findByIdAndDelete(id);
    if (!expenditure)
      return NextResponse.json({ error: "Expenditure not found" }, { status: 404 });
    return NextResponse.json({ message: "Expenditure deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete expenditure" }, { status: 500 });
  }
}
