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
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/accounting/fee-management/school-info`,
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
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/accounting/tax`,
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
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/students/${studentId}`,
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
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/billing/bills`,
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
      <main className="billing-main-content bill-generate-page">
        <div className="bill-generate-content">
            {/* Filters Section */}
            <div className="bill-filters-section">
              <div className="filter-card">
                <AcademicYearSelector
                  selectedYear={academicYear}
                  onChange={setAcademicYear}
                  schoolId={schoolId}
                />
              </div>
              <div className="filter-card">
                <ClassSelector
                  selectedClass={selectedClass}
                  onChange={setSelectedClass}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bill-error-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
                <button className="btn-close-error" onClick={() => setError(null)}>×</button>
              </div>
            )}

            {/* Students Section */}
            <div className="bill-section">
              <StudentSelector
                selectedStudents={selectedStudents}
                onChange={setSelectedStudents}
                schoolId={schoolId}
                className={selectedClass}
              />
            </div>

            {/* Components Section - includes Bus Fare as checkbox */}
            <div className="bill-section">
              <ComponentSelector
                selectedComponents={selectedComponents}
                onChange={setSelectedComponents}
                schoolId={schoolId}
                academicYear={academicYear}
                className={selectedClass}
                selectedStudentId={selectedStudents.length === 1 ? selectedStudents[0] : undefined}
              />
            </div>

            {/* Summary & Payment Section */}
            {selectedComponents.length > 0 && (
              <div className="bill-summary-section">
                <div className="summary-card">
                  <h3>Bill Summary</h3>
                  
                  {/* Bill Type Toggle */}
                  <div className="bill-type-toggle">
                    <label className="toggle-label">Bill Type:</label>
                    <div className="toggle-buttons">
                      <button
                        type="button"
                        className={billType === 'vat' ? 'active' : ''}
                        onClick={() => setBillType('vat')}
                      >
                        VAT Bill (13%)
                      </button>
                      <button
                        type="button"
                        className={billType === 'pan' ? 'active' : ''}
                        onClick={() => setBillType('pan')}
                      >
                        PAN Bill (No Tax)
                      </button>
                    </div>
                  </div>
                  
                  <div className="summary-stats">
                    <div className="stat">
                      <label>Students Selected</label>
                      <span>{selectedStudents.length}</span>
                    </div>
                    <div className="stat">
                      <label>Components</label>
                      <span>{selectedComponents.length}</span>
                    </div>
                    
                    {/* Show month ranges for monthly components */}
                    {selectedComponents.some(c => c.frequency === 'monthly' && c.monthRange) && (
                      <div className="stat month-ranges">
                        <label>Month Ranges</label>
                        <div className="month-range-list">
                          {selectedComponents
                            .filter(c => c.frequency === 'monthly' && c.monthRange)
                            .map(c => (
                              <span key={c.id} className="month-range-tag">
                                {c.name}: {c.monthRange?.fromMonth}-{c.monthRange?.toMonth} ({c.qty} mo)
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="stat">
                      <label>Sub Total</label>
                      <span>Rs {subTotal.toFixed(2)}</span>
                    </div>
                    <div className="stat">
                      <label>{billType === 'pan' ? 'Tax (PAN)' : `VAT (${vatRate}%)`}</label>
                      <span>Rs {vatAmount.toFixed(2)}</span>
                    </div>
                    <div className="stat total">
                      <label>Total per Student</label>
                      <span>Rs {totalAmount.toFixed(2)}</span>
                    </div>
                    {selectedStudents.length > 1 && (
                      <div className="stat grand-total">
                        <label>Grand Total ({selectedStudents.length} students)</label>
                        <span>Rs {(totalAmount * selectedStudents.length).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="payment-card">
                  <PaymentSection
                    payment={payment}
                    onChange={setPayment}
                  />
                </div>
              </div>
            )}

            {/* Generate Button */}
            {selectedStudents.length > 0 && selectedComponents.length > 0 && (
              <div className="generate-section">
                <button
                  className="btn-generate"
                  onClick={handleGenerateBill}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="btn-spinner"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Generate Bill{selectedStudents.length > 1 ? 's' : ''} ({selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

        {/* Bill Preview Modal */}
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
            onPrint={() => {
              // Create a temporary bill object for printing
              const tempBill: BillRecord = {
                _id: previewBill.invoiceId || 'temp',
                invoiceId: previewBill.invoiceId || 'N/A',
                schoolId,
                studentId: previewBill.student._id,
                studentName: previewBill.student.name || 'Unknown',
                className: previewBill.student.className,
                academicYear,
                components: previewBill.components || [],
                subTotal: previewBill.subTotal || 0,
                vatRate,
                vatAmount: previewBill.vatAmount || 0,
                totalAmount: previewBill.totalAmount || 0,
                paymentMode: previewBill.payment?.mode || 'cash',
                paymentStatus: previewBill.payment?.status || 'paid',
                createdAt: new Date().toISOString(),
                createdAtBS: previewBill.createdAtBS || new Date().toISOString().split('T')[0],
                isLocked: false,
                schoolPanVat: schoolInfo.panVat
              };
              handlePrintBill(tempBill);
            }}
          />
        )}
      </main>
    </div>
  );
}
