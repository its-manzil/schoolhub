'use client';

import React from 'react';
import { DollarSign, Wallet, Clock, FileText } from 'lucide-react';
import './stats-cards.css';

interface StatsData {
  totalRevenue: number;
  pendingAmount: number;
  collectedToday: number;
  totalInvoices: number;
}

interface BillingStatsCardsProps {
  stats?: StatsData;
}

export default function BillingStatsCards({ stats }: BillingStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString('en-IN')}`;
  };

  const statItems = [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: <DollarSign size={20} />,
      color: 'indigo',
      description: 'Total billed amount'
    },
    {
      label: 'Pending Dues',
      value: formatCurrency(stats?.pendingAmount || 0),
      icon: <Clock size={20} />,
      color: 'amber',
      description: 'Unpaid invoices'
    },
    {
      label: 'Collected Today',
      value: formatCurrency(stats?.collectedToday || 0),
      icon: <Wallet size={20} />,
      color: 'emerald',
      description: 'Today\'s collection'
    },
    {
      label: 'Total Invoices',
      value: (stats?.totalInvoices || 0).toString(),
      icon: <FileText size={20} />,
      color: 'blue',
      description: 'Count of generated bills'
    }
  ];

  return (
    <div className="billing-stats-grid">
      {statItems.map((item, index) => (
        <div key={index} className={`billing-stat-card billing-stat-card-${item.color}`}>
          <div className="stat-card-inner">
            <div className={`stat-icon-wrapper stat-icon-${item.color}`}>
              {item.icon}
            </div>
            <div className="stat-info">
              <span className="stat-label">{item.label}</span>
              <h3 className="stat-value">{item.value}</h3>
              <p className="stat-desc">{item.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
