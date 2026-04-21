You are working on a Next.js project (App Router) WITHOUT Tailwind CSS.

Database: MongoDB native driver ONLY (NO Mongoose)

Page:
http://localhost:3000/SchoolAdmin/Academics/Attendance

========================================================
🔴 CRITICAL SAFETY RULE (MOST IMPORTANT)
========================================================

⚠️ DO NOT modify, refactor, or touch ANY unrelated files.

This includes:
- Other pages
- Shared components outside Attendance module
- Global layout or navbar
- API routes not related to attendance
- Utility files except allowed dateConverter import usage

Only modify:
✔ Attendance page
✔ New components inside:
  app/Academic/Attendance/components/

ANY change outside this scope is STRICTLY FORBIDDEN.

========================================================
🟢 ARCHITECTURE RULE
========================================================

You MUST create modular components:

Path:
app/Academic/Attendance/components/

Each component MUST have its own CSS file:
Example:
- AttendanceCalendar.tsx
- AttendanceCalendar.css
- AutoPresentSystem.tsx
- AutoPresentSystem.css
- AttendanceDashboard.tsx
- AttendanceDashboard.css

❌ NO single global CSS file for new features
✔ Each feature is independent and reusable

========================================================
🟢 FEATURE 1: NEPALI DATE SYSTEM (BS ONLY)
========================================================

Use:
../../utils/dateConverter

Rules:
- Convert all dates to BS (Bikram Sambat)
- Display format: YYYY-MM-DD (BS)
- NO calendar dropdown UI allowed
- Only text input allowed
- Validate format strictly before API request

Use only:
- toBS()
- getCurrentBSDate()
- formatBSDate()

========================================================
🟢 FEATURE 2: AUTO LOAD TODAY ATTENDANCE
========================================================

- On page load → auto-load today's attendance (BS date)
- Use getCurrentBSDate()
- No manual click required to load default data

========================================================
🟢 FEATURE 3: AUTO PRESENT SYSTEM
========================================================

Create component:
AutoPresentSystem

Features:
- "Mark All Present" button
- Confirmation popup required
- Should not override locked attendance records
- Must respect modification rules

========================================================
🟢 FEATURE 4: MONTHLY ATTENDANCE CALENDAR (BS HEATMAP)
========================================================

Create component:
AttendanceCalendar

Features:
- Monthly BS calendar view
- Heatmap colors:
  - Green = full present
  - Yellow = partial
  - Red = high absence
- Click date → load attendance
- Must use BS conversion logic

========================================================
🟢 FEATURE 5: TEACHER VS STUDENT DASHBOARD
========================================================

Create component:
AttendanceDashboard

Features:
- Compare student vs teacher attendance
- Show:
  - Attendance percentage
  - Absence count
  - Late count
- Simple UI (no external chart libraries unless necessary)

========================================================
🟢 FEATURE 6: ATTENDANCE EDIT RULES (STRICT)
========================================================

Rules:
- Attendance can be edited ONLY ONCE
- After first save → record is LOCKED
- Only schoolAdmin role can override

If override is needed:
- Require mandatory reason input
- Store:
  - bsDate
  - isModified
  - modificationReason
  - modifiedByRole

========================================================
🟢 FEATURE 7: DATE RESTRICTIONS
========================================================

- Only TODAY (BS date) allowed for marking attendance
- Block:
  ❌ Future dates
  ❌ Past dates

Must validate using BS date comparison logic

========================================================
🟢 FEATURE 8: UI RULES
========================================================

- No calendar dropdown anywhere
- Fully responsive design
- Clean dashboard UI
- Components must be reusable and isolated

========================================================
🟢 TECH RULES
========================================================

- Next.js App Router only
- MongoDB native driver only
- No Tailwind CSS
- No Mongoose
- Minimal changes to existing attendance logic
- Do NOT break existing functionality

========================================================
🟢 OUTPUT FORMAT
========================================================

Return:
1. New components (separate files)
2. CSS per component
3. Minimal updates to Attendance page only
4. Clearly indicate file paths
5. Do NOT output unchanged code