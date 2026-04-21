# Exams Module - Complete Analysis

## Overview
The Exams module is a comprehensive examination management system within the SchoolHub application. It provides functionality for creating exams, managing routines, generating admit cards, entering marks, calculating results, and viewing analytics.

---

## Directory Structure

```
app/Academic/Exams/
├── page.tsx                      # Main entry page (welcome screen)
├── layout.tsx                    # Root layout with sidebar navigation
├── exam.css                      # Global exam styles (815 lines)
├── layout.css                    # Layout container styles
├── legacy-exam-functions.tsx     # Legacy code reference (preserved functions)
├── page_backup.tsx               # Backup of original monolithic page
├── ExamSidebar.tsx               # Sidebar navigation component
├── ExamSidebar.module.css        # Sidebar styles
├── components/
│   ├── ExamLayout.tsx            # Alternative layout component
│   ├── ExamLayout.css            # Layout styles (347 lines)
│   └── ExamSubNav.tsx            # Sub-navigation wrapper
├── Create/
│   └── page.tsx                  # Exam creation with routine & admit card
├── AdmitCard/
│   ├── page.tsx                  # Admit card generation & printing
│   └── admit-card.css            # Admit card styles
├── Analytics/
│   ├── page.tsx                  # Performance dashboards & statistics
│   └── analytics.css             # Analytics styles
├── Configuration/
│   ├── page.tsx                  # Exam configuration & settings
│   └── configuration.css         # Configuration styles
├── Marks/
│   └── page.tsx                  # Legacy marks entry page
├── MarksEntry/
│   ├── page.tsx                  # New marks entry with side panel
│   └── marks.css                 # Marks entry styles
├── Result/
│   ├── page.tsx                  # Result viewing & marksheets
│   └── result.css                # Result styles
├── Routine/
│   ├── page.tsx                  # Exam routine/schedule management
│   └── routine.css               # Routine styles
└── SubjectMap/
    ├── page.tsx                  # Subject mapping & credit hours
    └── mapping.css               # Subject mapping styles
```

---

## Frontend Architecture

### 1. Main Entry Point (`page.tsx`)
- **Purpose**: Welcome screen for the Exams section
- **Components**: AcademicNavbar, ExamSubNav
- **Route**: `/Academic/Exams`

### 2. Layout System (`layout.tsx`)
- **Type**: Client component ('use client')
- **Structure**:
  - AcademicNavbar (top navigation)
  - ExamSidebar (left navigation)
  - Main content area with exam-main-content wrapper
- **Styling**: Uses layout.css + exam.css

### 3. Navigation Components

#### ExamSidebar (`ExamSidebar.tsx`)
- **Type**: Client component with `usePathname` hook
- **Navigation Items**:
  - Analytics (BarChart2 icon)
  - Configuration (Settings icon)
  - Routine (Calendar icon)
  - Admit Card (CreditCard icon)
  - Subject Map (Map icon)
  - Marks Entry (Edit3 icon)
  - Result (FileText icon)
- **Features**: Active state highlighting, dynamic base path detection

#### ExamSubNav (`ExamSubNav.tsx`)
- **Purpose**: Sub-navigation wrapper for exam sections
- **Usage**: Wraps content in `page.tsx`

---

## Sub-Pages Detailed Analysis

### 1. Analytics Page (`Analytics/page.tsx`)
**Purpose**: Exam performance dashboards and statistics

**Features**:
- **School Topper Card**: Displays overall school topper with GPA, percentage, and rank
- **Stats Grid** (4 cards):
  - Total Students (450)
  - Passed Students (415 - 92.2% pass rate)
  - Failed Students (35 - 7.8% fail rate)
  - Average Score (78.5%)
- **Classwise Performance Table**: Shows passed/failed counts per class
- **Subject Failure Ranking**: Ranks subjects by failure count
- **Class Toppers List**: Top performers per class
- **Exam Overview**: Text summary with action items

**Data**: Currently uses mock data

---

### 2. Configuration Page (`Configuration/page.tsx`)
**Purpose**: Create and manage exam configurations

**Features**:
- **Create Exam Form**:
  - Academic Year (BS - Bikram Sambat)
  - Exam Type dropdown (First Mid-Term, First Terminal, Second Mid-Term, Second Terminal, Final Examination)
  - Start/End Date pickers
  - Result Type (GPA or Percentage)
  - GPA Calculation System (Normal or Credit Hour Based)
  - Class selection grid (Nursery to Class 12)
- **Configured Exams List**: Table showing existing exams with edit/delete actions
- **Edit Modal**: Popup for editing exam details

**Data**: Uses mock data for exam list

---

### 3. Routine Page (`Routine/page.tsx`)
**Purpose**: Manage exam schedules and timetables

**Features**:
- **Roadmap Dropdowns**: Academic Year, Exam Name, Class selection
- **Routine Entry Form**:
  - Dynamic rows for subject + date
  - Add/Remove subject rows
  - Duplicate date detection with alert modal
  - Save/Reset actions
- **Routine Preview**:
  - Excel-style table view
  - Classes as rows, dates as columns
  - PDF download and Print functionality

**Mock Data**:
- Dates: 6 days (Sunday to Friday, BS dates)
- Classes: Class 1-5

---

### 4. Admit Card Page (`AdmitCard/page.tsx`)
**Purpose**: Generate and print student admit cards

**Features**:
- **Dropdown Roadmap**: Academic Year, Exam Type, Class
- **Student List**:
  - Search by name or roll number
  - Columns: Roll No, Student Name, Symbol Number, Actions
  - Status indicators
- **Bulk Actions**: Bulk ID Card, Bulk Print Admit Cards
- **Action Icons**: View preview, Print, Download PDF
- **Preview Modal**:
  - School header (SIDDHA ADARBHUT BIDHYALA)
  - Student info grid (Name, Roll, Class, Section, Symbol No)
  - Exam schedule table
  - Print & Download buttons

**Mock Students**: 5 students (Class 10, symbols 20811001-20811005)

---

### 5. Subject Map Page (`SubjectMap/page.tsx`)
**Purpose**: Configure subject marking schemes and credit hours

**Features**:
- **Dropdown Roadmap**: Academic Year, Exam Type, Class
- **Subject Mapping Table**:
  - Columns: Subject, Full Marks, Pass Marks, Theory FM, Theory PM, Practical FM, Credit Hour
  - Editable input fields
- **Configured Mappings**: Card grid showing saved configurations
- **Edit Modal**: Detailed editing for selected subject

**Mock Subjects**: Mathematics, Science, English, Social Studies

---

### 6. Marks Entry Page (`MarksEntry/page.tsx`)
**Purpose**: Enter student marks with side panel interface

**Features**:
- **Dropdown Roadmap**: Academic Year, Exam Type, Class
- **Student Table**:
  - Search functionality
  - Entry status badges (Pending/Completed)
  - Edit action button
- **Entry Status Summary**: Shows completed/total count
- **Side Panel (Right)**:
  - Student info display
  - Subject-wise marks entry
  - Theory and Practical input fields
  - Save & Cancel buttons

**Mock Data**: 5 students, 4 subjects with theory/practical split

---

### 7. Marks Page (`Marks/page.tsx`) - Legacy
**Purpose**: Full-featured marks entry with backend integration

**Features**:
- Backend API integration (fetches real exams)
- Exam selection table
- Marks entry form with fields:
  - Student ID, Name, Subject
  - Marks Obtained, Max Marks
  - Credit Hours, Verified checkbox, Locked status
- **GPA Calculation**: Weighted percentage to GPA conversion
  - 90%+ = 4.0, 80%+ = 3.6, 70%+ = 3.2, etc.
- **PDF Export**: Uses html2canvas + jsPDF
- **Row-level save**: Individual mark saving
- **Lock/Verify**: Bulk lock and verify marks

**Backend Integration**:
- GET `/api/academic/exams` - Fetch exams
- PUT `/api/academic/exams/:id` - Update marks

---

### 8. Result Page (`Result/page.tsx`)
**Purpose**: View and print student results/marksheets

**Features**:
- **Dropdown Roadmap**: Academic Year, Exam Type, Class
- **Results Table**:
  - Columns: Roll No, Student Name, CGPA, Rank, Actions
  - CGPA badges (blue), Rank badges (orange)
  - Search functionality
- **Bulk Actions**: Bulk Save Results, Bulk Print Marksheets
- **Action Icons**: Preview, Print, Save
- **Result Preview Modal**:
  - School header with logo area
  - Student information grid
  - Subject-wise marks table (Theory + Practical)
  - Result summary (Total CGPA, Grade, Class Rank)
  - Print & Download buttons

**Mock Results**: 5 students with CGPA and ranks

---

### 9. Create Page (`Create/page.tsx`) - Legacy/Combined
**Purpose**: Original exam creation with integrated routine and admit card

**Features**:
- Exam creation with multi-class selection
- Routine management with class dropdown
- Admit card generation form
- Existing exams list
- Print preview for routine (weekly schedule format)
- Admit card preview with exam schedule

**Note**: This appears to be a legacy page with comprehensive functionality

---

## Backend API (`server/pages/Academic/exams.js`)

### Database
- **Collection**: `exams` (MongoDB)
- **Middleware**: Authentication required (`verifyToken`, `requireAcademicOrSchoolAdmin`)

### Endpoints

#### 1. GET `/api/academic/exams`
- **Auth**: Required (Academic or SchoolAdmin roles)
- **Response**: List of exams for user's school
- **Sorting**: By createdAt (descending)

#### 2. GET `/api/academic/exams/:id`
- **Auth**: Required
- **Response**: Single exam by ID
- **Validation**: Must belong to user's school

#### 3. POST `/api/academic/exams`
- **Auth**: Required
- **Body Fields**:
  - `name` (required)
  - `term` (required)
  - `academicYear` (required)
  - `className` (required)
  - `startDate` (optional)
  - `endDate` (optional)
  - `routine` (array, optional)
- **Defaults**: marks = [], createdAt/updatedAt timestamps

#### 4. PUT `/api/academic/exams/:id`
- **Auth**: Required
- **Body**: Any exam fields to update
- **Protection**: Cannot modify schoolId or createdAt
- **Updates**: updatedAt timestamp automatically

#### 5. DELETE `/api/academic/exams/:id`
- **Auth**: Required
- **Validation**: Must belong to user's school

### Data Model
```typescript
interface Exam {
  _id: string
  name: string
  term: string
  academicYear: string
  className: string
  startDate: string | null
  endDate: string | null
  routine: ExamRoutineItem[]
  marks: ExamMarkEntry[]
  schoolId: number
  createdAt: string
  updatedAt: string
}

interface ExamRoutineItem {
  date: string
  subject: string
  startTime: string
  endTime: string
}

interface ExamMarkEntry {
  studentId: string
  studentName: string
  subject: string
  marksObtained: number
  maxMarks: number
  creditHours: number
  verified?: boolean
  locked?: boolean
}
```

---

## Styling System

### CSS Variables (from exam.css)
```css
--exam-primary: #10b981        /* Emerald green */
--exam-primary-dark: #059669
--exam-bg: #f8fafc             /* Light gray background */
--exam-surface: #ffffff       /* White cards */
--exam-text: #1f2937          /* Dark text */
--exam-text-muted: #6b7280    /* Gray text */
--exam-border: #e5e7eb        /* Light borders */
--exam-success: #10b981
--exam-warning: #f59e0b
--exam-error: #ef4444
```

### Common Component Classes
- `.academic-layout` - Main layout container
- `.academic-card` - Card containers
- `.academic-table` - Data tables
- `.academic-form` - Form containers
- `.academic-btn` / `.academic-btn.primary` - Buttons
- `.academic-form-row` - Form field rows

### Responsive Breakpoints
- 1200px: Grid collapses to single column
- 1024px: Sidebar becomes overlay on mobile
- 768px: Stack layouts, full-width buttons
- 480px: Reduced padding, smaller fonts

---

## Key Features Summary

### Exam Management
- Create exams with term, year, class
- Multi-class selection support
- Date range configuration

### Routine Management
- Subject-wise exam scheduling
- Excel-style preview
- Print-friendly layout
- Duplicate date detection

### Admit Cards
- Individual student generation
- Bulk printing capability
- School branding support
- PDF download option

### Marks Entry
- Table-based entry
- Side panel interface (new)
- Theory/Practical split
- Verification & locking

### Results
- CGPA calculation
- Rank determination
- Marksheet generation
- Print & PDF export

### Analytics
- Pass/fail statistics
- Subject-wise failure analysis
- Class toppers display
- School topper highlight

---

## Technical Notes

### Dependencies Used
- `lucide-react` - Icons
- `html2canvas` - PDF generation (Marks page)
- `jspdf` - PDF export (Marks page)

### Authentication
- Token stored in `localStorage`
- Bearer token sent in Authorization header
- Role-based access (Academic, SchoolAdmin, SuperAdmin)

### Date Handling
- Uses Bikram Sambat (BS) calendar for academic years
- ISO format for storage (YYYY-MM-DD)

### State Management
- React useState for local state
- No global state management (Redux/Context) used
- Data fetching via useEffect

---

## Routes Reference

| Route | Page | Description |
|-------|------|-------------|
| `/Academic/Exams` | page.tsx | Welcome screen |
| `/Academic/Exams/Analytics` | Analytics/page.tsx | Dashboard |
| `/Academic/Exams/Configuration` | Configuration/page.tsx | Exam setup |
| `/Academic/Exams/Routine` | Routine/page.tsx | Schedule |
| `/Academic/Exams/AdmitCard` | AdmitCard/page.tsx | Admit cards |
| `/Academic/Exams/SubjectMap` | SubjectMap/page.tsx | Subject config |
| `/Academic/Exams/MarksEntry` | MarksEntry/page.tsx | Marks entry |
| `/Academic/Exams/Marks` | Marks/page.tsx | Legacy marks |
| `/Academic/Exams/Result` | Result/page.tsx | Results |
| `/Academic/Exams/Create` | Create/page.tsx | Legacy create |

---

## Future Improvements Needed

1. **Backend Integration**: Most sub-pages use mock data
2. **Real Data**: Connect Analytics, Configuration, AdmitCard to backend
3. **Consolidation**: Merge Marks and MarksEntry pages
4. **Validation**: Add form validation across all forms
5. **Error Handling**: Improve error states and user feedback
6. **Loading States**: Add skeleton loaders for data fetching
7. **Search**: Implement backend search for students
8. **Bulk Operations**: Implement actual bulk print/save functionality
9. **PDF Templates**: Create proper PDF templates for marksheets
10. **Date Conversion**: Add BS/AD date converter for Nepal calendar
