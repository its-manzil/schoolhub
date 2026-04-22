You are working on a **Next.js (App Router) full-stack project** using:

* React (Client Components where needed)
* MongoDB (NO mongoose)
* Plain CSS (NO Tailwind, NO inline chaos)
* Modular architecture

Your task is to build a **complete BILL GENERATION & MANAGEMENT SYSTEM**.

⚠️ CRITICAL RULES (DO NOT BREAK):

* DO NOT modify any unrelated files
* ONLY create files inside `/app/Billing/bill-generate`
* DO NOT use Tailwind CSS
* DO NOT use mongoose
* MUST use schoolId in EVERY query (multi-tenant system)
* MUST separate components and CSS properly
* MUST write clean, production-ready code (no hacks)

---

## 📍 PAGE LOCATION:

Create page at:

`http://localhost:3000/Billing/bill-generate`

---

## 🎯 MAIN GOAL:

Build a **complete school billing system** where user can:

1. Select Academic Year
2. Select Class
3. Select Students
4. Select Fee Components (custom per student)
5. Enter Quantity
6. Generate Bill
7. Store Bill in DB
8. Print Bill (A5 format)
9. Manage Payment (Cash / Online / Cheque)
10. View All Generated Bills

---

## 🏗️ FOLDER STRUCTURE:

Create:

/app/Billing/bill-generate/
│
├── page.tsx
├── BillGenerateLayout.tsx
├── bill-generate.css
│
├── components/
│   ├── Navbar/
│   │   ├── BillNavbar.tsx
│   │   ├── BillNavbar.css
│   │
│   ├── Filters/
│   │   ├── AcademicYearSelector.tsx
│   │   ├── AcademicYearSelector.css
│   │   ├── ClassSelector.tsx
│   │   ├── ClassSelector.css
│   │
│   ├── Students/
│   │   ├── StudentSelector.tsx
│   │   ├── StudentSelector.css
│   │
│   ├── Components/
│   │   ├── ComponentSelector.tsx
│   │   ├── ComponentSelector.css
│   │
│   ├── Bill/
│   │   ├── BillPreview.tsx
│   │   ├── BillPreview.css
│   │   ├── BillTable.tsx
│   │   ├── BillTable.css
│   │   ├── PaymentSection.tsx
│   │   ├── PaymentSection.css
│   │
│   ├── Records/
│   │   ├── BillList.tsx
│   │   ├── BillList.css
│
├── utils/
│   ├── invoiceUtils.ts
│
-

## 🧭 MINI NAVBAR (INSIDE PAGE)

Create top navbar with sections:

* Generate Bill
* Bill Records

Switch view without routing (use state toggle)

---

## 📊 DATABASE STRUCTURE (MANDATORY)

Collection: bills

{
invoiceId: string,
schoolId: number,
studentId: string,
studentName: string,
className: string,
academicYear: string,

components: [
{
name: string,
qty: number,
rate: number,
amount: number
}
],

subTotal: number,
vatRate: number,
vatAmount: number,
totalAmount: number,

paymentMode: "cash" | "online" | "cheque",
paymentStatus: "paid" | "pending",
chequeNo?: string,

createdAt: Date,
createdAtBS: string,

isLocked: true
}

---

## 📡 DATA SOURCES (USE THESE)

1. fee_components
   → filter by:
   schoolId + academicYear

2. schools
   → filter by:
   schoolId

3. students
   → filter by:
   schoolId + className

4. tax_setting
   → filter by:
   schoolId

---

## 🧠 LOGIC FLOW (STRICT)

STEP 1: Academic Year

* Dropdown
* Load from backend

STEP 2: Class

* Static Class 1–12

STEP 3: Students

* Fetch using:
  className + schoolId
* Multi-select supported

STEP 4: Components

* Fetch from fee_components
* Show checkbox list
* Allow manual selection (important)

STEP 5: Quantity Input

* Each selected component must have qty input

---

## 🚨 BILL GENERATION RULES

When user clicks "Generate Bill":

FOR EACH SELECTED STUDENT:

1. CHECK EXISTING BILL
   findOne({
   studentId,
   academicYear,
   schoolId
   })

IF EXISTS:
→ Show error:
"Bill already exists for this student"

DO NOT CREATE AGAIN

---

2. CALCULATE:

amount = qty × rate

subTotal = sum(all amounts)

vatRate = from tax_setting

vatAmount = subTotal × vatRate / 100

totalAmount = subTotal + vatAmount

---

3. GENERATE INVOICE ID:

Format:
INV-{BS_YEAR}-{schoolId}-{studentId}-{random}

---

4. DATE:

Use:
getCurrentBSDate()

---

5. PAYMENT:

IF:

* Cash → paid
* Online → paid
* Cheque → pending

IF Cheque:
→ require cheque number

---

6. SAVE TO DATABASE

---

## 🖨️ BILL PRINTING

* Use template:
  `/app/Billing/bill-generate/component/billtamplet.html`

* Must:
  ✔ Fit A5 paper
  ✔ Be print-friendly
  ✔ Black & white

---

## 📄 BILL RECORDS SECTION

Create table:

Columns:

* Invoice ID
* Student Name
* Class
* Amount
* Payment Status
* Date (BS)
* Actions

Actions:

* View
* Print
* Mark as Paid (if cheque pending)

---

## 🔐 ROLE CONTROL

Allow:

* schooladmin
* billing

Only these roles can:

* Generate bill
* Mark paid

---

## 📅 DATE HANDLING

Use:
server/utils/dateConverter.cjs

---

## 🎨 UI DESIGN RULES

* Clean layout
* Card-based sections
* Table for data
* Proper spacing
* No Tailwind
* Use CSS variables if needed

---

## 🚀 ADVANCED FEATURES (ADD THESE)

1. Bulk Bill Generation (Class-wise)

2. Optional Components (Bus, Hostel etc.)
   → user selects manually

3. Invoice Locking
   → once created, cannot edit

4. Payment Update System

5. Error handling UI

---

## 🧠 UTIL FUNCTIONS

Create:

invoiceUtils.ts

Include:

* generateInvoiceId()
* calculateTotals()
* numberToWords()

---

## ⚠️ FINAL REQUIREMENTS

* Fully working UI + backend
* No dummy data
* Fully dynamic
* Clean component structure
* Separate CSS for EACH component
* No breaking other pages

---

## 🎯 FINAL GOAL:

Build a **real-world production-ready billing system** for schools that:

✔ Handles multiple schools
✔ Prevents data conflict
✔ Generates invoices
✔ Supports Nepal BS date
✔ Supports VAT
✔ Handles payment tracking
✔ Works flawlessly

This must be a **10/10 professional system**
