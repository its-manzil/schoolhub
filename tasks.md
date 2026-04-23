You are working inside an existing Next.js (App Router) ERP project.

TECH STACK RULES (STRICT):
- MongoDB native driver ONLY (NO Mongoose)
- NO Tailwind CSS
- Use plain CSS files per component (existing structure must be preserved)

🚨 CRITICAL SAFETY MODE:
You MUST NOT:
- rewrite or refactor existing billing system
- delete or replace working logic
- modify unrelated pages or APIs
- move code into new architecture
- break backward compatibility

YOU MUST FOLLOW PATCH-ONLY DEVELOPMENT:
- Only extend existing logic
- Only modify required sections inside existing files
- Treat current system as production stable

TARGET AREAS:
- http://localhost:3000/billing/bill-generate
- http://localhost:3000/billing/settings

--------------------------------------------
PHASE 2 GOAL:
Upgrade current billing system into a RULE-BASED SMART ERP BILLING ENGINE
WITHOUT breaking existing functionality.

--------------------------------------------
STEP 1: ANALYZE FIRST
- Inspect current billing structure
- Understand existing:
  - fee components (monthly/yearly/one-time)
  - student billing flow
  - ledger/history system
  - settings structure

DO NOT assume schema. Read current implementation first.

============================================
NEW FEATURES TO ADD (EXTENSIONS ONLY)
============================================

--------------------------------------------
A. RULE-BASED BILLING ENGINE (NEW CORE LOGIC)
--------------------------------------------
Introduce rule-based fee calculation WITHOUT changing existing storage:

Support 3 rule layers:

1. CLASS LEVEL RULES (base fee structure)
- monthly fee
- exam fee structure
- other recurring fees

2. STUDENT LEVEL RULES (exceptions only)
- discount percentage (e.g. 20%)
- fixed discount amount
- scholarship type
- free months

3. GLOBAL PENALTY RULES
- late fee per month
- percentage penalty OR fixed amount (configurable)

DO NOT hardcode values per student. Everything must be rule-driven.

--------------------------------------------
B. SCHOLARSHIP SYSTEM
--------------------------------------------
Add support for:

IF student has scholarship:
- percentage discount (e.g. 20%, 50%, 100%)
- OR full exemption for specific fee types
- OR free months (e.g. 2 months free)

Rules must apply dynamically during bill calculation.

--------------------------------------------
C. FREE MONTHS LOGIC (MONTHLY FEES)
--------------------------------------------
For monthly fees:
- support "free N months"
- system must automatically skip those months
- months must be tracked using BS calendar (Baishak–Chaitra)
- ensure continuation logic (no duplicate billing months)

--------------------------------------------
D. EXAM / EVENT BASED FEES (IMPORTANT)
--------------------------------------------
Introduce support for event-based fees:

Examples:
- First Term Exam
- Second Term Exam
- Third Term Exam
- Final Exam

IMPORTANT:
- These events come from CLASS + ACADEMIC YEAR configuration
- NOT hardcoded in UI

Each event has:
- name
- code
- fee amount per class

During billing:
- show only unpaid exam events from ledger
- hide already paid ones

--------------------------------------------
E. LEDGER ENHANCEMENT (READ ONLY USAGE)
--------------------------------------------
Before generating bill:
- fetch student payment history
- use it to determine:
  - already paid months
  - already paid exam events
  - already paid one-time fees

IMPORTANT:
- DO NOT modify ledger structure
- ONLY use it for filtering and calculation

--------------------------------------------
F. LATE FEE ENGINE (NEW FEATURE)
--------------------------------------------
Add penalty support:

Two modes:
1. Percentage-based (e.g. 1% per month)
2. Fixed amount (e.g. Rs 100 per month)

Rules:
- applied only if payment is overdue
- calculated per unpaid month
- configurable from settings (if not available, extend minimally)

--------------------------------------------
G. BILL TYPE LOGIC
--------------------------------------------
- PAN Bill → no VAT
- VAT Bill → add 13% VAT

Apply ONLY in final calculation preview
DO NOT store tax in base fee structure

--------------------------------------------
H. BILL SUMMARY (ENHANCED)
--------------------------------------------
Before "Generate Bill":
Show full breakdown:

- Base Fees
- Exam/Event Fees
- Discounts applied
- Free months skipped
- Penalties applied
- Subtotal
- VAT (if applicable)
- Final Total

User must confirm before generation

--------------------------------------------
I. GENERATE BILL BUTTON
--------------------------------------------
- DO NOT change existing bill creation logic
- ONLY pass computed structured data:
  - applied rules
  - selected months
  - selected events
  - discount summary
  - penalty summary

--------------------------------------------
OUTPUT RULES:
- ONLY show modified code sections
- mention file name and exact location
- NEVER output full file rewrite
- NEVER touch unrelated modules
- keep backward compatibility 100%

--------------------------------------------
FINAL GOAL:
Transform billing system into a:
RULE-BASED, LEDGER-DRIVEN, SCHOLARSHIP-AWARE ERP BILLING ENGINE
WITHOUT breaking current working system.