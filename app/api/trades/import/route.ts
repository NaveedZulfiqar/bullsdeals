import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { csvSampleResponse } from "@/lib/csvSample";
import { isAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
  return csvSampleResponse("trades_import_sample.csv",
    ["MLS #", "Agreement Status", "Trade Category", "Trade Type", "Street", "City", "Province", "Postal Code", "APS Price", "Commission %", "Tax %", "Our Role", "Offer Date", "Firm Date", "Completion Date", "Trade Status", "Buyer 1 Name", "Buyer 1 Email", "Seller 1 Name", "Seller 1 Email", "Agents", "OB 1 Brokerage", "OB 1 Agent", "Deposit 1 Holder", "Deposit 1 Date", "Deposit 1 Amount"],
    ["W123456", "Firm", "Residential Resale", "Co-operating", "123 Main St", "Toronto", "Ontario", "M5V 1A1", "750000", "2.5", "13", "Co-operating", "2026-07-01", "2026-07-05", "2026-08-01", "Open", "Example Buyer", "buyer@example.com", "Example Seller", "seller@example.com", "Jane Agent", "Example Brokerage", "Broker Agent", "Brokerage Trust", "2026-07-01", "25000"]);
}

// ── CSV helpers ──────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = false; }
      } else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ",") { result.push(current.trim()); current = ""; }
      else { current += ch; }
    }
  }
  result.push(current.trim());
  return result;
}

function parseDate(s: string): Date | null {
  if (!s || s === "-") return null;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  const months: Record<string, number> = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  const parts = s.split("-");
  if (parts.length === 3) {
    const day = parseInt(parts[0]), mon = months[parts[1]], yr = parseInt(parts[2]);
    if (!isNaN(day) && mon !== undefined && !isNaN(yr)) return new Date(yr, mon, day);
  }
  return null;
}

function norm(h: string) { return h.toLowerCase().replace(/[^a-z0-9]/g, ""); }

// Map normalized header → field path (dot notation for nested)
const HEADER_MAP: Record<string, string> = {
  "trade": "tradeNumber", "tradenumber": "tradeNumber", "trade#": "tradeNumber",
  "mlsnumber": "mlsNumber", "mls": "mlsNumber", "mls#": "mlsNumber",
  "agreementstatus": "agreementStatus",
  "tradecategory": "tradeCategory", "category": "tradeCategory",
  "tradetype": "tradeType", "type": "tradeType",
  "street": "street", "city": "city", "province": "province", "postalcode": "postalCode",
  "apsprice": "apsPrice", "baseprice": "basePrice",
  "commission": "commissionPercent", "commissionpercent": "commissionPercent",
  "tax": "tax", "taxpercent": "tax",
  "commissionamount": "commissionAmount",
  "ourrole": "ourRole", "weare": "ourRole",
  "otherrole": "other", "other": "other",
  "offerdate": "offerDate", "firmdate": "firmDate", "completiondate": "completionDate",
  "tradestatus": "tradeStatus", "status": "tradeStatus",
  "note": "note",
  "agents": "_agents",
  "pendingcommission": "pendingCommission",
  "pendingdisbursement": "pendingDisbursement",
  // Buyers
  "buyer1name": "_buyer1_name", "buyer1phone": "_buyer1_phone", "buyer1email": "_buyer1_email",
  "buyer1street": "_buyer1_street", "buyer1city": "_buyer1_city", "buyer1province": "_buyer1_province", "buyer1postalcode": "_buyer1_postalCode",
  "buyer2name": "_buyer2_name", "buyer2phone": "_buyer2_phone", "buyer2email": "_buyer2_email",
  "buyer2street": "_buyer2_street", "buyer2city": "_buyer2_city", "buyer2province": "_buyer2_province", "buyer2postalcode": "_buyer2_postalCode",
  "buyer3name": "_buyer3_name", "buyer3phone": "_buyer3_phone", "buyer3email": "_buyer3_email",
  "buyer3street": "_buyer3_street", "buyer3city": "_buyer3_city", "buyer3province": "_buyer3_province", "buyer3postalcode": "_buyer3_postalCode",
  // Sellers
  "seller1name": "_seller1_name", "seller1phone": "_seller1_phone", "seller1email": "_seller1_email",
  "seller1street": "_seller1_street", "seller1city": "_seller1_city", "seller1province": "_seller1_province", "seller1postalcode": "_seller1_postalCode",
  "seller2name": "_seller2_name", "seller2phone": "_seller2_phone", "seller2email": "_seller2_email",
  "seller2street": "_seller2_street", "seller2city": "_seller2_city", "seller2province": "_seller2_province", "seller2postalcode": "_seller2_postalCode",
  "seller3name": "_seller3_name", "seller3phone": "_seller3_phone", "seller3email": "_seller3_email",
  "seller3street": "_seller3_street", "seller3city": "_seller3_city", "seller3province": "_seller3_province", "seller3postalcode": "_seller3_postalCode",
  // Other Brokerages
  "ob1brokerage": "_ob1_brokerageName", "ob1agent": "_ob1_agentName", "ob1phone": "_ob1_phone", "ob1email": "_ob1_email", "ob1percentage": "_ob1_percentage",
  "ob2brokerage": "_ob2_brokerageName", "ob2agent": "_ob2_agentName", "ob2phone": "_ob2_phone", "ob2email": "_ob2_email", "ob2percentage": "_ob2_percentage",
  // Deposits
  "deposit1holder": "_dep1_depositHolder", "deposit1holdingfor": "_dep1_holdingFor", "deposit1date": "_dep1_depositDate",
  "deposit1method": "_dep1_depositMethod", "deposit1amount": "_dep1_depositAmount", "deposit1refno": "_dep1_depositRefNo",
  "deposit2holder": "_dep2_depositHolder", "deposit2holdingfor": "_dep2_holdingFor", "deposit2date": "_dep2_depositDate",
  "deposit2method": "_dep2_depositMethod", "deposit2amount": "_dep2_depositAmount", "deposit2refno": "_dep2_depositRefNo",
};

function buildTrade(raw: Record<string, string>) {
  const DATE_FIELDS = new Set(["offerDate","firmDate","completionDate"]);
  const NUM_FIELDS = new Set(["apsPrice","basePrice","commissionPercent","tax","commissionAmount","pendingCommission","pendingDisbursement","tradeNumber"]);

  const trade: any = { buyers: [], sellers: [], otherBrokerages: [], agents: [], deposits: [] };

  // Helper: fill nested array slot
  const setSlot = (arr: any[], idx: number, key: string, val: string) => {
    while (arr.length <= idx) arr.push({});
    arr[idx][key] = val;
  };

  for (const [field, val] of Object.entries(raw)) {
    if (!val) continue;

    // Nested fields
    const bMatch = field.match(/^_buyer(\d)_(.+)$/);
    if (bMatch) { setSlot(trade.buyers, parseInt(bMatch[1]) - 1, bMatch[2], val); continue; }
    const sMatch = field.match(/^_seller(\d)_(.+)$/);
    if (sMatch) { setSlot(trade.sellers, parseInt(sMatch[1]) - 1, sMatch[2], val); continue; }
    const oMatch = field.match(/^_ob(\d)_(.+)$/);
    if (oMatch) { setSlot(trade.otherBrokerages, parseInt(oMatch[1]) - 1, oMatch[2], val); continue; }
    const dMatch = field.match(/^_dep(\d)_(.+)$/);
    if (dMatch) {
      const idx = parseInt(dMatch[1]) - 1;
      const key = dMatch[2];
      while (trade.deposits.length <= idx) trade.deposits.push({});
      if (key === "depositDate") trade.deposits[idx][key] = parseDate(val);
      else if (key === "depositAmount") trade.deposits[idx][key] = parseFloat(val) || 0;
      else trade.deposits[idx][key] = val;
      continue;
    }
    if (field === "_agents") {
      trade.agents = val.split(";").map((n: string) => ({ agentName: n.trim() })).filter((a: any) => a.agentName);
      continue;
    }

    // Top-level scalar fields
    if (DATE_FIELDS.has(field)) { trade[field] = parseDate(val); }
    else if (NUM_FIELDS.has(field)) { trade[field] = parseFloat(val) || 0; }
    else { trade[field] = val; }
  }

  // Remove empty slots from arrays
  trade.buyers = trade.buyers.filter((b: any) => b.name);
  trade.sellers = trade.sellers.filter((s: any) => s.name);
  trade.otherBrokerages = trade.otherBrokerages.filter((o: any) => o.brokerageName || o.agentName);
  trade.deposits = trade.deposits.filter((d: any) => d.depositHolder || d.depositAmount);

  return trade;
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
  try {
    const { Trade } = await connectToDatabase();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
    if (lines.length < 2) return NextResponse.json({ error: "CSV must have a header row and at least one data row" }, { status: 400 });

    const rawHeaders = parseCSVLine(lines[0]);
    const fieldByIndex = rawHeaders.map(h => HEADER_MAP[norm(h)]);

    // Find the highest existing trade number
    const lastTrade = await Trade.findOne({}, {}, { sort: { tradeNumber: -1 } }).lean() as any;
    let nextNumber = (lastTrade?.tradeNumber || 0) + 1;

    const toInsert: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const raw: Record<string, string> = {};
      fieldByIndex.forEach((field, idx) => {
        if (field && idx < values.length && values[idx]) raw[field] = values[idx];
      });

      const trade = buildTrade(raw);

      // Always assign a fresh trade number (ignore CSV value to avoid duplicates)
      trade.tradeNumber = nextNumber++;

      // Default tradeStatus if not provided
      if (!trade.tradeStatus) trade.tradeStatus = "Open";

      toInsert.push(trade);
    }

    let imported = 0;
    if (toInsert.length > 0) {
      const result = await Trade.insertMany(toInsert, { ordered: false });
      imported = result.length;
    }

    return NextResponse.json({ message: `Successfully imported ${imported} trades`, imported, errors, total: lines.length - 1 }, { status: 200 });
  } catch (error: any) {
    console.error("Error importing trades:", error);
    return NextResponse.json({ error: "Failed to import trades: " + error.message }, { status: 500 });
  }
}
