Create a **scalable backend** for an Accounting System Configuration Module using:

* Node.js + Express
* TypeScript
* MongoDB + Mongoose
* Nepali calendar (BS) support for all date fields

---

## Architecture

```
src/
  modules/
    organization/
    fiscalYear/
    coa/
    bankCash/
    contacts/
    tax/
  models/
  routes/
  controllers/
  services/
  middlewares/
  utils/
```

---

## Modules & Schemas

### 1. Organization

* Fields: name, panVat, address, phone, email, logo
* Routes: GET, POST, PUT

### 2. Fiscal Year

* Fields: name, startDate (AD), endDate (AD), isActive, isLocked
* Routes: CRUD + activate
* Always store dates in AD; convert from BS on input

### 3. Chart of Accounts

* Fields: name, type (asset/liability/income/expense), parentId, code
* Routes: CRUD

### 4. Bank & Cash Accounts

* Fields: name, type, balance, accountNumber
* Routes: CRUD

### 5. Customers & Vendors

* Fields: name, type (customer/vendor), phone, pan, openingBalance
* Routes: CRUD

### 6. Tax & TDS

* Fields: vatRate (default 13%), tdsRules
* Routes: GET, PUT

---

## Nepali Calendar Integration

* Backend receives BS date → converts to AD before storing
* Backend returns AD → converts to BS before sending to frontend
* Utility module (utils/dateConverter.ts) with `toBS` and `toAD`

---

## Additional Features

* JWT authentication
* Role-based access (Admin, Accountant)
* Validation with Joi or class-validator
* Error handling middleware
* Pagination & search for lists

---

## Output

* Complete folder structure
* Mongoose schemas, controllers, routes
* Sample data
* All APIs fully BS-ready
* Clean, scalable, production-ready code
