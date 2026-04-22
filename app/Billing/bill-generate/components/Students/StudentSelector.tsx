'use client';

import React, { useState, useEffect } from 'react';
import './StudentSelector.css';

interface Student {
  _id: string;
  studentId: string;
  name: string;
  className: string;
  rollNumber?: string;
  section?: string;
  guardianName?: string;
  address?: string;
}

interface StudentSelectorProps {
  selectedStudents: string[];
  onChange: (studentIds: string[]) => void;
  schoolId: number;
  className: string;
}

export default function StudentSelector({
  selectedStudents,
  onChange,
  schoolId,
  className
}: StudentSelectorProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');

  useEffect(() => {
    const fetchStudents = async () => {
      if (!schoolId || !className) {
        setStudents([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        // The API returns all students for the school, we'll filter by class client-side
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
          if (response.status === 403) {
            throw new Error('Access denied. Billing role needs permission to view students.');
          }
          if (response.status === 401) {
            throw new Error('Session expired. Please login again.');
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch students (${response.status})`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          // Extract class number from "Class X" format and filter
          const classNumber = className.replace('Class ', '');
          const filtered = data.data.filter((s: Student) => 
            s.className === classNumber || 
            s.className === className ||
            s.className?.toString() === classNumber
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
  }, [schoolId, className]);

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      onChange([]);
    } else {
      onChange(filteredStudents.map(s => s._id));
    }
  };

  const handleToggleStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      onChange(selectedStudents.filter(id => id !== studentId));
    } else {
      onChange([...selectedStudents, studentId]);
    }
  };

  // Get unique sections from students
  const availableSections = Array.from(new Set(students.map(s => s.section).filter(Boolean))).sort();

  const filteredStudents = students.filter(student => {
    const studentName = (student.name || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = studentName.includes(search) || 
           (student.rollNumber && student.rollNumber.toLowerCase().includes(search)) ||
           (student.studentId && student.studentId.toLowerCase().includes(search));
    const matchesSection = selectedSection === 'all' || student.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  if (!className) {
    return (
      <div className="student-selector">
        <div className="student-selector-empty">
          Please select a class first to view students
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="student-selector">
        <div className="student-selector-loading">
          <div className="spinner"></div>
          <span>Loading students...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="student-selector">
      <div className="student-selector-header">
        <h3 className="student-selector-title">
          Select Students 
          <span className="student-count">({selectedStudents.length} selected)</span>
        </h3>
        <div className="student-filters">
          <input
            type="text"
            className="student-search-input"
            placeholder="Search by name, roll no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {availableSections.length > 0 && (
            <select
              className="section-filter"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="all">All Sections</option>
              {availableSections.map(section => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {error && (
        <div className="student-selector-error">{error}</div>
      )}

      {students.length === 0 ? (
        <div className="student-selector-empty">
          No students found for {className}
        </div>
      ) : (
        <>
          <div className="student-selector-toolbar">
            <label className="select-all-label">
              <input
                type="checkbox"
                checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                onChange={handleSelectAll}
              />
              <span>Select All ({filteredStudents.length})</span>
            </label>
          </div>

          <div className="student-list">
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                className={`student-card ${selectedStudents.includes(student._id) ? 'selected' : ''}`}
                onClick={() => handleToggleStudent(student._id)}
              >
                <div className="student-card-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student._id)}
                    onChange={() => {}}
                  />
                </div>
                <div className="student-card-info">
                  <div className="student-name">
                    {student.name || 'Unknown Name'}
                  </div>
                  <div className="student-details">
                    {student.rollNumber && <span className="detail-badge">Roll: {student.rollNumber}</span>}
                    {student.section && <span className="detail-badge section">Sec: {student.section}</span>}
                    {student.studentId && <span className="detail-badge id">ID: {student.studentId}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
