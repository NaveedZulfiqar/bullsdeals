import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { Expenditure } = await connectToDatabase();
    // Get unique suppliers by grouping by supplierNickName and picking the latest one
    const suppliers = await Expenditure.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$supplierNickName",
          supplierNickName: { $first: "$supplierNickName" },
          address: { $first: "$address" },
          hstNumber: { $first: "$hstNumber" },
          phone: { $first: "$phone" },
          email: { $first: "$email" },
        }
      },
      { $sort: { supplierNickName: 1 } }
    ]);
    return NextResponse.json({ success: true, suppliers }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}
