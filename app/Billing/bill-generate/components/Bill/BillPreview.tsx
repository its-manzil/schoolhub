'use client';

import React from 'react';
import './BillPreview.css';
import { SelectedComponent } from '../Components/ComponentSelector';
import { PaymentDetails } from './PaymentSection';
import { numberToWords, formatNumber } from '../../utils/invoiceUtils';

interface Student {
  _id: string;
  studentId: string;
  name: string;
  className: string;
  rollNumber?: string;
  guardianName?: string;
  address?: string;
}

interface SchoolInfo {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  panVat?: string;
}

interface BillPreviewProps {
  schoolInfo: SchoolInfo;
  student: Student;
  academicYear: string;
  components: SelectedComponent[];
  vatRate: number;
  subTotal: number;
  vatAmount: number;
  totalAmount: number;
  payment: PaymentDetails;
  invoiceId?: string;
  createdAtBS?: string;
  onPrint?: () => void;
  onClose?: () => void;
}

export default function BillPreview({
  schoolInfo,
  student,
  academicYear,
  components,
  vatRate,
  subTotal,
  vatAmount,
  totalAmount,
  payment,
  invoiceId,
  createdAtBS,
  onPrint,
  onClose
}: BillPreviewProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const formatDate = () => {
    if (createdAtBS) return createdAtBS;
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  return (
    <div className="bill-preview-overlay">
      <div className="bill-preview-container">
        <div className="bill-preview-actions no-print">
          <button className="btn-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Close
          </button>
          <button className="btn-print" onClick={handlePrint}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print Bill
          </button>
        </div>

        <div className="bill-preview-content">
          {/* Header - Match BillList Structure */}
          <div className="bill-view-header-section">
            <h1 className="school-name">{schoolInfo.name || 'School Name'}</h1>
            {schoolInfo.address && (
              <p className="school-address">{schoolInfo.address}</p>
            )}
            {schoolInfo.phone && (
              <p className="school-phone">Phone: {schoolInfo.phone}</p>
            )}
            <h2 className="invoice-title">SCHOOL FEE INVOICE</h2>
          </div>

          {/* Bill Info Grid - Match BillList Structure */}
          <div className="bill-info-grid">
            <div className="info-item">
              <label>Invoice ID</label>
              <span>{invoiceId || 'N/A'}</span>
            </div>
            {schoolInfo.panVat && (
              <div className="info-item">
                <label>PAN/VAT No</label>
                <span>{schoolInfo.panVat}</span>
              </div>
            )}
            <div className="info-item">
              <label>Student Name</label>
              <span>{student.name || 'Unknown Student'}</span>
            </div>
            <div className="info-item">
              <label>Class</label>
              <span>{student.className}</span>
            </div>
            <div className="info-item">
              <label>Academic Year</label>
              <span>{academicYear}</span>
            </div>
            <div className="info-item">
              <label>Date (BS)</label>
              <span>{formatDate()}</span>
            </div>
            <div className="info-item">
              <label>Payment Mode</label>
              <span className="payment-mode">{payment.mode}</span>
            </div>
            <div className="info-item">
              <label>Payment Status</label>
              <span className={`payment-badge ${payment.status}`}>
                {payment.status === 'paid' ? 'PAID' : 'PENDING'}
              </span>
              {payment.mode === 'cheque' && payment.chequeNo && (
                <span className="cheque-info"> (Cheque: {payment.chequeNo})</span>
              )}
            </div>
          </div>

          {/* Fee Table */}
          <table className="fee-table">
            <thead>
              <tr>
                <th>S.N.</th>
                <th>Fee Component (Description)</th>
                <th>Qty</th>
                <th>Rate per Unit (Rs)</th>
                <th>Amount (Rs)</th>
              </tr>
            </thead>
            <tbody>
              {components.map((component, index) => (
                <tr key={component.id}>
                  <td className="text-center">{index + 1}</td>
                  <td>{component.name}</td>
                  <td className="text-center">{component.qty}</td>
                  <td className="text-right">{formatNumber(component.rate)}</td>
                  <td className="text-right">{formatNumber(component.amount)}</td>
                </tr>
              ))}
              {/* Empty rows for visual consistency */}
              {Array.from({ length: Math.max(0, 10 - components.length) }).map((_, index) => (
                <tr key={`empty-${index}`} className="empty-row">
                  <td className="text-center">{components.length + index + 1}</td>
                  <td>&nbsp;</td>
                  <td className="text-center">&nbsp;</td>
                  <td className="text-right">&nbsp;</td>
                  <td className="text-right">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bill Totals - Match BillList Structure */}
          <div className="bill-totals">
            <div className="total-row">
              <span>Sub Total:</span>
              <span>Rs {formatNumber(subTotal)}</span>
            </div>
            <div className="total-row">
              <span>VAT ({vatRate}%):</span>
              <span>Rs {formatNumber(vatAmount)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total Amount:</span>
              <span>Rs {formatNumber(totalAmount)}</span>
            </div>
            <div className="amount-in-words">
              {numberToWords(totalAmount)}
            </div>
          </div>

          {/* Footer */}
          <div className="bill-footer">
            <div className="footer-left">
              <p className="note">Note: Fees once paid will not be refunded.</p>
            </div>
            <div className="footer-right">
              <div className="signature-line">Authorized Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
