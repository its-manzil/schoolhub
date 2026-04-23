You are working inside an existing Next.js (App Router) ERP project.

TECH STACK RULES (STRICT):
- MongoDB native driver ONLY (NO Mongoose)
- NO Tailwind CSS
- Use existing CSS files only

🚨 CRITICAL SAFETY MODE:
- DO NOT rewrite any file completely
- DO NOT refactor architecture
- DO NOT modify unrelated pages, APIs, or components
- ONLY modify logic inside:
  http://localhost:3000/billing/bill-generate

- Keep all existing billing functionality intact
- Follow PATCH-ONLY approach (extend existing logic only)

--------------------------------------------
GOAL:
Prevent duplicate billing using ledger-aware filtering logic.

--------------------------------------------
STEP 1: ANALYZE CURRENT CODE (MANDATORY)
- Inspect how fee components are loaded
- Inspect how student billing history is fetched (if exists)
- Identify where fee components are rendered in UI

DO NOT assume schema — read actual implementation first.

--------------------------------------------
STEP 2: FETCH STUDENT BILLING HISTORY
--------------------------------------------
When student is selected:

- Fetch all previous bills for:
  - selected studentId
  - selected academicYear

From existing billing collection

Store in local state:
- billedComponents
- billedMonths (for monthly/weekly)
- billedInstances (for extra fees if needed)

--------------------------------------------
STEP 3: APPLY FILTERING RULES (CORE LOGIC)
--------------------------------------------

A. ONE-TIME FEES (e.g., Admission)
----------------------------------
IF a one-time fee is already present in previous bills:
→ DO NOT show this component again

Check using:
- component name OR component id

--------------------------------------------
B. MONTHLY FEES
----------------------------------
- Extract all billed months from previous bills

Example:
monthRange: { fromMonth: 1, toMonth: 7 }

→ means Baishakh to Shrawan already paid

LOGIC:
- If all 12 months (1–12) already covered:
  → HIDE monthly fee component

- Else:
  → SHOW component
  → but restrict selectable range:
     from next unpaid month only

Example:
Paid: 1–7
→ next allowed: 8–12 only

--------------------------------------------
C. WEEKLY FEES
----------------------------------
- Same logic as monthly
- If all weeks covered → HIDE
- Else → restrict range to unpaid weeks only

--------------------------------------------
D. YEARLY FEES
----------------------------------
- If already billed once in that academic year:
  → HIDE

--------------------------------------------
E. EXTRA FEES
----------------------------------
- ALWAYS SHOW
- No restriction
- Can be added multiple times per day
- Each entry must create new instance

--------------------------------------------
STEP 4: UI BEHAVIOR
--------------------------------------------
- Filter fee component list BEFORE rendering
- Do NOT show disabled items → completely hide them

For monthly/weekly:
- Update range selector dynamically based on unpaid periods

--------------------------------------------
STEP 5: MULTIPLE BILLING PER DAY
--------------------------------------------
- DO NOT restrict bill creation per day
- Allow unlimited bill creation
- Only enforce:
  → no duplicate coverage of same fee period

--------------------------------------------
STEP 6: DATA SAFETY
--------------------------------------------
- DO NOT modify existing database schema
- DO NOT delete or update old bills
- Only READ from previous bills

--------------------------------------------
STEP 7: EDGE CASE HANDLING
--------------------------------------------
- Partial billing (e.g., month 1–3 billed)
  → allow only remaining months

- Overlap prevention:
  → prevent selecting already billed months

- If inconsistent data found:
  → fallback to safe mode (do not hide component, but restrict range)

--------------------------------------------
OUTPUT RULES:
- Provide ONLY modified code blocks
- Mention exact file name and location
- DO NOT output full file rewrite
- DO NOT touch unrelated files

--------------------------------------------
FINAL GOAL:
Ensure billing system:
- prevents duplicate billing
- tracks coverage properly
- supports multiple billing sessions
- maintains clean ledger integrity
WITHOUT breaking existing working system