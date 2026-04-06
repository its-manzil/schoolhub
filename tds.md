You are working on a Next.js (App Router) + MongoDB (without Mongoose) accounting system.

## CONTEXT

We already built a Tax Configuration system at:
`/SchoolAdmin/Accounting/configuration/tax`

This stores:

* VAT
* Tax Rules (FIXED / SLAB / FINAL)
* Revenue Code
* Thresholds

---

## PROBLEM

The page:
`/SchoolAdmin/Accounting/tds`

is currently:
❌ Using hardcoded tax rates (rateMap, tdsRates, revenueCodeMap)
❌ Using mock data (entries, challans, payees)
❌ Not connected to database
❌ Not using schoolId
❌ Not using configured tax rules

---

## GOAL

Convert this page into a **fully dynamic, database-driven TDS system**

---

## 1. REMOVE ALL HARDCODED DATA

Delete:

* tdsRates
* rateMap
* revenueCodeMap
* mockEntries
* mockChallans
* mockPayees

---

## 2. FETCH TAX RULES

From:
GET `/api/accounting/tax?schoolId=xxx`

Store:

```ts
const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
```

---

## 3. PAYMENT TYPE DROPDOWN

Replace static dropdown with:

```tsx
<select>
  {taxRules.map(rule => (
    <option key={rule.id} value={rule.id}>
      {rule.name}
    </option>
  ))}
</select>
```

---

## 4. TDS CALCULATION ENGINE

When user selects a rule:

### FIXED / FINAL

```ts
tds = gross * rule.rate / 100
```

### SLAB (IMPORTANT)

```ts
function calculateSlabTax(amount, slabs) {
  let tax = 0;
  for (const slab of slabs) {
    if (amount > slab.from) {
      const taxable = Math.min(amount, slab.to ?? amount) - slab.from;
      tax += taxable * slab.rate / 100;
    }
  }
  return tax;
}
```

---

## 5. AUTO FILL FIELDS

Based on selected rule:

* rate
* revenueCode
* threshold hints

---

## 6. SAVE ENTRY (NO MOCK)

POST `/api/accounting/tds-entry`

```json
{
  "schoolId": "1001",
  "payeeId": "...",
  "ruleId": "...",
  "gross": 50000,
  "tds": 7500,
  "net": 42500,
  "date": "...",
  "narration": "...",
  "status": "pending"
}
```

---

## 7. LOAD REAL DATA

Replace all mock arrays with:

### Entries:

GET `/api/accounting/tds-entry?schoolId=xxx`

### Payees:

GET `/api/accounting/payees?schoolId=xxx`

### Challans:

GET `/api/accounting/tds-challan?schoolId=xxx`

---

## 8. PAYEE SELECTION (IMPORTANT)

Replace text input with:

* searchable dropdown
* auto-fill PAN + category

---

## 9. CHALLAN SYSTEM

POST `/api/accounting/tds-challan`

* Link entries to challan
* Store:

  * total amount
  * revenueCode
  * period

---

## 10. DASHBOARD (REAL DATA)

Compute:

* total TDS this month
* pending deposits
* total payees

Use MongoDB aggregation

---

## 11. CERTIFICATE SYSTEM

Generate from:

* payee
* entries
* rule

NOT mock data

---

## 12. SCHOOL MULTI-TENANCY (CRITICAL)

EVERY API:

* must include `schoolId`
* must filter by `schoolId`

---

## 13. VALIDATION

* PAN must be 9 digits
* gross > 0
* rule must exist
* prevent empty save

---

## FINAL RESULT

✔ TDS page uses Tax Configuration dynamically
✔ No hardcoded tax logic
✔ Fully database driven
✔ Real IRD-compliant workflow
✔ Multi-school safe
✔ Production-ready

---

Do NOT use dummy data anywhere.
