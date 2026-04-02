"use client";

import React from 'react';
import Layout from '../components/Layout';
import { ArrowRight, Info, Plus } from "lucide-react";
import './VoucherEntry.css';

const VoucherEntry = () => {
  const voucherTypes = [
    {
      title: "Journal Voucher",
      code: "JV",
      icon: "📒",
    },
    {
      title: "Receipt Voucher",
      code: "RCT",
      icon: "💰",
    },
    {
      title: "Payment Voucher",
      code: "PR",
      icon: "💸",
    },
    {
      title: "Contra Voucher",
      code: "CN",
      icon: "🏦",
    },
  ];

  return (
    <Layout>
      <div className="ve-page">
        {/* Voucher Cards */}
        <div className="ve-cards-grid">
          {voucherTypes.map((type, idx) => (
            <div key={idx} className="ve-card">
              <div className="ve-card-icon">{type.icon}</div>
              <h2 className="ve-card-title">{type.title}</h2>
              <p className="ve-card-code">Prefix: {type.code}</p>
              <button className="ve-card-btn">
                New Voucher <Plus className="ve-btn-icon" />
              </button>
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div className="ve-coming-soon">
          <Info className="ve-coming-icon" />
          <h3 className="ve-coming-title">Voucher Approval Workflow</h3>
          <p className="ve-coming-text">
            All vouchers require approval from the Senior Accountant or Principal before they are posted to the general ledger.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default VoucherEntry;
