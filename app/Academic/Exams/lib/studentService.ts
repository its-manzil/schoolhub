/**
 * Student Integration Service for Exams Module
 * Uses MongoDB native driver only (NO Mongoose)
 * Provides student data access for admit cards and marks entry
 */

// Student interface
export interface Student {
  _id?: string;
  studentId: string;
  name: string;
  gender?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  address?: string;
  fatherName?: string;
  motherName?: string;
  className: string;
  section?: string;
  rollNumber?: number;
  bloodGroup?: string;
  emergencyContact?: string;
  admissionDate?: string;
  admissionYear?: number;
  profilePicture?: string;
  schoolId: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056/api';

// Helper to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper to get schoolId from user data
const _getSchoolId = (): number | null => { // eslint-disable-line @typescript-eslint/no-unused-vars
  // Available for future use when schoolId needs to be retrieved from localStorage

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
 * Get all students for the current school
 * Multi-tenant: Automatically filtered by schoolId from auth token
 */
export const getAllStudents = async (): Promise<Student[]> => {
  const result = await fetchWithAuth(`${API_BASE}/students`);
  return result.data || [];
};

/**
 * Get students filtered by class name
 * Used for admit cards and marks entry
 */
export const getStudentsByClass = async (className: string): Promise<Student[]> => {
  const students = await getAllStudents();
  return students.filter(student => student.className === className && student.isActive !== false);
};

/**
 * Get a single student by ID
 * Security: Verifies student belongs to user's school
 */
export const getStudentById = async (id: string): Promise<Student | null> => {
  try {
    const result = await fetchWithAuth(`${API_BASE}/students/${id}`);
    return result.data || null;
  } catch (error) {
    console.error('Error fetching student:', error);
    return null;
  }
};

/**
 * Get students by multiple class names
 * Useful for multi-class exam selection
 */
export const getStudentsByClasses = async (classNames: string[]): Promise<Student[]> => {
  const students = await getAllStudents();
  return students.filter(
    student => classNames.includes(student.className) && student.isActive !== false
  );
};

/**
 * Get students with pagination
 * For large student lists
 */
export const getStudentsPaginated = async (
  page: number = 1,
  limit: number = 50,
  className?: string
): Promise<{ students: Student[]; total: number; pages: number }> => {
  let students = await getAllStudents();
  
  if (className) {
    students = students.filter(s => s.className === className);
  }

  const total = students.length;
  const pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginatedStudents = students.slice(start, start + limit);

  return { students: paginatedStudents, total, pages };
};

/**
 * Search students by name or roll number
 */
export const searchStudents = async (
  query: string,
  className?: string
): Promise<Student[]> => {
  const students = className ? await getStudentsByClass(className) : await getAllStudents();
  
  const searchTerm = query.toLowerCase();
  return students.filter(student =>
    student.name.toLowerCase().includes(searchTerm) ||
    student.studentId.toLowerCase().includes(searchTerm) ||
    (student.rollNumber?.toString() || '').includes(searchTerm)
  );
};

/**
 * Get unique class names from students
 */
export const getUniqueClasses = async (): Promise<string[]> => {
  const students = await getAllStudents();
  const classes = [...new Set(students.map(s => s.className))];
  return classes.sort();
};

/**
 * Get student count by class
 */
export const getStudentCountByClass = async (): Promise<Record<string, number>> => {
  const students = await getAllStudents();
  const countByClass: Record<string, number> = {};
  
  students.forEach(student => {
    if (student.isActive !== false) {
      countByClass[student.className] = (countByClass[student.className] || 0) + 1;
    }
  });
  
  return countByClass;
};

/**
 * Generate symbol number for admit card
 * Format: SchoolYearClassRoll (e.g., 20811001)
 */
export const generateSymbolNumber = (
  academicYear: string,
  className: string,
  rollNumber: number,
  _schoolId?: number // eslint-disable-line @typescript-eslint/no-unused-vars
): string => {
  // Extract last 2 digits of year
  const yearSuffix = academicYear.slice(-2);
  
  // Format class (1 -> 01, Nursery -> N, LKG -> L, etc.)
  let classCode: string;
  const upperClass = className.toUpperCase();
  
  if (upperClass.includes('NURSERY') || upperClass === 'N') {
    classCode = 'N';
  } else if (upperClass === 'LKG') {
    classCode = 'L';
  } else if (upperClass === 'UKG') {
    classCode = 'U';
  } else {
    // Extract number from class name (e.g., "Class 10" -> "10")
    const match = className.match(/(\d+)/);
    classCode = match ? match[1].padStart(2, '0') : upperClass.slice(0, 2);
  }
  
  // Format roll number (1 -> 001)
  const rollCode = rollNumber.toString().padStart(3, '0');
  
  return `${yearSuffix}${classCode}${rollCode}`;
};

/**
 * Get students with admit card data
 * Combines student data with symbol numbers
 */
export const getStudentsForAdmitCard = async (
  academicYear: string,
  className: string,
  _examType: string // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<(Student & { symbolNumber: string })[]> => {
  const students = await getStudentsByClass(className);
  
  return students.map(student => ({
    ...student,
    symbolNumber: generateSymbolNumber(academicYear, className, student.rollNumber || 1),
  }));
};
