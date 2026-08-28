import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { syncMonthlyBrokerageIncome } from "@/lib/brokerageIncome";

type Category = "Desk Fee" | "Rent Receivables";

interface AgentSource {
  _id: unknown;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  officeNickName?: string;
  deskFeeHstPerMonth?: string;
  deskFeeStartDate?: Date | string;
  deskFeeOption?: string;
}

interface TenantSource {
  _id: unknown;
  tenantName: string;
  additionalName?: string;
  monthlyRent?: number;
  rentStartDate?: string;
}

interface CollectionSource {
  _id: unknown;
  sourceType: "agent" | "tenant";
  sourceId: string;
  category: Category;
  month: string;
  netAmount?: number;
  hst?: number;
  grossAmount?: number;
  paymentMethod?: string;
  referenceNo?: string;
  receiptDate?: string;
  invoiceNo?: number | null;
  status?: "Pending" | "Received";
}

const moneyNumber = (value: unknown) => {
  const parsed = Number(String(value ?? "0").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const sourceActiveInMonth = (startDate: Date | string | undefined, month: string) => {
  if (!startDate) return true;
  const start = startDate instanceof Date
    ? startDate.toISOString().slice(0, 7)
    : String(startDate).slice(0, 7);
  return start <= month;
};

export async function GET(request: NextRequest) {
  try {
    const models = await connectToDatabase();
    const { Agent, MonthlyCollection, MonthlyTenant } = models;
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get("category") || "Desk Fee") as Category;
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

    if (!(["Desk Fee", "Rent Receivables"] as string[]).includes(category)) {
      return NextResponse.json({ error: "Invalid collection category" }, { status: 400 });
    }

    const [agentDocuments, tenantDocuments, collectionDocuments] = await Promise.all([
      category === "Desk Fee"
        ? Agent.find({ isActive: true, deskFeeOption: "agent_pay" }).sort({ firstName: 1 }).lean()
        : Promise.resolve([]),
      category === "Rent Receivables"
        ? MonthlyTenant.find({ isActive: true }).sort({ tenantName: 1 }).lean()
        : Promise.resolve([]),
      MonthlyCollection.find({ category, month }).lean(),
    ]);

    const agents = agentDocuments as unknown as AgentSource[];
    const tenants = tenantDocuments as unknown as TenantSource[];
    const collections = collectionDocuments as unknown as CollectionSource[];
    const saved = new Map(collections.map((collection) => [
      `${collection.sourceType}:${collection.sourceId}`,
      collection,
    ]));

    const sources = category === "Desk Fee"
      ? agents
          .filter((agent) => sourceActiveInMonth(agent.deskFeeStartDate, month))
          .map((agent) => ({
            sourceType: "agent" as const,
            sourceId: String(agent._id),
            name: agent.officeNickName || [agent.firstName, agent.middleName, agent.lastName].filter(Boolean).join(" "),
            amount: moneyNumber(agent.deskFeeHstPerMonth),
          }))
      : tenants
          .filter((tenant) => sourceActiveInMonth(tenant.rentStartDate, month))
          .map((tenant) => ({
            sourceType: "tenant" as const,
            sourceId: String(tenant._id),
            name: [tenant.tenantName, tenant.additionalName].filter(Boolean).join(" / "),
            amount: Number(tenant.monthlyRent || 0),
          }));

    const rows = sources.map((source) => {
      const existing = saved.get(`${source.sourceType}:${source.sourceId}`);
      const netAmount = existing?.netAmount ?? source.amount;
      const hst = existing?.hst ?? Number((netAmount * 0.13).toFixed(2));
      return {
        id: existing ? String(existing._id) : `${source.sourceType}:${source.sourceId}:${month}`,
        persisted: Boolean(existing),
        sourceType: source.sourceType,
        sourceId: source.sourceId,
        category,
        name: source.name,
        netAmount,
        hst,
        grossAmount: existing?.grossAmount ?? Number((netAmount + hst).toFixed(2)),
        paymentMethod: existing?.paymentMethod || "",
        referenceNo: existing?.referenceNo || "",
        month: Number(month.slice(5, 7)),
        year: Number(month.slice(0, 4)),
        receiptDate: existing?.receiptDate || "",
        invoiceNo: existing?.invoiceNo || "",
        status: existing?.status || "Pending",
      };
    });

    return NextResponse.json({ rows, month, category });
  } catch (error) {
    console.error("Error fetching monthly collection:", error);
    return NextResponse.json({ error: "Failed to fetch monthly collection" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const models = await connectToDatabase();
    const { MonthlyCollection, MonthlyTenant } = models;
    const body = await request.json();

    if (body.action === "addTenant") {
      if (!body.tenantName?.trim() || !body.rentStartDate || Number(body.monthlyRent) < 0) {
        return NextResponse.json(
          { error: "Tenant name, monthly rent and rent start date are required" },
          { status: 400 }
        );
      }
      const tenant = await MonthlyTenant.create({
        tenantName: body.tenantName,
        additionalName: body.additionalName || "",
        street: body.street || "",
        city: body.city || "",
        province: body.province || "ONT",
        postalCode: body.postalCode || "",
        monthlyRent: Number(body.monthlyRent || 0),
        rentStartDate: body.rentStartDate,
        hstNumber: body.hstNumber || "",
        category: "Rent Receivables",
      });
      return NextResponse.json({ tenant }, { status: 201 });
    }

    if (body.action === "saveRows" && Array.isArray(body.rows)) {
      const operations = body.rows.map((row: Record<string, unknown>) => ({
        updateOne: {
          filter: {
            sourceType: row.sourceType,
            sourceId: row.sourceId,
            category: row.category,
            month: body.month,
          },
          update: {
            $set: {
              netAmount: Number(row.netAmount || 0),
              hst: Number(row.hst || 0),
              grossAmount: Number(row.grossAmount || 0),
              paymentMethod: String(row.paymentMethod || ""),
              referenceNo: String(row.referenceNo || ""),
              receiptDate: String(row.receiptDate || ""),
              invoiceNo: row.invoiceNo ? Number(row.invoiceNo) : null,
              status: row.receiptDate ? "Received" : "Pending",
            },
            $setOnInsert: {
              sourceType: row.sourceType,
              sourceId: row.sourceId,
              category: row.category,
              month: body.month,
            },
          },
          upsert: true,
        },
      }));
      if (operations.length) await MonthlyCollection.bulkWrite(operations);
      try {
        await syncMonthlyBrokerageIncome(
          models,
          body.rows.map((row: Record<string, unknown>) => ({ ...row, month: body.month }))
        );
      } catch (incomeError) {
        console.error("Monthly payment saved but income sync failed:", incomeError);
      }
      return NextResponse.json({ success: true });
    }

    if (body.action === "generateInvoices" && Array.isArray(body.rows)) {
      const last = await MonthlyCollection.findOne({ invoiceNo: { $ne: null } })
        .sort({ invoiceNo: -1 })
        .select({ invoiceNo: 1 })
        .lean() as unknown as { invoiceNo?: number } | null;
      let nextInvoice = Number(last?.invoiceNo || 0) + 1;
      const generated = body.rows.map((row: Record<string, unknown>) => ({
        ...row,
        invoiceNo: row.invoiceNo || nextInvoice++,
      }));

      const operations = generated.map((row: Record<string, unknown>) => ({
        updateOne: {
          filter: {
            sourceType: row.sourceType,
            sourceId: row.sourceId,
            category: row.category,
            month: body.month,
          },
          update: {
            $set: {
              netAmount: Number(row.netAmount || 0),
              hst: Number(row.hst || 0),
              grossAmount: Number(row.grossAmount || 0),
              paymentMethod: String(row.paymentMethod || ""),
              referenceNo: String(row.referenceNo || ""),
              receiptDate: String(row.receiptDate || ""),
              invoiceNo: Number(row.invoiceNo),
              status: row.receiptDate ? "Received" : "Pending",
            },
            $setOnInsert: {
              sourceType: row.sourceType,
              sourceId: row.sourceId,
              category: row.category,
              month: body.month,
            },
          },
          upsert: true,
        },
      }));
      if (operations.length) await MonthlyCollection.bulkWrite(operations);
      try {
        await syncMonthlyBrokerageIncome(
          models,
          generated.map((row: Record<string, unknown>) => ({ ...row, month: body.month }))
        );
      } catch (incomeError) {
        console.error("Monthly invoices generated but income sync failed:", incomeError);
      }
      return NextResponse.json({ rows: generated });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating monthly collection:", error);
    return NextResponse.json({ error: "Failed to update monthly collection" }, { status: 500 });
  }
}
