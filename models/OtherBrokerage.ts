import { Schema, model, models } from "mongoose";

const OtherBrokerageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: "" },
    hst: { type: String, trim: true, default: "" },
    street: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    province: { type: String, trim: true, default: "ONT" },
    postalCode: { type: String, trim: true, default: "" },
    bankName: { type: String, trim: true, default: "" },
    instituteNumber: { type: String, trim: true, default: "" },
    transitNumber: { type: String, trim: true, default: "" },
    accountNumber: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export const OtherBrokerage =
  models.OtherBrokerage || model("OtherBrokerage", OtherBrokerageSchema);
export default OtherBrokerage;
