// ERP-Grade Income Statement Module
// Structured breakdown of revenue and expenses before net profit calculation

// Billing data interface
interface BillingData {
  _id: string;
  total?: number;
  amount?: number;
  paymentStatus?: string;
  paid?: boolean;
  schoolId?: string | number;
}

// Inventory data interface
interface InventoryData {
  _id: string;
  total?: number;
  salePrice?: number;
  cost?: number;
  purchasePrice?: number;
  schoolId?: string | number;
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
  type?: string;
  entries?: VoucherEntry[];
  schoolId?: string | number;
}

// Income Statement structure
export interface IncomeStatement {
  revenue: {
    studentFees: number;
    inventorySales: number;
    totalRevenue: number;
  };
  expenses: {
    cogs: number;
    voucherExpenses: number;
    totalExpenses: number;
  };
  netIncome: number;
}

// Aggregate revenue from student billing (only paid bills)
function calculateStudentFees(bills: BillingData[], schoolId: string): number {
  return bills
    .filter(bill => {
      const billSchoolId = String(bill.schoolId || '');
      const isPaid = bill.paymentStatus === 'paid' || bill.paid === true;
      return billSchoolId === schoolId && isPaid;
    })
    .reduce((total, bill) => total + (bill.total || bill.amount || 0), 0);
}

// Aggregate revenue from inventory sales
function calculateInventorySales(inventoryBills: InventoryData[], schoolId: string): number {
  return inventoryBills
    .filter(bill => {
      const billSchoolId = String(bill.schoolId || '');
      return billSchoolId === schoolId;
    })
    .reduce((total, bill) => total + (bill.total || bill.salePrice || 0), 0);
}

// Calculate COGS from inventory sales
function calculateCOGS(inventoryBills: InventoryData[], schoolId: string): number {
  return inventoryBills
    .filter(bill => {
      const billSchoolId = String(bill.schoolId || '');
      return billSchoolId === schoolId;
    })
    .reduce((total, bill) => {
      // Use actual cost if available, otherwise estimate at 70% of revenue
      const cost = bill.cost || bill.purchasePrice || 
        ((bill.total || bill.salePrice || 0) * 0.7);
      return total + cost;
    }, 0);
}

// Calculate expenses from vouchers (PR, JV, PV types)
function calculateVoucherExpenses(vouchers: VoucherData[], schoolId: string): number {
  const expenseTypes = ['PR', 'JV', 'PV']; // Payment, Journal, Purchase Voucher types
  
  return vouchers
    .filter(voucher => {
      const voucherSchoolId = String(voucher.schoolId || '');
      const isExpenseType = !voucher.type || expenseTypes.includes(voucher.type);
      return voucherSchoolId === schoolId && isExpenseType;
    })
    .reduce((total, voucher) => {
      if (!voucher.entries || !Array.isArray(voucher.entries)) return total;
      
      // Sum all debit entries that are expense accounts
      const expenseAmount = voucher.entries.reduce((entryTotal, entry) => {
        const isExpense = entry.accountType === 'expense' ||
          (entry.ledgerName || entry.account || '').toLowerCase().includes('expense') ||
          (entry.ledgerName || entry.account || '').toLowerCase().includes('cost') ||
          (entry.ledgerName || entry.account || '').toLowerCase().includes('salary') ||
          (entry.ledgerName || entry.account || '').toLowerCase().includes('rent') ||
          (entry.ledgerName || entry.account || '').toLowerCase().includes('utilities');
        
        if (isExpense) {
          return entryTotal + (entry.debit || 0);
        }
        return entryTotal;
      }, 0);
      
      return total + expenseAmount;
    }, 0);
}

// Generate complete Income Statement
export function generateIncomeStatement(
  bills: BillingData[],
  inventoryBills: InventoryData[],
  vouchers: VoucherData[],
  schoolId: string
): IncomeStatement {
  const studentFees = calculateStudentFees(bills, String(schoolId));
  const inventorySales = calculateInventorySales(inventoryBills, String(schoolId));
  const totalRevenue = studentFees + inventorySales;
  
  const cogs = calculateCOGS(inventoryBills, String(schoolId));
  const voucherExpenses = calculateVoucherExpenses(vouchers, String(schoolId));
  const totalExpenses = cogs + voucherExpenses;
  
  const netIncome = totalRevenue - totalExpenses;
  
  return {
    revenue: {
      studentFees,
      inventorySales,
      totalRevenue
    },
    expenses: {
      cogs,
      voucherExpenses,
      totalExpenses
    },
    netIncome
  };
}

// Export individual calculation functions for reuse
export {
  calculateStudentFees,
  calculateInventorySales,
  calculateCOGS,
  calculateVoucherExpenses
};
