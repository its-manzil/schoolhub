export interface Organization {
  _id?: string;
  companyName: string;
  panVat: string;
  address: string;
  phone: string;
  email: string;
}

export interface FiscalYear {
  _id?: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Account {
  _id?: string;
  name: string;
  type: string;
  parentId?: string;
}

export interface BankCashAccount {
  _id?: string;
  name: string;
  type: string;
  balance: number;
}

export interface Contact {
  _id?: string;
  name: string;
  type: string;
  phone: string;
  pan: string;
  openingBalance: number;
}

export interface TaxSlab {
  from: number;
  to?: number;
  rate: number;
}

export interface TaxThreshold {
  individual?: number;
  couple?: number;
}

export type TaxRuleType = "FIXED" | "SLAB" | "FINAL";

export interface TaxRule {
  id: string;
  name: string;
  category: string;
  type: TaxRuleType;
  rate?: number; // for FIXED/FINAL
  slabs?: TaxSlab[]; // for SLAB
  threshold?: TaxThreshold;
  revenueCode: string;
  description?: string;
}

export interface TaxSettings {
  vatRate: number;
  taxRules: TaxRule[];
}
