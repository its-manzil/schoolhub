### 🚀 TASK: Build FULL Attendance System (STRICT SCOPE)

You are working on a Next.js (React 18) project.

Target page:
`/Administrative/attendance`

---

## 🎯 GOAL:

Create a **complete teacher attendance system** with:

### 1. DAILY ATTENDANCE

* Load teachers from `staff` collection (role = "Teacher", status = "Active")
* Mark:

  * Present
  * Absent
  * Leave
* Allow marking **holiday (full day)**

---

### 2. MONTHLY ATTENDANCE (BS CALENDAR)

* Input:

  * Year (BS)
  * Month (BS)
* Then:

  * Total holidays
  * Total present days
* Save record

---

## 🔒 STRICT RULES:

### ❌ FUTURE DATE BLOCK

* Cannot mark attendance for future date
* Compare with current date

---

### 🔐 LOCK SYSTEM (VERY IMPORTANT)

Once attendance is saved:

* Add:

```js
locked: true
```

* If record exists AND locked:

  * Disable all inputs
  * Show "Attendance Locked"

---

### ❌ NO UPDATE / DELETE

* Do NOT allow overwrite
* Do NOT allow edit after save

---

## 🧠 BACKEND (MongoDB WITHOUT MONGOOSE)

Create API routes:

### 1. GET Teachers

`GET /api/staff/teachers`

* Filter:

```js
{ role: "Teacher", status: "Active" }
```

---

### 2. SAVE DAILY ATTENDANCE

`POST /api/attendance/daily`

Logic:

* Check if record exists:

```js
{ schoolId, date }
```

IF exists:
→ return error: "Attendance already submitted"

ELSE:
→ insert new record with `locked: true`

---

### 3. SAVE MONTHLY ATTENDANCE

`POST /api/attendance/monthly`

Logic:

* Check duplicate:

```js
{ schoolId, yearBS, monthBS }
```

---

### 4. GET EXISTING ATTENDANCE

* For daily:

```js
GET /api/attendance/daily?date=YYYY-MM-DD
```

* If exists:
  → return locked data

---

## 🧱 FRONTEND STRUCTURE

Split into components:

```
/attendance
 ├── page.tsx
 ├── components/
 │    ├── DailyAttendance.tsx
 │    ├── MonthlyAttendance.tsx
 │    ├── TeacherTable.tsx
 │    ├── AttendanceHeader.tsx
 ├── styles/
 │    ├── daily.css
 │    ├── monthly.css
 │    ├── table.css
```

---

## 🎨 UI REQUIREMENTS (TAILWIND ONLY)

### Daily:

* Date picker
* Holiday toggle
* Table:

  * Name
  * Status (radio buttons)
* Save button

---

### Monthly:

* BS Year dropdown (e.g. 2078–2090)
* BS Month dropdown:

  * Baisakh
  * Jestha
  * Ashadh
  * Shrawan
  * Bhadra
  * Ashwin
  * Kartik
  * Mangsir
  * Poush
  * Magh
  * Falgun
  * Chaitra

---

## ⚠️ AUTH HANDLING

* Read token from localStorage
* Send in headers
* If 401:

```js
localStorage.clear();
window.location.href = "/login";
```

---

## 📦 DATABASE CONNECTION

Use native MongoDB driver:

```js
import { MongoClient } from "mongodb";
```

NO mongoose.

---

## 🚫 DO NOT:

* Modify any other page
* Modify Layout
* Modify Navbar
* Change existing routes
* Break current UI structure

---

## ✅ EXPECTED RESULT:

* Admin can:
  ✔ Mark daily attendance
  ✔ Mark monthly attendance
  ✔ Cannot edit after save
  ✔ Cannot select future date
  ✔ Teachers loaded from DB

---

## 📤 OUTPUT:

* Full working code
* Clean components
* Separate CSS files
* API routes included
