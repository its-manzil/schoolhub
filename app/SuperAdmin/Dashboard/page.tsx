'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SuperAdminNavbar from '../components/SuperAdminNavbar';
import './Dashboard.css';

// Types
interface Subscription {
  _id: string;
  schoolId: number;
  schoolName: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  paymentStatus: string;
  amount: number;
  totalPaid: number;
  remainingDays: number;
  history: Array<{
    years: number;
    amount: number;
    subscribedDate: string;
    expiryDate: string;
    paymentDate: string;
    transactionId: string;
  }>;
}

interface SchoolsSummary {
  totalSchools: number;
  activeSchools: number;
  recentSchools: number;
  recentSchoolsList: Array<{
    _id: string;
    schoolId: number;
    name: string;
    status: string;
    subscriptionActive: boolean;
    expiryDate: string;
    createdAt: string;
  }>;
  statusBreakdown: Record<string, number>;
  subscriptionBreakdown: {
    active: number;
    inactive: number;
  };
}

interface UsersSummary {
  totalUsers: number;
  recentUsers: number;
  breakdown: {
    superadmins: number;
    schooladmins: number;
    teachers: number;
    students: number;
    parents: number;
    accountants: number;
    staff: number;
  };
  byRole: Array<{
    role: string;
    count: number;
    color: string;
  }>;
}

interface DashboardData {
  subscriptions: Subscription[];
  schools: SchoolsSummary | null;
  users: UsersSummary | null;
  revenue: {
    total: number;
    monthly: number;
    pending: number;
  };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    subscriptions: [],
    schools: null,
    users: null,
    revenue: { total: 0, monthly: 0, pending: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [subscriptionsRes, schoolsRes, usersRes] = await Promise.all([
        fetch('/api/superadmin/subscriptions'),
        fetch('/api/superadmin/schools'),
        fetch('/api/superadmin/users')
      ]);

      const subscriptionsData = await subscriptionsRes.json();
      const schoolsData = await schoolsRes.json();
      const usersData = await usersRes.json();

      if (subscriptionsData.success) {
        const subscriptions = subscriptionsData.data;
        
        // Calculate revenue metrics
        const totalRevenue = subscriptions.reduce((sum: number, sub: Subscription) => sum + (sub.totalPaid || 0), 0);
        const pendingRevenue = subscriptions.reduce((sum: number, sub: Subscription) => {
          const pending = (sub.amount || 0) - (sub.totalPaid || 0);
          return sum + (pending > 0 ? pending : 0);
        }, 0);
        
        // Calculate monthly revenue (from recent subscriptions)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthlyRevenue = subscriptions
          .filter((sub: Subscription) => new Date(sub.startDate) >= thirtyDaysAgo)
          .reduce((sum: number, sub: Subscription) => sum + (sub.totalPaid || 0), 0);

        setData({
          subscriptions,
          schools: schoolsData.success ? schoolsData.data : null,
          users: usersData.success ? usersData.data : null,
          revenue: {
            total: totalRevenue,
            monthly: monthlyRevenue,
            pending: pendingRevenue
          }
        });
      } else {
        throw new Error('Failed to fetch subscriptions');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  // Get expiring subscriptions (next 7 days)
  const getExpiringSubscriptions = () => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return data.subscriptions.filter(sub => {
      const expiryDate = new Date(sub.endDate);
      return expiryDate > now && expiryDate <= sevenDaysFromNow && sub.status === 'active';
    });
  };

  // Get expired subscriptions
  const getExpiredSubscriptions = () => {
    const now = new Date();
    return data.subscriptions.filter(sub => {
      const expiryDate = new Date(sub.endDate);
      return expiryDate < now || sub.status === 'expired';
    });
  };

  // Calculate subscription stats
  const getSubscriptionStats = () => {
    const total = data.subscriptions.length;
    const active = data.subscriptions.filter(s => s.status === 'active').length;
    const expired = data.subscriptions.filter(s => s.status === 'expired' || s.status === 'inactive').length;
    const pending = data.subscriptions.filter(s => s.paymentStatus === 'pending').length;
    
    return {
      total,
      active,
      expired,
      pending,
      activePercent: total > 0 ? Math.round((active / total) * 100) : 0,
      expiredPercent: total > 0 ? Math.round((expired / total) * 100) : 0,
      pendingPercent: total > 0 ? Math.round((pending / total) * 100) : 0
    };
  };

  // Get recent activity
  const getRecentActivity = () => {
    const activities: Array<{
      type: 'subscription' | 'school' | 'payment';
      title: string;
      desc: string;
      time: string;
      icon: string;
    }> = [];

    // Add subscription activities
    data.subscriptions.slice(0, 5).forEach(sub => {
      activities.push({
        type: 'subscription',
        title: sub.schoolName,
        desc: `Subscribed to ${sub.plan} plan`,
        time: sub.startDate,
        icon: '📋'
      });
    });

    // Sort by date (most recent first)
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return activities.slice(0, 6);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <SuperAdminNavbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <SuperAdminNavbar />
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Failed to load dashboard</h3>
          <p className="error-desc">{error}</p>
          <button className="retry-btn" onClick={fetchDashboardData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = getSubscriptionStats();
  const expiringSubscriptions = getExpiringSubscriptions();
  const expiredSubscriptions = getExpiredSubscriptions();
  const recentActivity = getRecentActivity();

  return (
    <div className="dashboard-container">
      <SuperAdminNavbar />
      
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Super Admin Dashboard</h1>
          <p className="dashboard-subtitle">System overview & control center</p>
        </div>
      </header>

      <main className="dashboard-main">
        {/* KPI Cards */}
        <section className="kpi-grid">
          <div className="kpi-card info">
            <div className="kpi-icon">🏫</div>
            <div className="kpi-label">Total Schools</div>
            <div className="kpi-value">{data.schools?.totalSchools || 0}</div>
            <div className="kpi-change positive">
              <span>↑</span>
              <span>{data.schools?.recentSchools || 0} new this month</span>
            </div>
          </div>

          <div className="kpi-card success">
            <div className="kpi-icon">✓</div>
            <div className="kpi-label">Active Subscriptions</div>
            <div className="kpi-value">{stats.active}</div>
            <div className="kpi-change positive">
              <span>↑</span>
              <span>{stats.activePercent}% of total</span>
            </div>
          </div>

          <div className="kpi-card warning">
            <div className="kpi-icon">💰</div>
            <div className="kpi-label">Monthly Revenue</div>
            <div className="kpi-value">{formatCurrency(data.revenue.monthly)}</div>
            <div className="kpi-change neutral">
              <span>Total: {formatCurrency(data.revenue.total)}</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">👥</div>
            <div className="kpi-label">Total Users</div>
            <div className="kpi-value">{data.users?.totalUsers || 0}</div>
            <div className="kpi-change positive">
              <span>↑</span>
              <span>{data.users?.recentUsers || 0} new this month</span>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <Link href="/SuperAdmin/Subscription" className="action-btn">
            <div className="action-icon">➕</div>
            <span className="action-label">Add Subscription</span>
          </Link>
          <Link href="/SuperAdmin/School" className="action-btn">
            <div className="action-icon">🏫</div>
            <span className="action-label">View Schools</span>
          </Link>
          <Link href="/SuperAdmin/Subscription" className="action-btn">
            <div className="action-icon">📋</div>
            <span className="action-label">Manage Plans</span>
          </Link>
          <Link href="/SuperAdmin/Setting" className="action-btn">
            <div className="action-icon">📊</div>
            <span className="action-label">Settings</span>
          </Link>
        </section>

        {/* Main Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Analytics Section */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="card-title-icon">📈</span>
                Subscription Analytics
              </h3>
              <Link href="/SuperAdmin/Subscription" className="card-action">
                View All
              </Link>
            </div>
            <div className="card-body">
              <div className="analytics-grid">
                <div className="analytics-item">
                  <div className="analytics-value" style={{ color: 'var(--success)' }}>
                    {stats.activePercent}%
                  </div>
                  <div className="analytics-label">Active</div>
                  <div className="analytics-bar">
                    <div 
                      className="analytics-fill success" 
                      style={{ width: `${stats.activePercent}%` }}
                    ></div>
                  </div>
                </div>
                <div className="analytics-item">
                  <div className="analytics-value" style={{ color: 'var(--danger)' }}>
                    {stats.expiredPercent}%
                  </div>
                  <div className="analytics-label">Expired</div>
                  <div className="analytics-bar">
                    <div 
                      className="analytics-fill danger" 
                      style={{ width: `${stats.expiredPercent}%` }}
                    ></div>
                  </div>
                </div>
                <div className="analytics-item">
                  <div className="analytics-value" style={{ color: 'var(--warning)' }}>
                    {stats.pendingPercent}%
                  </div>
                  <div className="analytics-label">Pending</div>
                  <div className="analytics-bar">
                    <div 
                      className="analytics-fill warning" 
                      style={{ width: `${stats.pendingPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="chart-container" style={{ marginTop: '24px' }}>
                <div className="chart-placeholder">
                  <div className="chart-icon">📊</div>
                  <p className="chart-text">Revenue Trend Visualization</p>
                  <p className="chart-text" style={{ fontSize: '12px', marginTop: '4px' }}>
                    {formatCurrency(data.revenue.total)} total revenue from {stats.total} subscriptions
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="card-title-icon">🔔</span>
                Alerts & Notifications
              </h3>
            </div>
            <div className="card-body">
              <div className="alert-list">
                {expiringSubscriptions.length > 0 ? (
                  expiringSubscriptions.slice(0, 2).map(sub => (
                    <div key={sub._id} className="alert-item warning">
                      <span className="alert-icon">⚠️</span>
                      <div className="alert-content">
                        <div className="alert-title">Expiring Soon</div>
                        <div className="alert-desc">
                          {sub.schoolName} subscription expires in {sub.remainingDays} days
                        </div>
                        <div className="alert-meta">Expires: {formatDate(sub.endDate)}</div>
                        <Link href="/SuperAdmin/Subscription" className="alert-action">
                          Renew Now →
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="alert-item info">
                    <span className="alert-icon">✓</span>
                    <div className="alert-content">
                      <div className="alert-title">All Good!</div>
                      <div className="alert-desc">
                        No subscriptions expiring in the next 7 days
                      </div>
                    </div>
                  </div>
                )}

                {expiredSubscriptions.length > 0 && (
                  <div className="alert-item danger">
                    <span className="alert-icon">🚫</span>
                    <div className="alert-content">
                      <div className="alert-title">Expired Subscriptions</div>
                      <div className="alert-desc">
                        {expiredSubscriptions.length} subscription{expiredSubscriptions.length > 1 ? 's' : ''} need attention
                      </div>
                      <Link href="/SuperAdmin/Subscription" className="alert-action">
                        View All →
                      </Link>
                    </div>
                  </div>
                )}

                {data.revenue.pending > 0 && (
                  <div className="alert-item warning">
                    <span className="alert-icon">💰</span>
                    <div className="alert-content">
                      <div className="alert-title">Pending Payments</div>
                      <div className="alert-desc">
                        {formatCurrency(data.revenue.pending)} in unpaid subscriptions
                      </div>
                      <Link href="/SuperAdmin/Subscription" className="alert-action">
                        Review →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Grid */}
        <div className="dashboard-grid-alt">
          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="card-title-icon">🕐</span>
                Recent Activity
              </h3>
            </div>
            <div className="card-body">
              {recentActivity.length > 0 ? (
                <div className="activity-list">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className={`activity-icon ${activity.type === 'subscription' ? 'success' : 'info'}`}>
                        {activity.icon}
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">{activity.title}</div>
                        <div className="activity-desc">{activity.desc}</div>
                        <div className="activity-time">{formatRelativeTime(activity.time)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <div className="empty-title">No recent activity</div>
                  <div className="empty-desc">New subscriptions and updates will appear here</div>
                </div>
              )}
            </div>
          </div>

          {/* Revenue Stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="card-title-icon">💵</span>
                Revenue Overview
              </h3>
            </div>
            <div className="card-body">
              <div className="revenue-stat">
                <span className="revenue-label">Total Revenue</span>
                <span className="revenue-value">{formatCurrency(data.revenue.total)}</span>
              </div>
              <div className="revenue-stat">
                <span className="revenue-label">This Month</span>
                <span className="revenue-value positive">{formatCurrency(data.revenue.monthly)}</span>
              </div>
              <div className="revenue-stat">
                <span className="revenue-label">Pending</span>
                <span className="revenue-value" style={{ color: 'var(--warning)' }}>
                  {formatCurrency(data.revenue.pending)}
                </span>
              </div>
              <div className="revenue-stat">
                <span className="revenue-label">Active Subscriptions</span>
                <span className="revenue-value">{stats.active}</span>
              </div>
              
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--gray-100)' }}>
                <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '12px' }}>
                  User Distribution
                </div>
                {data.users?.byRole.slice(0, 4).map((role, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 0',
                    fontSize: '14px'
                  }}>
                    <span style={{ color: 'var(--gray-600)' }}>{role.role}</span>
                    <span style={{ 
                      fontWeight: 600, 
                      color: role.color,
                      background: `${role.color}15`,
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {role.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Subscriptions Table Preview */}
        <div className="card" style={{ marginTop: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">
              <span className="card-title-icon">📋</span>
              Recent Subscriptions
            </h3>
            <Link href="/SuperAdmin/Subscription" className="card-action">
              View All Subscriptions →
            </Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {data.subscriptions.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}>
                  <thead>
                    <tr style={{ background: 'var(--gray-50)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--gray-600)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>School</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--gray-600)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--gray-600)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--gray-600)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--gray-600)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.subscriptions.slice(0, 5).map((sub) => (
                      <tr key={sub._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                          {sub.schoolName}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--gray-600)' }}>
                          {sub.plan}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`status-badge ${sub.status}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                          {formatCurrency(sub.amount)}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--gray-500)', fontSize: '13px' }}>
                          {formatDate(sub.endDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <div className="empty-title">No subscriptions yet</div>
                <div className="empty-desc">Add your first subscription to get started</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}