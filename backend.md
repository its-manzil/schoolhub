You are working on an existing Node.js backend.

⚠️ VERY IMPORTANT RULES:

* ONLY work inside this folder:
  /Users/manzil/Developer/NepSof Projects/schoolhub/server/pages/Voucher
* DO NOT modify any other modules or global configs
* DO NOT introduce Mongoose
* Use native MongoDB driver or existing DB utility
* Do NOT break existing APIs

---

🎯 GOAL:
Build a production-ready Voucher Engine backend for accounting.

---

🧩 REQUIREMENTS:

## 1. Data Model (MongoDB - No Mongoose)

Design collections:

### vouchers

* _id
* voucherNo (unique)
* type (JV, RCT, PR, CN)
* date
* fiscalYear
* refNo
* narration
* status (draft | posted)
* totalDebit
* totalCredit
* createdAt
* updatedAt

### voucherEntries

* _id
* voucherId (reference)
* ledgerId
* ledgerName
* debit
* credit
* description

---

## 2. Voucher Number Generator

* Format:
  TYPE-FY-0001 (e.g. RCT-2082-0001)
* Must:

  * Auto increment
  * Unique per type + fiscal year
* Store sequence safely in DB

---

## 3. Core APIs

### Create Draft Voucher

POST /voucher/create

* Save voucher as "draft"

---

### Update Voucher

PUT /voucher/:id

* Only allowed if status = draft

---

### Post Voucher

POST /voucher/:id/post

VALIDATIONS:

* Debit === Credit
* At least 2 entries
* No empty ledger
* No zero rows

LOCK:

* Once posted → cannot edit

---

### Get Voucher

GET /voucher/:id

---

### List Vouchers

GET /voucher

* Add pagination
* Filter by type/date/status

---

## 4. Business Rules (CRITICAL)

### Receipt (RCT)

* Debit → Cash/Bank
* Credit → Income/Receivable

### Payment (PR)

* Debit → Expense
* Credit → Cash/Bank

### Contra (CN)

* Only Cash/Bank allowed

### Journal (JV)

* No restriction

👉 Validate using ledger type

---

## 5. Transaction Safety

* Use MongoDB transactions if available
* Ensure:

  * Voucher + entries saved together

---

## 6. Error Handling

* Proper status codes
* Structured error response:
  {
  success: false,
  message: "...",
  errors: []
  }

---

## 7. Future Ready

Structure code so later we can add:

* Ledger balance updates
* Audit logs
* Multi-user system

---

## 8. Folder Structure

Inside Voucher folder:

* controller.js / ts
* service.js / ts
* routes.js / ts
* validation.js / ts
* model logic (no mongoose)

---

## 9. Code Quality

* Clean separation (controller → service → db)
* Async/await
* No duplicated logic

---

🎯 OUTPUT:

* Fully working voucher module backend
* Clean APIs
* No impact on other modules

---

⚠️ FINAL RULE:
Stay strictly inside the Voucher module. Do not touch unrelated files.
