import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

const defaults = {
  WEEKLY: { frequency: "WEEKLY", startDate: `${new Date().getFullYear()}-01-01`, dueDays: 0 },
  BIWEEKLY: { frequency: "BIWEEKLY", startDate: `${new Date().getFullYear()}-01-01`, dueDays: 0 },
};

export async function GET() {
  try {
    const { PayrollSetting } = await connectToDatabase();
    const documents = await PayrollSetting.find({}).lean() as unknown as Array<{
      frequency: "WEEKLY" | "BIWEEKLY";
      startDate: string;
      dueDays: number;
    }>;
    const settings = { ...defaults };
    documents.forEach((document) => {
      settings[document.frequency] = {
        frequency: document.frequency,
        startDate: document.startDate,
        dueDays: document.dueDays,
      };
    });
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching payroll settings:", error);
    return NextResponse.json({ error: "Failed to fetch payroll settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { PayrollSetting } = await connectToDatabase();
    const body = await request.json();
    if (!(["WEEKLY", "BIWEEKLY"] as string[]).includes(body.frequency) || !body.startDate) {
      return NextResponse.json({ error: "Frequency and payroll start date are required" }, { status: 400 });
    }
    const dueDays = Number(body.dueDays);
    if (!Number.isInteger(dueDays) || dueDays < 0 || dueDays > 60) {
      return NextResponse.json({ error: "Due in days must be between 0 and 60" }, { status: 400 });
    }
    const setting = await PayrollSetting.findOneAndUpdate(
      { frequency: body.frequency },
      { $set: { startDate: body.startDate, dueDays }, $setOnInsert: { frequency: body.frequency } },
      { new: true, upsert: true, runValidators: true }
    ).lean();
    return NextResponse.json({ setting });
  } catch (error) {
    console.error("Error updating payroll settings:", error);
    return NextResponse.json({ error: "Failed to update payroll settings" }, { status: 500 });
  }
}
