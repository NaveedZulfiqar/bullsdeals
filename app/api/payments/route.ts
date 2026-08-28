import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

type AccountType = "General Account" | "Commission Trust Account" | "Real Estate Trust Account";

interface ExpensePayment {
  _id?: unknown;
  description?: string;
  paymentDate?: string;
  paymentMethod?: string;
  transactionRefNo?: string;
}

interface ExpenseSource {
  _id: unknown;
  invoiceNumber?: string | number;
  invoiceDate?: string;
  category?: string;
  supplierNickName?: string;
  amount?: number;
  paymentRows?: ExpensePayment[];
}

interface TransferSource {
  _id?: unknown;
  transferDate?: string | Date;
  from?: string;
  to?: string;
  amount?: number;
  referenceNo?: string;
  purposeStory?: string;
}

interface TradeSource {
  _id: unknown;
  tradeNumber?: string | number;
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  depositTransfers?: TransferSource[];
}

interface StateSource {
  paymentId: string;
  printed?: boolean;
  cancelled?: boolean;
}

const toDateKey = (value: unknown) => {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
};

const accountFrom = (parts: unknown[]): AccountType => {
  const text = parts.filter(Boolean).join(" ").toLowerCase();
  if (/commission trust|com trust/.test(text)) return "Commission Trust Account";
  if (/real estate trust|deposit trust|trust account/.test(text)) return "Real Estate Trust Account";
  return "General Account";
};

const normalizeMethod = (value: unknown) => {
  const method = String(value || "").trim();
  const lower = method.toLowerCase();
  if (/bank transfer|bnktrf|transfer/.test(lower)) return "Bank Transfer";
  if (/bank draft|draft/.test(lower)) return "Bank Draft";
  if (/cheque|check/.test(lower)) return "Cheque";
  if (/credit card|visa|mastercard/.test(lower)) return "Credit Card";
  if (/direct deposit|branch deposit|deposit/.test(lower)) return "Direct Deposit (Branch)";
  return method || "Cheque";
};

export async function GET() {
  try {
    const { Expenditure, Trade, PaymentState } = await connectToDatabase();
    const [expenseDocuments, tradeDocuments, stateDocuments] = await Promise.all([
      Expenditure.find({}).sort({ invoiceDate: 1 }).lean(),
      Trade.find({ isActive: { $ne: false } }).sort({ tradeNumber: 1 }).lean(),
      PaymentState.find({}).lean(),
    ]);
    const expenses = expenseDocuments as unknown as ExpenseSource[];
    const trades = tradeDocuments as unknown as TradeSource[];
    const states = stateDocuments as unknown as StateSource[];
    const stateById = new Map(states.map((state) => [state.paymentId, state]));

    const expensePayments = expenses.flatMap((expense) => (expense.paymentRows || [])
      .filter((payment) => payment.paymentDate || payment.paymentMethod || payment.transactionRefNo)
      .map((payment, index) => {
        const id = `expense:${expense._id}:${payment._id || index}`;
        const state = stateById.get(id);
        const method = normalizeMethod(payment.paymentMethod);
        return {
          id,
          sourceType: "expense",
          paymentMethod: method,
          accountType: accountFrom([expense.category, payment.description]),
          chequeNo: method === "Cheque" ? payment.transactionRefNo || "" : "",
          tradeNo: expense.invoiceNumber || "",
          date: toDateKey(payment.paymentDate || expense.invoiceDate),
          fileNumber: payment.transactionRefNo || expense.invoiceNumber || "",
          amount: Number(expense.amount || 0),
          issuedTo: expense.supplierNickName || payment.description || "Supplier",
          description: payment.description || expense.category || "Expenditure payment",
          referenceNo: payment.transactionRefNo || "",
          propertyAddress: "",
          transferFrom: "",
          transferTo: expense.supplierNickName || "",
          printed: Boolean(state?.printed),
          cancelled: Boolean(state?.cancelled),
        };
      }));

    const transferPayments = trades.flatMap((trade) => (trade.depositTransfers || []).map((transfer, index) => {
      const id = `trade-transfer:${trade._id}:${transfer._id || index}`;
      const state = stateById.get(id);
      return {
        id,
        sourceType: "trade-transfer",
        paymentMethod: "Bank Transfer",
        accountType: accountFrom([transfer.from, "trust account"]),
        chequeNo: "",
        tradeNo: trade.tradeNumber || "",
        date: toDateKey(transfer.transferDate),
        fileNumber: transfer.referenceNo || "",
        amount: Number(transfer.amount || 0),
        issuedTo: transfer.to || "Commission Trust Account",
        description: transfer.purposeStory || "Trust account transfer",
        referenceNo: transfer.referenceNo || "",
        propertyAddress: [trade.street, trade.city, trade.province, trade.postalCode].filter(Boolean).join(", "),
        transferFrom: transfer.from || "Real Estate Trust Account",
        transferTo: transfer.to || "Commission Trust Account",
        printed: Boolean(state?.printed),
        cancelled: Boolean(state?.cancelled),
      };
    }));

    const payments = [...expensePayments, ...transferPayments]
      .filter((payment) => payment.date)
      .sort((left, right) => right.date.localeCompare(left.date));
    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { Expenditure, Trade, PaymentState } = await connectToDatabase();
    const body = await request.json() as { ids?: unknown; printed?: unknown; cancelled?: unknown };
    const ids = Array.isArray(body.ids) ? body.ids.filter((id): id is string => typeof id === "string" && id.length > 0) : [];
    if (!ids.length) return NextResponse.json({ error: "At least one payment is required" }, { status: 400 });

    const update: Record<string, unknown> = {};
    if (typeof body.printed === "boolean") {
      update.printed = body.printed;
      update.printedAt = body.printed ? new Date() : null;
    }
    if (typeof body.cancelled === "boolean") {
      update.cancelled = body.cancelled;
      update.cancelledAt = body.cancelled ? new Date() : null;
    }
    if (!Object.keys(update).length) return NextResponse.json({ error: "No status change supplied" }, { status: 400 });

    await Promise.all(ids.map((paymentId) => PaymentState.findOneAndUpdate(
      { paymentId }, { $set: update, $setOnInsert: { paymentId } }, { upsert: true, new: true }
    )));
    return NextResponse.json({ updated: ids.length });
  } catch (error) {
    console.error("Error updating payment state:", error);
    return NextResponse.json({ error: "Failed to update payment state" }, { status: 500 });
  }
}
