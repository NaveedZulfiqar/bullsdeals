import { Schema, model, models } from "mongoose";

const AgentSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true, default: "" },
    lastName: { type: String, required: true, trim: true },
    officeNickName: { type: String, trim: true, default: "" },
    tradeName: { type: String, trim: true, default: "" },
    dateOfBirth: { type: Date, default: null },
    hst: { type: String, trim: true, default: "" },
    sin: { type: String, trim: true, default: "" },
    street: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    province: { type: String, trim: true, default: "ONT" },
    postalCode: { type: String, trim: true, default: "" },
    email: { type: String, required: true, trim: true, lowercase: true },
    cellPhone: { type: String, trim: true, default: "" },
    homePhone: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
    agentType: {
      type: String,
      required: true,
      enum: ["Agent", "Broker"],
      default: "Agent",
    },
    agentMentor: { type: String, trim: true, default: "" },
    payToPrec: { type: Boolean, default: false },
    addressIsSameAsAbove: { type: Boolean, default: false },
    precName: { type: String, trim: true, default: "" },
    precStreet: { type: String, trim: true, default: "" },
    precCity: { type: String, trim: true, default: "" },
    precProvince: { type: String, trim: true, default: "ONT" },
    precPostalCode: { type: String, trim: true, default: "" },
    precHst: { type: String, trim: true, default: "" },
    precBusinessNumber: { type: String, trim: true, default: "" },
    photo: { type: String, default: "" },
    recoNumber: { type: String, trim: true, default: "" },
    recoLicExpiry: { type: Date, default: null },
    agentCode: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Agent = models.Agent || model("Agent", AgentSchema);
export default Agent;
