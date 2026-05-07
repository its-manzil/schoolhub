'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Save, 
  ClipboardCheck,
  User,
  Edit3,
  Loader2
} from 'lucide-react';
import './marks.css';
import { 
  getExams, 
  getAcademicYears,
  addMarkEntry,
  Exam
} from '../lib/examService';
import { toBS, formatBSDateWithMonth } from '@/app/utils/dateConverter';
import { useToast } from '@/app/context/ToastContext';
import { 
  getStudentsByClass,
  Student
} from '../lib/studentService';

interface StudentWithStatus extends Student {
  status: 'completed' | 'pending';
}

interface SubjectMarks {
  subject: string;
  theoryMarks: number;
  practicalMarks: number;
  maxTheory: number;
  maxPractical: number;
}

export default function MarksEntryPage() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithStatus | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<StudentWithStatus[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [subjectMarks, setSubjectMarks] = useState<Record<string, SubjectMarks>>({});
  const { showToast } = useToast();
  
  const [filters, setFilters] = useState({
    year: '',
    exam: '',
    class: ''
  });

  // Load exams and years on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [examsData, yearsData] = await Promise.all([
        getExams(),
        getAcademicYears()
      ]);
      setExams(examsData);
      setYears(yearsData);
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  // Load students when filters change
  useEffect(() => {
    if (filters.year && filters.exam && filters.class) {
      loadStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      // Find selected exam
      const exam = exams.find(e => 
        e.academicYear === filters.year &&
        e.term === filters.exam &&
        e.className === filters.class
      );
      setSelectedExam(exam || null);

      // Get students for the class
      const studentsData = await getStudentsByClass(filters.class);
      
      // Check which students have marks entered
      const studentsWithStatus: StudentWithStatus[] = studentsData.map(student => {
        const hasMarks = exam?.marks?.some(m => m.studentId === (student._id || student.studentId));
        return {
          ...student,
          status: hasMarks ? 'completed' : 'pending'
        };
      });
      
      setStudents(studentsWithStatus);
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPanel = (student: StudentWithStatus) => {
    setSelectedStudent(student);
    
    // Initialize subject marks from exam data
    const marks: Record<string, SubjectMarks> = {};
    if (selectedExam?.subjectMappings) {
      selectedExam.subjectMappings.forEach(mapping => {
        const existingMark = selectedExam.marks?.find(
          m => m.studentId === (student._id || student.studentId) && m.subject === mapping.subject
        );
        marks[mapping.subject] = {
          subject: mapping.subject,
          theoryMarks: existingMark?.theoryMarks || 0,
          practicalMarks: existingMark?.practicalMarks || 0,
          maxTheory: mapping.theoryFM,
          maxPractical: mapping.practicalFM,
        };
      });
    }
    setSubjectMarks(marks);
    setIsPanelOpen(true);
  };

  const handleSaveMarks = async () => {
    if (!selectedExam?._id || !selectedStudent) return;

    setIsSaving(true);
    try {
      // Save marks for each subject
      for (const [subject, marks] of Object.entries(subjectMarks)) {
        const subjectMap = selectedExam.subjectMappings?.find(m => m.subject === subject);
        const totalMarks = marks.theoryMarks + marks.practicalMarks;
        const maxTotal = (subjectMap?.fullMarks || 100);

        await addMarkEntry(selectedExam._id, {
          studentId: selectedStudent._id || selectedStudent.studentId,
          studentName: selectedStudent.name,
          subject: subject,
          marksObtained: totalMarks,
          maxMarks: maxTotal,
          theoryMarks: marks.theoryMarks,
          practicalMarks: marks.practicalMarks,
          creditHours: subjectMap?.creditHour || 4,
          verified: true,
          locked: false,
        });
      }

      setIsPanelOpen(false);
      await loadStudents();
      showToast('Marks saved successfully!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save marks', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubjectMarkChange = (subject: string, field: 'theoryMarks' | 'practicalMarks', value: number) => {
    setSubjectMarks(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [field]: value
      }
    }));
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.rollNumber?.toString() || '').includes(searchTerm)
  );

  const completedCount = students.filter(s => s.status === 'completed').length;

  // Get unique exam types for the selected year
  const examTypes = [...new Set(
    exams
      .filter(e => e.academicYear === filters.year)
      .map(e => e.term)
  )];

  // Get unique classes for the selected year and exam
  const availableClasses = [...new Set(
    exams
      .filter(e => e.academicYear === filters.year && e.term === filters.exam)
      .map(e => e.className)
  )];

  return (
    <div className="marks-container">
      {/* Dropdown Roadmap */}
      <section className="dropdown-roadmap">
        <div className="dropdown-group">
          <label>Academic Year</label>
          <select 
            value={filters.year}
            onChange={(e) => setFilters({ year: e.target.value, exam: '', class: '' })}
          >
            <option value="">Select Year</option>
            {years.map(year => (
              <option key={year} value={year}>{year} BS</option>
            ))}
          </select>
        </div>
        <div className="dropdown-group">
          <label>Exam Type</label>
          <select 
            value={filters.exam}
            onChange={(e) => setFilters({ ...filters, exam: e.target.value, class: '' })}
            disabled={!filters.year}
          >
            <option value="">Select Exam</option>
            {examTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="dropdown-group">
          <label>Class</label>
          <select 
            value={filters.class}
            onChange={(e) => setFilters({ ...filters, class: e.target.value })}
            disabled={!filters.exam}
          >
            <option value="">Select Class</option>
            {availableClasses.map(cls => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Student Table Section */}
      <section className="student-list-section">
        <div className="list-header">
          <div className="search-bar-container">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search by student name or roll..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
            <div className="bulk-actions">
              <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ClipboardCheck size={16} />
                Status Summary: {completedCount}/{students.length} Entered
              </span>
            </div>
            {selectedExam?.startDate && (
              <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                Exam Period: {formatBSDateWithMonth(toBS(selectedExam.startDate))} - {selectedExam.endDate ? formatBSDateWithMonth(toBS(selectedExam.endDate)) : 'TBD'}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', color: '#6b7280' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
            Loading students...
          </div>
        ) : (
          <div className="academic-table-wrapper">
            <table className="academic-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Roll No</th>
                  <th>Student Name</th>
                  <th style={{ textAlign: 'center' }}>Entry Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      {filters.class ? 'No students found' : 'Select year, exam, and class to view students'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student._id || student.studentId}>
                      <td>{student.rollNumber || '-'}</td>
                      <td style={{ fontWeight: 600 }}>{student.name}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`marks-status-badge ${student.status}`}>
                          {student.status === 'completed' ? '✓ Entered' : '○ Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="action-icons">
                          <button className="icon-btn view" title="Enter Marks" onClick={() => handleOpenPanel(student)}>
                            <Edit3 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Marks Entry Panel */}
      {isPanelOpen && selectedStudent && selectedExam && (
        <>
          <div className="panel-overlay" onClick={() => setIsPanelOpen(false)} />
          <div className="marks-entry-panel">
            <div className="panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '50%' }}>
                  <User size={24} color="#2563eb" />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{selectedStudent.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
                    Roll No: {selectedStudent.rollNumber || '-'} • Class {filters.class}
                  </p>
                </div>
              </div>
              <X className="close-modal" onClick={() => setIsPanelOpen(false)} style={{ position: 'static' }} />
            </div>

            <div className="subjects-entry-list">
              {Object.entries(subjectMarks).map(([subjectName, marks]) => (
                <div key={subjectName} className="subject-mark-group">
                  <label>{subjectName}</label>
                  <div className="mark-inputs-row">
                    <div className="mark-input-field">
                      <span>Theory (/{marks.maxTheory})</span>
                      <input 
                        type="number" 
                        min={0}
                        max={marks.maxTheory}
                        value={marks.theoryMarks}
                        onChange={(e) => handleSubjectMarkChange(subjectName, 'theoryMarks', parseInt(e.target.value) || 0)}
                        placeholder="Enter theory marks" 
                      />
                    </div>
                    <div className="mark-input-field">
                      <span>Practical (/{marks.maxPractical})</span>
                      <input 
                        type="number" 
                        min={0}
                        max={marks.maxPractical}
                        value={marks.practicalMarks}
                        onChange={(e) => handleSubjectMarkChange(subjectName, 'practicalMarks', parseInt(e.target.value) || 0)}
                        placeholder="Enter practical marks" 
                      />
                    </div>
                  </div>
                </div>
              ))}
              {Object.keys(subjectMarks).length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  No subjects configured. Please configure subjects in Subject Map first.
                </div>
              )}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button 
                className="btn-bulk primary" 
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleSaveMarks}
                disabled={isSaving || Object.keys(subjectMarks).length === 0}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} />
                    Saving...
                  </>
                ) : (
                  <><Save size={18} /> Save & Update Marks</>
                )}
              </button>
              <button 
                className="btn-bulk" 
                style={{ flex: 1, justifyContent: 'center' }} 
                onClick={() => setIsPanelOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
