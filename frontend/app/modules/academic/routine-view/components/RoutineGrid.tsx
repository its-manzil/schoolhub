'use client';

import { useMemo } from 'react';
import { RoutineCell } from './RoutineCell';
import {
  RoutinePeriod,
  TeacherOption,
  ViewMode,
  DAYS,
  formatTime12Hour
} from '../types';

interface RoutineGridProps {
  routinePeriods: RoutinePeriod[];
  teachers: TeacherOption[];
  viewMode: ViewMode;
  highlightSubject: string;
  isLoading?: boolean;
}

export function RoutineGrid({
  routinePeriods,
  teachers,
  viewMode,
  highlightSubject,
  isLoading = false
}: RoutineGridProps) {
  // Derived: time slots sorted by start time with break detection
  const timeSlots = useMemo(() => {
    const map = new Map<string, { startTime: string; endTime: string; isBreak: boolean }>();
    routinePeriods.forEach(p => {
      const key = `${p.startTime}-${p.endTime}`;
      if (!map.has(key)) {
        // Check if this time slot contains any breaks
        const isBreak = p.type === 'break';
        map.set(key, { startTime: p.startTime, endTime: p.endTime, isBreak });
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
  }, [routinePeriods]);

  // Count breaks for labeling
  const getSlotLabel = (slot: typeof timeSlots[0], index: number) => {
    if (slot.isBreak) {
      // Count how many breaks before this one
      const breakCount = timeSlots.slice(0, index).filter(s => s.isBreak).length + 1;
      return `Break - ${breakCount}`;
    }
    // Count how many non-breaks before this one
    const periodCount = timeSlots.slice(0, index).filter(s => !s.isBreak).length + 1;
    return `P${periodCount}`;
  };

  // Derived: active days (maintaining order)
  const activeDays = useMemo(() => {
    const daySet = new Set(routinePeriods.map(p => p.day));
    return DAYS.filter(d => daySet.has(d.key));
  }, [routinePeriods]);

  // Routine map for O(1) lookup
  const routineMap = useMemo(() => {
    const map: Record<string, RoutinePeriod[]> = {};
    routinePeriods.forEach(p => {
      const key = `${p.day}_${p.startTime}_${p.endTime}`;
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [routinePeriods]);

  // Check if a cell should be highlighted
  const isCellHighlighted = (periods: RoutinePeriod[]): boolean => {
    if (!highlightSubject) return false;
    return periods.some(
      p => p.type === 'subject' && p.subjectName === highlightSubject
    );
  };

  // Skeleton loader
  if (isLoading) {
    return (
      <div className="routine-grid-skeleton">
        <div className="routine-skeleton-header">
          <div className="routine-skeleton-cell routine-skeleton-corner" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="routine-skeleton-cell routine-skeleton-day" />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="routine-skeleton-row">
            <div className="routine-skeleton-cell routine-skeleton-period" />
            {[1, 2, 3, 4, 5, 6].map((col) => (
              <div key={col} className="routine-skeleton-cell routine-skeleton-content" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (routinePeriods.length === 0) {
    return (
      <div className="routine-grid-empty">
        <div className="routine-empty-icon">📚</div>
        <p className="routine-empty-title">No routine found for selected class/year</p>
        <p className="routine-empty-subtitle">
          Select a different class or academic year to view the routine.
        </p>
      </div>
    );
  }

  // PERIOD VIEW: Rows = Periods, Columns = Days
  if (viewMode === 'period') {
    return (
      <div className="routine-grid-wrapper">
        <table className="routine-grid routine-grid-period">
          <thead>
            <tr>
              <th className="routine-header-corner">
                <span className="routine-header-label">Period</span>
              </th>
              {activeDays.map((day) => (
                <th key={day.key} className="routine-header-day">
                  <span className="routine-header-day-label">{day.label}</span>
                  <span className="routine-header-day-short">{day.short}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, slotIndex) => (
              <tr key={`${slot.startTime}-${slot.endTime}`} className="routine-row">
                <td className="routine-period-cell">
                  <div className="routine-period-label">{getSlotLabel(slot, slotIndex)}</div>
                  <div className="routine-period-time">
                    <span className="routine-time-start">{formatTime12Hour(slot.startTime)}</span>
                    <span className="routine-time-separator">-</span>
                    <span className="routine-time-end">{formatTime12Hour(slot.endTime)}</span>
                  </div>
                </td>
                {activeDays.map((day) => {
                  const key = `${day.key}_${slot.startTime}_${slot.endTime}`;
                  const periods = routineMap[key] || [];
                  return (
                    <td key={day.key} className="routine-data-cell">
                      <RoutineCell
                        periods={periods}
                        teachers={teachers}
                        isHighlighted={isCellHighlighted(periods)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // DAY VIEW: Rows = Days, Columns = Periods
  return (
    <div className="routine-grid-wrapper">
      <table className="routine-grid routine-grid-day">
        <thead>
          <tr>
            <th className="routine-header-corner">
              <span className="routine-header-label">Day</span>
            </th>
            {timeSlots.map((slot, index) => (
              <th key={`${slot.startTime}-${slot.endTime}`} className="routine-header-period">
                <span className="routine-header-period-label">{getSlotLabel(slot, index)}</span>
                <span className="routine-header-period-time">
                  {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activeDays.map((day) => (
            <tr key={day.key} className="routine-row">
              <td className="routine-day-cell">
                <span className="routine-day-label">{day.label}</span>
                <span className="routine-day-short">{day.short}</span>
              </td>
              {timeSlots.map((slot) => {
                const key = `${day.key}_${slot.startTime}_${slot.endTime}`;
                const periods = routineMap[key] || [];
                return (
                  <td key={`${day.key}-${slot.startTime}`} className="routine-data-cell">
                    <RoutineCell
                      periods={periods}
                      teachers={teachers}
                      isHighlighted={isCellHighlighted(periods)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
