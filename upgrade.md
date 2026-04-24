ERP-GRADE UPGRADE PROMPT (ADD INCOME STATEMENT)
📍 TARGET FILE / PAGE

Work ONLY inside:

/app/Accounting/reports

Main file:

ReportsDashboard.tsx

New additions allowed only inside:

/reports/services/*
/reports/components/*
/reports/hooks/*

❗ DO NOT modify any other Accounting modules.

⚠️ STRICT RULES (DO NOT BREAK SYSTEM)
❌ Do NOT remove existing report cards
❌ Do NOT change routing system already present
❌ Do NOT break Balance Sheet / P&L / Cash Flow / Trial Balance
❌ Do NOT hardcode financial values in UI
❌ ALL financial logic MUST be in /services layer
❌ Do NOT duplicate logic already used in P&L or Balance Sheet
❌ MUST ensure backward compatibility with current reports UI
❌ MUST NOT change database schema
❌ MUST NOT assume backend API changes
🎯 OBJECTIVE

Enhance the existing reports system by adding a missing ERP financial layer:

📊 INCOME STATEMENT MODULE (NEW REQUIRED FEATURE)

This system currently lacks a proper Income Statement layer.

You must implement it as a separate structured accounting module that feeds into Profit & Loss.

📁 NEW FILE TO CREATE
/reports/services/incomeStatement.ts

Must export:

generateIncomeStatement(data: AccountingData)
🧠 DATA SOURCES (MANDATORY)

Income Statement must aggregate from:

1. Student Billing (bills)
Revenue = totalAmount
Payment status must be "paid"
2. Inventory Sales (inventory_bills)
Revenue = totalAmount
COGS must be calculated from inventory item cost logic (if available)
3. Vouchers
Expense entries only (PR, JV, PV types)
Must map debit-side expense accounts
📊 INCOME STATEMENT STRUCTURE

Must return:

{
  revenue: {
    studentFees: number,
    inventorySales: number,
    totalRevenue: number
  },
  expenses: {
    cogs: number,
    voucherExpenses: number,
    totalExpenses: number
  },
  netIncome: number
}
🔄 ACCOUNTING FLOW (IMPORTANT)

Update internal accounting pipeline:

Bills + Inventory Bills + Vouchers
            ↓
     Income Statement (NEW LAYER)
            ↓
     Profit & Loss Statement
            ↓
      Balance Sheet Update
🧩 INTEGRATION REQUIREMENTS
1. Update Accounting Engine

Inside:

/reports/services/accountingEngine.ts

Add:

import generateIncomeStatement
integrate it into:
generateProfitLoss()
RULE:

Profit & Loss must now be derived FROM Income Statement, not directly from raw data.

2. Update UI (ReportsDashboard)

Add new report card:

{
  id: "income-statement",
  title: "Income Statement",
  desc: "Structured breakdown of revenue and expenses before net profit calculation.",
  icon: <Activity />,
  route: "./income-statement",
  color: "#0ea5e9",
  bg: "#e0f2fe"
}
3. OPTIONAL UI TAB (if supported in report viewer)

If internal report viewer uses tabs:
Add:

Income Statement tab between:
Cash Flow
Profit & Loss
⚙️ PERFORMANCE RULES
Use useMemo for calculations
Avoid recalculating income statement on every render
Cache billing + inventory aggregation
Batch data processing inside service layer only
🔐 SCHOOL FILTER RULE

All calculations MUST strictly filter by:

schoolId: string

❗ Convert any numeric schoolId to string before processing.

📦 OUTPUT EXPECTATION

After implementation:

Reports system must now support:
Balance Sheet ✔
Cash Flow ✔
Trial Balance ✔
Profit & Loss ✔
Income Statement ⭐ NEW (FULLY FUNCTIONAL)
🚀 FINAL GOAL

Turn this reporting module into:

🏛️ ERP-GRADE ACCOUNTING ENGINE with proper financial hierarchy and audit-ready structure