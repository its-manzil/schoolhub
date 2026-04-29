Build a fully functional **SuperAdmin Dashboard page** for:

`/SuperAdmin/Dashboard`

---

# ⚙️ HARD REQUIREMENTS

* Use **MongoDB native driver (NOT Mongoose)**
* Fetch real data from backend APIs
* DO NOT use Tailwind CSS
* Create separate CSS file
* DO NOT modify other pages
* Production-level SaaS dashboard UI

---

# 1. DATA SOURCES (REAL APIs)

Create or use existing APIs:

### Subscriptions:

`/api/superadmin/subscriptions`

### Schools / Organizations:

`/api/superadmin/schools`

### Users:

`/api/superadmin/users`

### Revenue:

Calculate from subscription `amount`

---

# 2. DASHBOARD STRUCTURE

## A. HEADER

* Title: "Super Admin Dashboard"
* Subtitle: "System overview & control center"

---

## B. KPI CARDS (REAL DATA)

Create 4 cards:

1. Total Schools
2. Active Subscriptions
3. Monthly Revenue
4. Total Users

All values MUST come from API data.

---

## C. ANALYTICS SECTION

Create a clean section for:

* Subscription status breakdown
* Revenue trend (basic chart or table fallback if no chart lib)

Fetch real subscription data and calculate:

* Active %
* Expired %
* Trial %

---

## D. RECENT ACTIVITY FEED

Fetch latest:

* subscriptions
* updates

Display:

* School name
* Action type
* Timestamp

---

## E. ALERTS PANEL

Show:

* Expiring subscriptions (next 7 days)
* Failed or expired accounts

---

## F. QUICK ACTIONS

Buttons:

* Add Subscription
* View Schools
* Manage Plans
* Open Reports

---

# 3. FRONTEND RULES

* Use `useEffect` for API fetching
* Use `useState` for data handling
* Add loading state
* Add error handling
* Refresh UI after updates

---

# 4. CSS FILE (MANDATORY)

Create:
`Dashboard.css`

### Must include:

* grid layout for cards
* responsive design
* card shadows
* modern SaaS styling
* status colors:

  * green = active
  * red = expired
  * yellow = warning
* clean spacing system

NO Tailwind allowed.

---

# 5. UX REQUIREMENTS

* Clean SaaS admin dashboard (Stripe-style)
* Fast loading feel
* Clear hierarchy
* Responsive (desktop-first but mobile usable)
* Professional spacing and typography

---

# GOAL:

Turn this empty page into a **world-class SuperAdmin SaaS dashboard like Stripe / Vercel admin panel**, fully powered by real MongoDB data.
