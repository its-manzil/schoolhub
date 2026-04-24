"use client";

// ERP-Grade Accounting Reports Dashboard
// Single-page ERP shell with internal tab navigation

import React, { useState } from "react";
import Layout from "../components/Layout";
import { AlertCircle } from "lucide-react";
import "./Reports.css";

// Import new modular components
import {
  MiniNavbar,
  ReportCards,
  ReportFilters,
  ReportViewer,
  RecentReports,
  ExportPanel
} from "./components";

// Import hooks
import { useFinancialReports, ReportTab } from "./hooks";

const ReportsDashboard = () => {
  // Get schoolId from localStorage or use default
  const schoolId = typeof window !== 'undefined' 
    ? localStorage.getItem('schoolId') || '1001'
    : '1001';

  // Local state for filters
  const [fiscalYear, setFiscalYear] = useState('2081-2082');
  const [startDate, setStartDate] = useState('2081-04-01');
  const [endDate, setEndDate] = useState('2082-03-31');
  const [reportFormat, setReportFormat] = useState<'standard' | 'vertical'>('standard');

  // Use financial reports hook
  const {
    report,
    isLoading,
    errors,
    lastUpdated,
    activeTab,
    setActiveTab,
    refresh,
    isRefreshing,
    trialBalanceData,
    balanceSheetData,
    profitLossData,
    cashFlowData,
    incomeStatementData,
    summaryStats
  } = useFinancialReports({
    schoolId,
    fiscalYear,
    autoRefresh: false
  });

  // Handle tab change (internal navigation - no page reload)
  const handleTabChange = (tab: ReportTab) => {
    setActiveTab(tab);
  };

  // Handle report selection from cards
  const handleSelectReport = (tab: ReportTab) => {
    setActiveTab(tab);
  };

  return (
    <Layout>
      <div className="reports-container">
        {/* Header */}
        <div className="reports-header">
          <div className="header-text">
            <h1>Accounting Reports</h1>
            <p>ERP-grade financial statements with real-time data aggregation.</p>
          </div>
          <div className="header-actions">
            <ExportPanel 
              activeTab={activeTab}
              reportData={report}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="reports-error-banner">
            <AlertCircle size={18} />
            <div className="error-messages">
              {errors.map((error, index) => (
                <span key={index}>{error}</span>
              ))}
            </div>
          </div>
        )}

        {/* Mini Navigation Bar */}
        <MiniNavbar 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isLoading={isLoading}
        />

        {/* Report Filters */}
        <ReportFilters
          fiscalYear={fiscalYear}
          onFiscalYearChange={setFiscalYear}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          reportFormat={reportFormat}
          onReportFormatChange={setReportFormat}
          onRefresh={refresh}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
        />

        {/* Report Cards (only show on overview tab) */}
        {activeTab === 'overview' && (
          <ReportCards
            onSelectReport={handleSelectReport}
            summaryStats={summaryStats}
            errors={errors}
            isLoading={isLoading}
          />
        )}

        {/* Report Viewer (show for all other tabs) */}
        {activeTab !== 'overview' && (
          <div className="report-viewer-section">
            <ReportViewer
              activeTab={activeTab}
              trialBalanceData={trialBalanceData}
              balanceSheetData={balanceSheetData}
              profitLossData={profitLossData}
              cashFlowData={cashFlowData}
              incomeStatementData={incomeStatementData}
              summaryStats={summaryStats}
              isLoading={isLoading}
              reportFormat={reportFormat}
            />
          </div>
        )}

        {/* Recent Reports */}
        <div className="reports-bottom-section">
          <RecentReports onViewReport={handleSelectReport} />
        </div>
      </div>
    </Layout>
  );
};

export default ReportsDashboard;
