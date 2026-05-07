export type DayKey = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export type ViewMode = 'period' | 'day';

export type PeriodType = 'subject' | 'break';

export type SubjectType = 'primary' | 'minor' | 'optional';

export type BreakType = 'short' | 'lunch';

export interface Subject {
  id: string;
  name: string;
  type: SubjectType;
  className: string;
  academicYear: string;
}

export interface RoutinePeriod {
  day: DayKey;
  startTime: string;
  endTime: string;
  type: PeriodType;
  subjectId?: string;
  subjectName?: string;
  subjectType?: SubjectType;
  breakType?: BreakType;
  teacherId?: string;
  teacherName?: string;
}

export interface TeacherOption {
  _id: string;
  name: string;
  teacherId?: string;
}

export interface RoutineData {
  academicYearBs?: string;
  effectiveFromBs?: string;
  periods: RoutinePeriod[];
}

export interface RoutineFilters {
  academicYear: string;
  className: string;
  viewMode: ViewMode;
  highlightSubject?: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  label: string;
}

export interface DayInfo {
  key: DayKey;
  label: string;
  short: string;
}

export const DAYS: DayInfo[] = [
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' }
];

export const CLASS_OPTIONS = [
  { value: 'N', label: 'Nursery' },
  { value: 'LKG', label: 'LKG' },
  { value: 'UKG', label: 'UKG' },
  { value: '01', label: 'Class 1' },
  { value: '02', label: 'Class 2' },
  { value: '03', label: 'Class 3' },
  { value: '04', label: 'Class 4' },
  { value: '05', label: 'Class 5' },
  { value: '06', label: 'Class 6' },
  { value: '07', label: 'Class 7' },
  { value: '08', label: 'Class 8' },
  { value: '09', label: 'Class 9' },
  { value: '10', label: 'Class 10' },
  { value: '11', label: 'Class 11' },
  { value: '12', label: 'Class 12' }
];

export const BS_ACADEMIC_YEAR_OPTIONS = [
  '2083-2084', '2084-2085', '2085-2086', '2086-2087', '2087-2088',
  '2088-2089', '2089-2090', '2090-2091', '2091-2092', '2092-2093',
  '2093-2094', '2094-2095', '2095-2096', '2096-2097', '2097-2098',
  '2098-2099', '2099-2100'
];

export const BS_MONTH_OPTIONS = [
  { value: '01', label: 'Baisakh' }, { value: '02', label: 'Jestha' },
  { value: '03', label: 'Ashadh' }, { value: '04', label: 'Shrawan' },
  { value: '05', label: 'Bhadra' }, { value: '06', label: 'Ashwin' },
  { value: '07', label: 'Kartik' }, { value: '08', label: 'Mangsir' },
  { value: '09', label: 'Poush' }, { value: '10', label: 'Magh' },
  { value: '11', label: 'Falgun' }, { value: '12', label: 'Chaitra' }
];

export const BS_YEAR_OPTIONS = [
  '2083', '2084', '2085', '2086', '2087', '2088', '2089', '2090',
  '2091', '2092', '2093', '2094', '2095', '2096', '2097',
  '2098', '2099', '2100'
];

export function formatTime12Hour(value: string): string {
  if (!value) return '';
  const [hourPart, minutePart] = value.split(':');
  const hourNumber = Number(hourPart);
  if (Number.isNaN(hourNumber)) return value;
  const suffix = hourNumber >= 12 ? 'PM' : 'AM';
  let displayHour = hourNumber;
  if (displayHour === 0) displayHour = 12;
  else if (displayHour > 12) displayHour -= 12;
  return `${displayHour}:${minutePart} ${suffix}`;
}

export function getTypeColor(type: string): string {
  switch (type) {
    case 'primary': return 'routine-type-primary';
    case 'minor': return 'routine-type-minor';
    case 'optional': return 'routine-type-optional';
    default: return 'routine-type-primary';
  }
}

export function getTypeLabel(type: string): string {
  switch (type) {
    case 'primary': return 'Primary';
    case 'minor': return 'Minor';
    case 'optional': return 'Optional';
    default: return 'Primary';
  }
}
