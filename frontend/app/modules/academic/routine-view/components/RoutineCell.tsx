'use client';

import { RoutinePeriod, TeacherOption, getTypeColor, getTypeLabel } from '../types';

interface RoutineCellProps {
  periods: RoutinePeriod[];
  teachers: TeacherOption[];
  isHighlighted?: boolean;
}

export function RoutineCell({ periods, teachers, isHighlighted = false }: RoutineCellProps) {
  if (periods.length === 0) {
    return (
      <div className="routine-cell routine-cell-empty">
        <span className="routine-cell-dash">—</span>
      </div>
    );
  }

  return (
    <div className={`routine-cell ${isHighlighted ? 'routine-cell-highlighted' : ''}`}>
      {periods.map((period, idx) => {
        const teacher = period.teacherId
          ? teachers.find(t => t._id === period.teacherId)
          : null;

        if (period.type === 'break') {
          return (
            <div key={idx} className="routine-period routine-period-break">
              <span className="routine-break-icon">
                {period.breakType === 'lunch' ? '🍱' : '☕'}
              </span>
              <span className="routine-break-label">
                {period.breakType === 'lunch' ? 'Lunch Break' : 'Short Break'}
              </span>
            </div>
          );
        }

        return (
          <div key={idx} className={`routine-period ${getTypeColor(period.subjectType || 'primary')}`}>
            <div className="routine-period-content">
              <span className="routine-period-name">{period.subjectName}</span>
              {teacher && (
                <span className="routine-period-teacher">
                  {teacher.name}
                  {teacher.teacherId ? ` (${teacher.teacherId})` : ''}
                </span>
              )}
            </div>
            <span className="routine-period-badge">
              {getTypeLabel(period.subjectType || 'primary')}
            </span>
          </div>
        );
      })}
    </div>
  );
}
