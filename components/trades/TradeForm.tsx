"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { THead } from "./ui";
import TabTrade from "./TabTrade";
import TabBuyer from "./TabBuyer";
import TabSeller from "./TabSeller";
import TabOtherBrokerage from "./TabOtherBrokerage";
import TabAgents from "./TabAgents";
import TabDeposit from "./TabDeposit";
import TabDepositTransfer from "./TabDepositTransfer";
import TabReceipts from "./TabReceipts";
import TabDocuments from "./TabDocuments";
import {
  Buyer, Seller, OtherBrokerage, TradeAgent, Deposit, DepositTransfer, Receipt,
  AgentOption, BrokerageOption, TradeFormData, TradeFormProps,
  TABS, mkBuyer, mkSeller, mkOB, mkDeposit, mkDepositTransfer, mkReceipt,
  toDateInput, fmtCurrency,
} from "./types";

export default function TradeForm({ initialData, tradeId, tradeNumber, agentMode = false }: TradeFormProps) {
  const router = useRouter();
  const isEdit = !!tradeId;
  const [activeTab, setActiveTab] = useState("Trade");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agentOptions, setAgentOptions] = useState<AgentOption[]>([]);
  const [brokerageOptions, setBrokerageOptions] = useState<BrokerageOption[]>([]);

  const [tf, setTf] = useState<TradeFormData>({
    mlsNumber: initialData?.mlsNumber ?? "", agreementStatus: initialData?.agreementStatus ?? "",
    tradeCategory: initialData?.tradeCategory ?? "", tradeType: initialData?.tradeType ?? "",
    street: initialData?.street ?? "", city: initialData?.city ?? "",
    province: initialData?.province ?? "Ontario", postalCode: initialData?.postalCode ?? "",
    apsPrice: String(initialData?.apsPrice ?? ""), basePrice: String(initialData?.basePrice ?? ""),
    commissionPercent: String(initialData?.commissionPercent ?? "0"), tax: String(initialData?.tax ?? "13"),
    commissionAmount: String(initialData?.commissionAmount ?? ""),
    ourRole: initialData?.ourRole ?? "", other: initialData?.other ?? "",
    offerDate: toDateInput(initialData?.offerDate), firmDate: toDateInput(initialData?.firmDate),
    completionDate: toDateInput(initialData?.completionDate), note: initialData?.note ?? "",
  });

  const [buyers, setBuyers] = useState<Buyer[]>(() => (initialData?.buyers ?? []).map((b: any) => ({ ...b, id: b._id ?? crypto.randomUUID() })));
  const [buyerNote, setBuyerNote] = useState(initialData?.buyerNote ?? "");
  const [sellers, setSellers] = useState<Seller[]>(() => (initialData?.sellers ?? []).map((s: any) => ({ ...s, id: s._id ?? crypto.randomUUID() })));
  const [sellerNote, setSellerNote] = useState(initialData?.sellerNote ?? "");
  const [otherBrokerages, setOtherBrokerages] = useState<OtherBrokerage[]>(() => (initialData?.otherBrokerages ?? []).map((o: any) => ({ ...o, id: o._id ?? crypto.randomUUID() })));
  const [tradeAgents, setTradeAgents] = useState<TradeAgent[]>(() => initialData?.agents ?? []);
  const [deposits, setDeposits] = useState<Deposit[]>(() => (initialData?.deposits ?? []).map((d: any) => ({ ...mkDeposit(), ...d, id: d._id ?? crypto.randomUUID(), depositDate: toDateInput(d.depositDate) })));
  const [depositTransfers, setDepositTransfers] = useState<DepositTransfer[]>(() => (initialData?.depositTransfers ?? []).map((transfer: any) => ({ ...mkDepositTransfer(), ...transfer, id: transfer._id ?? crypto.randomUUID(), transferDate: toDateInput(transfer.transferDate) })));
  const [receipts, setReceipts] = useState<Receipt[]>(() => (initialData?.receipts ?? []).map((receipt: any) => ({ ...mkReceipt(), ...receipt, id: receipt._id ?? crypto.randomUUID(), receiptDate: toDateInput(receipt.receiptDate) })));
  const [docCategory, setDocCategory] = useState(initialData?.documents?.[0]?.category ?? "Pre-Construction");
  const [docNote, setDocNote] = useState(initialData?.documents?.[0]?.documentNote ?? "");
  const [checkedDocs, setCheckedDocs] = useState<string[]>(initialData?.documents?.[0]?.checkedDocuments ?? []);

  const disabledAgentTabs = new Set(["Deposit"]);
  const visibleTabs = agentMode
    ? TABS.filter((tab) => tab !== "Deposit Transfer" && tab !== "Receipts/Cheques")
    : TABS;

  useEffect(() => {
    if (!agentMode) fetch("/api/agents?sortField=firstName&sortOrder=asc").then(r => r.json()).then(d => setAgentOptions(d.agents || [])).catch(() => { });
    fetch("/api/other-brokerages?sortField=createdAt&sortOrder=desc").then(r => r.json()).then(d => setBrokerageOptions(d.brokerages || [])).catch(() => { });
  }, [agentMode]);

  useEffect(() => {
    const aps = parseFloat(tf.apsPrice) || 0, pct = parseFloat(tf.commissionPercent) || 0, tax = parseFloat(tf.tax) || 0;
    const base = aps * (pct / 100), total = base * (1 + tax / 100);
    setTf(p => ({ ...p, basePrice: base.toFixed(2), commissionAmount: total.toFixed(2) }));
  }, [tf.apsPrice, tf.commissionPercent, tf.tax]);

  const handleTfChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTf(p => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!tf.agreementStatus) errs.agreementStatus = "Required";
    if (!tf.completionDate) errs.completionDate = "Required";
    setErrors(errs);
    if (Object.keys(errs).length) { setActiveTab("Trade"); return; }
    setSaving(true);
    try {
      const payload = {
        mlsNumber: tf.mlsNumber, agreementStatus: tf.agreementStatus, tradeCategory: tf.tradeCategory,
        tradeType: tf.tradeType, street: tf.street, city: tf.city, province: tf.province, postalCode: tf.postalCode,
        apsPrice: parseFloat(tf.apsPrice) || 0, basePrice: parseFloat(tf.basePrice) || 0,
        commissionPercent: parseFloat(tf.commissionPercent) || 0, tax: parseFloat(tf.tax) || 13,
        commissionAmount: parseFloat(tf.commissionAmount) || 0, ourRole: tf.ourRole, other: tf.other,
        offerDate: tf.offerDate || null, firmDate: tf.firmDate || null, completionDate: tf.completionDate || null,
        note: tf.note, tradeStatus: "Open",
        buyers: buyers.map(({ id, ...b }) => b), buyerNote,
        sellers: sellers.map(({ id, ...s }) => s), sellerNote,
        otherBrokerages: otherBrokerages.map(({ id, ...o }) => o),
        agents: tradeAgents,
        deposits: agentMode ? [] : deposits.map(({ id, ...d }) => ({ ...d, depositAmount: Number(d.depositAmount) || 0, depositDate: d.depositDate || null })),
        depositTransfers: agentMode ? [] : depositTransfers.map(({ id, ...transfer }) => ({ ...transfer, amount: Number(transfer.amount) || 0, transferDate: transfer.transferDate || null })),
        receipts: agentMode ? [] : receipts.map(({ id, ...receipt }) => ({ ...receipt, amount: Number(receipt.amount) || 0, receiptDate: receipt.receiptDate || null })),
        documents: docCategory ? [{ category: docCategory, documentNote: docNote, checkedDocuments: checkedDocs, files: [] }] : [],
      };
      const url = isEdit ? `/api/trades/${tradeId}` : "/api/trades";
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { router.push(agentMode ? "/agent/profile" : "/dashboard/trades"); }
      else { const d = await res.json(); setErrors({ form: d.error || "Failed to save trade" }); }
    } catch { setErrors({ form: "Failed to save trade" }); }
    finally { setSaving(false); }
  };

  const pageTitle = isEdit ? `Trade # ${tradeNumber} - ${[tf.street, tf.city].filter(Boolean).join(" ")}` : agentMode ? "Submit Trade" : "Trade #";

  return (
    <main className="flex-1 w-full px-4 sm:px-6 py-6 pb-24">
      <h1 className="text-xl sm:text-2xl font-bold text-[#1B2559] mb-4">{pageTitle}</h1>
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-0 overflow-x-auto">
          {visibleTabs.map(tab => {
            const disabled = agentMode && disabledAgentTabs.has(tab);
            return <button key={tab} onClick={() => setActiveTab(tab)} disabled={disabled} title={disabled ? "Deposits are managed by an administrator" : undefined} className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${disabled ? "cursor-not-allowed border-transparent text-gray-300" : `cursor-pointer ${activeTab === tab ? "border-[#1B2559] text-[#1B2559]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}`}>{tab}</button>;
          })}
        </div>
      </div>
      {errors.form && <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">{errors.form}</div>}

      {activeTab === "Trade" && <TabTrade tf={tf} tradeNumber={tradeNumber} errors={errors} onChange={handleTfChange} />}
      {activeTab === "Buyer" && <TabBuyer buyers={buyers} sellers={sellers} buyerNote={buyerNote} onBuyersChange={setBuyers} onNoteChange={setBuyerNote} />}
      {activeTab === "Seller" && <TabSeller sellers={sellers} buyers={buyers} sellerNote={sellerNote} onSellersChange={setSellers} onNoteChange={setSellerNote} />}
      {activeTab === "Other Brokerage" && (
        <TabOtherBrokerage
          brokerageOptions={brokerageOptions}
          otherBrokerages={otherBrokerages}
          onChange={setOtherBrokerages}
          onBrokerageCreated={(brokerage) => setBrokerageOptions((previous) => [brokerage, ...previous])}
        />
      )}
      {activeTab === "Our Agents" && !agentMode && (
        <TabAgents
          agentOptions={agentOptions}
          tradeAgents={tradeAgents}
          onChange={setTradeAgents}
          onAgentCreated={(agent) => setAgentOptions((previous) => [agent, ...previous])}
        />
      )}
      {activeTab === "Deposit" && <TabDeposit deposits={deposits} buyers={buyers} sellers={sellers} onChange={setDeposits} />}
      {activeTab === "Deposit Transfer" && <TabDepositTransfer transfers={depositTransfers} onChange={setDepositTransfers} />}

      {activeTab === "Commission" && (
        <div className="space-y-6">
          <div className="text-sm text-gray-500">Trade</div>
          <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <THead cols={["PURCHASE PRICE", "COMMISSION", "TRADE COMMISSION", "TAX", "TOTAL TO US", "RECORD RECEIPT"]} />
              <tbody><tr>
                <td className="px-3 py-3">{fmtCurrency(parseFloat(tf.apsPrice) || 0)}</td>
                <td className="px-3 py-3">{tf.commissionPercent}%</td>
                <td className="px-3 py-3 text-green-600">{fmtCurrency(parseFloat(tf.basePrice) || 0)}</td>
                <td className="px-3 py-3">{fmtCurrency((parseFloat(tf.commissionAmount) || 0) - (parseFloat(tf.basePrice) || 0))}</td>
                <td className="px-3 py-3">{fmtCurrency(parseFloat(tf.commissionAmount) || 0)}</td>
                <td className="px-3 py-3 text-gray-400 text-xs">Save trade to record receipt</td>
              </tr></tbody>
            </table>
          </div>
          <p className="text-sm text-gray-700">Our Agent Gross Commission: {tf.commissionPercent}% <span className="text-green-600">{fmtCurrency(parseFloat(tf.basePrice) || 0)}</span> TAX: {fmtCurrency((parseFloat(tf.commissionAmount) || 0) - (parseFloat(tf.basePrice) || 0))} Total: {fmtCurrency(parseFloat(tf.commissionAmount) || 0)}</p>
          {tradeAgents.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm">
                <THead cols={["NAME", "OUR SHARE %", "SHARE %", "GROSS TO AGENT", "MENTOR SHARE", "SPLIT %", "NET TO AGENT", "ACTION"]} />
                <tbody>{tradeAgents.map(a => <tr key={a.agentId} className="border-t border-gray-100"><td className="px-3 py-2.5">{a.agentName}</td><td className="px-3 py-2.5">0.00</td><td className="px-3 py-2.5">100.00%</td><td className="px-3 py-2.5 text-green-600">{fmtCurrency(parseFloat(tf.basePrice) || 0)}</td><td className="px-3 py-2.5">0</td><td className="px-3 py-2.5">10.00%</td><td className="px-3 py-2.5">-</td><td className="px-3 py-2.5 text-blue-600 text-xs cursor-pointer">Issue Check</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "Receipts/Cheques" && <TabReceipts receipts={receipts} deposits={deposits} onChange={setReceipts} />}

      {activeTab === "Documents/Invoice" && (
        <TabDocuments docCategory={docCategory} docNote={docNote} checkedDocs={checkedDocs} onCategoryChange={setDocCategory} onNoteChange={setDocNote} onCheckedChange={setCheckedDocs} />
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 z-10">
        <button onClick={() => router.push("/dashboard/trades")} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="px-6 py-2 text-sm font-semibold text-white bg-[#1B2559] hover:bg-[#151d47] rounded-lg transition-colors cursor-pointer disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
      </div>
    </main>
  );
}
