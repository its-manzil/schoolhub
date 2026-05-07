'use client';

import React from 'react';
import './RoutineBuilderModal.css';
import { Period } from '../types';
import { Subject } from '../../subjects/types';

interface WeeklyGridProps {
  periods: Period[];
  holidays: Record<string, boolean>;
  availableSubjects: Subject[];
  onUpdatePeriod: (idx: number, updated: Period) => void;
  onHolidayToggle: (day: string) => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const WeeklyGrid: React.FC<WeeklyGridProps> = ({
  periods,
  holidays,
  availableSubjects,
  onUpdatePeriod,
  onHolidayToggle
}) => {
  const handleSubjectChange = (pIdx: number, day: string, subjectName: string, subjectIndex?: number) => {
    const period = periods[pIdx];
    const subject = availableSubjects.find(s => s.name === subjectName);
    
    const updatedPeriod = { ...period };
    
    if (subject?.type === 'Primary') {
      // Primary: Locked across all days, only one allowed
      updatedPeriod.subjects = [subjectName];
      updatedPeriod.subjectType = 'Primary';
      updatedPeriod.applyMode = 'weekly';
      updatedPeriod.daySpecificAssignments = {};
      DAYS.forEach(d => {
        if (!holidays[d]) {
          updatedPeriod.daySpecificAssignments![d] = subjectName;
        }
      });
    } else if (subject?.type === 'Optional') {
      // Optional: Locked across all days, multiple allowed
      const newSubjects = [...(period.subjects || [])];
      if (subjectIndex !== undefined) {
        if (subjectName === '') {
          newSubjects.splice(subjectIndex, 1);
        } else {
          newSubjects[subjectIndex] = subjectName;
        }
      } else if (subjectName !== '' && !newSubjects.includes(subjectName)) {
        newSubjects.push(subjectName);
      }
      
      updatedPeriod.subjects = newSubjects;
      updatedPeriod.subjectType = 'Optional';
      updatedPeriod.applyMode = 'weekly';
      updatedPeriod.daySpecificAssignments = {};
      DAYS.forEach(d => {
        if (!holidays[d]) {
          // For optional, we might want to store as comma separated or handle differently.
          // For now, let's keep daySpecificAssignments as the source of truth for display if needed.
          updatedPeriod.daySpecificAssignments![d] = newSubjects.join(', ');
        }
      });
    } else if (subject?.type === 'Minor') {
      // Minor: Can vary per day
      updatedPeriod.subjectType = 'Minor';
      updatedPeriod.applyMode = 'daily';
      updatedPeriod.daySpecificAssignments = {
        ...(updatedPeriod.daySpecificAssignments || {}),
        [day]: subjectName
      };
      // Keep subjects array updated with all unique minor subjects assigned across the week
      const allAssigned = Object.values(updatedPeriod.daySpecificAssignments).filter(Boolean);
      updatedPeriod.subjects = Array.from(new Set(allAssigned));
    } else if (subjectName === '') {
      // Clear specific day/period
      if (period.subjectType === 'Minor') {
        updatedPeriod.daySpecificAssignments = {
          ...(updatedPeriod.daySpecificAssignments || {}),
          [day]: ''
        };
        const allAssigned = Object.values(updatedPeriod.daySpecificAssignments).filter(Boolean);
        updatedPeriod.subjects = Array.from(new Set(allAssigned));
      } else {
        updatedPeriod.subjects = [];
        updatedPeriod.daySpecificAssignments = {};
      }
    }

    onUpdatePeriod(pIdx, updatedPeriod);
  };

  const isPeriodEmpty = (period: Period): boolean => {
    if (period.subjectType === 'Break' || period.subjectType === 'Lunch') return false;
    if (period.applyMode === 'weekly' && period.subjects.length === 0) return true;
    if (period.applyMode === 'daily') {
      const hasAnyAssignment = Object.values(period.daySpecificAssignments || {}).some(s => s && s.trim() !== '');
      return !hasAnyAssignment;
    }
    return false;
  };

  return (
    <div className="weekly-grid-container">
      <table className="routine-grid">
        <thead>
          <tr>
            <th className="day-header">Day</th>
            {periods.map((p, pIdx) => (
              <th key={pIdx} className="period-header">
                <div className="p-name">{p.periodName}</div>
                <div className="p-time">{p.startTime} - {p.endTime}</div>
                {p.subjectType !== 'Break' && p.subjectType !== 'Lunch' && (
                  <div className="p-type">{p.subjectType}</div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map(day => {
            const isHoliday = holidays[day];
            return (
              <tr key={day} className={isHoliday ? 'holiday-row' : ''}>
                <td className="day-cell">
                  <div className="day-name">{day}</div>
                  <button
                    type="button"
                    className={`holiday-toggle-btn ${holidays[day] ? 'is-holiday' : ''}`}
                    onClick={() => onHolidayToggle(day)}
                    title={holidays[day] ? 'Remove holiday' : 'Set as holiday'}
                  >
                    {holidays[day] ? '🎉' : '☀️'}
                  </button>
                </td>
                {periods.map((p, pIdx) => {
                  const showAsHoliday = isHoliday;
                  return (
                    <td key={pIdx} className={`period-cell ${showAsHoliday ? 'holiday' : ''}`}>
                      {showAsHoliday ? (
                        <span className="holiday-label">HOLIDAY</span>
                      ) : p.subjectType === 'Break' || p.subjectType === 'Lunch' ? (
                        <div className="special-cell">
                          <span className="special-label">{p.periodName}</span>
                          <span className="special-time">{p.startTime} - {p.endTime}</span>
                        </div>
                      ) : (
                        <div className="cell-content">
                          {p.subjectType === 'Optional' ? (
                            <div className="optional-subjects-list">
                              {(p.subjects || []).map((subName, sIdx) => (
                                <select
                                  key={sIdx}
                                  value={subName}
                                  onChange={(e) => handleSubjectChange(pIdx, day, e.target.value, sIdx)}
                                  className="subject-select optional-mode"
                                >
                                  <option value="">- Remove -</option>
                                  <optgroup label="Optional">
                                    {availableSubjects.filter(s => s.type === 'Optional').map(s => (
                                      <option key={s.name} value={s.name}>{s.name}</option>
                                    ))}
                                  </optgroup>
                                </select>
                              ))}
                              <select
                                value=""
                                onChange={(e) => handleSubjectChange(pIdx, day, e.target.value)}
                                className="subject-select add-optional"
                              >
                                <option value="">+ Add Optional</option>
                                <optgroup label="Optional">
                                  {availableSubjects
                                    .filter(s => s.type === 'Optional' && !p.subjects.includes(s.name))
                                    .map(s => (
                                      <option key={s.name} value={s.name}>{s.name}</option>
                                    ))}
                                </optgroup>
                              </select>
                            </div>
                          ) : (
                            <select
                              value={
                                p.applyMode === 'weekly'
                                  ? (p.daySpecificAssignments?.[day] || p.subjects[0] || '')
                                  : (p.daySpecificAssignments?.[day] || '')
                              }
                              onChange={(e) => handleSubjectChange(pIdx, day, e.target.value)}
                              className={`subject-select ${p.applyMode === 'weekly' ? 'weekly-mode' : 'daily-mode'}`}
                            >
                              <option value="">- Select -</option>
                              <optgroup label="Primary">
                                {availableSubjects.filter(s => s.type === 'Primary').map(s => (
                                  <option key={s.name} value={s.name}>{s.name}</option>
                                ))}
                              </optgroup>
                              <optgroup label="Minor">
                                {availableSubjects.filter(s => s.type === 'Minor').map(s => (
                                  <option key={s.name} value={s.name}>{s.name}</option>
                                ))}
                              </optgroup>
                              <optgroup label="Optional">
                                {availableSubjects.filter(s => s.type === 'Optional').map(s => (
                                  <option key={s.name} value={s.name}>{s.name}</option>
                                ))}
                              </optgroup>
                            </select>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {periods.some(p => isPeriodEmpty(p)) && (
        <div className="warning-message">
          ⚠️ Some periods don&apos;t have subjects assigned. Please assign subjects before saving.
        </div>
      )}
    </div>
  );
};

export default WeeklyGrid;
