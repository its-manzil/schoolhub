// ERP-Grade Voucher Service Layer
// Handles all API interactions for voucher operations

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api/accounting/voucher' 
  : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/accounting/voucher`;

// Get auth token from localStorage
const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// API Response Types
interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

// Handle API errors
const handleApiError = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }
    
    return data;
  } else {
    const text = await response.text();
    throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
  }
};

// Types
export interface VoucherEntry {
  ledgerId: string;
  ledgerName: string;
  debit: number;
  credit: number;
  description: string;
}

export interface VoucherData {
  type: string;
  date: string;
  fiscalYear: string;
  refNo: string;
  narration: string;
  entries: VoucherEntry[];
  voucherNo?: string;
}

// Voucher number counter storage (per fiscal year, per type)
const voucherCounters: Map<string, number> = new Map();

/**
 * Generate voucher number with fiscal year format
 * Format: {TYPE}-{FISCAL_YEAR_START}-{SEQUENCE}
 * Example: JV-2081-00001, RCT-2082-00012
 */
export const generateVoucherNumber = (
  voucherType: string,
  fiscalYear: string
): string => {
  const fiscalYearStart = fiscalYear.split('-')[0];
  const counterKey = `${voucherType}-${fiscalYearStart}`;
  
  // Get current counter or start at 1
  const currentCounter = voucherCounters.get(counterKey) || 1;
  
  // Increment counter
  voucherCounters.set(counterKey, currentCounter + 1);
  
  // Format sequence number (5 digits with leading zeros)
  const sequence = currentCounter.toString().padStart(5, '0');
  
  return `${voucherType}-${fiscalYearStart}-${sequence}`;
};

/**
 * Get next voucher number without incrementing (for preview)
 */
export const peekNextVoucherNumber = (
  voucherType: string,
  fiscalYear: string
): string => {
  const fiscalYearStart = fiscalYear.split('-')[0];
  const counterKey = `${voucherType}-${fiscalYearStart}`;
  const currentCounter = voucherCounters.get(counterKey) || 1;
  const sequence = currentCounter.toString().padStart(5, '0');
  
  return `${voucherType}-${fiscalYearStart}-${sequence}`;
};

/**
 * Reset voucher counter for a specific fiscal year and type
 * (Useful for testing or fiscal year rollover)
 */
export const resetVoucherCounter = (
  voucherType: string,
  fiscalYear: string
): void => {
  const fiscalYearStart = fiscalYear.split('-')[0];
  const counterKey = `${voucherType}-${fiscalYearStart}`;
  voucherCounters.delete(counterKey);
};

export interface RecentVoucher {
  id: string;
  voucherNumber: string;
  voucherType: string;
  date: string;
  createdBy: string;
  status: 'Draft' | 'Posted';
  amount: number;
  updatedAt?: string;
}

// Voucher API functions
export const voucherService = {
  // Create draft voucher
  async createDraft(voucherData: VoucherData): Promise<{ success: boolean; data: Record<string, unknown> }> {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(voucherData)
    });
    
    return handleApiError(response);
  },

  // Update voucher (only if draft)
  async updateVoucher(id: string, voucherData: Partial<VoucherData>): Promise<{ success: boolean; data: Record<string, unknown> }> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(voucherData)
    });
    
    return handleApiError(response);
  },

  // Post voucher - ERP-grade audit-safe posting
  async postVoucher(id: string): Promise<{ success: boolean; data: Record<string, unknown> }> {
    const response = await fetch(`${API_BASE_URL}/${id}/post`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    return handleApiError(response);
  },

  // Get single voucher
  async getVoucher(id: string): Promise<{ success: boolean; data: Record<string, unknown> }> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiError(response);
  },

  // List vouchers with pagination and filters
  async listVouchers(params: Record<string, string> = {}): Promise<{ success: boolean; data: Array<Record<string, unknown>>; pagination?: Record<string, unknown> }> {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiError(response);
  },

  // Get recent vouchers for real-time updates
  async getRecentVouchers(_schoolId?: string, limit: number = 10): Promise<{ success: boolean; data: RecentVoucher[] }> {
    const params = new URLSearchParams({ limit: limit.toString() });
    // schoolId is obtained from auth token on backend, not query param
    
    const url = `${API_BASE_URL}/recent?${params.toString()}`;
    console.log('[getRecentVouchers] Fetching:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    console.log('[getRecentVouchers] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[getRecentVouchers] Error response:', errorText);
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }
    
    return response.json();
  },

  // Submit edit request for posted voucher
  async submitEditRequest(voucherId: string, reason: string): Promise<{ success: boolean; data?: Record<string, unknown> }> {
    const response = await fetch(`${API_BASE_URL}/${voucherId}/edit-request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason, requestedAt: new Date().toISOString() })
    });
    
    return handleApiError(response);
  }
};

// Helper function to convert frontend voucher format to backend format
export const convertToBackendFormat = (frontendVoucher: {
  selectedType: string;
  date: string;
  fiscalYear?: string;
  refNo?: string;
  narration?: string;
  rows: Array<{
    ledgerId: string;
    ledgerName: string;
    debit: number;
    credit: number;
    description?: string;
  }>;
}): VoucherData => {
  return {
    type: frontendVoucher.selectedType,
    date: frontendVoucher.date,
    fiscalYear: frontendVoucher.fiscalYear || '2082/83',
    refNo: frontendVoucher.refNo || '',
    narration: frontendVoucher.narration || '',
    entries: frontendVoucher.rows
      .filter((row: { ledgerId: string; ledgerName: string; debit: number; credit: number; description?: string }) => row.ledgerName && (row.debit > 0 || row.credit > 0))
      .map((row: { ledgerId: string; ledgerName: string; debit: number; credit: number; description?: string }) => ({
        ledgerId: row.ledgerId,
        ledgerName: row.ledgerName,
        debit: row.debit || 0,
        credit: row.credit || 0,
        description: row.description || ''
      }))
  };
};

// Backend voucher structure
interface BackendVoucher {
  _id: string;
  voucherNo: string;
  type: string;
  date: string;
  fiscalYear: string;
  refNo: string;
  narration: string;
  status: 'Draft' | 'Posted';
  entries: Array<{
    _id?: string;
    ledgerId: string;
    ledgerName: string;
    debit: number;
    credit: number;
    description?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to convert backend voucher format to frontend format
export const convertToFrontendFormat = (backendVoucher: BackendVoucher) => {
  return {
    id: backendVoucher._id,
    voucherNo: backendVoucher.voucherNo,
    selectedType: backendVoucher.type,
    date: backendVoucher.date,
    fiscalYear: backendVoucher.fiscalYear,
    refNo: backendVoucher.refNo,
    narration: backendVoucher.narration,
    status: backendVoucher.status,
    rows: (backendVoucher.entries || []).map((entry) => ({
      id: entry._id || entry.ledgerId,
      ledgerId: entry.ledgerId,
      ledgerName: entry.ledgerName,
      debit: entry.debit,
      credit: entry.credit,
      description: entry.description
    })),
    createdAt: backendVoucher.createdAt,
    updatedAt: backendVoucher.updatedAt
  };
};
