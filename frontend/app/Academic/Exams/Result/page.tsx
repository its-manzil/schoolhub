'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Eye, 
  Printer, 
  Save, 
  X,
  Download,
  Loader2
} from 'lucide-react';
import './result.css';
import { 
  getExams, 
  getAcademicYears,
  getExamResults,
  calculatePercentage,
  getGradeFromPercentage,
  Exam 
} from '../lib/examService';
import { toBS, formatBSDateWithMonth, getCurrentBSDate } from '@/app/utils/dateConverter';

interface ComputedResult {
  studentId: string;
  studentName: string;
  rollNumber?: number;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  gpa: number;
  grade: string;
  rank: number;
}

export default function ResultPage() {
  const [showResult, setShowResult] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<ComputedResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ComputedResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  
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

  // Load results when filters change
  useEffect(() => {
    if (filters.year && filters.exam && filters.class) {
      loadResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadResults = async () => {
    setLoading(true);
    try {
      // Find selected exam
      const exam = exams.find(e => 
        e.academicYear === filters.year &&
        e.term === filters.exam &&
        e.className === filters.class
      );
      setSelectedExam(exam || null);

      if (exam?._id) {
        const resultsData = await getExamResults(exam._id);
        setResults(resultsData);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Error loading results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (student: ComputedResult) => {
    setSelectedStudent(student);
    setShowResult(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredResults = results.filter(r => 
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.rollNumber?.toString() || '').includes(searchTerm)
  );

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

  // Get student's subject-wise marks for the preview
  const getStudentSubjectMarks = (studentId: string) => {
    if (!selectedExam?.marks) return [];
    
    const studentMarks = selectedExam.marks.filter(m => m.studentId === studentId);
    
    return studentMarks.map(mark => {
      const theory = mark.theoryMarks || 0;
      const practical = mark.practicalMarks || 0;
      const total = theory + practical;
      const percentage = calculatePercentage(total, mark.maxMarks);
      const grade = getGradeFromPercentage(percentage);
      
      return {
        subject: mark.subject,
        fullMarks: mark.maxMarks,
        theory,
        practical,
        total,
        grade,
      };
    });
  };

  return (
    <div className="result-container">
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

      {/* Result List Section */}
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
          <div className="bulk-actions">
            <button className="btn-bulk" onClick={handlePrint}>
              <Save size={18} /> Bulk Save Results
            </button>
            <button className="btn-bulk primary" onClick={handlePrint}>
              <Printer size={18} /> Bulk Print Marksheets
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', color: '#6b7280' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
            Loading results...
          </div>
        ) : (
          <div className="academic-table-wrapper">
            <table className="academic-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Roll No</th>
                  <th>Student Name</th>
                  <th style={{ textAlign: 'center' }}>CGPA</th>
                  <th style={{ textAlign: 'center' }}>Rank</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      {filters.class ? 'No results available. Ensure marks are entered first.' : 'Select year, exam, and class to view results'}
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((res) => (
                    <tr key={res.studentId}>
                      <td>{res.rollNumber || '-'}</td>
                      <td style={{ fontWeight: 600 }}>{res.studentName}</td>
                      <td style={{ textAlign: 'center' }}><span className="cgpa-badge">{res.gpa.toFixed(2)}</span></td>
                      <td style={{ textAlign: 'center' }}><span className="rank-badge-result">#{res.rank}</span></td>
                      <td>
                        <div className="action-icons">
                          <button className="icon-btn view" title="Preview Result" onClick={() => handlePreview(res)}>
                            <Eye size={16} />
                          </button>
                          <button className="icon-btn print" title="Print Marksheet" onClick={handlePrint}>
                            <Printer size={16} />
                          </button>
                          <button className="icon-btn download" title="Save Result">
                            <Save size={16} />
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

      {/* Result Preview Modal */}
      {showResult && selectedStudent && selectedExam && (
        <div className="preview-modal-overlay">
          <div className="result-preview-modal">
            <X className="close-modal" onClick={() => setShowResult(false)} />
            <div className="marksheet-header">
              <h2 style={{ margin: 0 }}>SIDDHA ADARBHUT BIDHYALA</h2>
              <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>Kathmandu, Nepal | Estd: 2050</p>
              <h3 style={{ margin: '1rem 0 0', textDecoration: 'underline' }}>PROGRESS REPORT</h3>
              <p style={{ fontWeight: 700 }}>{selectedExam.name}</p>
            </div>

            <div className="student-info-grid" style={{ marginBottom: '2rem' }}>
              <div className="info-item"><label>Name:</label><span>{selectedStudent.studentName}</span></div>
              <div className="info-item"><label>Roll No:</label><span>{selectedStudent.rollNumber || '-'}</span></div>
              <div className="info-item"><label>Class:</label><span>{filters.class}</span></div>
              <div className="info-item"><label>Section:</label><span>A</span></div>
            </div>

            <table className="marksheet-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Subjects</th>
                  <th>Full Marks</th>
                  <th>Obtained (TH)</th>
                  <th>Obtained (PR)</th>
                  <th>Total</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {getStudentSubjectMarks(selectedStudent.studentId).map((mark, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'left' }}>{mark.subject}</td>
                    <td>{mark.fullMarks}</td>
                    <td>{mark.theory || '-'}</td>
                    <td>{mark.practical || '-'}</td>
                    <td>{mark.total}</td>
                    <td>{mark.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="result-summary-footer">
              <div className="summary-item"><label>Total CGPA</label><span>{selectedStudent.gpa.toFixed(2)}</span></div>
              <div className="summary-item"><label>Grade</label><span>{selectedStudent.grade}</span></div>
              <div className="summary-item"><label>Class Rank</label><span>{selectedStudent.rank}</span></div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <div><strong>Result Date:</strong> {formatBSDateWithMonth(getCurrentBSDate())}</div>
              <div><strong>Issued Date:</strong> {formatBSDateWithMonth(getCurrentBSDate())}</div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
              <button className="btn-bulk primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handlePrint}>
                <Printer size={18} /> Print Marksheet
              </button>
              <button className="btn-bulk" style={{ flex: 1, justifyContent: 'center' }}>
                <Download size={18} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
