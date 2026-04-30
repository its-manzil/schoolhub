'use client';

import React, { useState, useEffect } from 'react';
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
  academicYear: string;
  selectedClass: string;
  onClassChange: (className: string) => void;
  selectedSection: string;
  onSectionChange: (section: string) => void;
  selectedStudent: Student | null;
  onStudentChange: (student: Student | null) => void;
}

const STATIC_CLASSES = [
  'Nursery',
  'LKG',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12'
];

// Class mapping: display name -> database storage code
const CLASS_MAPPING: Record<string, string> = {
  'Nursery': '0N',
  'LKG': '0L',
  'UKG': '0U',
  'Class 1': '01',
  'Class 2': '02',
  'Class 3': '03',
  'Class 4': '04',
  'Class 5': '05',
  'Class 6': '06',
  'Class 7': '07',
  'Class 8': '08',
  'Class 9': '09',
  'Class 10': '10',
  'Class 11': '11',
  'Class 12': '12'
};

export default function StudentSelector({
  schoolId,
  academicYear,
  selectedClass,
  onClassChange,
  selectedSection,
  onSectionChange,
  selectedStudent,
  onStudentChange
}: StudentSelectorProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch students when class is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!schoolId || !selectedClass) {
        setStudents([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        const response = await fetch(
          `http://localhost:2056/api/students`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-school-id': schoolId.toString()
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }

        const data = await response.json();

        if (data.success && data.data) {
          // Filter by class using database code
          const classCode = CLASS_MAPPING[selectedClass] || selectedClass;
          const filtered = data.data.filter((s: Student) =>
            s.className === classCode ||
            s.className === selectedClass ||
            s.className?.toString() === classCode ||
            s.className?.toString() === selectedClass.replace('Class ', '')
          );
          setStudents(filtered);
        } else {
          setStudents([]);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [schoolId, selectedClass]);

  // Get unique sections from students
  const availableSections = Array.from(new Set(students.map(s => s.section).filter(Boolean))).sort();

  // Filter students by section and search
  const filteredStudents = students.filter(student => {
    const matchesSection = !selectedSection || student.section === selectedSection;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      student.name.toLowerCase().includes(searchLower) ||
      (student.studentId && student.studentId.toLowerCase().includes(searchLower)) ||
      (student.rollNumber && student.rollNumber.toLowerCase().includes(searchLower));
    return matchesSection && matchesSearch;
  });

  return (
    <div className="student-selector-container">
      <div className="student-filters-row">
        {/* Class Selection */}
        <div className="filter-group">
          <label className="selector-label" htmlFor="class-select">
            Class <span className="required">*</span>
          </label>
          <select
            id="class-select"
            className="selector-select"
            value={selectedClass}
            onChange={(e) => {
              onClassChange(e.target.value);
              onSectionChange('');
              onStudentChange(null);
            }}
          >
            <option value="">Select Class</option>
            {STATIC_CLASSES.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>

        {/* Section Selection */}
        <div className="filter-group">
          <label className="selector-label" htmlFor="section-select">
            Section
          </label>
          <select
            id="section-select"
            className="selector-select"
            value={selectedSection}
            onChange={(e) => {
              onSectionChange(e.target.value);
              onStudentChange(null);
            }}
            disabled={availableSections.length === 0}
          >
            <option value="">All Sections</option>
            {availableSections.map((section) => (
              <option key={section} value={section}>
                Section {section}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Selection */}
      {selectedClass && (
        <div className="student-selection-section">
          <label className="selector-label">
            Select Student <span className="required">*</span>
          </label>

          {loading ? (
            <div className="student-loading">
              <div className="spinner-small"></div>
              <span>Loading students...</span>
            </div>
          ) : error ? (
            <div className="student-error">{error}</div>
          ) : students.length === 0 ? (
            <div className="student-empty">No students found for {selectedClass}</div>
          ) : (
            <>
              <input
                type="text"
                className="student-search-input"
                placeholder="Search by name, ID, or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {filteredStudents.length === 0 ? (
                <div className="student-empty">No students match your search</div>
              ) : (
                <div className="student-list">
                  {filteredStudents.map((student) => (
                    <div
                      key={student._id}
                      className={`student-card ${selectedStudent?._id === student._id ? 'selected' : ''}`}
                      onClick={() => onStudentChange(student)}
                    >
                      <div className="student-radio">
                        <input
                          type="radio"
                          name="student"
                          checked={selectedStudent?._id === student._id}
                          onChange={() => onStudentChange(student)}
                        />
                      </div>
                      <div className="student-info">
                        <div className="student-name">{student.name}</div>
                        <div className="student-details">
                          {student.studentId && (
                            <span className="detail-badge">ID: {student.studentId}</span>
                          )}
                          {student.rollNumber && (
                            <span className="detail-badge">Roll: {student.rollNumber}</span>
                          )}
                          {student.section && (
                            <span className="detail-badge">Sec: {student.section}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
