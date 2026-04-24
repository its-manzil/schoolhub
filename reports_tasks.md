TASK: Convert Accounting module into SINGLE PAGE ERP SHELL with component-based navigation

────────────────────────────
🚨 STRICT RULES
────────────────────────────

1. DO NOT remove existing pages immediately
2. DO NOT break current routes (keep fallback routing)
3. DO NOT merge all code into one file
4. ONLY create a shell system on top of existing modules
5. Maintain backward compatibility with current URLs

────────────────────────────
📁 TARGET STRUCTURE
────────────────────────────

CREATE NEW:

📂 /app/Accounting/page.tsx
→ ERP Shell Container (main entry)

📂 /app/Accounting/components/MiniNavbar.tsx
→ Module switcher navigation

📂 /app/Accounting/components/ModuleLoader.tsx
→ Handles dynamic rendering

────────────────────────────
🧠 MODULE SYSTEM
────────────────────────────

Define:

type ActiveModule =
  "voucher" | "reports" | "inventory" | "billing"

Inside Accounting page:
- Load modules conditionally
- No page reload
- No router push for internal navigation

────────────────────────────
⚡ BEHAVIOR RULES
────────────────────────────

- Switching modules must NOT reload page
- State (schoolId, fiscalYear) must persist across modules
- All modules must behave like tabs inside same system
- Mini navbar must control module switching

────────────────────────────
📊 PERFORMANCE RULES
────────────────────────────

- Lazy load each module
- Prevent full re-render of shell
- Memoize module components
- Avoid duplicate API calls when switching tabs

────────────────────────────
🎯 EXPECTED RESULT
────────────────────────────

- Single-page ERP accounting system
- Mini navbar inside Accounting module
- Voucher, Reports, Inventory, Billing all inside one shell
- No page reload experience
- Tally-like ERP navigation system