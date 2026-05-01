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
          <div className="printable-bill">
            <div className="bill-header">
              <h1 className="school-name">{schoolInfo.name || 'School Name'}</h1>
              <div className="school-info">
                {schoolInfo.address && <div>{schoolInfo.address}</div>}
                <div>Phone: {schoolInfo.phone || 'N/A'} | Email: {schoolInfo.email || 'N/A'}</div>
                {schoolInfo.panVat && <div>PAN/VAT: {schoolInfo.panVat}</div>}
              </div>
            </div>

            <div className="bill-title-container">
              <div className="bill-type-badge">{vatAmount > 0 ? 'VAT INVOICE' : 'PAN BILL'}</div>
              <div className="bill-main-title">FEES INVOICE</div>
              <div className="bill-date">Date: {formatDate()}</div>
            </div>

            <div className="bill-meta-grid">
              <div className="meta-col">
                <div className="meta-row">
                  <span className="meta-label">Invoice No:</span>
                  <span>{invoiceId || 'N/A'}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Student ID:</span>
                  <span>{student.studentId}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Name:</span>
                  <span>{student.name}</span>
                </div>
              </div>
              <div className="meta-col">
                <div className="meta-row">
                  <span className="meta-label">Class:</span>
                  <span>{student.className}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Roll No:</span>
                  <span>{student.rollNumber || 'N/A'}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Academic Year:</span>
                  <span>{academicYear}</span>
                </div>
              </div>
            </div>

            <table className="bill-items-table">
              <thead>
                <tr>
                  <th className="text-center" style={{ width: '50px' }}>S.N.</th>
                  <th>Description</th>
                  <th className="text-center" style={{ width: '80px' }}>Qty</th>
                  <th className="text-right" style={{ width: '120px' }}>Rate</th>
                  <th className="text-right" style={{ width: '140px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {components.map((comp, index) => (
                  <tr key={comp.instanceId || comp.id}>
                    <td className="text-center">{index + 1}</td>
                    <td>
                      {comp.name}
                      {comp.monthRange && (
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>
                          ({comp.monthRange.fromMonth} to {comp.monthRange.toMonth})
                        </div>
                      )}
                      {comp.reason && (
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>
                          Reason: {comp.reason}
                        </div>
                      )}
                    </td>
                    <td className="text-center">{comp.qty}</td>
                    <td className="text-right">{formatNumber(comp.rate)}</td>
                    <td className="text-right">{formatNumber(comp.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bill-summary-section">
              <div className="amount-in-words">
                <strong>Amount in Words:</strong><br />
                {numberToWords(totalAmount)} Only.
              </div>
              <div className="summary-table">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>{formatNumber(subTotal)}</span>
                </div>
                {vatAmount > 0 && (
                  <div className="summary-row">
                    <span>VAT ({vatRate}%):</span>
                    <span>{formatNumber(vatAmount)}</span>
                  </div>
                )}
                <div className="summary-row grand-total">
                  <span>Grand Total:</span>
                  <span>{formatNumber(totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="bill-footer">
              <div className="payment-info">
                <strong>Payment Mode:</strong> {payment.mode.toUpperCase()}<br />
                {payment.chequeNo && <span><strong>Cheque No:</strong> {payment.chequeNo}</span>}
              </div>
              <div className="signature-box">
                Authorized Signature
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
