You are working on a Next.js (App Router) ERP system.

🎯 GOAL:
Completely REBUILD the page:
`/app/Accounting/Inventory`

This is NOT a modification task.
This is a FULL SYSTEM REDESIGN.

---

## ⚠️ SAFETY RULES (STRICT)

1. FIRST: Analyze the current folder structure of:
   `/app/Accounting/Inventory`

2. BEFORE deleting anything:

   * Create a backup folder:
     `/app/Accounting/Inventory_backup`
   * Move ALL existing files into this backup folder

3. ONLY after backup is complete:

   * Clear `/app/Accounting/Inventory`
   * Start fresh implementation

4. DO NOT touch:

   * Any other folders
   * Global styles
   * Layout.tsx (must still be used)

---

## 🧠 SYSTEM DESIGN (NEW ARCHITECTURE)

Build a **PROFESSIONAL ACCOUNTING INVENTORY SYSTEM** with modular structure:

### Folder Structure:

```
Inventory/
 ├── page.tsx
 ├── Inventory.css

 ├── components/
 │    ├── InventoryNavbar.tsx
 │    ├── AddItem.tsx
 │    ├── InventoryList.tsx
 │    ├── InventoryDetails.tsx
 │    ├── StockManager.tsx
 │    ├── Reports.tsx

 ├── styles/
 │    ├── navbar.css
 │    ├── form.css
 │    ├── list.css
 │    ├── details.css
 │    ├── modal.css
```

---

## 🧭 UI BEHAVIOR (VERY IMPORTANT)

* Use a **mini navbar (tab system)** inside the SAME PAGE
* DO NOT use routing
* DO NOT use router.push
* Switch sections using React state

Tabs:

1. Add Inventory
2. Inventory List
3. Stock Management
4. Reports & Profit

---

## 🔥 CORE FEATURES

### 1. ADD INVENTORY

* Item Name
* Category
* Variant system (size, color, etc.)
* Purchase Price (CP)
* Selling Price (SP)
* Initial Stock
* Supplier
* Reorder Level

✔ Modal confirmation before save
✔ Save to MongoDB API (DO NOT use mongoose)

---

### 2. INVENTORY LIST

* Card + Table hybrid UI
* Real-time search (filter while typing)
* Filters:

  * Category
  * Stock Status (Low / Normal)
* Show:

  * Total stock
  * Remaining stock
  * Profit margin

✔ CSV Export button

---

### 3. STOCK MANAGEMENT

* Stock IN (purchase/restock)
* Stock OUT:

  * Sale
  * Damage/Loss
* Variant-level stock tracking

✔ Auto deduction when sold
✔ Damage = mark as LOSS (no revenue)

---

### 4. REPORTS & PROFIT

* Show:

  * Total sales
  * Total cost
  * Profit = SP - CP
* Filter by Academic Year
* Separate:

  * Paid sales
  * Pending sales

✔ Simple charts (use chart library already in project if exists)

---

## 🔗 BILLING INTEGRATION (IMPORTANT)

* When billing sells inventory:
  → Call API to reduce stock

* If:

  * Payment = PAID → count in profit
  * Payment = PENDING → count in pending

---

## 🎨 UI REQUIREMENTS

* LIGHT MODE ONLY
* Clean ERP style (no fancy gradients)
* Professional spacing
* Consistent button styles

---

## 🧱 CODING RULES

* DO NOT reuse old UI
* DO NOT copy old structure
* Build fresh components
* Keep logic clean and modular
* Use hooks properly
* No unnecessary console.logs

---

## 🚫 DO NOT

* Do NOT modify unrelated modules
* Do NOT remove Layout wrapper
* Do NOT introduce Tailwind
* Do NOT break existing API contracts

---

## ✅ FINAL RESULT

You must deliver:
✔ Fully rebuilt Inventory system
✔ Clean modular structure
✔ Tab-based UI (no page reload)
✔ Proper stock + profit tracking
✔ Billing integration ready

---

If anything is unclear:
Make safe assumptions but DO NOT skip core features.
