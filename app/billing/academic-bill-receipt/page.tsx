'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BillingNavbar from '../components/BillingNavbar';
import BillList, { BillRecord } from './components/BillList';
import { numberToWords } from '../academic-billing/utils/invoiceUtils';
import '../billingMain.css';
import './collection-report.css';

interface SchoolInfo {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  panVat?: string;
}

export default function CollectionReportPage() {
  const router = useRouter();

  // Auth & User State
  const [userRole, setUserRole] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<number>(0);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({ name: '' });
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Auth Check
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
          router.push('/login');
          return;
        }

        const user = JSON.parse(userData);
        const allowedRoles = ['schooladmin', 'billing'];

        if (!allowedRoles.includes(user.role)) {
          router.push('/login');
          return;
        }

        setUserRole(user.role);
        setSchoolId(user.schoolId || 1);
        setIsAuthorized(true);
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch School Info
  useEffect(() => {
    const fetchSchoolInfo = async () => {
      if (!schoolId) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:2056/api/accounting/fee-management/school-info`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-school-id': schoolId.toString()
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setSchoolInfo({
              name: data.data.name,
              phone: data.data.phone,
              email: data.data.email,
              address: data.data.address,
              panVat: data.data.panVat
            });
          }
        }
      } catch (err) {
        console.error('Error fetching school info:', err);
      }
    };

    fetchSchoolInfo();
  }, [schoolId]);

  const handlePrintBill = (bill: BillRecord) => {
    // Create a window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate print HTML with school info
    const schoolContact = [];
    if (schoolInfo.address) schoolContact.push(schoolInfo.address);
    if (schoolInfo.phone) schoolContact.push(`Phone: ${schoolInfo.phone}`);
    if (schoolInfo.email) schoolContact.push(`Email: ${schoolInfo.email}`);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - ${bill.invoiceId}</title>
        <style>
          @page { margin: 0; size: auto; }
          body { font-family: 'Inter', system-ui, sans-serif; margin: 0; padding: 1cm; color: #000; background: white; }
          .printable-bill { border: 1px solid #000; padding: 2rem; width: 100%; box-sizing: border-box; }
          .bill-header { text-align: center; margin-bottom: 1.5rem; border-bottom: 2px solid #000; padding-bottom: 1rem; }
          .school-name { font-size: 1.5rem; font-weight: 800; text-transform: uppercase; margin: 0 0 0.25rem 0; }
          .school-info { font-size: 0.875rem; line-height: 1.4; color: #000; }
          .bill-title-container { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem; }
          .bill-type-badge { padding: 4px 12px; border: 1px solid #000; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; }
          .bill-main-title { font-size: 1.25rem; font-weight: 800; text-decoration: underline; }
          .bill-date { font-size: 0.875rem; }
          .bill-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 1.5rem; }
          .meta-col { display: flex; flex-direction: column; gap: 0.4rem; }
          .meta-row { display: flex; font-size: 0.875rem; }
          .meta-label { font-weight: 700; min-width: 100px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
          th, td { border: 1px solid #000; padding: 8px 12px; font-size: 0.875rem; text-align: left; }
          th { background: #f1f5f9; font-weight: 700; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .bill-summary-section { display: flex; justify-content: space-between; gap: 2rem; }
          .amount-in-words { flex: 1; font-size: 0.8125rem; font-style: italic; margin-top: 0.5rem; }
          .summary-table { width: 250px; }
          .summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 0.875rem; }
          .summary-row.grand-total { border-top: 2px solid #000; margin-top: 8px; padding-top: 8px; font-weight: 800; font-size: 1rem; }
          .bill-footer { margin-top: 3rem; display: flex; justify-content: space-between; align-items: flex-end; }
          .payment-info { font-size: 0.875rem; line-height: 1.5; }
          .signature-box { width: 150px; border-top: 1px solid #000; text-align: center; padding-top: 4px; font-size: 0.75rem; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="printable-bill">
          <div class="bill-header">
            <h1 class="school-name">${schoolInfo.name || 'School Name'}</h1>
            <div class="school-info">
              ${schoolInfo.address ? `<div>${schoolInfo.address}</div>` : ''}
              <div>Phone: ${schoolInfo.phone || 'N/A'} | Email: ${schoolInfo.email || 'N/A'}</div>
              ${bill.schoolPanVat || schoolInfo.panVat ? `<div>PAN/VAT: ${bill.schoolPanVat || schoolInfo.panVat}</div>` : ''}
            </div>
          </div>

          <div class="bill-title-container">
            <div class="bill-type-badge">${bill.vatAmount > 0 ? 'VAT INVOICE' : 'PAN BILL'}</div>
            <div class="bill-main-title">FEES INVOICE</div>
            <div class="bill-date">Date: ${bill.createdAtBS}</div>
          </div>

          <div class="bill-meta-grid">
            <div class="meta-col">
              <div class="meta-row"><span class="meta-label">Invoice No:</span><span>${bill.invoiceId}</span></div>
              <div class="meta-row"><span class="meta-label">Student ID:</span><span>${bill.studentId}</span></div>
              <div class="meta-row"><span class="meta-label">Name:</span><span>${bill.studentName}</span></div>
            </div>
            <div class="meta-col">
              <div class="meta-row"><span class="meta-label">Class:</span><span>${bill.className}</span></div>
              <div class="meta-row"><span class="meta-label">Academic Year:</span><span>${bill.academicYear}</span></div>
              <div class="meta-row"><span class="meta-label">Payment:</span><span>${bill.paymentMode.toUpperCase()} (${bill.paymentStatus.toUpperCase()})</span></div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="text-center" style="width: 50px;">S.N.</th>
                <th>Description</th>
                <th class="text-center" style="width: 80px;">Qty</th>
                <th class="text-right" style="width: 120px;">Rate</th>
                <th class="text-right" style="width: 140px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${bill.components.map((c, i) => `
                <tr>
                  <td class="text-center">${i + 1}</td>
                  <td>
                    ${c.name}
                    ${c.monthRange ? `<div style="font-size: 0.75rem; color: #666;">(${c.monthRange.fromMonth} to ${c.monthRange.toMonth})</div>` : ''}
                    ${c.reason ? `<div style="font-size: 0.75rem; color: #666;">Reason: ${c.reason}</div>` : ''}
                  </td>
                  <td class="text-center">${c.qty}</td>
                  <td class="text-right">${c.rate.toFixed(2)}</td>
                  <td class="text-right">${c.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="bill-summary-section">
            <div class="amount-in-words">
              <strong>Amount in Words:</strong><br />
              ${numberToWords(bill.totalAmount)} Only.
            </div>
            <div class="summary-table">
              <div class="summary-row"><span>Subtotal:</span><span>${bill.subTotal.toFixed(2)}</span></div>
              ${bill.vatAmount > 0 ? `<div class="summary-row"><span>VAT (${bill.vatRate}%):</span><span>${bill.vatAmount.toFixed(2)}</span></div>` : ''}
              <div class="summary-row grand-total"><span>Grand Total:</span><span>${bill.totalAmount.toFixed(2)}</span></div>
            </div>
          </div>

          <div class="bill-footer">
            <div class="payment-info">
              <strong>Note:</strong> Fees once paid will not be refunded.<br />
              ${bill.chequeNo ? `<strong>Cheque No:</strong> ${bill.chequeNo}` : ''}
            </div>
            <div class="signature-box">Authorized Signature</div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="collection-report-loading">
        <div className="spinner"></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="billing-layout">
      <BillingNavbar />
      <main className="billing-main-content collection-report-page">
        <div className="collection-report-header">
          <h1>Bill Records</h1>
          <p>View and manage all generated bills</p>
        </div>
        <BillList
          schoolId={schoolId}
          schoolInfo={schoolInfo}
          onPrintBill={handlePrintBill}
          userRole={userRole || ''}
        />
      </main>
    </div>
  );
}
