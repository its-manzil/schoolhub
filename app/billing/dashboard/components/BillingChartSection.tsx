'use client';

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
  trends: TrendData | null;
  loading: boolean;
}

export default function BillingChartSection({ trends, loading }: BillingChartSectionProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toString();
  };

  if (loading) {
    return (
      <div className="charts-container">
        <div className="charts-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="chart-card skeleton">
              <div className="chart-header-skeleton"></div>
              <div className="chart-body-skeleton"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!trends) return null;

  const hasDailyData = trends.dailyTrends.some(d => d.collection > 0);
  const hasMonthlyData = trends.monthlyTrends.some(m => m.collection > 0);
  const hasPieData = trends.paymentStatusDistribution.some(p => p.value > 0);

  if (!hasDailyData && !hasMonthlyData && !hasPieData) {
    return (
      <div className="charts-container">
        <div className="charts-empty">
          <i className="fas fa-chart-area"></i>
          <p>No chart data available</p>
          <span>Generate bills to see analytics</span>
        </div>
      </div>
    );
  }

  // Line Chart - Last 7 Days
  const maxDaily = Math.max(...trends.dailyTrends.map(d => d.collection), 1);
  const linePoints = trends.dailyTrends.map((day, index) => {
    const x = (index / (trends.dailyTrends.length - 1)) * 100;
    const y = 100 - ((day.collection / maxDaily) * 80 + 10);
    return `${x},${y}`;
  }).join(' ');

  // Pie Chart calculations
  const totalPie = trends.paymentStatusDistribution.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  const pieSlices = trends.paymentStatusDistribution.map(item => {
    const angle = (item.value / totalPie) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { ...item, startAngle, angle };
  });

  return (
    <div className="charts-container">
      <div className="charts-grid">
        {/* Line Chart - Daily Collection */}
        {hasDailyData && (
          <div className="chart-card chart-card-large">
            <div className="chart-header">
              <h3 className="chart-title">7-Day Collection Trend</h3>
              <span className="chart-subtitle">Daily revenue</span>
            </div>
            <div className="chart-body">
              <svg className="line-chart" viewBox="0 0 100 60" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(y => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
                ))}
                
                {/* Area fill */}
                <polygon
                  points={`0,100 ${linePoints} 100,100`}
                  fill="url(#areaGradient)"
                  opacity="0.3"
                />
                
                {/* Line */}
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Data points */}
                {trends.dailyTrends.map((day, index) => {
                  const x = (index / (trends.dailyTrends.length - 1)) * 100;
                  const y = 100 - ((day.collection / maxDaily) * 80 + 10);
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="2"
                      fill="#3b82f6"
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  );
                })}
                
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* X-axis labels */}
              <div className="line-chart-labels">
                {trends.dailyTrends.map((day, index) => (
                  <span key={index} className="line-chart-label">
                    {day.dayName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bar Chart - Monthly Collection */}
        {hasMonthlyData && (
          <div className="chart-card chart-card-medium">
            <div className="chart-header">
              <h3 className="chart-title">Monthly Trend</h3>
              <span className="chart-subtitle">Last 6 months</span>
            </div>
            <div className="chart-body">
              <div className="bar-chart">
                {trends.monthlyTrends.map((month, index) => {
                  const maxMonthly = Math.max(...trends.monthlyTrends.map(m => m.collection), 1);
                  const height = (month.collection / maxMonthly) * 100;
                  return (
                    <div key={index} className="bar-chart-item">
                      <div className="bar-chart-bar-wrapper">
                        <div
                          className="bar-chart-bar"
                          style={{ height: `${Math.max(height, 8)}%` }}
                        >
                          {month.collection > 0 && (
                            <span className="bar-chart-value">
                              {formatCurrency(month.collection)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="bar-chart-label">{month.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Pie Chart - Payment Status */}
        {hasPieData && (
          <div className="chart-card chart-card-medium">
            <div className="chart-header">
              <h3 className="chart-title">Payment Status</h3>
              <span className="chart-subtitle">Paid vs Pending</span>
            </div>
            <div className="chart-body">
              <div className="pie-chart-container">
                <svg className="pie-chart" viewBox="-50 -50 100 100">
                  {pieSlices.map((slice, index) => {
                    const startRad = (slice.startAngle * Math.PI) / 180;
                    const endRad = ((slice.startAngle + slice.angle) * Math.PI) / 180;
                    const x1 = Math.cos(startRad) * 40;
                    const y1 = Math.sin(startRad) * 40;
                    const x2 = Math.cos(endRad) * 40;
                    const y2 = Math.sin(endRad) * 40;
                    const largeArc = slice.angle > 180 ? 1 : 0;
                    
                    return (
                      <path
                        key={index}
                        d={`M 0 0 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={slice.color}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    );
                  })}
                  
                  {/* Center hole for donut effect */}
                  <circle cx="0" cy="0" r="20" fill="#ffffff" />
                  
                  {/* Center text */}
                  <text x="0" y="-3" textAnchor="middle" className="pie-center-label">
                    Total
                  </text>
                  <text x="0" y="10" textAnchor="middle" className="pie-center-value">
                    {totalPie}
                  </text>
                </svg>
                
                {/* Legend */}
                <div className="pie-legend">
                  {trends.paymentStatusDistribution.map((item, index) => (
                    <div key={index} className="pie-legend-item">
                      <span className="pie-legend-color" style={{ background: item.color }}></span>
                      <span className="pie-legend-label">{item.name}</span>
                      <span className="pie-legend-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
