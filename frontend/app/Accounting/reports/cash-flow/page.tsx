"use client";

import React from "react";
import ReportViewTemplate from "../report_view_template";

const CashFlowPage = () => {
  const sections = [
    {
      title: "Operating Activities",
      items: [
        { name: "Cash Receipts from Students", amount: 9500000 },
        { name: "Cash Paid to Staff", amount: -4100000 },
        { name: "Cash Paid to Suppliers", amount: -750000 },
      ],
      total: 4650000
    },
    {
      title: "Investing Activities",
      items: [
        { name: "Purchase of Fixed Assets", amount: -1500000 },
        { name: "Sale of Old Furniture", amount: 45000 },
      ],
      total: -1455000
    },
    {
      title: "Financing Activities",
      items: [
        { name: "Loan Repayment", amount: -500000 },
        { name: "Interest Paid", amount: -45000 },
      ],
      total: -545000
    },
    {
      title: "Net Cash Movement",
      items: [
        { name: "Net Increase in Cash", amount: 2650000, isTotal: true },
        { name: "Opening Cash Balance", amount: 850000 },
        { name: "Closing Cash Balance", amount: 3500000, isTotal: true },
      ]
    }
  ];

  return (
    <ReportViewTemplate 
      title="Cash Flow Statement" 
      reportType="Cash Flow" 
      sections={sections} 
    />
  );
};

export default CashFlowPage;
