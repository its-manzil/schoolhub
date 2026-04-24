// ERP-Grade Accounting Engine
// Handles all financial calculations and report generation

import { 
  generateIncomeStatement, 
  IncomeStatement,
} from './incomeStatement';

export interface LedgerEntry {
  id: string;
  account: string;
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  debit: number;
  credit: number;
  date: string;
  description: string;
  source: 'voucher' | 'billing' | 'inventory';
  sourceId: string;
  schoolId: string;
}

export interface TrialBalanceItem {
  account: string;
  accountType: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface BalanceSheetItem {
  category: 'asset' | 'liability' | 'equity';
  account: string;
  amount: number;
  subCategory?: string;
}

export interface ProfitLossItem {
  category: 'revenue' | 'expense';
  account: string;
  amount: number;
}

export interface CashFlowItem {
  category: 'operating' | 'investing' | 'financing';
  description: string;
  amount: number;
  inflow: boolean;
}

export interface FinancialReport {
  trialBalance: TrialBalanceItem[];
  balanceSheet: BalanceSheetItem[];
  profitLoss: ProfitLossItem[];
  cashFlow: CashFlowItem[];
  incomeStatement: IncomeStatement;
  summary: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    netProfit: number;
    netCashFlow: number;
  };
  isBalanced: boolean;
  generatedAt: string;
}

// Billing data interface
interface BillingData {
  _id: string;
  total?: number;
  amount?: number;
  paymentStatus?: string;
  paid?: boolean;
  date?: string;
  createdAt?: string;
  paymentDate?: string;
  studentName?: string;
  description?: string;
  vatAmount?: number;
}

// Normalize billing data into ledger entries
export function normalizeBillingData(bills: BillingData[], schoolId: string): LedgerEntry[] {
  const entries: LedgerEntry[] = [];
  
  for (const bill of bills) {
    const amount = bill.total || bill.amount || 0;
    const isPaid = bill.paymentStatus === 'paid' || bill.paid === true;
    
    // Revenue entry (Credit)
    entries.push({
      id: `bill-rev-${bill._id}`,
      account: 'Student Fees Revenue',
      accountType: 'revenue',
      debit: 0,
      credit: amount,
      date: bill.date || bill.createdAt || new Date().toISOString(),
      description: `Student billing: ${bill.studentName || bill.description || 'Fee payment'}`,
      source: 'billing',
      sourceId: String(bill._id),
      schoolId: String(schoolId)
    });
    
    // Cash or Receivable entry (Debit)
    if (isPaid) {
      entries.push({
        id: `bill-cash-${bill._id}`,
        account: 'Cash',
        accountType: 'asset',
        debit: amount,
        credit: 0,
        date: bill.paymentDate || bill.date || new Date().toISOString(),
        description: `Cash received from billing`,
        source: 'billing',
        sourceId: String(bill._id),
        schoolId: String(schoolId)
      });
    } else {
      entries.push({
        id: `bill-ar-${bill._id}`,
        account: 'Accounts Receivable',
        accountType: 'asset',
        debit: amount,
        credit: 0,
        date: bill.date || bill.createdAt || new Date().toISOString(),
        description: `Receivable from student billing`,
        source: 'billing',
        sourceId: String(bill._id),
        schoolId: String(schoolId)
      });
    }
    
    // VAT handling if applicable
    if (bill.vatAmount && bill.vatAmount > 0) {
      entries.push({
        id: `bill-vat-${bill._id}`,
        account: 'VAT Payable',
        accountType: 'liability',
        debit: 0,
        credit: bill.vatAmount,
        date: bill.date || new Date().toISOString(),
        description: `VAT on student billing`,
        source: 'billing',
        sourceId: String(bill._id),
        schoolId: String(schoolId)
      });
    }
  }
  
  return entries;
}

// Inventory data interface
interface InventoryData {
  _id: string;
  total?: number;
  salePrice?: number;
  cost?: number;
  purchasePrice?: number;
  paymentStatus?: string;
  paid?: boolean;
  date?: string;
  saleDate?: string;
  itemName?: string;
  description?: string;
}

// Normalize inventory data into ledger entries
export function normalizeInventoryData(inventoryBills: InventoryData[], schoolId: string): LedgerEntry[] {
  const entries: LedgerEntry[] = [];
  
  for (const bill of inventoryBills) {
    const revenue = bill.total || bill.salePrice || 0;
    const cost = bill.cost || bill.purchasePrice || revenue * 0.7; // Estimate COGS if not available
    
    // Sales Revenue (Credit)
    entries.push({
      id: `inv-rev-${bill._id}`,
      account: 'Inventory Sales Revenue',
      accountType: 'revenue',
      debit: 0,
      credit: revenue,
      date: bill.date || bill.saleDate || new Date().toISOString(),
      description: `Inventory sale: ${bill.itemName || bill.description || 'Item'}`,
      source: 'inventory',
      sourceId: String(bill._id),
      schoolId: String(schoolId)
    });
    
    // Cash or Receivable (Debit)
    const isPaid = bill.paymentStatus === 'paid' || bill.paid === true;
    if (isPaid) {
      entries.push({
        id: `inv-cash-${bill._id}`,
        account: 'Cash',
        accountType: 'asset',
        debit: revenue,
        credit: 0,
        date: bill.date || new Date().toISOString(),
        description: `Cash from inventory sale`,
        source: 'inventory',
        sourceId: String(bill._id),
        schoolId: String(schoolId)
      });
    } else {
      entries.push({
        id: `inv-ar-${bill._id}`,
        account: 'Accounts Receivable',
        accountType: 'asset',
        debit: revenue,
        credit: 0,
        date: bill.date || new Date().toISOString(),
        description: `Receivable from inventory sale`,
        source: 'inventory',
        sourceId: String(bill._id),
        schoolId: String(schoolId)
      });
    }
    
    // COGS (Debit)
    entries.push({
      id: `inv-cogs-${bill._id}`,
      account: 'Cost of Goods Sold',
      accountType: 'expense',
      debit: cost,
      credit: 0,
      date: bill.date || new Date().toISOString(),
      description: `COGS for inventory sale`,
      source: 'inventory',
      sourceId: String(bill._id),
      schoolId: String(schoolId)
    });
    
    // Inventory reduction (Credit)
    entries.push({
      id: `inv-inv-${bill._id}`,
      account: 'Inventory',
      accountType: 'asset',
      debit: 0,
      credit: cost,
      date: bill.date || new Date().toISOString(),
      description: `Inventory reduction`,
      source: 'inventory',
      sourceId: String(bill._id),
      schoolId: String(schoolId)
    });
  }
  
  return entries;
}

// Voucher entry interface
interface VoucherEntry {
  _id?: string;
  ledgerName?: string;
  account?: string;
  accountType?: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  debit?: number;
  credit?: number;
  description?: string;
}

interface VoucherData {
  _id: string;
  entries?: VoucherEntry[];
  date?: string;
  createdAt?: string;
  description?: string;
}

// Normalize voucher entries
export function normalizeVoucherData(vouchers: VoucherData[], schoolId: string): LedgerEntry[] {
  const entries: LedgerEntry[] = [];
  
  for (const voucher of vouchers) {
    if (!voucher.entries || !Array.isArray(voucher.entries)) continue;
    
    for (const entry of voucher.entries) {
      const debit = entry.debit || 0;
      const credit = entry.credit || 0;
      
      if (debit === 0 && credit === 0) continue;
      
      entries.push({
        id: `voucher-${voucher._id}-${entry._id || Math.random().toString(36)}`,
        account: entry.ledgerName || entry.account || 'Unknown Account',
        accountType: entry.accountType || determineAccountType(entry.ledgerName || entry.account || 'Unknown'),
        debit: debit,
        credit: credit,
        date: voucher.date || voucher.createdAt || new Date().toISOString(),
        description: entry.description || voucher.description || 'Voucher entry',
        source: 'voucher',
        sourceId: String(voucher._id),
        schoolId: String(schoolId)
      });
    }
  }
  
  return entries;
}

// Helper to determine account type from name
function determineAccountType(accountName: string): 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' {
  const name = accountName.toLowerCase();
  
  if (name.includes('cash') || name.includes('bank') || name.includes('receivable') || 
      name.includes('inventory') || name.includes('asset') || name.includes('prepaid')) {
    return 'asset';
  }
  if (name.includes('payable') || name.includes('liability') || name.includes('loan') || 
      name.includes('debt') || name.includes('vat') || name.includes('tax')) {
    return 'liability';
  }
  if (name.includes('equity') || name.includes('capital') || name.includes('retained')) {
    return 'equity';
  }
  if (name.includes('revenue') || name.includes('income') || name.includes('sale') || 
      name.includes('fee') || name.includes('collection')) {
    return 'revenue';
  }
  if (name.includes('expense') || name.includes('cost') || name.includes('cogs') || 
      name.includes('salary') || name.includes('rent') || name.includes('utilities')) {
    return 'expense';
  }
  
  return 'asset'; // Default
}

// Get all ledger entries from all sources
export function getLedgerEntries(
  vouchers: VoucherData[],
  bills: BillingData[],
  inventoryBills: InventoryData[],
  schoolId: string
): LedgerEntry[] {
  const voucherEntries = normalizeVoucherData(vouchers, schoolId);
  const billingEntries = normalizeBillingData(bills, schoolId);
  const inventoryEntries = normalizeInventoryData(inventoryBills, schoolId);
  
  return [...voucherEntries, ...billingEntries, ...inventoryEntries];
}

// Calculate Trial Balance
export function calculateTrialBalance(entries: LedgerEntry[]): TrialBalanceItem[] {
  const accountMap = new Map<string, TrialBalanceItem>();
  
  for (const entry of entries) {
    const existing = accountMap.get(entry.account);
    
    if (existing) {
      existing.debit += entry.debit;
      existing.credit += entry.credit;
      existing.balance = existing.debit - existing.credit;
    } else {
      accountMap.set(entry.account, {
        account: entry.account,
        accountType: entry.accountType,
        debit: entry.debit,
        credit: entry.credit,
        balance: entry.debit - entry.credit
      });
    }
  }
  
  return Array.from(accountMap.values()).sort((a, b) => a.account.localeCompare(b.account));
}

// Generate Balance Sheet
export function generateBalanceSheet(entries: LedgerEntry[]): BalanceSheetItem[] {
  const balanceSheet: BalanceSheetItem[] = [];
  
  // Group entries by account and calculate net amounts
  const accountBalances = new Map<string, { type: string; amount: number }>();
  
  for (const entry of entries) {
    const existing = accountBalances.get(entry.account);
    const netAmount = entry.debit - entry.credit;
    
    if (existing) {
      existing.amount += netAmount;
    } else {
      accountBalances.set(entry.account, {
        type: entry.accountType,
        amount: netAmount
      });
    }
  }
  
  // Convert to balance sheet items
  for (const [account, data] of accountBalances) {
    if (data.type === 'asset' || data.type === 'liability' || data.type === 'equity') {
      // Assets: positive balance = debit
      // Liabilities & Equity: positive balance = credit (show as positive)
      const amount = data.type === 'asset' ? data.amount : -data.amount;
      
      if (amount !== 0) {
        balanceSheet.push({
          category: data.type as 'asset' | 'liability' | 'equity',
          account,
          amount: Math.abs(amount),
          subCategory: determineSubCategory(account, data.type)
        });
      }
    }
  }
  
  return balanceSheet.sort((a, b) => {
    const order = { asset: 1, liability: 2, equity: 3 };
    return order[a.category] - order[b.category];
  });
}

// Helper to determine sub-category
function determineSubCategory(account: string, type: string): string {
  const name = account.toLowerCase();
  
  if (type === 'asset') {
    if (name.includes('cash') || name.includes('bank')) return 'Current Assets';
    if (name.includes('receivable')) return 'Receivables';
    if (name.includes('inventory')) return 'Inventory';
    return 'Fixed Assets';
  }
  if (type === 'liability') {
    if (name.includes('payable')) return 'Payables';
    if (name.includes('loan') || name.includes('debt')) return 'Loans';
    return 'Other Liabilities';
  }
  if (type === 'equity') {
    return 'Equity';
  }
  
  return 'Other';
}

// Generate Profit & Loss
export function generateProfitLoss(entries: LedgerEntry[]): ProfitLossItem[] {
  const profitLoss: ProfitLossItem[] = [];
  
  // Group by account
  const accountBalances = new Map<string, { type: string; amount: number }>();
  
  for (const entry of entries) {
    const existing = accountBalances.get(entry.account);
    const netAmount = entry.debit - entry.credit;
    
    if (existing) {
      existing.amount += netAmount;
    } else {
      accountBalances.set(entry.account, {
        type: entry.accountType,
        amount: netAmount
      });
    }
  }
  
  // Convert to P&L items
  for (const [account, data] of accountBalances) {
    if (data.type === 'revenue' || data.type === 'expense') {
      // Revenue: credit balance is positive
      // Expense: debit balance is positive
      const amount = data.type === 'revenue' ? -data.amount : data.amount;
      
      if (amount !== 0) {
        profitLoss.push({
          category: data.type as 'revenue' | 'expense',
          account,
          amount: Math.abs(amount)
        });
      }
    }
  }
  
  return profitLoss.sort((a, b) => {
    const order = { revenue: 1, expense: 2 };
    return order[a.category] - order[b.category];
  });
}

// Generate Cash Flow Statement
export function generateCashFlow(entries: LedgerEntry[]): CashFlowItem[] {
  const cashFlow: CashFlowItem[] = [];
  
  // Filter only cash-related entries
  const cashEntries = entries.filter(e => 
    e.account.toLowerCase().includes('cash') || 
    e.account.toLowerCase().includes('bank')
  );
  
  for (const entry of cashEntries) {
    const amount = entry.debit - entry.credit;
    
    if (amount !== 0) {
      const category = determineCashFlowCategory(entry);
      
      cashFlow.push({
        category,
        description: entry.description,
        amount: Math.abs(amount),
        inflow: amount > 0
      });
    }
  }
  
  return cashFlow;
}

// Determine cash flow category based on source and description
function determineCashFlowCategory(entry: LedgerEntry): 'operating' | 'investing' | 'financing' {
  const desc = entry.description.toLowerCase();
  const source = entry.source;
  
  if (source === 'billing' || source === 'inventory' || 
      desc.includes('sale') || desc.includes('revenue') || desc.includes('collection')) {
    return 'operating';
  }
  if (desc.includes('purchase') || desc.includes('asset') || desc.includes('equipment')) {
    return 'investing';
  }
  if (desc.includes('loan') || desc.includes('capital') || desc.includes('dividend')) {
    return 'financing';
  }
  
  return 'operating'; // Default
}

// Generate complete financial report
export function generateFinancialReport(
  vouchers: VoucherData[],
  bills: BillingData[],
  inventoryBills: InventoryData[],
  schoolId: string
): FinancialReport {
  const entries = getLedgerEntries(vouchers, bills, inventoryBills, schoolId);
  
  // Generate Income Statement first (this is the new ERP-grade layer)
  const incomeStatement = generateIncomeStatement(bills, inventoryBills, vouchers, String(schoolId));
  
  // Now derive Profit & Loss from Income Statement
  const profitLoss = deriveProfitLossFromIncomeStatement(incomeStatement);
  
  const trialBalance = calculateTrialBalance(entries);
  const balanceSheet = generateBalanceSheet(entries);
  const cashFlow = generateCashFlow(entries);
  
  // Calculate totals
  const totalAssets = balanceSheet
    .filter(i => i.category === 'asset')
    .reduce((sum, i) => sum + i.amount, 0);
  
  const totalLiabilities = balanceSheet
    .filter(i => i.category === 'liability')
    .reduce((sum, i) => sum + i.amount, 0);
  
  const totalEquity = balanceSheet
    .filter(i => i.category === 'equity')
    .reduce((sum, i) => sum + i.amount, 0);
  
  // Use Income Statement for net profit calculation
  const netProfit = incomeStatement.netIncome;
  const netCashFlow = cashFlow
    .reduce((sum, i) => sum + (i.inflow ? i.amount : -i.amount), 0);
  
  // Verify accounting equation: Assets = Liabilities + Equity
  const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity + netProfit)) < 0.01;
  
  return {
    trialBalance,
    balanceSheet,
    profitLoss,
    cashFlow,
    incomeStatement,
    summary: {
      totalAssets,
      totalLiabilities,
      totalEquity,
      netProfit,
      netCashFlow
    },
    isBalanced,
    generatedAt: new Date().toISOString()
  };
}

// Helper function to derive P&L from Income Statement
function deriveProfitLossFromIncomeStatement(incomeStatement: IncomeStatement): ProfitLossItem[] {
  const profitLoss: ProfitLossItem[] = [];
  
  // Revenue items
  if (incomeStatement.revenue.studentFees > 0) {
    profitLoss.push({
      category: 'revenue',
      account: 'Student Fees Revenue',
      amount: incomeStatement.revenue.studentFees
    });
  }
  
  if (incomeStatement.revenue.inventorySales > 0) {
    profitLoss.push({
      category: 'revenue',
      account: 'Inventory Sales Revenue',
      amount: incomeStatement.revenue.inventorySales
    });
  }
  
  // Expense items
  if (incomeStatement.expenses.cogs > 0) {
    profitLoss.push({
      category: 'expense',
      account: 'Cost of Goods Sold',
      amount: incomeStatement.expenses.cogs
    });
  }
  
  if (incomeStatement.expenses.voucherExpenses > 0) {
    profitLoss.push({
      category: 'expense',
      account: 'Operating Expenses',
      amount: incomeStatement.expenses.voucherExpenses
    });
  }
  
  return profitLoss;
}

// Export functions for individual report generation
export {
  determineAccountType,
  determineSubCategory,
  determineCashFlowCategory
};

// Re-export IncomeStatement type for convenience
export type { IncomeStatement } from './incomeStatement';
