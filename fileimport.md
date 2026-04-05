Build a high-performance "Student Data Import System" in Next.js (App Router) with a Node.js backend (API routes or separate server).

🎯 Goal:
Allow schools to upload CSV/XLSX files with up to:

* 100+ columns
* 50,000+ rows

System must handle dynamic column mapping, validation, and efficient bulk import.

---

🧩 FRONTEND (Next.js - NO Tailwind, use plain CSS or CSS Modules):

1. Create page: /import-students

2. File Upload:

* Accept .csv and .xlsx
* Drag & drop + file picker
* Show file name + size

3. File Parsing Strategy (IMPORTANT):

* DO NOT load entire file into React state
* Use streaming or chunk-based parsing
* Use libraries:

  * papaparse (CSV with worker: true)
  * xlsx (only for header extraction, avoid full load)

4. Extract ONLY headers initially:

* Display headers for mapping
* Do NOT render all 50k rows

---

🧩 COLUMN MAPPING UI:

* Show list of uploaded file columns (100+ possible)
* For each column:

  * Dropdown to map to system field

System Fields:

* name (required)
* class (required)
* roll_no
* phone
* address
* dob
* gender

Features:

* Auto-mapping using keyword matching
* Searchable dropdown (important for many fields)
* Allow "Ignore" option
* Allow "Create Custom Field"

---

🧠 PERFORMANCE RULES:

* Never render full dataset in UI
* Show only preview (first 10–20 rows)
* Use virtualization if needed
* Use Web Workers for parsing (PapaParse worker mode)

---

🧪 VALIDATION:

* Validate only preview first
* Full validation should happen on backend
* Show:

  * Missing required mappings
  * Duplicate column mapping warnings

---

🚀 IMPORT PROCESS (CRITICAL):

1. On import click:

* Send file to backend (NOT parsed full data)
* Send mapping config JSON

2. Backend handles heavy work

---

⚙️ BACKEND (Next.js API or Express recommended):

1. File Upload Endpoint:
   POST /api/import/upload

2. Use streaming parser:

* CSV → fast-csv or papaparse node stream
* XLSX → convert to stream or process in chunks

3. Process in CHUNKS (VERY IMPORTANT):

* Batch size: 500–1000 rows
* Transform each row using mapping config

4. Bulk Insert:

* Use database bulk insert (NOT one-by-one)
* Example:

  * MongoDB: insertMany
  * SQL: bulk insert

5. Handle:

* Missing required fields
* Data type validation
* Duplicate detection

6. Track Progress:

* Store import job in DB:

  * status (processing, completed, failed)
  * total rows
  * processed rows

7. Return job ID to frontend

---

📊 FRONTEND PROGRESS UI:

* Poll backend every 2–3 seconds
* Show:

  * Progress bar
  * Rows processed
  * Errors count

---

🧱 DATABASE:

Tables:

* students
* custom_fields
* student_custom_values
* import_jobs (track progress)
* import_templates (mapping config)

---

🎨 UI (NO Tailwind):

* Use CSS Modules
* Clean table layout for mapping
* Sticky header for large column lists
* Scrollable container

---

🔥 BONUS FEATURES:

* Save mapping template per school
* Retry failed imports
* Download error report (CSV)
* Cancel import job

---

🧠 CRITICAL RULES:

* Must handle 50k+ rows without crashing
* Must not block UI thread
* Must not load full dataset into memory on frontend
* Backend must use streaming + batching

---

Output:

* Next.js frontend components
* API routes or Express backend
* Chunk processing logic
* Database schema
* Clear folder structure
