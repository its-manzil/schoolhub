## 🚀 TASK: Build/Refactor Academic Routine Page (STRICT ISOLATION MODE)

---

# ⚠️ ABSOLUTE SAFETY RULES (MOST IMPORTANT)

## 🛑 DO NOT TOUCH ANY UNRELATED FILES

Under NO circumstances should the IDE:

* Modify files outside this scope:

  ```
  /app/Academic/Routine
  /modules/academic/routine-view
  /modules/academic/routine
  ```
* Change global layout, navbar, auth, or shared components
* Modify other academic pages (Subjects, Attendance, Leaves, etc.)
* Refactor shared CSS or global styles
* Rename existing routes

## ⚠️ IF A CHANGE IS REQUIRED OUTSIDE THIS SCOPE:

👉 STOP and do NOT proceed

---

## 🧱 SAFE WORKING ZONE ONLY

Allowed:

```
/app/Academic/Routine/page.tsx
/modules/academic/routine-view/**
/modules/academic/routine/**
```

---

# 🎯 TASK OBJECTIVE

Build a **professional school routine viewer page** at:

```
http://localhost:3000/Academic/Routine
```

It must:

* Display class routine in a **dynamic table/grid format**
* Support **filters + view switching**
* Be production-ready and scalable

---

# 📁 REQUIRED NEW STRUCTURE

Create ONLY inside safe module:

```id="safe1"
/modules/academic/routine-view/
  components/
    RoutineGrid.tsx
    RoutineFilters.tsx
    ClassSelector.tsx
    ViewToggle.tsx
    RoutineCell.tsx
  hooks/
    useRoutineView.ts
  services/
    routineViewService.ts
  types.ts
```

---

# 📊 CORE UI REQUIREMENTS

## 1. ROUTINE GRID (MAIN FEATURE)

### Default View:

* Rows = Periods
* Columns = Days

Example:

```
        Sun   Mon   Tue   Wed   Thu   Fri
P1      Math  Eng   Sci   Math  Nep   Bio
P2      Eng   Math  Sci   Bio   Nep   Eng
```

---

## 2. VIEW SWITCH (IMPORTANT)

Add toggle:

* Period View (default)
* Day View (rotated grid)

### Day View:

```
        P1   P2   P3   P4
Sun     Math Eng  Sci  Bio
Mon     Eng  Math Sci  Nep
```

---

# 🎛️ FILTER SYSTEM

Create a professional filter panel:

### Filters:

* Academic Year (dropdown)
* Class (dropdown)
* View Mode toggle (Period / Day)
* Optional: Subject highlight filter

---

# 🧠 DATA HANDLING RULES

## Hook: `useRoutineView.ts`

Must handle:

* routine data
* loading state
* error state
* selected class/year
* view mode switching
* fetch routine API

---

## API SERVICE: `routineViewService.ts`

Must include:

* fetchRoutine(class, academicYear)

Use ONLY:

```ts
process.env.NEXT_PUBLIC_API_URL
```

NO hardcoded URLs.

---

# 🧩 COMPONENT RULES

## RoutineGrid.tsx

* Dynamic table rendering
* Supports both views (row/column swap)
* Fully responsive
* Sticky headers

---

## RoutineCell.tsx

* Displays subject name
* Badge by type:

  * Primary
  * Optional
  * Minor
* Empty cell shows “—”

---

## ViewToggle.tsx

* Switch between:

  * Period View
  * Day View

---

# 🎨 UI REQUIREMENTS

* Clean grid borders
* Hover highlight row + column
* Sticky headers
* Mobile responsive scroll
* Loading skeleton instead of blank UI

---

# ⚡ SMART FEATURES

## 1. Subject Highlight Mode

* Filter subject → highlight all occurrences

## 2. Empty State

```
No routine found for selected class/year
```

## 3. Loading State

* Skeleton grid (NOT spinner only)

---

# 🚫 STRICT PROHIBITIONS

* ❌ Do NOT modify unrelated pages
* ❌ Do NOT change global CSS
* ❌ Do NOT touch navbar or layout
* ❌ Do NOT refactor outside allowed folder
* ❌ Do NOT hardcode data
* ❌ Do NOT mix filter logic inside grid component

---

# 🎯 FINAL GOAL

This page must become:

* Professional school timetable viewer
* Fully dynamic and filterable
* Switchable grid system (row/column inversion)
* Clean modular architecture
* Safe isolated implementation

---

## END TASK
