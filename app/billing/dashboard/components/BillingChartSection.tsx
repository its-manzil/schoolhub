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
    // Add 2% padding on left and right to prevent circle clipping
    const x = 2 + (index / (trends.dailyTrends.length - 1)) * 96;
    const y = 100 - ((day.collection / maxDaily) * 60 + 20); // Map to 20-80 range for better vertical breathing room
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
              <svg className="line-chart" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(y => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                ))}
                
                {/* Area fill */}
                <polygon
                  points={`2,100 ${linePoints} 98,100`}
                  fill="url(#areaGradient)"
                />
                
                {/* Line */}
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ vectorEffect: 'non-scaling-stroke' }}
                />
                
                {/* Data points */}
                {trends.dailyTrends.map((day, index) => {
                  const x = 2 + (index / (trends.dailyTrends.length - 1)) * 96;
                  const y = 100 - ((day.collection / maxDaily) * 60 + 20);
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="3"
                      fill="#ffffff"
                      stroke="#16a34a"
                      strokeWidth="2"
                      style={{ vectorEffect: 'non-scaling-stroke' }}
                    />
                  );
                })}
                
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
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
          <div className="chart-card">
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
                    const innerRadius = 35;
                    const outerRadius = 45;
                    const x1 = Math.cos(startRad) * outerRadius;
                    const y1 = Math.sin(startRad) * outerRadius;
                    const x2 = Math.cos(endRad) * outerRadius;
                    const y2 = Math.sin(endRad) * outerRadius;
                    const x3 = Math.cos(endRad) * innerRadius;
                    const y3 = Math.sin(endRad) * innerRadius;
                    const x4 = Math.cos(startRad) * innerRadius;
                    const y4 = Math.sin(startRad) * innerRadius;
                    const largeArc = slice.angle > 180 ? 1 : 0;
                    
                    return (
                      <path
                        key={index}
                        d={`M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`}
                        fill={slice.color}
                      />
                    );
                  })}
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
