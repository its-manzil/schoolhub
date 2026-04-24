// ERP-Grade Mini Navigation Bar
// Internal tab navigation for reports (no page reload)

'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Scale, 
  TrendingUp, 
  DollarSign, 
  ListChecks, 
  Activity 
} from 'lucide-react';
import { ReportTab } from '../hooks/useFinancialReports';

interface MiniNavbarProps {
  activeTab: ReportTab;
  onTabChange: (tab: ReportTab) => void;
  isLoading?: boolean;
}

const tabs: { id: ReportTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'balance-sheet', label: 'Balance Sheet', icon: <Scale size={18} /> },
  { id: 'income-statement', label: 'Income Statement', icon: <Activity size={18} /> },
  { id: 'profit-loss', label: 'Profit & Loss', icon: <TrendingUp size={18} /> },
  { id: 'cash-flow', label: 'Cash Flow', icon: <DollarSign size={18} /> },
  { id: 'trial-balance', label: 'Trial Balance', icon: <ListChecks size={18} /> }
];

export const MiniNavbar: React.FC<MiniNavbarProps> = ({
  activeTab,
  onTabChange,
  isLoading = false
}) => {
  return (
    <nav className="mini-navbar">
      <div className="mini-navbar-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`mini-nav-tab ${activeTab === tab.id ? 'active' : ''} ${isLoading ? 'disabled' : ''}`}
            onClick={() => !isLoading && onTabChange(tab.id)}
            disabled={isLoading}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {activeTab === tab.id && (
              <span className="tab-indicator" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MiniNavbar;
