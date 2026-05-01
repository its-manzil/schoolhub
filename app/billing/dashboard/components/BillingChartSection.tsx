'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import './charts.css';

interface BillingChartSectionProps {
  charts?: {
    revenueByMonth: Array<{ month: string; amount: number }>;
    collectionRate: number;
  };
}

export default function BillingChartSection({ charts }: BillingChartSectionProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toString();
  };

  const revenueData = charts?.revenueByMonth || [
    { month: 'Jan', amount: 0 },
    { month: 'Feb', amount: 0 },
    { month: 'Mar', amount: 0 },
    { month: 'Apr', amount: 0 },
    { month: 'May', amount: 0 },
    { month: 'Jun', amount: 0 },
  ];

  return (
    <div className="billing-charts-grid">
      <div className="billing-chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Revenue Trend</h3>
          <p className="chart-subtitle">Monthly collection overview</p>
        </div>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '10px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="billing-chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Collection Rate</h3>
          <p className="chart-subtitle">Percentage of dues collected</p>
        </div>
        <div className="chart-body collection-rate-body">
          <div className="rate-circle-container">
            <svg viewBox="0 0 100 100" className="rate-circle">
              <circle 
                className="circle-bg" 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="#f1f5f9" 
                strokeWidth="8" 
              />
              <circle 
                className="circle-progress" 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="8" 
                strokeDasharray={`${(charts?.collectionRate || 0) * 2.827}, 282.7`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="rate-value">
              <span className="percent">{charts?.collectionRate || 0}%</span>
              <span className="label">Collected</span>
            </div>
          </div>
          <div className="rate-stats">
            <div className="rate-stat-item">
              <div className="dot emerald"></div>
              <span>Collected</span>
            </div>
            <div className="rate-stat-item">
              <div className="dot slate"></div>
              <span>Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
