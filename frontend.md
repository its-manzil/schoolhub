You are working on an existing Next.js project.

⚠️ VERY IMPORTANT RULES:

* ONLY work inside this folder:
  /Users/manzil/Developer/NepSof Projects/schoolhub/app/Accounting/voucher
* DO NOT modify any other files or folders
* DO NOT change global styles, layout, routing, or shared components
* DO NOT introduce Tailwind CSS (use existing CSS or CSS Modules only)

---

🎯 GOAL:
Upgrade the Voucher Entry page to a professional, production-level accounting UI.

---

🧩 CURRENT STATE:

* Voucher entry UI already exists
* Supports:

  * Voucher types (JV, RCT, PR, CN)
  * Dynamic rows
  * Debit/Credit system
  * Ledger search
  * Basic validation

---

🚀 YOUR TASK (FRONTEND IMPROVEMENTS ONLY):

## 1. Voucher Type Rules (UI Enforcement)

Implement frontend-level restrictions:

* Receipt (RCT):

  * Debit → ONLY Cash/Bank
  * Credit → Income / Receivable

* Payment (PR):

  * Debit → Expense
  * Credit → ONLY Cash/Bank

* Contra (CN):

  * ONLY Cash/Bank allowed both sides

* Journal (JV):

  * No restriction

👉 Disable invalid ledger options in dropdown OR show warning UI (no alerts)

---

## 2. Ledger Dropdown Upgrade

Improve ledger selection:

* Group ledgers by type:

  * Assets
  * Liabilities
  * Income
  * Expense
* Show type badge beside ledger name
* Highlight selected ledger
* Prevent free text invalid entries (must select from list)

---

## 3. Keyboard Navigation (IMPORTANT UX)

Add:

* TAB → move between fields
* ENTER → go to next row
* ARROW KEYS → navigate dropdown
* ESC → close dropdown

---

## 4. Auto Balance Feature

* If last row is empty:
  → Auto-fill debit/credit difference
* Show subtle UI hint (not intrusive)

---

## 5. Validation Improvements

Before posting:

* No empty ledger rows
* No zero-value rows
* Debit must equal Credit
* Show inline errors (NOT alerts)

---

## 6. Voucher Status UI

Add states:

* Draft (editable)
* Posted (locked UI)
* Disable editing when posted

---

## 7. Better Feedback UI

* Replace alert() with:

  * Toast messages OR inline status
* Show success message after posting
* Show error messages clearly

---

## 8. Date System (Preparation)

* Keep current date input
* But structure code so BS date picker can be added later

---

## 9. Code Quality

* Keep TypeScript strict
* Reuse components where possible
* Avoid unnecessary re-renders
* Do NOT break existing working features

---

## 10. UI Polish

* Improve spacing and alignment
* Add loading/disabled states
* Smooth interactions (hover, focus)

---

🎯 OUTPUT:

* Updated Voucher Entry page
* No breaking changes
* Clean, maintainable code

---

⚠️ FINAL RULE:
If unsure, DO NOT modify unrelated code. Stay strictly inside voucher module.
