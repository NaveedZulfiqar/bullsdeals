import { Schema, model, models } from "mongoose";

const PaymentStateSchema = new Schema(
  {
    paymentId: { type: String, required: true, unique: true, index: true },
    printed: { type: Boolean, default: false },
    cancelled: { type: Boolean, default: false },
    printedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const PaymentState = models.PaymentState || model("PaymentState", PaymentStateSchema);
export default PaymentState;
