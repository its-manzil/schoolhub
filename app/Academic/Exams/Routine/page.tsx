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
import { toBS, formatBSDateWithMonth } from '@/app/utils/dateConverter';
import BSDateInput from '../components/BSDateInput';
import SubjectSelector from '../components/SubjectSelector';
import ExamRoutinePreview from '../components/ExamRoutinePreview';

export default function RoutinePage() {
  const { showToast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [rows, setRows] = useState<{ id: number; subject: string; date: string; startTime?: string; endTime?: string }[]>([
    { id: 1, subject: '', date: '' }
  ]);
  const [showAlert, setShowAlert] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState({ year: '', exam: '', class: '' });
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [dateErrors, setDateErrors] = useState<Record<number, boolean>>({});

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
      
      // Load existing routine if available
      if (exam?.routine && exam.routine.length > 0) {
        const routineRows = exam.routine.map((r, idx) => ({
          id: idx + 1,
          subject: r.subject,
          date: r.date,
          startTime: r.startTime || '',
          endTime: r.endTime || '',
        }));
        setRows(routineRows);
      } else {
        setRows([{ id: 1, subject: '', date: '' }]);
      }
    }
  }, [activeRoadmap, exams]);

  const addRow = () => {
    setRows([...rows, { id: Date.now(), subject: '', date: '' }]);
  };

  const removeRow = (id: number) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const handleSave = async () => {
    if (!selectedExam?._id) {
      showToast('Please select an exam first', 'error');
      return;
    }

    // Check for date validation errors
    const hasDateErrors = Object.values(dateErrors).some(error => error);
    if (hasDateErrors) {
      showToast('Please fix invalid dates before saving', 'error');
      return;
    }

    // Check for duplicate dates
    const dates = rows.map(r => r.date).filter(d => d !== '');
    const hasDuplicate = new Set(dates).size !== dates.length;

    if (hasDuplicate) {
      showToast('Warning: You have multiple exams scheduled for the same date.', 'error');
    }

    // Basic validation
    const invalidRows = rows.filter(r => !r.subject || !r.date);
    if (invalidRows.length > 0) {
      showToast('Please fill all subject and date fields', 'error');
      return;
    }

    try {
      setIsSaving(true);
      const routineData: ExamRoutineItem[] = rows.map(r => ({
        subject: r.subject,
        date: r.date,
        startTime: r.startTime,
        endTime: r.endTime
      }));

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

          <div className="routine-rows-container">
            <div className="routine-row routine-row-header">
              <span>Subject</span>
              <span>Exam Date (BS)</span>
              <span>Start Time</span>
              <span>End Time</span>
              <span></span>
            </div>

            {rows.map((row) => (
              <div key={row.id} className="routine-row">
                <SubjectSelector
                  selectedSubject={row.subject}
                  onSubjectSelect={(subject) => {
                    const newRows = rows.map(r => r.id === row.id ? {...r, subject} : r);
                    setRows(newRows);
                  }}
                  disabled={false}
                  className="routine-subject-selector"
                />
                <BSDateInput
                  value={row.date}
                  onChange={(value, isValid) => {
                    const newRows = rows.map(r => r.id === row.id ? {...r, date: value} : r);
                    setRows(newRows);
                    setDateErrors(prev => ({ ...prev, [row.id]: !isValid }));
                  }}
                  placeholder="YYYY-MM-DD"
                  showPicker={true}
                />
                <input
                  type="time"
                  value={row.startTime || ''}
                  onChange={(e) => {
                    const newRows = rows.map(r => r.id === row.id ? {...r, startTime: e.target.value} : r);
                    setRows(newRows);
                  }}
                  className="time-input"
                />
                <input
                  type="time"
                  value={row.endTime || ''}
                  onChange={(e) => {
                    const newRows = rows.map(r => r.id === row.id ? {...r, endTime: e.target.value} : r);
                    setRows(newRows);
                  }}
                  className="time-input"
                />
                <button className="btn-icon delete" onClick={() => removeRow(row.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button className="btn-add-row" onClick={addRow}>
            <Plus size={18} /> Add Subject Row
          </button>

          <div className="routine-actions">
            <button
              className="btn-create"
              style={{ background: '#6b7280' }}
              onClick={() => setRows([{ id: 1, subject: '', date: '' }])}
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
            routineItems={rows
              .filter(r => r.subject && r.date)
              .map(r => ({
                subject: r.subject,
                date: r.date,
                startTime: r.startTime,
                endTime: r.endTime
              }))}
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
