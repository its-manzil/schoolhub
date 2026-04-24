// ERP-Grade Report Filters Component
// Handles fiscal year, date range, and format selection

'use client';

import React, { useState, useCallback } from 'react';
import { Activity, RefreshCw } from 'lucide-react';

interface ReportFiltersProps {
  fiscalYear: string;
  onFiscalYearChange: (year: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  reportFormat: 'standard' | 'vertical';
  onReportFormatChange: (format: 'standard' | 'vertical') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: string | null;
}

const FISCAL_YEARS = ['2081-2082', '2080-2081', '2079-2080'];

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  fiscalYear,
  onFiscalYearChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  reportFormat,
  onReportFormatChange,
  onRefresh,
  isRefreshing,
  lastUpdated
}) => {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  const handleUpdate = useCallback(() => {
    onStartDateChange(localStartDate);
    onEndDateChange(localEndDate);
  }, [localStartDate, localEndDate, onStartDateChange, onEndDateChange]);

  const formatLastUpdated = (timestamp: string | null): string => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="reports-filter-panel">
      <div className="filter-row">
        {/* First Row: Fiscal Year and Report Format */}
        <div className="filter-row-top">
          <div className="filter-group filter-group-small">
            <label>Fiscal Year</label>
            <select 
              value={fiscalYear} 
              onChange={(e) => onFiscalYearChange(e.target.value)}
              className="filter-select-small"
            >
              {FISCAL_YEARS.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="filter-group filter-group-small">
            <label>Report Format</label>
            <select 
              value={reportFormat} 
              onChange={(e) => onReportFormatChange(e.target.value as 'standard' | 'vertical')}
              className="filter-select-small"
            >
              <option value="standard">Standard (T-Shape)</option>
              <option value="vertical">Statement (Vertical)</option>
            </select>
          </div>
        </div>

        {/* Second Row: Date Range and Actions */}
        <div className="filter-row-bottom">
          <div className="filter-group filter-group-date">
            <label>Date Range (BS)</label>
            <div className="date-inputs">
              <input 
                type="text" 
                placeholder="2081-04-01" 
                value={localStartDate}
                onChange={(e) => setLocalStartDate(e.target.value)}
                className="date-input"
              />
              <span className="date-separator">to</span>
              <input 
                type="text" 
                placeholder="2082-03-31" 
                value={localEndDate}
                onChange={(e) => setLocalEndDate(e.target.value)}
                className="date-input"
              />
            </div>
          </div>

          <div className="filter-actions">
            <button 
              className="btn-primary"
              onClick={handleUpdate}
            >
              <Activity size={18} /> Update View
            </button>
            
            <button 
              className="btn-outline"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} /> 
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>

      {lastUpdated && (
        <div className="last-updated">
          Last updated: {formatLastUpdated(lastUpdated)}
        </div>
      )}
    </div>
  );
};

export default ReportFilters;
