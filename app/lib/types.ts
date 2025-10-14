export type Role =
  | "SUPER_ADMIN"
  | "ADMIN_FINANCE"
  | "ADMIN_ACADEMIC"
  | "ADMIN_INVENTORY"
  | "TEACHER"
  | "STUDENT"
  | "PARENT";

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  guardian?: string;
  category?: string;
  transport?: string;
}

export interface Teacher {
  id: string;
  name: string;
  subjects: string[];
}

export interface ClassRoom {
  id: string;
  name: string;
  teacherId?: string;
  subjectIds: string[];
}

export interface Subject {
  id: string;
  name: string;
}

export interface Attendance {
  id: string; // `${date}-${classId}`
  date: string; // ISO
  classId: string;
  entries: { studentId: string; present: boolean }[];
}

export interface Exam {
  id: string;
  name: string;
  date: string;
  classId: string;
}

export interface Mark {
  id: string; // `${examId}-${studentId}-${subjectId}`
  examId: string;
  studentId: string;
  subjectId: string;
  score: number; // 0-100
}

export interface FeeInvoice {
  id: string;
  studentId: string;
  title: string;
  amount: number;
  status: "PAID" | "DUE";
  dueDate?: string;
}

export interface LibraryBook {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  available: boolean;
}

export interface HostelRoom {
  id: string;
  name: string;
  capacity: number;
  occupants: string[]; // studentIds
}

export interface InventoryItem {
  id: string;
  name: string;
  qty: number;
  type: "FIXED" | "CURRENT";
}

export interface Notice {
  id: string;
  title: string;
  message: string;
  audience: (Role | "ALL")[];
  date: string; // ISO
}

export type CollectionMap = {
  users: User[];
  students: Student[];
  teachers: Teacher[];
  classes: ClassRoom[];
  subjects: Subject[];
  attendance: Attendance[];
  exams: Exam[];
  marks: Mark[];
  fees: FeeInvoice[];
  library: LibraryBook[];
  hostel: HostelRoom[];
  inventory: InventoryItem[];
  notices: Notice[];
};

export type CollectionKey = keyof CollectionMap;
