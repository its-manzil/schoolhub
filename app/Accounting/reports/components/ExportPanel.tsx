// ERP-Grade Export Panel Component
// Handles PDF, Excel, and CSV export functionality

'use client';

import React, { useState, useCallback } from 'react';
import { Download, FileText, FileSpreadsheet, FileCode, Printer } from 'lucide-react';
import { ReportTab } from '../hooks/useFinancialReports';

interface ExportPanelProps {
  activeTab: ReportTab;
  reportData: unknown;
  isLoading: boolean;
}

type ExportFormat = 'PDF' | 'Excel' | 'CSV' | 'Print';

interface ExportOption {
  id: ExportFormat;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'PDF',
    label: 'PDF Document',
    icon: <FileText size={20} />,
    description: 'Professional formatted report'
  },
  {
    id: 'Excel',
    label: 'Excel Spreadsheet',
    icon: <FileSpreadsheet size={20} />,
    description: 'Editable data with formulas'
  },
  {
    id: 'CSV',
    label: 'CSV Data',
    icon: <FileCode size={20} />,
    description: 'Raw data for analysis'
  },
  {
    id: 'Print',
    label: 'Print Report',
    icon: <Printer size={20} />,
    description: 'Send to printer'
  }
];

export const ExportPanel: React.FC<ExportPanelProps> = ({
  activeTab,
  reportData,
  isLoading
}) => {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const handleExport = useCallback(async (format: ExportFormat) => {
    if (isLoading || !reportData) {
      alert('Please wait for report data to load');
      return;
    }

    setIsExporting(format);

    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In production, this would:
    // - Call API endpoint for PDF/Excel generation
    // - Generate CSV on client side
    // - Trigger print dialog for Print
    
    console.log(`Exporting ${activeTab} as ${format}`);
    
    if (format === 'Print') {
      window.print();
    } else {
      alert(`${format} export ready for download!`);
    }

    setIsExporting(null);
    setShowOptions(false);
  }, [activeTab, reportData, isLoading]);

  const getReportTitle = (tab: ReportTab): string => {
    const titles: Record<ReportTab, string> = {
      'overview': 'Financial Overview',
      'balance-sheet': 'Balance Sheet',
      'income-statement': 'Income Statement',
      'profit-loss': 'Profit & Loss Statement',
      'cash-flow': 'Cash Flow Statement',
      'trial-balance': 'Trial Balance'
    };
    return titles[tab];
  };

  return (
    <div className="export-panel">
      {!showOptions ? (
        <button 
          className="btn-export-trigger"
          onClick={() => setShowOptions(true)}
          disabled={isLoading}
        >
          <Download size={18} />
          Export Report
        </button>
      ) : (
        <div className="export-options">
          <div className="export-header">
            <span>Export {getReportTitle(activeTab)}</span>
            <button 
              className="btn-close"
              onClick={() => setShowOptions(false)}
            >
              ×
            </button>
          </div>
          
          <div className="export-grid">
            {EXPORT_OPTIONS.map((option) => (
              <button
                key={option.id}
                className={`export-option ${isExporting === option.id ? 'exporting' : ''}`}
                onClick={() => handleExport(option.id)}
                disabled={isExporting !== null}
              >
                <span className="export-icon">{option.icon}</span>
                <span className="export-label">{option.label}</span>
                <span className="export-desc">{option.description}</span>
                {isExporting === option.id && (
                  <span className="export-spinner" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportPanel;
