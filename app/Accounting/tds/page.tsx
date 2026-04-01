"use client";

import React from 'react';
import Layout from '../components/Layout';
import { Download, Plus, Info, ArrowRight } from "lucide-react";
import '../TDS.css';

const TDS = () => {
  const tdsRates = [
    { rate: "1%", desc: "Salary (Standard Tax)" },
    { rate: "1.5%", desc: "Rent (Buildings/Land)" },
    { rate: "15%", desc: "Consultancy Services" },
    { rate: "5%", desc: "Interest on Deposits" },
  ];

  const tdsStats = [
    { label: "Deducted this month", value: "NPR 45,000", variant: "tds-stat-green" },
    { label: "Pending Deposits", value: "NPR 12,500", variant: "tds-stat-red" },
    { label: "Total Deducted (YTD)", value: "NPR 5,45,000", variant: "" },
  ];

  return (
    <Layout>
      <div className="tds-page">
        {/* Header */}
        <div className="tds-header">
          <h1 className="tds-title">TDS Management</h1>
          <p className="tds-subtitle">Track and manage Tax Deducted at Source (TDS) according to local regulations</p>
        </div>

        {/* Top Grid */}
        <div className="tds-top-grid">
          {/* TDS Rates Card */}
          <div className="tds-card">
            <h2 className="tds-card-title">TDS Rates</h2>
            <div className="tds-rates-list">
              {tdsRates.map((item, idx) => (
                <div key={idx} className="tds-rate-item">
                  <p className="tds-rate-val">{item.rate}</p>
                  <p className="tds-rate-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="tds-card">
            <h2 className="tds-card-title">Quick Stats</h2>
            <div className="tds-stats-list">
              {tdsStats.map((stat, idx) => (
                <div key={idx} className="tds-stat">
                  <p className="tds-stat-label">{stat.label}</p>
                  <p className={`tds-stat-val ${stat.variant}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions Card */}
          <div className="tds-card">
            <h2 className="tds-card-title">Quick Actions</h2>
            <div className="tds-actions-list">
              <button className="tds-action-btn tds-action-primary">
                New TDS Entry <Plus className="tds-action-icon" />
              </button>
              <button className="tds-action-btn tds-action-secondary">
                Generate Report <Download className="tds-action-icon" />
              </button>
              <button className="tds-action-btn tds-action-secondary">
                Manage Challans <ArrowRight className="tds-action-icon" />
              </button>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="tds-coming-soon">
          <Info className="tds-coming-icon" />
          <h3 className="tds-coming-title">Tax Year Closing</h3>
          <p className="tds-coming-text">
            The current tax year ends in 45 days. Ensure all TDS challans are deposited and certificates are issued to the respective parties.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default TDS;
