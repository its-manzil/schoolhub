You are working on a Next.js (App Router) ERP system.

🎯 TASK:
Update the page:
`/app/billing/inventory-rate-setup`

Convert this page into a **READ-ONLY Inventory Overview page** that fetches and displays inventory data from the Accounting module.

---

## ⚠️ SAFETY RULES (STRICT)

1. DO NOT delete this page or its folder
2. DO NOT modify any unrelated files
3. DO NOT change backend APIs unless absolutely required
4. DO NOT break existing billing flow
5. You are ONLY allowed to:

   * Refactor this page
   * Create small reusable components inside the same folder (if needed)
   * Add CSS file(s) for styling

---

## 🔁 PAGE PURPOSE CHANGE

This page is NO LONGER:
❌ Inventory Rate Setup
❌ Editable page

This page MUST BE:
✅ Inventory Overview (READ-ONLY)
✅ Data comes from Accounting Inventory system

---

## 🧠 DATA SOURCE

Fetch inventory from:
`GET /api/accounting/inventory`

Expected data includes:

* itemId
* name
* category
* variants (array)

  * variantId
  * variantName
  * stock
  * sellingPrice (SP)
  * purchasePrice (CP)
* totalStock
* status

⚠️ If API differs, adapt safely without breaking backend

---

## 🧩 UI STRUCTURE

### 🔹 1. Header

* Title: "Inventory Overview"
* Subtitle: "View available inventory for billing"
* NO action buttons like Add/Edit/Delete

---

### 🔹 2. Filters Section

Include:

* 🔍 Search (real-time filtering while typing)
* 📂 Category Filter (dropdown)
* 📦 Stock Status Filter:

  * All
  * In Stock
  * Low Stock
  * Out of Stock

Filtering must happen on frontend (state-based)

---

### 🔹 3. Inventory Display (IMPORTANT)

Display **VARIANT-LEVEL DATA**

Each row/card must show:

* Item Name
* Category
* Variant Name
* Available Quantity
* Selling Price (SP)
* Optional: Purchase Price (CP) (only if role allows)
* Status Badge:

  * In Stock
  * Low Stock
  * Out of Stock

---

## 🎨 UI STYLE

* Light mode only
* Clean ERP layout
* Use existing design language from Billing pages
* Responsive (mobile + desktop)

---

## 🔘 OPTIONAL VIEW MODES (IF EASY)

* Toggle:

  * Grid View (cards)
  * Table View (detailed)

---

## 🔗 BILLING INTEGRATION (IMPORTANT)

Each item/variant should have:

👉 “Select” or “Add to Bill” button

On click:

* DO NOT update stock
* DO NOT call mutation API

Instead:

* Pass selected data:

  * itemId
  * variantId
  * name
  * variantName
  * sellingPrice

Use:

* state / callback / context (based on project structure)

---

## 🚫 STRICTLY FORBIDDEN

DO NOT implement:

* ❌ Add Inventory
* ❌ Edit Inventory
* ❌ Delete Inventory
* ❌ Stock Update

This is a **VIEW ONLY PAGE**

---

## 🧱 COMPONENT STRUCTURE (IF NEEDED)

You MAY create:

* `InventoryFilters.tsx`
* `InventoryTable.tsx`
* `InventoryCard.tsx`

Keep everything inside:
`/app/Billing/inventory-rate-setup/`

---

## ⚡ PERFORMANCE

* Use useEffect for fetch
* Use useMemo for filtering
* Avoid unnecessary re-renders

---

## 🧪 EDGE CASES

Handle:

* No data → show "No inventory found"
* Loading state → spinner
* API error → error message

---

## ✅ FINAL RESULT

✔ Fully working Inventory Overview page
✔ Read-only data from Accounting
✔ Variant-level display
✔ Filters + search working
✔ Billing selection ready
✔ No CRUD operations

---

If anything is unclear:
Make safe assumptions but DO NOT introduce destructive changes.
