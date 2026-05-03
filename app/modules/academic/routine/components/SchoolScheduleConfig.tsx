'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { routineService } from '../services/routineService';
import { SchoolSchedule, SchoolBreak } from '../types';
import { toast } from 'sonner';
import './SchoolScheduleConfig.css';

interface SchoolScheduleConfigProps {
  onClose: () => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Default empty schedule
const DEFAULT_SCHEDULE: SchoolSchedule = {
  schoolId: 0,
  startTime: '10:00',
  endTime: '16:00',
  periodDuration: 45,
  holidays: {
    Sunday: false, Monday: false, Tuesday: false, Wednesday: false,
    Thursday: false, Friday: false, Saturday: false
  },
  breaks: [{ name: 'Lunch', start: '13:00', end: '13:45' }]
};

const SchoolScheduleConfig: React.FC<SchoolScheduleConfigProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'view' | 'configure'>('view');
  
  // Available years from database
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [isLoadingYears, setIsLoadingYears] = useState(false);
  
  // View Schedule state
  const [viewYear, setViewYear] = useState('');
  
  // Configure Schedule state
  const [newAcademicYear, setNewAcademicYear] = useState('');
  const [yearExists, setYearExists] = useState(false);
  
  // Schedule state
  const [schedule, setSchedule] = useState<SchoolSchedule>(DEFAULT_SCHEDULE);
  const [isLoading, setIsLoading] = useState(false);

  // Copy from existing state
  const [copyFromExisting, setCopyFromExisting] = useState(false);
  const [sourceYear, setSourceYear] = useState('');

  // Fetch available academic years from database
  const fetchAvailableYears = useCallback(async () => {
    setIsLoadingYears(true);
    try {
      // TODO: Replace with actual API call to fetch available years
      // For now simulating - this should fetch from configure schedule data
      const response = await fetch('/api/academic/academic-years', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.years) {
          setAvailableYears(data.years);
          if (data.years.length > 0 && !viewYear) {
            setViewYear(data.years[0]);
          }
        }
      } else {
        // Fallback to mock data if API not available
        const mockYears = ['2080-2081', '2081-2082', '2082-2083', '2083-2084'];
        setAvailableYears(mockYears);
        if (!viewYear) setViewYear(mockYears[0]);
      }
    } catch (err) {
      console.error('Failed to fetch available years:', err);
      // Fallback
      const mockYears = ['2080-2081', '2081-2082', '2082-2083', '2083-2084'];
      setAvailableYears(mockYears);
      if (!viewYear) setViewYear(mockYears[0]);
    } finally {
      setIsLoadingYears(false);
    }
  }, [viewYear]);

  // Fetch available years on mount
  useEffect(() => {
    fetchAvailableYears();
  }, [fetchAvailableYears]);

  // Fetch schedule for selected academic year
  const fetchScheduleForYear = useCallback(async (year: string) => {
    if (!year) return;
    setIsLoading(true);
    try {
      const res = await routineService.fetchSchoolSchedule(year);
      if (res.success && res.data) {
        setSchedule(res.data);
      } else {
        setSchedule(DEFAULT_SCHEDULE);
      }
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
      setSchedule(DEFAULT_SCHEDULE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load schedule when view year changes
  useEffect(() => {
    if (activeTab === 'view' && viewYear) {
      fetchScheduleForYear(viewYear);
    }
  }, [viewYear, activeTab, fetchScheduleForYear]);

  // Check if entered year exists
  const checkYearExists = (year: string) => {
    const exists = availableYears.includes(year);
    setYearExists(exists);
    return exists;
  };

  // Handle new academic year input
  const handleNewYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = e.target.value;
    setNewAcademicYear(year);
    if (year) {
      checkYearExists(year);
    } else {
      setYearExists(false);
    }
  };

  // Load source schedule when copying
  const loadSourceSchedule = async () => {
    if (!sourceYear) {
      toast.error('Please select a source academic year');
      return;
    }
    setIsLoading(true);
    try {
      const res = await routineService.fetchSchoolSchedule(sourceYear);
      if (res.success && res.data) {
        setSchedule(res.data);
        toast.success(`Loaded schedule from ${sourceYear}`);
      } else {
        toast.error(`No schedule found for ${sourceYear}`);
        setSchedule(DEFAULT_SCHEDULE);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHolidayToggle = (day: string) => {
    if (copyFromExisting) return; // Read-only when copying
    setSchedule(prev => ({
      ...prev,
      holidays: { ...prev.holidays, [day]: !prev.holidays[day] }
    }));
  };

  const addBreak = () => {
    if (copyFromExisting) return; // Read-only when copying
    setSchedule(prev => ({
      ...prev,
      breaks: [...prev.breaks, { name: `Break ${prev.breaks.length + 1}`, start: '', end: '' }]
    }));
  };

  const updateBreak = (index: number, field: keyof SchoolBreak, value: string) => {
    if (copyFromExisting) return; // Read-only when copying
    const newBreaks = [...schedule.breaks];
    newBreaks[index] = { ...newBreaks[index], [field]: value };
    setSchedule(prev => ({ ...prev, breaks: newBreaks }));
  };

  const removeBreak = (index: number) => {
    if (copyFromExisting) return; // Read-only when copying
    setSchedule(prev => ({ ...prev, breaks: prev.breaks.filter((_, i) => i !== index) }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!newAcademicYear) {
      toast.error('Please enter an academic year');
      return;
    }
    
    if (yearExists && !copyFromExisting) {
      toast.error('Academic year already exists. Please enter a new academic year.');
      return;
    }
    
    setIsLoading(true);
    try {
      const payload = {
        ...schedule,
        schoolId: 0,
        academicYear: newAcademicYear
      };
      const res = await routineService.saveSchoolSchedule(payload);
      if (res.success) {
        toast.success(res.message);
        // Refresh available years
        await fetchAvailableYears();
        onClose();
      } else {
        toast.error(res.message || 'Failed to save schedule');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while saving schedule');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="school-schedule-config">
      {/* Mini Navbar */}
      <div className="schedule-mini-nav">
        <button
          className={`nav-tab ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          View Schedule
        </button>
        <button
          className={`nav-tab ${activeTab === 'configure' ? 'active' : ''}`}
          onClick={() => setActiveTab('configure')}
        >
          Configure Schedule
        </button>
      </div>

      {/* View Schedule Tab */}
      {activeTab === 'view' && (
        <>
          {/* Academic Year Dropdown for View */}
          <div className="academic-year-section">
            <label className="section-label">Academic Year</label>
            <select
              className="academic-year-select"
              value={viewYear}
              onChange={(e) => setViewYear(e.target.value)}
              disabled={isLoadingYears}
            >
              <option value="">Select academic year</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="view-schedule-section">

          {isLoading ? (
            <div className="loading-state">Loading schedule...</div>
          ) : (
            <>
              <div className="schedule-summary">
                <h4>Schedule for {viewYear}</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="label">School Hours:</span>
                    <span className="value">{schedule.startTime} - {schedule.endTime}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Period Duration:</span>
                    <span className="value">{schedule.periodDuration} minutes</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Holidays:</span>
                    <span className="value">
                      {DAYS.filter(d => schedule.holidays[d]).join(', ') || 'None set'}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Breaks:</span>
                    <span className="value">{schedule.breaks.length} configured</span>
                  </div>
                </div>
              </div>

              <div className="breaks-display">
                <h5>Breaks & Lunch Schedule</h5>
                {schedule.breaks.length > 0 ? (
                  <div className="breaks-list-view">
                    {schedule.breaks.map((brk, idx) => (
                      <div key={idx} className="break-item-view">
                        <span className="break-name">{brk.name}</span>
                        <span className="break-time">{brk.start} - {brk.end}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-breaks">No breaks configured</p>
                )}
              </div>

              <div className="holidays-display">
                <h5>Weekly Holidays</h5>
                <div className="holidays-grid">
                  {DAYS.map(day => (
                    <div
                      key={day}
                      className={`holiday-badge ${schedule.holidays[day] ? 'is-holiday' : ''}`}
                    >
                      {day.substring(0, 3)}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        </>
      )}

      {/* Configure Schedule Tab */}
      {activeTab === 'configure' && (
        <form className="configure-schedule-form" onSubmit={handleSave}>
          {/* Copy from Existing - At the top */}
          <div className="copy-existing-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={copyFromExisting}
                onChange={(e) => {
                  setCopyFromExisting(e.target.checked);
                  if (!e.target.checked) {
                    setSourceYear('');
                    setSchedule(DEFAULT_SCHEDULE);
                  } else {
                    setNewAcademicYear('');
                    setYearExists(false);
                  }
                }}
              />
              <span>Copy from existing academic year data</span>
            </label>

            {copyFromExisting && (
              <div className="copy-mode-section">
                <div className="copy-controls-row">
                  <div className="form-group">
                    <label>Select from academic year:</label>
                    <select
                      value={sourceYear}
                      onChange={(e) => {
                        setSourceYear(e.target.value);
                        if (e.target.value) {
                          loadSourceSchedule();
                        }
                      }}
                      className="source-year-select"
                    >
                      <option value="">Select academic year</option>
                      {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Enter new Academic year:</label>
                    <input
                      type="text"
                      value={newAcademicYear}
                      onChange={handleNewYearChange}
                      placeholder="e.g., 2084-2085"
                      className={`academic-year-input ${yearExists ? 'exists-error' : ''}`}
                    />
                    {yearExists && (
                      <span className="error-text">Academic year Exists, enter new Academic year</span>
                    )}
                  </div>
                </div>

                {/* Read-only display of copied schedule */}
                {sourceYear && (
                  <div className="copied-schedule-preview">
                    <h4>Schedule from {sourceYear} (Read-only)</h4>
                    <div className="preview-grid">
                      <div className="preview-item">
                        <span className="preview-label">School Hours:</span>
                        <span className="preview-value">{schedule.startTime} - {schedule.endTime}</span>
                      </div>
                      <div className="preview-item">
                        <span className="preview-label">Period Duration:</span>
                        <span className="preview-value">{schedule.periodDuration} minutes</span>
                      </div>
                      <div className="preview-item">
                        <span className="preview-label">Holidays:</span>
                        <span className="preview-value">
                          {DAYS.filter(d => schedule.holidays[d]).join(', ') || 'None set'}
                        </span>
                      </div>
                      <div className="preview-item">
                        <span className="preview-label">Breaks:</span>
                        <span className="preview-value">{schedule.breaks.length} configured</span>
                      </div>
                    </div>
                    
                    {schedule.breaks.length > 0 && (
                      <div className="preview-breaks">
                        <strong>Breaks:</strong>
                        {schedule.breaks.map((brk, idx) => (
                          <span key={idx} className="preview-break">
                            {brk.name} ({brk.start}-{brk.end})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Manual Entry Mode - When NOT copying */}
          {!copyFromExisting && (
            <div className="manual-entry-section">
              <div className="form-group">
                <label>Enter New Academic Year:</label>
                <input
                  type="text"
                  value={newAcademicYear}
                  onChange={handleNewYearChange}
                  placeholder="e.g., 2084-2085"
                  className={`academic-year-input ${yearExists ? 'exists-error' : ''}`}
                  required
                />
                {yearExists && (
                  <span className="error-text">Academic year Exists, enter new Academic year</span>
                )}
              </div>

              {/* Schedule Configuration */}
              <div className="config-form-content">
                <div className="form-group holiday-selector">
                  <label>School Weekly Holidays</label>
                  <div className="day-toggles">
                    {DAYS.map(day => (
                      <button
                        key={day}
                        type="button"
                        className={`day-toggle ${schedule.holidays[day] ? 'selected' : ''}`}
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
                    <input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => setSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>School End Time</label>
                    <input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => setSchedule(prev => ({ ...prev, endTime: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Period Duration (min)</label>
                    <input
                      type="number"
                      value={schedule.periodDuration}
                      onChange={(e) => setSchedule(prev => ({ ...prev, periodDuration: parseInt(e.target.value) || 45 }))}
                      min="20"
                      max="120"
                      required
                    />
                  </div>
                </div>

                <div className="form-group breaks-config">
                  <label>Global Breaks & Lunch</label>
                  <div className="breaks-list">
                    {schedule.breaks.map((brk, idx) => (
                      <div key={idx} className="break-item">
                        <input
                          type="text"
                          placeholder="Break Name"
                          value={brk.name}
                          onChange={(e) => updateBreak(idx, 'name', e.target.value)}
                          className="break-name-input"
                        />
                        <div className="break-times">
                          <input
                            type="time"
                            value={brk.start}
                            onChange={(e) => updateBreak(idx, 'start', e.target.value)}
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={brk.end}
                            onChange={(e) => updateBreak(idx, 'end', e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn-remove-break"
                          onClick={() => removeBreak(idx)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn-add-break"
                      onClick={addBreak}
                    >
                      + Add Break
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="form-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isLoading || (!copyFromExisting && yearExists)}
            >
              {isLoading ? 'Saving...' : `Save for ${newAcademicYear || 'New Year'}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SchoolScheduleConfig;
