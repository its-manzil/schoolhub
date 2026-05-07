// Types for routine module

export interface TimeSlot {
  periodName: string;
  startTime: string;
  endTime: string;
  type?: 'period' | 'break' | 'lunch';
}

export interface Period {
  periodNumber: number;
  periodName: string;
  startTime: string;
  endTime: string;
  subjectType: 'Primary' | 'Minor' | 'Optional' | 'Break' | 'Lunch';
  subjects: string[]; // Subject names
  applyMode: 'weekly' | 'daily' | 'multiple';
  daySpecificAssignments?: Record<string, string | string[]>; // day -> subjectName or subjectNames[]
}

export interface SchoolBreak {
  name: string;
  start: string;
  end: string;
}

export interface SchoolSchedule {
  _id?: string;
  schoolId: number;
  academicYear?: string;
  startTime: string;
  endTime: string;
  periodDuration: number;
  holidays: Record<string, boolean>;
  breaks: SchoolBreak[];
  blocks?: TimeBlock[];
  source?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TimeBlock {
  type: 'period' | 'break';
  startTime: string;
  endTime: string;
  label?: string;
}

export interface HybridSchedule {
  academicYear: string;
  classId: string | 'all';
  day: string | 'all';
  blocks: TimeBlock[];
  createdAt: Date;
}

export interface BreakConfig {
  afterPeriod: number;
  startTime: string;
  endTime: string;
}

export interface ClassRoutine {
  _id?: string;
  schoolId: number;
  academicYear: string;
  className: string;
  periods: Period[];
  holidays: Record<string, boolean>;
  createdAt?: Date;
  updatedAt?: Date;
}
