🎯 TASK: Build “Attendance Records Section” (SAFE EXTENSION – DO NOT BREAK EXISTING SYSTEM)

We are working on:

http://localhost:3000/Administrative/attendance

⚠️ IMPORTANT RULES:

DO NOT rewrite existing pages
DO NOT change API structure
DO NOT remove current attendance logic
ONLY extend Attendance Record section
MongoDB is used WITHOUT mongoose
✅ 1. CREATE NEW COMPONENT

Create:

/app/Administrative/attendance/components/AttendanceRecord.tsx
/app/Administrative/attendance/components/AttendanceRecord.css
✅ 2. PURPOSE

This component should:

Display attendance in sheet/table format
Group by:
Role (Teacher, Admin, etc.)
Show:
Daily status (P / A / H)
Total Present
Total Holidays
Allow:
Month selection (BS)
Year selection (BS)
Role filter
Staff filter
Fetch data from:
GET /api/staffattendance
✅ 3. DATA STRUCTURE (IMPORTANT)

Attendance is stored like:

{
  schoolId,
  date,
  dateBS,
  type,
  isHoliday,
  staffId,
  fullName,
  department,
  role,
  status, // P | A | L
}
✅ 4. FETCH & GROUP LOGIC
Step 1: Fetch attendance

Filter by:

schoolId
selected BS year + month
Step 2: Convert into matrix

Transform data into:

{
  role: {
    staffName: {
      day: status
    }
  }
}

Example:

Teacher:
  Manjil:
    1: P
    2: A
    3: P
Step 3: Extract unique:
Roles
Staffs
Days in selected BS month
✅ 5. UI STRUCTURE (REACT)
Header:
Title: Attendance Record
Dropdowns:
BS Year
BS Month
Role Filter
Staff Filter
Legend:
P = Present
A = Absent
H = Holiday
Table:

Columns:

Name | 1 | 2 | 3 | ... | 32 | Total Present | Holidays

Rows:

Group by ROLE
Show role header row
Then staff rows under it
✅ 6. TABLE RULES
Cell Value Logic:
if isHoliday === true → H
else status === "P" → P
else status === "A" → A
else status === "L" → A (treat Leave as Absent OR separate if needed)
else → empty
Totals:

For each staff:

Count P → Total Present
Count H → Total Holidays
✅ 7. NO EDITING HERE

This is VIEW ONLY SECTION

❌ No editing attendance
❌ No toggling cells
❌ No mutation

✅ 8. DOWNLOAD / EXPORT FEATURE

Add button:

Download SVG

Implement:

Convert table into SVG
OR use simple window.print() fallback
✅ 9. FILTERS

Filters must work WITHOUT reload:

Role filter
Staff name search
Month/year selection
✅ 10. CSS REQUIREMENTS

Create clean UI based on provided design:

Sticky header
Sticky name column
Scrollable table
Color codes:
P → Green
A → Red
H → Orange
✅ 11. MINI NAVBAR IN ATTENDANCE PAGE

Update main attendance page:

Create tabs:

Daily Attendance | Monthly Attendance | Attendance Records

Switch component based on active tab.

✅ 12. IMPORTANT LOGIC RULE
Only show data that exists in DB
DO NOT generate fake rows
If no data → show "No attendance records found"
✅ 13. PERFORMANCE
Avoid re-render loops
Use useMemo for grouping
Use useEffect for API calls
✅ 14. FINAL INTEGRATION

Import in:

/Administrative/attendance/page.tsx

Render when:

activeTab === "records"
✅ 15. EDGE CASES

Handle:

No data in month
Partial attendance
Holiday-only days
Staff who joined mid-month
✅ OUTPUT EXPECTATION
Clean attendance sheet like provided HTML
Fully dynamic from DB
Grouped by role
Filterable
Printable / exportable
🚨 BONUS (OPTIONAL)

If possible:

Add weekly view
Add yearly summary
🧠 Important Insight (for you)

budo kaka, your idea is strong—but this is the key mindset shift:

👉 Your HTML version = manual system
👉 Your current app = data-driven ERP

So instead of “click to mark”, this section should be:

✔ Reporting
✔ Analytics
✔ Read-only