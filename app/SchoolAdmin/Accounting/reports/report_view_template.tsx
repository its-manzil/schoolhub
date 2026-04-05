"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Layout from "../../../Accounting/components/Layout";
import { ChevronLeft, Download, Printer, Filter, Calendar, Search, RefreshCw, FileText } from "lucide-react";
import "./report_view.css";

interface ReportViewProps {
  title: string;
  reportType: string;
  sections: any[];
}

const ReportViewTemplate = ({ title, reportType, sections }: ReportViewProps) => {
  const router = useRouter();

  return (
    <Layout>
      <div className="report-view-container">
        {/* Header */}
        <div className="report-view-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => router.back()}>
              <ChevronLeft size={18} />
              Back
            </button>
            <div className="header-title">
              <div className="title-with-badge">
                <h1>{title}</h1>
                <span className="report-badge">{reportType}</span>
              </div>
              <p>Fiscal Year: 2081/82 | Period: Shrawan 01 - Ashadh 31</p>
            </div>
          </div>
          <div className="header-right">
            <button className="btn-outline"><Printer size={16} /> Print</button>
            <button className="btn-outline"><Download size={16} /> Excel</button>
            <button className="btn-primary"><Download size={16} /> PDF</button>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="report-inline-filters">
          <div className="inline-filter-group">
            <label>Fiscal Year</label>
            <select><option>2081/82</option></select>
          </div>
          <div className="inline-filter-group">
            <label>Start Date</label>
            <input type="text" placeholder="2081-04-01" />
          </div>
          <div className="inline-filter-group">
            <label>End Date</label>
            <input type="text" placeholder="2082-03-31" />
          </div>
          <button className="btn-update-report">Update</button>
        </div>

        {/* Report Content */}
        <div className="report-paper">
          <div className="report-paper-header">
            <div className="school-info">
              <h2>SCHOOLHUB ACADEMY</h2>
              <p>Kathmandu, Nepal | +977 01-4400000</p>
              <h3 className="report-main-title">{title.toUpperCase()}</h3>
              <p className="report-period">As of Ashadh 31, 2082</p>
            </div>
          </div>

          <div className="report-body">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="report-section">
                <h4 className="section-title">{section.title}</h4>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Account Name</th>
                      <th className="text-right">Amount (NPR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.items.map((item: any, iIdx: number) => (
                      <tr key={iIdx} className={item.isTotal ? "row-total" : ""}>
                        <td className={item.isSub ? "pl-8" : ""}>{item.name}</td>
                        <td className="text-right font-mono">{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                  {section.total && (
                    <tfoot>
                      <tr className="section-total-row">
                        <td>TOTAL {section.title.toUpperCase()}</td>
                        <td className="text-right font-mono">NPR {section.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            ))}
          </div>

          <div className="report-footer">
            <div className="signature-grid">
              <div className="sig-box">
                <div className="sig-line"></div>
                <span>Prepared By</span>
              </div>
              <div className="sig-box">
                <div className="sig-line"></div>
                <span>Accountant</span>
              </div>
              <div className="sig-box">
                <div className="sig-line"></div>
                <span>Principal</span>
              </div>
            </div>
            <p className="print-timestamp">Generated on: 2026-04-05 14:30 | System: SchoolHub ERP</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReportViewTemplate;
