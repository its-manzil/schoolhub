'use client';

import React from 'react';
import { CreditCard, FileText, ArrowUpRight, CheckCircle, Clock } from 'lucide-react';
import './activity.css';

interface ActivityItem {
  id: string;
  type: 'payment' | 'invoice';
  title: string;
  amount: number;
  date: string;
  status: string;
}

interface RecentBillingActivityProps {
  activities?: ActivityItem[];
}

export default function RecentBillingActivity({ activities }: RecentBillingActivityProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const getStatusIcon = (type: string, status: string) => {
    if (type === 'payment') return <CheckCircle size={14} className="text-emerald" />;
    return <FileText size={14} className="text-blue" />;
  };

  const activityList = activities || [];

  return (
    <div className="billing-activity-card">
      <div className="activity-header">
        <h3 className="activity-title">Recent Activity</h3>
        <p className="activity-subtitle">Latest financial transactions</p>
      </div>
      <div className="activity-list">
        {activityList.length > 0 ? (
          activityList.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className={`activity-type-icon ${activity.type}`}>
                {activity.type === 'payment' ? <CreditCard size={18} /> : <FileText size={18} />}
              </div>
              <div className="activity-content">
                <div className="activity-main">
                  <span className="activity-item-title">{activity.title}</span>
                  <span className="activity-amount">Rs {activity.amount.toLocaleString()}</span>
                </div>
                <div className="activity-meta">
                  <span className="activity-status">
                    {getStatusIcon(activity.type, activity.status)}
                    {activity.status}
                  </span>
                  <span className="activity-time">
                    <Clock size={12} />
                    {formatTimeAgo(activity.date)}
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
            <p>No recent activity found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
