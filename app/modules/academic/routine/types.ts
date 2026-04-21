import { Schedule } from '../../subjects/types';

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
  applyMode: 'weekly' | 'daily';
  daySpecificAssignments?: Record<string, string>; // day -> subjectName (for Minor daily)
}

export interface SchoolBreak {
  name: string;
  start: string;
  end: string;
}

export interface SchoolSchedule {
  _id?: string;
  schoolId: number;
  startTime: string;
  endTime: string;
  periodDuration: number;
  holidays: Record<string, boolean>;
  breaks: SchoolBreak[];
  updatedAt?: Date;
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
