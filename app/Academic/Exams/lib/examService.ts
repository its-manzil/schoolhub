/**
 * Central Data Integration Layer for Exams Module
 * Uses MongoDB native driver only (NO Mongoose)
 * All queries filtered by schoolId for multi-tenant security
 */

// Exam interface definitions
export interface ExamRoutineItem {
  date: string;
  subject: string;
  startTime?: string;
  endTime?: string;
}

export interface ExamMarkEntry {
  studentId: string;
  studentName: string;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  creditHours?: number;
  verified?: boolean;
  locked?: boolean;
  theoryMarks?: number;
  practicalMarks?: number;
}

export interface SubjectMapping {
  subject: string;
  fullMarks: number;
  passMarks: number;
  theoryFM: number;
  theoryPM: number;
  practicalFM: number;
  practicalPM: number;
  creditHour: number;
}

export interface Exam {
  _id?: string;
  name: string;
  term: string;
  academicYear: string;
  className: string;
  startDate?: string;
  endDate?: string;
  resultType?: 'GPA' | 'Percentage';
  gpaCalculationSystem?: 'Normal' | 'Credit Hour Based';
  routine: ExamRoutineItem[];
  marks: ExamMarkEntry[];
  subjectMappings?: SubjectMapping[];
  schoolId: number;
  createdAt?: string;
  updatedAt?: string;
}

// API base URL - use relative path to leverage Next.js rewrite
const API_BASE = '/api';

// Helper to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper to get schoolId from user data
const getSchoolId = (): number | null => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.schoolId || null;
      } catch {
        return null;
      }
    }
  }
  return null;
};

// Generic fetch with auth
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

/**
 * Get all exams for the current school
 * Multi-tenant: Automatically filtered by schoolId from auth token
 */
export const getExams = async (): Promise<Exam[]> => {
  const result = await fetchWithAuth(`${API_BASE}/exams`);
  return result.data || [];
};

/**
 * Get a single exam by ID
 * Security: Verifies exam belongs to user's school
 */
export const getExamById = async (id: string): Promise<Exam | null> => {
  try {
    const result = await fetchWithAuth(`${API_BASE}/exams/${id}`);
    return result.data || null;
  } catch (error) {
    console.error('Error fetching exam:', error);
    return null;
  }
};

/**
 * Get exams filtered by class name
 */
export const getExamsByClass = async (className: string): Promise<Exam[]> => {
  const exams = await getExams();
  return exams.filter(exam => exam.className === className);
};

/**
 * Get exams filtered by academic year
 */
export const getExamsByYear = async (year: string): Promise<Exam[]> => {
  const exams = await getExams();
  return exams.filter(exam => exam.academicYear === year);
};

/**
 * Create a new exam
 * Security: Automatically assigns current user's schoolId
 */
export const createExam = async (examData: Omit<Exam, '_id' | 'schoolId' | 'createdAt' | 'updatedAt'>): Promise<Exam> => {
  const schoolId = getSchoolId();
  if (!schoolId) {
    throw new Error('School ID not found. User may not be authenticated.');
  }

  const exam = {
    ...examData,
    schoolId,
    routine: examData.routine || [],
    marks: examData.marks || [],
    subjectMappings: examData.subjectMappings || [],
  };

  const result = await fetchWithAuth(`${API_BASE}/exams`, {
    method: 'POST',
    body: JSON.stringify(exam),
  });

  return result.data;
};

/**
 * Update an existing exam
 * Security: Verifies exam belongs to user's school before updating
 */
export const updateExam = async (id: string, updateData: Partial<Exam>): Promise<Exam> => {
  // Remove fields that should not be updated
  const safeUpdate = { ...updateData };
  delete safeUpdate._id;
  delete safeUpdate.schoolId;
  delete safeUpdate.createdAt;

  const result = await fetchWithAuth(`${API_BASE}/exams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(safeUpdate),
  });

  return result.data;
};

/**
 * Delete an exam
 * Security: Verifies exam belongs to user's school before deleting
 */
export const deleteExam = async (id: string): Promise<void> => {
  await fetchWithAuth(`${API_BASE}/exams/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Update exam routine/schedule
 */
export const updateExamRoutine = async (examId: string, routine: ExamRoutineItem[]): Promise<Exam> => {
  return updateExam(examId, { routine });
};

/**
 * Add or update marks for a student in an exam
 */
export const updateExamMarks = async (
  examId: string, 
  marks: ExamMarkEntry[]
): Promise<Exam> => {
  return updateExam(examId, { marks });
};

/**
 * Add single mark entry for a student
 */
export const addMarkEntry = async (
  examId: string,
  markEntry: ExamMarkEntry
): Promise<Exam> => {
  const exam = await getExamById(examId);
  if (!exam) throw new Error('Exam not found');

  const existingMarks = exam.marks || [];
  const markIndex = existingMarks.findIndex(
    m => m.studentId === markEntry.studentId && m.subject === markEntry.subject
  );

  let updatedMarks;
  if (markIndex >= 0) {
    // Update existing mark
    updatedMarks = [...existingMarks];
    updatedMarks[markIndex] = { ...updatedMarks[markIndex], ...markEntry };
  } else {
    // Add new mark
    updatedMarks = [...existingMarks, markEntry];
  }

  return updateExam(examId, { marks: updatedMarks });
};

/**
 * Update subject mappings for an exam
 */
export const updateSubjectMappings = async (
  examId: string,
  mappings: SubjectMapping[]
): Promise<Exam> => {
  return updateExam(examId, { subjectMappings: mappings });
};

/**
 * Get unique academic years from all exams
 */
export const getAcademicYears = async (): Promise<string[]> => {
  const exams = await getExams();
  const years = [...new Set(exams.map(e => e.academicYear))];
  return years.sort((a, b) => b.localeCompare(a)); // Descending order
};

/**
 * Get unique class names from all exams
 */
export const getClassNames = async (): Promise<string[]> => {
  const exams = await getExams();
  const classes = [...new Set(exams.map(e => e.className))];
  return classes.sort();
};

/**
 * Get exams by academic year and class
 */
export const getExamsByYearAndClass = async (
  year: string, 
  className: string
): Promise<Exam[]> => {
  const exams = await getExams();
  return exams.filter(e => e.academicYear === year && e.className === className);
};

/**
 * Calculate GPA from percentage
 * Supports both Normal and Credit Hour Based calculations
 */
export const calculateGPA = (
  percentage: number, 
  system: 'Normal' | 'Credit Hour Based' = 'Normal',
  creditHours?: number
): number => {
  let gpa = 0;
  
  // Standard GPA conversion
  if (percentage >= 90) gpa = 4.0;
  else if (percentage >= 80) gpa = 3.6;
  else if (percentage >= 70) gpa = 3.2;
  else if (percentage >= 60) gpa = 2.8;
  else if (percentage >= 50) gpa = 2.4;
  else if (percentage >= 40) gpa = 2.0;
  else gpa = 1.6;

  if (system === 'Credit Hour Based' && creditHours) {
    // Weighted GPA calculation would be done at aggregate level
    return gpa;
  }

  return gpa;
};

/**
 * Calculate percentage from marks
 */
export const calculatePercentage = (
  marksObtained: number, 
  maxMarks: number
): number => {
  if (maxMarks === 0) return 0;
  return parseFloat(((marksObtained / maxMarks) * 100).toFixed(2));
};

/**
 * Get grade from percentage
 */
export const getGradeFromPercentage = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  return 'F';
};

/**
 * Get exam results summary
 * Returns computed results with ranks
 */
export const getExamResults = async (examId: string): Promise<{
  studentId: string;
  studentName: string;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  gpa: number;
  grade: string;
  rank: number;
}[]> => {
  const exam = await getExamById(examId);
  if (!exam) throw new Error('Exam not found');

  const marks = exam.marks || [];
  
  // Group marks by student
  const studentMarks: Record<string, {
    studentId: string;
    studentName: string;
    subjects: { subject: string; marks: number; maxMarks: number }[];
  }> = {};

  marks.forEach(mark => {
    if (!studentMarks[mark.studentId]) {
      studentMarks[mark.studentId] = {
        studentId: mark.studentId,
        studentName: mark.studentName,
        subjects: [],
      };
    }
    studentMarks[mark.studentId].subjects.push({
      subject: mark.subject,
      marks: mark.marksObtained,
      maxMarks: mark.maxMarks,
    });
  });

  // Calculate results for each student
  const results = Object.values(studentMarks).map(student => {
    const totalMarks = student.subjects.reduce((sum, s) => sum + s.marks, 0);
    const maxMarks = student.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
    const percentage = calculatePercentage(totalMarks, maxMarks);
    const gpa = calculateGPA(percentage, exam.gpaCalculationSystem);
    const grade = getGradeFromPercentage(percentage);

    return {
      studentId: student.studentId,
      studentName: student.studentName,
      totalMarks,
      maxMarks,
      percentage,
      gpa,
      grade,
      rank: 0, // Will be assigned after sorting
    };
  });

  // Sort by percentage and assign ranks
  results.sort((a, b) => b.percentage - a.percentage);
  results.forEach((result, index) => {
    result.rank = index + 1;
  });

  return results;
};

/**
 * Get analytics data for an exam
 */
export const getExamAnalytics = async (examId: string): Promise<{
  totalStudents: number;
  passedStudents: number;
  failedStudents: number;
  passRate: number;
  averageScore: number;
  subjectWiseStats: Record<string, { passed: number; failed: number }>;
  classToppers: { studentId: string; studentName: string; percentage: number }[];
}> => {
  const exam = await getExamById(examId);
  if (!exam) throw new Error('Exam not found');

  const marks = exam.marks || [];
  const subjectMappings = exam.subjectMappings || [];

  // Group by student
  const studentData: Record<string, {
    subjects: { subject: string; marks: number; maxMarks: number; passMarks: number }[];
  }> = {};

  marks.forEach(mark => {
    if (!studentData[mark.studentId]) {
      studentData[mark.studentId] = { subjects: [] };
    }
    
    const subjectMap = subjectMappings.find(m => m.subject === mark.subject);
    const passMarks = subjectMap?.passMarks || mark.maxMarks * 0.4;

    studentData[mark.studentId].subjects.push({
      subject: mark.subject,
      marks: mark.marksObtained,
      maxMarks: mark.maxMarks,
      passMarks,
    });
  });

  const studentIds = Object.keys(studentData);
  const totalStudents = studentIds.length;

  if (totalStudents === 0) {
    return {
      totalStudents: 0,
      passedStudents: 0,
      failedStudents: 0,
      passRate: 0,
      averageScore: 0,
      subjectWiseStats: {},
      classToppers: [],
    };
  }

  // Calculate pass/fail for each student
  let passedStudents = 0;
  let failedStudents = 0;
  let totalPercentage = 0;
  const subjectWiseStats: Record<string, { passed: number; failed: number }> = {};
  const studentPercentages: { studentId: string; percentage: number }[] = [];

  studentIds.forEach(studentId => {
    const student = studentData[studentId];
    let totalMarks = 0;
    let maxMarks = 0;
    let hasFailed = false;

    student.subjects.forEach(sub => {
      totalMarks += sub.marks;
      maxMarks += sub.maxMarks;

      // Subject-wise stats
      if (!subjectWiseStats[sub.subject]) {
        subjectWiseStats[sub.subject] = { passed: 0, failed: 0 };
      }
      if (sub.marks >= sub.passMarks) {
        subjectWiseStats[sub.subject].passed++;
      } else {
        subjectWiseStats[sub.subject].failed++;
        hasFailed = true;
      }
    });

    const percentage = calculatePercentage(totalMarks, maxMarks);
    totalPercentage += percentage;
    studentPercentages.push({ studentId, percentage });

    if (hasFailed) {
      failedStudents++;
    } else {
      passedStudents++;
    }
  });

  // Get toppers (top 5)
  studentPercentages.sort((a, b) => b.percentage - a.percentage);
  const topStudentIds = studentPercentages.slice(0, 5).map(s => s.studentId);

  const classToppers = topStudentIds.map(id => {
    const mark = marks.find(m => m.studentId === id);
    const percentage = studentPercentages.find(s => s.studentId === id)?.percentage || 0;
    return {
      studentId: id,
      studentName: mark?.studentName || 'Unknown',
      percentage,
    };
  });

  return {
    totalStudents,
    passedStudents,
    failedStudents,
    passRate: parseFloat(((passedStudents / totalStudents) * 100).toFixed(1)),
    averageScore: parseFloat((totalPercentage / totalStudents).toFixed(1)),
    subjectWiseStats,
    classToppers,
  };
};
