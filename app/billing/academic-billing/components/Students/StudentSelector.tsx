'use client';

import React, { useState, useEffect } from 'react';
import './StudentSelector.css';
import { useToast } from '../../../../context/ToastContext';
import { Search, Users, CheckSquare, Square, User } from 'lucide-react';

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

/**
 * Convert display class name to database format
 * Examples: "9" -> "09", "Nursery" -> "0N", "LKG" -> "0L", "UKG" -> "0U"
 */
const normalizeClassName = (className: string): string => {
  const upper = className.toUpperCase().trim();

  // Handle special cases
  if (upper === 'NURSERY' || upper === 'N') return '0N';
  if (upper === 'LKG' || upper === 'L') return '0L';
  if (upper === 'UKG' || upper === 'U') return '0U';

  // Extract number from class name (handles "Class 5", "5", "05" etc.)
  const match = className.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    // Pad with leading zero for single digit numbers (1-9)
    if (num >= 1 && num <= 9) {
      return num.toString().padStart(2, '0');
    }
    // For 10, 11, 12 return as-is
    if (num >= 10 && num <= 12) {
      return num.toString();
    }
  }

  // Return original if no match found
  return className;
};

export default function StudentSelector({
  selectedStudents,
  onChange,
  schoolId,
  className
}: StudentSelectorProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchStudents = async () => {
      if (!schoolId || !className) {
        setStudents([]);
        return;
      }

      try {
        setLoading(true);
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
          if (response.status === 403) {
            showToast('Access denied. Billing role needs permission to view students.', 'error');
            return;
          }
          if (response.status === 401) {
            showToast('Session expired. Please login again.', 'error');
            return;
          }
          const errorData = await response.json().catch(() => ({}));
          showToast(errorData.message || `Failed to fetch students (${response.status})`, 'error');
          return;
        }

        const data = await response.json();

        if (data.success && data.data) {
          const normalizedClass = normalizeClassName(className);
          const filtered = data.data.filter((s: Student) =>
            s.className === normalizedClass
          );
          setStudents(filtered);
        } else {
          setStudents([]);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        showToast('Failed to load students', 'error');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [schoolId, className, showToast]);

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
           (student.rollNumber && student.rollNumber.toString().toLowerCase().includes(search)) ||
           (student.studentId && student.studentId.toString().toLowerCase().includes(search));
    const matchesSection = selectedSection === 'all' || student.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  return (
    <div className="student-selector">
      <div className="student-selector-header">
        <div className="header-left">
          <Users size={20} className="header-icon" />
          <h3 className="student-selector-title">
            Select Students 
            <span className="student-count">{selectedStudents.length} selected</span>
          </h3>
        </div>
        <div className="student-filters">
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="student-search-input"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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

      {students.length === 0 ? (
        <div className="student-selector-empty">
          <div className="empty-state-icon">
            <User size={40} />
          </div>
          <p>No students found for {className}</p>
        </div>
      ) : (
        <>
          <div className="student-selector-toolbar">
            <label className="select-all-label">
              <input
                type="checkbox"
                checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                onChange={handleSelectAll}
                className="hidden-checkbox"
              />
              <div className="custom-checkbox">
                {selectedStudents.length === filteredStudents.length && filteredStudents.length > 0 ? (
                  <CheckSquare size={18} className="checked" />
                ) : (
                  <Square size={18} />
                )}
              </div>
              <span>Select All ({filteredStudents.length})</span>
            </label>
          </div>

          <div className="student-grid">
            {filteredStudents.map((student) => {
              const isSelected = selectedStudents.includes(student._id);
              return (
                <div
                  key={student._id}
                  className={`student-item-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleToggleStudent(student._id)}
                >
                  <div className="student-item-checkbox">
                    {isSelected ? <CheckSquare size={18} className="checked" /> : <Square size={18} />}
                  </div>
                  <div className="student-item-info">
                    <div className="student-item-name">{student.name}</div>
                    <div className="student-item-meta">
                      {student.rollNumber && <span className="meta-badge">Roll: {student.rollNumber}</span>}
                      {student.section && <span className="meta-badge section">Sec: {student.section}</span>}
                      {student.studentId && <span className="meta-badge id">ID: {student.studentId}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
