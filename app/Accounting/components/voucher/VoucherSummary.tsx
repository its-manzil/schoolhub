// VoucherSummary Component
// Displays voucher totals, balance status, and action buttons

'use client';

import React from 'react';
import { Send, Save, CheckCircle2, AlertCircle } from 'lucide-react';

interface VoucherSummaryProps {
  totalDebit: number;
  totalCredit: number;
  difference: number;
  isBalanced: boolean;
  isPosting: boolean;
  isPosted: boolean;
  onSaveDraft: () => void;
  onPostVoucher: () => void;
}

export const VoucherSummary: React.FC<VoucherSummaryProps> = React.memo(({
  totalDebit,
  totalCredit,
  difference,
  isBalanced,
  isPosting,
  isPosted,
  onSaveDraft,
  onPostVoucher
}) => {
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  return (
    <div className="ve-form-footer">
      <div className="ve-summary-grid">
        <div className="ve-summary-item">
          <span className="ve-summary-label">Total Debit</span>
          <span className="ve-summary-value">NPR {formatAmount(totalDebit)}</span>
        </div>
        <div className="ve-summary-item">
          <span className="ve-summary-label">Total Credit</span>
          <span className="ve-summary-value">NPR {formatAmount(totalCredit)}</span>
        </div>
        <div className="ve-summary-item">
          <span className="ve-summary-label">Difference</span>
          <span className={`ve-summary-value ${difference !== 0 ? 'error' : ''}`}>
            NPR {formatAmount(difference)}
          </span>
        </div>
        {difference !== 0 && (
          <div className="ve-summary-item ve-auto-balance-hint">
            <span className="ve-summary-label">Auto-Balance</span>
            <span className="ve-summary-hint">
              Last empty row will be filled automatically
            </span>
          </div>
        )}
        <div className="ve-summary-item">
          <span className="ve-summary-label">Balance Status</span>
          <div className={`ve-summary-status ${isBalanced ? 'status-balanced' : 'status-unbalanced'}`}>
            {isBalanced ? (
              <><CheckCircle2 size={16} /> Balanced</>
            ) : (
              <><AlertCircle size={16} /> Unbalanced</>
            )}
          </div>
        </div>
      </div>

      <div className="ve-actions">
        <button className="ve-btn ve-btn-secondary">Cancel</button>
        <button 
          className="ve-btn ve-btn-outline"
          onClick={onSaveDraft}
          disabled={isPosted || isPosting}
        >
          <Save size={16} /> Save as Draft
        </button>
        <button 
          className="ve-btn ve-btn-primary" 
          disabled={!isBalanced || isPosted || isPosting}
          onClick={onPostVoucher}
        >
          {isPosting ? (
            <>
              <div className="ve-spinner"></div>
              Posting...
            </>
          ) : (
            <>
              <Send size={16} /> Post Voucher
            </>
          )}
        </button>
      </div>
    </div>
  );
});

VoucherSummary.displayName = 'VoucherSummary';

export default VoucherSummary;
