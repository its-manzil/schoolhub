'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSubjects } from '../../modules/academic/subjects/hooks/useSubjects';
import SubjectFormModal from '../../modules/academic/subjects/components/SubjectFormModal';
import ImportModal from '../../modules/academic/subjects/components/ImportModal';
import { routineService } from '../../modules/academic/routine/services/routineService';
import { SchoolSchedule } from '../../modules/academic/routine/types';
import Modal from './components/Modal';
import './subjects.css';
import { SubjectRecord, Subject, CLASS_OPTIONS } from '../../modules/academic/subjects/types';
import { Toaster, toast } from 'sonner';
import AcademicNavbar from '../components/AcademicNavbar';

type TabType = 'subjects' | 'schoolSchedule' | 'configureSubjects' | 'configureSchedule';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

// Configure Subjects Form with dropdown for academic year
interface ConfigureSubjectsFormProps {
  onSave: (payload: { className: string; academicYear: string; subjects: Subject[] }) => void;
  isLoading: boolean;
  availableYears: string[];
}

const ConfigureSubjectsForm: React.FC<ConfigureSubjectsFormProps> = ({ onSave, isLoading, availableYears }) => {
  const [academicYear, setAcademicYear] = useState(availableYears[0] || '');
  const [className, setClassName] = useState('Class 1');
  const [subjects, setSubjects] = useState<Subject[]>([
    { name: '', type: 'Primary', creditHours: undefined, description: '' }
  ]);

  // Update academic year when availableYears changes
  useEffect(() => {
    if (availableYears.length > 0 && !academicYear) {
      setAcademicYear(availableYears[0]);
    }
  }, [availableYears, academicYear]);

  const addSubject = () => {
    setSubjects([...subjects, { name: '', type: 'Primary', creditHours: undefined, description: '' }]);
  };

  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const updateSubject = <K extends keyof Subject>(index: number, field: K, value: Subject[K]) => {
    const newSubjects = [...subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setSubjects(newSubjects);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!academicYear) {
      toast.error('Academic year is required');
      return;
    }

    const invalid = subjects.some(s => !s.name.trim());
    if (invalid) {
      toast.error('All subjects must have a name');
      return;
    }

    const invalidCredit = subjects.some(s => s.creditHours && (s.creditHours < 1 || s.creditHours > 10));
    if (invalidCredit) {
      toast.error('Credit hours must be between 1 and 10');
      return;
    }

    onSave({ className, academicYear, subjects });
    // Reset form after successful save
    setAcademicYear('');
    setClassName('Class 1');
    setSubjects([{ name: '', type: 'Primary', creditHours: undefined, description: '' }]);
  };

  return (
    <form className="subject-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <div className="form-group">
          <label>Academic Year (BS)</label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="academic-year-select"
            required
          >
            <option value="">Select academic year</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {availableYears.length === 0 && (
            <span className="hint-text">No academic years available. Please configure a schedule first.</span>
          )}
        </div>
        <div className="form-group">
          <label>Class</label>
          <select value={className} onChange={(e) => setClassName(e.target.value)}>
            {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="subjects-list-editor">
        {subjects.map((sub, idx) => (
          <div key={idx} className="subject-item-row">
            <input
              type="text"
              placeholder="Subject Name"
              value={sub.name}
              onChange={(e) => updateSubject(idx, 'name', e.target.value)}
            />
            <select value={sub.type} onChange={(e) => updateSubject(idx, 'type', e.target.value as Subject['type'])}>
              <option value="Primary">Primary</option>
              <option value="Minor">Minor</option>
              <option value="Optional">Optional</option>
            </select>
            <input
              type="number"
              placeholder="Credits"
              value={sub.creditHours || ''}
              onChange={(e) => updateSubject(idx, 'creditHours', parseInt(e.target.value))}
              min="1"
              max="10"
            />
            <button type="button" onClick={() => removeSubject(idx)} className="btn-remove">×</button>
          </div>
        ))}
        <button type="button" onClick={addSubject} className="btn-add-subject">+ Add Subject</button>
      </div>

      <div className="form-footer">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Record'}
        </button>
      </div>
    </form>
  );
};

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

  const checkYearExists = (year: string) => {
    const exists = availableYears.includes(year);
    setYearExists(exists);
    return exists;
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
        onSaveSuccess();
        // Reset form
        setNewAcademicYear('');
        setYearExists(false);
        setSchedule(DEFAULT_SCHEDULE);
        setCopyFromExisting(false);
        setSourceYear('');
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
        </div>
      )}

      <div className="form-footer">
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

// Subjects Grouped by Class Component
interface SubjectsByClassProps {
  subjectsRecords: SubjectRecord[];
  isLoading: boolean;
  onEdit: (record: SubjectRecord) => void;
  onDelete: (id: string) => void;
}

const SubjectsByClass: React.FC<SubjectsByClassProps> = ({ subjectsRecords, isLoading, onEdit, onDelete }) => {
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Get available years from records
  const availableYears = Array.from(new Set(subjectsRecords.map(r => r.academicYear))).sort();

  // Set default year if not set and years are available
  useEffect(() => {
    if (availableYears.length > 0 && !selectedYear) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  // Filter records by selected year
  const filteredRecords = selectedYear
    ? subjectsRecords.filter(r => r.academicYear === selectedYear)
    : subjectsRecords;

  // Group by class
  const groupedByClass = filteredRecords.reduce((acc, record) => {
    if (!acc[record.className]) {
      acc[record.className] = [];
    }
    acc[record.className].push(record);
    return acc;
  }, {} as Record<string, SubjectRecord[]>);

  // Get sorted class names
  const classNames = Object.keys(groupedByClass).sort((a, b) => {
    const aIndex = CLASS_OPTIONS.indexOf(a);
    const bIndex = CLASS_OPTIONS.indexOf(b);
    return aIndex - bIndex;
  });

  // Find max subjects count for row alignment
  const maxSubjectsCount = Math.max(
    0,
    ...Object.values(groupedByClass).map(records =>
      Math.max(...records.map(r => r.subjects.length))
    )
  );

  if (isLoading) return <div className="loading">Loading subjects...</div>;

  return (
    <div className="subjects-by-class">
      <div className="academic-year-filter">
        <label>Academic Year</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="academic-year-select"
        >
          <option value="">All Years</option>
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {classNames.length === 0 ? (
        <div className="empty-state">No subjects found for the selected academic year.</div>
      ) : (
        <div className="subjects-table-container">
          <table className="subjects-grouped-table">
            <thead>
              <tr>
                {classNames.map(className => (
                  <th key={className} className="class-header">{className}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxSubjectsCount }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {classNames.map(className => {
                    const records = groupedByClass[className];
                    const allSubjects = records.flatMap(r => r.subjects);
                    const subject = allSubjects[rowIndex];
                    const record = records.find(r => r.subjects.includes(subject));

                    return (
                      <td key={className} className="subject-cell">
                        {subject ? (
                          <div className="subject-item">
                            <span className="subject-name">{subject.name}</span>
                            <span className={`subject-type-badge ${subject.type.toLowerCase()}`}>
                              {subject.type}
                            </span>
                            {record?._id && rowIndex === 0 && (
                              <div className="subject-actions">
                                <button
                                  className="btn-edit-mini"
                                  onClick={() => onEdit(record)}
                                  title="Edit"
                                >
                                  ✎
                                </button>
                                <button
                                  className="btn-delete-mini"
                                  onClick={() => record._id && onDelete(record._id)}
                                  title="Delete"
                                >
                                  ×
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="empty-cell">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default function AcademicSubjectsPage() {
  const {
    subjects: subjectsRecords,
    isLoading: isLoadingSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    fetchSubjects,
    importSubjects
  } = useSubjects();

  const [activeTab, setActiveTab] = useState<TabType>('subjects');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SubjectRecord | null>(null);
  
  // State for academic years from school_schedules
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  const [routineYear] = useState('2081-2082');
  const [routineClass] = useState('Class 1');

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

  // Fetch subjects and academic years on mount
  useEffect(() => {
    fetchSubjects();
    fetchAcademicYears();
  }, [fetchSubjects, fetchAcademicYears]);

  const handleSaveSubjects = async (payload: { className: string; academicYear: string; subjects: Subject[] }) => {
    let success;
    if (editingRecord?._id) {
      success = await updateSubject(editingRecord._id, payload);
    } else {
      success = await createSubject(payload);
    }
    if (success) {
      setIsModalOpen(false);
      setEditingRecord(null);
    }
  };

  const handleConfigureSubjectsSave = async (payload: { className: string; academicYear: string; subjects: Subject[] }) => {
    const success = await createSubject(payload);
    if (success) {
      // Stay on configure subjects tab, but could also switch to subjects tab
      toast.success('Subjects saved successfully');
    }
  };

  const handleImport = async (sourceClass: string, sourceYear: string) => {
    const success = await importSubjects(sourceClass, sourceYear, routineClass, routineYear);
    if (success) setIsImportModalOpen(false);
  };

  const handleScheduleSaveSuccess = () => {
    toast.success('Schedule saved successfully');
    // Refresh academic years list after saving schedule
    fetchAcademicYears();
  };

  const handleEditFromSubjectsTab = (record: SubjectRecord) => {
    setEditingRecord(record);
    setActiveTab('configureSubjects');
  };

  const tabs = [
    { id: 'subjects' as TabType, label: 'Subjects' },
    { id: 'schoolSchedule' as TabType, label: 'School Schedule' },
    { id: 'configureSubjects' as TabType, label: 'Configure Subjects' },
    { id: 'configureSchedule' as TabType, label: 'Configure Schedule' },
  ];

  return (
    <div className="subjects-page">
      <AcademicNavbar />
      <Toaster position="top-right" />
      <main className="main-content">
        <header className="page-header">
          <h1 className="page-title">Subjects & Routine</h1>
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
          {/* Tab 1: Subjects */}
          {activeTab === 'subjects' && (
            <section className="section-container card">
              <div className="subjects-header">
                <h2 className="section-title">Subjects by Class</h2>
                <div className="header-controls">
                  <button className="btn-primary" onClick={() => setIsImportModalOpen(true)}>
                    Import Subjects
                  </button>
                </div>
              </div>

              <SubjectsByClass
                subjectsRecords={subjectsRecords}
                isLoading={isLoadingSubjects}
                onEdit={handleEditFromSubjectsTab}
                onDelete={deleteSubject}
              />
            </section>
          )}

          {/* Tab 2: School Schedule */}
          {activeTab === 'schoolSchedule' && (
            <section className="section-container card">
              <div className="subjects-header">
                <h2 className="section-title">School Schedule</h2>
              </div>
              <SchoolScheduleView availableYears={availableYears} />
            </section>
          )}

          {/* Tab 3: Configure Subjects */}
          {activeTab === 'configureSubjects' && (
            <section className="section-container card">
              <div className="subjects-header">
                <h2 className="section-title">
                  {editingRecord ? 'Edit Subjects' : 'Configure Subjects'}
                </h2>
                {editingRecord && (
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setEditingRecord(null);
                    }}
                  >
                    Add New
                  </button>
                )}
              </div>
              <ConfigureSubjectsForm
                onSave={editingRecord ? handleSaveSubjects : handleConfigureSubjectsSave}
                isLoading={isLoadingSubjects}
                availableYears={availableYears}
              />
            </section>
          )}

          {/* Tab 4: Configure Schedule */}
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
        </div>
      </main>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Subjects"
      >
        <ImportModal
          onImport={handleImport}
          onClose={() => setIsImportModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal for inline editing */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        title={editingRecord ? "Edit Subjects" : "Add Subjects"}
      >
        <SubjectFormModal
          initialData={editingRecord}
          onSave={handleSaveSubjects}
          isLoading={isLoadingSubjects}
        />
      </Modal>
    </div>
  );
}

