'use client';

import React from 'react';
import './PaymentMethodSelector.css';

type PaymentMode = 'Cash' | 'Cheque' | 'Bank Transfer';

interface PaymentMethodSelectorProps {
  paymentMode: PaymentMode;
  onChange: (mode: PaymentMode) => void;
  chequeNo: string;
  onChequeNoChange: (value: string) => void;
  bankRefNo: string;
  onBankRefNoChange: (value: string) => void;
}

export default function PaymentMethodSelector({
  paymentMode,
  onChange,
  chequeNo,
  onChequeNoChange,
  bankRefNo,
  onBankRefNoChange
}: PaymentMethodSelectorProps) {
  return (
    <div className="payment-method-selector">
      <label className="section-label">Payment Method</label>

      <div className="payment-options">
        <label className={`payment-option ${paymentMode === 'Cash' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="paymentMode"
            value="Cash"
            checked={paymentMode === 'Cash'}
            onChange={(e) => onChange(e.target.value as PaymentMode)}
          />
          <div className="payment-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2"></rect>
              <circle cx="12" cy="12" r="2"></circle>
              <path d="M6 12h.01M18 12h.01"></path>
            </svg>
          </div>
          <span className="payment-label">Cash</span>
        </label>

        <label className={`payment-option ${paymentMode === 'Cheque' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="paymentMode"
            value="Cheque"
            checked={paymentMode === 'Cheque'}
            onChange={(e) => onChange(e.target.value as PaymentMode)}
          />
          <div className="payment-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <span className="payment-label">Cheque</span>
        </label>

        <label className={`payment-option ${paymentMode === 'Bank Transfer' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="paymentMode"
            value="Bank Transfer"
            checked={paymentMode === 'Bank Transfer'}
            onChange={(e) => onChange(e.target.value as PaymentMode)}
          />
          <div className="payment-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <path d="M6 20v-8h4v8"></path>
              <path d="M10 20v-8h4v8"></path>
              <path d="M14 20v-8h4v8"></path>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          </div>
          <span className="payment-label">Bank Transfer</span>
        </label>
      </div>

      {/* Cheque Number Input */}
      {paymentMode === 'Cheque' && (
        <div className="payment-detail-input">
          <label className="detail-label">Cheque Number *</label>
          <input
            type="text"
            className="detail-input"
            placeholder="Enter cheque number"
            value={chequeNo}
            onChange={(e) => onChequeNoChange(e.target.value)}
          />
        </div>
      )}

      {/* Bank Reference Number Input */}
      {paymentMode === 'Bank Transfer' && (
        <div className="payment-detail-input">
          <label className="detail-label">Bank Reference Number *</label>
          <input
            type="text"
            className="detail-input"
            placeholder="Enter bank reference number"
            value={bankRefNo}
            onChange={(e) => onBankRefNoChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
