"use client";

import React from "react";
import ReportViewTemplate from "../report_view_template";

const ProfitLossPage = () => {
  const sections = [
    {
      title: "Income",
      items: [
        { name: "Tuition Fees", amount: 8500000 },
        { name: "Admission Fees", amount: 450000 },
        { name: "Exam Fees", amount: 250000 },
        { name: "Transport Fees", amount: 600000 },
        { name: "Other Income", amount: 150000 },
      ],
      total: 9950000
    },
    {
      title: "Expenses",
      items: [
        { name: "Staff Salaries", amount: 4200000 },
        { name: "Administrative Costs", amount: 850000 },
        { name: "Maintenance & Repairs", amount: 350000 },
        { name: "Electricity & Utilities", amount: 120000 },
        { name: "Marketing & Ads", amount: 80000 },
        { name: "Depreciation Expense", amount: 250000 },
      ],
      total: 5850000
    },
    {
      title: "Net Profit / (Loss)",
      items: [
        { name: "Net Surplus for the Period", amount: 4100000, isTotal: true },
      ]
    }
  ];

  return (
    <ReportViewTemplate 
      title="Profit & Loss Statement" 
      reportType="Income Statement" 
      sections={sections} 
    />
  );
};

export default ProfitLossPage;
