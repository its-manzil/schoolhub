You are working inside an existing Next.js (App Router) project using MongoDB (native driver only, NO Mongoose) and NO Tailwind CSS.

IMPORTANT SAFETY RULES:
- DO NOT rewrite or restructure the entire project.
- DO NOT modify unrelated files.
- DO NOT remove existing working logic.
- ONLY extend or adjust current implementation inside the billing settings section.
- Keep all existing functionality intact and working.
- Make minimal, surgical changes only.

CURRENT PAGE:
http://localhost:3000/billing/settings

TASK:
Enhance the existing Academic Rate Setup (Billing Settings) system to support structured fee frequency without breaking current functionality.

FIRST STEP (MANDATORY):
- Carefully analyze the existing code structure in billing settings page and related components.
- Identify how fee components (lab fee, bus fee, admission fee, etc.) are currently stored and rendered.
- Do NOT assume schema blindly; inspect current implementation before making changes.

FEATURE TO ADD:
We need to extend fee component configuration to support billing frequency:

Each fee component must now optionally include:
- frequency: "monthly" | "yearly" | "weekly" | "one-time"

BUT:
- DO NOT break existing records that do not have this field.
- Treat missing frequency as default: "yearly" (safe fallback).

IMPLEMENTATION REQUIREMENTS:

1. UI CHANGE (MINIMAL):
- In Academic Rate Setup form, add a dropdown next to each fee component:
  Label: "Billing Type"
  Options:
    - Monthly
    - Yearly (default selected if not set)
    - Weekly
    - One-time

- Ensure UI styling matches existing system (NO Tailwind, use existing CSS structure).

2. BACKEND (MongoDB Native Driver ONLY):
- Extend existing fee component structure to optionally store:
  frequency: string

- DO NOT change collection structure drastically.
- DO NOT migrate existing data unless absolutely necessary.

3. DATA COMPATIBILITY:
- Existing fee records without frequency must still work.
- Apply fallback logic:
  if frequency is missing → treat as "yearly"

4. BILLING LOGIC EXTENSION (IMPORTANT BUT SAFE):
- Do NOT modify bill generation logic heavily.
- Only ensure that future billing calculations can read frequency field if present.
- Do NOT auto-generate bills yet unless already supported.

5. FILE SAFETY RULE:
- Only modify files directly related to:
  billing/settings (Academic Rate Setup page)
  and its immediate components/services if required
- DO NOT touch unrelated modules (authentication, profile, inventory, etc.)

6. OUTPUT EXPECTATION:
- Provide only necessary code modifications (diff style or small snippets)
- Clearly mention which file each change belongs to
- DO NOT output full rewritten files unless explicitly required

GOAL:
We are evolving the billing system from simple fee list → structured frequency-based billing system WITHOUT breaking existing ERP stability.