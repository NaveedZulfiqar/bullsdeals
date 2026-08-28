import { Schema, model, models } from "mongoose";

const InvoiceItemSchema = new Schema(
  {
    item:      { type: String, trim: true, default: "" },
    price:     { type: Number, default: 0 },
    quantity:  { type: Number, default: 1 },
    amount:    { type: Number, default: 0 },
    hstAmount: { type: Number, default: 0 },
  },
  { _id: true }
);

const PaymentRowSchema = new Schema(
  {
    description:      { type: String, trim: true, default: "" },
    paymentDate:      { type: String, trim: true, default: "" },
    paymentMethod:    { type: String, trim: true, default: "" },
    transactionRefNo: { type: String, trim: true, default: "" },
  },
  { _id: true }
);

const ExpenditureSchema = new Schema(
  {
    invoiceNumber: { type: Number, default: 1 },
    invoiceDate:   { type: String, trim: true, default: "" },
    category:      { type: String, trim: true, default: "" },

    // Supplier info — nickname is required, no separate "supplier name" field
    supplierNickName: { type: String, trim: true, required: [true, "Supplier Nick Name is required"] },
    address:          { type: String, trim: true, default: "" },
    hstNumber:        { type: String, trim: true, default: "" },
    phone:            { type: String, trim: true, default: "" },
    email:            { type: String, trim: true, default: "" },

    // Invoice items
    invoiceItems: { type: [InvoiceItemSchema], default: [] },

    // Totals
    subtotal:    { type: Number, default: 0 },
    hstAmount:   { type: Number, default: 0 },
    hstExempted: { type: Boolean, default: false },
    amount:      { type: Number, default: 0 },

    // Payment rows
    paymentRows: { type: [PaymentRowSchema], default: [] },
  },
  { timestamps: true }
);

export const Expenditure = models.Expenditure || model("Expenditure", ExpenditureSchema);
export default Expenditure;
