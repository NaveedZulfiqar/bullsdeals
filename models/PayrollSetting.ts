import { Schema, model, models } from "mongoose";

const PayrollSettingSchema = new Schema(
  {
    frequency: { type: String, enum: ["WEEKLY", "BIWEEKLY"], unique: true, required: true },
    startDate: { type: String, required: true, trim: true },
    dueDays: { type: Number, default: 0, min: 0, max: 60 },
  },
  { timestamps: true }
);

export const PayrollSetting = models.PayrollSetting || model("PayrollSetting", PayrollSettingSchema);
export default PayrollSetting;
