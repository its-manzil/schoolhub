'use client';

import React, { useState, useEffect } from 'react';
import './BillList.css';
import { numberToWords, formatNumber } from '../../academic-billing/utils/invoiceUtils';
import { useToast } from '../../../context/ToastContext';
import BillPreview from '../../academic-billing/components/Bill/BillPreview';

export interface BillRecord {
  _id: string;
  invoiceId: string;
  schoolId: number;
  studentId: string;
  studentName: string;
  className: string;
  rollNumber?: string;
  academicYear: string;
  components: Array<{
    name: string;
    qty: number;
    rate: number;
    amount: number;
    monthRange?: { fromMonth: string; toMonth: string };
    reason?: string;
  }>;
  subTotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  paymentMode: 'cash' | 'online' | 'cheque';
  paymentStatus: 'paid' | 'pending';
  chequeNo?: string;
  createdAt: string;
  createdAtBS: string;
  isLocked: boolean;
  schoolPanVat?: string;
}

interface SchoolInfo {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  panVat?: string;
}

interface BillListProps {
  schoolId: number;
  schoolInfo: SchoolInfo;
  onPrintBill?: (bill: BillRecord) => void;
  userRole?: string;
}

export default function BillList({ schoolId, schoolInfo, userRole, onPrintBill }: BillListProps) {
  const { showToast } = useToast();
  const [bills, setBills] = useState<BillRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [filterAcademicYear, setFilterAcademicYear] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [selectedBill, setSelectedBill] = useState<BillRecord | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const canManagePayments = userRole === 'schooladmin' || userRole === 'billing';

  useEffect(() => {
    const loadBills = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        const response = await fetch(
          `http://localhost:2056/api/billing/bills?schoolId=${schoolId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-school-id': schoolId.toString()
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch bills');
        }

        const data = await response.json();

        if (data.success && data.data) {
          setBills(data.data);
        } else {
          setBills([]);
        }
      } catch (err) {
        console.error('Error fetching bills:', err);
        setError('Failed to load bills');
        showToast('Failed to load bills', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadBills();
  }, [schoolId, refreshTrigger]);

  const handleMarkAsPaid = async (billId: string) => {
    if (!canManagePayments) return;

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:2056/api/billing/bills/${billId}/mark-paid`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-school-id': schoolId.toString(),
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark bill as paid');
      }

      // Refresh bills
      setRefreshTrigger(prev => prev + 1);
      showToast('Bill marked as paid', 'success');
    } catch (err) {
      console.error('Error marking bill as paid:', err);
      showToast('Failed to mark bill as paid', 'error');
    }
  };

  // Get unique values for filter dropdowns
  const academicYears = Array.from(new Set(bills.map(b => b.academicYear))).sort();
  const classes = Array.from(new Set(bills.map(b => b.className))).sort();
  const sections = Array.from(new Set(bills.map(b => (b as BillRecord & { section?: string }).section).filter(Boolean))) as string[];

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.className.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || bill.paymentStatus === filterStatus;
    const matchesAcademicYear = filterAcademicYear === 'all' || bill.academicYear === filterAcademicYear;
    const matchesClass = filterClass === 'all' || bill.className === filterClass;
    const matchesSection = filterSection === 'all' || (bill as BillRecord & { section?: string }).section === filterSection;
    
    return matchesSearch && matchesStatus && matchesAcademicYear && matchesClass && matchesSection;
  });

  const openViewModal = (bill: BillRecord) => {
    setSelectedBill(bill);
  };

  const closeViewModal = () => {
    setSelectedBill(null);
  };

  if (loading) {
    return (
      <div className="bill-list">
        <div className="bill-list-loading">
          <div className="spinner"></div>
          <span>Loading bills...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bill-list">
      <div className="bill-list-header">
        <h2 className="bill-list-title">Generated Bills</h2>
        <div className="bill-list-filters">
          <input
            type="text"
            className="search-input"
            placeholder="Search by student, invoice ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'paid' | 'pending')}
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
          {academicYears.length > 0 && (
            <select
              className="filter-select"
              value={filterAcademicYear}
              onChange={(e) => setFilterAcademicYear(e.target.value)}
            >
              <option value="all">All Academic Years</option>
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          )}
          {classes.length > 0 && (
            <select
              className="filter-select"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="all">All Classes</option>
              {classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          )}
          {sections.length > 0 && (
            <select
              className="filter-select"
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
            >
              <option value="all">All Sections</option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          )}
          <button className="btn-refresh" onClick={() => setRefreshTrigger(prev => prev + 1)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bill-list-error">{error}</div>
      )}

      {filteredBills.length === 0 ? (
        <div className="bill-list-empty">
          {searchTerm || filterStatus !== 'all' || filterAcademicYear !== 'all' || filterClass !== 'all' || filterSection !== 'all'
            ? 'No bills match your search criteria'
            : 'No bills generated yet. Generate your first bill from the Generate Bill tab.'}
        </div>
      ) : (
        <div className="bill-table-wrapper">
          <table className="bill-data-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Student</th>
                <th>Class</th>
                <th>Amount (Rs)</th>
                <th>Status</th>
                <th>Date (BS)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((bill) => (
                <tr key={bill._id}>
                  <td className="invoice-id">{bill.invoiceId}</td>
                  <td>{bill.studentName}</td>
                  <td>{bill.className}</td>
                  <td className="amount">{formatNumber(bill.totalAmount)}</td>
                  <td>
                    <span className={`status-badge ${bill.paymentStatus}`}>
                      {bill.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td>{bill.createdAtBS}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-action btn-view" 
                        onClick={() => openViewModal(bill)}
                        title="View"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      <button
                        className="btn-action btn-print"
                        onClick={() => onPrintBill?.(bill)}
                        title="Print"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#7c3aed' }}>
                          <polyline points="6 9 6 2 18 2 18 9"></polyline>
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                          <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                      </button>
                      {canManagePayments && bill.paymentStatus === 'pending' && (
                        <button
                          className="btn-action btn-mark-paid"
                          onClick={() => handleMarkAsPaid(bill._id)}
                          title="Mark as Paid"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      {selectedBill && (
        <BillPreview
          schoolInfo={schoolInfo}
          student={{
            _id: selectedBill._id,
            studentId: selectedBill.studentId,
            name: selectedBill.studentName,
            className: selectedBill.className,
            rollNumber: selectedBill.rollNumber
          }}
          academicYear={selectedBill.academicYear}
          components={selectedBill.components.map((c, i) => ({
            id: `comp-${i}`,
            name: c.name,
            qty: c.qty,
            rate: c.rate,
            amount: c.amount,
            type: 'fee', // Default type for academic bills
            monthRange: c.monthRange,
            reason: c.reason
          }))}
          vatRate={selectedBill.vatRate}
          subTotal={selectedBill.subTotal}
          vatAmount={selectedBill.vatAmount}
          totalAmount={selectedBill.totalAmount}
          payment={{
            mode: selectedBill.paymentMode,
            status: selectedBill.paymentStatus,
            chequeNo: selectedBill.chequeNo
          }}
          invoiceId={selectedBill.invoiceId}
          createdAtBS={selectedBill.createdAtBS}
          onClose={closeViewModal}
        />
      )}
    </div>
  );
}
