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
    <div className="bill-preview-modal-overlay">
      <div className="bill-preview-modal-container">
        {/* Modal Header */}
        <div className="bill-preview-modal-header">
          <h2>Bill Preview</h2>
          <button className="btn-close-modal" onClick={onClose} disabled={isSubmitting}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="bill-preview-modal-body">
          {/* Invoice Content */}
          <div className="invoice-content">
            {/* Header */}
            <div className="invoice-header">
              <h1 className="school-name">{schoolInfo.name || 'School Name'}</h1>
              {schoolInfo.address && (
                <p className="school-address">{schoolInfo.address}</p>
              )}
              {(schoolInfo.phone || schoolInfo.email) && (
                <p className="school-contact">
                  {schoolInfo.phone && <span>Phone: {schoolInfo.phone}</span>}
                  {schoolInfo.phone && schoolInfo.email && <span> | </span>}
                  {schoolInfo.email && <span>Email: {schoolInfo.email}</span>}
                </p>
              )}
              {schoolInfo.panVat && (
                <p className="school-pan-vat">PAN/VAT: {schoolInfo.panVat}</p>
              )}
              <h2 className="invoice-title">INVENTORY INVOICE</h2>
            </div>

            {/* Bill Info */}
            <div className="bill-info-grid">
              <div className="info-item">
                <label>Student Name</label>
                <span>{student.name}</span>
              </div>
              <div className="info-item">
                <label>Class</label>
                <span>{className}</span>
              </div>
              {section && (
                <div className="info-item">
                  <label>Section</label>
                  <span>{section}</span>
                </div>
              )}
              <div className="info-item">
                <label>Academic Year</label>
                <span>{academicYear}</span>
              </div>
              <div className="info-item">
                <label>Date</label>
                <span>{formatDate()}</span>
              </div>
              <div className="info-item">
                <label>Bill Type</label>
                <span className={`bill-type-badge ${billType.toLowerCase()}`}>{billType}</span>
              </div>
              <div className="info-item">
                <label>Payment Mode</label>
                <span>{paymentMode}</span>
              </div>
              {chequeNo && (
                <div className="info-item">
                  <label>Cheque No</label>
                  <span>{chequeNo}</span>
                </div>
              )}
              {bankRefNo && (
                <div className="info-item">
                  <label>Bank Ref No</label>
                  <span>{bankRefNo}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <table className="items-table">
              <thead>
                <tr>
                  <th>S.N.</th>
                  <th>Item Description</th>
                  <th>Variant</th>
                  <th>Qty</th>
                  <th>Rate (Rs)</th>
                  <th>Amount (Rs)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="text-center">{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.variantLabel || '-'}</td>
                    <td className="text-center">{item.qty}</td>
                    <td className="text-right">{formatNumber(item.rate)}</td>
                    <td className="text-right">{formatNumber(item.amount)}</td>
                  </tr>
                ))}
                {/* Empty rows for visual consistency */}
                {Array.from({ length: Math.max(0, 5 - items.length) }).map((_, index) => (
                  <tr key={`empty-${index}`} className="empty-row">
                    <td className="text-center">{items.length + index + 1}</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td className="text-center">&nbsp;</td>
                    <td className="text-right">&nbsp;</td>
                    <td className="text-right">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="bill-totals">
              <div className="total-row">
                <span>Sub Total:</span>
                <span>Rs {formatNumber(subTotal)}</span>
              </div>
              {billType === 'VAT' && vatRate > 0 && (
                <div className="total-row">
                  <span>VAT ({vatRate}%):</span>
                  <span>Rs {formatNumber(vatAmount)}</span>
                </div>
              )}
              <div className="total-row grand-total">
                <span>Total Amount:</span>
                <span>Rs {formatNumber(totalAmount)}</span>
              </div>
              <div className="amount-in-words">
                {numberToWords(totalAmount)}
              </div>
            </div>

            {/* Footer */}
            <div className="invoice-footer">
              <div className="footer-left">
                <p className="note">Note: Goods once sold will not be taken back.</p>
              </div>
              <div className="footer-right">
                <div className="signature-line">Authorized Signature</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bill-preview-modal-footer">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="btn-confirm"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner-small"></div>
                Saving...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Confirm & Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
