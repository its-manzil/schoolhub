TASK: Build Billing Settings page from scratch in Next.js (App Router)

ROUTE:
http://localhost:3000/Billing/Settings

FILE TO CREATE:
app/Billing/Settings/page.tsx

IMPORTANT: 
- DO NOT modify ANY other existing files outside /app/Billing/Settings
- DO NOT refactor global layouts, navbars, or other modules
- ONLY create files inside:
  app/Billing/Settings/
- Use plain CSS (NO Tailwind)
- Use MongoDB (NO mongoose)
- Keep everything SIMPLE, CLEAN, and CONTROLLED

────────────────────────────
GOAL
────────────────────────────
Create a Billing Settings system with 4 sections:

1. School Information  
2. Configure Components  
3. Manage Fee  
4. View Bill  

This page must work for BOTH roles:
- schooladmin
- billing

────────────────────────────
CORE REQUIREMENTS
────────────────────────────

1. USER & SCHOOL DETECTION
- Get user from localStorage
- Extract:
  - role
  - schoolId
  - schoolName
- STORE schoolId in every API request
- This ensures multi-school data isolation (VERY IMPORTANT)

────────────────────────────

2. PAGE STRUCTURE

Inside page.tsx create a simple layout:

HEADER (top)
- Show:
  - School Name
  - School ID
  - "Billing Settings"

LEFT SIDE (or top tabs):
- School Information
- Configure Components
- Manage Fee
- View Bill

Use simple tab switching (useState)

────────────────────────────

3. COMPONENT STRUCTURE

Create folder:
app/Billing/Settings/components/

Create these components:

--------------------------------
A. SchoolInfoSection.tsx
--------------------------------
- Display:
  - School Name (readonly)
  - School ID (readonly)
  - Phone Number (editable)
  - Email (editable)

- Both roles (schooladmin + billing) CAN edit phone & email

- Button:
  [Save School Info]

- API:
  PUT /api/fee-management/school-info

- Send:
  {
    schoolId,
    phone,
    email
  }

CSS:
SchoolInfoSection.css

--------------------------------
B. ConfigureComponentsSection.tsx
--------------------------------
- Input to add new fee component
  Example:
  Admission Fee, Bus Fee, Lab Fee, etc.

- List all components

- Add / Remove components

- Save button:
  [Save Components]

- API:
  POST /api/fee-management/components

- Send:
  {
    schoolId,
    academicYear,
    components: [{ id, name }]
  }

CSS:
ConfigureComponentsSection.css

--------------------------------
C. ManageFeeSection.tsx
--------------------------------
- Dropdown:
  Academic Year

- Dropdown:
  Class (Class 1–12)

- For selected class:
  Show all fee components with input fields

Example:
Admission Fee → 1000  
Bus Fee → 2000  

- Button:
  [Save Fees]

- API:
  POST /api/fee-management/class-fees

- Send:
  {
    schoolId,
    academicYear,
    className,
    fees: { componentId: amount }
  }

IMPORTANT:
- Use component ID as key (NOT name)

CSS:
ManageFeeSection.css

--------------------------------
D. ViewBillSection.tsx
--------------------------------
- Filters:
  - Academic Year
  - Class
  - Component

- Button:
  [Generate Bill]

- API:
  GET /api/fee-management/bill-preview

- Show:
  - School Name
  - Academic Year
  - Class-wise fee breakdown
  - Total per class
  - Grand Total

CSS:
ViewBillSection.css

────────────────────────────

4. DATA RULES (VERY IMPORTANT)

- ALL data MUST be filtered by schoolId
- NEVER mix data between schools
- Always send schoolId in API request

────────────────────────────

5. UI RULES

- Clean card-based UI
- No Tailwind
- Use CSS files per component
- Show:
  - Loading states
  - Success message
  - Error message

────────────────────────────

6. SIMPLICITY RULE (IMPORTANT)

- DO NOT over-engineer
- DO NOT create unnecessary hooks or services
- DO NOT modify global layouts
- DO NOT create backend code
- ONLY frontend implementation

────────────────────────────

FINAL EXPECTATION

- Fully working Billing Settings page
- Clean UI
- Correct role handling
- Proper schoolId isolation
- Modular components
- No unrelated file changes

This should feel like a real school ERP billing setup page.