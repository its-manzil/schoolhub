You are a senior full-stack developer. Refactor and redesign my existing Next.js page:
`/SuperAdmin/School/page.tsx`

⚠️ IMPORTANT RULES:

* Do NOT break existing API integrations (`/api/schools`, `/api/import`)
* Do NOT change backend contract
* Improve UI, UX, structure, and scalability
* Split CSS into separate files per component
* Use clean, modular, reusable components
* Keep everything production-ready

---

## 🎯 GOAL

Transform current "Schools Management" page into a **modern SaaS-grade Super Admin Dashboard** with advanced controls, analytics, and better UX.

---

## 🧩 REQUIRED ARCHITECTURE

Refactor into components:

```
/SuperAdmin/School/
 ├── page.tsx
 ├── components/
 │   ├── SchoolCard.tsx
 │   ├── SchoolHeader.tsx
 │   ├── SchoolStats.tsx
 │   ├── SchoolFilters.tsx
 │   ├── AddSchoolModal.tsx
 │   ├── EditSchoolModal.tsx
 │   ├── CredentialsModal.tsx
 │   ├── SubscriptionBadge.tsx
 │   ├── SchoolActions.tsx
 │   └── ImportSection.tsx
 ├── styles/
 │   ├── page.css
 │   ├── card.css
 │   ├── modal.css
 │   ├── header.css
 │   ├── stats.css
 │   ├── filters.css
 │   └── import.css
```

---

## 🚀 NEW FEATURES TO IMPLEMENT

### 1. 📊 Dashboard Stats (Top Section)

Create a stats bar:

* Total Schools
* Active Schools
* Expired Schools
* Total Revenue (sum of subscription.amount)

---

### 2. 🔍 Advanced Filters

Replace simple search with:

* Search (name / ID)
* Filter by:

  * Active / Expired
  * Subscription years
* Sort by:

  * Newest
  * Expiry date
  * Name

---

### 3. 🏫 Enhanced School Card

Each card must include:

* Logo (if available, else placeholder)
* School Name + ID
* Address
* Contact Email & Phone
* Subscription:

  * Years
  * Amount
  * Expiry Date
  * Remaining Days (color-coded)
* Status Badge:

  * Green = Active
  * Red = Expired
  * Yellow = Expiring Soon (<30 days)

---

### 4. ⚡ Smart Actions

Add action buttons:

* Edit
* Delete
* 🔄 Extend Subscription
* 🔐 Reset Admin Password (without old password)
* 📋 Copy Admin Username
* 👁 View Details (opens modal)

---

### 5. 🔐 Admin Management (NEW)

Inside "View Details Modal":

Show:

* Admin username
* Last login
* Permissions

Add:

* Reset password button (no old password required)

---

### 6. 💰 Subscription Upgrade Flow

Add modal:

* Select years
* Auto calculate amount
* Update expiry date
* Show preview before confirming

---

### 7. 📁 Bulk Actions (NEW)

Allow:

* Select multiple schools
* Delete multiple
* Extend subscription in bulk

---

### 8. 📊 Visual Improvements

* Use cards with soft shadows
* Rounded corners (12px–16px)
* Smooth animations (framer-motion)
* Hover effects
* Clean spacing (padding: 16px–24px)

---

### 9. 📂 Import Section Upgrade

Improve existing import UI:

* Progress bar with %
* Success / error summary
* Better file drag UI
* Show sample template download button

---

### 10. ⚠️ Smart Indicators

Add:

* Expiring soon badge (<30 days)
* Critical alert (<7 days)
* Tooltip on hover

---

## 🎨 CSS REQUIREMENTS

Each component must have separate CSS file.

Example:

SchoolCard.tsx → styles/card.css
Modal → styles/modal.css

Use:

* Light mode professional theme
* Colors:

  * Primary: #2563eb
  * Success: #16a34a
  * Warning: #f59e0b
  * Danger: #dc2626
* Font: system-ui

---

## 🧠 CODE QUALITY

* Use TypeScript properly
* Use reusable utility functions:

  * formatDate()
  * calculateRemainingDays()
* Avoid inline styles
* Keep state minimal and clean
* Use useCallback where needed

---

## ⚡ BONUS (if possible)

* Add pagination OR infinite scroll
* Add loading skeletons instead of spinner
* Add toast notifications instead of alert()

---

## 📌 OUTPUT EXPECTATION

* Fully refactored page.tsx
* All components separated
* All CSS separated
* Clean, scalable code
* No breaking changes

---

Now implement everything step-by-step and return complete updated code.
