'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BillingNavbar from '../components/BillingNavbar';
import BillList, { BillRecord } from './components/BillList';
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
          body { font-family: 'Times New Roman', serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .school-name { font-size: 24px; font-weight: bold; text-transform: uppercase; }
          .school-info { font-size: 14px; color: #374151; margin: 8px 0; }
          .pan-vat { font-size: 12px; color: #6b7280; margin-top: 4px; }
          .invoice-title { font-size: 18px; margin-top: 10px; padding-bottom: 5px; border-bottom: 2px solid #000; display: inline-block; }
          .details { display: flex; justify-content: space-between; margin: 20px 0; padding: 15px; border: 1px solid #000; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #000; padding: 10px; text-align: left; }
          th { background: #f0f0f0; }
          .summary { margin-left: auto; width: 300px; border: 2px solid #000; padding: 15px; }
          .summary-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dotted #ccc; }
          .summary-row.total { font-weight: bold; border-top: 2px solid #000; border-bottom: none; margin-top: 10px; padding-top: 10px; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; border-top: 1px solid #000; padding-top: 20px; }
          .signature { border-top: 2px solid #000; width: 200px; text-align: center; padding-top: 5px; margin-top: 30px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div className="header">
          <div className="school-name">${schoolInfo.name || 'School'}</div>
          ${schoolContact.length > 0 ? `<div class="school-info">${schoolContact.join(' | ')}</div>` : ''}
          ${bill.schoolPanVat || schoolInfo.panVat ? `<div class="pan-vat">PAN/VAT: ${bill.schoolPanVat || schoolInfo.panVat}</div>` : ''}
          <div class="invoice-title">SCHOOL FEE INVOICE</div>
        </div>
        <div class="details">
          <div>
            <p><strong>Invoice No:</strong> ${bill.invoiceId}</p>
            <p><strong>Student Name:</strong> ${bill.studentName}</p>
            <p><strong>Class:</strong> ${bill.className}</p>
          </div>
          <div>
            <p><strong>Date:</strong> ${bill.createdAtBS}</p>
            <p><strong>Academic Year:</strong> ${bill.academicYear}</p>
            <p><strong>Payment:</strong> ${bill.paymentMode} (${bill.paymentStatus})</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>S.N.</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${bill.components.map((c, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${c.name}</td>
                <td>${c.qty}</td>
                <td>${c.rate.toFixed(2)}</td>
                <td>${c.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="summary">
          <div class="summary-row"><span>Sub Total:</span><span>${bill.subTotal.toFixed(2)}</span></div>
          <div class="summary-row"><span>VAT (${bill.vatRate}%):</span><span>${bill.vatAmount.toFixed(2)}</span></div>
          <div class="summary-row total"><span>TOTAL:</span><span>${bill.totalAmount.toFixed(2)}</span></div>
        </div>
        <div class="footer">
          <div>
            <p>Note: Fees once paid will not be refunded.</p>
          </div>
          <div class="signature">Authorized Signature</div>
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
          onPrintBill={handlePrintBill}
          userRole={userRole || ''}
        />
      </main>
    </div>
  );
}
