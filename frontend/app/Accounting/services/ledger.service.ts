// ERP-Grade Ledger Service Layer
// Handles all API interactions for ledger operations with backend-driven search

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api/accounting' 
  : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/accounting`;

// Get auth token from localStorage
const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Types
export type LedgerType = 'Cash' | 'Bank' | 'Income' | 'Expense' | 'Asset' | 'Liability' | 'Equity';
export type LedgerGroup = 'Assets' | 'Liabilities' | 'Income' | 'Expense';

export interface Ledger {
  id: string;
  name: string;
  type: LedgerType;
  group: LedgerGroup;
  code?: string;
}

export type VoucherType = 'JV' | 'RCT' | 'PR' | 'CN' | 'PV';

// Ledger API functions
export const ledgerService = {
  // Backend-driven ledger search with debouncing support
  async searchLedgers(
    query: string, 
    voucherType?: VoucherType, 
    isDebit?: boolean,
    schoolId?: string
  ): Promise<{ success: boolean; data: Ledger[] }> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (voucherType) params.append('type', voucherType);
    if (isDebit !== undefined) params.append('isDebit', isDebit.toString());
    if (schoolId) params.append('schoolId', schoolId);
    
    const response = await fetch(`${API_BASE_URL}/ledgers/search?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Search failed' }));
      throw new Error(error.error || 'Failed to search ledgers');
    }
    
    return response.json();
  },

  // Get all ledgers for a school
  async getAllLedgers(schoolId?: string): Promise<{ success: boolean; data: Ledger[] }> {
    const params = schoolId ? `?schoolId=${schoolId}` : '';
    
    const response = await fetch(`${API_BASE_URL}/ledgers${params}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch ledgers' }));
      throw new Error(error.error || 'Failed to fetch ledgers');
    }
    
    return response.json();
  },

  // Create new ledger
  async createLedger(ledger: Partial<Ledger>): Promise<{ success: boolean; data: Ledger }> {
    const response = await fetch(`${API_BASE_URL}/ledgers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(ledger)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create ledger' }));
      throw new Error(error.error || 'Failed to create ledger');
    }
    
    return response.json();
  },

  // Delete ledger
  async deleteLedger(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/ledgers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete ledger' }));
      throw new Error(error.error || 'Failed to delete ledger');
    }
    
    return response.json();
  }
};

// Get filtered ledgers based on voucher type rules (client-side fallback)
export const getFilteredLedgersByType = (
  ledgers: Ledger[], 
  voucherType: VoucherType, 
  isDebit: boolean
): Ledger[] => {
  switch (voucherType) {
    case 'CN':
      // Contra: Only Cash/Bank
      return ledgers.filter(ledger => ledger.type === 'Cash' || ledger.type === 'Bank');
    
    case 'RCT':
      // Receipt: Debit -> Cash/Bank, Credit -> Income/Asset
      if (isDebit) {
        return ledgers.filter(ledger => ledger.type === 'Cash' || ledger.type === 'Bank');
      } else {
        return ledgers.filter(ledger => ledger.type === 'Income' || ledger.type === 'Asset');
      }
    
    case 'PR':
    case 'PV':
      // Payment/Purchase: Debit -> Expense, Credit -> Cash/Bank
      if (isDebit) {
        return ledgers.filter(ledger => ledger.type === 'Expense');
      } else {
        return ledgers.filter(ledger => ledger.type === 'Cash' || ledger.type === 'Bank');
      }
    
    case 'JV':
    default:
      // Journal: No restrictions
      return ledgers;
  }
};

// Group ledgers by their group property
export const groupLedgersByType = (ledgers: Ledger[]): Record<string, Ledger[]> => {
  return ledgers.reduce((groups, ledger) => {
    if (!groups[ledger.group]) {
      groups[ledger.group] = [];
    }
    groups[ledger.group].push(ledger);
    return groups;
  }, {} as Record<string, Ledger[]>);
};

// Get color for ledger type (for UI display)
export const getLedgerTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'Cash': '#10b981',
    'Bank': '#3b82f6', 
    'Income': '#22c55e',
    'Expense': '#ef4444',
    'Asset': '#f59e0b',
    'Liability': '#8b5cf6',
    'Equity': '#06b6d4'
  };
  return colors[type] || '#6b7280';
};
