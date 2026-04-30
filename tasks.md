You are working on a Next.js (App Router) project using:

* Plain CSS (NO Tailwind)
* MongoDB native driver (NO mongoose)

STRICT RULES:

* DO NOT rewrite the whole billing system
* DO NOT modify unrelated sections
* ONLY extend `/billing/academic-rate-setup` for Bus Fare (Location-based)
* KEEP all existing structure intact
* ENSURE ALL DATA is strictly scoped to LOGGED-IN schoolId

==================================================
CRITICAL REQUIREMENT: SCHOOL ISOLATION (VERY IMPORTANT)
=======================================================

* NEVER trust frontend schoolId
* ALWAYS get schoolId from logged-in user/session/token on backend
* ALL queries MUST include schoolId filter
* ALL inserts MUST include schoolId

Example (backend):

```js id="school-secure"
const session = await getServerSession(authOptions); // or your auth method
const schoolId = session.user.schoolId;

if (!schoolId) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
}
```

==================================================

1. DATA MODEL (NEW COLLECTION)
   ==================================================

Collection: `bus_fare_rates`

```js id="model-secure"
{
  _id: ObjectId,
  schoolId: Number,
  academicYear: Number,
  address: String, // normalized
  displayAddress: String,
  rate: Number,
  createdAt: Date,
  updatedAt: Date
}
```

* Enforce UNIQUE per: (schoolId + academicYear + address)

==================================================
2. CONFIGURE COMPONENTS SECTION
===============================

* Replace Academic Year dropdown → manual input
* DO NOT affect other sections

```js id="academic-input"
<input
  type="number"
  value={academicYear}
  onChange={(e) => setAcademicYear(e.target.value)}
  placeholder="Enter Academic Year (e.g. 2081)"
/>
```

==================================================
3. ADDRESS MODE TOGGLE
======================

```js id="mode-toggle"
const [mode, setMode] = useState("select"); // select | manual
```

==================================================
4. FETCH STUDENT ADDRESSES (SECURE)
===================================

Backend API: `/api/bus-fare/addresses`

IMPORTANT:

* Use schoolId from session (NOT from request body)

```js id="fetch-students"
const students = await db.collection('students')
  .find({ schoolId })
  .project({ address: 1 })
  .toArray();
```

PROCESS:

* Remove empty
* Normalize (trim + lowercase)
* Remove duplicates

==================================================
5. REMOVE DUPLICATES + USED ADDRESSES
=====================================

```js id="unique-address"
const uniqueAddresses = [...new Map(
  students
    .filter(s => s.address)
    .map(s => [
      s.address.trim().toLowerCase(),
      s.address
    ])
).values()];
```

Fetch existing configured addresses:

```js id="existing-address"
const existing = await db.collection('bus_fare_rates')
  .find({ schoolId, academicYear })
  .toArray();

const usedAddresses = existing.map(a => a.address);
```

Filter:

```js id="filter-address"
const availableAddresses = uniqueAddresses.filter(addr =>
  !usedAddresses.includes(addr.trim().toLowerCase())
);
```

==================================================
6. MANUAL ADDRESS MODE
======================

* Allow input
* Before saving:

  * Normalize
  * Check duplicate (with schoolId + academicYear)

==================================================
7. CREATE BUS FARE RATE (SECURE API)
====================================

API: `/api/bus-fare/create`

DO NOT accept schoolId from frontend

```js id="secure-create"
const session = await getServerSession(authOptions);
const schoolId = session.user.schoolId;

const body = await req.json();
const { academicYear, address, rate } = body;

const normalizedAddress = address.trim().toLowerCase();

const exists = await db.collection('bus_fare_rates').findOne({
  schoolId,
  academicYear: Number(academicYear),
  address: normalizedAddress
});

if (exists) {
  return new Response(JSON.stringify({ error: "Address already exists" }), { status: 400 });
}

await db.collection('bus_fare_rates').insertOne({
  schoolId,
  academicYear: Number(academicYear),
  address: normalizedAddress,
  displayAddress: address.trim(),
  rate: Number(rate),
  createdAt: new Date(),
  updatedAt: new Date()
});
```

==================================================
8. MANAGE FEE SECTION
=====================

Fetch:

```js id="manage-fetch"
const rates = await db.collection('bus_fare_rates')
  .find({ schoolId, academicYear })
  .toArray();
```

* Show address + rate
* Allow edit/delete
* ALL operations must include schoolId

==================================================
9. VIEW BILL SECTION
====================

When calculating:

```js id="bill-logic"
const rate = await db.collection('bus_fare_rates').findOne({
  schoolId,
  academicYear,
  address: student.address.trim().toLowerCase()
});
```

* If not found → show "No bus fare configured"

==================================================
10. DEBUG SAFETY (TEMPORARY)
============================

Add logs:

```js id="log1"
console.log("SESSION schoolId:", schoolId);
console.log("Incoming address:", address);
```

==================================================
EXPECTED RESULT
===============

* Data is STRICTLY isolated per school
* No cross-school data leakage
* Correct address-based bus fare applied
* Academic year handled manually
* Duplicate prevention works properly

==================================================
DO NOT:
=======

* Accept schoolId from frontend
* Modify unrelated billing logic
* Refactor full system
* Add new libraries

Only implement Bus Fare (Location-based) with STRICT school isolation.
