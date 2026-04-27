Upgrade Administrative Page to Read-Only School Profile + Separate Admin Contact Layer (MongoDB No Mongoose)

Page:
http://localhost:3000/Administrative

🎯 GOAL

Transform this page into:

1. READ-ONLY SCHOOL PROFILE (from schools collection)
Display full school details
❌ No editing allowed
❌ No updates to existing school document
2. NEW SECTION: ADMINISTRATIVE CONTACTS
Editable only section
Stores NEW records only
NEVER updates schools table
🧠 DATA RULES (VERY IMPORTANT)
❌ DO NOT:
Update schools collection
Modify name, address, logo, principalName, etc.
Allow edits in School Overview section
✅ DO:
Fetch and display from schools
Create new collection for admin contacts:
school_admin_contacts
🏫 SECTION 1: SCHOOL PROFILE (READ ONLY)
UI should display:

From schools collection:

School Name
Address
Contact Email
Contact Phone
Established Year
Principal Name
Total Students
Total Teachers
PAN/VAT
Logo
Subscription details
RULE:
All fields are DISPLAY ONLY
NO input fields
NO edit mode
NO save button
📞 SECTION 2: ADMINISTRATIVE CONTACTS (NEW FEATURE)
Create new collection:
school_admin_contacts
Document structure:
{
  schoolId: 1001,
  adminPhone: "",
  adminEmail: "",
  createdAt: new Date()
}
🔧 API REQUIREMENTS (NO MONGOOSE)
GET admin contacts
GET /api/admin-contacts/:schoolId

Return latest record only.

CREATE admin contacts (DO NOT UPDATE OLD)
POST /api/admin-contacts/:schoolId

⚠️ ALWAYS INSERT NEW RECORD (append-only)

⚠️ BUSINESS RULE

If user saves again:

✔ Create new row
✔ Do NOT overwrite previous records
✔ Latest record = active contact

🧩 FRONTEND IMPLEMENTATION
1. LOAD SCHOOL DATA (READ ONLY)
useEffect(() => {
  fetch("/api/schools/1001")
    .then(res => res.json())
    .then(data => setSchool(data));
}, []);
2. LOAD ADMIN CONTACTS
useEffect(() => {
  fetch("/api/admin-contacts/1001")
    .then(res => res.json())
    .then(data => {
      if (data) setAdminContact(data);
    });
}, []);
3. ADMIN CONTACT FORM STATE
const [adminForm, setAdminForm] = useState({
  adminPhone: "",
  adminEmail: ""
});
4. SAVE ADMIN CONTACTS (INSERT ONLY)
const saveAdminContacts = async () => {
  await fetch("/api/admin-contacts/1001", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(adminForm)
  });

  alert("Admin contact saved successfully");
};
🧱 UI STRUCTURE (DO NOT CHANGE EXISTING DESIGN STYLE)
SECTION 1 (READ ONLY CARD)
🏫 School Information
- Logo
- Name
- Address
- Email
- Phone
- Principal
- Students
- Teachers
- Subscription

👉 All rendered as <div> only (no inputs)

SECTION 2 (EDITABLE CARD)
📞 Administrative Contacts

Admin Phone: [input]
Admin Email: [input]

[Save Button]
🔒 IMPORTANT RULES
❌ No editing allowed in School section
❌ No update API for schools
❌ Only INSERT allowed for admin contacts
✅ School remains system-controlled
✅ Admin contacts are flexible layer
🚀 FINAL RESULT

After implementation:

School Section:

✔ Fully read-only profile
✔ Safe ERP core data protection

Admin Contact Section:

✔ Editable phone/email
✔ Multiple historical records stored
✔ Latest record always active

💡 OPTIONAL UPGRADE (HIGHLY RECOMMENDED)

You can later extend:

Audit trail (who changed admin contacts)
Multiple admin roles (finance, IT, admission)
Contact validity dates