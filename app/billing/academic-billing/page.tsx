'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BillingNavbar from '../components/BillingNavbar';
import AcademicYearSelector from './components/Filters/AcademicYearSelector';
import ClassSelector from './components/Filters/ClassSelector';
import StudentSelector from './components/Students/StudentSelector';
import ComponentSelector, { SelectedComponent } from './components/Components/ComponentSelector';
import PaymentSection, { PaymentDetails } from './components/Bill/PaymentSection';
import BillPreview from './components/Bill/BillPreview';
import { BillRecord } from '../academic-bill-receipt/components/BillList';
import { calculateTotals } from './utils/invoiceUtils';
import { useToast } from '../../context/ToastContext';
import './bill-generate.css';

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

export default function BillGeneratePage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  // Auth & User State
  const [schoolId, setSchoolId] = useState<number>(0);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({ name: '' });
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [academicYear, setAcademicYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponent[]>([]);
  const [payment, setPayment] = useState<PaymentDetails>({
    mode: 'cash',
    status: 'paid'
  });
  const [vatRate, setVatRate] = useState(13);
  const [billType, setBillType] = useState<'pan' | 'vat'>('vat'); // 'pan' = no tax, 'vat' = 13% tax

  // Preview State
  const [showPreview, setShowPreview] = useState(false);
  const [previewBill, setPreviewBill] = useState<{
    student: Student;
    invoiceId?: string;
    createdAtBS?: string;
    components?: SelectedComponent[];
    subTotal?: number;
    vatAmount?: number;
    totalAmount?: number;
    payment?: PaymentDetails;
  } | null>(null);
  const [, setGeneratedBills] = useState<BillRecord[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals based on bill type (PAN = no tax, VAT = add tax)
  const effectiveVatRate = billType === 'pan' ? 0 : vatRate;
  const { subTotal, vatAmount, totalAmount } = calculateTotals(
    selectedComponents,
    effectiveVatRate
  );

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

  // Fetch VAT Rate from tax settings
  useEffect(() => {
    const fetchTaxSettings = async () => {
      if (!schoolId) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:2056/api/accounting/tax`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-school-id': schoolId.toString()
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.vatRate) {
            setVatRate(data.data.vatRate);
          }
        }
      } catch (err) {
        console.error('Error fetching tax settings:', err);
      }
    };

    fetchTaxSettings();
  }, [schoolId]);

  // Reset students when class changes
  useEffect(() => {
    setSelectedStudents([]);
  }, [selectedClass]);

  const handleGenerateBill = async () => {
    if (selectedStudents.length === 0) {
      setError('Please select at least one student');
      return;
    }

    if (selectedComponents.length === 0) {
      setError('Please select at least one fee component');
      return;
    }

    if (payment.mode === 'cheque' && !payment.chequeNo) {
      setError('Please enter cheque number for cheque payment');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      // Get student details for all selected students
      const studentPromises = selectedStudents.map(async (studentId) => {
        const response = await fetch(
          `http://localhost:2056/api/students/${studentId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-school-id': schoolId.toString()
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          return data.data || data;
        }
        return null;
      });

      const students = (await Promise.all(studentPromises)).filter(Boolean);

      // Create bills for all students
      const requestBody = {
        schoolId,
        academicYear,
        selectedStudents: students,
        selectedComponents,
        paymentMode: payment.mode,
        chequeNo: payment.chequeNo,
        billType,
        vatRate: billType === 'pan' ? 0 : vatRate
      };

      const response = await fetch(
        `http://localhost:2056/api/billing/bills`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-school-id': schoolId.toString(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate bills');
      }

      if (data.success) {
        setGeneratedBills(data.data || []);
        
        if (data.errors && data.errors.length > 0) {
          const errorMsg = `Some bills could not be generated: ${data.errors.map((e: { studentName: string; error: string }) => `${e.studentName}: ${e.error}`).join(', ')}`;
          showToast(errorMsg, 'error');
        } else {
          showToast('Bills generated successfully', 'success');
        }

        // Show preview for the first generated bill
        if (data.data && data.data.length > 0) {
          const firstBill = data.data[0];
          const student = students.find((s: Student) => s._id === firstBill.studentId);
          if (student) {
            // Store current bill data in preview before clearing state
            setPreviewBill({
              student,
              invoiceId: firstBill.invoiceId,
              createdAtBS: firstBill.createdAtBS,
              components: selectedComponents,
              subTotal,
              vatAmount,
              totalAmount,
              payment: { ...payment }
            });
            setShowPreview(true);
          }
        }

        // Reset form after successful generation (but after preview is set)
        if (data.data && data.data.length > 0) {
          setSelectedStudents([]);
          setSelectedComponents([]);
          setPayment({ mode: 'cash', status: 'paid' });
        }
      }
    } catch (err) {
      console.error('Error generating bills:', err);
      showToast(err instanceof Error ? err.message : 'Failed to generate bills', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

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
        <div class="header">
          <div class="school-name">${schoolInfo.name || 'School'}</div>
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
      <div className="bill-generate-loading">
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
      <main className="billing-main-content">
        <div className="billing-page-header">
          <h1 className="billing-page-title">Academic Billing</h1>
          <p className="billing-page-subtitle">Generate invoices for student fees and services.</p>
        </div>

        <div className="billing-filters-card">
          <div className="filters-grid">
            <AcademicYearSelector
              selectedYear={academicYear}
              onChange={setAcademicYear}
              schoolId={schoolId}
            />
            <ClassSelector
              selectedClass={selectedClass}
              onChange={setSelectedClass}
            />
          </div>
        </div>

        <div className="billing-selection-grid">
          <div className="selection-col">
            <StudentSelector
              selectedStudents={selectedStudents}
              onChange={setSelectedStudents}
              schoolId={schoolId}
              className={selectedClass}
            />
          </div>
          <div className="selection-col">
            <ComponentSelector
              selectedComponents={selectedComponents}
              onChange={setSelectedComponents}
              schoolId={schoolId}
              academicYear={academicYear}
              className={selectedClass}
              selectedStudentId={selectedStudents.length === 1 ? selectedStudents[0] : undefined}
            />
          </div>
        </div>

        <div className="billing-actions-footer">
          <div className="billing-summary-preview">
            <div className="summary-item">
              <span className="label">Students:</span>
              <span className="value">{selectedStudents.length}</span>
            </div>
            <div className="summary-item">
              <span className="label">Total Amount:</span>
              <span className="value primary">Rs {totalAmount.toLocaleString()}</span>
            </div>
          </div>
          <div className="action-buttons">
            <div className="bill-type-toggle">
              <button
                type="button"
                className={billType === 'vat' ? 'active' : ''}
                onClick={() => setBillType('vat')}
              >
                VAT (13%)
              </button>
              <button
                type="button"
                className={billType === 'pan' ? 'active' : ''}
                onClick={() => setBillType('pan')}
              >
                PAN (0%)
              </button>
            </div>
            <PaymentSection
              payment={payment}
              onChange={setPayment}
            />
            <button
              className="generate-bill-btn"
              onClick={handleGenerateBill}
              disabled={isGenerating || selectedStudents.length === 0 || selectedComponents.length === 0}
            >
              {isGenerating ? 'Generating...' : 'Generate & Preview Bills'}
            </button>
          </div>
        </div>

        {showPreview && previewBill && (
          <BillPreview
            schoolInfo={schoolInfo}
            student={previewBill.student}
            academicYear={academicYear}
            components={previewBill.components || []}
            vatRate={vatRate}
            subTotal={previewBill.subTotal || 0}
            vatAmount={previewBill.vatAmount || 0}
            totalAmount={previewBill.totalAmount || 0}
            payment={previewBill.payment || { mode: 'cash', status: 'paid' }}
            invoiceId={previewBill.invoiceId}
            createdAtBS={previewBill.createdAtBS}
            onClose={() => setShowPreview(false)}
          />
        )}
      </main>
    </div>
  );
}
