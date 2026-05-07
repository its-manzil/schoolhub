'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { routineService } from '../../modules/academic/routine/services/routineService';
import { SchoolSchedule, TimeBlock, BreakConfig } from '../../modules/academic/routine/types';
import { Toaster, toast } from 'sonner';
import AcademicNavbar from '../components/AcademicNavbar';
import './subjects.css';
import './SchoolScheduleView.css';
import './ConfigureScheduleForm.css';
import './components/EditSchedule.css';

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};


const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12'
];

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

type TabType = 'schoolSchedule' | 'configureSchedule' | 'editSchedule';

// School Schedule View Component
interface SchoolScheduleViewProps {
  availableYears: string[];
}

const SchoolScheduleView: React.FC<SchoolScheduleViewProps> = ({ availableYears }) => {
  const [viewYear, setViewYear] = useState(availableYears[0] || '2081-2082');
  const [schedule, setSchedule] = useState<SchoolSchedule>(DEFAULT_SCHEDULE);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (viewYear) {
      fetchScheduleForYear(viewYear);
    }
  }, [viewYear, fetchScheduleForYear]);

  return (
    <div className="school-schedule-view">
      <div className="academic-year-section">
        <label className="section-label">Academic Year</label>
        <select
          className="academic-year-select"
          value={viewYear}
          onChange={(e) => setViewYear(e.target.value)}
        >
          <option value="">Select academic year</option>
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

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
                <span className="label">Format:</span>
                <span className="value">{schedule.source || 'v1'} (Legacy)</span>
              </div>
            </div>
          </div>

          <div className="breaks-display">
            <h5>Daily Schedule</h5>
            {schedule.blocks && schedule.blocks.length > 0 ? (
              <div className="time-blocks-list-view">
                {schedule.blocks
                  .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
                  .map((block, idx) => (
                    <div key={idx} className={`time-block-item ${block.type}`}>
                      <span className="block-label">{block.label}</span>
                      <span className="block-time">{block.startTime} - {block.endTime}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p>No schedule blocks available</p>
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
  );
};

// Configure Schedule Form Component
interface ConfigureScheduleFormProps {
  availableYears: string[];
  onSaveSuccess: () => void;
}

const ConfigureScheduleForm: React.FC<ConfigureScheduleFormProps> = ({ availableYears, onSaveSuccess }) => {
  const [newAcademicYear, setNewAcademicYear] = useState('');
  const [yearExists, setYearExists] = useState(false);
  const [schedule, setSchedule] = useState<SchoolSchedule>(DEFAULT_SCHEDULE);
  const [isLoading, setIsLoading] = useState(false);
  const [copyFromExisting, setCopyFromExisting] = useState(false);
  const [sourceYear, setSourceYear] = useState('');

  // New hybrid scheduling state
  const [useHybridScheduling, setUseHybridScheduling] = useState(false);
  const [schoolStartTime, setSchoolStartTime] = useState('10:00');
  const [schoolEndTime, setSchoolEndTime] = useState('16:00');
  const [totalPeriods, setTotalPeriods] = useState(6);
  const [breakConfigs, setBreakConfigs] = useState<BreakConfig[]>([]);
  const [generatedBlocks, setGeneratedBlocks] = useState<TimeBlock[]>([]);
  const [showGeneratedSchedule, setShowGeneratedSchedule] = useState(false);
  const [applyToAllClasses, setApplyToAllClasses] = useState(true);
  const [applyToAllDays, setApplyToAllDays] = useState(true);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [scheduleGroups, setScheduleGroups] = useState<{
    classes: string[];
    days: string[];
    blocks: TimeBlock[];
  }[]>([]);
  const [weeklyHolidays, setWeeklyHolidays] = useState<{
    Sunday: boolean;
    Monday: boolean;
    Tuesday: boolean;
    Wednesday: boolean;
    Thursday: boolean;
    Friday: boolean;
    Saturday: boolean;
  }>({
    Sunday: false,
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false
  });

  const checkYearExists = (year: string) => {
    const exists = availableYears.includes(year);
    setYearExists(exists);
    return exists;
  };

  // Hybrid scheduling functions
  const addBreakConfig = () => {
    setBreakConfigs([...breakConfigs, { afterPeriod: 3, startTime: '13:00', endTime: '13:30' }]);
  };

  const removeBreakConfig = (index: number) => {
    setBreakConfigs(breakConfigs.filter((_, i) => i !== index));
  };

  const updateBreakConfig = (index: number, field: keyof BreakConfig, value: string | number) => {
    const newConfigs = [...breakConfigs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setBreakConfigs(newConfigs);
  };

  const generateSchedule = () => {
    if (!schoolStartTime || !schoolEndTime || totalPeriods <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Sort breaks by afterPeriod
    const sortedBreaks = [...breakConfigs].sort((a, b) => a.afterPeriod - b.afterPeriod);
    
    // Convert times to minutes for calculations
    const startMinutes = timeToMinutes(schoolStartTime);
    const endMinutes = timeToMinutes(schoolEndTime);
    const totalDayMinutes = endMinutes - startMinutes;

    if (totalDayMinutes <= 0) {
      toast.error('End time must be after start time');
      return;
    }

    const blocks: TimeBlock[] = [];
    let periodCount = 0;

    // Create segments based on breaks
    const segments: { start: number; end: number; periods: number }[] = [];
    let currentSegmentStart = startMinutes;
    let periodsInCurrentSegment = 0;

    // Calculate segments by finding breaks and counting periods between them
    for (let i = 1; i <= totalPeriods; i++) {
      periodsInCurrentSegment++;
      
      // Check if there's a break after this period
      const breakAfterThis = sortedBreaks.find(b => b.afterPeriod === i);
      
      if (breakAfterThis) {
        // Add segment ending at break start time
        segments.push({
          start: currentSegmentStart,
          end: timeToMinutes(breakAfterThis.startTime),
          periods: periodsInCurrentSegment
        });
        
        // Add break as a block
        blocks.push({
          type: 'break',
          startTime: breakAfterThis.startTime,
          endTime: breakAfterThis.endTime,
          label: `Break after Period ${i}`
        });
        
        // Start new segment after break
        currentSegmentStart = timeToMinutes(breakAfterThis.endTime);
        periodsInCurrentSegment = 0;
      }
    }

    // Add final segment (after last break to end of day)
    if (periodsInCurrentSegment > 0) {
      segments.push({
        start: currentSegmentStart,
        end: endMinutes,
        periods: periodsInCurrentSegment
      });
    }

    // Generate period blocks for each segment
    segments.forEach((segment) => {
      const segmentDuration = segment.end - segment.start;
      const periodDuration = Math.floor(segmentDuration / segment.periods);
      
      for (let i = 0; i < segment.periods; i++) {
        periodCount++;
        
        const periodStart = segment.start + (i * periodDuration);
        const periodEnd = i === segment.periods - 1 ? segment.end : periodStart + periodDuration;
        
        blocks.push({
          type: 'period',
          startTime: minutesToTime(periodStart),
          endTime: minutesToTime(periodEnd),
          label: `Period ${periodCount}`
        });
      }
    });

    // Sort blocks by start time to ensure chronological order
    blocks.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    setGeneratedBlocks(blocks);
    setShowGeneratedSchedule(true);
    toast.success('Schedule generated successfully!');
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const updateGeneratedBlock = (index: number, field: keyof TimeBlock, value: string) => {
    const newBlocks = [...generatedBlocks];
    newBlocks[index] = { ...newBlocks[index], [field]: value };
    setGeneratedBlocks(newBlocks);
  };

  const removeGeneratedBlock = (index: number) => {
    setGeneratedBlocks(generatedBlocks.filter((_, i) => i !== index));
  };

  const addGeneratedBlock = () => {
    const lastBlock = generatedBlocks[generatedBlocks.length - 1];
    const newStartTime = lastBlock ? lastBlock.endTime : schoolStartTime;
    const newEndTime = lastBlock ? minutesToTime(timeToMinutes(lastBlock.endTime) + 45) : minutesToTime(timeToMinutes(schoolStartTime) + 45);
    
    setGeneratedBlocks([...generatedBlocks, {
      type: 'period',
      startTime: newStartTime,
      endTime: newEndTime,
      label: `Period ${generatedBlocks.filter(b => b.type === 'period').length + 1}`
    }]);
  };

  const handleNewYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = e.target.value;
    setNewAcademicYear(year);
    if (year) {
      checkYearExists(year);
    } else {
      setYearExists(false);
    }
  };

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
    if (copyFromExisting) return;
    setSchedule(prev => ({
      ...prev,
      holidays: { ...prev.holidays, [day]: !prev.holidays[day] }
    }));
  };

  const addBreak = () => {
    if (copyFromExisting) return;
    setSchedule(prev => ({
      ...prev,
      breaks: [...prev.breaks, { name: `Break ${prev.breaks.length + 1}`, start: '', end: '' }]
    }));
  };

  const updateBreak = (index: number, field: keyof { name: string; start: string; end: string }, value: string) => {
    if (copyFromExisting) return;
    const newBreaks = [...schedule.breaks];
    newBreaks[index] = { ...newBreaks[index], [field]: value };
    setSchedule(prev => ({ ...prev, breaks: newBreaks }));
  };

  const removeBreak = (index: number) => {
    if (copyFromExisting) return;
    setSchedule(prev => ({ ...prev, breaks: prev.breaks.filter((_, i) => i !== index) }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAcademicYear) {
      toast.error('Please enter an academic year');
      return;
    }

    if (yearExists && !copyFromExisting) {
      toast.error('Academic year already exists. Please enter a new academic year.');
      return;
    }

    // Validate hybrid scheduling if enabled
    if (useHybridScheduling && showGeneratedSchedule && generatedBlocks.length === 0) {
      toast.error('Please generate a schedule before saving');
      return;
    }

    setIsLoading(true);
    try {
      let payload;

      if (useHybridScheduling && showGeneratedSchedule) {
        // Validate selections
        const selectedClassesList = applyToAllClasses ? ['all'] : selectedClasses;
        const selectedDaysList = applyToAllDays ? ['all'] : selectedDays;
        
        if (selectedClassesList.length === 0) {
          toast.error('Please select at least one class');
          setIsLoading(false);
          return;
        }
        
        if (selectedDaysList.length === 0) {
          toast.error('Please select at least one day');
          setIsLoading(false);
          return;
        }

        // Create main schedule group
        const mainGroup = {
          classes: selectedClassesList,
          days: selectedDaysList,
          blocks: generatedBlocks
        };

        // Combine with additional schedule groups
        const allGroups = [mainGroup, ...scheduleGroups];

        // New hybrid scheduling format with multiple schedule groups
        payload = {
          academicYear: newAcademicYear,
          schedules: allGroups,
          schoolId: 0,
          createdAt: new Date(),
          // Keep backward compatibility
          startTime: schoolStartTime,
          endTime: schoolEndTime,
          periodDuration: Math.floor((timeToMinutes(schoolEndTime) - timeToMinutes(schoolStartTime)) / totalPeriods),
          holidays: weeklyHolidays,
          breaks: schedule.breaks
        };
      } else {
        // Original format
        payload = {
          ...schedule,
          schoolId: 0,
          academicYear: newAcademicYear
        };
      }

      const res = await routineService.saveSchoolSchedule(payload);
      if (res.success) {
        toast.success(res.message);
        onSaveSuccess();
        // Reset form
        setNewAcademicYear('');
        setYearExists(false);
        setSchedule(DEFAULT_SCHEDULE);
        setCopyFromExisting(false);
        setSourceYear('');
        setUseHybridScheduling(false);
        setGeneratedBlocks([]);
        setShowGeneratedSchedule(false);
        setBreakConfigs([]);
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
    <form className="configure-schedule-form" onSubmit={handleSave}>
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
              </div>
            )}
          </div>
        )}
      </div>

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

          {/* Toggle between old and new system */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useHybridScheduling}
                onChange={(e) => setUseHybridScheduling(e.target.checked)}
              />
              <span>Use Hybrid Scheduling System (Auto-Generation + Manual Editing)</span>
            </label>
          </div>

          {!useHybridScheduling ? (
            // Original Manual Setup
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
                        ×
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
          ) : (
            // New Hybrid Scheduling System
            <div className="hybrid-scheduling-section">
              <div className="auto-generation-form">
                <h4>Auto-Generation Settings</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>School Start Time</label>
                    <input
                      type="time"
                      value={schoolStartTime}
                      onChange={(e) => setSchoolStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>School End Time</label>
                    <input
                      type="time"
                      value={schoolEndTime}
                      onChange={(e) => setSchoolEndTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Number of Periods</label>
                    <input
                      type="number"
                      value={totalPeriods}
                      onChange={(e) => setTotalPeriods(parseInt(e.target.value) || 1)}
                      min="1"
                      max="12"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Break Configuration</label>
                  <div className="breaks-config-list">
                    {breakConfigs.map((breakConfig, idx) => (
                      <div key={idx} className="break-config-item">
                        <div className="break-config-row">
                          <div className="form-group">
                            <label>After Period</label>
                            <input
                              type="number"
                              value={breakConfig.afterPeriod}
                              onChange={(e) => updateBreakConfig(idx, 'afterPeriod', parseInt(e.target.value) || 1)}
                              min="1"
                              max={totalPeriods}
                            />
                          </div>
                          <div className="form-group">
                            <label>Start Time</label>
                            <input
                              type="time"
                              value={breakConfig.startTime}
                              onChange={(e) => updateBreakConfig(idx, 'startTime', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>End Time</label>
                            <input
                              type="time"
                              value={breakConfig.endTime}
                              onChange={(e) => updateBreakConfig(idx, 'endTime', e.target.value)}
                            />
                          </div>
                          <button
                            type="button"
                            className="btn-remove-break"
                            onClick={() => removeBreakConfig(idx)}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn-add-break"
                      onClick={addBreakConfig}
                    >
                      + Add Break
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>School Weekly Holidays</label>
                  <div className="day-toggles">
                    {DAYS.map(day => (
                      <button
                        key={day}
                        type="button"
                        className={`day-toggle ${weeklyHolidays[day] ? 'selected' : ''}`}
                        onClick={() => setWeeklyHolidays(prev => ({
                          ...prev,
                          [day]: !prev[day]
                        }))}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={generateSchedule}
                  >
                    Generate Schedule
                  </button>
                </div>
              </div>

              {showGeneratedSchedule && (
                <div className="generated-schedule-section">
                  <h4>Generated Schedule - Editable Time Blocks</h4>
                  
                  <div className="time-blocks-table">
                    <div className="table-header">
                      <div>Type</div>
                      <div>Start Time</div>
                      <div>End Time</div>
                      <div>Label</div>
                      <div>Actions</div>
                    </div>
                    {generatedBlocks.map((block, idx) => (
                      <div key={idx} className="table-row">
                        <div>
                          <select
                            value={block.type}
                            onChange={(e) => updateGeneratedBlock(idx, 'type', e.target.value)}
                            className="block-type-select"
                          >
                            <option value="period">Period</option>
                            <option value="break">Break</option>
                          </select>
                        </div>
                        <div>
                          <input
                            type="time"
                            value={block.startTime}
                            onChange={(e) => updateGeneratedBlock(idx, 'startTime', e.target.value)}
                            className="time-input"
                          />
                        </div>
                        <div>
                          <input
                            type="time"
                            value={block.endTime}
                            onChange={(e) => updateGeneratedBlock(idx, 'endTime', e.target.value)}
                            className="time-input"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={block.label || ''}
                            onChange={(e) => updateGeneratedBlock(idx, 'label', e.target.value)}
                            placeholder="Enter label"
                            className="label-input"
                          />
                        </div>
                        <div>
                          <button
                            type="button"
                            className="btn-remove-block"
                            onClick={() => removeGeneratedBlock(idx)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="add-block-row">
                      <button
                        type="button"
                        className="btn-add-block"
                        onClick={addGeneratedBlock}
                      >
                        + Add Time Block
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="apply-options-section">
                <h4>Apply Options</h4>
                <div className="apply-options">
                  <div className="apply-option-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={applyToAllClasses}
                        onChange={(e) => setApplyToAllClasses(e.target.checked)}
                      />
                      <span>Apply to all classes</span>
                    </label>
                    {!applyToAllClasses && (
                      <div className="multi-select-container">
                        <label>Select Classes:</label>
                        <div className="checkbox-group">
                          {CLASSES.map(cls => (
                            <label key={cls} className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={selectedClasses.includes(cls)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedClasses([...selectedClasses, cls]);
                                  } else {
                                    setSelectedClasses(selectedClasses.filter(c => c !== cls));
                                  }
                                }}
                              />
                              <span>{cls}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="apply-option-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={applyToAllDays}
                        onChange={(e) => setApplyToAllDays(e.target.checked)}
                      />
                      <span>Apply to all days</span>
                    </label>
                    {!applyToAllDays && (
                      <div className="multi-select-container">
                        <label>Select Days:</label>
                        <div className="checkbox-group">
                          {DAYS.map(day => (
                            <label key={day} className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={selectedDays.includes(day)}
                                disabled={weeklyHolidays[day]}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedDays([...selectedDays, day]);
                                  } else {
                                    setSelectedDays(selectedDays.filter(d => d !== day));
                                  }
                                }}
                              />
                              <span className={weeklyHolidays[day] ? 'holiday-disabled' : ''}>
                                {day} {weeklyHolidays[day] && '(Holiday)'}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="form-footer">
        {/* Show Add Another Schedule button if partial selections */}
        {showGeneratedSchedule && (!applyToAllClasses || !applyToAllDays) && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              const newGroup = {
                classes: applyToAllClasses ? ['all'] : selectedClasses,
                days: applyToAllDays ? ['all'] : selectedDays,
                blocks: [...generatedBlocks]
              };
              setScheduleGroups([...scheduleGroups, newGroup]);
              toast.success('Schedule group added! You can add more configurations.');
            }}
          >
            + Add Another Schedule
          </button>
        )}
        
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading || (!copyFromExisting && yearExists)}
        >
          {isLoading ? 'Saving...' : `Save for ${newAcademicYear || 'New Year'}`}
        </button>
      </div>
    </form>
  );
};

// Edit Schedule Form Component
interface EditScheduleFormProps {
  availableYears: string[];
  onSaveSuccess: () => void;
}

const EditScheduleForm: React.FC<EditScheduleFormProps> = ({ availableYears, onSaveSuccess }) => {
  const [selectedYear, setSelectedYear] = useState(availableYears[0] || '');
  const [schedule, setSchedule] = useState<SchoolSchedule>(DEFAULT_SCHEDULE);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchScheduleForEdit = useCallback(async (year: string) => {
    if (!year) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/academic/school-schedule?academicYear=${encodeURIComponent(year)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(r => r.json()).then(data => ({ success: data.success, data: data.data, message: data.message }));
      if (res.success && res.data) {
        setSchedule(res.data);
      } else {
        setSchedule(DEFAULT_SCHEDULE);
        toast.info('No existing schedule found for this year');
      }
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
      toast.error('Failed to load schedule');
      setSchedule(DEFAULT_SCHEDULE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchScheduleForEdit(selectedYear);
    }
  }, [selectedYear, fetchScheduleForEdit]);

  const addBreak = () => {
    setSchedule({
      ...schedule,
      breaks: [...schedule.breaks, { name: '', start: '12:00', end: '12:30' }]
    });
  };

  const removeBreak = (index: number) => {
    const newBreaks = [...schedule.breaks];
    newBreaks.splice(index, 1);
    setSchedule({ ...schedule, breaks: newBreaks });
  };

  const updateBreak = (index: number, field: string, value: string) => {
    const newBreaks = [...schedule.breaks];
    newBreaks[index] = { ...newBreaks[index], [field]: value };
    setSchedule({ ...schedule, breaks: newBreaks });
  };

  const toggleHoliday = (day: string) => {
    setSchedule({
      ...schedule,
      holidays: { ...schedule.holidays, [day]: !schedule.holidays[day] }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYear) {
      toast.error('Please select an academic year');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/academic/school-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          academicYear: selectedYear,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          periodDuration: schedule.periodDuration,
          holidays: schedule.holidays,
          breaks: schedule.breaks
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Schedule updated successfully');
        onSaveSuccess();
      } else {
        toast.error(data.message || 'Failed to update schedule');
      }
    } catch (err) {
      console.error('Failed to save schedule:', err);
      toast.error('Failed to save schedule');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="edit-schedule-section" onSubmit={handleSubmit}>
      <div className="edit-schedule-year-selector">
        <label>
          Select Academic Year to Edit
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Select academic year</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => fetchScheduleForEdit(selectedYear)}
          className="btn-refresh"
          disabled={isLoading || !selectedYear}
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {isLoading ? (
        <div className="edit-schedule-loading">Loading schedule...</div>
      ) : (
        <>
          <div className="edit-schedule-time-grid">
            <div className="edit-schedule-time-group">
              <label>School Start Time</label>
              <input
                type="time"
                value={schedule.startTime}
                onChange={(e) => setSchedule({ ...schedule, startTime: e.target.value })}
                required
              />
            </div>
            <div className="edit-schedule-time-group">
              <label>School End Time</label>
              <input
                type="time"
                value={schedule.endTime}
                onChange={(e) => setSchedule({ ...schedule, endTime: e.target.value })}
                required
              />
            </div>
            <div className="edit-schedule-time-group">
              <label>Period Duration (minutes)</label>
              <input
                type="number"
                value={schedule.periodDuration}
                onChange={(e) => setSchedule({ ...schedule, periodDuration: parseInt(e.target.value) })}
                min="15"
                max="120"
                required
              />
            </div>
          </div>

          <div className="edit-schedule-holidays">
            <h4>Weekly Holidays</h4>
            <div className="edit-schedule-holidays-grid">
              {DAYS.map(day => (
                <label key={day} className={`edit-schedule-holiday-item ${schedule.holidays[day] ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={schedule.holidays[day]}
                    onChange={() => toggleHoliday(day)}
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="edit-schedule-breaks">
            <h4>Breaks & Lunch</h4>
            <div className="edit-schedule-breaks-list">
              {schedule.breaks.map((brk, idx) => (
                <div key={idx} className="edit-schedule-break-row">
                  <input
                    type="text"
                    placeholder="Break name"
                    value={brk.name}
                    onChange={(e) => updateBreak(idx, 'name', e.target.value)}
                  />
                  <input
                    type="time"
                    value={brk.start}
                    onChange={(e) => updateBreak(idx, 'start', e.target.value)}
                  />
                  <span className="time-separator">to</span>
                  <input
                    type="time"
                    value={brk.end}
                    onChange={(e) => updateBreak(idx, 'end', e.target.value)}
                  />
                  <button type="button" onClick={() => removeBreak(idx)} className="btn-remove-break">×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addBreak} className="edit-schedule-btn-add-break">+ Add Break</button>
          </div>

          <div className="edit-schedule-footer">
            <button type="submit" className="edit-schedule-btn-save" disabled={isSaving || !selectedYear}>
              {isSaving ? 'Saving...' : 'Update Schedule'}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default function SchoolSchedulePage() {
  const [activeTab, setActiveTab] = useState<TabType>('schoolSchedule');
  
  // State for academic years from school_schedules
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  // Fetch academic years from school_schedules
  const fetchAcademicYears = useCallback(async () => {
    try {
      const res = await routineService.fetchAcademicYearsFromSchedules();
      if (res.success) {
        setAvailableYears(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch academic years:', err);
    }
  }, []);

  // Fetch academic years on mount
  useEffect(() => {
    fetchAcademicYears();
  }, [fetchAcademicYears]);

  const handleScheduleSaveSuccess = () => {
    toast.success('Schedule saved successfully');
    // Refresh academic years list after saving schedule
    fetchAcademicYears();
  };

  const tabs = [
    { id: 'schoolSchedule' as TabType, label: 'School Schedule' },
    { id: 'configureSchedule' as TabType, label: 'Configure Schedule' },
    { id: 'editSchedule' as TabType, label: 'Edit Schedule' },
  ];

  return (
    <div className="subjects-page">
      <AcademicNavbar />
      <Toaster position="top-right" />
      <main className="main-content">
        <header className="page-header">
          <h1 className="page-title">School Schedule</h1>
        </header>

        {/* Mini Navbar */}
        <div className="mini-navbar-container">
          <div className="tab-switcher">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="content-container">
          {/* Tab 1: School Schedule */}
          {activeTab === 'schoolSchedule' && (
            <section className="section-container card">
              <div className="subjects-header">
                <h2 className="section-title">School Schedule</h2>
              </div>
              <SchoolScheduleView availableYears={availableYears} />
            </section>
          )}

          {/* Tab 2: Configure Schedule */}
          {activeTab === 'configureSchedule' && (
            <section className="section-container card">
              <div className="subjects-header">
                <h2 className="section-title">Configure Schedule</h2>
              </div>
              <ConfigureScheduleForm
                availableYears={availableYears}
                onSaveSuccess={handleScheduleSaveSuccess}
              />
            </section>
          )}

          {/* Tab 3: Edit Schedule */}
          {activeTab === 'editSchedule' && (
            <section className="section-container card">
              <div className="subjects-header">
                <h2 className="section-title">Edit Schedule</h2>
              </div>
              <EditScheduleForm
                availableYears={availableYears}
                onSaveSuccess={handleScheduleSaveSuccess}
              />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
