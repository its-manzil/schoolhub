'use client';

import React, { useState, useEffect } from 'react';
import { Search, UserCheck, ChevronDown } from 'lucide-react';
import './StudentSelector.css';

interface Student {
  _id: string;
  studentId: string;
  name: string;
  className: string;
  section?: string;
  rollNumber?: string;
}

interface StudentSelectorProps {
  schoolId: number;
  selectedClass: string;
  onClassChange: (className: string) => void;
  selectedSection: string;
  onSectionChange: (section: string) => void;
  selectedStudent: Student | null;
  onStudentChange: (student: Student | null) => void;
}

const STATIC_CLASSES = ['Nursery', 'LKG', 'UKG', ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)];
const SECTIONS = ['A', 'B', 'C', 'D'];

export default function StudentSelector({
  schoolId,
  selectedClass,
  onClassChange,
  selectedSection,
  onSectionChange,
  selectedStudent,
  onStudentChange
}: StudentSelectorProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) {
        setStudents([]);
        return;
      }
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:2056/api/students?schoolId=${schoolId}&className=${selectedClass}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'x-school-id': schoolId.toString() }
        });
        const result = await response.json();
        if (result.success) setStudents(result.data);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedClass, schoolId]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="billing-card student-selector-v2">
      <div className="card-header-alt">
        <div className="header-info">
          <UserCheck size={18} className="text-primary" />
          <h3 className="card-title-sm">Student Selection</h3>
        </div>
      </div>

      <div className="selector-filters-row">
        <div className="input-group">
          <label>Class</label>
          <select value={selectedClass} onChange={(e) => onClassChange(e.target.value)}>
            <option value="">Select Class</option>
            {STATIC_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label>Section</label>
          <select value={selectedSection} onChange={(e) => onSectionChange(e.target.value)}>
            <option value="">All</option>
            {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="search-box-compact">
        <Search size={14} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search student..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={!selectedClass}
        />
      </div>

      <div className="student-results-container">
        {loading ? (
          <div className="results-status">Loading students...</div>
        ) : filteredStudents.length > 0 ? (
          <div className="student-grid-minimal">
            {filteredStudents.map(student => (
              <div 
                key={student.studentId} 
                className={`student-chip-item ${selectedStudent?.studentId === student.studentId ? 'selected' : ''}`}
                onClick={() => onStudentChange(student)}
              >
                <span className="chip-name">{student.name}</span>
                <span className="chip-id">{student.studentId}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="results-status">
            {selectedClass ? 'No students found.' : 'Select a class to see students.'}
          </div>
        )}
      </div>
    </div>
  );
}
