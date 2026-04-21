'use client';

import React, { useState, useEffect } from 'react';
import { routineService } from '../services/routineService';
import { SchoolSchedule, SchoolBreak } from '../types';
import { toast } from 'sonner';
import './TimeConfigForm.css';

interface SchoolScheduleConfigProps {
  onClose: () => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SchoolScheduleConfig: React.FC<SchoolScheduleConfigProps> = ({ onClose }) => {
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('16:00');
  const [periodDuration, setPeriodDuration] = useState(45);
  const [holidays, setHolidays] = useState<Record<string, boolean>>({
    Sunday: false, Monday: false, Tuesday: false, Wednesday: false,
    Thursday: false, Friday: false, Saturday: false
  });
  const [breaks, setBreaks] = useState<SchoolBreak[]>([
    { name: 'Lunch', start: '13:00', end: '13:45' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await routineService.fetchSchoolSchedule();
        if (res.success && res.data) {
          setStartTime(res.data.startTime);
          setEndTime(res.data.endTime);
          setPeriodDuration(res.data.periodDuration);
          setHolidays(res.data.holidays || {});
          setBreaks(res.data.breaks || []);
        }
      } catch (err) {
        console.error('Failed to fetch schedule config:', err);
      }
    };
    fetchConfig();
  }, []);

  const handleHolidayToggle = (day: string) => {
    setHolidays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const addBreak = () => {
    setBreaks([...breaks, { name: `Break ${breaks.length + 1}`, start: '', end: '' }]);
  };

  const updateBreak = (index: number, field: keyof SchoolBreak, value: string) => {
    const newBreaks = [...breaks];
    newBreaks[index] = { ...newBreaks[index], [field]: value };
    setBreaks(newBreaks);
  };

  const removeBreak = (index: number) => {
    setBreaks(breaks.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await routineService.saveSchoolSchedule({
        schoolId: 0, // Server handles this
        startTime,
        endTime,
        periodDuration,
        holidays,
        breaks
      });
      if (res.success) {
        toast.success(res.message);
        onClose();
      } else {
        toast.error(res.message || 'Failed to save schedule');
      }
    } catch (err) {
      toast.error('An error occurred while saving schedule');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="time-config-form" onSubmit={handleSave}>
      <div className="form-group holiday-selector">
        <label>School Weekly Holidays</label>
        <div className="day-toggles">
          {DAYS.map(day => (
            <button
              key={day}
              type="button"
              className={`day-toggle ${holidays[day] ? 'selected' : ''}`}
              onClick={() => handleHolidayToggle(day)}
            >
              {day.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>School Start Time</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>School End Time</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Period Duration (min)</label>
          <input type="number" value={periodDuration} onChange={(e) => setPeriodDuration(parseInt(e.target.value))} min="20" max="120" required />
        </div>
      </div>

      <div className="form-group breaks-config">
        <label>Global Breaks & Lunch</label>
        <div className="breaks-list">
          {breaks.map((brk, idx) => (
            <div key={idx} className="break-item">
              <input 
                type="text" 
                placeholder="Break Name" 
                value={brk.name} 
                onChange={(e) => updateBreak(idx, 'name', e.target.value)} 
                className="break-name-input"
              />
              <div className="break-times">
                <input type="time" value={brk.start} onChange={(e) => updateBreak(idx, 'start', e.target.value)} />
                <span>to</span>
                <input type="time" value={brk.end} onChange={(e) => updateBreak(idx, 'end', e.target.value)} />
              </div>
              <button type="button" className="btn-remove-break" onClick={() => removeBreak(idx)}>&times;</button>
            </div>
          ))}
          <button type="button" className="btn-add-break" onClick={addBreak}>+ Add Break</button>
        </div>
      </div>

      <div className="form-footer">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Global Schedule'}
        </button>
      </div>
    </form>
  );
};

export default SchoolScheduleConfig;
