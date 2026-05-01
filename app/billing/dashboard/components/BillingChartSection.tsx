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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import './charts.css';

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

interface BillingChartSectionProps {
  trends?: TrendData | null;
  loading?: boolean;
}

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#6366f1'];

export default function BillingChartSection({ trends, loading }: BillingChartSectionProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toString();
  };

  if (loading) {
    return (
      <div className="charts-container skeleton">
        <div className="chart-card skeleton-pulse"></div>
        <div className="chart-card skeleton-pulse"></div>
      </div>
    );
  }

  const monthlyData = trends?.monthlyTrends || [];
  const statusData = trends?.paymentStatusDistribution || [];

  return (
    <div className="charts-container">
      {/* Revenue Trend Area Chart */}
      <div className="chart-card main-chart">
        <div className="chart-header">
          <h3 className="chart-title">Revenue Collection Trend</h3>
          <p className="chart-subtitle">Monthly growth and collection analysis</p>
        </div>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCollection" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="collection" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCollection)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Status Pie Chart */}
      <div className="chart-card side-chart">
        <div className="chart-header">
          <h3 className="chart-title">Payment Distribution</h3>
          <p className="chart-subtitle">Status of generated invoices</p>
        </div>
        <div className="chart-body pie-chart-body">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                animationDuration={1500}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '10px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-center-text">
            <span className="pie-total">
              {statusData.reduce((acc, curr) => acc + curr.value, 0)}
            </span>
            <span className="pie-label">Invoices</span>
          </div>
        </div>
      </div>
    </div>
  );
}
