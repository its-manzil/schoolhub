Create a FULL Template Design Engine for School ERP.

PATH:
/app/Administrative/templates/[id]/design/page.tsx

STRICT RULES:

* Do NOT modify unrelated files
* Do NOT use dummy data
* Do NOT use localStorage
* Everything must be saved in database
* Use logged-in schoolId for all data access
* Build scalable and modular architecture (this is NOT a simple UI)

---

CORE GOAL:
Build a Canva-like Template Editor where user can design templates (ID Card, Certificate, etc.) and later generate thousands of documents using dynamic data.

---

TECH STACK:

* React (Next.js client component)
* fabric.js (MANDATORY for canvas editing)

---

EDITOR FEATURES:

1. CANVAS:

* Load template background image (fixed, non-editable)
* Overlay editable elements on top
* Canvas must support:

  * Drag
  * Resize
  * Select
  * Delete

---

2. ELEMENT TYPES:

A. TEXT ELEMENT:

* Editable text
* Font family
* Font size
* Font color
* Bold, Italic, Underline
* Alignment (left, center, right)

B. DYNAMIC FIELD ELEMENT (VERY IMPORTANT):

* These are placeholders, not static text

* Format examples:
  {student.name}
  {student.class}
  {school.name}
  {school.address}
  {staff.name}

* These must be visually distinguishable (e.g. highlighted)

---

3. RIGHT SIDEBAR (VERTICAL):

SECTION 1: ADD ELEMENTS

* Add Text
* Add Shape:

  * Rectangle
  * Circle
  * Line

SECTION 2: SCHOOL DATA (FETCH FROM BACKEND USING schoolId)

* school.name
* school.address
* school.email
* school.logo
* principal.signature

SECTION 3: STUDENT DATA (FETCH SCHEMA ONLY)

* student.name
* student.class
* student.roll
* student.section

SECTION 4: STAFF DATA

* staff.name
* staff.position

When clicked → insert into canvas as dynamic field

---

4. TOP TOOLBAR:

* Font family selector
* Font size input
* Font color picker
* Bold / Italic / Underline
* Delete selected element

---

5. SAVE SYSTEM (CRITICAL):

When user clicks SAVE:

* Save FULL canvas structure as JSON in database

Example structure:
{
backgroundImage: "...",
elements: [
{
type: "text",
value: "{student.name}",
x: 120,
y: 80,
fontSize: 16,
color: "#000",
fontWeight: "bold"
}
]
}

Store this in:
template.layoutJson

---

6. LOAD SYSTEM:

* When opening editor, load existing layoutJson
* Reconstruct canvas exactly

---

7. SIZE & POSITION CONTROL:

* All elements must be resizable
* Maintain accurate positioning
* Allow pixel-level control

---

8. PERFORMANCE:

* Must support complex templates
* No lag when dragging elements

---

BACKEND REQUIREMENTS:

Update Template Model:

* Add field:
  layoutJson (Object)

Create API:

* GET /api/templates/:id
* PUT /api/templates/:id/layout

Ensure:

* Data filtered by schoolId
* Proper validation

---

IMPORTANT RESTRICTIONS:

DO NOT:

* Do not build basic HTML drag/drop editor
* Do not skip dynamic fields system
* Do not hardcode data
* Do not simplify fabric.js usage

---

EXPECTED RESULT:

User can:

* Design ID Card visually
* Place dynamic fields
* Save layout
* Reload and edit anytime

This layout will be used later for bulk document generation (DO NOT implement generation yet).

---
