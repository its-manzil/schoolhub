"use client";

import React from 'react';
import Layout from '../components/Layout';
import { Bell } from "lucide-react";
import './notifications.css';

const NotificationsPage = () => {
  const notifications = [
    {
      id: 1,
      title: "Fiscal Year Closing",
      message: "The current fiscal year ends in 45 days. Please ensure all vouchers are posted.",
      date: "2082/12/15",
      type: "warning",
    },
    {
      id: 2,
      title: "TDS Deposit Due",
      message: "TDS for the month of Falgun needs to be deposited by the 7th of Chaitra.",
      date: "2082/12/10",
      type: "info",
    },
    {
      id: 3,
      title: "System Update",
      message: "New reporting features have been added to the Reports section.",
      date: "2082/12/05",
      type: "success",
    },
  ];

  return (
    <Layout>
      <div className="acd-page">
        <div className="acd-notifications-list">
          {notifications.map((notif) => (
            <div key={notif.id} className={`acd-alert acd-notif-${notif.type}`}>
              <Bell className="acd-alert-icon" />
              <div>
                <h3 className="acd-alert-title">{notif.title}</h3>
                <p className="acd-alert-text">{notif.message}</p>
                <span className="acd-td-muted" style={{ fontSize: '0.8rem' }}>{notif.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
