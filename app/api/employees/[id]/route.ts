import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

// GET /api/employees/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { Employee } = await connectToDatabase();
    const { id } = await params;
    const employee = await Employee.findById(id).lean();
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    return NextResponse.json({ employee }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 });
  }
}

// PUT /api/employees/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { Employee } = await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const employee = await Employee.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    return NextResponse.json({ employee }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ValidationError") return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

// DELETE /api/employees/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { Employee } = await connectToDatabase();
    const { id } = await params;
    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    return NextResponse.json({ message: "Employee deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}
