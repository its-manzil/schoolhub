"use client";

import React from "react";
import ReportViewTemplate from "../report_view_template";

const TrialBalancePage = () => {
  const sections = [
    {
      title: "Debit Balances",
      items: [
        { name: "Fixed Assets (WDV)", amount: 12500000 },
        { name: "Cash and Bank Balances", amount: 3500000 },
        { name: "Staff Salaries Account", amount: 4200000 },
        { name: "Office Rent", amount: 450000 },
        { name: "Utilities & Fuel", amount: 180000 },
      ],
      total: 20830000
    },
    {
      title: "Credit Balances",
      items: [
        { name: "School Fee Income", amount: 9950000 },
        { name: "Share Capital", amount: 8000000 },
        { name: "Bank Loan (Secured)", amount: 2880000 },
      ],
      total: 20830000
    }
  ];

  return (
    <ReportViewTemplate 
      title="Trial Balance" 
      reportType="Ledger Summary" 
      sections={sections} 
    />
  );
};

export default TrialBalancePage;
