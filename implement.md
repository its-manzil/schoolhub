You are working on a production-grade Next.js (App Router) project for a School ERP system called "SchoolHub".

⚠️ CRITICAL RULES (DO NOT VIOLATE):
- Do NOT modify any unrelated files or folders outside: /app/Academic/Exams/
- Do NOT delete or remove any existing pages or sections in Exams module
- Do NOT use Tailwind CSS anywhere
- Use only plain CSS (existing CSS files must be extended, not replaced)
- Backend must use MongoDB native driver ONLY (NO Mongoose)
- Maintain all current routes and folder structure exactly as it is
- Keep system secure (no public access to sensitive APIs without auth)
- Do not break existing UI or navigation
- Do not rename files or routes
- Ensure backward compatibility with existing API endpoints
- Use environment variables for sensitive data

---

# STEP 1: CENTRAL DATA INTEGRATION LAYER (CRITICAL)
Create a shared data access layer for Exams module:

Create:
/app/Academic/Exams/lib/examService.ts

This file must:
- Use MongoDB native driver (mongodb package)
- Provide reusable functions:
  - getExams(schoolId)
  - getExamById(id, schoolId)
  - createExam(data)
  - updateExam(id, data)
  - deleteExam(id)
- Ensure all queries are filtered by schoolId (multi-tenant security)
- Never expose raw database outside this service layer

---

# STEP 2: CONNECT ALL PAGES TO REAL DATA (REMOVE MOCK DATA GRADUALLY)

Update the following pages to replace ALL dummy/mock data with API or service calls:

## 2.1 Configuration Page
- Replace mock exam list with getExams()
- Add real CRUD integration:
  - Create exam → POST API
  - Edit exam → PUT API
  - Delete exam → DELETE API

---

## 2.2 Routine Page
- Replace mock schedule data
- Use exam.routine from database
- Save routine updates back to database via updateExam()

---

## 2.3 Admit Card Page
- Replace mock student list with real student API:
  - Fetch students based on class and exam
- Integrate:
  - exam routine
  - student details
- Ensure admit card reflects real DB data

---

## 2.4 Subject Map Page
- Replace hardcoded subjects with:
  - subject collection (or exam subject config inside DB)
- Save mappings per exam + class
- Persist changes in MongoDB

---

## 2.5 Marks Entry Page
- Replace mock students and subjects
- Fetch:
  - students (filtered by class)
  - subjects (from subject map)
- Save marks into:
  - exam.marks array in MongoDB
- Ensure:
  - real-time save
  - validation for marks range

---

## 2.6 Result Page
- REMOVE all dummy CGPA and rank values
- Compute results dynamically from marks:
  - total marks
  - percentage
  - GPA conversion logic
  - rank calculation per class
- Store computed result if needed in DB

---

## 2.7 Analytics Page
- REMOVE all hardcoded stats
- Build analytics from MongoDB data:
  - total students
  - pass/fail calculation
  - subject failure count
  - topper detection per class
- Ensure aggregation queries are optimized

---

# STEP 3: CREATE STUDENT INTEGRATION (NEW BUT SAFE ADDITION)

Create a service ONLY (do not modify other modules):

/app/Academic/Exams/lib/studentService.ts

Functions:
- getStudentsByClass(className)
- getStudentById(id)
- getAllStudents()

Use MongoDB native driver only.

---

# STEP 4: SECURITY HARDENING

Ensure:
- All API routes verify authentication token
- Each request checks:
  - schoolId match
  - role permissions (Academic / Admin only)
- Prevent unauthorized access to:
  - marks
  - results
  - exam configuration

---

# STEP 5: BACKEND CONSISTENCY (MongoDB Native ONLY)

In backend (/server or /api routes):
- Remove any Mongoose usage if exists
- Use MongoClient from mongodb package
- Always use:
  - async/await
  - try/catch error handling
- Ensure indexes for:
  - schoolId
  - examId
  - studentId

---

# STEP 6: DATA FLOW ENFORCEMENT (VERY IMPORTANT)

Enforce this system logic:

1. Configuration → creates exam
2. SubjectMap → defines subjects per class
3. Routine → attaches schedule to exam
4. Students → fetched from student collection
5. MarksEntry → stores marks per student per exam
6. Result → computed from marks
7. Analytics → computed from results

DO NOT break this flow.

---

# STEP 7: REMOVE MOCK DATA SAFELY

Search and remove ONLY:
- arrays like:
  const students = [...]
  const exams = [...]
  const results = [...]

Replace with:
- API calls or service functions

DO NOT remove UI components.

---

# STEP 8: PERFORMANCE OPTIMIZATION

- Use pagination for:
  - students
  - marks
- Use aggregation pipeline for analytics
- Avoid fetching full dataset unnecessarily

---

# STEP 9: FINAL VALIDATION CHECK

Before finishing:
- Ensure no mock data remains
- Ensure all pages connect to MongoDB
- Ensure no Tailwind classes exist
- Ensure no Mongoose usage exists
- Ensure all routes still work
- Ensure UI layout is unchanged

---

# END OF TASK
You must implement this carefully without breaking existing system stability.