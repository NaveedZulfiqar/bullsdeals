import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

type AccountType =
  | "General Account"
  | "Commission Trust Account"
  | "Real Estate Trust Account";

interface PaymentSource {
  _id?: unknown;
  description?: string;
  paymentDate?: string;
  paymentMethod?: string;
  transactionRefNo?: string;
}

interface LedgerSource {
  _id: unknown;
  invoiceNumber?: string | number;
  invoiceDate?: string;
  category?: string;
  customer?: string;
  customerNickName?: string;
  supplierNickName?: string;
  address?: string;
  amount?: number;
  paymentRows?: PaymentSource[];
}

const getAccountType = (parts: unknown[]): AccountType => {
  const searchable = parts.filter(Boolean).join(" ").toLowerCase();

  if (/real estate trust|deposit trust|trust deposit|deposit/.test(searchable)) {
    return "Real Estate Trust Account";
  }

  if (/commission trust|commission/.test(searchable)) {
    return "Commission Trust Account";
  }

  return "General Account";
};

const toDateKey = (value: unknown) => {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
};

export async function GET() {
  try {
    const { Income, Expenditure, Reconciliation } = await connectToDatabase();

    const [incomes, expenditures, history] = await Promise.all([
      Income.find({}).sort({ createdAt: 1 }).lean(),
      Expenditure.find({}).sort({ createdAt: 1 }).lean(),
      Reconciliation.find({}).sort({ createdAt: -1 }).limit(100).lean(),
    ]);

    const incomeSources = incomes as unknown as LedgerSource[];
    const expenditureSources = expenditures as unknown as LedgerSource[];

    const entries = [
      ...incomeSources.map((entry) => {
        const payment = entry.paymentRows?.[0] || {};
        return {
          id: `income:${entry._id}:${payment._id || 0}`,
          sourceId: String(entry._id),
          sourceType: "income",
          accountType: getAccountType([
            entry.category,
            entry.customer,
            payment.description,
            payment.paymentMethod,
          ]),
          date: toDateKey(payment.paymentDate || entry.invoiceDate),
          tradeNumber: entry.invoiceNumber || "",
          address: entry.address || "",
          description:
            payment.description || entry.customer || entry.customerNickName || entry.category || "Income",
          method: payment.transactionRefNo || payment.paymentMethod || "-",
          deposit: Number(entry.amount || 0),
          withdrawal: 0,
          reconciledDate: toDateKey(payment.paymentDate),
          status: payment.paymentDate ? "Cleared" : "Pending",
        };
      }),
      ...expenditureSources.map((entry) => {
        const payment = entry.paymentRows?.[0] || {};
        return {
          id: `expense:${entry._id}:${payment._id || 0}`,
          sourceId: String(entry._id),
          sourceType: "expense",
          accountType: getAccountType([
            entry.category,
            entry.supplierNickName,
            payment.description,
            payment.paymentMethod,
          ]),
          date: toDateKey(payment.paymentDate || entry.invoiceDate),
          tradeNumber: entry.invoiceNumber || "",
          address: entry.address || "",
          description:
            payment.description || entry.supplierNickName || entry.category || "Expenditure",
          method: payment.transactionRefNo || payment.paymentMethod || "-",
          deposit: 0,
          withdrawal: Number(entry.amount || 0),
          reconciledDate: toDateKey(payment.paymentDate),
          status: payment.paymentDate ? "Cleared" : "Pending",
        };
      }),
    ].sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ entries, history });
  } catch (error) {
    console.error("Error fetching reconciliation entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch reconciliation entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { Income, Expenditure, Reconciliation } = await connectToDatabase();
    const body = await request.json();

    if (!body.accountType || !body.asOn) {
      return NextResponse.json(
        { error: "Account type and reconciliation date are required" },
        { status: 400 }
      );
    }

    const reconciliation = await Reconciliation.create({
      accountType: body.accountType,
      bankBalance: Number(body.bankBalance || 0),
      asOn: body.asOn,
      rows: Array.isArray(body.rows) ? body.rows : [],
    });

    return NextResponse.json({ reconciliation }, { status: 201 });
  } catch (error) {
    console.error("Error saving reconciliation:", error);
    return NextResponse.json(
      { error: "Failed to save reconciliation" },
      { status: 500 }
    );
  }
}
