"use client";

import React from "react";
import ReportViewTemplate from "../report_view_template";

const BalanceSheetPage = () => {
  const sections = [
    {
      title: "Assets",
      items: [
        { name: "Fixed Assets", amount: 12500000 },
        { name: "Current Assets", amount: 2500000 },
        { name: "Cash at Bank", amount: 1800000, isSub: true },
        { name: "Accounts Receivable", amount: 700000, isSub: true },
      ],
      total: 15000000
    },
    {
      title: "Liabilities",
      items: [
        { name: "Long Term Loans", amount: 4500000 },
        { name: "Current Liabilities", amount: 1200000 },
        { name: "Accounts Payable", amount: 800000, isSub: true },
        { name: "Salaries Payable", amount: 400000, isSub: true },
      ],
      total: 5700000
    },
    {
      title: "Equity",
      items: [
        { name: "Share Capital", amount: 8000000 },
        { name: "Retained Earnings", amount: 1300000 },
      ],
      total: 9300000
    }
  ];

  return (
    <ReportViewTemplate 
      title="Balance Sheet" 
      reportType="Financial Statement" 
      sections={sections} 
    />
  );
};

export default BalanceSheetPage;
