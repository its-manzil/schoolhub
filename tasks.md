## 🧠 TASK: Enhance Collection Report WITHOUT Removing Existing Code

You are working on:

`/app/Billing/collection-report/page.tsx`

---

## ⚠️ CRITICAL INSTRUCTIONS (VERY IMPORTANT)

1. ❌ DO NOT delete any existing code
2. ❌ DO NOT replace the whole file
3. ❌ DO NOT refactor existing logic
4. ❌ DO NOT rename existing variables
5. ❌ DO NOT touch unrelated files

---

## ✅ YOU MUST:

* ONLY **ADD new code**
* ONLY **EXTEND existing UI**
* ONLY **INSERT new sections**
* KEEP everything already working EXACTLY as is

---

# 🎯 GOAL

Enhance existing "Bill Records" page with:

1. Filters (Academic Year, Class, Section)
2. Summary Cards (Received, Pending, Total)
3. Clickable card filtering
4. Default filter values

---

# 🧩 STEP 1: ADD NEW STATE (DO NOT MODIFY EXISTING STATE)

👉 Add BELOW existing useState hooks:

```js
const [filters, setFilters] = useState({
  academicYear: '',
  className: 'all',
  section: 'all',
  status: 'all'
});

const [summary, setSummary] = useState({
  totalReceived: 0,
  totalPending: 0,
  totalBills: 0
});
```

---

# 🧩 STEP 2: FETCH ACADEMIC YEAR (SAFE ADD)

👉 Add new useEffect (DO NOT TOUCH existing ones):

```js
useEffect(() => {
  const fetchYears = async () => {
    try {
      const res = await fetch('/api/fee-management/academic-years');
      const data = await res.json();

      if (data.success && data.data.length > 0) {
        const latest = data.data[data.data.length - 1];
        setFilters(prev => ({ ...prev, academicYear: latest }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  fetchYears();
}, []);
```

---

# 🧩 STEP 3: MODIFY EXISTING FETCH CALL (IMPORTANT)

👉 DO NOT REMOVE EXISTING FETCH
👉 ONLY MODIFY URL

Replace:

```js
fetch('/api/billing/collection-report')
```

WITH:

```js
const params = new URLSearchParams(filters);
fetch(`/api/billing/collection-report?${params}`)
```

---

# 🧩 STEP 4: STORE SUMMARY FROM API

👉 After data fetch success, ADD:

```js
setSummary(data.summary);
```

DO NOT remove existing state updates.

---

# 🧩 STEP 5: ADD FILTER UI (TOP OF PAGE)

👉 Add ABOVE existing table:

```jsx
<div className="filter-bar">
  <select onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value }))}>
    <option value="">Select Year</option>
    {/* reuse existing academicYears if available */}
  </select>

  <select onChange={(e) => setFilters(prev => ({ ...prev, className: e.target.value }))}>
    <option value="all">All Classes</option>
    {[...Array(12)].map((_, i) => (
      <option key={i} value={`Class ${i+1}`}>Class {i+1}</option>
    ))}
  </select>

  <select onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))}>
    <option value="all">All Sections</option>
    <option value="A">A</option>
    <option value="B">B</option>
  </select>
</div>
```

---

# 🧩 STEP 6: ADD SUMMARY CARDS (ABOVE FILTERS)

```jsx
<div className="summary-cards">
  <div onClick={() => setFilters(prev => ({ ...prev, status: 'paid' }))}>
    <h3>Total Received</h3>
    <p>Rs. {summary.totalReceived}</p>
  </div>

  <div onClick={() => setFilters(prev => ({ ...prev, status: 'pending' }))}>
    <h3>Total Pending</h3>
    <p>Rs. {summary.totalPending}</p>
  </div>

  <div onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}>
    <h3>Total Bills</h3>
    <p>{summary.totalBills}</p>
  </div>
</div>
```

---

# 🧩 STEP 7: BACKEND SAFE UPDATE

👉 File:
`/app/api/billing/collection-report/route.js`

---

## ⚠️ DO NOT REMOVE EXISTING LOGIC

ONLY ADD FILTER SUPPORT:

```js
if (status === 'paid') query.paymentStatus = 'paid';

if (status === 'pending') {
  query.paymentStatus = { $in: ['pending', 'cheque_pending'] };
}
```

---

## ADD SUMMARY CALCULATION

```js
const totalReceived = bills.filter(b => b.paymentStatus === 'paid')
.reduce((sum, b) => sum + b.totalAmount, 0);

const totalPending = bills.filter(b => b.paymentStatus !== 'paid')
.reduce((sum, b) => sum + b.totalAmount, 0);

const totalBills = bills.length;
```

---

## ADD TO RESPONSE (DO NOT REMOVE EXISTING DATA)

```js
summary: {
  totalReceived,
  totalPending,
  totalBills
}
```

---

# 🧩 STEP 8: FIX PRINT BUTTON ICON (SAFE)

👉 ONLY update CSS:

```css
.print-btn {
  background: #000;
  color: #fff;
}

.print-btn i,
.print-btn svg {
  color: #fff;
  fill: #fff;
}
```

---

# 🧠 FINAL RULE

👉 If any change risks breaking existing code:
➡️ DO NOT APPLY THAT CHANGE

---

## 🔚 END OF SAFE PROMPT
