You are working on an existing Next.js (App Router) project.

⚠️ STRICT SAFETY RULES:

* DO NOT modify any files outside: `/Administrative/attendance`
* DO NOT break existing working code
* DO NOT rewrite entire page — extend it modularly
* DO NOT touch Layout or global styles
* Use MongoDB native driver (NO mongoose)
* Use Tailwind CSS ONLY for layout, and separate CSS files for component styling
* EACH component MUST have its OWN CSS file
* Follow clean component-based architecture

---

# 🎯 OBJECTIVE:

Upgrade `/Administrative/attendance` page into a **modular ERP-level Attendance System** with:

1. Daily Attendance
2. Monthly Attendance
3. Attendance Records (Reports)

---

# 📁 FOLDER STRUCTURE (MANDATORY)

Inside:
`/app/Administrative/attendance/`

Create:

```bash
components/
  AttendanceNavbar.tsx
  DailyAttendance.tsx
  MonthlyAttendance.tsx
  AttendanceRecords.tsx

styles/
  attendance-navbar.css
  daily-attendance.css
  monthly-attendance.css
  attendance-records.css
```

---

# 🎨 MINI NAVBAR (TOP SWITCH - REQUIRED)

Create `AttendanceNavbar.tsx`

Tabs:

* Daily Attendance
* Monthly Attendance
* Attendance Records

Behavior:

* State-based switching (NO routing change)
* Active tab highlight
* Smooth UI

CSS:
→ `attendance-navbar.css` (MUST be separate)

---

# 🧩 MAIN PAGE UPDATE

Update existing page ONLY to:

* Import navbar
* Manage active section state
* Render selected component

Example:

* `activeTab = "daily" | "monthly" | "records"`

---

# 🧩 SECTION 1: DAILY ATTENDANCE

Component: `DailyAttendance.tsx`
CSS: `daily-attendance.css`

---

## FEATURES:

### ✅ Auto Load Staff

* Fetch from `/api/attendance/staff`
* NO "Load button"

---

### ✅ Filters:

* Search (name)
* Department dropdown
* Role dropdown

---

### ✅ Date:

* Auto-select current BS date
* Use backend utility:
  `/server/utils/dateConverter.cjs`

---

### ✅ Holiday Checkbox:

* "Mark Today as Holiday"

IF checked:

* Disable all attendance inputs
* Save single "Holiday" entry

---

### ✅ Attendance UI:

Table columns:

* Name
* Department
* Role
* Status (Present / Absent / Late)
* Note

---

### ✅ RULES:

* ❌ Future date not allowed
* ❌ If already saved → disable UI
* ❌ Save = permanent (isLocked = true)
* ❌ Do NOT show staff already marked

---

# 🧩 SECTION 2: MONTHLY ATTENDANCE

Component: `MonthlyAttendance.tsx`
CSS: `monthly-attendance.css`

---

## FEATURES:

### Inputs:

* BS Year dropdown
* BS Month dropdown (use Nepali months)
* Staff selector
* Total Holidays
* Total Present Days

---

### RULES:

* ❌ Hide staff already recorded
* ❌ If ANY daily attendance exists in that month → BLOCK
* ❌ Once saved → LOCK permanently

---

# 🧩 SECTION 3: ATTENDANCE RECORDS

Component: `AttendanceRecords.tsx`
CSS: `attendance-records.css`

---

## FEATURES:

### Filters:

* Staff
* Department
* Date Range:

  * Weekly
  * Monthly
  * Yearly

---

### DISPLAY:

* Present count
* Absent count
* Late count
* Holidays

---

### EXPORT:

* Download report as SVG
* Use lightweight chart (no heavy libraries)

---

# 🔁 DAILY vs MONTHLY CONFLICT LOGIC (CRITICAL)

Implement strict backend validation:

### RULE:

IF daily attendance exists in ANY day of a BS month:
→ ❌ Disable monthly attendance for that month

IF monthly attendance exists:
→ ❌ Block daily attendance for that month

---

# 🧠 BACKEND (MongoDB - NO MONGOOSE)

Collection: `staff_attendance`

---

## DAILY DOCUMENT:

```json
{
  "schoolId": 1001,
  "staffId": "string",
  "date": "AD Date",
  "dateBS": "2083-01-02",
  "status": "Present | Absent | Late | Holiday",
  "note": "",
  "type": "daily",
  "isLocked": true,
  "createdAt": "Date"
}
```

---

## MONTHLY DOCUMENT:

```json
{
  "schoolId": 1001,
  "staffId": "string",
  "yearBS": 2083,
  "monthBS": 1,
  "totalHolidays": 4,
  "totalPresent": 22,
  "type": "monthly",
  "isLocked": true,
  "createdAt": "Date"
}
```

---

# 🔌 API ENDPOINTS

### 1. GET STAFF

`/api/attendance/staff`

* Apply filters
* Exclude inactive staff
* Exclude already marked

---

### 2. SAVE DAILY

`/api/attendance/daily`

* Convert BS → AD
* Reject:

  * future date
  * duplicate
* Insert bulk
* Lock records

---

### 3. SAVE MONTHLY

`/api/attendance/monthly`

* Reject if daily exists
* Prevent duplicate
* Lock record

---

### 4. GET REPORTS

`/api/attendance/report`

---

# 🧪 VALIDATIONS

* Use `getCurrentBSDate()` to block future
* Ensure all saved records:
  → `isLocked = true`

---

# 🎯 FINAL OUTPUT REQUIREMENTS

* Clean modular components
* Each component has its OWN CSS file
* Navbar working smoothly
* No UI clutter
* No breaking existing system
* Fully functional attendance system

---

# ⚠️ DO NOT:

* Modify Staff page
* Modify Profile page
* Modify global CSS
* Introduce mongoose
* Rewrite entire file

---

# 💡 BONUS (IF POSSIBLE):

Add small indicator:
"Attendance Mode: Daily / Monthly"
→ Helps prevent confusion

---
