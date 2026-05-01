'use client';

import React from 'react';
import { 
  ArrowUpRight, 
  CreditCard, 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
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
  loading?: boolean;
}

export default function RecentBillingActivity({ activities, loading }: RecentBillingActivityProps) {
  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString('en-IN')}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusIcon = (type: string, status: string) => {
    if (status.toLowerCase() === 'paid') return <CheckCircle2 size={14} className="status-icon-paid" />;
    return <Clock size={14} className="status-icon-pending" />;
  };

  if (loading) {
    return (
      <div className="activity-container skeleton">
        <div className="activity-header-skeleton"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="activity-item-skeleton"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="activity-container">
      <div className="activity-header">
        <h3 className="activity-title">Recent Activity</h3>
        <button className="view-all-btn">View All</button>
      </div>

      <div className="activity-list">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className={`activity-icon-box ${activity.type}`}>
                {activity.type === 'academic' ? <CreditCard size={18} /> : <Package size={18} />}
              </div>
              
              <div className="activity-content">
                <div className="activity-row">
                  <span className="activity-name">{activity.studentName}</span>
                  <span className="activity-amount">{formatCurrency(activity.amount)}</span>
                </div>
                
                <div className="activity-details">
                  <span className="activity-id">#{activity.invoiceId}</span>
                  <span className={`activity-status ${activity.paymentStatus.toLowerCase()}`}>
                    {getStatusIcon(activity.type, activity.paymentStatus)}
                    {activity.paymentStatus}
                  </span>
                  <span className="activity-time">
                    <Clock size={12} />
                    {formatTimeAgo(activity.createdAt)}
                  </span>
                </div>
              </div>
              <div className="activity-action">
                <ArrowUpRight size={16} />
              </div>
            </div>
          ))
        ) : (
          <div className="activity-empty">
            <AlertCircle size={32} />
            <p>No recent activity found.</p>
            <span>Generate bills to see history</span>
          </div>
        )}
      </div>
    </div>
  );
}
