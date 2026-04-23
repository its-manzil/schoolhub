You are working inside an existing Next.js (App Router) ERP project.

TECH STACK RULES (STRICT):
- MongoDB native driver ONLY (NO Mongoose)
- NO Tailwind CSS
- Use plain CSS files only
- Create separate CSS file for each component/page
- Follow existing project structure

🚨 CRITICAL SAFETY MODE:
- This page is NEW and EMPTY → you will build from scratch
- DO NOT modify unrelated pages, APIs, or components
- DO NOT refactor existing architecture
- DO NOT touch billing/inventory-rate-setup or other modules
- ONLY work inside:
  app/billing/inventory-billing

--------------------------------------------
GOAL:
Build a complete Inventory Billing system with:
- clean modular components
- ledger-aware inventory selection
- VAT / PAN billing support
- bill preview + print flow
- MongoDB storage integration

--------------------------------------------
PAGE STRUCTURE (COMPONENT BASED)
--------------------------------------------

Create modular components:

1. InventoryBillingPage (main page)
2. AcademicSelector
3. StudentSelector
4. InventorySelector
5. BillSummaryPreviewModal
6. PaymentMethodSelector

Each component MUST have its own CSS file.

--------------------------------------------
STEP 1: ACADEMIC + CLASS FLOW
--------------------------------------------

Flow:
1. Select Academic Year
2. Select Class
3. Select Section
4. Select Student

Data must be fetched dynamically from existing APIs.

--------------------------------------------
STEP 2: INVENTORY SELECTION (IMPORTANT)
--------------------------------------------

After student selection:

- Fetch inventories based on:
  - schoolId
  - academicYear

For each inventory:

IF hasVariants = true:
- Show variant dropdown (size/label)
- Example: S, M, L, XL OR shoe sizes

IF hasVariants = false:
- Show single item price

User must be able to:
- select inventory
- select variant (if exists)
- enter quantity

Add multiple items per bill using:
[ Add Item ] button

--------------------------------------------
STEP 3: BILL TYPE SELECTION
--------------------------------------------

Add selection:
- PAN Bill → no VAT
- VAT Bill → add 13% VAT

IMPORTANT:
- VAT must only be calculated if billType === "VAT"
- PAN bill must NOT include VAT in any calculation or storage

--------------------------------------------
STEP 4: PAYMENT METHOD
--------------------------------------------

Allow selection:
- Cash
- Cheque
- Bank Transfer

Store paymentMode in database

--------------------------------------------
STEP 5: BILL PREVIEW MODAL (CRITICAL)
--------------------------------------------

On "Generate Bill" click:

Open modal showing:

- Item list (inventory + variant + qty + rate + total)
- Subtotal
- VAT (if applicable)
- Final Total
- Payment method

Buttons:
- Confirm & Save
- Cancel

--------------------------------------------
STEP 6: SAVE TO DATABASE (MONGODB)
--------------------------------------------

On Confirm:
- Save bill to MongoDB using native driver

Structure:

{
  schoolId,
  academicYear,
  studentId,
  studentName,
  className,
  section,
  billType: "PAN" | "VAT",
  items: [
    {
      inventoryId,
      name,
      variant,
      qty,
      rate,
      amount
    }
  ],
  subTotal,
  vatRate,
  vatAmount,
  totalAmount,
  paymentMode,
  createdAt
}

--------------------------------------------
STEP 7: PRINT FLOW (IMPORTANT)
--------------------------------------------

After successful save:
- open bill in NEW TAB
- reuse structure similar to:
  /billing/collection-report print view

Must allow:
- print button
- clean invoice format

--------------------------------------------
STEP 8: ERROR HANDLING (IMPORTANT FIX CONTEXT)
--------------------------------------------

- Ensure MongoDB connection uses NEXT.JS .env.local
- Do NOT rely on server/.env
- Add proper error logging in API routes
- Handle 500 errors gracefully

--------------------------------------------
CSS REQUIREMENTS
--------------------------------------------

Each component must have:
- its own CSS file
- clean layout
- no Tailwind usage

Example:
- InventoryBillingPage.css
- InventorySelector.css
- BillPreviewModal.css

--------------------------------------------
OUTPUT RULES:
- ONLY generate code for this feature
- Clearly separate components and files
- Mention file paths for every file
- DO NOT modify unrelated modules
- DO NOT rewrite existing billing system

--------------------------------------------
FINAL GOAL:
Build a modular, scalable Inventory Billing system with:
- multi-item billing
- variant support
- VAT/PAN logic
- clean preview modal
- print-ready invoice
- MongoDB storage (native driver)
WITHOUT breaking existing ERP system