You are working inside an existing Next.js (App Router) ERP project.

TECH STACK RULES (STRICT):
- MongoDB native driver ONLY (NO Mongoose)
- NO Tailwind CSS
- Use plain CSS only (light mode UI required)
- DO NOT modify unrelated modules or billing logic

🚨 CRITICAL SAFETY MODE:
- ONLY modify: app/billing/dashboard
- DO NOT break inventory billing or academic billing systems
- DO NOT remove existing APIs
- ONLY enhance dashboard layer

--------------------------------------------
GOAL:
Fix and upgrade Billing Dashboard into a FULL ERP ANALYTICS DASHBOARD:
- includes INVENTORY + ACADEMIC billing data
- light mode UI
- proper charts + graphs
- modular components
- no dummy data

--------------------------------------------
STEP 1: FIX DATA ISSUE (CRITICAL)
--------------------------------------------

CURRENT ISSUE:
Dashboard only shows INVENTORY billing data.

FIX:
Create unified aggregation in:

GET /api/billing/dashboard/summary

Must combine:

1. inventory billing collection
2. academic billing collection

Rules:
- merge both datasets logically
- calculate:
  - total revenue
  - pending dues
  - paid amount
- filter by current academic year (BS-based)

DO NOT exclude academic bills.

--------------------------------------------
STEP 2: UNIFIED BILL MODEL IN DASHBOARD
--------------------------------------------

Normalize both systems into:

{
  type: "inventory" | "academic",
  studentId,
  studentName,
  amount,
  paymentStatus,
  createdAt
}

--------------------------------------------
STEP 3: COMPONENT ARCHITECTURE (MANDATORY)
--------------------------------------------

Split dashboard into components:

1. DashboardPage.tsx
2. BillingStatsCards.tsx
3. BillingChartSection.tsx
4. RecentBillingActivity.tsx
5. QuickActionsPanel.tsx

Each MUST have separate CSS file:
- dashboard.css
- stats-cards.css
- charts.css
- activity.css
- quick-actions.css

--------------------------------------------
STEP 4: LIGHT MODE UI (MANDATORY)
--------------------------------------------

- Use clean white background
- Soft borders
- Light gray cards
- No dark theme styles
- Professional ERP look

Colors:
- background: #ffffff
- card: #f9fafb
- border: #e5e7eb
- text: #111827

--------------------------------------------
STEP 5: CHARTS & GRAPHS (IMPORTANT)
--------------------------------------------

Create BillingChartSection:

Charts required:
1. Line Chart → last 7 days collection
2. Bar Chart → monthly collection trend
3. Pie Chart → Paid vs Pending ratio

Rules:
- MUST use real MongoDB aggregated data
- NO dummy datasets
- Charts must update dynamically

--------------------------------------------
STEP 6: RECENT ACTIVITY (FIX)
--------------------------------------------

Combine:
- inventory bills
- academic bills

Show last 10 transactions:
- invoiceId
- studentName
- amount
- type (academic/inventory)
- status
- createdAt

--------------------------------------------
STEP 7: QUICK ACTIONS
--------------------------------------------

Keep but enhance:
- Generate Academic Bill
- Generate Inventory Bill
- View Pending Dues
- View Reports
- View Overdue Students

--------------------------------------------
STEP 8: ERROR HANDLING
--------------------------------------------

- loading states for charts
- empty state messages
- API failure fallback UI

--------------------------------------------
STEP 9: BACKEND REQUIREMENTS

DO NOT touch existing billing APIs.

Only add:
GET /api/billing/dashboard/summary
GET /api/billing/dashboard/trends
GET /api/billing/dashboard/activity

Use MongoDB native aggregation only.

--------------------------------------------
OUTPUT RULES:
- ONLY modify dashboard module
- DO NOT break existing billing systems
- DO NOT use dummy data anywhere
- MUST include academic + inventory billing data
- MUST implement light mode UI
- MUST use separate components + CSS files

--------------------------------------------
FINAL GOAL:
Create a production-grade ERP billing dashboard:
- unified academic + inventory data
- real-time financial insights
- charts + analytics
- clean light mode UI
- modular architecture
WITHOUT breaking existing system