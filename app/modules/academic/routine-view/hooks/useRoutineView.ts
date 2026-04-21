'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { routineViewService } from '../services/routineViewService';
import {
  RoutinePeriod,
  TeacherOption,
  ViewMode,
  DayKey,
  DAYS
} from '../types';

export interface UseRoutineViewReturn {
  // Data
  routinePeriods: RoutinePeriod[];
  teachers: TeacherOption[];
  
  // Loading & Error states
  isLoading: boolean;
  error: string | null;
  
  // Filters
  selectedClass: string;
  setSelectedClass: (value: string) => void;
  selectedAcademicYear: string;
  setSelectedAcademicYear: (value: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  highlightSubject: string;
  setHighlightSubject: (value: string) => void;
  
  // Derived data
  timeSlots: Array<{ startTime: string; endTime: string }>;
  activeDays: Array<{ key: DayKey; label: string; short: string }>;
  routineMap: Record<string, RoutinePeriod[]>;
  
  // Actions
  fetchRoutine: () => Promise<void>;
  refresh: () => Promise<void>;
  
  // Metadata
  loadedAcademicYearBs: string;
  effectiveFromBs: string;
}

export function useRoutineView(): UseRoutineViewReturn {
  // Data states
  const [routinePeriods, setRoutinePeriods] = useState<RoutinePeriod[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loadedAcademicYearBs, setLoadedAcademicYearBs] = useState<string>('');
  const [effectiveFromBs, setEffectiveFromBs] = useState<string>('');
  
  // Loading & Error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedClass, setSelectedClass] = useState<string>('N');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('period');
  const [highlightSubject, setHighlightSubject] = useState<string>('');

  // Fetch teachers on mount
  useEffect(() => {
    const loadTeachers = async () => {
      const result = await routineViewService.fetchTeachers();
      if (result.success && result.data) {
        setTeachers(result.data);
      }
    };
    loadTeachers();
  }, []);

  // Fetch routine data
  const fetchRoutine = useCallback(async () => {
    if (!selectedClass) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await routineViewService.fetchRoutine(
        selectedClass,
        selectedAcademicYear
      );

      if (!result.success) {
        setError(result.message || 'Failed to fetch routine');
        setRoutinePeriods([]);
        setLoadedAcademicYearBs('');
        setEffectiveFromBs('');
        setIsLoading(false);
        return;
      }

      if (result.data) {
        setRoutinePeriods(result.data.periods || []);
        setLoadedAcademicYearBs(result.data.academicYearBs || '');
        setEffectiveFromBs(result.data.effectiveFromBs || '');
      }
    } catch {
      setError('Failed to fetch routine');
      setRoutinePeriods([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClass, selectedAcademicYear]);

  // Refresh function (alias for fetchRoutine)
  const refresh = useCallback(async () => {
    await fetchRoutine();
  }, [fetchRoutine]);

  // Auto-fetch when filters change
  useEffect(() => {
    fetchRoutine();
  }, [fetchRoutine]);

  // Derived: time slots sorted by start time
  const timeSlots = useMemo(() => {
    const map = new Map<string, { startTime: string; endTime: string }>();
    routinePeriods.forEach(p => {
      const key = `${p.startTime}-${p.endTime}`;
      if (!map.has(key)) {
        map.set(key, { startTime: p.startTime, endTime: p.endTime });
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
  }, [routinePeriods]);

  // Derived: active days
  const activeDays = useMemo(() => {
    const daySet = new Set(routinePeriods.map(p => p.day));
    return DAYS.filter(d => daySet.has(d.key));
  }, [routinePeriods]);

  // Derived: routine map for O(1) lookup
  const routineMap = useMemo(() => {
    const map: Record<string, RoutinePeriod[]> = {};
    routinePeriods.forEach(p => {
      const key = `${p.day}_${p.startTime}_${p.endTime}`;
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [routinePeriods]);

  return {
    routinePeriods,
    teachers,
    isLoading,
    error,
    selectedClass,
    setSelectedClass,
    selectedAcademicYear,
    setSelectedAcademicYear,
    viewMode,
    setViewMode,
    highlightSubject,
    setHighlightSubject,
    timeSlots,
    activeDays,
    routineMap,
    fetchRoutine,
    refresh,
    loadedAcademicYearBs,
    effectiveFromBs
  };
}
