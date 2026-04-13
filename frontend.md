# Frontend.md — Staff Module (Phase 1 Only, with Skeleton Loading)

## Context

You are working in a Next.js project (App Router).

Page:
http://localhost:3000/Administrative/staff

Skeleton Component Path:
app/Components/skeleton.tsx

---

## 🚨 STRICT RULES

* Do NOT modify unrelated files
* Do NOT use Tailwind CSS
* Use existing Layout and Modal components
* Use Skeleton component for loading states
* Do NOT use dummy data
* Prepare for backend API integration

---

## 🎯 Goal

Create a clean **Phase 1 Staff Management UI** with:

1. Add Staff Form
2. Staff Table
3. Profile Modal
4. Edit Modal
5. Skeleton Loading (IMPORTANT)

---

## 📦 Data Model

interface Staff {
id: string;
fullName: string;
gender: "Male" | "Female" | "Other";
phone: string;
email: string;
address: string;
emergencyContact: string;
department: string;
role: string;
joiningDate: string;
qualification: string;
status: "Active" | "On Leave" | "Resigned";
photo?: string;
}

---

## 🔄 Data Fetching

On page load:

* Call GET /api/staff
* Store in state
* Maintain loading state

Example states:

* loading: boolean
* staff: Staff[]

---

## 💀 Skeleton Loading (VERY IMPORTANT)

Use component from:
app/Components/skeleton.tsx

### Show skeleton when:

* Page is loading data
* Before staff list is rendered

### Skeleton UI Requirements:

1. Table Skeleton:

* 5–6 rows
* Each row should mimic:

  * ID
  * Name
  * Dept/Role
  * Phone
  * Status
  * Actions

2. Form Skeleton (optional but recommended):

* Show placeholder blocks before form loads

3. Replace skeleton with real data AFTER loading = false

✔ Smooth transition (no flicker)
✔ No empty blank screen

---

## 🧱 UI Requirements

### 1. Add Staff Form

Fields:

* Full Name (required)
* Phone (required)
* Email (required)
* Gender
* Department
* Role
* Joining Date
* Qualification
* Address
* Emergency Contact

✔ Group fields in rows
✔ Keep fast & minimal

---

### 2. Staff Table

Columns:

* ID
* Name (clickable → opens profile)
* Department + Role
* Phone
* Status (badge)
* Actions

✔ If loading → show skeleton
✔ If empty → show "No staff found"

---

### 3. Profile Modal

* 2-column layout
* Clean readable UI
* Show all staff details

---

### 4. Edit Modal

Editable:

* Name
* Phone
* Department
* Role
* Status
* Qualification
* Address

---

## 🔌 API Integration

Use:

* GET /api/staff
* POST /api/staff
* PUT /api/staff/:id
* DELETE /api/staff/:id

Use fetch()

---

## 🎨 Styling

* Plain CSS only
* Card layout for form
* Table with hover effects
* Status badges:

  * Active → green
  * On Leave → yellow
  * Resigned → red

---

## ⚠️ Constraints

* Do NOT add:

  * Payroll
  * Documents
  * Permissions
* Keep UI fast and simple
* Prioritize usability

---

## ✅ Final Output

A production-ready staff page that:

* Fetches data from backend
* Uses skeleton loading properly
* Supports CRUD
* Looks clean and professional

---
