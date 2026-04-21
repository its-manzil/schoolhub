'use client';

import React, { useState, useEffect, useCallback } from 'react';
import './RoutineTable.css';
import { DAYS, Period, TimeSlot, ClassRoutine, Schedule, Subject } from '../types';
import HolidayToggle from './HolidayToggle';
import TimeManager from './TimeManager';
import { toast } from 'sonner';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface RoutineTableProps {
  initialData?: ClassRoutine | null;
  onSave: (data: Partial<ClassRoutine>) => void;
  isLoading: boolean;
  academicYear: string;
  className: string;
}

const DEFAULT_PERIODS = 6;

const RoutineTable: React.FC<RoutineTableProps> = ({ initialData, onSave, isLoading, academicYear, className }) => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [subjectCache, setSubjectCache] = useState<Record<string, Subject[]>>({});
  const [holidays, setHolidays] = useState<Record<string, boolean>>({
    Sunday: false, Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false, Saturday: false
  });

  const fetchAvailableSubjects = useCallback(async () => {
    const cacheKey = `${className}-${academicYear}`;
    if (subjectCache[cacheKey]) {
      setAvailableSubjects(subjectCache[cacheKey]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const params = new URLSearchParams({ className, academicYear });
      const response = await fetch(`/Academic/Subjects/api/subjects?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        const subjects = data.data[0].subjects;
        setAvailableSubjects(subjects);
        setSubjectCache(prev => ({ ...prev, [cacheKey]: subjects }));
      } else {
        setAvailableSubjects([]);
        setSubjectCache(prev => ({ ...prev, [cacheKey]: [] }));
      }
    } catch (error) {
      console.error('Fetch subjects for routine error:', error);
    }
  }, [className, academicYear, subjectCache]);

  const fetchGlobalHolidays = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const params = new URLSearchParams({ academicYear });
      const response = await fetch(`/Academic/Subjects/api/holidays?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setHolidays(data.data);
      }
    } catch (error) {
      console.error('Fetch holidays error:', error);
    }
  }, [academicYear]);

  useEffect(() => {
    fetchGlobalHolidays();
    fetchAvailableSubjects();
  }, [fetchGlobalHolidays, fetchAvailableSubjects]);

  useEffect(() => {
    if (initialData) {
      setPeriods(initialData.periods || []);
      setTimeSlots(initialData.timeSlots || []);
      if (initialData.holidays) {
        setHolidays(initialData.holidays);
      }
    } else {
      // Initialize with default 6 periods
      const initialPeriods: Period[] = Array.from({ length: DEFAULT_PERIODS }, (_, i) => ({
        periodName: `Period ${i + 1}`,
        schedule: {
          Sunday: '', Monday: '', Tuesday: '', Wednesday: '', Thursday: '', Friday: '', Saturday: ''
        }
      }));
      const initialTimeSlots: TimeSlot[] = Array.from({ length: DEFAULT_PERIODS }, (_, i) => ({
        periodName: `Period ${i + 1}`,
        startTime: '10:00',
        endTime: '10:45'
      }));
      setPeriods(initialPeriods);
      setTimeSlots(initialTimeSlots);
      setHolidays({
        Sunday: false, Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false, Saturday: false
      });
    }
  }, [initialData]);

  const addPeriod = () => {
    const nextPeriodNum = periods.length + 1;
    const periodName = `Period ${nextPeriodNum}`;
    setPeriods([...periods, {
      periodName,
      schedule: {
        Sunday: '', Monday: '', Tuesday: '', Wednesday: '', Thursday: '', Friday: '', Saturday: ''
      }
    }]);
    setTimeSlots([...timeSlots, {
      periodName,
      startTime: '10:00',
      endTime: '10:45'
    }]);
  };

  const removePeriod = () => {
    if (periods.length > 1) {
      setPeriods(periods.slice(0, -1));
      setTimeSlots(timeSlots.slice(0, -1));
    }
  };

  const hasConflict = (periodIndex: number, day: string, value: string) => {
    if (!value.trim()) return false;
    return periods.some((p, idx) => {
      const schedule = p.schedule as unknown as Record<string, string>;
      return idx !== periodIndex && schedule[day]?.toLowerCase() === value.trim().toLowerCase();
    });
  };

  const updateSchedule = (periodIndex: number, day: string, value: string) => {
    const selectedSubject = availableSubjects.find(s => s.name === value);
    const isPrimary = selectedSubject?.type === 'Primary';

    const newPeriods = [...periods];
    const schedule = { ...newPeriods[periodIndex].schedule } as unknown as Record<string, string>;

    if (isPrimary && value.trim()) {
      // Auto-fill for all days except holidays
      DAYS.forEach(d => {
        if (!holidays[d]) {
          schedule[d] = value;
        }
      });
    } else {
      schedule[day] = value;
    }

    newPeriods[periodIndex] = { ...newPeriods[periodIndex], schedule: schedule as unknown as Schedule };
    setPeriods(newPeriods);
  };

  const updateTimeSlot = (periodIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const newTimeSlots = [...timeSlots];
    newTimeSlots[periodIndex][field] = value;
    setTimeSlots(newTimeSlots);
  };

  const toggleHoliday = async (day: string) => {
    const newHolidays = { ...holidays, [day]: !holidays[day] };
    setHolidays(newHolidays);

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch('/Academic/Subjects/api/holidays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ academicYear, days: newHolidays })
      });
    } catch (error) {
      console.error('Update holidays error:', error);
    }
  };

  const handleDownloadPDF = async () => {
    const table = document.querySelector('.routine-table') as HTMLElement;
    if (!table) return;

    try {
      const canvas = await html2canvas(table, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.setFontSize(18);
      pdf.text(`Class Routine - ${academicYear}`, 10, 10);
      pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
      pdf.save(`Routine_${academicYear}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
    }
  };

  const copyFromPreviousYear = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [start, end] = academicYear.split('-').map(Number);
      const prevYear = `${start - 1}-${end - 1}`;

      const params = new URLSearchParams({
        academicYear: prevYear,
        className: className
      });

      const response = await fetch(`/Academic/Subjects/api/routine?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setPeriods(data.data.periods);
        setTimeSlots(data.data.timeSlots);
        setHolidays(data.data.holidays);
      } else {
        console.warn('No routine found for previous year');
      }
    } catch (error) {
      console.error('Copy routine error:', error);
    }
  };

  const generateTemplate = () => {
    const commonSubjects = ['Mathematics', 'English', 'Science', 'Social Studies', 'Nepali', 'Computer', 'EPH', 'O. Math'];
    const newPeriods = periods.map((period, pIdx) => {
      const schedule = { ...period.schedule } as unknown as Record<string, string>;
      DAYS.forEach(day => {
        if (!holidays[day]) {
          const subIdx = (pIdx + DAYS.indexOf(day)) % commonSubjects.length;
          schedule[day] = commonSubjects[subIdx];
        }
      });
      return { ...period, schedule: schedule as unknown as Schedule };
    });
    setPeriods(newPeriods);
  };

  const movePeriod = (index: number, direction: 'up' | 'down') => {
    const newPeriods = [...periods];
    const newTimeSlots = [...timeSlots];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIdx >= 0 && targetIdx < periods.length) {
      [newPeriods[index], newPeriods[targetIdx]] = [newPeriods[targetIdx], newPeriods[index]];
      [newTimeSlots[index], newTimeSlots[targetIdx]] = [newTimeSlots[targetIdx], newTimeSlots[index]];
      setPeriods(newPeriods);
      setTimeSlots(newTimeSlots);
    }
  };

  const handleSave = () => {
    // Validation: Time order
    const invalidTimes = timeSlots.some(slot => {
      if (!slot.startTime || !slot.endTime) return false;
      return slot.startTime >= slot.endTime;
    });

    if (invalidTimes) {
      toast.error('Start time must be before end time for all periods');
      return;
    }

    // Validation: Time overlaps
    for (let i = 0; i < timeSlots.length; i++) {
      for (let j = i + 1; j < timeSlots.length; j++) {
        const s1 = timeSlots[i].startTime;
        const e1 = timeSlots[i].endTime;
        const s2 = timeSlots[j].startTime;
        const e2 = timeSlots[j].endTime;
        
        if (s1 && e1 && s2 && e2) {
          if ((s1 < e2) && (e1 > s2)) {
            // Check each day to see if there's a non-optional subject overlap
            let forbiddenDay: string | null = null;
            
            for (const day of DAYS) {
              if (holidays[day]) continue;
              
              const sub1Name = periods[i].schedule[day as keyof Schedule];
              const sub2Name = periods[j].schedule[day as keyof Schedule];
              
              if (sub1Name && sub2Name && 
                  sub1Name !== 'Break' && sub1Name !== 'Lunch' && 
                  sub2Name !== 'Break' && sub2Name !== 'Lunch') {
                
                const type1 = availableSubjects.find(s => s.name === sub1Name)?.type;
                const type2 = availableSubjects.find(s => s.name === sub2Name)?.type;
                
                if (type1 !== 'Optional' || type2 !== 'Optional') {
                  forbiddenDay = day;
                  break;
                }
              }
            }

            if (forbiddenDay) {
              toast.error(`Time overlap detected between ${timeSlots[i].periodName} and ${timeSlots[j].periodName} on ${forbiddenDay}`);
              return;
            }
          }
        }
      }
    }

    onSave({ periods, timeSlots, holidays });
  };

  return (
    <div className="routine-table-container">
      {isLoading && <div className="loading-overlay"><div className="spinner"></div></div>}
      <div className="routine-actions">
        <button className="btn-secondary" onClick={addPeriod}>+ Add Period</button>
        <button className="btn-secondary btn-remove-period" onClick={removePeriod}>- Remove Period</button>
          <button className="btn-secondary" onClick={generateTemplate}>Auto Template</button>
          <button className="btn-secondary" onClick={copyFromPreviousYear}>Copy Prev Year</button>
          <button className="btn-secondary" onClick={handleDownloadPDF}>Download PDF</button>
          <button className="btn-secondary btn-clear" onClick={() => {
            if (confirm('Are you sure you want to clear the current routine?')) {
              setPeriods(periods.map(p => ({
                ...p,
                schedule: { Sunday: '', Monday: '', Tuesday: '', Wednesday: '', Thursday: '', Friday: '', Saturday: '' }
              })));
            }
          }}>Clear Routine</button>
        </div>

      <div className="table-wrapper">
        <table className="routine-table">
          <thead>
            <tr>
              <th>Period</th>
              {DAYS.map(day => (
                <th key={day} className={holidays[day] ? 'holiday-col' : ''}>
                  <div className="day-header">
                    <span>{day}</span>
                    <HolidayToggle 
                      day={day} 
                      isHoliday={holidays[day]} 
                      onToggle={() => toggleHoliday(day)} 
                    />
                  </div>
                </th>
              ))}
              <th>👉 &quot;Manage Time&quot;</th>
            </tr>
          </thead>
          <tbody>
            {periods.map((period, pIdx) => (
              <tr key={pIdx}>
                <td className="period-name-cell">
                  <div className="period-label">
                    <span>{period.periodName}</span>
                    <div className="period-order-btns">
                      <button onClick={() => movePeriod(pIdx, 'up')} disabled={pIdx === 0}>▲</button>
                      <button onClick={() => movePeriod(pIdx, 'down')} disabled={pIdx === periods.length - 1}>▼</button>
                    </div>
                  </div>
                </td>
                {DAYS.map(day => (
                  <td key={day} className={holidays[day] ? 'holiday-cell' : ''}>
                    {holidays[day] ? (
                      <span className="holiday-text">HOLIDAY</span>
                    ) : (
                      <div className="input-wrapper">
                        <select 
                          defaultValue={period.schedule[day as keyof typeof period.schedule]}
                          onChange={(e) => updateSchedule(pIdx, day, e.target.value)}
                          className={hasConflict(pIdx, day, period.schedule[day as keyof typeof period.schedule]) ? 'input-conflict' : ''}
                        >
                          <option value="">- Select Subject -</option>
                          {availableSubjects.map((sub, sIdx) => (
                            <option key={sIdx} value={sub.name}>{sub.name}</option>
                          ))}
                          <option value="Break">Break</option>
                          <option value="Lunch">Lunch</option>
                        </select>
                        {hasConflict(pIdx, day, period.schedule[day as keyof typeof period.schedule]) && (
                          <span className="conflict-badge" title="Subject already assigned in another period on this day">⚠️</span>
                        )}
                      </div>
                    )}
                  </td>
                ))}
                <td>
                  <TimeManager 
                    startTime={timeSlots[pIdx]?.startTime || ''}
                    endTime={timeSlots[pIdx]?.endTime || ''}
                    onUpdate={(field, value) => updateTimeSlot(pIdx, field, value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="save-routine">
        <button 
          className="btn-primary" 
          onClick={handleSave} 
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Routine'}
        </button>
      </div>
    </div>
  );
};

export default RoutineTable;
