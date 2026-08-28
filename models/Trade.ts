import { Schema, model, models } from "mongoose";

const BuyerSchema = new Schema({
  sameAddressAs: { type: String, default: "" },
  name: { type: String, required: true, trim: true },
  phone: { type: String, trim: true, default: "" },
  email: { type: String, trim: true, default: "" },
  street: { type: String, trim: true, default: "" },
  city: { type: String, trim: true, default: "" },
  province: { type: String, trim: true, default: "ONT" },
  postalCode: { type: String, trim: true, default: "" },
});

const SellerSchema = new Schema({
  sameAddressAs: { type: String, default: "" },
  name: { type: String, required: true, trim: true },
  phone: { type: String, trim: true, default: "" },
  email: { type: String, trim: true, default: "" },
  street: { type: String, trim: true, default: "" },
  city: { type: String, trim: true, default: "" },
  province: { type: String, trim: true, default: "ONT" },
  postalCode: { type: String, trim: true, default: "" },
});

const OtherBrokerageSchema = new Schema({
  brokerageName: { type: String, trim: true, default: "" },
  agentName: { type: String, trim: true, default: "" },
  phone: { type: String, trim: true, default: "" },
  email: { type: String, trim: true, default: "" },
  percentage: { type: Number, default: 0 },
  commission: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  totalCommission: { type: Number, default: 0 },
});

const TradeAgentSchema = new Schema({
  agentId: { type: Schema.Types.ObjectId, ref: "Agent" },
  agentName: { type: String, trim: true, default: "" },
  photo: { type: String, default: "" },
});

const DepositSchema = new Schema({
  depositHolder: { type: String, trim: true, default: "" },
  depositHolderOther: { type: String, trim: true, default: "" },
  holdingFor: { type: String, trim: true, default: "" },
  holdingForOther: { type: String, trim: true, default: "" },
  depositDate: { type: Date, default: null },
  depositTime: { type: String, trim: true, default: "" },
  propertyAddress: { type: String, trim: true, default: "" },
  mlsNumber: { type: String, trim: true, default: "" },
  purpose: { type: String, trim: true, default: "" },
  depositMethod: { type: String, trim: true, default: "" },
  depositRefNo: { type: String, trim: true, default: "" },
  depositAmount: { type: Number, default: 0 },
  depositAmountInWords: { type: String, trim: true, default: "" },
  otherDeposit: { type: String, trim: true, default: "" },
  receivedFrom: { type: String, trim: true, default: "" },
  receivedBy: { type: String, trim: true, default: "" },
  payingInterestOnDeposit: { type: Boolean, default: false },
});

const ReceiptSchema = new Schema({
  receiptDate: { type: Date, default: null },
  receiptTime: { type: String, trim: true, default: "" },
  receiptType: { type: String, trim: true, default: "" },
  amount: { type: Number, default: 0 },
  note: { type: String, trim: true, default: "" },
  entryMode: { type: String, trim: true, default: "Manual" },
  linkedDepositId: { type: String, trim: true, default: "" },
});

const DepositTransferSchema = new Schema({
  transferDate: { type: Date, default: null },
  depositTime: { type: String, trim: true, default: "" },
  from: { type: String, trim: true, default: "" },
  to: { type: String, trim: true, default: "" },
  amount: { type: Number, default: 0 },
  referenceNo: { type: String, trim: true, default: "" },
  purposeStory: { type: String, trim: true, default: "" },
});

const DocumentSchema = new Schema({
  category: { type: String, trim: true, default: "" },
  documentNote: { type: String, trim: true, default: "" },
  checkedDocuments: [{ type: String }],
  files: [{ name: { type: String }, url: { type: String } }],
});

const SolicitorRefSchema = new Schema({
  solicitorId: { type: Schema.Types.ObjectId, ref: "Solicitor" },
  name: { type: String, trim: true, default: "" },
  phone: { type: String, trim: true, default: "" },
  email: { type: String, trim: true, default: "" },
  buyerOrSeller: { type: String, enum: ["Buyer", "Seller"], default: "Buyer" },
});

const TradeSchema = new Schema(
  {
    tradeNumber: { type: Number, unique: true },
    mlsNumber: { type: String, trim: true, default: "" },
    agreementStatus: {
      type: String,
      enum: ["Firm", "Conditional", "Collapsed", ""],
      default: "",
    },
    tradeCategory: { type: String, trim: true, default: "" },
    tradeType: { type: String, trim: true, default: "" },
    street: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    province: { type: String, trim: true, default: "Ontario" },
    postalCode: { type: String, trim: true, default: "" },
    apsPrice: { type: Number, default: 0 },
    basePrice: { type: Number, default: 0 },
    commissionPercent: { type: Number, default: 0 },
    tax: { type: Number, default: 13 },
    commissionAmount: { type: Number, default: 0 },
    ourRole: { type: String, trim: true, default: "" },
    other: { type: String, trim: true, default: "" },
    offerDate: { type: Date, default: null },
    firmDate: { type: Date, default: null },
    completionDate: { type: Date, default: null },
    note: { type: String, trim: true, default: "" },
    tradeStatus: {
      type: String,
      enum: ["Open", "Closed", ""],
      default: "Open",
    },
    buyers: [BuyerSchema],
    buyerSolicitors: [SolicitorRefSchema],
    buyerNote: { type: String, trim: true, default: "" },
    sellers: [SellerSchema],
    sellerSolicitors: [SolicitorRefSchema],
    sellerNote: { type: String, trim: true, default: "" },
    otherBrokerages: [OtherBrokerageSchema],
    agents: [TradeAgentSchema],
    submittedByAgentId: { type: Schema.Types.ObjectId, ref: "Agent", default: null },
    deposits: [DepositSchema],
    depositTransfers: [DepositTransferSchema],
    receipts: [ReceiptSchema],
    documents: [DocumentSchema],
    pendingCommission: { type: Number, default: 0 },
    pendingDisbursement: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-increment tradeNumber — handled in the POST API route instead

export const Trade = models.Trade || model("Trade", TradeSchema);
export default Trade;
