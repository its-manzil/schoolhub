export enum SubjectType {
  PRIMARY = 'primary',
  MINOR = 'minor',
  OPTIONAL = 'optional'
}

export interface Subject {
  name: string;
  type: 'Primary' | 'Minor' | 'Optional' | SubjectType;
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

export const CLASS_OPTIONS = [
  'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
];
