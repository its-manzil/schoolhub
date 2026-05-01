You are working on an existing Next.js + MongoDB (native driver, NOT mongoose) ERP system. DO NOT rewrite full files. DO NOT touch unrelated logic. ONLY implement the required fixes carefully.

---

## TASK 1: FIX INVENTORY REDUCTION ON BILLING

Locate the API or backend logic where inventory bills are created (inventory_bills insert).

After saving the bill, LOOP through each item in bill.items and:

1. Fetch inventory by inventoryId AND schoolId

2. IF inventory.hasVariants === true:

   * Find matching variant using item.variant
   * کاهش:
     variant.stock -= item.qty
     variant.sold += item.qty

3. ELSE:

   * inventory.totalStock -= item.qty
   * inventory.totalSold += item.qty

4. Update inventory document safely using $set

⚠️ DO NOT overwrite full document
⚠️ ONLY update required fields

---

## TASK 2: CREATE SALE TRANSACTION

After updating stock, INSERT into "inventory_transactions":

{
inventoryId,
schoolId,
type: "sale",
qty: item.qty,
beforeStock,
afterStock,
cp,
sp,
profit: (sp - cp) * qty,
referenceId: bill._id,
paymentStatus: bill.paymentStatus,
purpose: "Inventory Sale",
createdAt: new Date()
}

For variant:

* cp = variant.cp
* sp = variant.sp

For non-variant:

* cp = inventory.purchasePrice
* sp = inventory.sellingPrice

---

## TASK 3: STORE NEPALI DATE IN BILL

Import from:
server/utils/dateConverter.cjs

Use:
getCurrentBSDate()
formatBSDate()

Add field in bill:
bsDate: "YYYY-MM-DD"

⚠️ DO NOT remove createdAt

---

## TASK 4: REPORTS SECTION FIX

Rename UI label:
"Reports & Profit" → "Reports"

Fetch data ONLY from:
inventory_transactions where type = "sale"

---

## FILTER LOGIC:

Inputs:

* academicYear (BS year like 2083)
* optional month (1-12)

IF month is selected:
filter.bsDate startsWith `${year}-${month.padStart(2,'0')}`

ELSE:
filter.bsDate regex ^year

---

## CALCULATE:

totalSales = sum(sp * qty)
totalProfit = sum(profit)
totalItemsSold = sum(qty)

Return list + summary

---

## IMPORTANT RULES:

* DO NOT modify Add Inventory, Inventory List, or Stock Management logic
* DO NOT change database schema drastically
* DO NOT remove existing fields
* ONLY ADD minimal required fields (bsDate)
* KEEP code modular and safe
* USE MongoDB native driver syntax (no mongoose)

---

## END
