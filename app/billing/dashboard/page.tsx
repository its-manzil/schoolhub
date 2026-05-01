'use client';

import React, { useState, useEffect } from 'react';
import BillingNavbar from '../components/BillingNavbar';
import BillingStatsCards from './components/BillingStatsCards';
import BillingChartSection from './components/BillingChartSection';
import RecentBillingActivity from './components/RecentBillingActivity';
import QuickActionsPanel from './components/QuickActionsPanel';
import { useToast } from '../../context/ToastContext';
import './dashboard.css';
import '../billing-shared.css';

interface DashboardData {
  stats: {
    totalRevenue: number;
    pendingAmount: number;
    collectedToday: number;
    totalInvoices: number;
  };
  charts: {
    revenueByMonth: Array<{ month: string; amount: number }>;
    collectionRate: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'payment' | 'invoice';
    title: string;
    amount: number;
    date: string;
    status: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;
        
        const response = await fetch(`http://localhost:2056/api/billing/dashboard?schoolId=${user?.schoolId || 1}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          showToast(result.message || 'Failed to fetch dashboard data', 'error');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showToast('Network error while fetching dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showToast]);

  if (loading) {
    return (
      <div className="billing-layout">
        <BillingNavbar />
        <main className="billing-main-content">
          <div className="dashboard-loading">
            <div className="spinner"></div>
            <p>Loading Dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="billing-layout">
      <BillingNavbar />
      <main className="billing-main-content">
        <div className="billing-page-header">
          <h1 className="billing-page-title">Billing Dashboard</h1>
          <p className="billing-page-subtitle">Overview of financial performance and recent activities.</p>
        </div>

        <BillingStatsCards stats={data?.stats} />

        <div className="dashboard-grid">
          <div className="dashboard-left">
            <BillingChartSection charts={data?.charts} />
            <RecentBillingActivity activities={data?.recentActivity} />
          </div>
          <div className="dashboard-right">
            <QuickActionsPanel />
          </div>
        </div>
      </main>
    </div>
  );
}