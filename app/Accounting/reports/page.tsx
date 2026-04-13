"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Layout from "../components/Layout";
import { 
  FileText, TrendingUp, DollarSign, ListChecks, 
  ArrowRight, PieChart, Activity, Download, RefreshCw
} from "lucide-react";
import "./Reports.css";

const ReportsDashboard = () => {
  const router = useRouter();

  const reportCategories = [
    {
      id: "balance-sheet",
      title: "Balance Sheet",
      desc: "Comprehensive view of school assets, liabilities, and equity.",
      icon: <FileText size={24} />,
      route: "/SchoolAdmin/Accounting/reports/balance-sheet",
      color: "#4f46e5",
      bg: "#eef2ff"
    },
    {
      id: "profit-loss",
      title: "Profit & Loss",
      desc: "Summary of revenues, costs, and expenses during a specific period.",
      icon: <TrendingUp size={24} />,
      route: "/SchoolAdmin/Accounting/reports/profit-loss",
      color: "#16a34a",
      bg: "#f0fdf4"
    },
    {
      id: "cash-flow",
      title: "Cash Flow",
      desc: "Detailed report of cash inflows and outflows from school operations.",
      icon: <DollarSign size={24} />,
      route: "/SchoolAdmin/Accounting/reports/cash-flow",
      color: "#ea580c",
      bg: "#fff7ed"
    },
    {
      id: "trial-balance",
      title: "Trial Balance",
      desc: "Report listing balances of all general ledger accounts.",
      icon: <ListChecks size={24} />,
      route: "/SchoolAdmin/Accounting/reports/trial-balance",
      color: "#7c3aed",
      bg: "#f5f3ff"
    }
  ];

  return (
    <Layout>
      <div className="reports-container">
        {/* Header */}
        <div className="reports-header">
          <div className="header-text">
            <h1>Accounting Reports</h1>
            <p>Generate and analyze financial statements for the school.</p>
          </div>
          <div className="header-actions">
            <button className="btn-outline">
              <RefreshCw size={16} /> Refresh Data
            </button>
          </div>
        </div>

        {/* Global Filters */}
        <div className="reports-filter-panel">
          <div className="filter-group">
            <label>Fiscal Year</label>
            <select>
              <option>2081/82</option>
              <option>2080/81</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Date Range</label>
            <div className="date-inputs">
              <input type="text" placeholder="Start Date (BS)" />
              <span>to</span>
              <input type="text" placeholder="End Date (BS)" />
            </div>
          </div>
          <div className="filter-group">
            <label>Report Format</label>
            <select>
              <option>Standard (T-Shape)</option>
              <option>Statement (Vertical)</option>
            </select>
          </div>
          <button className="btn-primary">
            <Activity size={18} /> Update View
          </button>
        </div>

        {/* Report Cards Grid */}
        <div className="report-cards-grid">
          {reportCategories.map((report) => (
            <div key={report.id} className="report-card">
              <div className="report-card-icon" style={{ color: report.color, background: report.bg }}>
                {report.icon}
              </div>
              <div className="report-card-content">
                <h3>{report.title}</h3>
                <p>{report.desc}</p>
              </div>
              <button 
                className="btn-generate" 
                style={{ color: report.color }}
                onClick={() => router.push(report.route)}
              >
                Generate Report <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Recent Downloads / Scheduled Reports */}
        <div className="reports-bottom-section">
          <div className="recent-reports">
            <div className="section-header">
              <h2>Recently Generated</h2>
              <button className="text-btn">View Archive</button>
            </div>
            <div className="recent-list">
              <div className="recent-item">
                <div className="item-info">
                  <PieChart size={18} />
                  <span>Balance Sheet - Q3 (2080/81)</span>
                </div>
                <div className="item-actions">
                  <span className="item-date">2 days ago</span>
                  <button className="icon-btn"><Download size={16} /></button>
                </div>
              </div>
              <div className="recent-item">
                <div className="item-info">
                  <PieChart size={18} />
                  <span>Profit & Loss - Monthly (Ashadh)</span>
                </div>
                <div className="item-actions">
                  <span className="item-date">1 week ago</span>
                  <button className="icon-btn"><Download size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReportsDashboard;
