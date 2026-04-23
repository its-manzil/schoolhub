You are working inside an existing Next.js (App Router) ERP project.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 CRITICAL SAFETY MODE (STRICT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are NOT allowed to:

* rewrite the full file
* delete existing UI or logic
* refactor structure unnecessarily
* break current UI behavior
* modify unrelated pages or APIs

You MUST:

* EXTEND existing code only
* KEEP all current UI intact
* ADD backend integration + advanced logic
* CONVERT dummy/local state into real MongoDB-based system

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ TECH RULES (STRICT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

* MongoDB native driver ONLY (NO mongoose)
* NO Tailwind CSS
* Use existing CSS file structure
* Create NEW components only if necessary (with separate CSS)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TARGET FILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app/Accounting/Inventory/page.tsx

DO NOT rename or move this file.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 STEP 1: ANALYZE EXISTING CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

* Understand current:

  * inventory state
  * transactions state
  * add/edit/stock out logic
  * UI structure (cards, modals, filters)

DO NOT assume anything.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 STEP 2: BACKEND INTEGRATION (NEW)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE API ROUTES:

1. GET /api/accounting/inventory
   → fetch all inventory by schoolId

2. POST /api/accounting/inventory
   → create inventory item

3. PUT /api/accounting/inventory
   → update inventory item

4. POST /api/accounting/inventory/stock
   → handle stock transactions (in/out/damage/sale)

5. GET /api/accounting/inventory/transactions
   → fetch transaction history

⚠️ Use MongoDB native driver
⚠️ Use MONGODB_URI from .env.local

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 DATABASE STRUCTURE (IMPORTANT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Inventory Collection:

{
_id,
schoolId,
academicYear,

name,
category,
unit,

hasVariants: boolean,

variants: [
{
name: "M",
cp,
sp,
stock,
sold,
damaged
}
],

totalStock,
totalSold,
totalDamaged,

reorderLevel,
supplier,

createdAt,
updatedAt
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 TRANSACTION COLLECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
_id,
inventoryId,
schoolId,

type: "purchase" | "sale" | "damage" | "adjustment",

qty,
beforeStock,
afterStock,

cp,
sp,
profit,

referenceId, // billId if from billing

createdAt
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔁 STEP 3: REPLACE DUMMY DATA (SAFE WAY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO NOT delete initialInventory immediately.

Instead:

* Add useEffect()
* Fetch real data from API
* Replace state AFTER fetch success

Fallback:

* If API fails → keep dummy data

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
➕ STEP 4: ADD ITEM (EXTEND ONLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Modify existing handleAddItem():

* Call POST API
* Save to DB
* Update UI state after success

ADD:

* academicYear (auto)
* schoolId (from logged-in user)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✏️ STEP 5: EDIT ITEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Modify handleEditItem():

* Call PUT API
* Update DB
* Reflect changes in UI

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📉 STEP 6: STOCK OUT (CRITICAL FIX)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Modify handleStockOut():

Add logic:

IF purpose === "Sale":
→ DO NOT reduce stock immediately
→ Wait for billing confirmation

IF purpose === "Damaged":
→ reduce stock
→ increase damaged

ELSE:
→ normal stock out

Also:

* Save transaction in DB
* Record beforeStock & afterStock

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 STEP 7: PROFIT TRACKING (IMPORTANT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When stock type = "sale":

profit = (sp - cp) * qty

Store in transaction:

* cp
* sp
* profit

DO NOT calculate later

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 STEP 8: BILLING INTEGRATION (IMPORTANT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When inventory is sold via billing:

* Billing page will call:
  POST /api/accounting/inventory/stock

type = "sale"
referenceId = billId

ONLY IF paymentStatus = "paid":
→ reduce stock
→ update sold

IF pending:
→ DO NOT reduce stock

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 STEP 9: ADD STOCK (NEW FEATURE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add new modal:

"Stock In"

Fields:

* quantity
* purchase price
* supplier

On submit:

* increase stock
* create transaction type = purchase

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📉 STEP 10: DAMAGE / LOSS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Extend stock out modal:

If purpose = "Damaged/Lost":

* mark as damage
* reduce stock
* track separately

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 STEP 11: FILTER + SEARCH (KEEP EXISTING)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Keep current:

* search
* category filter

Enhance:

* real-time filtering (already exists)
* no backend search required

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 STEP 12: EXPORT CSV
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Implement:

* Export button

Export:

* name
* category
* stock
* cp
* sp
* supplier

Client-side CSV generation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📜 STEP 13: TRANSACTION HISTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Replace dummy transactions:

* Fetch from API
* Display real history

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 FINAL GOAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Convert current UI into:

✔ Real inventory management system
✔ Backend powered (MongoDB)
✔ Stock tracking with ledger
✔ Profit tracking per sale
✔ Billing-integrated inventory deduction
✔ Damage & loss handling

WITHOUT:
❌ breaking UI
❌ removing existing logic
❌ rewriting file

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

* Provide ONLY modified sections
* Mention file name + exact location
* DO NOT rewrite full file
* DO NOT touch unrelated files

END.
