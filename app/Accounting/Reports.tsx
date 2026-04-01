import Layout from "@/components/Layout";
import { FileText, Download, ArrowRight, Printer } from "lucide-react";
import "./Reports.css";

export default function Reports() {
  const reports = [
    {
      title: "Trial Balance",
      description: "Health check to verify Debits = Credits",
      icon: "⚖️",
    },
    {
      title: "Ledger Report",
      description: "Detailed view of a single account's history",
      icon: "📖",
    },
    {
      title: "Income & Expenditure",
      description: "Profit & Loss equivalent for schools",
      icon: "📊",
    },
    {
      title: "Balance Sheet",
      description: "Assets vs Liabilities overview",
      icon: "📋",
    },
  ];

  return (
    <Layout>
      <div className="rpt-page">

        {/* Header */}
        <div className="rpt-header">
          <div>
            <h1 className="rpt-title">Financial Reports</h1>
            <p className="rpt-subtitle">Generate and export print-ready financial reports</p>
          </div>
        </div>

        {/* Report Cards */}
        <div className="rpt-cards-grid">
          {reports.map((report, idx) => (
            <div key={idx} className="rpt-card">
              <div className="rpt-card-icon">{report.icon}</div>
              <h3 className="rpt-card-title">{report.title}</h3>
              <p className="rpt-card-desc">{report.description}</p>
              <button className="rpt-card-btn">
                Generate <ArrowRight className="rpt-btn-icon" />
              </button>
            </div>
          ))}
        </div>

        {/* Export + Filters */}
        <div className="rpt-bottom-grid">

          <div className="rpt-section-card">
            <h2 className="rpt-section-title">Export Options</h2>
            <div className="rpt-export-list">
              <button className="rpt-export-btn">
                <span className="rpt-export-left">
                  <span className="rpt-export-emoji">📄</span>
                  <span className="rpt-export-label">Export as PDF</span>
                </span>
                <Download className="rpt-export-icon" />
              </button>
              <button className="rpt-export-btn">
                <span className="rpt-export-left">
                  <span className="rpt-export-emoji">📊</span>
                  <span className="rpt-export-label">Export as Excel</span>
                </span>
                <Download className="rpt-export-icon" />
              </button>
              <button className="rpt-export-btn">
                <span className="rpt-export-left">
                  <Printer className="rpt-printer-icon" />
                  <span className="rpt-export-label">Print Report</span>
                </span>
                <Printer className="rpt-export-icon" />
              </button>
            </div>
          </div>

          <div className="rpt-section-card">
            <h2 className="rpt-section-title">Report Filters</h2>
            <div className="rpt-filter-form">
              <div className="rpt-field">
                <label className="rpt-label">Fiscal Year</label>
                <select className="rpt-select">
                  <option>2082/83</option>
                  <option>2081/82</option>
                </select>
              </div>
              <div className="rpt-field">
                <label className="rpt-label">Report Type</label>
                <select className="rpt-select">
                  <option>All Reports</option>
                  <option>Trial Balance</option>
                  <option>Ledger Report</option>
                  <option>Income &amp; Expenditure</option>
                  <option>Balance Sheet</option>
                </select>
              </div>
              <button className="rpt-generate-btn">Generate Report</button>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="rpt-coming-soon">
          <FileText className="rpt-coming-icon" />
          <h3 className="rpt-coming-title">Coming Soon</h3>
          <p className="rpt-coming-text">
            Continue building this section to add complete report generation, formatting, and export
            capabilities to PDF and Excel. Ask me to continue implementing Reports features.
          </p>
        </div>

      </div>
    </Layout>
  );
}
