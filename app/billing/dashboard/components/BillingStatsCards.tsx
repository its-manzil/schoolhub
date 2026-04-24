'use client';

import './stats-cards.css';

interface StatsData {
  todayCollection: number;
  monthlyCollection: number;
  pendingDues: number;
  overdueBills: number;
  pendingInvoices: number;
  studentStatus: {
    paid: number;
    partial: number;
    pending: number;
  };
}

interface BillingStatsCardsProps {
  stats: StatsData | null;
  loading: boolean;
}

export default function BillingStatsCards({ stats, loading }: BillingStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="stats-cards-container">
        <div className="stats-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="stat-card skeleton">
              <div className="stat-icon skeleton-icon"></div>
              <div className="stat-content">
                <div className="skeleton-text"></div>
                <div className="skeleton-value"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const totalBilled = stats.studentStatus.paid + stats.studentStatus.partial + stats.studentStatus.pending;

  return (
    <div className="stats-cards-container">
      {/* Student Payment Status Row */}
      <div className="stats-section">
        <h3 className="stats-section-title">Student Payment Status</h3>
        <div className="stats-grid">
          <div className="stat-card stat-card-success">
            <div className="stat-icon stat-icon-success">
              <i className="fas fa-user-check"></i>
            </div>
            <div className="stat-content">
              <span className="stat-label">Fully Paid</span>
              <span className="stat-value">{stats.studentStatus.paid}</span>
              <span className="stat-badge">All dues cleared</span>
            </div>
          </div>

          <div className="stat-card stat-card-warning">
            <div className="stat-icon stat-icon-warning">
              <i className="fas fa-user-clock"></i>
            </div>
            <div className="stat-content">
              <span className="stat-label">Partially Paid</span>
              <span className="stat-value">{stats.studentStatus.partial}</span>
              <span className="stat-badge">Partial payment</span>
            </div>
          </div>

          <div className="stat-card stat-card-info">
            <div className="stat-icon stat-icon-info">
              <i className="fas fa-user-times"></i>
            </div>
            <div className="stat-content">
              <span className="stat-label">Pending</span>
              <span className="stat-value">{stats.studentStatus.pending}</span>
              <span className="stat-badge">No payment yet</span>
            </div>
          </div>

          <div className="stat-card stat-card-primary">
            <div className="stat-icon stat-icon-primary">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Billed</span>
              <span className="stat-value">{totalBilled}</span>
              <span className="stat-badge">Unique students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Stats Row */}
      <div className="stats-section">
        <h3 className="stats-section-title">Financial Overview</h3>
        <div className="stats-grid">
          <div className="stat-card stat-card-success">
            <div className="stat-icon stat-icon-success">
              <i className="fas fa-coins"></i>
            </div>
            <div className="stat-content">
              <span className="stat-label">Today&apos;s Collection</span>
              <span className="stat-value">{formatCurrency(stats.todayCollection)}</span>
              <span className="stat-badge">Real-time</span>
            </div>
          </div>

          <div className="stat-card stat-card-primary">
            <div className="stat-icon stat-icon-primary">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="stat-content">
              <span className="stat-label">Monthly Collection</span>
              <span className="stat-value">{formatCurrency(stats.monthlyCollection)}</span>
              <span className="stat-badge">This month</span>
            </div>
          </div>

          <div className="stat-card stat-card-danger">
            <div className="stat-icon stat-icon-danger">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="stat-content">
              <span className="stat-label">Outstanding Dues</span>
              <span className="stat-value">{formatCurrency(stats.pendingDues)}</span>
              <span className="stat-badge">Pending payments</span>
            </div>
          </div>

          <div className="stat-card stat-card-warning">
            <div className="stat-icon stat-icon-warning">
              <i className="fas fa-file-invoice"></i>
            </div>
            <div className="stat-content">
              <span className="stat-label">Pending Invoices</span>
              <span className="stat-value">{stats.pendingInvoices}</span>
              <span className="stat-badge">Awaiting payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Alert */}
      {stats.overdueBills > 0 && (
        <div className="overdue-alert">
          <div className="overdue-icon">
            <i className="fas fa-bell"></i>
          </div>
          <div className="overdue-content">
            <h4>Overdue Bills Alert</h4>
            <p>You have {stats.overdueBills} bill{stats.overdueBills > 1 ? 's' : ''} that are overdue by 30+ days</p>
          </div>
        </div>
      )}
    </div>
  );
}
