'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Printer, 
  Download, 
  Eye, 
  X,
  CreditCard,
  FileText,
  Loader2
} from 'lucide-react';
import './admit-card.css';
import { 
  getStudentsForAdmitCard,
  Student 
} from '../lib/studentService';
import { 
  getExams, 
  getAcademicYears,
  Exam 
} from '../lib/examService';
import { toBS, formatBSDateWithMonth } from '@/app/utils/dateConverter';

interface StudentWithSymbol extends Student {
  symbolNumber: string;
}

export default function AdmitCardPage() {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithSymbol | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<StudentWithSymbol[]>([]);
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

  // Load students when class is selected
  useEffect(() => {
    if (filters.year && filters.exam && filters.class) {
      loadStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const studentsData = await getStudentsForAdmitCard(filters.year, filters.class, filters.exam);
      setStudents(studentsData);
      
      // Find selected exam
      const exam = exams.find(e => 
        e.academicYear === filters.year &&
        e.term === filters.exam &&
        e.className === filters.class
      );
      setSelectedExam(exam || null);
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (student: StudentWithSymbol) => {
    setSelectedStudent(student);
    setShowPreview(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.rollNumber?.toString() || '').includes(searchTerm) ||
    s.symbolNumber.includes(searchTerm)
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

  return (
    <div className="admit-card-container">
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

      {/* Student List Section */}
      <section className="student-list-section">
        <div className="list-header">
          <div className="search-bar-container">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, roll no, or symbol..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bulk-actions">
            <button className="btn-bulk" onClick={handlePrint}>
              <CreditCard size={18} />
              Bulk ID Card
            </button>
            <button className="btn-bulk primary" onClick={handlePrint}>
              <Printer size={18} />
              Bulk Print Admit Cards
            </button>
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
                  <th>Symbol Number</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      {filters.class ? 'No students found for selected criteria' : 'Select year, exam, and class to view students'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student._id || student.studentId}>
                      <td>{student.rollNumber || '-'}</td>
                      <td style={{ fontWeight: 600 }}>{student.name}</td>
                      <td><code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{student.symbolNumber}</code></td>
                      <td>
                        <div className="action-icons">
                          <button className="icon-btn view" title="View Preview" onClick={() => handleView(student)}>
                            <Eye size={16} />
                          </button>
                          <button className="icon-btn print" title="Print Admit Card" onClick={handlePrint}>
                            <Printer size={16} />
                          </button>
                          <button className="icon-btn download" title="Download PDF">
                            <Download size={16} />
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

      {/* Preview Modal */}
      {showPreview && selectedStudent && selectedExam && (
        <div className="preview-modal-overlay">
          <div className="preview-modal">
            <X className="close-modal" onClick={() => setShowPreview(false)} />
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="#10b981" />
              Admit Card Preview
            </h3>
            
            <div className="admit-card-demo">
              <div className="school-header">
                <h4 style={{ margin: 0 }}>SIDDHA ADARBHUT BIDHYALA</h4>
                <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                  Kathmandu, Nepal | {selectedExam.name}
                </p>
                <div style={{ marginTop: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>ADMIT CARD</div>
              </div>

              <div className="student-info-grid">
                <div className="info-item"><label>Name:</label><span>{selectedStudent.name}</span></div>
                <div className="info-item"><label>Roll No:</label><span>{selectedStudent.rollNumber || '-'}</span></div>
                <div className="info-item"><label>Class:</label><span>{filters.class}</span></div>
                <div className="info-item"><label>Symbol No:</label><span>{selectedStudent.symbolNumber}</span></div>
              </div>

              {/* Exam Schedule */}
              {selectedExam.routine && selectedExam.routine.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h5 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>Exam Schedule:</h5>
                  <table style={{ width: '100%', fontSize: '0.7rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th style={{ padding: '4px', textAlign: 'left' }}>Subject</th>
                        <th style={{ padding: '4px', textAlign: 'left' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedExam.routine.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '4px' }}>{item.subject}</td>
                          <td style={{ padding: '4px' }}>{item.date ? formatBSDateWithMonth(toBS(item.date)) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ marginTop: '1.5rem', borderTop: '1px dashed #e5e7eb', paddingTop: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
                <p>Note: Please bring this admit card to the examination hall. Use of electronic devices is strictly prohibited.</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                  <span>____________________<br/>Student Signature</span>
                  <span>____________________<br/>Principal Signature</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn-bulk primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handlePrint}>
                <Printer size={18} /> Print Now
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
