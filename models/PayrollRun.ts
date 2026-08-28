import { Schema, model, models } from "mongoose";

const PayrollRunSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    periodStartDate: { type: String, required: true },
    periodEndDate: { type: String, required: true },
    payDueDate: { type: String, required: true },
    salary: { type: Number, default: 0 },
    status: { type: String, enum: ["Generated", "Paid"], default: "Generated" },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

PayrollRunSchema.index({ employeeId: 1, periodEndDate: 1 }, { unique: true });

export const PayrollRun = models.PayrollRun || model("PayrollRun", PayrollRunSchema);
export default PayrollRun;
