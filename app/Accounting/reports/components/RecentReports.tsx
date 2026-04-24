// ERP-Grade Recent Reports Component
// Shows history of generated reports

'use client';

import React, { useState } from 'react';
import { PieChart, Download, Clock, FileText, TrendingUp, DollarSign, ListChecks, Activity } from 'lucide-react';
import { ReportTab } from '../hooks/useFinancialReports';
import { useToast } from '@/hooks/use-toast';

interface RecentReport {
  id: string;
  type: ReportTab;
  title: string;
  fiscalYear: string;
  generatedAt: string;
  format: 'PDF' | 'Excel' | 'CSV';
}

interface RecentReportsProps {
  onViewReport?: (tab: ReportTab) => void;
}

const REPORT_ICONS: Record<ReportTab, React.ReactNode> = {
  'overview': <PieChart size={18} />,
  'balance-sheet': <FileText size={18} />,
  'income-statement': <Activity size={18} />,
  'profit-loss': <TrendingUp size={18} />,
  'cash-flow': <DollarSign size={18} />,
  'trial-balance': <ListChecks size={18} />
};

export const RecentReports: React.FC<RecentReportsProps> = ({ onViewReport }) => {
  const { toast } = useToast();
  
  // Mock data - in production this would come from API/localStorage
  const [recentReports] = useState<RecentReport[]>([
    {
      id: '1',
      type: 'balance-sheet',
      title: 'Balance Sheet - Q3 (2080/81)',
      fiscalYear: '2080-2081',
      generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      format: 'PDF'
    },
    {
      id: '2',
      type: 'profit-loss',
      title: 'Profit & Loss - Monthly (Ashadh)',
      fiscalYear: '2081-2082',
      generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      format: 'Excel'
    },
    {
      id: '3',
      type: 'trial-balance',
      title: 'Trial Balance - Weekly',
      fiscalYear: '2081-2082',
      generatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      format: 'CSV'
    }
  ]);

  const formatRelativeTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleDownload = (report: RecentReport) => {
    // In production, this would trigger actual download
    console.log(`Downloading ${report.title} in ${report.format} format`);
    toast({
      title: "Download Started",
      description: `Downloading ${report.title} in ${report.format} format...`,
      variant: "success",
    });
  };

  return (
    <div className="recent-reports">
      <div className="section-header">
        <h2>Recently Generated</h2>
        <button className="text-btn">View Archive</button>
      </div>
      
      <div className="recent-list">
        {recentReports.map((report) => (
          <div key={report.id} className="recent-item">
            <div className="item-info">
              {REPORT_ICONS[report.type]}
              <div className="item-details">
                <span className="item-title">{report.title}</span>
                <span className="item-meta">
                  <Clock size={12} />
                  {formatRelativeTime(report.generatedAt)}
                </span>
              </div>
            </div>
            <div className="item-actions">
              <span className="item-format">{report.format}</span>
              {onViewReport && (
                <button 
                  className="icon-btn view"
                  onClick={() => onViewReport(report.type)}
                  title="View Report"
                >
                  {REPORT_ICONS[report.type]}
                </button>
              )}
              <button 
                className="icon-btn download"
                onClick={() => handleDownload(report)}
                title="Download"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentReports;
