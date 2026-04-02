"use client";

import React from 'react';
import Layout from '../components/Layout';
import { Settings, Users, BookOpen, CreditCard, Bell, Shield, ArrowRight, Info } from "lucide-react";
import './Configuration.css';

const Configuration = () => {
  const configSections = [
    {
      title: "Chart of Accounts",
      desc: "Set up and manage your ledger accounts, account groups, and fiscal year settings.",
      icon: "📊",
    },
    {
      title: "User Permissions",
      desc: "Configure access levels for accountants, administrators, and other staff members.",
      icon: "👤",
    },
    {
      title: "Fee Structures",
      desc: "Define tuition fees, bus fees, and other charges for different grades and categories.",
      icon: "💰",
    },
    {
      title: "Tax Settings",
      desc: "Manage TDS rates, VAT settings, and other government-mandated tax configurations.",
      icon: "⚖️",
    },
    {
      title: "Notifications",
      desc: "Set up automated alerts for pending payments, due dates, and financial reports.",
      icon: "🔔",
    },
    {
      title: "System Logs",
      desc: "View audit trails of all financial transactions and configuration changes.",
      icon: "📝",
    },
  ];

  return (
    <Layout>
      <div className="cfg-page">
        {/* Configuration Cards */}
        <div className="cfg-cards-grid">
          {configSections.map((section, idx) => (
            <div key={idx} className="cfg-card">
              <div className="cfg-card-icon">{section.icon}</div>
              <h2 className="cfg-card-title">{section.title}</h2>
              <p className="cfg-card-desc">{section.desc}</p>
              <button className="cfg-card-btn">
                Configure <ArrowRight className="cfg-btn-icon" />
              </button>
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div className="cfg-coming-soon">
          <Info className="cfg-coming-icon" />
          <h3 className="cfg-coming-title">Automated Backup Enabled</h3>
          <p className="cfg-coming-text">
            All financial data is automatically backed up daily at midnight. You can manually trigger a backup from the System Maintenance section.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Configuration;
