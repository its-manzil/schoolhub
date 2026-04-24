You are working on the existing Accounting Inventory system in Next.js.

### 🚨 CRITICAL RULES

* Do NOT change UI, layout, components, or styling
* Do NOT rewrite Inventory page structure
* Do NOT modify Add Inventory logic (it is already correct)
* Only fix data fetching and schoolId consistency
* Keep backward compatibility

---

## 🎯 PROBLEM TO FIX

Inventory Add is correctly saving data with proper `schoolId`.

However:

* Inventory List
* Stock Management
* Reports / Profit section

are NOT showing data correctly.

This is because they are still using:

* missing `schoolId`
* OR old `"default-school"` filtering
* OR unscoped API calls

---

## 🔧 REQUIRED FIXES

### 1. FIND ALL INVENTORY READ OPERATIONS

Locate all API calls like:

* GET inventory list
* GET stock summary
* GET reports/profit
* GET transactions

---

### 2. FORCE SCHOOL ISOLATION

Every inventory-related API request MUST include:

✔ schoolId from logged-in user

Use safe client-side extraction:

* read user from localStorage
* extract `schoolId`
* ensure null-safe handling

---

### 3. APPLY CONSISTENT FILTERING

Ensure ALL of these are scoped:

#### Inventory List:

* fetch only items where `schoolId === currentSchoolId`

#### Stock Management:

* transactions must be filtered by `schoolId`

#### Reports / Profit:

* profit calculation must only use:

  * inventory entries of current school
  * sales of current school
  * purchase cost of current school

---

### 4. API FIX (IMPORTANT)

If backend supports query:

✔ add:

```
?schoolId=xxx
```

OR header:

```
x-school-id: xxx
```

DO NOT remove existing API structure.

---

### 5. REMOVE DEFAULT FALLBACK LOGIC

Search and remove any of:

* "default-school"
* fallback schoolId strings
* hardcoded school filters

Replace with real logged-in schoolId only.

---

### 6. SAFETY RULES

* If schoolId is missing → do NOT crash page
* Return empty state gracefully
* Add console warning only if needed

---

## 🎯 EXPECTED RESULT

After fix:

✔ Inventory List shows correct school data
✔ Stock updates reflect correct school
✔ Reports show correct profit per school
✔ No cross-school data leakage
✔ Add → List → Reports all consistent

---

## ❌ DO NOT

* Do not redesign UI
* Do not change layout
* Do not refactor components
* Do not change UX flow
* Do not touch Add Inventory logic

END TASK
