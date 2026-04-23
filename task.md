## 🧠 TASK: Upgrade Collection Report Page + Fix Print Button UI

You are working on a **Next.js App Router project**.

---

## ⚠️ STRICT RULES (DO NOT BREAK)

1. DO NOT modify unrelated files
2. ONLY work inside:

   * `/app/Billing/collection-report/`
   * `/app/Billing/bill-generate/components/` (ONLY for print button fix)
   * `/app/api/billing/collection-report/`
3. DO NOT use Tailwind CSS
4. Use **plain CSS (separate files)**
5. Use **MongoDB (native driver only, NO mongoose)**
6. DO NOT duplicate bill record logic—reuse existing
7. DO NOT break existing working features

---

# 🎯 PART 1: COLLECTION REPORT PAGE ENHANCEMENT

## 📍 File:

`/app/Billing/collection-report/page.tsx`

---

## ✅ ADD FILTER STATE

```js
const [filters, setFilters] = useState({
  academicYear: '',
  className: 'all',
  section: 'all',
  status: 'all',
  search: ''
});
```

---

## ✅ FETCH CURRENT ACADEMIC YEAR

* Call: `/api/fee-management/academic-years`
* Set latest year as default

```js
useEffect(() => {
  const fetchYears = async () => {
    const res = await fetch('/api/fee-management/academic-years');
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      const latest = data.data[data.data.length - 1];
      setFilters(prev => ({ ...prev, academicYear: latest }));
    }
  };

  fetchYears();
}, []);
```

---

## ✅ FILTER BAR UI (TOP)

Add:

* Academic Year dropdown
* Class dropdown (All + 1–12)
* Section dropdown (All + A/B/C)
* Search input

---

## ✅ ON FILTER CHANGE → FETCH DATA

```js
useEffect(() => {
  if (!filters.academicYear) return;

  fetchData();
}, [filters]);
```

---

## ✅ FETCH FUNCTION

```js
const fetchData = async () => {
  setLoading(true);

  const params = new URLSearchParams(filters);

  const res = await fetch(`/api/billing/collection-report?${params}`);
  const data = await res.json();

  if (data.success) {
    setBills(data.data);
    setSummary(data.summary);
  }

  setLoading(false);
};
```

---

# 🎯 PART 2: DASHBOARD CARDS

## ✅ ADD 3 CARDS

1. Total Received
2. Total Pending
3. Total Bills

---

## ✅ CARD CLICK BEHAVIOR

```js
// Received
onClick={() => setFilters(prev => ({ ...prev, status: 'paid' }))}

// Pending
onClick={() => setFilters(prev => ({ ...prev, status: 'pending' }))}

// All
onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
```

---

## ✅ ACTIVE CARD STYLE

* Add `.active-card` class when selected
* Highlight border + background

---

# 🎯 PART 3: BACKEND API UPDATE

## 📍 File:

`/app/api/billing/collection-report/route.js`

---

## ✅ GET QUERY PARAMS

```js
const { searchParams } = new URL(req.url);

const academicYear = searchParams.get('academicYear');
const className = searchParams.get('className');
const section = searchParams.get('section');
const status = searchParams.get('status');
const search = searchParams.get('search');
```

---

## ✅ GET SCHOOL ID

```js
const schoolId = req.headers.get('x-school-id');
```

---

## ✅ BUILD QUERY

```js
const query = { schoolId, academicYear };

if (className !== 'all') query.className = className;
if (section !== 'all') query.section = section;

if (status === 'paid') query.paymentStatus = 'paid';

if (status === 'pending') {
  query.paymentStatus = { $in: ['pending', 'cheque_pending'] };
}

if (search) {
  query.studentName = { $regex: search, $options: 'i' };
}
```

---

## ✅ FETCH DATA

```js
const bills = await db.collection('bills').find(query).toArray();
```

---

## ✅ CALCULATE SUMMARY

```js
const totalReceived = bills
  .filter(b => b.paymentStatus === 'paid')
  .reduce((sum, b) => sum + b.totalAmount, 0);

const totalPending = bills
  .filter(b => b.paymentStatus !== 'paid')
  .reduce((sum, b) => sum + b.totalAmount, 0);

const totalBills = bills.length;
```

---

## ✅ RETURN RESPONSE

```js
return Response.json({
  success: true,
  data: bills,
  summary: {
    totalReceived,
    totalPending,
    totalBills
  }
});
```

---

# 🎯 PART 4: PRINT BUTTON FIX

## 📍 File:

`/app/Billing/bill-generate/components/BillTemplate.css`

---

## ✅ FIX

```css
.print-btn {
  background: #000;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.print-btn i {
  color: #fff;
}

.print-btn:hover {
  background: #333;
}
```

---

## ✅ IF USING SVG ICON

```css
.print-btn svg {
  fill: #fff;
  stroke: #fff;
}
```

---

# 🎯 PART 5: CSS FILE

## 📍 Create:

`/app/Billing/collection-report/collection-report.css`

---

## ✅ INCLUDE:

* Filter bar (flex layout, spacing)
* Cards (grid, hover, active state)
* Table styling (clean, readable)

---

# 🎯 PART 6: UX IMPROVEMENTS

## ✅ ADD:

* Loading spinner
* Empty state ("No records found")
* Debounced search (300ms)

---

# 🎯 BONUS FEATURES

## ✅ CSV EXPORT

* Button: Export CSV
* Export filtered data

---

## ✅ DEFAULTER SUPPORT

```js
paymentStatus !== 'paid'
```

---

# 🧠 FINAL EXPECTATION

* Fast dashboard
* Smart filters
* Clickable cards
* Clean UI
* Production ready

---

# 💡 FUTURE IMPROVEMENTS

1. Monthly collection graph
2. Class-wise revenue breakdown
3. Defaulter tracking system

---

## 🔚 END OF PROMPT
