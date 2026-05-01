'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import './print.css';

interface BillItem {
  inventoryId: string;
  name: string;
  variant?: string;
  qty: number;
  rate: number;
  amount: number;
}

interface Bill {
  _id: string;
  schoolId: number;
  academicYear: string;
  studentId: string;
  studentName: string;
  className: string;
  section?: string;
  billType: 'PAN' | 'VAT';
  items: BillItem[];
  subTotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  paymentMode: string;
  chequeNo?: string;
  bankRefNo?: string;
  invoiceId: string;
  createdAt: string;
}

interface SchoolInfo {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  panVat?: string;
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

export default function InventoryBillPrintPage() {
  const params = useParams();
  const billId = params?.billId?.[0];

  const [bill, setBill] = useState<Bill | null>(null);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({ name: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!billId) {
        setError('Bill ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch bill
        const billResponse = await fetch(`/api/billing/inventory-billing?billId=${billId}`);
        if (!billResponse.ok) {
          throw new Error('Failed to fetch bill');
        }
        const billData = await billResponse.json();

        if (!billData.success || !billData.data) {
          throw new Error('Bill not found');
        }

        setBill(billData.data);

        // Fetch school info
        const schoolResponse = await fetch(
          `http://localhost:2056/api/accounting/fee-management/school-info`,
          {
            headers: {
              'x-school-id': billData.data.schoolId.toString()
            }
          }
        );

        if (schoolResponse.ok) {
          const schoolData = await schoolResponse.json();
          if (schoolData.success && schoolData.data) {
            setSchoolInfo({
              name: schoolData.data.name,
              phone: schoolData.data.phone,
              email: schoolData.data.email,
              address: schoolData.data.address,
              panVat: schoolData.data.panVat
            });
          }
        }
      } catch (err) {
        console.error('Error fetching bill:', err);
        setError(err instanceof Error ? err.message : 'Failed to load bill');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [billId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="print-loading">
        <div className="spinner"></div>
        <span>Loading bill...</span>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="print-error">
        <h2>Error</h2>
        <p>{error || 'Bill not found'}</p>
      </div>
    );
  }

  return (
    <div className="print-page">
      {/* Print Controls */}
      <div className="print-controls no-print">
        <button className="btn-print" onClick={handlePrint}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Print Invoice
        </button>
      </div>

      {/* Invoice */}
      <div className="invoice-container printable-bill">
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
            <div className="invoice-id">#{bill.invoiceId}</div>
          </div>
        </div>

        <div className="bill-details-row">
          <div className="bill-to">
            <label>Bill To:</label>
            <div className="student-name">{bill.studentName}</div>
            <div className="student-meta">
              ID: {bill.studentId} | Class: {bill.className}
              {bill.section && ` | Sec: ${bill.section}`}
            </div>
          </div>
          <div className="bill-meta">
            <div className="meta-item">
              <label>Date:</label>
              <span>{formatDate(bill.createdAt)}</span>
            </div>
            <div className="meta-item">
              <label>Year:</label>
              <span>{bill.academicYear}</span>
            </div>
            <div className="meta-item">
              <label>Type:</label>
              <span className={`type-text ${bill.billType.toLowerCase()}`}>{bill.billType}</span>
            </div>
          </div>
        </div>

        <table className="fee-table-compact">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>S.N.</th>
              <th>Item Description</th>
              <th style={{ width: '100px' }}>Variant</th>
              <th style={{ width: '60px' }}>Qty</th>
              <th style={{ width: '100px' }}>Rate</th>
              <th style={{ width: '120px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.variant || '-'}</td>
                <td>{item.qty}</td>
                <td>{formatNumber(item.rate)}</td>
                <td>{formatNumber(item.amount)}</td>
              </tr>
            ))}
            {/* Fill remaining space to maintain height */}
            {Array.from({ length: Math.max(0, 8 - bill.items.length) }).map((_, index) => (
              <tr key={`empty-${index}`} className="empty-row">
                <td>{bill.items.length + index + 1}</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className="text-right label">Sub Total</td>
              <td className="text-right val">{formatNumber(bill.subTotal)}</td>
            </tr>
            {bill.billType === 'VAT' && bill.vatAmount > 0 && (
              <tr>
                <td colSpan={5} className="text-right label">VAT ({bill.vatRate}%)</td>
                <td className="text-right val">{formatNumber(bill.vatAmount)}</td>
              </tr>
            )}
            <tr className="grand-total-row">
              <td colSpan={5} className="text-right label">Grand Total</td>
              <td className="text-right val">Rs {formatNumber(bill.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="bill-bottom-section">
          <div className="words-section">
            <label>Amount in words:</label>
            <div className="words-text">{numberToWords(bill.totalAmount)}</div>
          </div>
          
          <div className="footer-grid">
            <div className="payment-info">
              <label>Payment Mode:</label>
              <span>{bill.paymentMode}</span>
              {bill.chequeNo && <span className="cheque-info"> (Chq: {bill.chequeNo})</span>}
              {bill.bankRefNo && <span className="bank-info"> (Ref: {bill.bankRefNo})</span>}
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
  );
}
