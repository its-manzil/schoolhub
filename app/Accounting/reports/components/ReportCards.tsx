// ERP-Grade Report Cards Component
// Displays summary cards for each report type

'use client';

import React, { useMemo } from 'react';
import { 
  FileText, 
  TrendingUp, 
  DollarSign, 
  ListChecks, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { ReportTab } from '../hooks/useFinancialReports';

interface ReportCardData {
  id: ReportTab;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  isAvailable: boolean;
  error?: string;
}

interface ReportCardsProps {
  onSelectReport: (tab: ReportTab) => void;
  summaryStats: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    netProfit: number;
    netCashFlow: number;
    isBalanced: boolean;
  };
  errors: string[];
  isLoading: boolean;
}

export const ReportCards: React.FC<ReportCardsProps> = ({
  onSelectReport,
  summaryStats,
  errors,
  isLoading
}) => {
  const cards = useMemo<ReportCardData[]>(() => {
    const hasErrors = errors.length > 0;
    
    return [
      {
        id: 'balance-sheet',
        title: 'Balance Sheet',
        description: 'Assets, liabilities, and equity overview',
        icon: <FileText size={24} />,
        color: '#4f46e5',
        bg: '#eef2ff',
        isAvailable: !isLoading,
        error: hasErrors ? 'Data unavailable' : undefined
      },
      {
        id: 'income-statement',
        title: 'Income Statement',
        description: 'Structured breakdown of revenue and expenses',
        icon: <Activity size={24} />,
        color: '#0ea5e9',
        bg: '#e0f2fe',
        isAvailable: !isLoading,
        error: hasErrors ? 'Data unavailable' : undefined
      },
      {
        id: 'profit-loss',
        title: 'Profit & Loss',
        description: 'Revenue, expenses, and net profit',
        icon: <TrendingUp size={24} />,
        color: '#16a34a',
        bg: '#f0fdf4',
        isAvailable: !isLoading,
        error: hasErrors ? 'Data unavailable' : undefined
      },
      {
        id: 'cash-flow',
        title: 'Cash Flow',
        description: 'Cash inflows and outflows',
        icon: <DollarSign size={24} />,
        color: '#ea580c',
        bg: '#fff7ed',
        isAvailable: !isLoading,
        error: hasErrors ? 'Data unavailable' : undefined
      },
      {
        id: 'trial-balance',
        title: 'Trial Balance',
        description: 'All ledger account balances',
        icon: <ListChecks size={24} />,
        color: '#7c3aed',
        bg: '#f5f3ff',
        isAvailable: !isLoading,
        error: hasErrors ? 'Data unavailable' : undefined
      }
    ];
  }, [errors, isLoading]);

  const formatCurrency = (amount: number): string => {
    if (amount === 0) return '₨ 0';
    if (Math.abs(amount) >= 100000) {
      return `₨ ${(amount / 100000).toFixed(2)}L`;
    }
    if (Math.abs(amount) >= 1000) {
      return `₨ ${(amount / 1000).toFixed(2)}K`;
    }
    return `₨ ${amount.toFixed(2)}`;
  };

  return (
    <div className="report-cards-section">
      {/* Summary Stats Row */}
      <div className="summary-stats-row">
        <div className="stat-card">
          <span className="stat-label">Total Assets</span>
          <span className="stat-value" style={{ color: '#4f46e5' }}>
            {formatCurrency(summaryStats.totalAssets)}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Liabilities</span>
          <span className="stat-value" style={{ color: '#dc2626' }}>
            {formatCurrency(summaryStats.totalLiabilities)}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Equity</span>
          <span className="stat-value" style={{ color: '#16a34a' }}>
            {formatCurrency(summaryStats.totalEquity)}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Net Profit</span>
          <span className={`stat-value ${summaryStats.netProfit >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(summaryStats.netProfit)}
          </span>
        </div>
        <div className="stat-card balance-status">
          <span className="stat-label">Balance Status</span>
          <span className={`balance-indicator ${summaryStats.isBalanced ? 'balanced' : 'unbalanced'}`}>
            {summaryStats.isBalanced ? (
              <><CheckCircle2 size={16} /> Balanced</>
            ) : (
              <><AlertCircle size={16} /> Unbalanced</>
            )}
          </span>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="report-cards-grid">
        {cards.map((card) => (
          <div 
            key={card.id} 
            className={`report-card ${!card.isAvailable ? 'unavailable' : ''}`}
          >
            <div 
              className="report-card-icon" 
              style={{ color: card.color, background: card.bg }}
            >
              {card.icon}
            </div>
            <div className="report-card-content">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              {card.error && (
                <span className="card-error">{card.error}</span>
              )}
            </div>
            <button 
              className="btn-generate" 
              style={{ color: card.color }}
              onClick={() => onSelectReport(card.id)}
              disabled={!card.isAvailable}
            >
              View Report <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportCards;
