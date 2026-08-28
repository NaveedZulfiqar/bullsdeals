import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

interface EmployeeSource {
  _id: unknown;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  photo?: string;
  payType?: string;
  payFrequency?: string;
  payRate?: string;
  employeeStatus?: string;
  cppExempted?: boolean;
  eiExempted?: boolean;
  vacationPolicy?: string;
}

interface RunSource {
  _id: unknown;
  employeeId: unknown;
  status: "Generated" | "Paid";
}

const parseMoney = (value: unknown) => {
  const parsed = Number(String(value ?? "0").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const addDays = (value: string, days: number) => {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const frequencyKey = (value: string) =>
  /bi|semi/i.test(value) ? "BIWEEKLY" : "WEEKLY";

export async function GET(request: NextRequest) {
  try {
    const { Employee, PayrollRun, PayrollSetting } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const periodEndDate = searchParams.get("periodEndDate") || new Date().toISOString().slice(0, 10);
    const showPaid = searchParams.get("showPaid") === "true";

    const [employeeDocuments, runDocuments, settingDocuments] = await Promise.all([
      Employee.find({ isActive: { $ne: false } }).sort({ firstName: 1 }).lean(),
      PayrollRun.find({ periodEndDate }).lean(),
      PayrollSetting.find({}).lean(),
    ]);
    const employees = employeeDocuments as unknown as EmployeeSource[];
    const runs = runDocuments as unknown as RunSource[];
    const settings = settingDocuments as unknown as Array<{ frequency: "WEEKLY" | "BIWEEKLY"; dueDays: number }>;
    const runByEmployee = new Map(runs.map((run) => [String(run.employeeId), run]));
    const dueByFrequency = new Map(settings.map((setting) => [setting.frequency, setting.dueDays]));

    const rows = employees.flatMap((employee) => {
      if (!employee.payFrequency) return [];
      const frequency = frequencyKey(employee.payFrequency);
      const run = runByEmployee.get(String(employee._id));
      if (!showPaid && run?.status === "Paid") return [];
      const periodDays = frequency === "BIWEEKLY" ? 13 : 6;
      const periodStartDate = addDays(periodEndDate, -periodDays);
      const payDueDate = addDays(periodEndDate, dueByFrequency.get(frequency) || 0);
      return [{
        id: String(run?._id || `employee:${employee._id}:${periodEndDate}`),
        employeeId: String(employee._id),
        photo: employee.photo || "",
        name: [employee.firstName, employee.middleName, employee.lastName].filter(Boolean).join(" "),
        paymentType: employee.payType || "-",
        paymentFrequency: employee.payFrequency || "-",
        periodStartDate,
        periodEndDate,
        payDueDate,
        employeeStatus: employee.employeeStatus || "-",
        cppExempt: Boolean(employee.cppExempted),
        eiExempt: Boolean(employee.eiExempted),
        vacationPolicy: employee.vacationPolicy || "-",
        salary: parseMoney(employee.payRate),
        payrollStatus: run?.status || "Not Generated",
      }];
    });
    return NextResponse.json({ rows });
  } catch (error) {
    console.error("Error generating payroll list:", error);
    return NextResponse.json({ error: "Failed to load payroll" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { Employee, PayrollRun, PayrollSetting } = await connectToDatabase();
    const body = await request.json();
    if (!body.employeeId || !body.periodStartDate || !body.periodEndDate || !body.payDueDate) {
      return NextResponse.json({ error: "Employee and payroll period are required" }, { status: 400 });
    }
    const status = body.status === "Paid" ? "Paid" : "Generated";
    const run = await PayrollRun.findOneAndUpdate(
      { employeeId: body.employeeId, periodEndDate: body.periodEndDate },
      {
        $set: {
          periodStartDate: body.periodStartDate,
          payDueDate: body.payDueDate,
          salary: Number(body.salary || 0),
          status,
          paidAt: status === "Paid" ? new Date() : null,
        },
        $setOnInsert: { employeeId: body.employeeId, periodEndDate: body.periodEndDate },
      },
      { new: true, upsert: true, runValidators: true }
    ).lean();
    return NextResponse.json({ run });
  } catch (error) {
    console.error("Error saving payroll run:", error);
    return NextResponse.json({ error: "Failed to save payroll run" }, { status: 500 });
  }
}
