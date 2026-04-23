You are working inside an existing Next.js (App Router) ERP project.

TECH STACK RULES (STRICT):
- Use MongoDB native driver ONLY (NO Mongoose)
- NO Tailwind CSS
- Use plain CSS (create separate CSS file for each component/page)
- Follow existing project folder structure and coding style

🚨 SAFETY RULES:
- This page is NEW and EMPTY → you are allowed to build from scratch
- DO NOT modify any unrelated pages, APIs, or components
- DO NOT refactor existing project structure
- Keep everything isolated to:
  app/billing/inventory-rate-setup

--------------------------------------------
GOAL:
Create a complete Inventory Rate Setup page with 2 sections:
1. Configure Inventories
2. View & Edit Inventories

--------------------------------------------
SECTION 1: CONFIGURE INVENTORIES
--------------------------------------------

Build a form with following fields:

1. Academic Year (dropdown or input)
2. Inventory Name (text input)
3. Has Variants? (toggle: Yes / No)

--------------------------------------------
IF "Has Variants" = NO:
--------------------------------------------
- Show single input:
  - Price

--------------------------------------------
IF "Has Variants" = YES:
--------------------------------------------
- Show dynamic variant table:

Fields:
- Variant/Size (text input)
- Price (number input)

Features:
- Add Variant button
- Remove Variant button
- Allow multiple rows

--------------------------------------------
SAVE FUNCTIONALITY:
--------------------------------------------
On clicking "Save":
- Validate inputs
- Store in MongoDB:

Structure:
{
  schoolId,
  academicYear,
  name,
  hasVariants,
  price (if no variants),
  variants: [
    { label, price }
  ],
  createdAt,
  updatedAt
}

- Prevent duplicate entries:
  same (name + academicYear + schoolId)

--------------------------------------------
SECTION 2: VIEW & EDIT INVENTORIES
--------------------------------------------

Display all inventories in a table:

Columns:
- Inventory Name
- Academic Year
- Type (Simple / Variant)
- Price / Variant Summary
- Actions (Edit)

--------------------------------------------
EDIT FUNCTIONALITY:
--------------------------------------------

On clicking Edit:
- Load inventory data into editable form
- Allow:
  - change name
  - change price
  - add/remove variants

--------------------------------------------
PASSWORD CONFIRMATION (IMPORTANT):
--------------------------------------------

Before saving edited data:
- Show modal:
  "Enter Password to Confirm Changes"

- User enters password

- Send password to backend for verification
- Only update if password is correct

--------------------------------------------
BACKEND REQUIREMENTS:
--------------------------------------------

- Create API routes using Next.js API (app/api)
- Use MongoDB native driver

APIs needed:
1. Create Inventory
2. Get Inventories (by schoolId + academicYear)
3. Update Inventory (with password verification)

--------------------------------------------
UI REQUIREMENTS:
--------------------------------------------

- Clean form layout
- Separate sections clearly:
  - Configure
  - View/Edit

- Use simple HTML + CSS
- NO Tailwind

--------------------------------------------
CSS REQUIREMENTS:
--------------------------------------------

- Create separate CSS file:
  inventory-rate-setup.css

- Style:
  - form spacing
  - table layout
  - buttons
  - modal (for password input)

--------------------------------------------
OUTPUT RULES:
--------------------------------------------

- Create full implementation for this page ONLY
- Include:
  - React component (page)
  - CSS file
  - API routes (only related to this feature)

- DO NOT touch unrelated files
- DO NOT use external UI libraries
- DO NOT use Tailwind

--------------------------------------------
FINAL GOAL:
Build a clean, scalable inventory rate setup system supporting:
- simple items (no size)
- variant-based items (sizes)
- academic year based pricing
- secure editing with password verification