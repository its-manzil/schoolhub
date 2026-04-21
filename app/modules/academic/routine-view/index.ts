// Routine View Module - Public API

export { RoutineGrid } from './components/RoutineGrid';
export { RoutineFilters } from './components/RoutineFilters';
export { RoutineCell } from './components/RoutineCell';
export { ViewToggle } from './components/ViewToggle';
export { ClassSelector } from './components/ClassSelector';

export { useRoutineView } from './hooks/useRoutineView';
export { routineViewService } from './services/routineViewService';

export type {
  DayKey,
  ViewMode,
  PeriodType,
  SubjectType,
  BreakType,
  Subject,
  RoutinePeriod,
  TeacherOption,
  RoutineData,
  RoutineFilters as RoutineFiltersType,
  TimeSlot,
  DayInfo
} from './types';

export {
  DAYS,
  CLASS_OPTIONS,
  BS_ACADEMIC_YEAR_OPTIONS,
  BS_MONTH_OPTIONS,
  BS_YEAR_OPTIONS,
  formatTime12Hour,
  getTypeColor,
  getTypeLabel
} from './types';
