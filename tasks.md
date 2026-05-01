You are working on an existing Next.js (App Router) project.

TARGET PAGE:

* /app/Academic/Subjects/page.jsx (or page.tsx)

STRICT RULES:

* DO NOT modify backend APIs
* DO NOT change database queries
* DO NOT touch unrelated files
* DO NOT rewrite entire logic
* ONLY restructure UI and reuse existing logic
* DO NOT use Tailwind CSS
* Use app/brandkit.css as styling reference (do not duplicate it)

---

## GOAL

Redesign the Subjects page into a structured system with a mini navbar and 4 sections:

1. Subjects
2. School Schedule
3. Configure Subjects
4. Configure Schedule

---

## TASK 1: ADD MINI NAVBAR

At top of page, create a mini navbar with 4 tabs:

* Subjects
* School Schedule
* Configure Subjects
* Configure Schedule

Use useState:

activeTab = "subjects" | "schoolSchedule" | "configureSubjects" | "configureSchedule"

Switch content using state (NO routing, NO page reload)

---

## TASK 2: SUBJECTS TAB

Display subject list grouped by class.

Requirements:

1. Add Academic Year Filter (Dropdown)

   * Fetch available academic years dynamically (from existing data source)
   * On change → filter subjects

2. Display table like:

| Class 1   | Class 2   | Class 5   |
| --------- | --------- | --------- |
| Subject A | Subject A | Subject A |
| Subject B | Subject B | Subject B |
| Subject C | Subject C | Subject C |

Implementation notes:

* Group subjects by className
* Dynamically generate columns based on available classes
* Ensure alignment even if number of subjects differs

3. Show ONLY selected academic year data

---

## TASK 3: SCHOOL SCHEDULE TAB

Reuse existing code from:

Current Page → "School Schedule / View Schedule"

DO NOT rewrite logic
DO NOT change structure
ONLY move it under this tab

---

## TASK 4: CONFIGURE SUBJECTS TAB

Reuse existing code from:

Current Page → "Add New Record"

Changes required:

* Replace Academic Year dropdown with manual input field (text input)
* Keep rest of form SAME

DO NOT modify submission logic

---

## TASK 5: CONFIGURE SCHEDULE TAB

Reuse existing code from:

Current Page → "School Schedule / Configure Schedule"

DO NOT modify logic
ONLY relocate UI under this tab

---

## TASK 6: LAYOUT & STRUCTURE

* Ensure page does NOT overlap with sidebar/navbar
* Use proper wrapper with margin-left if required
* Keep consistent spacing and layout

---

## TASK 7: STYLING RULES

* Use app/brandkit.css as design reference
* Follow existing design system:

  * cards
  * tables
  * spacing
  * typography

DO NOT:

* add Tailwind
* create conflicting styles

---

## TASK 8: SAFETY

* Do NOT remove any working feature
* Do NOT rename APIs
* Do NOT break existing schedule or subject logic
* Only reorganize UI and add filtering

---

END
