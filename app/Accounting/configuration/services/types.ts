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

export interface TDSRule {
  id: string;
  category: string;
  rate: number;
}

export interface TaxSettings {
  vatRate: number;
  tdsRules: TDSRule[];
}
