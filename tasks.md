Upgrade SuperAdmin system to support:

1. Dynamic Rate Configuration
2. Automatic School Billing Lifecycle
3. Centralized Settings Control

---

# 🎯 1. CREATE RATE CONFIG SYSTEM (REMOVE HARDCODE)

## 📁 Backend Collection

Create new MongoDB collection:

```bash
superadmin_settings
```

### Structure:

```json
{
  "_id": ObjectId,
  "type": "school_pricing",
  "rates": {
    "monthly": 2000,
    "yearly": 20000,
    "perStudent": 50
  },
  "currency": "NPR",
  "updatedAt": ISODate
}
```

---

## 🔧 API ENDPOINTS

### GET current rates

```bash
GET /api/superadmin/settings/pricing
```

### UPDATE rates (from Setting page)

```bash
PUT /api/superadmin/settings/pricing
```

---

# 🎯 2. CONNECT WITH SuperAdmin Setting Page

In:

```
/SuperAdmin/Setting
```

### Add new section:

👉 “School Pricing Setup”

Fields:

* Monthly Rate
* Yearly Rate
* Per Student Rate

👉 Save to DB (NOT local state)

---

# 🎯 3. APPLY RATE DURING SCHOOL CREATION

In:

```
/SuperAdmin/School
```

### When creating school:

❌ REMOVE hardcoded values
✅ FETCH pricing from DB

```js
const pricing = await getPricing();
```

---

## 🧾 Save in School Document:

```json
{
  "schoolId": 1001,
  "name": "ABC School",
  "plan": "monthly",
  "rate": 2000,
  "startDate": "2026-01-01",
  "endDate": "2026-02-01",
  "status": "active"
}
```

---

# 🎯 4. SCHOOL STATUS LIFECYCLE (IMPORTANT LOGIC)

## Status Flow:

```
Active → Pending (15 days) → Inactive
```

---

## 🧠 Logic:

### When school is created:

```js
status = "active"
```

---

### When endDate passes:

```js
if (today > endDate) {
  status = "pending"
  pendingUntil = endDate + 15 days
}
```

---

### After 15 days:

```js
if (today > pendingUntil) {
  status = "inactive"
}
```

---

# 🎯 5. AUTOMATION (CRON JOB)

Create:

```bash
/server/cron/updateSchoolStatus.js
```

### Run daily:

```bash
0 0 * * *  (midnight)
```

---

## Logic:

```js
const schools = await db.collection("schools").find({}).toArray();

schools.forEach(school => {
  if (today > school.endDate && school.status === "active") {
    school.status = "pending";
    school.pendingUntil = addDays(school.endDate, 15);
  }

  if (today > school.pendingUntil && school.status === "pending") {
    school.status = "inactive";
  }

  update school
});
```

---

# 🎯 6. UI STATUS COLORS (IMPORTANT UX)

In School page:

* 🟢 Active → Green
* 🟡 Pending → Yellow (show “Grace Period”)
* 🔴 Inactive → Red (show “Expired”)

---

# 🎯 7. BLOCK ACCESS FOR INACTIVE SCHOOL

In backend middleware:

```js
if (school.status === "inactive") {
  return res.status(403).json({
    message: "Subscription expired"
  });
}
```

---

# 🎯 8. OPTIONAL (HIGH VALUE)

Add:

* Remaining days display
* “Renew Now” button
* Extend subscription API

---

# 🎯 9. SECURITY

Only SuperAdmin can:

* Change pricing
* Activate/deactivate schools

---

# 🚨 FINAL RESULT

After this:

✅ No hardcoded rates
✅ Central pricing control
✅ Automatic status update
✅ SaaS-ready billing logic
✅ Scalable for future payments

---

# 💯 SYSTEM THINKING

You are building:

❌ School management system
✅ SaaS platform with subscription engine

---

# 🎯 FINAL GOAL

School lifecycle should run:

👉 Automatically
👉 Without manual intervention
👉 Fully controlled from SuperAdmin

---

If something breaks:
👉 Check date comparison logic (timezone + format)
