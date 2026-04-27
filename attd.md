You are working on a Next.js (App Router) + Node.js backend project using MongoDB WITHOUT Mongoose.

🎯 TASK

Fix and improve Staff Attendance system at:
http://localhost:3000/Administrative/attendance

🚨 CRITICAL FIXES REQUIRED
❌ ISSUE 1: Staff already marked attendance still appears in list
FIX:

When loading Daily Attendance staff list:

Fetch today's attendance records from staffattendance
Remove already-marked staff from UI list
REQUIRED LOGIC:
const todayAttendance = await db.collection("staffattendance").find({
  schoolId,
  dateBS
}).toArray();

const markedStaffIds = todayAttendance.map(a => a.staffId.toString());

const filteredStaff = allStaff.filter(
  s => !markedStaffIds.includes(s._id.toString())
);

👉 RESULT:
✔ Staff already marked for today MUST NOT appear in attendance list

❌ ISSUE 2: Attendance Record Section not loading data properly
FIX:

Create proper backend fetch:

Must fetch from staffattendance collection
Support filters:
Daily
Monthly
Yearly
Staff-wise
REQUIRED API BEHAVIOR:
Return structured grouped data:
{
  staffId,
  fullName,
  department,
  role,
  records: [
    { dateBS, status, note }
  ]
}
❌ ISSUE 3: Missing persistent attendance storage
FIX:

Ensure every attendance save does:

insertOne({
  schoolId,
  staffId,
  fullName,
  department,
  role,
  dateBS,
  dateAD,
  status, // P | A | L | Hold
  note,
  createdAt
})
❌ ISSUE 4: Duplicate attendance allowed on reload
FIX:

Before saving:

findOne({ schoolId, staffId, dateBS })

Rules:

If exists AND status is P/A/L → BLOCK update
If HOLD → ALLOW update
If not exists → INSERT
❌ ISSUE 5: HOLD logic broken
FIX:
Default status = "Hold"
Only HOLD is editable
Once changed to P/A/L → LOCK permanently
if (status === "P" || status === "A" || status === "L") {
  lockRecord();
}
❌ ISSUE 6: Radio buttons not switchable before save
FIX:
Fix React state bug
Ensure local state updates correctly before API call
Do NOT lock UI before save
🧠 REQUIRED SYSTEM BEHAVIOR
DAILY ATTENDANCE

✔ Load all staff automatically
✔ Exclude already-attended staff for that date
✔ Allow marking P / A / L / Hold
✔ Default = HOLD
✔ Save individually per staff

MONTHLY ATTENDANCE

✔ Based on BS year + month
✔ Show total present days
✔ Show total holidays
✔ No conflict with daily attendance
✔ If daily attendance exists for month → disable monthly entry for that month

ATTENDANCE RECORDS

✔ Must fetch real data from MongoDB
✔ Must support filtering
✔ Must show complete history
✔ Must NOT be empty if data exists

📦 DATABASE RULE (IMPORTANT)

Collection: staffattendance

{
  schoolId: 1001,
  staffId,
  fullName,
  department,
  role,
  dateBS,
  dateAD,
  status: "P | A | L | Hold",
  note,
  createdAt
}
🚫 DO NOT

❌ Do NOT rewrite full frontend
❌ Do NOT use Mongoose
❌ Do NOT break existing staff API
❌ Do NOT allow duplicate attendance for same staff/date
❌ Do NOT show already-marked staff in Daily list

🎯 FINAL EXPECTED RESULT

✔ Attendance persists in MongoDB
✔ No duplicate entries
✔ Already marked staff hidden per day
✔ HOLD system works properly
✔ Attendance Records show real data
✔ Daily + Monthly separation works cleanly
✔ No UI locking bugs