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
        const billResponse = await fetch(`/api/billing/inventory-bills?billId=${billId}`);
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
      <div className="invoice-container">
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
            <label>Invoice ID</label>
            <span>{bill.invoiceId}</span>
          </div>
          <div className="info-item">
            <label>Student Name</label>
            <span>{bill.studentName}</span>
          </div>
          <div className="info-item">
            <label>Student ID</label>
            <span>{bill.studentId}</span>
          </div>
          <div className="info-item">
            <label>Class</label>
            <span>{bill.className}</span>
          </div>
          {bill.section && (
            <div className="info-item">
              <label>Section</label>
              <span>{bill.section}</span>
            </div>
          )}
          <div className="info-item">
            <label>Academic Year</label>
            <span>{bill.academicYear}</span>
          </div>
          <div className="info-item">
            <label>Bill Type</label>
            <span className={`bill-type-badge ${bill.billType.toLowerCase()}`}>
              {bill.billType}
            </span>
          </div>
          <div className="info-item">
            <label>Payment Mode</label>
            <span>{bill.paymentMode}</span>
          </div>
          <div className="info-item">
            <label>Payment Status</label>
            <span className={`status-badge ${bill.paymentStatus || 'pending'}`}>
              {(bill.paymentStatus || 'pending') === 'paid' ? 'Paid' : 'Pending'}
            </span>
          </div>
          <div className="info-item">
            <label>Date</label>
            <span>{bill.createdAtBS || new Date(bill.createdAt).toISOString().split('T')[0]}</span>
          </div>
          {bill.chequeNo && (
            <div className="info-item">
              <label>Cheque No</label>
              <span>{bill.chequeNo}</span>
            </div>
          )}
          {bill.bankRefNo && (
            <div className="info-item">
              <label>Bank Ref No</label>
              <span>{bill.bankRefNo}</span>
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
            {bill.items.map((item, index) => (
              <tr key={index}>
                <td className="text-center">{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.variant || '-'}</td>
                <td className="text-center">{item.qty}</td>
                <td className="text-right">{formatNumber(item.rate)}</td>
                <td className="text-right">{formatNumber(item.amount)}</td>
              </tr>
            ))}
            {/* Empty rows for visual consistency */}
            {Array.from({ length: Math.max(0, 5 - bill.items.length) }).map((_, index) => (
              <tr key={`empty-${index}`} className="empty-row">
                <td className="text-center">{bill.items.length + index + 1}</td>
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
            <span>Rs {formatNumber(bill.subTotal)}</span>
          </div>
          {bill.billType === 'VAT' && bill.vatRate > 0 && (
            <div className="total-row">
              <span>VAT ({bill.vatRate}%):</span>
              <span>Rs {formatNumber(bill.vatAmount)}</span>
            </div>
          )}
          <div className="total-row grand-total">
            <span>Total Amount:</span>
            <span>Rs {formatNumber(bill.totalAmount)}</span>
          </div>
          <div className="amount-in-words">
            {numberToWords(bill.totalAmount)}
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
  );
}
