"use client";

import React from 'react';
import AdmLayout from "../components/AdmLayout";
import { FileText, Clock, Construction } from "lucide-react";

export default function Templates() {
  return (
    <AdmLayout>
      <div className="coming-soon-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
          boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)'
        }}>
          <Construction size={56} color="white" />
        </div>

        <h1 style={{
          fontSize: '36px',
          fontWeight: '700',
          color: '#1a202c',
          marginBottom: '16px'
        }}>
          Coming Soon
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#718096',
          maxWidth: '500px',
          lineHeight: '1.6',
          marginBottom: '32px'
        }}>
          The Templates Library is under development. Soon you&apos;ll be able to download and manage standard school document templates for your institution.
        </p>

        <div style={{
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: '#f7fafc',
            borderRadius: '8px',
            color: '#4a5568',
            fontSize: '14px'
          }}>
            <FileText size={18} />
            <span>Academic Templates</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: '#f7fafc',
            borderRadius: '8px',
            color: '#4a5568',
            fontSize: '14px'
          }}>
            <Clock size={18} />
            <span>Finance Templates</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: '#f7fafc',
            borderRadius: '8px',
            color: '#4a5568',
            fontSize: '14px'
          }}>
            <FileText size={18} />
            <span>Admin Templates</span>
          </div>
        </div>

        <div style={{
          marginTop: '48px',
          padding: '16px 24px',
          backgroundColor: '#ebf8ff',
          borderRadius: '8px',
          border: '1px solid #bee3f8'
        }}>
          <p style={{
            margin: 0,
            color: '#2b6cb0',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Stay tuned for updates!
          </p>
        </div>
      </div>
    </AdmLayout>
  );
}
