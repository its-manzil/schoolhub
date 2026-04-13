# Backend.md — Staff Module API (Phase 1 Only)

write backend code in schoolhub/server/pages/Administrative/staffs.js

## Context

You are building backend APIs for a Next.js project (or Node/Express if already used).

IMPORTANT RULES:

* Do NOT add authentication system (assume already handled)
* Do NOT implement advanced modules (payroll, documents, etc.)
* Keep everything strictly Phase 1
* Clean, scalable structure

---

## 🎯 Goal

Create CRUD APIs for Staff Management.

---

## 📦 Data Model (MongoDB Schema)

Collection: staff

{
_id: ObjectId,
fullName: String,
gender: String,
phone: String,
email: String,
address: String,
emergencyContact: String,
department: String,
role: String,
joiningDate: Date,
qualification: String,
status: String, // Active | On Leave | Resigned
photo: String, // optional
createdAt: Date,
updatedAt: Date
}

---

## 🔌 API Endpoints

### 1. Get All Staff

GET /api/staff

* Returns list of all staff
* Sort by newest first

---

### 2. Create Staff

POST /api/staff

Body:
{
fullName,
gender,
phone,
email,
address,
emergencyContact,
department,
role,
joiningDate,
qualification
}

Rules:

* fullName, phone, email are REQUIRED
* status default = "Active"

---

### 3. Update Staff

PUT /api/staff/:id

* Update editable fields
* Update updatedAt

---

### 4. Delete Staff

DELETE /api/staff/:id

* Permanently delete record

---

## 🧠 Validation Rules

* Email must be valid
* Phone must not be empty
* Name must not be empty

---

## ⚙️ Structure

* models/staff.js (schema)
* routes/staff.js OR app/api/staff/route.ts
* controllers (if using MVC)

---

## 🚫 Do NOT Add

* Payroll logic
* Authentication logic
* Role-based permissions
* File uploads
* Document storage

---

## ✅ Final Output

A clean and scalable API that:

* Supports full CRUD
* Matches frontend structure
* Is ready for future expansion

---
