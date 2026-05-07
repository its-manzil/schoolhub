'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Save,
  Printer,
  Download,
  AlertTriangle,
  CalendarDays,
  FileSpreadsheet,
  Loader2,
  Eye
} from 'lucide-react';
import './routine.css';
import { useToast } from '../../../context/ToastContext';
import {
  getExams,
  getAcademicYears,
  updateExamRoutine,
  Exam,
  ExamRoutineItem
} from '../lib/examService';
import { toBS, formatBSDateWithMonth, generateDateRange, formatBSDate } from '@/app/utils/dateConverter';
import BSDateInput from '../components/BSDateInput';
import SubjectSelector from '../components/SubjectSelector';
import ExamRoutinePreview from '../components/ExamRoutinePreview';
import { Subject } from '@/app/modules/academic/subjects/types';

export default function RoutinePage() {
  const { showToast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // Each row represents a DATE with multiple subjects (for optional/minor sharing)
  const [routineRows, setRoutineRows] = useState<{
    id: number;
    date: string;
    dayOfWeek: string;
    subjects: {
      id: number;
      subject: string;
      subjectType: string;
      startTime: string;
      endTime: string;
      subjectData: Subject | null;
    }[];
  }[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState({ year: '', exam: '', class: '' });
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load exams and years on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [examsData, yearsData] = await Promise.all([
        getExams(),
        getAcademicYears()
      ]);
      setExams(examsData);
      setYears(yearsData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter exams when roadmap changes
  useEffect(() => {
    if (activeRoadmap.year && activeRoadmap.exam && activeRoadmap.class) {
      const exam = exams.find(e => 
        e.academicYear === activeRoadmap.year &&
        e.term === activeRoadmap.exam &&
        e.className === activeRoadmap.class
      );
      setSelectedExam(exam || null);
      
      // Load existing routine if available - group by date
      if (exam?.routine && exam.routine.length > 0) {
        const groupedByDate = new Map<string, typeof exam.routine>();
        exam.routine.forEach(r => {
          if (!groupedByDate.has(r.date)) {
            groupedByDate.set(r.date, []);
          }
          groupedByDate.get(r.date)?.push(r);
        });

        const loadedRows = Array.from(groupedByDate.entries()).map(([date, routines], idx) => ({
          id: idx + 1,
          date,
          dayOfWeek: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
          subjects: routines.map((r, sIdx) => ({
            id: sIdx + 1,
            subject: r.subject,
            subjectType: 'Primary',
            startTime: r.startTime || '',
            endTime: r.endTime || '',
            subjectData: null as Subject | null
          }))
        }));
        setRoutineRows(loadedRows);
      } else {
        setRoutineRows([]);
      }
    }
  }, [activeRoadmap, exams]);

  // Add new date row
  const addDateRow = () => {
    setRoutineRows([...routineRows, {
      id: Date.now(),
      date: '',
      dayOfWeek: '',
      subjects: []
    }]);
  };

  // Remove entire date row
  const removeDateRow = (rowId: number) => {
    setRoutineRows(routineRows.filter(row => row.id !== rowId));
  };

  // Add subject to existing date row
  const addSubjectToRow = (rowId: number, subjectType: string = 'Primary') => {
    setRoutineRows(routineRows.map(row => {
      if (row.id === rowId) {
        // Calculate time based on existing subjects
        let startTime = '10:00';
        let endTime = '12:00';

        if (subjectType === 'Optional' && row.subjects.length > 0) {
          // Use same time as first optional
          const firstOptional = row.subjects.find(s => s.subjectType === 'Optional');
          if (firstOptional) {
            startTime = firstOptional.startTime;
            endTime = firstOptional.endTime;
          }
        } else if (subjectType === 'Minor') {
          // Stagger: 10:00-11:00, 11:00-12:00, etc.
          const minorCount = row.subjects.filter(s => s.subjectType === 'Minor').length;
          startTime = `${String(10 + minorCount).padStart(2, '0')}:00`;
          endTime = `${String(11 + minorCount).padStart(2, '0')}:00`;
        }

        return {
          ...row,
          subjects: [...row.subjects, {
            id: Date.now(),
            subject: '',
            subjectType,
            startTime,
            endTime,
            subjectData: null
          }]
        };
      }
      return row;
    }));
  };

  // Remove subject from row
  const removeSubjectFromRow = (rowId: number, subjectId: number) => {
    setRoutineRows(routineRows.map(row => {
      if (row.id === rowId) {
        return { ...row, subjects: row.subjects.filter(s => s.id !== subjectId) };
      }
      return row;
    }));
  };

  const handleSave = async () => {
    if (!selectedExam?._id) {
      showToast('Please select an exam first', 'error');
      return;
    }

    // Check for duplicate dates (Primary subjects only)
    const primaryDates = routineRows
      .flatMap(r => r.subjects.filter(s => s.subjectType === 'Primary').map(() => r.date))
      .filter(d => d !== '');
    const hasDuplicate = new Set(primaryDates).size !== primaryDates.length;

    if (hasDuplicate) {
      showToast('Warning: Multiple Primary subjects scheduled for the same date.', 'error');
    }

    // Basic validation
    const invalidRows = routineRows.filter(r => r.subjects.length === 0 || !r.date);
    if (invalidRows.length > 0) {
      showToast('Please select date and add subjects for all rows', 'error');
      return;
    }

    try {
      setIsSaving(true);
      // Flatten routine rows into exam routine items
      const routineData: ExamRoutineItem[] = routineRows.flatMap(r =>
        r.subjects.map(sub => ({
          subject: sub.subject,
          date: r.date,
          startTime: sub.startTime,
          endTime: sub.endTime
        }))
      );

      await updateExamRoutine(selectedExam._id, routineData);
      showToast('Exam routine updated successfully!', 'success');
      await loadData(); // Reload to get updated data
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save routine', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMergeAndSave = async () => {
    setShowAlert(false);
    await handleSave();
  };

  // Get unique exam types for the selected year
  const examTypes = [...new Set(
    exams
      .filter(e => e.academicYear === activeRoadmap.year)
      .map(e => e.term)
  )];

  // Get unique classes for the selected year and exam
  const availableClasses = [...new Set(
    exams
      .filter(e => e.academicYear === activeRoadmap.year && e.term === activeRoadmap.exam)
      .map(e => e.className)
  )];

  // Get all unique dates from all routines for preview
  const allDates = [...new Set(
    exams
      .filter(e => e.academicYear === activeRoadmap.year && e.term === activeRoadmap.exam)
      .flatMap(e => e.routine?.map(r => r.date) || [])
  )].sort();

  // Get preview data for the excel-style table
  const previewExams = exams.filter(e => 
    e.academicYear === activeRoadmap.year && 
    e.term === activeRoadmap.exam
  );

  if (loading) {
    return (
      <div className="routine-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
          <Loader2 size={24} className="spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="routine-container">
      {/* Roadmap Dropdowns */}
      <section className="roadmap-section">
        <div className="roadmap-group">
          <label>Academic Year</label>
          <select 
            value={activeRoadmap.year} 
            onChange={(e) => setActiveRoadmap({ year: e.target.value, exam: '', class: '' })}
          >
            <option value="">Select Year</option>
            {years.map(year => (
              <option key={year} value={year}>{year} BS</option>
            ))}
          </select>
        </div>
        <div className="roadmap-group">
          <label>Exam Name</label>
          <select 
            value={activeRoadmap.exam}
            onChange={(e) => setActiveRoadmap({...activeRoadmap, exam: e.target.value, class: '' })}
            disabled={!activeRoadmap.year}
          >
            <option value="">Select Exam</option>
            {examTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="roadmap-group">
          <label>Class</label>
          <select 
            value={activeRoadmap.class}
            onChange={(e) => setActiveRoadmap({...activeRoadmap, class: e.target.value})}
            disabled={!activeRoadmap.exam}
          >
            <option value="">Select Class</option>
            {availableClasses.map(cls => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Routine Entry Form with New Components */}
      {activeRoadmap.class && selectedExam && (
        <section className="routine-form-section">
          <div className="card-header">
            <h2 className="form-title">
              <CalendarDays size={22} color="#10b981" />
              Configure Routine for {selectedExam.name} - Class {activeRoadmap.class}
            </h2>
          </div>

          {/* Date Range Section */}
          <div className="date-range-section">
            <h3 className="section-subtitle">Exam Period (BS Dates)</h3>
            <div className="date-range-inputs">
              <BSDateInput
                label="Start Date"
                value={selectedExam.startDate || ''}
                onChange={() => {}}
                disabled={true}
                placeholder="YYYY-MM-DD"
              />
              <BSDateInput
                label="End Date"
                value={selectedExam.endDate || ''}
                onChange={() => {}}
                disabled={true}
                placeholder="YYYY-MM-DD"
              />
            </div>
          </div>

          {/* Routine Table: Date | Day | Subject(s) | Time */}
          <div className="routine-table-container">
            <table className="routine-table">
              <thead>
                <tr>
                  <th>Exam Date (BS)</th>
                  <th>Day</th>
                  <th>Subject(s)</th>
                  <th>Time (Start - End)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {routineRows.map((row: typeof routineRows[0]) => {
                  // Generate available dates
                  const availableDates = selectedExam.startDate && selectedExam.endDate
                    ? generateDateRange(selectedExam.startDate, selectedExam.endDate)
                    : [];

                  // Get used dates by other rows
                  const usedDates = routineRows
                    .filter(r => r.id !== row.id && r.date)
                    .map(r => r.date);

                  // Get all used subjects across all rows (for filtering out already selected)
                  const usedSubjects = routineRows.flatMap(r =>
                    r.subjects.filter(s => s.subject).map(s => s.subject)
                  );

                  // Determine subject type filter for this row
                  const subjectTypeFilter = row.subjects.length > 0
                    ? row.subjects[0].subjectType
                    : undefined;

                  // Check if this row has subjects that lock the date
                  const hasOptionalOrMinor = row.subjects.some(s =>
                    s.subjectType === 'Optional' || s.subjectType === 'Minor'
                  );

                  // Date is locked if it has optional/minor subjects
                  const isDateLocked = hasOptionalOrMinor && row.subjects.length > 0;

                  return (
                    <tr key={row.id}>
                      {/* Date Column */}
                      <td rowSpan={Math.max(1, row.subjects.length)}>
                        <select
                          value={row.date}
                          onChange={(e) => {
                            const newDate = e.target.value;
                            const dayOfWeek = newDate
                              ? new Date(newDate).toLocaleDateString('en-US', { weekday: 'long' })
                              : '';
                            setRoutineRows(routineRows.map(r =>
                              r.id === row.id ? { ...r, date: newDate, dayOfWeek } : r
                            ));
                          }}
                          className="table-date-select"
                          disabled={!selectedExam.startDate || !selectedExam.endDate || isDateLocked}
                          title={isDateLocked ? 'Date locked - Optional/Minor subjects present' : ''}
                        >
                          <option value="">Select Date</option>
                          {availableDates.map((bsDate) => {
                            const dateStr = formatBSDate(bsDate);
                            const isUsed = usedDates.includes(dateStr);
                            return (
                              <option
                                key={dateStr}
                                value={dateStr}
                                disabled={isUsed && row.date !== dateStr}
                              >
                                {dateStr} {isUsed && row.date !== dateStr ? '(Used)' : ''}
                              </option>
                            );
                          })}
                        </select>
                        {isDateLocked && <span className="locked-badge">Locked</span>}
                      </td>

                      {/* Day Column */}
                      <td rowSpan={Math.max(1, row.subjects.length)} className="day-column">
                        {row.dayOfWeek || '-'}
                      </td>

                      {/* Subject(s) Column - Shows all subjects in this date */}
                      <td className="subjects-cell">
                        {row.subjects.length === 0 ? (
                          <div className="no-subject">
                            <SubjectSelector
                              academicYear={activeRoadmap.year}
                              clsName={activeRoadmap.class}
                              selectedSubject=""
                              onSubjectSelect={(subject, subjectData) => {
                                const subjectType = (subjectData?.type as string) || 'Primary';
                                const startTime = '10:00';
                                const endTime = '12:00';

                                setRoutineRows(routineRows.map((r: typeof routineRows[0]) => {
                                  if (r.id === row.id) {
                                    return {
                                      ...r,
                                      subjects: [{
                                        id: Date.now(),
                                        subject,
                                        subjectType,
                                        startTime,
                                        endTime,
                                        subjectData
                                      }]
                                    };
                                  }
                                  return r;
                                }));
                              }}
                              disabled={!row.date}
                              className="table-subject-selector"
                              usedSubjects={usedSubjects}
                            />
                          </div>
                        ) : (
                          <div className="subject-list">
                            {row.subjects.map((sub) => (
                              <div key={sub.id} className="subject-row">
                                <SubjectSelector
                                  academicYear={activeRoadmap.year}
                                  clsName={activeRoadmap.class}
                                  selectedSubject={sub.subject}
                                  onSubjectSelect={(newSubject, newData) => {
                                    setRoutineRows(routineRows.map((r: typeof routineRows[0]) => {
                                      if (r.id === row.id) {
                                        return {
                                          ...r,
                                          subjects: r.subjects.map(s =>
                                            s.id === sub.id
                                              ? { ...s, subject: newSubject, subjectData: newData, subjectType: (newData?.type as string) || 'Primary' }
                                              : s
                                          )
                                        };
                                      }
                                      return r;
                                    }));
                                  }}
                                  disabled={false}
                                  className="table-subject-selector compact"
                                  usedSubjects={usedSubjects}
                                  subjectTypeFilter={subjectTypeFilter}
                                />
                                {row.subjects.length > 1 && (
                                  <button
                                    className="btn-icon delete small"
                                    onClick={() => removeSubjectFromRow(row.id, sub.id)}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            ))}
                            {/* Add more subjects button - only for Optional/Minor rows */}
                            {row.subjects.length > 0 && row.subjects[0].subjectType !== 'Primary' && (
                              <button
                                className="btn-add-subject"
                                onClick={() => addSubjectToRow(row.id, row.subjects[0].subjectType)}
                              >
                                <Plus size={14} /> Add {row.subjects[0].subjectType}
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Time Column */}
                      <td className="time-column">
                        {row.subjects.length === 0 ? (
                          <span className="select-date-first">Select subject first</span>
                        ) : (
                          <div className="time-slots">
                            {row.subjects.map((sub) => (
                              <div key={sub.id} className="time-slot-row">
                                <div className="time-inputs compact">
                                  <input
                                    type="time"
                                    value={sub.startTime}
                                    onChange={(e) => {
                                      setRoutineRows(routineRows.map((r: typeof routineRows[0]) => {
                                        if (r.id === row.id) {
                                          // If optional, update all optional subjects on this date
                                          if (sub.subjectType === 'Optional') {
                                            return {
                                              ...r,
                                              subjects: r.subjects.map(s =>
                                                s.subjectType === 'Optional'
                                                  ? { ...s, startTime: e.target.value }
                                                  : s
                                              )
                                            };
                                          }
                                          return {
                                            ...r,
                                            subjects: r.subjects.map(s =>
                                              s.id === sub.id ? { ...s, startTime: e.target.value } : s
                                            )
                                          };
                                        }
                                        return r;
                                      }));
                                    }}
                                    className="time-input small"
                                    readOnly={sub.subjectType === 'Optional'}
                                  />
                                  <span>-</span>
                                  <input
                                    type="time"
                                    value={sub.endTime}
                                    onChange={(e) => {
                                      setRoutineRows(routineRows.map((r: typeof routineRows[0]) => {
                                        if (r.id === row.id) {
                                          if (sub.subjectType === 'Optional') {
                                            return {
                                              ...r,
                                              subjects: r.subjects.map(s =>
                                                s.subjectType === 'Optional'
                                                  ? { ...s, endTime: e.target.value }
                                                  : s
                                              )
                                            };
                                          }
                                          return {
                                            ...r,
                                            subjects: r.subjects.map(s =>
                                              s.id === sub.id ? { ...s, endTime: e.target.value } : s
                                            )
                                          };
                                        }
                                        return r;
                                      }));
                                    }}
                                    className="time-input small"
                                    readOnly={sub.subjectType === 'Optional'}
                                  />
                                  {sub.subjectType === 'Optional' && (
                                    <span className="shared-badge">Shared</span>
                                  )}
                                  {sub.subjectType === 'Minor' && (
                                    <span className="staggered-badge">Staggered</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td rowSpan={Math.max(1, row.subjects.length)}>
                        <button
                          className="btn-icon delete"
                          onClick={() => removeDateRow(row.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button className="btn-add-row" onClick={addDateRow}>
            <Plus size={18} /> Add Date Row
          </button>

          <div className="routine-actions">
            <button
              className="btn-create"
              style={{ background: '#6b7280' }}
              onClick={() => setRoutineRows([])}
            >
              Reset
            </button>
            <button
              className="btn-create"
              onClick={() => setShowPreview(!showPreview)}
              style={{ background: '#3b82f6' }}
            >
              <Eye size={18} style={{ marginRight: '8px' }} />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              className="btn-create"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} style={{ marginRight: '8px' }} />
                  Save Routine
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* Exam Routine Preview with Holiday Awareness */}
      {showPreview && activeRoadmap.class && selectedExam && (
        <section className="preview-section">
          <div className="preview-header">
            <h2 className="form-title" style={{ marginBottom: 0 }}>
              <FileSpreadsheet size={22} color="#6b7280" />
              Routine Preview with Holidays
            </h2>
          </div>
          <ExamRoutinePreview
            startDate={selectedExam.startDate || ''}
            endDate={selectedExam.endDate || ''}
            routineItems={routineRows.flatMap(r =>
              r.subjects.map(sub => ({
                subject: sub.subject,
                date: r.date,
                startTime: sub.startTime,
                endTime: sub.endTime
              }))
            )}
          />
        </section>
      )}

      {/* Routine Preview (Excel Style) */}
      {previewExams.length > 0 && (
        <section className="preview-section">
          <div className="preview-header">
            <h2 className="form-title" style={{ marginBottom: 0 }}>
              <FileSpreadsheet size={22} color="#6b7280" />
              Routine Preview & Roadmap
            </h2>
            <div className="print-actions">
              <button className="btn-print" title="Download PDF">
                <Download size={18} />
                PDF
              </button>
              <button className="btn-print primary" title="Print Routine" onClick={() => window.print()}>
                <Printer size={18} />
                Print
              </button>
            </div>
          </div>

          <div className="academic-table-wrapper">
             <table className="routine-excel-table">
              <thead>
                <tr>
                  <th className="class-col">Class</th>
                  {allDates.map((date, i) => {
                    const day = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                    return (
                      <th key={i}>
                        {day}
                        <span className="date-header">{formatBSDateWithMonth(toBS(date)) || date}</span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {previewExams.map((exam) => (
                  <tr key={exam._id}>
                    <td className="class-col">Class {exam.className}</td>
                    {allDates.map((date, i) => {
                      const subject = exam.routine?.find(r => r.date === date)?.subject;
                      return (
                        <td key={i} className="subject-cell">
                          {subject || '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Duplicate Date Alert */}
      {showAlert && (
        <div className="alert-overlay">
          <div className="alert-container">
            <div className="alert-icon">
              <AlertTriangle size={32} />
            </div>
            <h3 className="alert-title">Schedule Conflict</h3>
            <p className="alert-msg">
              Two subjects are scheduled for the same date. Would you like to merge these exams for the same day?
            </p>
            <div className="alert-actions">
              <button className="alert-btn" onClick={() => setShowAlert(false)}>Cancel</button>
              <button className="alert-btn primary" onClick={handleMergeAndSave}>Merge & Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
