export interface Buyer { id: string; sameAddressAs: string; name: string; phone: string; email: string; street: string; city: string; province: string; postalCode: string; }
export interface Seller { id: string; sameAddressAs: string; name: string; phone: string; email: string; street: string; city: string; province: string; postalCode: string; }
export interface OtherBrokerage { id: string; brokerageName: string; agentName: string; phone: string; email: string; percentage: number; }
export interface TradeAgent { agentId: string; agentName: string; photo: string; }
export interface Deposit { id: string; depositHolder: string; depositHolderOther: string; holdingFor: string; holdingForOther: string; depositDate: string; depositTime: string; propertyAddress: string; mlsNumber: string; purpose: string; depositMethod: string; depositRefNo: string; depositAmount: number; depositAmountInWords: string; otherDeposit: string; receivedFrom: string; receivedBy: string; payingInterestOnDeposit: boolean; }
export interface DepositTransfer { id: string; transferDate: string; depositTime: string; from: string; to: string; amount: number; referenceNo: string; purposeStory: string; }
export interface Receipt { id: string; receiptDate: string; receiptTime: string; receiptType: string; amount: number; note: string; entryMode: "Manual" | "Linked Deposit"; linkedDepositId: string; }
export interface AgentOption { _id: string; firstName: string; lastName: string; email: string; cellPhone: string; photo: string; }
export interface BrokerageOption { _id: string; name: string; phone: string; email: string; createdAt?: string; }
export interface TradeFormData { mlsNumber: string; agreementStatus: string; tradeCategory: string; tradeType: string; street: string; city: string; province: string; postalCode: string; apsPrice: string; basePrice: string; commissionPercent: string; tax: string; commissionAmount: string; ourRole: string; other: string; offerDate: string; firmDate: string; completionDate: string; note: string; }
export interface TradeFormProps { initialData?: any; tradeId?: string; tradeNumber?: number; agentMode?: boolean; }

export const TABS = ["Trade","Buyer","Seller","Other Brokerage","Our Agents","Deposit","Deposit Transfer","Commission","Receipts/Cheques","Documents/Invoice"];
export const AGREEMENT_STATUSES = ["Firm","Conditional","Collapsed"];
export const TRADE_CATEGORIES = ["Residential Preconstruction","Residential Resale","Commercial","Land","Lease","Assignment"];
export const TRADE_TYPES = ["Co-operating","Listing","Provided Referral","Received Referral","Dual Agency"];
export const PROVINCES = ["Ontario","Alberta","British Columbia","Manitoba","New Brunswick","Newfoundland and Labrador","Nova Scotia","Prince Edward Island","Quebec","Saskatchewan"];
export const OUR_ROLES = ["Co-operating","Listing","Provided Referral","Received Referral","Dual Agency","Other"];
export const DEPOSIT_METHODS = ["EFT","Cheque","Bank Draft","Cash","Wire Transfer"];
export const DOCUMENT_CATEGORIES = ["Pre-Construction","Residential Resale","Commercial","Lease","Assignment"];
export const PRE_CONSTRUCTION_DOCS = ["Agreement of Purchase and Sale.","Broker Co-Op","Buyer Representation Agreement.","Individual Identification Information Record.","Corporation Entity Identification Information Record.","Raco Information Guide.","Deposit Receipt.","Referral Agreement","Trade Record Sheet Office Copy","Trade Record Sheet Agent Copy","Invoice to Builder","Invoice from Other Brokerage","Invoice to Other Brokerage.","EFT and Cheque to Agent","EFT and Cheque to Referring Brokerage","Com Trust To Gen","Other:","Other."];

export const mkBuyer = (): Buyer => ({ id: crypto.randomUUID(), sameAddressAs:"", name:"", phone:"", email:"", street:"", city:"", province:"ONT", postalCode:"" });
export const mkSeller = (): Seller => ({ id: crypto.randomUUID(), sameAddressAs:"", name:"", phone:"", email:"", street:"", city:"", province:"ONT", postalCode:"" });
export const mkOB = (): OtherBrokerage => ({ id: crypto.randomUUID(), brokerageName:"", agentName:"", phone:"", email:"", percentage:0 });
export const mkDeposit = (): Deposit => ({ id: crypto.randomUUID(), depositHolder:"", depositHolderOther:"", holdingFor:"", holdingForOther:"", depositDate:"", depositTime:"", propertyAddress:"", mlsNumber:"", purpose:"", depositMethod:"EFT", depositRefNo:"", depositAmount:0, depositAmountInWords:"", otherDeposit:"", receivedFrom:"", receivedBy:"", payingInterestOnDeposit:false });
export const mkDepositTransfer = (): DepositTransfer => ({ id: crypto.randomUUID(), transferDate:"", depositTime:"", from:"", to:"", amount:0, referenceNo:"", purposeStory:"" });
export const mkReceipt = (): Receipt => ({ id: crypto.randomUUID(), receiptDate:"", receiptTime:"", receiptType:"", amount:0, note:"", entryMode:"Manual", linkedDepositId:"" });
export const toDateInput = (d?: string|null) => { if(!d) return ""; const dt=new Date(d); return isNaN(dt.getTime())?"":dt.toISOString().split("T")[0]; };
export const fmtCurrency = (n: number) => new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD"}).format(n||0);
