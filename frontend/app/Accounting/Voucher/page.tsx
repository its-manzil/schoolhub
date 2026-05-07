// ERP-Grade Voucher Entry Page
// Modular architecture with backend-driven ledger search and real-time updates

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Layout from '../components/Layout';
import { Edit, CheckCircle2, AlertTriangle, X } from 'lucide-react';

// Components
import VoucherHeader from '../components/voucher/VoucherHeader';
import VoucherTable from '../components/voucher/VoucherTable';
import VoucherSummary from '../components/voucher/VoucherSummary';
import AttachmentsPanel from '../components/voucher/AttachmentsPanel';
import RecentVoucherTable from '../components/voucher/RecentVoucherTable';
import EditRequestModal from '../components/voucher/EditRequestModal';
import FiscalYearSelector from '../components/voucher/FiscalYearSelector';

// Hooks
import { useVoucher, VoucherType } from '../hooks/useVoucher';
import { useVoucherValidation } from '../hooks/useVoucherValidation';

// Services
import { voucherService, RecentVoucher } from '../services/voucher.service';
import { Ledger } from '../services/ledger.service';

// Styles
import './VoucherEntry.css';

// Search state interface
interface SearchState {
  query: string;
  isOpen: boolean;
  highlightedIndex: number;
  results: Ledger[];
  isLoading: boolean;
  error: string | null;
}

// Current BS Date (in production, this would come from the server)
const CURRENT_BS_YEAR = 2082; // 2082 is current year

// Get current BS year - in production, fetch from server
const getCurrentBSYear = async (): Promise<number> => {
  try {
    const response = await fetch('/api/accounting/ledgers/fiscal-year/current');
    if (response.ok) {
      const data = await response.json();
      return data.year;
    }
  } catch {
    // Fallback to current year
  }
  return CURRENT_BS_YEAR;
};

// Format BS date helper
const formatBSDate = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length <= 4) {
    return digits;
  } else if (digits.length <= 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}`;
  } else {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }
};

export default function VoucherPage() {
  // Get schoolId from user context (placeholder - replace with actual auth context)
  const schoolId = 'school-123'; // TODO: Get from auth context
  
  // Current BS year for fiscal year selector
  const [currentYear, setCurrentYear] = useState<number>(CURRENT_BS_YEAR);
  
  // Load current BS year from server on mount
  useEffect(() => {
    getCurrentBSYear().then(year => {
      setCurrentYear(year);
    });
  }, []);
  
  // Main voucher hook - fiscal year is managed internally
  const {
    selectedType,
    setSelectedType,
    voucherStatus,
    voucherNo,
    date,
    setDate,
    fiscalYear,
    setFiscalYear,
    refNo,
    setRefNo,
    narration,
    setNarration,
    rows,
    toasts,
    isPosting,
    recentVouchers,
    updateRow,
    addRow,
    removeRow,
    addToast,
    removeToast,
    handleSaveDraft,
    handlePostVoucher,
    refreshRecentVouchers
  } = useVoucher({ schoolId, pollingInterval: 15000 });

  // Validation
  const { totalDebit, totalCredit, difference, isBalanced, errors, isValid } = useVoucherValidation({
    rows,
    selectedType,
    date
  });

  // Edit request modal state
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    voucher: RecentVoucher | null;
  }>({ isOpen: false, voucher: null });

  // Preview modal state
  const [previewVoucher, setPreviewVoucher] = useState<RecentVoucher | null>(null);

  // Attachments
  const [attachments, setAttachments] = useState<File[]>([]);

  // Track if user attempted to submit (to show validation errors)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Ledger search query management per row
  const [searchQueries, setSearchQueries] = useState<Map<number, SearchState>>(new Map());

  // Update search state for a row
  const updateRowSearch = useCallback((rowIndex: number, updates: Partial<SearchState>) => {
    setSearchQueries(prev => {
      const next = new Map(prev);
      const current = next.get(rowIndex) || {
        query: '',
        isOpen: false,
        highlightedIndex: 0,
        results: [],
        isLoading: false,
        error: null
      };
      next.set(rowIndex, { ...current, ...updates });
      return next;
    });
  }, []);

  // Handle ledger search query change with debounced API call
  const handleSearchQueryChange = useCallback(async (rowIndex: number, query: string) => {
    updateRowSearch(rowIndex, { query, isLoading: true, error: null });
    
    // Debounced search simulation
    setTimeout(async () => {
      if (!query.trim()) {
        updateRowSearch(rowIndex, { results: [], isLoading: false });
        return;
      }
      
      try {
        const { ledgerService } = await import('../services/ledger.service');
        const isDebit = rows[rowIndex].debit > 0 || (rows[rowIndex].debit === 0 && rows[rowIndex].credit === 0);
        
        const response = await ledgerService.searchLedgers(
          query,
          selectedType,
          isDebit,
          schoolId
        );
        
        if (response.success) {
          updateRowSearch(rowIndex, { 
            results: response.data, 
            isLoading: false 
          });
        }
      } catch {
        updateRowSearch(rowIndex, { 
          error: 'Search failed', 
          isLoading: false 
        });
      }
    }, 300);
  }, [rows, selectedType, schoolId, updateRowSearch]);

  // Handle ledger selection
  const handleLedgerSelect = useCallback((rowIndex: number, ledger: Ledger) => {
    updateRow(rowIndex, 'ledgerId', ledger.id);
    updateRow(rowIndex, 'ledgerName', ledger.name);
    updateRowSearch(rowIndex, { query: ledger.name, isOpen: false });
  }, [updateRow, updateRowSearch]);

  // Handle edit request submission
  const handleSubmitEditRequest = useCallback(async (voucherId: string, message: string) => {
    try {
      const response = await voucherService.submitEditRequest(voucherId, message);
      if (response.success) {
        addToast('Edit request submitted successfully', 'success');
      }
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to submit edit request', 'error');
      throw error;
    }
  }, [addToast]);

  // Handle view voucher
  const handleViewVoucher = useCallback((voucher: RecentVoucher) => {
    setPreviewVoucher(voucher);
  }, []);

  // Handle request edit
  const handleRequestEdit = useCallback((voucher: RecentVoucher) => {
    setEditModal({ isOpen: true, voucher });
  }, []);

  // Close edit modal
  const closeEditModal = useCallback(() => {
    setEditModal({ isOpen: false, voucher: null });
  }, []);

  // Handle save draft with validation
  const onSaveDraft = useCallback(async () => {
    setHasAttemptedSubmit(true);
    await handleSaveDraft();
  }, [handleSaveDraft]);

  // Handle post voucher with validation
  const onPostVoucher = useCallback(async () => {
    setHasAttemptedSubmit(true);
    
    if (errors.length > 0) {
      addToast(errors[0].message, 'error');
      return;
    }
    
    if (!isValid) {
      addToast('Please fix validation errors before posting', 'error');
      return;
    }
    
    const success = await handlePostVoucher();
    if (success) {
      refreshRecentVouchers();
    }
  }, [errors, isValid, handlePostVoucher, addToast, refreshRecentVouchers]);

  return (
    <Layout>
      <div className="ve-container">
        {/* Voucher Type Selector */}
        <VoucherHeader
          selectedType={selectedType}
          onTypeChange={(type) => setSelectedType(type as VoucherType)}
          disabled={voucherStatus === 'Posted'}
        />

        {/* Audit Warning */}
        {voucherStatus === 'Posted' && (
          <div className="ve-audit-warning">
            <AlertTriangle size={20} className="ve-warning-icon" />
            <div className="ve-warning-content">
              <h4>Audit Compliance Notice</h4>
              <p>If voucher is posted, direct editing may be restricted. Use &apos;Request Edit&apos; option from the Recent Voucher Activities table below.</p>
            </div>
          </div>
        )}

        {/* Voucher Form */}
        <div className="ve-form-card">
          {/* Header Section */}
          <div className="ve-form-header">
            <div className="ve-field-group">
              <label>Voucher Type</label>
              <input type="text" className="ve-input" value={selectedType} disabled />
            </div>
            <div className="ve-field-group">
              <label>Voucher Number</label>
              <input type="text" className="ve-input" value={voucherNo} disabled />
            </div>
            <div className="ve-field-group">
              <label>Status</label>
              <div className={`ve-status-badge ve-status-${voucherStatus.toLowerCase()}`}>
                {voucherStatus === 'Draft' ? <Edit size={16} /> : <CheckCircle2 size={16} />}
                {voucherStatus}
              </div>
            </div>
            <div className="ve-field-group">
              <label>Date (BS) *</label>
              <input
                type="text"
                className={`ve-input ${errors.some(e => e.field === 'date') ? 've-input-error' : ''}`}
                placeholder="YYYY-MM-DD"
                value={date}
                onChange={(e) => setDate(formatBSDate(e.target.value))}
                disabled={voucherStatus === 'Posted'}
              />
            </div>
            <FiscalYearSelector
              value={fiscalYear}
              onChange={setFiscalYear}
              currentYear={currentYear}
              disabled={voucherStatus === 'Posted'}
            />
            <div className="ve-field-group">
              <label>Reference Number</label>
              <input
                type="text"
                className="ve-input"
                placeholder="Optional Ref..."
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                disabled={voucherStatus === 'Posted'}
              />
            </div>
          </div>

          {/* Entry Table */}
          <VoucherTable
            rows={rows}
            onUpdateRow={updateRow}
            onAddRow={addRow}
            onRemoveRow={removeRow}
            voucherType={selectedType}
            isPosted={voucherStatus === 'Posted'}
            searchQueries={searchQueries}
            onSearchQueryChange={handleSearchQueryChange}
            onSearchOpenChange={(rowIndex, isOpen) => updateRowSearch(rowIndex, { isOpen })}
            onSearchHighlightedIndexChange={(rowIndex, index) => updateRowSearch(rowIndex, { highlightedIndex: index })}
            onLedgerSelect={handleLedgerSelect}
            onSearchClear={(rowIndex) => updateRowSearch(rowIndex, { query: '', results: [], isOpen: false })}
          />

          {/* Details Section */}
          <div className="ve-form-details">
            <div className="ve-field-group">
              <label>Narration</label>
              <textarea
                className="ve-textarea"
                placeholder="Write voucher narration here..."
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                disabled={voucherStatus === 'Posted'}
              />
            </div>
            <AttachmentsPanel
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              disabled={voucherStatus === 'Posted'}
            />
          </div>

          {/* Summary and Actions */}
          <VoucherSummary
            totalDebit={totalDebit}
            totalCredit={totalCredit}
            difference={difference}
            isBalanced={isBalanced}
            isPosting={isPosting}
            isPosted={voucherStatus === 'Posted'}
            onSaveDraft={onSaveDraft}
            onPostVoucher={onPostVoucher}
          />
        </div>

        {/* Toast Messages */}
        <div className="ve-toast-container">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`ve-toast ve-toast-${toast.type}`}
            >
              {toast.type === 'success' && <CheckCircle2 size={16} />}
              {toast.type === 'error' && <AlertTriangle size={16} />}
              {toast.type === 'warning' && <AlertTriangle size={16} />}
              {toast.type === 'info' && <CheckCircle2 size={16} />}
              <span>{toast.message}</span>
              <button
                className="ve-toast-close"
                onClick={() => removeToast(toast.id)}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Validation Errors - only show after submit attempt */}
        {hasAttemptedSubmit && errors.length > 0 && (
          <div className="ve-validation-errors">
            <h4>Please fix the following errors:</h4>
            <ul>
              {errors.map((error, index) => (
                <li key={index}>
                  {error.rowIndex !== undefined && `Row ${error.rowIndex + 1}: `}
                  {error.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recent Voucher Activities */}
        <RecentVoucherTable
          vouchers={recentVouchers}
          isLoading={false}
          onViewVoucher={handleViewVoucher}
          onRequestEdit={handleRequestEdit}
        />

        {/* Edit Request Modal */}
        <EditRequestModal
          isOpen={editModal.isOpen}
          voucher={editModal.voucher}
          onClose={closeEditModal}
          onSubmit={handleSubmitEditRequest}
        />

        {/* Preview Modal */}
        {previewVoucher && (
          <div className="ve-modal-overlay" onClick={() => setPreviewVoucher(null)}>
            <div className="ve-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ve-modal-header">
                <h3>Voucher Preview</h3>
                <button className="ve-modal-close" onClick={() => setPreviewVoucher(null)}>
                  <X size={20} />
                </button>
              </div>
              <div className="ve-modal-body">
                <div className="ve-field-group">
                  <label>Voucher Number</label>
                  <input type="text" className="ve-input" value={previewVoucher.voucherNumber} readOnly />
                </div>
                <div className="ve-field-group">
                  <label>Type</label>
                  <input type="text" className="ve-input" value={previewVoucher.voucherType} readOnly />
                </div>
                <div className="ve-field-group">
                  <label>Date</label>
                  <input type="text" className="ve-input" value={previewVoucher.date} readOnly />
                </div>
                <div className="ve-field-group">
                  <label>Status</label>
                  <input type="text" className="ve-input" value={previewVoucher.status} readOnly />
                </div>
                <div className="ve-field-group">
                  <label>Amount</label>
                  <input type="text" className="ve-input" value={`NPR ${previewVoucher.amount.toLocaleString()}`} readOnly />
                </div>
              </div>
              <div className="ve-modal-footer">
                <button className="ve-btn ve-btn-primary" onClick={() => setPreviewVoucher(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
