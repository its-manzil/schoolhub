### 🚀 TASK: Refactor Subjects Module + Build Advanced Class Routine System (Production-Level)

---

## ⚠️ IMPORTANT RULES (DO NOT BREAK)

* DO NOT modify unrelated files
* DO NOT break existing working features
* KEEP current UI design consistency
* USE separate CSS files for each component
* FOLLOW modular architecture strictly
* ALL API URLs must use environment variables (NO hardcoded localhost)
* Make sure to work only in related file
* do not use talwind css & mongoose
* use mongodb for database
---

# ✅ PART 1: REFACTOR SUBJECTS MODULE (MAKE IT SCALABLE)

## 📁 Create Folder Structure:

```
/modules/academic/subjects/
  components/
    SubjectsTable.tsx
    SubjectFormModal.tsx
    ImportModal.tsx
    ClassYearSelector.tsx
  hooks/
    useSubjects.ts
  services/
    subjectService.ts
  types.ts
```

---

## 🧠 Move Logic Properly:

### 1. `types.ts`

Move:

* Subject interface
* SubjectType enum

```
export enum SubjectType {
  PRIMARY = 'primary',
  MINOR = 'minor',
  OPTIONAL = 'optional'
}
```

---

### 2. `services/subjectService.ts`

Move all API calls here:

* fetchSubjects
* createSubject
* updateSubject
* deleteSubject
* importSubjects

Use:

```
const BASE_URL = process.env.NEXT_PUBLIC_API_URL
```

Create reusable auth header:

```
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
})
```

---

### 3. `hooks/useSubjects.ts`

Handle:

* state (subjects, loading, error, message)
* fetch logic
* CRUD operations

Return:

```
{
  subjects,
  isLoading,
  error,
  message,
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  importSubjects
}
```

---

### 4. Components

#### `ClassYearSelector.tsx`

* Class dropdown
* Academic Year dropdown
* Import button

---

#### `SubjectsTable.tsx`

* Display subjects
* Edit/Delete buttons

---

#### `SubjectFormModal.tsx`

* Add/Edit form
* Validation:

  * Name required
  * Academic year required
  * Credit hours (1–10)

---

#### `ImportModal.tsx`

* Select source class/year
* Import logic

---

---

# ✅ PART 2: BUILD CLASS ROUTINE SYSTEM (ADVANCED FEATURE)

---

## 📁 Create New Module:

```
/modules/academic/routine/
  components/
    RoutineBuilderModal.tsx
    TimeConfigForm.tsx
    PeriodEditor.tsx
    WeeklyGrid.tsx
  hooks/
    useRoutineBuilder.ts
  services/
    routineService.ts
  types.ts
```

---

# 🧠 CORE FEATURE: ROUTINE BUILDER MODAL

## 🎯 Trigger:

Add button:

```
Create Class Routine
```

---

## 🪟 Modal Input Fields:

### Basic Config:

* Academic Year (BS)
* Class
* Weekly Holidays (multi-select: Sunday–Saturday)
* Class Start Time
* Class End Time
* Class Duration (minutes)

---

## ⚙️ AUTO TIME GENERATION LOGIC

System must:

1. Calculate total time between start and end
2. Divide into periods based on duration
3. Generate:

```
Period 1: 10:00 – 10:45
Period 2: 10:45 – 11:30
...
```

---

## ⛔ GAP HANDLING (IMPORTANT)

If:

```
Period 1 ends at 10:45
Period 2 starts at 11:00
```

👉 Automatically create:

```
Break: 10:45 – 11:00
```

---

## 🧩 PERIOD STRUCTURE

Each period:

```
{
  periodNumber,
  startTime,
  endTime,
  subjectType,
  subjects: [],
  applyMode: 'weekly' | 'daily'
}
```

---

# 🧠 SUBJECT RULE ENGINE (VERY IMPORTANT)

## 🟢 PRIMARY

* Only ONE subject allowed
* Applied to ALL days automatically
* Cannot vary per day

---

## 🟡 OPTIONAL

* Multiple subjects allowed
* Fixed for whole week
* Cannot vary per day

---

## 🔵 MINOR

* Only ONE subject per period
* Can vary per day
* Provide toggle:

  * Apply to whole week
  * OR customize per day

---

# 📊 WEEKLY GRID UI

After time generation, show grid:

```
        Sun   Mon   Tue   Wed   Thu   Fri
P1      Sub   Sub   Sub   Sub   Sub   Sub
P2      Sub   Sub   Sub   Sub   Sub   Sub
```

---

## ✏️ Editing Rules:

* PRIMARY → locked across all days
* OPTIONAL → locked across all days
* MINOR → editable per day (if enabled)

---

# ✅ VALIDATIONS

Before saving:

* No empty periods
* No overlapping time
* Respect subject rules
* No periods on holidays

---

# 🧠 HOOK: `useRoutineBuilder.ts`

Handle:

* config state
* generated periods
* subject assignment
* validation
* save logic

---

# 🌐 API SERVICE: `routineService.ts`

Create:

* createRoutine
* fetchRoutine
* updateRoutine

---

# 💾 BACKEND EXPECTATION (IMPORTANT)

Structure data like:

```
Routine
  - class
  - academicYear

Periods
  - periodNumber
  - startTime
  - endTime

Assignments
  - subjectId
  - day (if minor)
  - type
```

---

# ✨ UX IMPROVEMENTS (MAKE IT 10/10)

* Disable buttons during API calls
* Show loading spinner
* Reset modal state on close
* Show success/error messages
* Prevent duplicate submissions

---

# 🚀 FINAL GOAL

* Clean modular code
* Scalable architecture
* Smart automation for routine creation
* Strict subject rule enforcement
* Production-ready UI/UX

---

# ❗ DO NOT:

* Hardcode values
* Mix API logic inside components
* Skip validation
* Break existing Subjects functionality

---

### END OF TASK
