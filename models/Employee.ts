import { Schema, model, models } from "mongoose";

const EmployeeSchema = new Schema(
  {
    // Profile
    employeeId: { type: String, trim: true, default: "" },
    firstName: { type: String, trim: true, required: true },
    middleName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, required: true },
    nickName: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, required: true },
    homePhone: { type: String, trim: true, default: "" },
    mobile: { type: String, trim: true, default: "" },
    street: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    province: { type: String, trim: true, default: "ONT" },
    postalCode: { type: String, trim: true, default: "" },
    dateOfBirth: { type: Date, default: null },
    socialInsuranceNo: { type: String, trim: true, default: "" },
    photo: { type: String, trim: true, default: "" },

    // Employment Details
    employeeStatus: { type: String, trim: true, default: "" },
    employmentStartDate: { type: Date, default: null },
    employmentEndDate: { type: Date, default: null },
    workLocation: { type: String, trim: true, default: "" },
    department: { type: String, trim: true, default: "" },
    jobTitle: { type: String, trim: true, default: "" },

    // Tax Details
    federalClaimCode: { type: String, trim: true, default: "FC01 - 16,452" },
    federalTD1ClaimAmount: { type: String, trim: true, default: "$16,452.00" },
    provincialClaimCode: { type: String, trim: true, default: "PC01 - 12,989.00" },
    provincialClaimAmount: { type: String, trim: true, default: "$12,989.00" },
    cppExempted: { type: Boolean, default: false },
    cppExemptionReason: { type: String, trim: true, default: "" },
    eiExempted: { type: Boolean, default: false },
    eiExemptionReason: { type: String, trim: true, default: "" },

    // Pay Type
    payType: { type: String, trim: true, default: "" },
    payFrequency: { type: String, trim: true, default: "" },
    payRate: { type: String, trim: true, default: "" },
    hoursPerDay: { type: String, trim: true, default: "" },
    vacationPolicy: { type: String, trim: true, default: "" },
    vacationRate: { type: String, trim: true, default: "" },
    paymentMethod: { type: String, trim: true, default: "" },
    bankName: { type: String, trim: true, default: "" },
    institutionNo: { type: String, trim: true, default: "" },
    transitNo: { type: String, trim: true, default: "" },
    accountNo: { type: String, trim: true, default: "" },

    isActive: { type: Boolean, default: true },
    documents: {
      type: [{
        id: { type: String, default: "" }, name: { type: String, default: "" },
        category: { type: String, default: "Other" }, note: { type: String, default: "" },
        fileName: { type: String, default: "" }, mimeType: { type: String, default: "application/octet-stream" },
        size: { type: Number, default: 0 }, dataUrl: { type: String, default: "" }, uploadedAt: { type: Date, default: Date.now },
      }],
      default: [],
    },
  },
  { timestamps: true }
);

export const Employee = models.Employee || model("Employee", EmployeeSchema);
export default Employee;
