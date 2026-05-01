'use client';

import React from 'react';
import './BillSummaryPreviewModal.css';

interface Student {
  _id: string;
  studentId: string;
  name: string;
  className: string;
  section?: string;
  rollNumber?: string;
}

interface BillItem {
  id: string;
  inventoryId: string;
  name: string;
  variant?: string;
  variantLabel?: string;
  qty: number;
  rate: number;
  amount: number;
}

interface SchoolInfo {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  panVat?: string;
}

interface BillSummaryPreviewModalProps {
  schoolInfo: SchoolInfo;
  student: Student;
  academicYear: string;
  className: string;
  section: string;
  billType: 'PAN' | 'VAT';
  items: BillItem[];
  subTotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  paymentMode: string;
  chequeNo?: string;
  bankRefNo?: string;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';

  function convert(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  }

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  let result = convert(rupees) + ' Rupees';
  if (paise > 0) {
    result += ' and ' + convert(paise) + ' Paisa';
  }
  result += ' Only';

  return result;
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BillSummaryPreviewModal({
  schoolInfo,
  student,
  academicYear,
  className,
  section,
  billType,
  items,
  subTotal,
  vatRate,
  vatAmount,
  totalAmount,
  paymentMode,
  chequeNo,
  bankRefNo,
  onClose,
  onConfirm,
  isSubmitting
}: BillSummaryPreviewModalProps) {
  const formatDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  return (
    <div className="bill-preview-overlay">
      <div className="bill-preview-container">
        <div className="bill-preview-actions">
          <button className="btn-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            Close
          </button>
          <button className="btn-print" onClick={() => window.print()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print
          </button>
          <button className="btn-confirm" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Confirm & Save'}
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
              <div className="bill-type-badge">{billType === 'VAT' ? 'VAT INVOICE' : 'PAN BILL'}</div>
              <div className="bill-main-title">SALES INVOICE</div>
              <div className="bill-date">Date: {new Date().toLocaleDateString()}</div>
            </div>

            <div className="bill-meta-grid">
              <div className="meta-col">
                <div className="meta-row">
                  <span className="meta-label">Invoice No:</span>
                  <span>Draft</span>
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
                  <span>{className} {section && `(${section})`}</span>
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
                  <th>Item Description</th>
                  <th className="text-center" style={{ width: '80px' }}>Qty</th>
                  <th className="text-right" style={{ width: '120px' }}>Rate</th>
                  <th className="text-right" style={{ width: '140px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="text-center">{index + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      {item.variantLabel && (
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>
                          Variant: {item.variantLabel}
                        </div>
                      )}
                    </td>
                    <td className="text-center">{item.qty}</td>
                    <td className="text-right">{formatNumber(item.rate)}</td>
                    <td className="text-right">{formatNumber(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bill-summary-section">
              <div className="amount-in-words">
                <strong>Amount in Words:</strong><br />
                {numberToWords(totalAmount)}
              </div>
              <div className="summary-table">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>{formatNumber(subTotal)}</span>
                </div>
                {billType === 'VAT' && (
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
                <strong>Payment Mode:</strong> {paymentMode.toUpperCase()}<br />
                {chequeNo && <span><strong>Cheque No:</strong> {chequeNo}</span>}
                {bankRefNo && <span><strong>Bank Ref:</strong> {bankRefNo}</span>}
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
