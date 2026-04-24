TASK: Upgrade existing Accounting/Voucher page into an ERP-GRADE Voucher System

IMPORTANT SAFETY RULES:
- DO NOT delete or rewrite the entire file
- DO NOT change UI design drastically
- DO NOT remove existing functionality
- ONLY refactor and enhance existing logic
- Ensure backward compatibility with current voucher workflow
- Keep all UI components intact unless explicitly required

OBJECTIVE:
Transform current voucher system into a production-ready ERP accounting module with:
- backend-driven ledger search
- real-time voucher list
- modular architecture
- optimized performance
- audit-safe posting system
- proper accounting engine consistency

────────────────────────────
1. ARCHITECTURE REFACTOR (MODULARIZATION ONLY)
────────────────────────────
Refactor code into logical modules WITHOUT breaking UI:

/components/voucher/
  - VoucherHeader.tsx
  - VoucherTable.tsx
  - LedgerSearchDropdown.tsx
  - VoucherSummary.tsx
  - AttachmentsPanel.tsx
  - RecentVoucherTable.tsx
  - EditRequestModal.tsx

/hooks/
  - useVoucher.ts
  - useLedgerSearch.ts
  - useVoucherValidation.ts

/services/
  - voucher.service.ts (API layer only)
  - ledger.service.ts

Do NOT remove existing logic — only move it into modules.

────────────────────────────
2. BACKEND-DRIVEN LEDGER SEARCH (CRITICAL)
────────────────────────────
Replace local ledger filtering with API-based search.

IMPLEMENT:
- Debounced search (300–500ms)
- API endpoint:
  GET /api/ledgers/search?q=&type=&schoolId=

FEATURES:
- search by ledger name
- filter by voucher type rules (RCT, PR, CN, JV)
- return grouped ledger results
- cache recent searches

REMOVE:
- full client-side ledger filtering logic
KEEP:
- UI dropdown structure intact

────────────────────────────
3. REAL-TIME VOUCHER LIST (CRITICAL)
────────────────────────────
Replace static recentVouchers state with live API integration:

IMPLEMENT:
- GET /api/vouchers/recent?schoolId=
- WebSocket OR polling every 10–15 seconds
- auto-refresh table without page reload

FEATURES:
- latest vouchers first
- status live update (Draft → Posted)
- click-to-preview must still work

────────────────────────────
4. ACCOUNTING ENGINE IMPROVEMENT
────────────────────────────
Strengthen voucher validation system:

ENFORCE:
- debit must equal credit
- ledgerId must be valid from backend
- voucher type rules must be enforced server-side
- prevent posting if invalid

ADD:
- server-side validation mirror (must match frontend rules)
- standardized convertToBackendFormat output

────────────────────────────
5. AUDIT-SAFE POSTING SYSTEM (CRITICAL)
────────────────────────────
Upgrade posting workflow:

WHEN posting voucher:
1. create draft (if not exists)
2. validate server-side
3. lock voucher after posting
4. prevent editing after POSTED
5. allow ONLY "Edit Request" workflow

ADD:
- audit log structure (no UI change needed)
- immutable posted vouchers

────────────────────────────
6. PERFORMANCE OPTIMIZATION
────────────────────────────
Improve performance:

- memoize ledger dropdown rendering
- debounce all search inputs
- prevent full table re-render on single row update
- use useCallback and useMemo properly
- remove duplicate keyboard event listeners (CRITICAL FIX)

────────────────────────────
7. CLEANUP REQUIRED (SAFE ONLY)
────────────────────────────
- REMOVE duplicate useEffect keyboard handlers (keep only one)
- REMOVE static mock recentVouchers
- REMOVE unused console.logs
- REMOVE redundant state updates causing re-render loops

────────────────────────────
8. DO NOT CHANGE
────────────────────────────
- UI layout and design
- voucher type selector UI
- existing CSS classes
- user workflow
- form structure

────────────────────────────
EXPECTED RESULT:
- Voucher system becomes ERP-grade accounting module
- Fully backend-driven ledger search
- Real-time voucher updates
- Audit-safe posting workflow
- Modular, maintainable architecture
- High performance with no UI breakage