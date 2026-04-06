You are working on a Next.js (App Router) + MongoDB (without Mongoose) accounting system.

## CONTEXT

We have a reference UI at:
`/SchoolAdmin/Academics/Setting`

This page has:

* Sidebar navigation
* Dynamic content area

BUT it is incomplete (only account creation + password exists).

---

## GOAL

Build a **complete Accounting Settings module** at:
`/SchoolAdmin/Accounting/settings`

Using the SAME layout pattern as Academics Setting:

* Sidebar (persistent)
* Dynamic content area

---

## 1. LAYOUT (VERY IMPORTANT)

* Create sidebar (sub-navbar) on left
* It must persist across all settings pages
* DO NOT navigate to different routes
* Use internal state:

```ts
const [activeTab, setActiveTab] = useState("profile");
```

---

## 2. SIDEBAR ITEMS

1. Profile Settings
2. Security (Password Change)
3. Notification Preferences
4. Data Management

---

## 3. PROFILE SETTINGS (IMPORTANT)

Take reference from Academics "Create Account" UI

But modify:

* Create **Accountant user**
* Fields:

  * name
  * email
  * password
  * phone

---

### API: POST `/api/users/create`

Frontend sends:

```json
{
  "name": "...",
  "email": "...",
  "password": "...",
  "phone": "..."
}
```

---

### BACKEND RULES (CRITICAL)

* Extract logged-in user
* Only allow:

```ts
user.role === "schooladmin"
```

* Create:

```ts
{
  name,
  email,
  password: hashedPassword,
  role: "accountant",
  schoolId: user.schoolId
}
```

---

## 4. SECURITY TAB (PASSWORD CHANGE)

UI:

* Current password
* New password
* Confirm password

API:
PUT `/api/users/change-password`

---

## 5. NOTIFICATION PREFERENCES

UI:

* Toggle switches:

  * Email Alerts
  * TDS Reminders
  * Voucher Notifications

API:
PUT `/api/settings/notifications`

Store per user:

```json
{
  "userId": "...",
  "emailAlerts": true,
  "tdsReminders": true,
  "voucherAlerts": false
}
```

---

## 6. DATA MANAGEMENT

UI:

* Export Data button
* Backup button
* Fiscal Year dropdown

APIs:

* GET `/api/export`
* POST `/api/backup`
* PUT `/api/settings/fiscal-year`

---

## 7. UI REQUIREMENTS

* Sidebar stays fixed
* Active tab highlighted
* Smooth switching between tabs
* Loading states
* Success messages

---

## 8. MULTI-TENANCY (CRITICAL)

ALL APIs:

* Must use `schoolId`
* Must filter by `schoolId`

---

## 9. SECURITY

* Hash passwords using bcrypt
* Validate email uniqueness
* Do NOT trust frontend role or schoolId

---

## FINAL RESULT

✔ Same UX as Academics Setting
✔ Persistent sidebar navigation
✔ Accountant creation system
✔ Password change system
✔ Notification + Data management added
✔ Fully backend connected
✔ No dummy data

---

Do NOT create separate pages — use tab-based layout.
