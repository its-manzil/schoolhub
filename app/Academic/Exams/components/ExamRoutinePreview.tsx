'use client';

import React, { useMemo } from 'react';
import { generateDateRange, isSaturday, formatBSDate, formatBSDateWithMonth, BSDate } from '@/app/utils/dateConverter';
import { ExamRoutineItem } from '../lib/examService';
import './ExamRoutinePreview.css';

interface RoutineRow {
  id: number | string;
  subject: string;
  date: string;
  startTime?: string;
  endTime?: string;
  isHoliday?: boolean;
  holidayReason?: string;
}

interface ExamRoutinePreviewProps {
  startDate: string;
  endDate: string;
  routineItems: ExamRoutineItem[];
  className?: string;
  readOnly?: boolean;
}

export default function ExamRoutinePreview({
  startDate,
  endDate,
  routineItems,
  className = '',
  readOnly = false
}: ExamRoutinePreviewProps) {
  // Generate all dates in range and check for holidays (TASK 6 & 7)
  const routineRows = useMemo((): RoutineRow[] => {
    if (!startDate || !endDate) return [];

    try {
      // Generate all dates between start and end (TASK 6)
      const allDates = generateDateRange(startDate, endDate);

      // Create a map of existing routine items by date
      const existingItemsMap = new Map(routineItems.map(item => [item.date, item]));

      // Generate rows for each date
      return allDates.map((bsDate, index) => {
        const dateString = formatBSDate(bsDate);
        const existingItem = existingItemsMap.get(dateString);

        // Check if Saturday (holiday) (TASK 7)
        const saturday = isSaturday(bsDate);

        if (existingItem) {
          return {
            id: index,
            subject: existingItem.subject,
            date: dateString,
            startTime: existingItem.startTime,
            endTime: existingItem.endTime,
            isHoliday: saturday,
            holidayReason: saturday ? 'Saturday (Holiday)' : undefined
          };
        }

        // No subject assigned - mark as Holiday if Saturday
        return {
          id: index,
          subject: '',
          date: dateString,
          isHoliday: saturday,
          holidayReason: saturday ? 'Saturday (Holiday)' : 'No exam scheduled'
        };
      });
    } catch {
      return [];
    }
  }, [startDate, endDate, routineItems]);

  // Get summary stats
  const stats = useMemo(() => {
    const totalDays = routineRows.length;
    const holidays = routineRows.filter(r => r.isHoliday).length;
    const examDays = routineRows.filter(r => r.subject && !r.isHoliday).length;
    const emptyDays = routineRows.filter(r => !r.subject && !r.isHoliday).length;

    return { totalDays, holidays, examDays, emptyDays };
  }, [routineRows]);

  // Get day name from BS date
  const getDayName = (dateString: string): string => {
    try {
      const adDate = new Date(dateString.replace(/-/g, '/'));
      return adDate.toLocaleDateString('en-US', { weekday: 'short' });
    } catch {
      return '';
    }
  };

  // Format date for display
  const formatDisplayDate = (dateString: string): string => {
    try {
      const parts = dateString.split('-');
      const bsDate: BSDate = {
        year: parseInt(parts[0]),
        month: parseInt(parts[1]),
        day: parseInt(parts[2])
      };
      return formatBSDateWithMonth(bsDate);
    } catch {
      return dateString;
    }
  };

  if (!startDate || !endDate) {
    return (
      <div className={`routine-preview-wrapper ${className}`}>
        <div className="routine-preview-empty">
          <p>Select start and end dates to preview the routine</p>
        </div>
      </div>
    );
  }

  if (routineRows.length === 0) {
    return (
      <div className={`routine-preview-wrapper ${className}`}>
        <div className="routine-preview-empty">
          <p>Invalid date range selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`routine-preview-wrapper ${className}`}>
      {/* Stats Summary */}
      <div className="routine-preview-stats">
        <div className="stat-item">
          <span className="stat-value">{stats.totalDays}</span>
          <span className="stat-label">Total Days</span>
        </div>
        <div className="stat-item">
          <span className="stat-value stat-value-exam">{stats.examDays}</span>
          <span className="stat-label">Exam Days</span>
        </div>
        <div className="stat-item">
          <span className="stat-value stat-value-holiday">{stats.holidays}</span>
          <span className="stat-label">Holidays</span>
        </div>
        {stats.emptyDays > 0 && (
          <div className="stat-item">
            <span className="stat-value stat-value-empty">{stats.emptyDays}</span>
            <span className="stat-label">Unscheduled</span>
          </div>
        )}
      </div>

      {/* Routine Table */}
      <div className="routine-preview-table-wrapper">
        <table className="routine-preview-table">
          <thead>
            <tr>
              <th className="day-col">Day</th>
              <th className="date-col">Date (BS)</th>
              <th className="subject-col">Subject</th>
              <th className="time-col">Time</th>
              <th className="status-col">Status</th>
            </tr>
          </thead>
          <tbody>
            {routineRows.map((row) => (
              <tr
                key={row.id}
                className={`
                  ${row.isHoliday ? 'holiday-row' : ''}
                  ${row.subject ? 'exam-row' : ''}
                  ${!row.subject && !row.isHoliday ? 'empty-row' : ''}
                `}
              >
                <td className="day-col">{getDayName(row.date)}</td>
                <td className="date-col">{formatDisplayDate(row.date)}</td>
                <td className="subject-col">
                  {row.subject ? (
                    <span className="subject-name">{row.subject}</span>
                  ) : (
                    <span className="no-subject">
                      {row.isHoliday ? '-' : 'Not scheduled'}
                    </span>
                  )}
                </td>
                <td className="time-col">
                  {row.startTime && row.endTime ? (
                    <span className="time-range">{row.startTime} - {row.endTime}</span>
                  ) : (
                    <span className="no-time">-</span>
                  )}
                </td>
                <td className="status-col">
                  {row.isHoliday ? (
                    <span className="status-badge status-holiday">
                      {row.holidayReason}
                    </span>
                  ) : row.subject ? (
                    <span className="status-badge status-exam">Exam</span>
                  ) : (
                    <span className="status-badge status-empty">No Exam</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="routine-preview-legend">
        <div className="legend-item">
          <span className="legend-dot legend-dot-exam"></span>
          <span>Exam Day</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot legend-dot-holiday"></span>
          <span>Holiday (Saturday)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot legend-dot-empty"></span>
          <span>No Exam Scheduled</span>
        </div>
      </div>

      {/* Warning for unscheduled days */}
      {stats.emptyDays > 0 && !readOnly && (
        <div className="routine-preview-warning">
          <strong>Note:</strong> {stats.emptyDays} day(s) have no exam scheduled. You may want to assign subjects to these dates.
        </div>
      )}
    </div>
  );
}
