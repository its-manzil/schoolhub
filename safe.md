### 🚀 TASK: Upgrade Staff Management Page (SAFE REFACTOR – NO BREAKING CHANGES)

### 📍 Target Page:

`/Administrative/staff`

---

## 🎯 OBJECTIVE:

Enhance the existing staff page into a **2-section system**:

1. **Add Staff (Form Section)**
2. **Staff List (Table + Filters Section)**

WITHOUT breaking current functionality.

---

## 🔒 STRICT RULES (VERY IMPORTANT)

1. ✅ DO NOT rewrite entire file
2. ✅ KEEP existing API calls working
3. ✅ KEEP existing validation logic
4. ✅ KEEP existing UI structure as base
5. ✅ ONLY refactor and extend
6. ✅ DO NOT modify other pages or global components
7. ✅ USE MongoDB (native driver) — NO mongoose changes

---

## 🧩 STEP 1: ADD MINI TAB NAVIGATION

### Create component:

`StaffTabs.tsx`

### Behavior:

* Two tabs:

  * "Add Staff"
  * "Staff List"
* Default: Staff List
* Toggle using state (no routing)

Example:

```id="c8k3x1"
const [activeTab, setActiveTab] = useState("list");
```

---

## 🧩 STEP 2: SPLIT UI INTO COMPONENTS

### Create these components inside same folder:

1. `AddStaffForm.tsx`
2. `StaffList.tsx`
3. `StaffFilters.tsx`
4. `EditStaffModal.tsx` (move existing logic)
5. `StaffProfileModal.tsx` (move existing logic)

👉 Move logic carefully — DO NOT break props

---

## 🧩 STEP 3: ADD STAFF FORM IMPROVEMENTS

### 🔥 Replace text input with dropdowns

#### Department Dropdown:

```ts id="dep001"
const DEPARTMENTS = [
  "Academic",
  "Teaching",
  "Library",
  "Health",
  "Finance",
  "Administration",
  "Front Office",
  "Transport",
  "Co-curricular",
  "Exams",
  "Support",
  "Residential"
];
```

---

#### Role Dropdown (dynamic based on department):

```ts id="role001"
const ROLES_BY_DEPARTMENT = {
  Academic: ["Principal", "Vice-Principal", "Academic Coordinator"],
  Teaching: ["Teacher", "Substitute Teacher", "Teaching Assistant"],
  Library: ["Librarian", "Library Assistant"],
  Health: ["Nurse", "Counselor"],
  Finance: ["Accountant", "Cashier"],
  Administration: ["Admin", "System Admin", "Clerk"],
  FrontOffice: ["Receptionist", "PRO"],
  Transport: ["Driver", "Transport Manager"],
  Support: ["Helper", "Security", "Cleaner"]
};
```

---

### Behavior:

* When department changes → reset role
* Role dropdown updates dynamically

---

## 🧩 STEP 4: STAFF LIST IMPROVEMENTS

### Create Filters Component:

#### Add:

* Search (name / phone)
* Filter by:

  * Department
  * Role
  * Status

---

### Filtering logic (frontend only):

```ts id="filter001"
const filteredStaff = staff.filter(member => {
  return (
    member.fullName.toLowerCase().includes(search.toLowerCase()) &&
    (selectedDepartment ? member.department === selectedDepartment : true) &&
    (selectedRole ? member.role === selectedRole : true) &&
    (selectedStatus ? member.status === selectedStatus : true)
  );
});
```

---

## 🧩 STEP 5: REMOVE HARD DELETE (CRITICAL)

### ❌ REMOVE:

```ts id="del001"
DELETE /api/staff/:id
```

---

### ✅ REPLACE WITH:

Soft update:

```ts id="soft001"
status = "Resigned"
```

---

### Add Button:

* “Mark as Left”

---

## 🧩 STEP 6: LOCK RESIGNED STAFF

### Rule:

```ts id="lock001"
if (member.status === "Resigned") {
  disable Edit button
}
```

---

## 🧩 STEP 7: STATUS UPGRADE

Update type:

```ts id="status001"
"Active" | "On Leave" | "Resigned" | "Inactive"
```

---

## 🧩 STEP 8: UI IMPROVEMENTS

### Add:

* Status color badges (already exists → reuse)
* Highlight active tab
* Keep skeleton loading

---

## 🧩 STEP 9: KEEP API STRUCTURE SAME

DO NOT change:

* `/api/staff` (GET, POST)
* `/api/staff/:id` (PUT)

Only change:

* DELETE → stop using it

---

## 🧩 STEP 10: OPTIONAL (SAFE)

* Hide Mongo `_id` from table
* Show only name + phone

---

## 🧠 FINAL EXPECTED RESULT

### ✅ Add Staff Tab:

* Clean form
* Department + Role dropdown
* Same validation working

---

### ✅ Staff List Tab:

* Table + filters
* Search working
* Edit working
* “Mark as Left” instead of delete
* Resigned staff locked

---

## 🚫 DO NOT:

* Rewrite entire file
* Break existing API calls
* Remove validation logic
* Change backend structure

---

## 📦 OUTPUT:

* Updated main file (minimal changes)
* New components created properly
* Clean modular structure
* Fully working UI

---

### 🎯 GOAL:

Upgrade to **production-ready staff module** without breaking current system
