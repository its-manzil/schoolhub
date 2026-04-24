// ERP-Grade Voucher Management Hook
// Main hook for managing voucher state, operations, and real-time updates

import { useState, useCallback, useEffect, useRef } from 'react';
import { voucherService, convertToBackendFormat, RecentVoucher, peekNextVoucherNumber } from '../services/voucher.service';

// Helper to get current date in BS format (YYYY-MM-DD)
const getCurrentBSDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  // Convert to BS date - simplified approximation (actual BS date would need conversion)
  // For now, use current year + 57 (approximate BS year offset for 2026)
  const bsYear = year + 57;
  return `${bsYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export type VoucherType = 'JV' | 'RCT' | 'PR' | 'CN' | 'PV';
export type VoucherStatus = 'Draft' | 'Posted';

export interface VoucherEntryRow {
  id: string;
  ledgerId: string;
  ledgerName: string;
  debit: number;
  credit: number;
  description: string;
  hasError?: boolean;
  errorMessage?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface UseVoucherOptions {
  schoolId?: string;
  pollingInterval?: number; // in milliseconds
  fiscalYear?: string;
}

interface UseVoucherReturn {
  // State
  selectedType: VoucherType;
  setSelectedType: (type: VoucherType) => void;
  voucherStatus: VoucherStatus;
  voucherNo: string;
  setVoucherNo: (voucherNo: string) => void;
  date: string;
  setDate: (date: string) => void;
  refNo: string;
  setRefNo: (ref: string) => void;
  narration: string;
  setNarration: (narration: string) => void;
  rows: VoucherEntryRow[];
  toasts: ToastMessage[];
  isPosting: boolean;
  recentVouchers: RecentVoucher[];
  isLoadingRecent: boolean;
  fiscalYear: string;
  setFiscalYear: (year: string) => void;
  
  // Actions
  updateRow: (index: number, field: keyof VoucherEntryRow, value: string | number) => void;
  addRow: () => void;
  removeRow: (id: string) => void;
  addToast: (message: string, type: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  handleSaveDraft: () => Promise<void>;
  handlePostVoucher: () => Promise<boolean>;
  refreshRecentVouchers: () => Promise<void>;
  resetVoucher: () => void;
}

// Generate unique ID for rows
const generateRowId = (): string => Math.random().toString(36).substr(2, 9);

export const useVoucher = ({
  schoolId,
  pollingInterval = 15000, // Default 15 seconds
  fiscalYear: initialFiscalYear = '2081-2082'
}: UseVoucherOptions = {}): UseVoucherReturn => {
  // Core voucher state
  const [selectedType, setSelectedType] = useState<VoucherType>('JV');
  const [voucherStatus, setVoucherStatus] = useState<VoucherStatus>('Draft');
  const [voucherNo, setVoucherNo] = useState('');
  const [fiscalYear, setFiscalYear] = useState<string>(initialFiscalYear);
  const [date, setDate] = useState(getCurrentBSDateString());
  const [refNo, setRefNo] = useState('');
  const [narration, setNarration] = useState('');
  const [rows, setRows] = useState<VoucherEntryRow[]>([
    { id: generateRowId(), ledgerId: '', ledgerName: '', debit: 0, credit: 0, description: '' },
    { id: generateRowId(), ledgerId: '', ledgerName: '', debit: 0, credit: 0, description: '' }
  ]);
  
  // UI state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [recentVouchers, setRecentVouchers] = useState<RecentVoucher[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  
  // Polling ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Generate voucher number when type or fiscal year changes
  useEffect(() => {
    setVoucherNo(peekNextVoucherNumber(selectedType, fiscalYear));
  }, [selectedType, fiscalYear]);

  // Toast management
  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = generateRowId();
    const toast: ToastMessage = { id, type, message, duration: 3000 };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Row management
  const updateRow = useCallback((index: number, field: keyof VoucherEntryRow, value: string | number) => {
    setRows(prev => {
      const newRows = [...prev];
      const row = { ...newRows[index], [field]: value, hasError: false, errorMessage: undefined };
      
      // Enforce debit/credit exclusivity
      if (field === 'debit' && Number(value) > 0) {
        row.credit = 0;
      }
      if (field === 'credit' && Number(value) > 0) {
        row.debit = 0;
      }
      
      newRows[index] = row;
      return newRows;
    });
  }, []);

  const addRow = useCallback(() => {
    setRows(prev => [...prev, {
      id: generateRowId(),
      ledgerId: '',
      ledgerName: '',
      debit: 0,
      credit: 0,
      description: ''
    }]);
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows(prev => {
      if (prev.length <= 2) return prev; // Keep minimum 2 rows
      return prev.filter(row => row.id !== id);
    });
  }, []);

  // Fetch recent vouchers
  const refreshRecentVouchers = useCallback(async () => {
    if (!schoolId) return;
    
    setIsLoadingRecent(true);
    try {
      const response = await voucherService.getRecentVouchers(schoolId, 10);
      if (response.success) {
        setRecentVouchers(response.data);
      }
    } catch {
      // Silent fail - don't show toast for background polling errors
    } finally {
      setIsLoadingRecent(false);
    }
  }, [schoolId]);

  // Initial fetch of recent vouchers
  useEffect(() => {
    refreshRecentVouchers();
  }, [refreshRecentVouchers]);

  // Setup polling for real-time updates
  useEffect(() => {
    if (!schoolId) return;

    // Clear existing interval
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    // Setup new polling interval
    pollingRef.current = setInterval(() => {
      refreshRecentVouchers();
    }, pollingInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [schoolId, pollingInterval, refreshRecentVouchers]);

  // Save draft voucher
  const handleSaveDraft = useCallback(async () => {
    if (voucherStatus === 'Posted') {
      addToast('Cannot save draft of posted voucher', 'warning');
      return;
    }

    try {
      const backendVoucher = convertToBackendFormat({
        selectedType,
        date,
        fiscalYear,
        refNo,
        narration,
        rows
      });

      const response = await voucherService.createDraft(backendVoucher);
      
      if (response.success) {
        setVoucherNo((response.data as { voucherNo?: string }).voucherNo || voucherNo);
        addToast('Draft saved successfully', 'success');
        
        // Add to recent vouchers
        const newVoucher: RecentVoucher = {
          id: (response.data as { _id?: string })._id || generateRowId(),
          voucherNumber: (response.data as { voucherNo?: string }).voucherNo || voucherNo,
          voucherType: selectedType,
          date: date,
          createdBy: 'Current User',
          status: 'Draft',
          amount: rows.reduce((sum, row) => sum + (row.debit || 0), 0)
        };
        
        setRecentVouchers(prev => [newVoucher, ...prev.slice(0, 9)]);
        refreshRecentVouchers();
      }
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to save draft', 'error');
    }
  }, [voucherStatus, selectedType, date, fiscalYear, refNo, narration, rows, voucherNo, addToast, refreshRecentVouchers]);

  // Post voucher - ERP-grade audit-safe posting
  const handlePostVoucher = useCallback(async (): Promise<boolean> => {
    if (voucherStatus === 'Posted') {
      addToast('Voucher is already posted', 'warning');
      return false;
    }

    setIsPosting(true);

    try {
      // Step 1: Create or get draft
      const backendVoucher = convertToBackendFormat({
        selectedType,
        date,
        fiscalYear,
        refNo,
        narration,
        rows
      });

      const draftResponse = await voucherService.createDraft(backendVoucher);
      
      if (!draftResponse.success) {
        throw new Error('Failed to create voucher draft');
      }

      const voucherId = (draftResponse.data as { _id: string })._id;
      
      // Step 2: Post the voucher (server will validate and lock)
      const postResponse = await voucherService.postVoucher(voucherId);
      
      if (postResponse.success) {
        setVoucherStatus('Posted');
        setVoucherNo((postResponse.data as { voucherNo?: string }).voucherNo || voucherNo);
        addToast('Voucher posted successfully!', 'success');
        
        // Update recent vouchers list
        refreshRecentVouchers();
        return true;
      } else {
        throw new Error('Failed to post voucher');
      }
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to post voucher', 'error');
      return false;
    } finally {
      setIsPosting(false);
    }
  }, [voucherStatus, selectedType, date, fiscalYear, refNo, narration, rows, voucherNo, addToast, refreshRecentVouchers]);

  // Reset voucher to create new one
  const resetVoucher = useCallback(() => {
    setSelectedType('JV');
    setVoucherStatus('Draft');
    setVoucherNo('');
    setDate(getCurrentBSDateString());
    setRefNo('');
    setNarration('');
    setRows([
      { id: generateRowId(), ledgerId: '', ledgerName: '', debit: 0, credit: 0, description: '' },
      { id: generateRowId(), ledgerId: '', ledgerName: '', debit: 0, credit: 0, description: '' }
    ]);
  }, []);

  return {
    // State
    selectedType,
    setSelectedType,
    voucherStatus,
    voucherNo,
    setVoucherNo,
    date,
    setDate,
    refNo,
    setRefNo,
    narration,
    setNarration,
    rows,
    toasts,
    isPosting,
    recentVouchers,
    isLoadingRecent,
    fiscalYear,
    setFiscalYear,
    
    // Actions
    updateRow,
    addRow,
    removeRow,
    addToast,
    removeToast,
    handleSaveDraft,
    handlePostVoucher,
    refreshRecentVouchers,
    resetVoucher
  };
};

export default useVoucher;
