'use client';

import React from 'react';
import { DollarSign, Wallet, Clock, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import './stats-cards.css';

interface StatsData {
  totalRevenue: number;
  pendingAmount: number;
  collectedToday: number;
  totalInvoices: number;
  monthlyCollection: number;
  overdueBills: number;
}

interface BillingStatsCardsProps {
  stats?: StatsData;
  loading?: boolean;
}

export default function BillingStatsCards({ stats, loading }: BillingStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card skeleton">
            <div className="skeleton-icon"></div>
            <div className="stat-content">
              <div className="skeleton-text"></div>
              <div className="skeleton-value"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: 'Monthly Revenue',
      value: formatCurrency(stats?.monthlyCollection || 0),
      icon: <DollarSign size={20} />,
      color: 'indigo',
      trend: '+12.5%',
      trendUp: true,
      subtext: 'vs last month'
    },
    {
      label: 'Pending Dues',
      value: formatCurrency(stats?.pendingAmount || 0),
      icon: <Clock size={20} />,
      color: 'amber',
      trend: '+2.1%',
      trendUp: false,
      subtext: 'Requires attention'
    },
    {
      label: 'Collected Today',
      value: formatCurrency(stats?.collectedToday || 0),
      icon: <Wallet size={20} />,
      color: 'emerald',
      trend: '+5.4%',
      trendUp: true,
      subtext: 'Today\'s intake'
    },
    {
      label: 'Overdue Bills',
      value: (stats?.overdueBills || 0).toString(),
      icon: <FileText size={20} />,
      color: 'rose',
      trend: '-1',
      trendUp: true,
      subtext: 'Past due date'
    }
  ];

  return (
    <div className="stats-grid">
      {statItems.map((item, index) => (
        <div key={index} className="stat-card">
          <div className={`stat-icon stat-icon-${item.color}`}>
            {item.icon}
          </div>
          <div className="stat-content">
            <span className="stat-label">{item.label}</span>
            <h3 className="stat-value">{item.value}</h3>
            <div className="stat-meta">
              <span className={`stat-trend ${item.trendUp ? 'up' : 'down'}`}>
                {item.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {item.trend}
              </span>
              <span className="stat-subtext">{item.subtext}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
