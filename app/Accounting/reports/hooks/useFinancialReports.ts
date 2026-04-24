// ERP-Grade Financial Reports Hook
// Manages state, caching, and memoized calculations for financial reports

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { 
  FinancialReport, 
  TrialBalanceItem, 
  BalanceSheetItem, 
  ProfitLossItem, 
  CashFlowItem,
  IncomeStatement
} from '../services/accountingEngine';
import { generateReportFromAggregated, aggregateAccountingData } from '../services/dataAggregator';

export type ReportTab = 'overview' | 'balance-sheet' | 'income-statement' | 'profit-loss' | 'cash-flow' | 'trial-balance';

export interface UseFinancialReportsOptions {
  schoolId: string;
  fiscalYear?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export interface UseFinancialReportsReturn {
  // Data
  report: FinancialReport | null;
  isLoading: boolean;
  errors: string[];
  lastUpdated: string | null;
  
  // Tab state
  activeTab: ReportTab;
  setActiveTab: (tab: ReportTab) => void;
  
  // Actions
  refresh: () => Promise<void>;
  isRefreshing: boolean;
  
  // Derived data (memoized)
  trialBalanceData: TrialBalanceItem[];
  balanceSheetData: BalanceSheetItem[];
  profitLossData: ProfitLossItem[];
  cashFlowData: CashFlowItem[];
  incomeStatementData: IncomeStatement;
  
  // Summary stats
  summaryStats: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    netProfit: number;
    netCashFlow: number;
    isBalanced: boolean;
  };
}

export function useFinancialReports({
  schoolId,
  fiscalYear = '2081-2082',
  autoRefresh = false,
  refreshInterval = 60000 // 1 minute default
}: UseFinancialReportsOptions): UseFinancialReportsReturn {
  // State
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  
  // Refs for caching and debouncing
  const cacheRef = useRef<Map<string, FinancialReport>>(new Map());
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);
  
  // Cache key
  const cacheKey = useMemo(() => `${schoolId}-${fiscalYear}`, [schoolId, fiscalYear]);
  
  // Fetch data function
  const fetchData = useCallback(async (force = false) => {
    // Debounce: don't fetch if already fetched within 2 seconds
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 2000) {
      return;
    }
    
    // Check cache
    if (!force && cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey)!;
      setReport(cached);
      setLastUpdated(cached.generatedAt);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setErrors([]);
    
    try {
      const result = await generateReportFromAggregated(schoolId);
      
      if (result.report) {
        setReport(result.report);
        setLastUpdated(result.timestamp);
        // Update cache
        cacheRef.current.set(cacheKey, result.report);
      } else {
        setErrors(result.errors);
      }
    } catch (error) {
      setErrors([`Failed to fetch reports: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setIsLoading(false);
      lastFetchRef.current = Date.now();
    }
  }, [schoolId, cacheKey]);
  
  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Auto refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchData(true);
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);
  
  // Debounced refresh function
  const refresh = useCallback(async () => {
    // Clear any pending refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    setIsRefreshing(true);
    
    // Debounce the actual refresh
    refreshTimeoutRef.current = setTimeout(async () => {
      await fetchData(true);
      setIsRefreshing(false);
    }, 300);
  }, [fetchData]);
  
  // Memoized derived data
  const trialBalanceData = useMemo(() => {
    if (!report) return [];
    return report.trialBalance;
  }, [report]);
  
  const balanceSheetData = useMemo(() => {
    if (!report) return [];
    return report.balanceSheet;
  }, [report]);
  
  const profitLossData = useMemo(() => {
    if (!report) return [];
    return report.profitLoss;
  }, [report]);
  
  const cashFlowData = useMemo(() => {
    if (!report) return [];
    return report.cashFlow;
  }, [report]);
  
  const incomeStatementData = useMemo(() => {
    if (!report) {
      return {
        revenue: { studentFees: 0, inventorySales: 0, totalRevenue: 0 },
        expenses: { cogs: 0, voucherExpenses: 0, totalExpenses: 0 },
        netIncome: 0
      };
    }
    return report.incomeStatement;
  }, [report]);
  
  // Summary stats
  const summaryStats = useMemo(() => {
    if (!report) {
      return {
        totalAssets: 0,
        totalLiabilities: 0,
        totalEquity: 0,
        netProfit: 0,
        netCashFlow: 0,
        isBalanced: false
      };
    }
    
    return {
      totalAssets: report.summary.totalAssets,
      totalLiabilities: report.summary.totalLiabilities,
      totalEquity: report.summary.totalEquity,
      netProfit: report.summary.netProfit,
      netCashFlow: report.summary.netCashFlow,
      isBalanced: report.isBalanced
    };
  }, [report]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    report,
    isLoading,
    errors,
    lastUpdated,
    activeTab,
    setActiveTab,
    refresh,
    isRefreshing,
    trialBalanceData,
    balanceSheetData,
    profitLossData,
    cashFlowData,
    incomeStatementData,
    summaryStats
  };
}

// Hook for direct data aggregation (without report generation)
export function useAggregatedData(schoolId: string) {
  const [data, setData] = useState<{
    vouchers: unknown[];
    bills: unknown[];
    inventoryBills: unknown[];
    isLoading: boolean;
    errors: string[];
  }>({
    vouchers: [],
    bills: [],
    inventoryBills: [],
    isLoading: true,
    errors: []
  });
  
  const fetchData = useCallback(async () => {
    setData(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await aggregateAccountingData(schoolId);
      setData({
        vouchers: result.vouchers,
        bills: result.bills,
        inventoryBills: result.inventoryBills,
        isLoading: false,
        errors: result.errors
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        errors: [`Aggregation failed: ${error instanceof Error ? error.message : 'Unknown'}`]
      }));
    }
  }, [schoolId]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { ...data, refresh: fetchData };
}

export { aggregateAccountingData };
