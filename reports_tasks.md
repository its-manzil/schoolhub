✅ ERP-GRADE PROMPT (REPORTING + ACCOUNTING ENGINE UPGRADE)
📍 TARGET PATH (DO NOT CHANGE)

Work ONLY inside:

/app/Accounting/reports

Specifically:

ReportsDashboard.tsx (main page)
/reports/components/* (new modular components)
/reports/services/* (data + accounting engine logic)
/reports/hooks/* (state + fetching logic)

❗ DO NOT modify unrelated Accounting pages.

⚠️ CRITICAL RULES (HARD CONSTRAINTS)
❌ DO NOT delete existing UI logic blindly
❌ DO NOT break current routing structure
❌ DO NOT remove current report cards UI
❌ DO NOT hardcode financial calculations in UI layer
❌ DO NOT mix billing, inventory, and voucher logic in one file
❌ DO NOT fetch data inside UI components directly
❌ ALL financial logic must be moved to services layer
❌ MUST support both:
bills collection (student billing)
inventory_bills collection
vouchers collection
❌ MUST NOT assume backend is complete → build resilient fallback logic
🎯 OBJECTIVE

Transform this page:

http://localhost:3000/Accounting/reports

Into an:

🏛️ ERP-GRADE REPORTING SYSTEM

That supports:

📊 Financial Reports (AUTO-GENERATED)
Balance Sheet
Profit & Loss Statement
Cash Flow Statement
Trial Balance
🔄 DATA SOURCES (MANDATORY)

Must combine data from:

1. Voucher System
Journal entries
Debit/Credit postings
2. Student Billing (bills)
Revenue recognition
Fee income
3. Inventory Sales (inventory_bills)
Cost of goods sold (COGS)
Inventory reduction
Sales income
🧠 CORE ARCHITECTURE (MANDATORY)

Refactor into modular system:

1. /reports/services/accountingEngine.ts

Must include:

Functions:
getLedgerEntries()
calculateTrialBalance()
generateProfitLoss()
generateBalanceSheet()
generateCashFlow()
normalizeBillingData()
normalizeInventoryData()
2. /reports/services/dataAggregator.ts

Responsibilities:

Fetch from:
vouchers API
bills table
inventory_bills table
Merge into unified accounting dataset
Ensure schoolId consistency (STRING ONLY)
3. /reports/hooks/useFinancialReports.ts

Must handle:

loading state
caching
memoized calculations
refresh trigger
4. /reports/components/

Split UI into:

ReportCards.tsx
ReportFilters.tsx
ReportViewer.tsx
RecentReports.tsx
ExportPanel.tsx
🧭 SINGLE PAGE MINI NAVIGATION SYSTEM

Replace page navigation with INTERNAL MINI NAVBAR:

Tabs:

Overview
Balance Sheet
Profit & Loss
Cash Flow
Trial Balance

❗ NO PAGE NAVIGATION (no router.push for reports views)

Everything must switch via:

useState(activeReportTab)
📦 DATA NORMALIZATION RULES
Billing (bills)

Must map into:

Income Account: Student Fees
Cash/Receivable depending on paymentStatus
VAT handling if exists
Inventory (inventory_bills)

Must map into:

Sales Revenue
COGS (calculated from inventory cost)
Inventory reduction logic
Voucher System

Must remain PRIMARY source of journal truth

📊 ACCOUNTING ENGINE RULES
MUST implement double-entry logic:

Every transaction MUST generate:

Debit entry
Credit entry

Ensure:

Total Debits === Total Credits
Profit & Loss Must include:
Revenue:
Student fees
Inventory sales
Expenses:
COGS
Voucher expenses
Balance Sheet Must include:
Assets:
Cash
Inventory
Receivables
Liabilities:
Payables
Unearned income
Equity:
Retained earnings
Cash Flow Must include:
Operating activities (billing + vouchers)
Investing (inventory changes)
Financing (manual vouchers)
Trial Balance Must:
Aggregate ALL ledger accounts
Validate debit/credit equality
Show imbalance warning if mismatch
🚀 PERFORMANCE REQUIREMENTS
Use useMemo for all calculations
Cache aggregated data
Avoid re-fetching on tab switch
Batch API calls
Debounce refresh button
🔐 SCHOOL ISOLATION RULE

❗ ALL DATA MUST FILTER BY:

schoolId: string
NEVER use number
ALWAYS convert incoming IDs to string
🧾 UI REQUIREMENTS

Keep existing UI structure but improve:

Report cards remain same design
Add mini tab system inside report view
Add loading skeleton
Add export buttons (PDF/CSV ready hooks)
Add “Last Updated Timestamp”
📡 FUTURE EXTENSION READY

Architecture must support:

Multi-school system
Multi-year financial comparison
Audit logs
Ledger drill-down
⚡ FINAL GOAL

After refactor:

Reports page becomes real ERP accounting engine
All financial statements are auto-generated from live transactional data
No hardcoded report values
Fully modular + scalable system