You are working on a Next.js (App Router) ERP system.

🎯 TASK:
Update the page:
`/app/Billing/inventory-billing`

to support **variant-based inventory from Accounting module**

---

## ⚠️ SAFETY RULES (STRICT)

1. DO NOT delete this page or its folder
2. DO NOT rewrite entire UI from scratch
3. DO NOT break existing billing logic (totals, VAT, payment flow)
4. DO NOT modify unrelated files
5. ONLY enhance inventory selection logic

---

## 🧠 CONTEXT (IMPORTANT)

Inventory is now managed in Accounting module.

Data comes from:
`GET /api/accounting/inventory`

Each item has variants:

Example:

```json
{
  name: "T-Shirt",
  variants: [
    { name: "S", sp: 500, stock: 50 },
    { name: "M", sp: 550, stock: 70 }
  ]
}
```

---

## 🔁 REQUIRED CHANGES

### 🔹 1. FETCH INVENTORY DATA

Replace old inventory source with:

```ts
GET /api/accounting/inventory
```

Store in state:

```ts
const [inventory, setInventory] = useState([]);
```

---

### 🔹 2. HANDLE VARIANTS (CRITICAL)

DO NOT treat inventory as flat list

Each item has:

* name
* variants[]

---

### 🔹 3. UI UPDATE (MINIMAL CHANGE APPROACH)

Modify existing "Add Item to Bill" section:

#### Add:

1. Item Dropdown
2. Variant Dropdown (dependent on selected item)

Flow:

* Select Item → Load its variants
* Select Variant → auto-fill price + stock

---

### 🔹 4. AUTO-FILL DATA

When variant selected:

* rate = variant.sp
* available stock = variant.stock

Display:
"Available: X pcs"

---

### 🔹 5. QUANTITY VALIDATION

Before adding item:

```ts
if (quantity > selectedVariant.stock) {
  show error: "Insufficient stock"
}
```

---

### 🔹 6. UPDATE BILL ITEM STRUCTURE

Each bill item MUST include:

```ts
{
  itemId,
  name,
  variant,
  qty,
  rate,
  amount
}
```

⚠️ Variant is mandatory

---

### 🔹 7. STOCK DEDUCTION (ON BILL CONFIRM)

When bill is submitted:

Call:

```ts
POST /api/accounting/inventory/deduct
```

Payload:

```ts
{
  itemId,
  variant,
  quantity,
  type: "sale"
}
```

---

### 🔹 8. PAYMENT STATUS RULE

Set automatically:

* Cash → Paid
* Bank → Paid
* Cheque → Pending

---

## 🎨 UI RULES

* Keep existing layout intact
* Only add:

  * Variant dropdown
  * Stock display
* Do NOT redesign page

---

## 🚫 STRICTLY FORBIDDEN

DO NOT:

* ❌ Remove existing bill table
* ❌ Remove VAT logic
* ❌ Remove totals calculation
* ❌ Add inventory CRUD
* ❌ Modify backend structure

---

## 🧪 EDGE CASES

Handle:

* No variants → disable selection
* Stock = 0 → disable adding
* API error → show fallback message
* Loading → show spinner

---

## ⚡ PERFORMANCE

* Use useEffect for fetch
* Use useMemo for selected item/variant
* Avoid unnecessary re-renders

---

## ✅ FINAL RESULT

✔ Billing uses Accounting inventory
✔ Variant selection working
✔ Stock validation working
✔ No UI break
✔ Bill structure updated
✔ Stock deduction API integrated

---

If anything is unclear:
Make safe assumptions WITHOUT breaking existing system.
