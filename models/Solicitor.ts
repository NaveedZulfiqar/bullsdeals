import { Schema, model, models } from "mongoose";

const SolicitorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    companyName: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    fax: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    street: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    province: { type: String, trim: true, default: "ONT" },
    postalCode: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export const Solicitor =
  models.Solicitor || model("Solicitor", SolicitorSchema);
export default Solicitor;
