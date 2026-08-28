import { Schema, model, models } from "mongoose";

const MonthlyTenantSchema = new Schema(
  {
    tenantName: { type: String, required: true, trim: true },
    additionalName: { type: String, trim: true, default: "" },
    street: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    province: { type: String, trim: true, default: "ONT" },
    postalCode: { type: String, trim: true, default: "" },
    monthlyRent: { type: Number, required: true, min: 0 },
    rentStartDate: { type: String, required: true, trim: true },
    hstNumber: { type: String, trim: true, default: "" },
    category: { type: String, default: "Rent Receivables" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const MonthlyTenant =
  models.MonthlyTenant || model("MonthlyTenant", MonthlyTenantSchema);

export default MonthlyTenant;
