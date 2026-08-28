import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getExportFilter } from "@/lib/exportIds";
import { isAdmin } from "@/lib/auth";

const esc = (val: any): string => {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const fmtDate = (d: any): string => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${String(dt.getDate()).padStart(2,"0")}-${months[dt.getMonth()]}-${dt.getFullYear()}`;
};

const fmtArr = (arr: any[], field: string) =>
  Array.isArray(arr) ? arr.map(x => x[field] || "").filter(Boolean).join("; ") : "";

export async function GET(request: Request) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
  try {
    const { Trade } = await connectToDatabase();
    const filter = getExportFilter(request);
    const status = new URL(request.url).searchParams.get("status");
    if (status === "Open" || status === "Closed") {
      filter.tradeStatus = status;
    }
    const trades = await Trade.find(filter).sort({ tradeNumber: 1 }).lean();

    const headers = [
      "Trade #", "MLS #", "Agreement Status", "Trade Category", "Trade Type",
      "Street", "City", "Province", "Postal Code",
      "APS Price", "Base Price", "Commission %", "Tax %", "Commission Amount",
      "Our Role", "Other Role",
      "Offer Date", "Firm Date", "Completion Date",
      "Trade Status", "Note",
      // Buyers (up to 3)
      "Buyer 1 Name", "Buyer 1 Phone", "Buyer 1 Email", "Buyer 1 Street", "Buyer 1 City", "Buyer 1 Province", "Buyer 1 Postal Code",
      "Buyer 2 Name", "Buyer 2 Phone", "Buyer 2 Email", "Buyer 2 Street", "Buyer 2 City", "Buyer 2 Province", "Buyer 2 Postal Code",
      "Buyer 3 Name", "Buyer 3 Phone", "Buyer 3 Email", "Buyer 3 Street", "Buyer 3 City", "Buyer 3 Province", "Buyer 3 Postal Code",
      // Sellers (up to 3)
      "Seller 1 Name", "Seller 1 Phone", "Seller 1 Email", "Seller 1 Street", "Seller 1 City", "Seller 1 Province", "Seller 1 Postal Code",
      "Seller 2 Name", "Seller 2 Phone", "Seller 2 Email", "Seller 2 Street", "Seller 2 City", "Seller 2 Province", "Seller 2 Postal Code",
      "Seller 3 Name", "Seller 3 Phone", "Seller 3 Email", "Seller 3 Street", "Seller 3 City", "Seller 3 Province", "Seller 3 Postal Code",
      // Agents
      "Agents",
      // Other Brokerages (up to 2)
      "OB 1 Brokerage", "OB 1 Agent", "OB 1 Phone", "OB 1 Email", "OB 1 Percentage",
      "OB 2 Brokerage", "OB 2 Agent", "OB 2 Phone", "OB 2 Email", "OB 2 Percentage",
      // Deposits (up to 2)
      "Deposit 1 Holder", "Deposit 1 Holding For", "Deposit 1 Date", "Deposit 1 Method", "Deposit 1 Amount", "Deposit 1 Ref No",
      "Deposit 2 Holder", "Deposit 2 Holding For", "Deposit 2 Date", "Deposit 2 Method", "Deposit 2 Amount", "Deposit 2 Ref No",
      // Pending
      "Pending Commission", "Pending Disbursement",
    ];

    const rows = (trades as any[]).map(t => {
      const buyers = t.buyers || [];
      const sellers = t.sellers || [];
      const agents = t.agents || [];
      const obs = t.otherBrokerages || [];
      const deps = t.deposits || [];

      const buyerCols: string[] = [];
      for (let i = 0; i < 3; i++) {
        const b = buyers[i];
        buyerCols.push(b?.name||"", b?.phone||"", b?.email||"", b?.street||"", b?.city||"", b?.province||"", b?.postalCode||"");
      }
      const sellerCols: string[] = [];
      for (let i = 0; i < 3; i++) {
        const s = sellers[i];
        sellerCols.push(s?.name||"", s?.phone||"", s?.email||"", s?.street||"", s?.city||"", s?.province||"", s?.postalCode||"");
      }
      const obCols: string[] = [];
      for (let i = 0; i < 2; i++) {
        const o = obs[i];
        obCols.push(o?.brokerageName||"", o?.agentName||"", o?.phone||"", o?.email||"", o?.percentage!=null?String(o.percentage):"");
      }
      const depCols: string[] = [];
      for (let i = 0; i < 2; i++) {
        const d = deps[i];
        depCols.push(d?.depositHolder||"", d?.holdingFor||"", fmtDate(d?.depositDate), d?.depositMethod||"", d?.depositAmount!=null?String(d.depositAmount):"", d?.depositRefNo||"");
      }

      return [
        t.tradeNumber, t.mlsNumber, t.agreementStatus, t.tradeCategory, t.tradeType,
        t.street, t.city, t.province, t.postalCode,
        t.apsPrice, t.basePrice, t.commissionPercent, t.tax, t.commissionAmount,
        t.ourRole, t.other,
        fmtDate(t.offerDate), fmtDate(t.firmDate), fmtDate(t.completionDate),
        t.tradeStatus, t.note,
        ...buyerCols,
        ...sellerCols,
        agents.map((a: any) => a.agentName || "").filter(Boolean).join("; "),
        ...obCols,
        ...depCols,
        t.pendingCommission, t.pendingDisbursement,
      ].map(esc).join(",");
    });

    const csv = [headers.map(esc).join(","), ...rows].join("\n");
    const date = new Date().toISOString().split("T")[0];

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="trades_export_${date}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting trades:", error);
    return NextResponse.json({ error: "Failed to export trades" }, { status: 500 });
  }
}
