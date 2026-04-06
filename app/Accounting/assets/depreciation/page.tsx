"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import { ChevronLeft, Calculator, Send, AlertCircle } from "lucide-react";
import "./depreciation.css";

const DepreciationPage = () => {
  const router = useRouter();

  const depreciationData = [
    { id: 1, name: "Dell Latitude Laptop (IT-001)", category: "IT", openingValue: 85000, rate: 25, depreciation: 21250, closingValue: 63750 },
    { id: 2, name: "Office Desk (FUR-012)", category: "Furniture", openingValue: 12000, rate: 10, depreciation: 1200, closingValue: 10800 },
    { id: 3, name: "School Bus (VEH-002)", category: "Vehicles", openingValue: 4500000, rate: 20, depreciation: 900000, closingValue: 3600000 },
    { id: 4, name: "Chemistry Microscope (LAB-005)", category: "Lab", openingValue: 25000, rate: 15, depreciation: 3750, closingValue: 21250 },
  ];

  return (
    <Layout>
      <div className="depreciation-container">
        {/* Header */}
        <div className="dep-header">
          <button className="back-btn" onClick={() => router.back()}>
            <ChevronLeft size={18} />
            Back
          </button>
          <div className="header-title">
            <h1>Depreciation Management</h1>
            <p>Calculate and post periodic depreciation for fixed assets.</p>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="dep-filter-panel">
          <div className="filter-group">
            <label>Fiscal Year</label>
            <select>
              <option>2081/82</option>
              <option>2080/81</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Category</label>
            <select>
              <option>All Categories</option>
              <option>Land & Buildings</option>
              <option>Furniture & Fixtures</option>
              <option>Computers & IT</option>
              <option>Vehicles</option>
            </select>
          </div>
          <button className="btn-calculate">
            <Calculator size={18} />
            Calculate Depreciation
          </button>
        </div>

        {/* Info Banner */}
        <div className="dep-info-banner">
          <AlertCircle size={20} />
          <p>
            <strong>Note:</strong> Depreciation is calculated using the <strong>Diminishing Balance Method (WDV)</strong> as per standard accounting practices for school assets in Nepal.
          </p>
        </div>

        {/* Table Card */}
        <div className="dep-table-card">
          <table className="dep-table">
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Category</th>
                <th className="text-right">Opening Value (NPR)</th>
                <th className="text-right">Rate (%)</th>
                <th className="text-right">Depreciation (NPR)</th>
                <th className="text-right">Closing Value (NPR)</th>
              </tr>
            </thead>
            <tbody>
              {depreciationData.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td className="text-right font-mono">{item.openingValue.toLocaleString()}</td>
                  <td className="text-right">{item.rate}%</td>
                  <td className="text-right font-mono text-red-600">-{item.depreciation.toLocaleString()}</td>
                  <td className="text-right font-mono font-bold">{item.closingValue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="text-right font-bold">Total Depreciation (FY 2081/82):</td>
                <td className="text-right font-mono font-bold text-red-600">NPR 926,200</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Actions */}
        <div className="dep-actions">
          <button className="btn-post">
            <Send size={18} />
            Post to General Ledger
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default DepreciationPage;
