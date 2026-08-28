import { NextResponse } from "next/server";
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

interface InvoiceSource {
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

interface TradeDeposit {
  _id?: unknown;
  depositDate?: string | Date;
  propertyAddress?: string;
  purpose?: string;
  depositMethod?: string;
  depositRefNo?: string;
  depositAmount?: number;
  receivedFrom?: string;
}

interface TradeReceipt {
  _id?: unknown;
  receiptDate?: string | Date;
  receiptType?: string;
  amount?: number;
  note?: string;
}

interface TradeTransfer {
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
  deposits?: TradeDeposit[];
  receipts?: TradeReceipt[];
  depositTransfers?: TradeTransfer[];
}

const toDateKey = (value: unknown) => {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
};

const getAccountType = (parts: unknown[]): AccountType => {
  const searchable = parts.filter(Boolean).join(" ").toLowerCase();
  if (/commission trust|com trust/.test(searchable)) {
    return "Commission Trust Account";
  }
  if (/real estate trust|deposit trust|trust deposit/.test(searchable)) {
    return "Real Estate Trust Account";
  }
  if (/commission/.test(searchable)) return "Commission Trust Account";
  if (/deposit/.test(searchable)) return "Real Estate Trust Account";
  return "General Account";
};

const tradeAddress = (trade: TradeSource) =>
  [trade.street, trade.city, trade.province, trade.postalCode].filter(Boolean).join(", ");

export async function GET() {
  try {
    const { Income, Expenditure, Trade } = await connectToDatabase();
    const [incomeDocuments, expenditureDocuments, tradeDocuments] = await Promise.all([
      Income.find({}).sort({ createdAt: 1 }).lean(),
      Expenditure.find({}).sort({ createdAt: 1 }).lean(),
      Trade.find({ isActive: { $ne: false } }).sort({ tradeNumber: 1 }).lean(),
    ]);

    const incomes = incomeDocuments as unknown as InvoiceSource[];
    const expenditures = expenditureDocuments as unknown as InvoiceSource[];
    const trades = tradeDocuments as unknown as TradeSource[];

    const invoiceEntries = [
      ...incomes.map((entry) => {
        const payment = entry.paymentRows?.[0] || {};
        return {
          id: `income:${entry._id}:${payment._id || 0}`,
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
          status: payment.paymentDate ? "Deposited" : "Pending",
        };
      }),
      ...expenditures.map((entry) => {
        const payment = entry.paymentRows?.[0] || {};
        return {
          id: `expense:${entry._id}:${payment._id || 0}`,
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
          status: payment.paymentDate ? "Withdrawn" : "Pending",
        };
      }),
    ];

    const tradeEntries = trades.flatMap((trade) => {
      const address = tradeAddress(trade);
      const deposits = (trade.deposits || []).map((deposit, index) => ({
        id: `trade-deposit:${trade._id}:${deposit._id || index}`,
        accountType: "Real Estate Trust Account" as AccountType,
        date: toDateKey(deposit.depositDate),
        tradeNumber: trade.tradeNumber || "",
        address: deposit.propertyAddress || address,
        description: deposit.purpose || deposit.receivedFrom || "Trade deposit",
        method: [deposit.depositMethod, deposit.depositRefNo].filter(Boolean).join(" ") || "-",
        deposit: Number(deposit.depositAmount || 0),
        withdrawal: 0,
        reconciledDate: toDateKey(deposit.depositDate),
        status: deposit.depositDate ? "Deposited" : "Pending",
      }));

      const receipts = (trade.receipts || []).map((receipt, index) => ({
        id: `trade-receipt:${trade._id}:${receipt._id || index}`,
        accountType: getAccountType([receipt.receiptType, receipt.note, "deposit"]),
        date: toDateKey(receipt.receiptDate),
        tradeNumber: trade.tradeNumber || "",
        address,
        description: receipt.note || receipt.receiptType || "Trade receipt",
        method: receipt.receiptType || "-",
        deposit: Number(receipt.amount || 0),
        withdrawal: 0,
        reconciledDate: toDateKey(receipt.receiptDate),
        status: receipt.receiptDate ? "Deposited" : "Pending",
      }));

      const transfers = (trade.depositTransfers || []).flatMap((transfer, index) => {
        const amount = Number(transfer.amount || 0);
        const date = toDateKey(transfer.transferDate);
        const description = transfer.purposeStory || `Transfer from ${transfer.from || "trust account"} to ${transfer.to || "trust account"}`;
        const fromAccount = getAccountType([transfer.from, "deposit"]);
        const toAccount = getAccountType([transfer.to, "commission"]);

        return [
          {
            id: `trade-transfer-out:${trade._id}:${transfer._id || index}`,
            accountType: fromAccount,
            date,
            tradeNumber: trade.tradeNumber || "",
            address,
            description,
            method: transfer.referenceNo || "Bank Transfer",
            deposit: 0,
            withdrawal: amount,
            reconciledDate: date,
            status: date ? "Withdrawn" : "Pending",
          },
          {
            id: `trade-transfer-in:${trade._id}:${transfer._id || index}`,
            accountType: toAccount,
            date,
            tradeNumber: trade.tradeNumber || "",
            address,
            description,
            method: transfer.referenceNo || "Bank Transfer",
            deposit: amount,
            withdrawal: 0,
            reconciledDate: date,
            status: date ? "Deposited" : "Pending",
          },
        ];
      });

      return [...deposits, ...receipts, ...transfers];
    });

    const entries = [...invoiceEntries, ...tradeEntries]
      .filter((entry) => entry.date)
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching ledger entries:", error);
    return NextResponse.json({ error: "Failed to fetch ledger entries" }, { status: 500 });
  }
}
