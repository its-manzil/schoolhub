"use client";

import React from 'react';
import Layout from '../components/Layout';
import { Settings, Shield, Bell, User, Database, Info } from "lucide-react";
import '../accounting.css';

const SettingsPage = () => {
  const settingsSections = [
    {
      title: "Profile Settings",
      desc: "Manage your personal information and account preferences.",
      icon: <User size={24} />,
    },
    {
      title: "Security & Permissions",
      desc: "Configure password, two-factor authentication, and access controls.",
      icon: <Shield size={24} />,
    },
    {
      title: "Notification Preferences",
      desc: "Control which alerts and emails you receive for financial activities.",
      icon: <Bell size={24} />,
    },
    {
      title: "Data Management",
      desc: "Export system logs, trigger backups, and manage fiscal year settings.",
      icon: <Database size={24} />,
    },
  ];

  return (
    <Layout>
      <div className="acd-page">
        <div className="acd-settings-grid">
          {settingsSections.map((section, idx) => (
            <div key={idx} className="acd-chart-card">
              <div className="acd-kpi-icon-wrap" style={{ width: '3rem', height: '3rem', marginBottom: '1rem' }}>
                {section.icon}
              </div>
              <h2 className="acd-chart-title">{section.title}</h2>
              <p className="acd-td-muted" style={{ marginBottom: '1rem' }}>{section.desc}</p>
              <button className="acd-btn-outline" style={{ width: '100%' }}>
                Manage {section.title.split(' ')[0]}
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
