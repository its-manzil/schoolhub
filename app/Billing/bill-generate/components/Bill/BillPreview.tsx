'use client';

import React from 'react';
import './BillPreview.css';
import { SelectedComponent } from '../Components/ComponentSelector';
import { PaymentDetails } from './PaymentSection';
import { numberToWords, formatNumber } from '../../utils/invoiceUtils';

interface Student {
  _id: string;
  studentId: string;
  firstName: string;
  lastName: string;
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
          {/* Header */}
          <div className="bill-header">
            <h1 className="school-name">{schoolInfo.name || 'School Name'}</h1>
            <div className="school-info">
              {schoolInfo.address && <p>{schoolInfo.address}</p>}
              <p>
                {schoolInfo.phone && <span>Phone: {schoolInfo.phone}</span>}
                {schoolInfo.phone && schoolInfo.email && <span> | </span>}
                {schoolInfo.email && <span>Email: {schoolInfo.email}</span>}
              </p>
            </div>
            <h2 className="invoice-title">SCHOOL FEE INVOICE</h2>
          </div>

          {/* Bill Details */}
          <div className="bill-details">
            <div className="bill-details-left">
              <p><strong>Invoice No:</strong> {invoiceId || 'N/A'}</p>
              <p><strong>Student Name:</strong> {student.firstName} {student.lastName}</p>
              <p><strong>Class/Grade:</strong> {student.className}</p>
              <p><strong>Guardian Name:</strong> {student.guardianName || 'N/A'}</p>
              <p><strong>Address:</strong> {student.address || 'N/A'}</p>
            </div>
            <div className="bill-details-right">
              <p><strong>Invoice Date:</strong> {formatDate()} (B.S.)</p>
              <p><strong>Academic Year:</strong> {academicYear}</p>
              <p><strong>Roll No:</strong> {student.rollNumber || 'N/A'}</p>
            </div>
          </div>

          {/* Payment Mode */}
          <div className="payment-info">
            <strong>Mode of Payment:</strong> {payment.mode.charAt(0).toUpperCase() + payment.mode.slice(1)}
            {payment.mode === 'cheque' && payment.chequeNo && (
              <span className="cheque-info"> (Cheque No: {payment.chequeNo})</span>
            )}
            <span className={`payment-badge ${payment.status}`}>
              {payment.status === 'paid' ? 'PAID' : 'PENDING'}
            </span>
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

          {/* Summary */}
          <div className="bill-bottom">
            <div className="amount-words">
              <div className="amount-words-label">Amount in Words:</div>
              <div className="amount-words-value">{numberToWords(totalAmount)}</div>
            </div>
            <div className="summary-box">
              <div className="summary-line">
                <span>Sub Total (Rs)</span>
                <span>{formatNumber(subTotal)}</span>
              </div>
              <div className="summary-line">
                <span>Taxable Amount</span>
                <span>{formatNumber(subTotal)}</span>
              </div>
              <div className="summary-line">
                <span>VAT ({vatRate}%)</span>
                <span>{formatNumber(vatAmount)}</span>
              </div>
              <div className="summary-line total">
                <span>TOTAL AMOUNT</span>
                <span>{formatNumber(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bill-footer">
            <div className="footer-left">
              <p className="note">Note: Fees once paid will not be refunded.</p>
              <p>Thank you for your payment.</p>
            </div>
            <div className="footer-right">
              <div className="signature-line">Authorized Signature</div>
              <p className="stamp-text">(School Stamp)</p>
            </div>
          </div>

          <div className="bill-disclaimer">
            This is a computer-generated invoice – valid without signature.
          </div>
        </div>
      </div>
    </div>
  );
}
