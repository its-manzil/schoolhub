You are working on an existing Next.js App Router project.

TARGET PAGE:

* /app/Academic/Exams/page.tsx

IMPORTANT RULES:

* DO NOT rewrite full page
* DO NOT break existing exam creation logic
* DO NOT modify unrelated APIs
* DO NOT introduce new backend routes unless absolutely necessary
* Use MongoDB native driver (NO mongoose)
* Use server/utils/dateConverter.cjs for all BS date handling
* NO Tailwind CSS
* Use separate CSS files per component
* Use app/brandkit.css as color reference ONLY

---

## GOAL (SAFE PHASE IMPLEMENTATION)

Enhance Exams page with:

1. Academic Year → Subject linking
2. BS Date system (input + validation)
3. Smart subject loading by class
4. Holiday awareness (Saturday auto-detect)
5. Keep existing exam creation working

---

## TASK 1: ACADEMIC YEAR DROPDOWN

DO NOT create new API.

Instead:

* Use already fetched subjects data OR fetch subjects once
* Extract academic years dynamically:

const academicYears = [...new Set(subjects.map(s => s.academicYear))]

* Create dropdown:

  <select />

---

## TASK 2: CLASS + SUBJECT LINKING

When user selects:

* Academic Year
* Class

Then:

Filter subjects like:

const selectedSubjects = subjects.find(
s => s.className === selectedClass && s.academicYear === selectedYear
)

Then populate subject dropdown from:

selectedSubjects.subjects[]

---

## TASK 3: REMOVE MANUAL SUBJECT ENTRY

* Replace manual subject input with dropdown
* Values must come ONLY from filtered subjects

---

## TASK 4: BS DATE INPUT SYSTEM

Replace AD date inputs with:

INPUT FORMAT:
YYYY-MM-DD (BS)

Create controlled input with auto-format:

Typing: 20830127 → auto → 2083-01-27

---

## VALIDATION:

Use:

parseBSDate()
isValidBSDate()

Reject invalid dates

---

## TASK 5: STORE DATE PROPERLY

When submitting:

* Send BS date string to backend
* Backend middleware convertBSToAD will convert to AD automatically

DO NOT change backend logic

---

## TASK 6: DATE RANGE HANDLING (IMPORTANT)

When user selects:

* Start Date (BS)
* End Date (BS)

DO NOT manually calculate days.

Instead:

* Convert BS → AD using toAD()
* Loop using JS Date
* Convert back AD → BS using toBS()

---

## TASK 7: HOLIDAY HANDLING

For each generated date:

Use:
isSaturday(bsDate)

If TRUE:

* Mark as Holiday
* Disable exam scheduling on that date

Also:
If no subject assigned on a date → mark as "Holiday"

---

## TASK 8: OPTIONAL DATE PICKER UX

Provide BOTH:

1. Manual input (YYYY-MM-DD)
2. Simple dropdown:

   * Month (Nepali month name)
   * Day

---

## TASK 9: GPA CALCULATION (SAFE ADD)

Add utility:

function calculateGPA(marks, creditHours) {
// Simple average
}

function calculateWeightedGPA(marks, creditHours) {
// Weighted average
}

DO NOT integrate deeply yet
JUST prepare utility for future use

---

## TASK 10: COMPONENT STRUCTURE

Split into components:

/components/exams/

* ExamForm.tsx
* SubjectSelector.tsx
* BSDateInput.tsx
* ExamRoutinePreview.tsx

Each with separate CSS file

---

## TASK 11: UI SAFETY

* Ensure layout does not break sidebar
* Maintain current page structure
* Do NOT remove working sections

---

## TASK 12: DO NOT DO THESE

❌ Do NOT create academic-year API
❌ Do NOT rewrite exam schema
❌ Do NOT change database structure
❌ Do NOT assume month length manually
❌ Do NOT use hardcoded Nepali calendar

---

END
