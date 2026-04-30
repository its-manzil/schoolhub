'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import './InventoryBillingPage.css';
import BillingNavbar from '../components/BillingNavbar';
import AcademicSelector from './components/AcademicSelector';
import StudentSelector from './components/StudentSelector';
import InventorySelector from './components/InventorySelector';
import PaymentMethodSelector from './components/PaymentMethodSelector';
import BillSummaryPreviewModal from './components/BillSummaryPreviewModal';

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

type BillType = 'PAN' | 'VAT';
type PaymentMode = 'Cash' | 'Cheque' | 'Bank';

export default function InventoryBillingPage() {
  const router = useRouter();

  // Auth & User State
  const [schoolId, setSchoolId] = useState<number>(0);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({ name: '' });
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [academicYear, setAcademicYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [billType, setBillType] = useState<BillType>('PAN');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [chequeNo, setChequeNo] = useState('');
  const [bankRefNo, setBankRefNo] = useState('');

  // Preview Modal State
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // VAT Rate (fixed at 13%)
  const VAT_RATE = 13;

  // Class mapping: display name -> database storage code
  const CLASS_MAPPING: Record<string, string> = {
    'Nursery': '0N',
    'LKG': '0L',
    'UKG': '0U',
    'Class 1': '01',
    'Class 2': '02',
    'Class 3': '03',
    'Class 4': '04',
    'Class 5': '05',
    'Class 6': '06',
    'Class 7': '07',
    'Class 8': '08',
    'Class 9': '09',
    'Class 10': '10',
    'Class 11': '11',
    'Class 12': '12'
  };

  // Calculate totals
  const subTotal = billItems.reduce((sum, item) => sum + item.amount, 0);
  const vatAmount = billType === 'VAT' ? subTotal * (VAT_RATE / 100) : 0;
  const totalAmount = subTotal + vatAmount;

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

  // Reset student when class/section changes
  useEffect(() => {
    setSelectedStudent(null);
  }, [selectedClass, selectedSection]);

  const handleAddItem = useCallback((item: BillItem) => {
    setBillItems(prev => [...prev, item]);
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setBillItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleGenerateBill = () => {
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    if (billItems.length === 0) {
      setError('Please add at least one inventory item');
      return;
    }

    if (paymentMode === 'Cheque' && !chequeNo) {
      setError('Please enter cheque number');
      return;
    }

    if (paymentMode === 'Bank' && !bankRefNo) {
      setError('Please enter bank reference number');
      return;
    }

    setError(null);
    setShowPreview(true);
  };

  const handleConfirmBill = async () => {
    if (!selectedStudent) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      // Payment status rule: Cash/Bank → Paid, Cheque → Pending
      const paymentStatus = paymentMode === 'Cheque' ? 'Pending' : 'Paid';

      // Convert class to database storage format
      const classDbCode = CLASS_MAPPING[selectedClass] || selectedClass;

      const billData = {
        schoolId,
        academicYear,
        studentId: selectedStudent._id,
        studentName: selectedStudent.name,
        className: classDbCode,
        section: selectedSection,
        billType,
        items: billItems.map(item => ({
          inventoryId: item.inventoryId,
          name: item.name,
          variant: item.variant,
          qty: item.qty,
          rate: item.rate,
          amount: item.amount
        })),
        subTotal,
        vatRate: billType === 'VAT' ? VAT_RATE : 0,
        vatAmount,
        totalAmount,
        paymentMode,
        paymentStatus,
        chequeNo: paymentMode === 'Cheque' ? chequeNo : undefined,
        bankRefNo: paymentMode === 'Bank' ? bankRefNo : undefined
      };

      const response = await fetch('/api/billing/inventory-billing', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-school-id': schoolId.toString(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(billData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save bill');
      }

      // Stock deduction - call Accounting API for each item
      try {
        const stockDeductionPromises = billItems.map(async (item) => {
          if (!item.variant) return; // Skip non-variant items for now
          
          const deductResponse = await fetch('/api/accounting/inventory/deduct', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              itemId: item.inventoryId,
              variant: item.variant,
              quantity: item.qty,
              type: 'sale'
            })
          });
          
          if (!deductResponse.ok) {
            console.warn(`Stock deduction failed for item ${item.name}:`, await deductResponse.text());
          }
        });
        
        await Promise.all(stockDeductionPromises);
      } catch (deductErr) {
        console.error('Stock deduction error (non-blocking):', deductErr);
        // Don't fail the bill if stock deduction fails
      }

      setSuccessMessage('Bill saved successfully!');
      setShowPreview(false);

      // Open print view in new tab
      if (data.data?.billId) {
        window.open(`/billing/inventory-billing/print/${data.data.billId}`, '_blank');
      }

      // Reset form
      setBillItems([]);
      setSelectedStudent(null);
      setChequeNo('');
      setBankRefNo('');
      setBillType('PAN');
      setPaymentMode('Cash');

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error saving bill:', err);
      setError(err instanceof Error ? err.message : 'Failed to save bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="inventory-billing-loading">
        <div className="spinner"></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="inventory-billing-layout">
      <BillingNavbar />
      <main className="inventory-billing-main">
        <div className="inventory-billing-container">
          <div className="inventory-billing-header">
            <h1>Inventory Billing</h1>
            <p>Generate inventory bills for students</p>
          </div>

          {error && (
            <div className="inventory-billing-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
              <button className="btn-close-error" onClick={() => setError(null)}>×</button>
            </div>
          )}

          {successMessage && (
            <div className="inventory-billing-success">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {successMessage}
              <button className="btn-close-success" onClick={() => setSuccessMessage(null)}>×</button>
            </div>
          )}

          <div className="inventory-billing-form">
            {/* Academic Year Selection */}
            <AcademicSelector
              selectedYear={academicYear}
              onChange={setAcademicYear}
              schoolId={schoolId}
            />

            {/* Student Selection */}
            <StudentSelector
              schoolId={schoolId}
              selectedClass={selectedClass}
              onClassChange={setSelectedClass}
              selectedSection={selectedSection}
              onSectionChange={setSelectedSection}
              selectedStudent={selectedStudent}
              onStudentChange={setSelectedStudent}
            />

            {/* Inventory Selection */}
            {selectedStudent && (
              <InventorySelector
                schoolId={schoolId}
                academicYear={academicYear}
                billItems={billItems}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
              />
            )}

            {/* Bill Items Summary */}
            {billItems.length > 0 && (
              <div className="bill-items-summary">
                <h3>Selected Items</h3>
                <table className="bill-items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Variant</th>
                      <th>Qty</th>
                      <th>Rate (Rs)</th>
                      <th>Amount (Rs)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.variantLabel || '-'}</td>
                        <td>{item.qty}</td>
                        <td>{item.rate.toFixed(2)}</td>
                        <td>{item.amount.toFixed(2)}</td>
                        <td>
                          <button
                            className="btn-remove-item"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Bill Type Selection */}
                <div className="bill-type-section">
                  <label className="section-label">Bill Type</label>
                  <div className="bill-type-toggle">
                    <button
                      type="button"
                      className={billType === 'PAN' ? 'active' : ''}
                      onClick={() => setBillType('PAN')}
                    >
                      PAN Bill (No VAT)
                    </button>
                    <button
                      type="button"
                      className={billType === 'VAT' ? 'active' : ''}
                      onClick={() => setBillType('VAT')}
                    >
                      VAT Bill ({VAT_RATE}%)
                    </button>
                  </div>
                </div>

                {/* Payment Method */}
                <PaymentMethodSelector
                  paymentMode={paymentMode}
                  onChange={setPaymentMode}
                  chequeNo={chequeNo}
                  onChequeNoChange={setChequeNo}
                  bankRefNo={bankRefNo}
                  onBankRefNoChange={setBankRefNo}
                />

                {/* Bill Summary */}
                <div className="bill-summary">
                  <div className="summary-row">
                    <span>Sub Total:</span>
                    <span>Rs {subTotal.toFixed(2)}</span>
                  </div>
                  {billType === 'VAT' && (
                    <div className="summary-row">
                      <span>VAT ({VAT_RATE}%):</span>
                      <span>Rs {vatAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="summary-row grand-total">
                    <span>Total Amount:</span>
                    <span>Rs {totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Generate Bill Button */}
                <button
                  className="btn-generate-bill"
                  onClick={handleGenerateBill}
                  disabled={isSubmitting}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                  Generate Bill
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bill Preview Modal */}
        {showPreview && selectedStudent && (
          <BillSummaryPreviewModal
            schoolInfo={schoolInfo}
            student={selectedStudent}
            academicYear={academicYear}
            className={selectedClass}
            section={selectedSection}
            billType={billType}
            items={billItems}
            subTotal={subTotal}
            vatRate={billType === 'VAT' ? VAT_RATE : 0}
            vatAmount={vatAmount}
            totalAmount={totalAmount}
            paymentMode={paymentMode}
            chequeNo={chequeNo}
            bankRefNo={bankRefNo}
            onClose={() => setShowPreview(false)}
            onConfirm={handleConfirmBill}
            isSubmitting={isSubmitting}
          />
        )}
      </main>
    </div>
  );
}
