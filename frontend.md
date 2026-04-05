Create a **Configuration Module UI** for an Accounting System using:

* Next.js (App Router)
* TypeScript
* Plain CSS / CSS Modules (no Tailwind)
* Nepali calendar (Bikram Sambat / BS) support everywhere

---

## Layout

* Sidebar navigation + main content area
* Sidebar items:

  * Organization Setup
  * Fiscal Year Management
  * Chart of Accounts
  * Bank & Cash Accounts
  * Customers & Vendors
  * Tax & TDS Settings

---

## Features

1. **All date inputs use Nepali Date Picker**

   * Convert BS → AD when submitting
   * Convert AD → BS when displaying
2. **Forms**

   * Organization: Name, PAN/VAT, Address, Phone, Email, Logo
   * Fiscal Year: Name, Start/End date (BS), Active toggle
   * COA: Account Name, Type, Parent Account
   * Bank/Cash: Account Name, Type, Opening Balance
   * Customers/Vendors: Name, Phone, PAN, Opening Balance
   * Tax/TDS: VAT %, TDS rules
3. **Reusable UI components**

   * FormInput, SelectDropdown, ToggleSwitch, Table, Modal
4. **UX**

   * Validation for required fields
   * Loading and empty states
   * Responsive design

---

## Nepali Calendar Integration

* All displayed dates must be in BS
* All inputs use BS picker
* Conversion utilities (toBS, toAD) are available
* Fiscal year and reports filter by BS dates

---

## Folder Structure

```
app/configuration/
  layout.tsx
  page.tsx
  organization/
  fiscal-year/
  coa/
  bank-cash/
  contacts/
  tax/
components/ui/
  Input.tsx
  Select.tsx
  Table.tsx
  Modal.tsx
  Toggle.tsx
utils/
  dateConverter.ts   // toBS, toAD functions
styles/
  globals.css
  modules/
```

---

## Output

* Full Next.js pages & components
* Example API integration
* Fully BS-ready forms, tables, and reports
* Clean, maintainable, production-ready code
