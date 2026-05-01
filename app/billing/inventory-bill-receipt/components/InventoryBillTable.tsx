'use client';

import React, { useState } from 'react';
import './inventory-bill-table.css';

interface BillItem {
  inventoryId: string;
  name: string;
  variant?: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface InventoryBill {
  _id: string;
  invoiceId: string;
  schoolId: number;
  studentId: string;
  studentName: string;
  className: string;
  section?: string;
  academicYear: string;
  billType: 'PAN' | 'VAT';
  items: BillItem[];
  subTotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  paymentMode: string;
  paymentStatus?: 'paid' | 'pending';
  chequeNo?: string;
  bankRefNo?: string;
  createdAt: string;
  createdAtBS?: string;
}

interface InventoryBillTableProps {
  bills: InventoryBill[];
  loading: boolean;
  error: string | null;
  schoolInfo?: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    panVat?: string;
  };
  onViewBill: (bill: InventoryBill) => void;
  onPrintBill: (bill: InventoryBill) => void;
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

export default function InventoryBillTable({
  bills,
  loading,
  error,
  schoolInfo,
  onViewBill,
  onPrintBill
}: InventoryBillTableProps) {
  const [selectedBill, setSelectedBill] = useState<InventoryBill | null>(null);

  const handleViewClick = (bill: InventoryBill) => {
    setSelectedBill(bill);
    onViewBill(bill);
  };

  const closeViewModal = () => {
    setSelectedBill(null);
  };

  if (loading) {
    return (
      <div className="inventory-bill-table">
        <div className="bill-table-loading">
          <div className="spinner"></div>
          <span>Loading bills...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inventory-bill-table">
        <div className="bill-table-error">{error}</div>
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <div className="inventory-bill-table">
        <div className="bill-table-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <p>No bills found</p>
          <span className="empty-hint">Try adjusting your filters or search criteria</span>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-bill-table">
      <div className="bill-table-wrapper">
        <table className="bill-data-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Student Name</th>
              <th>Class / Section</th>
              <th>Academic Year</th>
              <th>Bill Type</th>
              <th>Total Amount</th>
              <th>Payment Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill._id}>
                <td className="invoice-id">{bill.invoiceId}</td>
                <td>{bill.studentName}</td>
                <td>
                  {bill.className}
                  {bill.section && <span className="section-tag">{bill.section}</span>}
                </td>
                <td>{bill.academicYear}</td>
                <td>
                  <span className={`bill-type-badge ${bill.billType.toLowerCase()}`}>
                    {bill.billType}
                  </span>
                </td>
                <td className="amount">Rs {formatNumber(bill.totalAmount)}</td>
                <td>
                  <span className={`status-badge ${bill.paymentStatus || 'pending'}`}>
                    {(bill.paymentStatus || 'pending') === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </td>
                <td>{bill.createdAtBS || formatDate(bill.createdAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-action btn-view"
                      onClick={() => handleViewClick(bill)}
                      title="View Details"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button
                      className="btn-action btn-print"
                      onClick={() => onPrintBill(bill)}
                      title="Print Bill"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                        <rect x="6" y="14" width="12" height="8"></rect>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {selectedBill && (
        <div className="bill-preview-overlay" onClick={closeViewModal}>
          <div className="bill-preview-container" onClick={(e) => e.stopPropagation()}>
            <div className="bill-preview-actions">
              <button className="btn-close" onClick={closeViewModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                Close
              </button>
              <button className="btn-print" onClick={() => onPrintBill(selectedBill)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Print
              </button>
            </div>

            <div className="bill-preview-content">
              <div className="printable-bill">
                <div className="bill-header">
                  <h1 className="school-name">{schoolInfo?.name || 'School Name'}</h1>
                  <div className="school-info">
                    {schoolInfo?.address && <div>{schoolInfo.address}</div>}
                    <div>Phone: {schoolInfo?.phone || 'N/A'} | Email: {schoolInfo?.email || 'N/A'}</div>
                    {schoolInfo?.panVat && <div>PAN/VAT: {schoolInfo.panVat}</div>}
                  </div>
                </div>

                <div className="bill-title-container">
                  <div className="bill-type-badge">{selectedBill.billType === 'VAT' ? 'VAT INVOICE' : 'PAN BILL'}</div>
                  <div className="bill-main-title">SALES INVOICE</div>
                  <div className="bill-date">Date: {selectedBill.createdAtBS || formatDate(selectedBill.createdAt)}</div>
                </div>

                <div className="bill-meta-grid">
                  <div className="meta-col">
                    <div className="meta-row">
                      <span className="meta-label">Invoice No:</span>
                      <span>{selectedBill.invoiceId}</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-label">Student ID:</span>
                      <span>{selectedBill.studentId}</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-label">Name:</span>
                      <span>{selectedBill.studentName}</span>
                    </div>
                  </div>
                  <div className="meta-col">
                    <div className="meta-row">
                      <span className="meta-label">Class:</span>
                      <span>{selectedBill.className} {selectedBill.section && `(${selectedBill.section})`}</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-label">Academic Year:</span>
                      <span>{selectedBill.academicYear}</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-label">Payment:</span>
                      <span>{selectedBill.paymentMode} ({selectedBill.paymentStatus || 'Paid'})</span>
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
                    {selectedBill.items.map((item, index) => (
                      <tr key={index}>
                        <td className="text-center">{index + 1}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{item.name}</div>
                          {item.variant && (
                            <div style={{ fontSize: '0.75rem', color: '#666' }}>
                              Variant: {item.variant}
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
                    {/* Simplified for mock */}
                    Rs {selectedBill.totalAmount.toLocaleString()} Only.
                  </div>
                  <div className="summary-table">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>{formatNumber(selectedBill.subTotal)}</span>
                    </div>
                    {selectedBill.billType === 'VAT' && (
                      <div className="summary-row">
                        <span>VAT ({selectedBill.vatRate}%):</span>
                        <span>{formatNumber(selectedBill.vatAmount)}</span>
                      </div>
                    )}
                    <div className="summary-row grand-total">
                      <span>Grand Total:</span>
                      <span>{formatNumber(selectedBill.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="bill-footer">
                  <div className="payment-info">
                    <strong>Payment Mode:</strong> {selectedBill.paymentMode.toUpperCase()}<br />
                    {selectedBill.chequeNo && <span><strong>Cheque No:</strong> {selectedBill.chequeNo}</span>}
                    {selectedBill.bankRefNo && <span><strong>Bank Ref:</strong> {selectedBill.bankRefNo}</span>}
                  </div>
                  <div className="signature-box">
                    Authorized Signature
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
