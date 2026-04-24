"use client";

import React from 'react';
import Layout from '../components/Layout';
import { Bell, Clock } from "lucide-react";

const NotificationsPage = () => {
  return (
    <Layout>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 80px)',
        padding: '2rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '500px',
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #16A34A 0%, #16A34A 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            boxShadow: '0 10px 40px #166534',
          }}>
            <Clock size={48} color="white" />
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '1rem',
          }}>
            Coming Soon
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: '#64748b',
            lineHeight: 1.6,
            marginBottom: '2rem',
          }}>
            Our notifications system is being built to keep you updated on important alerts, reminders, and system updates. Stay tuned!
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: '#94a3b8',
            fontSize: '0.875rem',
          }}>
            <Bell size={16} />
            <span>You will be notified when this feature is ready</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
