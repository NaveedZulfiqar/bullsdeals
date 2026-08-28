import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

// GET /api/expenditure
export async function GET(request: NextRequest) {
  try {
    const { Expenditure } = await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page      = Math.max(1, parseInt(searchParams.get("page")     || "1"));
    const pageSize  = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "25")));

    const filterDate        = searchParams.get("filterDate")        || "";
    const filterInvoiceNo   = searchParams.get("filterInvoiceNo")   || "";
    const filterSupplier    = searchParams.get("filterSupplier")    || "";
    const filterCategory    = searchParams.get("filterCategory")    || "";
    const filterRefNo       = searchParams.get("filterRefNo")       || "";
    const filterMethod      = searchParams.get("filterMethod")      || "";

    const query: any = {};

    if (filterInvoiceNo) {
      const n = parseInt(filterInvoiceNo);
      if (!isNaN(n)) query.invoiceNumber = n;
    }
    if (filterSupplier) query.supplierNickName = { $regex: filterSupplier, $options: "i" };
    if (filterCategory) query.category         = { $regex: filterCategory, $options: "i" };
    if (filterRefNo)    query["paymentRows.transactionRefNo"] = { $regex: filterRefNo, $options: "i" };
    if (filterMethod)   query["paymentRows.paymentMethod"]    = { $regex: filterMethod, $options: "i" };
    if (filterDate) {
      const d = new Date(filterDate);
      if (!isNaN(d.getTime())) {
        const next = new Date(d);
        next.setDate(next.getDate() + 1);
        query.invoiceDate = {
          $gte: d.toISOString().split("T")[0],
          $lt:  next.toISOString().split("T")[0],
        };
      }
    }

    const sortObj: any = {};
    sortObj[sortField] = sortOrder === "asc" ? 1 : -1;

    const total        = await Expenditure.countDocuments(query);
    const expenditures = await Expenditure.find(query)
      .sort(sortObj)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return NextResponse.json({ expenditures, total, page, pageSize }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching expenditure:", error);
    return NextResponse.json({ error: "Failed to fetch expenditure" }, { status: 500 });
  }
}

// POST /api/expenditure
export async function POST(request: NextRequest) {
  try {
    const { Expenditure } = await connectToDatabase();
    const body = await request.json();

    if (!body.invoiceNumber) {
      const last = await Expenditure.findOne({}).sort({ invoiceNumber: -1 }).lean() as any;
      body.invoiceNumber = last ? (last.invoiceNumber || 0) + 1 : 1;
    }

    const expenditure = await Expenditure.create(body);
    return NextResponse.json({ expenditure }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating expenditure:", error);
    if (error.name === "ValidationError")
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "Failed to create expenditure" }, { status: 500 });
  }
}
