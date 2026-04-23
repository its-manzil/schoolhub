'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BillingNavbar from '../components/BillingNavbar';
import InventoryBillFilters from './components/InventoryBillFilters';
import InventoryBillTable, { InventoryBill } from './components/InventoryBillTable';
import '../billingMain.css';
import './inventory-bill-receipt.css';

export default function InventoryBillReceiptPage() {
  const router = useRouter();

  // Auth & User State
  const [schoolId, setSchoolId] = useState<number>(0);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data State
  const [bills, setBills] = useState<InventoryBill[]>([]);
  const [billsLoading, setBillsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [academicYear, setAcademicYear] = useState<string>('all');
  const [className, setClassName] = useState<string>('all');
  const [section, setSection] = useState<string>('all');
  const [status, setStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [academicYears, setAcademicYears] = useState<string[]>([]);

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
          // School info fetched but not currently used in UI
          console.log('School info loaded:', data.data);
        }
      } catch (err) {
        console.error('Error fetching school info:', err);
      }
    };

    fetchSchoolInfo();
  }, [schoolId]);

  // Fetch Academic Years
  useEffect(() => {
    const fetchAcademicYears = async () => {
      if (!schoolId) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:2056/api/accounting/fee-management/academic-years`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-school-id': schoolId.toString()
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.length > 0) {
            setAcademicYears(data.data.map((year: { year: string }) => year.year));
          } else {
            // Generate default years
            const currentYear = new Date().getFullYear();
            const years = [];
            for (let i = -1; i <= 2; i++) {
              const start = currentYear + i;
              const end = start + 1;
              years.push(`${start}-${end.toString().slice(-2)}`);
            }
            setAcademicYears(years);
          }
        } else {
          // Generate default years
          const currentYear = new Date().getFullYear();
          const years = [];
          for (let i = -1; i <= 2; i++) {
            const start = currentYear + i;
            const end = start + 1;
            years.push(`${start}-${end.toString().slice(-2)}`);
          }
          setAcademicYears(years);
        }
      } catch (err) {
        console.error('Error fetching academic years:', err);
        // Generate default years
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = -1; i <= 2; i++) {
          const start = currentYear + i;
          const end = start + 1;
          years.push(`${start}-${end.toString().slice(-2)}`);
        }
        setAcademicYears(years);
      }
    };

    fetchAcademicYears();
  }, [schoolId]);

  // Fetch Bills
  const fetchBills = useCallback(async () => {
    if (!schoolId) return;

    try {
      setBillsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('schoolId', schoolId.toString());
      if (academicYear && academicYear !== 'all') {
        params.append('academicYear', academicYear);
      }
      if (className && className !== 'all') {
        params.append('className', className);
      }
      if (section && section !== 'all') {
        params.append('section', section);
      }
      if (status && status !== 'all') {
        params.append('status', status);
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`/api/billing/inventory-bills?${params.toString()}`);

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
      setBills([]);
    } finally {
      setBillsLoading(false);
    }
  }, [schoolId, academicYear, className, section, status, searchTerm]);

  // Fetch bills when filters change
  useEffect(() => {
    if (schoolId) {
      fetchBills();
    }
  }, [schoolId, academicYear, className, section, status, searchTerm, fetchBills]);

  // Auto-select current academic year on initial load
  useEffect(() => {
    if (academicYears.length > 0 && academicYear === 'all') {
      // Try to determine current academic year
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      // Academic year typically starts in April (month 3)
      const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
      const endYear = (startYear + 1).toString().slice(-2);
      const currentAcademicYear = `${startYear}-${endYear}`;

      if (academicYears.includes(currentAcademicYear)) {
        setAcademicYear(currentAcademicYear);
      } else {
        setAcademicYear(academicYears[0]);
      }
    }
  }, [academicYears, academicYear]);

  const handleViewBill = (bill: InventoryBill) => {
    // Modal is handled inside InventoryBillTable
    console.log('Viewing bill:', bill.invoiceId);
  };

  const handlePrintBill = (bill: InventoryBill) => {
    // Open print view in new tab
    window.open(`/billing/inventory-bill-receipt/print/${bill._id}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="inventory-bill-receipt-loading">
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
      <main className="billing-main-content inventory-bill-receipt-page">
        <div className="inventory-bill-receipt-header">
          <h1>Inventory Bill Receipts</h1>
          <p>View and manage all inventory bills</p>
        </div>

        <InventoryBillFilters
          academicYear={academicYear}
          onAcademicYearChange={setAcademicYear}
          className={className}
          onClassChange={setClassName}
          section={section}
          onSectionChange={setSection}
          status={status}
          onStatusChange={setStatus}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          academicYears={academicYears}
        />

        <InventoryBillTable
          bills={bills}
          loading={billsLoading}
          error={error}
          onViewBill={handleViewBill}
          onPrintBill={handlePrintBill}
        />
      </main>
    </div>
  );
}
