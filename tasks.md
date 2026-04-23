You are working inside an existing Next.js (App Router) ERP project.

TECH STACK RULES (STRICT):
- MongoDB native driver ONLY (NO Mongoose)
- NO Tailwind CSS
- Use plain CSS files only (component-wise)
- Do NOT modify unrelated modules or pages
- Do NOT refactor existing architecture

🚨 CRITICAL SAFETY MODE:
- ONLY modify: app/billing/dashboard
- DO NOT touch billing logic, billing pages, or APIs unrelated to dashboard
- DO NOT use dummy/static data anywhere
- MUST replace all fake values with real MongoDB data

--------------------------------------------
GOAL:
Transform Billing Dashboard into a REAL DATA-DRIVEN ERP DASHBOARD
(with live billing insights from MongoDB)

--------------------------------------------
STEP 1: REMOVE ALL DUMMY DATA
--------------------------------------------

Remove all hardcoded values like:
- total students: 1234
- collection: Rs 2,45,678
- pending invoices: 234

Replace with real API data only.

--------------------------------------------
STEP 2: CREATE DASHBOARD API
--------------------------------------------

Create backend endpoint:

GET /api/billing/dashboard/summary

Must return:

{
  todayCollection,
  monthlyCollection,
  pendingDues,
  overdueBills,
  studentStatus: {
    paid,
    partial,
    pending
  }
}

Use MongoDB native aggregation ONLY.

Rules:
- Filter by current academic year (BS-based)
- Use paymentStatus field correctly
- Do not modify existing collections

--------------------------------------------
STEP 3: REAL RECENT ACTIVITY FEED
--------------------------------------------

Replace dummy activity section with:

GET /api/billing/dashboard/recent-bills

Show last 10 bills:
- invoiceId
- studentName
- amount
- paymentMode
- status
- createdAt

Format:
- "Hari Shrestha paid Rs 3000 via Cash"
- "Invoice INV-xxx generated"

--------------------------------------------
STEP 4: STUDENT BILL STATUS METRICS
--------------------------------------------

Replace "Total Students" with:

- Fully Paid Students
- Partially Paid Students
- Pending Students

Use MongoDB queries based on billing records.

--------------------------------------------
STEP 5: REAL TIME FILTERING CONTEXT
--------------------------------------------

All dashboard data must be filtered by:
- current academic year (BS year)

Use:
server/utils/dateConverter.cjs → getCurrentBSDate()

--------------------------------------------
STEP 6: QUICK ACTIONS (KEEP BUT IMPROVE)

Keep existing quick actions but update routes:

- Generate Academic Bill
- Generate Inventory Bill
- View Pending Bills
- View Reports
- View Overdue Students

Ensure links match actual routes.

--------------------------------------------
STEP 7: OPTIONAL ANALYTICS (IF POSSIBLE)

Create simple trend endpoint:

GET /api/billing/dashboard/trends

Return:
- last 7 days collection
- last 6 months collection

Use MongoDB aggregation pipeline.

--------------------------------------------
STEP 8: UI RULES

- No Tailwind allowed
- Use existing CSS structure
- Each dashboard section must have its own CSS file:
  - dashboard.css
  - dashboard-cards.css
  - dashboard-activity.css

--------------------------------------------
STEP 9: ERROR HANDLING

- Handle loading state
- Handle empty state
- Handle API failure gracefully

--------------------------------------------
OUTPUT RULES:
- ONLY modify dashboard-related files
- DO NOT rewrite billing system
- DO NOT modify unrelated APIs
- Clearly separate files and paths
- No dummy data allowed anywhere

--------------------------------------------
FINAL GOAL:
Convert billing dashboard into a REAL ERP control center showing:
- real-time money flow
- student payment status
- overdue tracking
- live billing activity
WITHOUT breaking existing system stability