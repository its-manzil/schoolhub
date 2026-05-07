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

        <div className="bill-preview-content printable-bill">
          {/* Header */}
          <div className="bill-header-section">
            <div className="school-info">
              <h1 className="school-name">{schoolInfo.name || 'School Name'}</h1>
              {schoolInfo.address && (
                <p className="school-address">{schoolInfo.address}</p>
              )}
              <p className="school-contact">
                {schoolInfo.phone && <span>Tel: {schoolInfo.phone}</span>}
                {schoolInfo.phone && schoolInfo.email && <span> | </span>}
                {schoolInfo.email && <span>Email: {schoolInfo.email}</span>}
              </p>
              {schoolInfo.panVat && (
                <p className="school-pan">PAN/VAT: {schoolInfo.panVat}</p>
              )}
            </div>
            <div className="invoice-badge">
              <h2>INVOICE</h2>
              <div className="invoice-id">#{invoiceId || 'DRAFT'}</div>
            </div>
          </div>

          <div className="bill-details-row">
            <div className="bill-to">
              <label>Bill To:</label>
              <div className="student-name">{student.name}</div>
              <div className="student-meta">
                ID: {student.studentId} | Class: {student.className}
                {student.rollNumber && ` | Roll: ${student.rollNumber}`}
              </div>
            </div>
            <div className="bill-meta">
              <div className="meta-item">
                <label>Date:</label>
                <span>{formatDate()}</span>
              </div>
              <div className="meta-item">
                <label>Year:</label>
                <span>{academicYear}</span>
              </div>
              <div className="meta-item">
                <label>Status:</label>
                <span className={`status-text ${payment.status}`}>{payment.status.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <table className="fee-table-compact">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>S.N.</th>
                <th>Description</th>
                <th style={{ width: '60px' }}>Qty</th>
                <th style={{ width: '100px' }}>Rate</th>
                <th style={{ width: '120px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {components.map((component, index) => (
                <tr key={component.id}>
                  <td>{index + 1}</td>
                  <td>{component.name}</td>
                  <td>{component.qty}</td>
                  <td>{formatNumber(component.rate)}</td>
                  <td>{formatNumber(component.amount)}</td>
                </tr>
              ))}
              {/* Fill remaining space to maintain height */}
              {Array.from({ length: Math.max(0, 8 - components.length) }).map((_, index) => (
                <tr key={`empty-${index}`} className="empty-row">
                  <td>{components.length + index + 1}</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="text-right label">Sub Total</td>
                <td className="text-right val">{formatNumber(subTotal)}</td>
              </tr>
              {vatAmount > 0 && (
                <tr>
                  <td colSpan={4} className="text-right label">VAT ({vatRate}%)</td>
                  <td className="text-right val">{formatNumber(vatAmount)}</td>
                </tr>
              )}
              <tr className="grand-total-row">
                <td colSpan={4} className="text-right label">Grand Total</td>
                <td className="text-right val">Rs {formatNumber(totalAmount)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="bill-bottom-section">
            <div className="words-section">
              <label>Amount in words:</label>
              <div className="words-text">{numberToWords(totalAmount)}</div>
            </div>
            
            <div className="footer-grid">
              <div className="payment-info">
                <label>Payment Method:</label>
                <span>{payment.mode}</span>
                {payment.mode === 'cheque' && payment.chequeNo && (
                  <span className="cheque-info"> (Chq: {payment.chequeNo})</span>
                )}
              </div>
              <div className="signature-area">
                <div className="sig-line"></div>
                <span>Authorized Signature</span>
              </div>
            </div>
            
            <div className="print-footer-note">
              Note: This is a computer generated invoice. No signature required.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
