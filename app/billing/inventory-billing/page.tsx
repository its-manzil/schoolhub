'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../context/ToastContext';
import './InventoryBillingPage.css';
import '../billing-shared.css';
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
  const { showToast } = useToast();

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

  // Calculate totals (VAT Inclusive)
  // The item sum is treated as VAT-inclusive total
  const round2 = (num: number): number => Number(num.toFixed(2));
  const vatInclusiveTotal = billItems.reduce((sum, item) => sum + item.amount, 0);

  let subTotal: number;
  let vatAmount: number;
  let totalAmount: number;

  if (billType === 'VAT') {
    const vatMultiplier = 1 + VAT_RATE / 100;
    subTotal = round2(vatInclusiveTotal / vatMultiplier);
    vatAmount = round2(vatInclusiveTotal - subTotal);
    totalAmount = round2(vatInclusiveTotal);
  } else {
    subTotal = round2(vatInclusiveTotal);
    vatAmount = 0;
    totalAmount = round2(vatInclusiveTotal);
  }

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
      showToast('Please select a student', 'error');
      return;
    }

    if (billItems.length === 0) {
      showToast('Please add at least one inventory item', 'error');
      return;
    }

    if (paymentMode === 'Cheque' && !chequeNo) {
      showToast('Please enter cheque number', 'error');
      return;
    }

    if (paymentMode === 'Bank' && !bankRefNo) {
      showToast('Please enter bank reference number', 'error');
      return;
    }

    setShowPreview(true);
  };

  const handleSubmitBill = async () => {
    if (!selectedStudent) return;

    setIsSubmitting(true);

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

      showToast('Bill saved successfully!', 'success');
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
    } catch (err) {
      console.error('Error saving bill:', err);
      showToast(err instanceof Error ? err.message : 'Failed to save bill', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="billing-layout">
        <BillingNavbar />
        <main className="billing-main-content">
          <div className="dashboard-loading">
            <div className="spinner"></div>
            <p>Loading Inventory Billing...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="billing-layout">
      <BillingNavbar />
      <main className="billing-main-content">
        <div className="billing-page-header">
          <h1 className="billing-page-title">Inventory Billing</h1>
          <p className="billing-page-subtitle">Manage sales of school inventory items to students.</p>
        </div>

        <div className="billing-filters-card">
          <div className="filters-grid">
            <AcademicSelector
              selectedYear={academicYear}
              onChange={setAcademicYear}
              schoolId={schoolId}
            />
          </div>
        </div>

        <div className="inventory-billing-grid">
          <div className="selection-col">
            <StudentSelector
              schoolId={schoolId}
              selectedClass={selectedClass}
              onClassChange={setSelectedClass}
              selectedSection={selectedSection}
              onSectionChange={setSelectedSection}
              selectedStudent={selectedStudent}
              onStudentChange={setSelectedStudent}
            />
            
            <div className="billing-card payment-method-card">
              <div className="card-header-alt">
                <h3 className="card-title-sm">Payment Details</h3>
              </div>
              <div className="card-body-padding">
                <PaymentMethodSelector
                  paymentMode={paymentMode}
                  onChange={setPaymentMode}
                  chequeNo={chequeNo}
                  onChequeNoChange={setChequeNo}
                  bankRefNo={bankRefNo}
                  onBankRefNoChange={setBankRefNo}
                />
                
                <div className="bill-type-section-alt">
                  <label className="section-label-sm">Bill Type</label>
                  <div className="bill-type-toggle-alt">
                    <button
                      type="button"
                      className={billType === 'PAN' ? 'active' : ''}
                      onClick={() => setBillType('PAN')}
                    >
                      PAN
                    </button>
                    <button
                      type="button"
                      className={billType === 'VAT' ? 'active' : ''}
                      onClick={() => setBillType('VAT')}
                    >
                      VAT ({VAT_RATE}%)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="selection-col">
            <InventorySelector
              schoolId={schoolId}
              academicYear={academicYear}
              billItems={billItems}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
            />

            {billItems.length > 0 && (
              <div className="billing-card items-summary-card">
                <div className="card-header-alt">
                  <h3 className="card-title-sm">Selected Items ({billItems.length})</h3>
                </div>
                <div className="card-body-no-padding">
                  <table className="billing-table-sm">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {billItems.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="item-name-cell">
                              <span className="main-name">{item.name}</span>
                              {item.variantLabel && <span className="variant-tag">{item.variantLabel}</span>}
                            </div>
                          </td>
                          <td>{item.qty}</td>
                          <td>{item.rate.toFixed(2)}</td>
                          <td>{item.amount.toFixed(2)}</td>
                          <td>
                            <button className="remove-item-btn" onClick={() => handleRemoveItem(item.id)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="billing-actions-footer">
          <div className="billing-summary-preview">
            <div className="summary-item">
              <span className="label">Subtotal:</span>
              <span className="value">Rs {subTotal.toFixed(2)}</span>
            </div>
            {billType === 'VAT' && (
              <div className="summary-item">
                <span className="label">VAT ({VAT_RATE}%):</span>
                <span className="value">Rs {vatAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-item">
              <span className="label">Grand Total:</span>
              <span className="value primary">Rs {totalAmount.toFixed(2)}</span>
            </div>
          </div>
          <div className="action-buttons">
            <button
              className="generate-bill-btn"
              onClick={handleGenerateBill}
              disabled={isSubmitting || !selectedStudent || billItems.length === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Preview & Generate Bill
            </button>
          </div>
        </div>

        {showPreview && (
          <BillSummaryPreviewModal
            schoolInfo={schoolInfo}
            student={selectedStudent!}
            academicYear={academicYear}
            className={selectedClass}
            section={selectedSection}
            billType={billType}
            items={billItems}
            subTotal={subTotal}
            vatRate={VAT_RATE}
            vatAmount={vatAmount}
            totalAmount={totalAmount}
            paymentMode={paymentMode}
            chequeNo={chequeNo}
            bankRefNo={bankRefNo}
            onClose={() => setShowPreview(false)}
            onConfirm={handleSubmitBill}
            isSubmitting={isSubmitting}
          />
        )}
      </main>
    </div>
  );
}
