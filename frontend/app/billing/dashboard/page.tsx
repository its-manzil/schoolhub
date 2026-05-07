'use client';

import { useState, useEffect } from 'react';
import BillingNavbar from '../components/BillingNavbar';
import BillingStatsCards from './components/BillingStatsCards';
import BillingChartSection from './components/BillingChartSection';
import RecentBillingActivity from './components/RecentBillingActivity';
import QuickActionsPanel from './components/QuickActionsPanel';
import '../billingMain.css';
import './dashboard.css';

interface DashboardSummary {
  todayCollection: number;
  monthlyCollection: number;
  pendingDues: number;
  overdueBills: number;
  pendingInvoices: number;
  academicYear: string;
  studentStatus: {
    paid: number;
    partial: number;
    pending: number;
  };
  bsDate: {
    year: number;
    month: number;
    day: number;
    formatted: string;
  };
}

interface ActivityItem {
  type: 'academic' | 'inventory';
  invoiceId: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentStatus: string;
  createdAt: string;
  createdAtBS: string;
}

interface TrendData {
  dailyTrends: Array<{
    date: string;
    dayName: string;
    collection: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    year: number;
    collection: number;
  }>;
  paymentStatusDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  billTypeDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<number>(0);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserRole(user.role);
        setSchoolId(user.schoolId || 1);
      }
    } catch (error) {
      console.error('Error reading user role:', error);
    }
  }, []);

  const isSchoolAdmin = userRole === 'schooladmin';
  const basePath = isSchoolAdmin ? '/SchoolAdmin/Billing' : '/Billing';

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!schoolId) return;

      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${token}`,
          'x-school-id': schoolId.toString()
        };

        // Fetch all data in parallel
        const [summaryRes, activityRes, trendsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/billing/dashboard/summary`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/billing/dashboard/activity`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/billing/dashboard/trends`, { headers })
        ]);

        const summaryData = await summaryRes.json();
        const activityData = await activityRes.json();
        const trendsData = await trendsRes.json();

        if (summaryData.success) {
          setSummary(summaryData.data);
        }

        if (activityData.success) {
          setActivities(activityData.data);
        }

        if (trendsData.success) {
          setTrends(trendsData.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [schoolId]);

  // Check if all data is empty
  const isEmptyData = summary && 
    summary.monthlyCollection === 0 && 
    summary.pendingDues === 0 && 
    summary.pendingInvoices === 0 &&
    activities.length === 0;

  return (
    <div className="dashboard-page">
      <BillingNavbar />
      
      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Billing Dashboard</h1>
            <p className="dashboard-subtitle">Real-time ERP analytics and insights</p>
          </div>
          {summary && (
            <div className="dashboard-header-meta">
              <span className="meta-badge">Year: {summary.academicYear}</span>
              <span className="meta-badge">Today: {summary.bsDate.formatted}</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="dashboard-state loading">
            <div className="state-spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="dashboard-state error">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="state-action-btn">
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && isEmptyData && (
          <div className="dashboard-state empty">
            <i className="fas fa-inbox"></i>
            <p>No billing data available yet</p>
            <span>Generate bills to see dashboard analytics</span>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && summary && (
          <div className="dashboard-content">
            {/* Stats Cards */}
            <BillingStatsCards 
              stats={summary} 
              loading={loading} 
            />

            {/* Charts Section */}
            <BillingChartSection 
              trends={trends} 
              loading={loading} 
            />

            {/* Bottom Section: Activity + Quick Actions */}
            <div className="dashboard-bottom-section">
              <div className="dashboard-activity-wrapper">
                <RecentBillingActivity 
                  activities={activities} 
                  loading={loading} 
                />
              </div>
              
              <div className="dashboard-actions-wrapper">
                <QuickActionsPanel 
                  basePath={basePath}
                  overdueCount={summary.overdueBills}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}