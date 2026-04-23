'use client';

import React from 'react';
import './PaymentSection.css';

export type PaymentMode = 'cash' | 'online' | 'cheque';

export interface PaymentDetails {
  mode: PaymentMode;
  chequeNo?: string;
  status: 'paid' | 'pending';
}

interface PaymentSectionProps {
  payment: PaymentDetails;
  onChange: (payment: PaymentDetails) => void;
  readOnly?: boolean;
}

const PAYMENT_OPTIONS = [
  { value: 'cash' as PaymentMode, label: 'Cash', status: 'paid' as const },
  { value: 'online' as PaymentMode, label: 'Online', status: 'paid' as const },
  { value: 'cheque' as PaymentMode, label: 'Cheque', status: 'pending' as const }
];

export default function PaymentSection({
  payment,
  onChange,
  readOnly = false
}: PaymentSectionProps) {
  const handleModeChange = (mode: PaymentMode) => {
    if (readOnly) return;

    const option = PAYMENT_OPTIONS.find(o => o.value === mode);
    onChange({
      mode,
      status: option?.status || 'pending',
      chequeNo: mode === 'cheque' ? payment.chequeNo : undefined
    });
  };

  const handleChequeNoChange = (chequeNo: string) => {
    if (readOnly) return;
    onChange({ ...payment, chequeNo });
  };

  return (
    <div className="payment-section">
      <h3 className="payment-section-title">Payment Details</h3>

      <div className="payment-modes">
        {PAYMENT_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`payment-mode-option ${payment.mode === option.value ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name="paymentMode"
              value={option.value}
              checked={payment.mode === option.value}
              onChange={() => handleModeChange(option.value)}
              disabled={readOnly}
            />
            <span className="payment-mode-label">{option.label}</span>
            {payment.mode === option.value && (
              <span className={`payment-status ${option.status}`}>
                {option.status === 'paid' ? 'Paid' : 'Pending'}
              </span>
            )}
          </label>
        ))}
      </div>

      {payment.mode === 'cheque' && (
        <div className="cheque-details">
          <label htmlFor="cheque-no" className="cheque-label">
            Cheque Number <span className="required">*</span>
          </label>
          <input
            type="text"
            id="cheque-no"
            className="cheque-input"
            placeholder="Enter cheque number"
            value={payment.chequeNo || ''}
            onChange={(e) => handleChequeNoChange(e.target.value)}
            disabled={readOnly}
          />
          <p className="cheque-note">
            Note: Cheque payments will be marked as pending until cleared.
          </p>
        </div>
      )}

      <div className="payment-summary">
        <div className="payment-summary-row">
          <span>Payment Mode:</span>
          <strong>{PAYMENT_OPTIONS.find(o => o.value === payment.mode)?.label}</strong>
        </div>
        <div className="payment-summary-row">
          <span>Payment Status:</span>
          <span className={`status-badge ${payment.status}`}>
            {payment.status === 'paid' ? 'PAID' : 'PENDING'}
          </span>
        </div>
      </div>
    </div>
  );
}
