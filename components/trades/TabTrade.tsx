"use client";
import React from "react";
import { FL, FI, FS, Caret } from "./ui";
import { TradeFormData, AGREEMENT_STATUSES, TRADE_CATEGORIES, TRADE_TYPES, PROVINCES, OUR_ROLES } from "./types";

interface Props {
  tf: TradeFormData;
  tradeNumber?: number;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export default function TabTrade({ tf, tradeNumber, errors, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div><FL>Trade #</FL><FI placeholder="Trade #" value={tradeNumber ?? ""} readOnly cls="bg-gray-50 text-gray-400" /></div>
        <div><FL>MLS#</FL><FI name="mlsNumber" value={tf.mlsNumber} onChange={onChange} placeholder="MLS#" /></div>
        <div>
          <FL req>Agreement Status</FL>
          <div className="relative"><FS name="agreementStatus" value={tf.agreementStatus} onChange={onChange}><option value="">Select Agreement Status</option>{AGREEMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</FS><Caret /></div>
          {errors.agreementStatus && <p className="text-xs text-red-500 mt-1">{errors.agreementStatus}</p>}
        </div>
        <div>
          <FL req>Trade Category</FL>
          <div className="relative"><FS name="tradeCategory" value={tf.tradeCategory} onChange={onChange}><option value="">Select Trade Category</option>{TRADE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</FS><Caret /></div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <FL req>Trade Type</FL>
          <div className="relative"><FS name="tradeType" value={tf.tradeType} onChange={onChange}><option value="">Select Trade Type</option>{TRADE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</FS><Caret /></div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div><FL req>Street</FL><FI name="street" value={tf.street} onChange={onChange} placeholder="Street *" /></div>
        <div><FL>City</FL><FI name="city" value={tf.city} onChange={onChange} placeholder="City" /></div>
        <div><FL req>Province</FL><div className="relative"><FS name="province" value={tf.province} onChange={onChange}>{PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}</FS><Caret /></div></div>
        <div><FL req>Postal Code</FL><FI name="postalCode" value={tf.postalCode} onChange={onChange} placeholder="Postal Code *" /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div><FL req>APS Price $</FL><FI name="apsPrice" type="number" value={tf.apsPrice} onChange={onChange} placeholder="$0.00" /></div>
        <div><FL>Base Price (Net of Tax)</FL><FI value={`$${tf.basePrice}`} readOnly cls="bg-gray-50 text-gray-500" /></div>
        <div><FL>Commission %</FL><FI name="commissionPercent" type="number" value={tf.commissionPercent} onChange={onChange} placeholder="0" /></div>
        <div><FL>Tax %</FL><FI name="tax" type="number" value={tf.tax} onChange={onChange} placeholder="13" /></div>
        <div><FL>Commission Amount $</FL><FI value={`$${tf.commissionAmount}`} readOnly cls="bg-gray-50 text-gray-500" /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><FL>Our Role</FL><div className="relative"><FS name="ourRole" value={tf.ourRole} onChange={onChange}><option value="">Select Our Role</option>{OUR_ROLES.map(r => <option key={r} value={r}>{r}</option>)}</FS><Caret /></div></div>
        {tf.ourRole === "Other" && <div><FL>Other</FL><FI name="other" value={tf.other} onChange={onChange} placeholder="Other" /></div>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div><FL req>Offer Date</FL><FI name="offerDate" type="date" value={tf.offerDate} onChange={onChange} /></div>
        <div><FL>Firm Date</FL><FI name="firmDate" type="date" value={tf.firmDate} onChange={onChange} /></div>
        <div><FL req>Completion Date</FL><FI name="completionDate" type="date" value={tf.completionDate} onChange={onChange} />{errors.completionDate && <p className="text-xs text-red-500 mt-1">{errors.completionDate}</p>}</div>
      </div>
      <div><FL>Note</FL><textarea name="note" value={tf.note} onChange={onChange} placeholder="Note" rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B2559] resize-none" /></div>
    </div>
  );
}
