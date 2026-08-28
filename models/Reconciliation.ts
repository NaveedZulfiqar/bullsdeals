import { Schema, model, models } from "mongoose";

const ReconciliationRowSchema = new Schema(
  {
    entryId: { type: String, required: true },
    reconciledDate: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["Cleared", "Pending"], default: "Pending" },
  },
  { _id: false }
);

const ReconciliationSchema = new Schema(
  {
    accountType: {
      type: String,
      enum: ["General Account", "Commission Trust Account", "Real Estate Trust Account"],
      required: true,
    },
    bankBalance: { type: Number, required: true, default: 0 },
    asOn: { type: String, required: true, trim: true },
    rows: { type: [ReconciliationRowSchema], default: [] },
  },
  { timestamps: true }
);

export const Reconciliation =
  models.Reconciliation || model("Reconciliation", ReconciliationSchema);

export default Reconciliation;
