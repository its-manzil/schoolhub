export interface Subject {
  name: string;
  type: 'Primary' | 'Minor' | 'Optional';
  creditHours?: number;
  description?: string;
}

export interface SubjectRecord {
  _id?: string;
  schoolId: number;
  academicYear: string;
  className: string;
  subjects: Subject[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TimeSlot {
  periodName: string;
  startTime: string;
  endTime: string;
}

export interface Schedule {
  Sunday: string;
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
  Saturday: string;
}

export interface Period {
  periodName: string;
  schedule: Schedule;
}

export interface ClassRoutine {
  _id?: string;
  schoolId: number;
  academicYear: string;
  className: string;
  periods: Period[];
  timeSlots: TimeSlot[];
  holidays: Record<string, boolean>;
  createdAt?: Date;
  updatedAt?: Date;
}

export const CLASS_OPTIONS = [
  'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
];

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
