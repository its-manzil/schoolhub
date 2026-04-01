"use client";

import React from 'react';
import Layout from '../components/Layout';
import { Download, Printer, Info, ArrowRight } from "lucide-react";
import '../Reports.css';

const Reports = () => {
  const mainReports = [
    {
      title: "Balance Sheet",
      desc: "Comprehensive view of assets, liabilities, and equity.",
      icon: "📋",
    },
    {
      title: "Profit & Loss",
      desc: "Track income and expenses over a specific period.",
      icon: "📈",
    },
    {
      title: "Cash Flow",
      desc: "Monitor cash inflows and outflows for daily operations.",
      icon: "💸",
    },
    {
      title: "Trial Balance",
      desc: "Check ledger balances for accounting accuracy.",
      icon: "⚖️",
    },
  ];

  const exportOptions = [
    { label: "PDF Document", icon: "📄" },
    { label: "Excel Spreadsheet", icon: "📊" },
    { label: "CSV File", icon: "📁" },
  ];

  return (
    <Layout>
      <div className="rpt-page">
        {/* Report Cards Grid */}
        <div className="rpt-cards-grid">
          {mainReports.map((report, idx) => (
            <div key={idx} className="rpt-card">
              <div className="rpt-card-icon">{report.icon}</div>
              <h2 className="rpt-card-title">{report.title}</h2>
              <p className="rpt-card-desc">{report.desc}</p>
              <button className="rpt-card-btn">
                Generate <ArrowRight className="rpt-btn-icon" />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="rpt-bottom-grid">
          {/* Quick Export Section */}
          <div className="rpt-section-card">
            <h2 className="rpt-section-title">Quick Export</h2>
            <div className="rpt-export-list">
              {exportOptions.map((opt, idx) => (
                <button key={idx} className="rpt-export-btn">
                  <div className="rpt-export-left">
                    <span className="rpt-export-emoji">{opt.icon}</span>
                    <span className="rpt-export-label">{opt.label}</span>
                  </div>
                  <Download className="rpt-export-icon" />
                </button>
              ))}
              <button className="rpt-export-btn">
                <div className="rpt-export-left">
                  <span className="rpt-export-emoji">🖨️</span>
                  <span className="rpt-export-label">Print Summary</span>
                </div>
                <Printer className="rpt-printer-icon" />
              </button>
            </div>
          </div>

          {/* Filter Section */}
          <div className="rpt-section-card">
            <h2 className="rpt-section-title">Custom Report Filter</h2>
            <form className="rpt-filter-form">
              <div className="rpt-field">
                <label className="rpt-label">Fiscal Year</label>
                <select className="rpt-select">
                  <option>2082 - 2083</option>
                  <option>2081 - 2082</option>
                  <option>2080 - 2081</option>
                </select>
              </div>
              <div className="rpt-field">
                <label className="rpt-label">Report Type</label>
                <select className="rpt-select">
                  <option>Ledger Summary</option>
                  <option>Fee Collection Report</option>
                  <option>Expense Breakdown</option>
                  <option>TDS Summary</option>
                </select>
              </div>
              <button type="button" className="rpt-generate-btn">
                Generate Custom Report
              </button>
            </form>
          </div>
        </div>

        {/* Info Banner */}
        <div className="rpt-coming-soon">
          <Info className="rpt-coming-icon" />
          <h3 className="rpt-coming-title">Scheduled Reports</h3>
          <p className="rpt-coming-text">
            You can schedule automated monthly reports to be emailed to the Principal and Board members. Visit the Notification settings to configure.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
