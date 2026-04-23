'use client';

import './activity.css';

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

interface RecentBillingActivityProps {
  activities: ActivityItem[];
  loading: boolean;
}

export default function RecentBillingActivity({ activities, loading }: RecentBillingActivityProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <i className="fas fa-check"></i>;
      case 'partial':
        return <i className="fas fa-adjust"></i>;
      case 'pending':
        return <i className="fas fa-clock"></i>;
      default:
        return <i className="fas fa-file"></i>;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'activity-status-paid';
      case 'partial':
        return 'activity-status-partial';
      case 'pending':
        return 'activity-status-pending';
      default:
        return 'activity-status-default';
    }
  };

  const getActivityMessage = (activity: ActivityItem) => {
    const formattedAmount = `Rs ${activity.amount?.toLocaleString('en-IN') || 0}`;
    
    if (activity.paymentStatus === 'paid') {
      return `${activity.studentName} paid ${formattedAmount}`;
    } else if (activity.paymentStatus === 'partial') {
      return `${activity.studentName} made partial payment of ${formattedAmount}`;
    } else {
      return `Invoice ${activity.invoiceId} generated for ${activity.studentName}`;
    }
  };

  const getActivityTitle = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payment Received';
      case 'partial':
        return 'Partial Payment';
      case 'pending':
        return 'Invoice Generated';
      default:
        return 'Bill Activity';
    }
  };

  if (loading) {
    return (
      <div className="activity-container">
        <h3 className="activity-title">Recent Activity</h3>
        <div className="activity-list">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="activity-item skeleton">
              <div className="activity-icon-skeleton"></div>
              <div className="activity-content-skeleton">
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="activity-container">
      <div className="activity-header">
        <h3 className="activity-title">Recent Activity</h3>
        <span className="activity-count">{activities.length} transactions</span>
      </div>
      
      {activities.length === 0 ? (
        <div className="activity-empty">
          <i className="fas fa-clipboard-list"></i>
          <p>No recent activity</p>
          <span>Generate bills to see activity here</span>
        </div>
      ) : (
        <div className="activity-list">
          {activities.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className={`activity-icon ${getStatusClass(activity.paymentStatus)}`}>
                {getStatusIcon(activity.paymentStatus)}
              </div>
              <div className="activity-content">
                <div className="activity-main">
                  <h4 className="activity-heading">{getActivityTitle(activity.paymentStatus)}</h4>
                  <p className="activity-message">{getActivityMessage(activity)}</p>
                </div>
                <div className="activity-meta">
                  <span className="activity-time">{formatTimeAgo(activity.createdAt)}</span>
                  <span className={`activity-type activity-type-${activity.type}`}>
                    {activity.type === 'academic' ? 'Academic' : 'Inventory'}
                  </span>
                  <span className="activity-invoice">{activity.invoiceId}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
