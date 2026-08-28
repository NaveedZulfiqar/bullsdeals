import { Schema, model, models } from "mongoose";

const MonthlyCollectionSchema = new Schema(
  {
    sourceType: { type: String, enum: ["agent", "tenant"], required: true },
    sourceId: { type: String, required: true },
    category: { type: String, enum: ["Desk Fee", "Rent Receivables"], required: true },
    month: { type: String, required: true, trim: true },
    netAmount: { type: Number, default: 0 },
    hst: { type: Number, default: 0 },
    grossAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, trim: true, default: "" },
    referenceNo: { type: String, trim: true, default: "" },
    receiptDate: { type: String, trim: true, default: "" },
    invoiceNo: { type: Number, default: null },
    status: { type: String, enum: ["Pending", "Received"], default: "Pending" },
  },
  { timestamps: true }
);

MonthlyCollectionSchema.index(
  { sourceType: 1, sourceId: 1, category: 1, month: 1 },
  { unique: true }
);

export const MonthlyCollection =
  models.MonthlyCollection || model("MonthlyCollection", MonthlyCollectionSchema);

export default MonthlyCollection;
