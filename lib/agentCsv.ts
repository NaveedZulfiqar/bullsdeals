export type AgentCsvField = {
  header: string;
  field: string;
  type?: "date" | "boolean" | "json";
  sample?: string;
};

// Keep this list in form order so the sample is easy to complete.
export const AGENT_CSV_FIELDS: AgentCsvField[] = [
  { header: "First Name", field: "firstName", sample: "Jane" },
  { header: "Middle Name", field: "middleName" },
  { header: "Last Name", field: "lastName", sample: "Doe" },
  { header: "Office Nick Name", field: "officeNickName", sample: "Jane" },
  { header: "Trade Name", field: "tradeName" },
  { header: "Date Of Birth", field: "dateOfBirth", type: "date", sample: "15-Aug-1990" },
  { header: "HST#", field: "hst" },
  { header: "SIN#", field: "sin" },
  { header: "Street", field: "street", sample: "123 Main Street" },
  { header: "City", field: "city", sample: "Toronto" },
  { header: "Province", field: "province", sample: "ONT" },
  { header: "Postal Code", field: "postalCode", sample: "M5V 1A1" },
  { header: "Email", field: "email", sample: "jane.doe@example.com" },
  { header: "Cell Phone", field: "cellPhone", sample: "416-555-0100" },
  { header: "Home Phone", field: "homePhone" },
  { header: "Website", field: "website" },
  { header: "Agent Type", field: "agentType", sample: "Agent" },
  { header: "Agent Mentor", field: "agentMentor" },
  { header: "Pay To PREC", field: "payToPrec", type: "boolean", sample: "No" },
  { header: "Address Is Same As Above", field: "addressIsSameAsAbove", type: "boolean", sample: "No" },
  { header: "PREC Name", field: "precName" },
  { header: "PREC Street", field: "precStreet" },
  { header: "PREC City", field: "precCity" },
  { header: "PREC Province", field: "precProvince", sample: "ONT" },
  { header: "PREC Postal Code", field: "precPostalCode" },
  { header: "PREC HST", field: "precHst" },
  { header: "PREC Business Number", field: "precBusinessNumber" },
  { header: "Photo", field: "photo" },
  { header: "RECO #", field: "recoNumber" },
  { header: "RECO LIC Expiry", field: "recoLicExpiry", type: "date", sample: "31-Dec-2027" },
  { header: "Agent Code", field: "agentCode", sample: "JD001" },
  { header: "Is Active", field: "isActive", type: "boolean", sample: "Yes" },
  { header: "Start Date", field: "startDate", type: "date" },
  { header: "Contract Anniversary Date", field: "contractAnniversaryDate", type: "date" },
  { header: "Termination Date", field: "terminationDate", type: "date" },
  { header: "RECO License No", field: "recoLicenseNo" },
  { header: "RECO License Expiry Date", field: "recoLicenseExpiryDate", type: "date" },
  { header: "Boards", field: "boardRows", type: "json", sample: '[{"board":"TRREB","membershipNo":"12345"}]' },
  { header: "Personal Bank", field: "personalBank" },
  { header: "Personal Institute No", field: "personalInstituteNo" },
  { header: "Personal Transit No", field: "personalTransitNo" },
  { header: "Personal Account No", field: "personalAccountNo" },
  { header: "PREC Bank", field: "precBank" },
  { header: "PREC Institute No", field: "precInstituteNo" },
  { header: "PREC Transit No", field: "precTransitNo" },
  { header: "PREC Account No", field: "precAccountNo" },
  { header: "Brokerage Share Percent", field: "brokerageSharePercent", sample: "10.00" },
  { header: "Brokerage Share Dollar", field: "brokerageShareDollar", sample: "$0.00" },
  { header: "Per Transaction Dollar", field: "perTransactionDollar", sample: "$0.00" },
  { header: "Transaction Fee First Only", field: "transactionFeeFirstOnly" },
  { header: "Commission From", field: "commissionFrom", sample: "06-May" },
  { header: "Commission To", field: "commissionTo", sample: "31-Dec" },
  { header: "After That Percent", field: "afterThatPercent" },
  { header: "After That Dollar", field: "afterThatDollar" },
  { header: "Max To Brokerage", field: "maxToBrokerage", sample: "$0.00" },
  { header: "Franchise Fee Percent", field: "franchiseFeePercent" },
  { header: "Franchise Fee Max", field: "franchiseFeeMax" },
  { header: "Desk Fee HST Per Month", field: "deskFeeHstPerMonth", sample: "$0.00" },
  { header: "Desk Fee Start Date", field: "deskFeeStartDate", type: "date" },
  { header: "Desk Fee Option", field: "deskFeeOption", sample: "agent_pay" },
  { header: "Commission Note", field: "commissionNote" },
  { header: "Other Deductions", field: "deductions", type: "json", sample: "[]" },
  { header: "Agent Documents", field: "documents", type: "json", sample: "[]" },
];

export function normalizeCsvHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function escapeCsv(value: unknown) {
  const text = value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
