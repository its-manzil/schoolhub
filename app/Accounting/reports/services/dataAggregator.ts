// ERP-Grade Data Aggregator
// Fetches and merges data from all sources into unified accounting dataset

import { generateFinancialReport, FinancialReport } from './accountingEngine';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056';

// Unified data interface
export interface UnifiedAccountingData {
  vouchers: unknown[];
  bills: unknown[];
  inventoryBills: unknown[];
  schoolId: string;
  timestamp: string;
  isComplete: boolean;
  errors: string[];
}

// Helper to get auth headers
function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Fetch vouchers from API
async function fetchVouchers(schoolId: string): Promise<{ data: unknown[]; error?: string }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/accounting/voucher?schoolId=${schoolId}`,
      { headers: getAuthHeaders() }
    );
    
    if (!response.ok) {
      // Fallback: try without query param if backend extracts from auth
      const fallbackResponse = await fetch(
        `${API_BASE_URL}/api/accounting/voucher`,
        { headers: getAuthHeaders() }
      );
      
      if (!fallbackResponse.ok) {
        return { data: [], error: `Vouchers API failed: ${response.status}` };
      }
      
      const data = await fallbackResponse.json();
      return { data: data.data || data || [] };
    }
    
    const data = await response.json();
    return { data: data.data || data || [] };
  } catch (error) {
    return { 
      data: [], 
      error: `Vouchers fetch error: ${error instanceof Error ? error.message : 'Unknown'}` 
    };
  }
}

// Fetch bills from API
async function fetchBills(schoolId: string): Promise<{ data: unknown[]; error?: string }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/billings?schoolId=${schoolId}`,
      { headers: getAuthHeaders() }
    );
    
    if (!response.ok) {
      // Try alternative endpoint
      const altResponse = await fetch(
        `${API_BASE_URL}/api/bills?schoolId=${schoolId}`,
        { headers: getAuthHeaders() }
      );
      
      if (!altResponse.ok) {
        return { data: [], error: `Bills API failed: ${response.status}` };
      }
      
      const data = await altResponse.json();
      return { data: data.data || data || [] };
    }
    
    const data = await response.json();
    return { data: data.data || data || [] };
  } catch (error) {
    return { 
      data: [], 
      error: `Bills fetch error: ${error instanceof Error ? error.message : 'Unknown'}` 
    };
  }
}

// Fetch inventory bills from API
async function fetchInventoryBills(schoolId: string): Promise<{ data: unknown[]; error?: string }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/accounting/inventory?schoolId=${schoolId}`,
      { headers: getAuthHeaders() }
    );
    
    if (!response.ok) {
      return { data: [], error: `Inventory API failed: ${response.status}` };
    }
    
    const data = await response.json();
    return { data: data.data || data || [] };
  } catch (error) {
    return { 
      data: [], 
      error: `Inventory fetch error: ${error instanceof Error ? error.message : 'Unknown'}` 
    };
  }
}

// Aggregate all data sources
export async function aggregateAccountingData(
  schoolId: string
): Promise<UnifiedAccountingData> {
  const errors: string[] = [];
  
  // Fetch all data sources in parallel
  const [vouchersResult, billsResult, inventoryResult] = await Promise.all([
    fetchVouchers(schoolId),
    fetchBills(schoolId),
    fetchInventoryBills(schoolId)
  ]);
  
  // Collect errors
  if (vouchersResult.error) errors.push(vouchersResult.error);
  if (billsResult.error) errors.push(billsResult.error);
  if (inventoryResult.error) errors.push(inventoryResult.error);
  
  // Log for debugging
  console.log('[DataAggregator] Fetch results:', {
    vouchers: vouchersResult.data.length,
    bills: billsResult.data.length,
    inventory: inventoryResult.data.length,
    errors
  });
  
  return {
    vouchers: vouchersResult.data,
    bills: billsResult.data,
    inventoryBills: inventoryResult.data,
    schoolId: String(schoolId),
    timestamp: new Date().toISOString(),
    isComplete: errors.length === 0,
    errors
  };
}

// Generate financial report from aggregated data
export async function generateReportFromAggregated(
  schoolId: string
): Promise<{ report: FinancialReport | null; errors: string[]; timestamp: string }> {
  const data = await aggregateAccountingData(schoolId);
  
  if (data.vouchers.length === 0 && data.bills.length === 0 && data.inventoryBills.length === 0) {
    return {
      report: null,
      errors: [...data.errors, 'No data available from any source'],
      timestamp: data.timestamp
    };
  }
  
  try {
    const report = generateFinancialReport(
      data.vouchers as Parameters<typeof generateFinancialReport>[0],
      data.bills as Parameters<typeof generateFinancialReport>[1],
      data.inventoryBills as Parameters<typeof generateFinancialReport>[2],
      String(schoolId)
    );
    
    return {
      report,
      errors: data.errors,
      timestamp: data.timestamp
    };
  } catch (error) {
    return {
      report: null,
      errors: [...data.errors, `Report generation failed: ${error instanceof Error ? error.message : 'Unknown'}`],
      timestamp: data.timestamp
    };
  }
}

// Export individual fetch functions for direct use
export {
  fetchVouchers,
  fetchBills,
  fetchInventoryBills
};
