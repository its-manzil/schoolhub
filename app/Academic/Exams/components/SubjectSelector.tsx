'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SubjectRecord, Subject } from '@/app/modules/academic/subjects/types';
import './SubjectSelector.css';

interface SubjectSelectorProps {
  onSubjectSelect: (subject: string, subjectData: Subject | null) => void;
  selectedSubject: string;
  disabled?: boolean;
  className?: string;
}

// Default classes list (same as in other parts of the app)
const DEFAULT_CLASSES = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export default function SubjectSelector({
  onSubjectSelect,
  selectedSubject,
  disabled = false,
  className = ''
}: SubjectSelectorProps) {
  const [subjectsData, setSubjectsData] = useState<SubjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection states
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

      const response = await fetch(`${BASE_URL}/Academic/Subjects/api/subjects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }

      const result = await response.json();
      if (result.success) {
        setSubjectsData(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch subjects');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique academic years from subjects (TASK 1)
  const academicYears = useMemo(() => {
    const years = [...new Set(subjectsData.map(s => s.academicYear))];
    return years.sort((a, b) => b.localeCompare(a)); // Descending order
  }, [subjectsData]);

  // Extract unique classes from subjects
  const availableClasses = useMemo(() => {
    const classes = [...new Set(subjectsData.map(s => s.className))];
    // Sort according to DEFAULT_CLASSES order
    return classes.sort((a, b) => {
      const indexA = DEFAULT_CLASSES.indexOf(a);
      const indexB = DEFAULT_CLASSES.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [subjectsData]);

  // Filter subjects by year and class (TASK 2)
  const filteredSubjects = useMemo(() => {
    if (!selectedYear || !selectedClass) return null;

    const record = subjectsData.find(
      s => s.academicYear === selectedYear && s.className === selectedClass
    );

    return record?.subjects || [];
  }, [subjectsData, selectedYear, selectedClass]);

  // Handle year selection
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedClass('');
    onSubjectSelect('', null);
  };

  // Handle class selection
  const handleClassChange = (cls: string) => {
    setSelectedClass(cls);
    onSubjectSelect('', null);
  };

  // Handle subject selection
  const handleSubjectChange = (subjectName: string) => {
    const subjectData = filteredSubjects?.find(s => s.name === subjectName) || null;
    onSubjectSelect(subjectName, subjectData);
  };

  if (loading) {
    return (
      <div className={`subject-selector-wrapper ${className}`}>
        <div className="subject-selector-loading">Loading subjects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`subject-selector-wrapper ${className}`}>
        <div className="subject-selector-error">
          {error}
          <button onClick={fetchSubjects} className="subject-selector-retry">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`subject-selector-wrapper ${className}`}>
      {/* Academic Year Dropdown (TASK 1) */}
      <div className="subject-selector-field">
        <label className="subject-selector-label">Academic Year *</label>
        <select
          value={selectedYear}
          onChange={(e) => handleYearChange(e.target.value)}
          disabled={disabled || academicYears.length === 0}
          className="subject-selector-select"
        >
          <option value="">
            {academicYears.length === 0 ? 'No years available' : 'Select Year'}
          </option>
          {academicYears.map(year => (
            <option key={year} value={year}>{year} BS</option>
          ))}
        </select>
      </div>

      {/* Class Dropdown */}
      <div className="subject-selector-field">
        <label className="subject-selector-label">Class *</label>
        <select
          value={selectedClass}
          onChange={(e) => handleClassChange(e.target.value)}
          disabled={disabled || !selectedYear || availableClasses.length === 0}
          className="subject-selector-select"
        >
          <option value="">
            {!selectedYear ? 'Select year first' : 'Select Class'}
          </option>
          {availableClasses.map(cls => (
            <option key={cls} value={cls}>Class {cls}</option>
          ))}
        </select>
      </div>

      {/* Subject Dropdown (TASK 3 - replaces manual entry) */}
      <div className="subject-selector-field">
        <label className="subject-selector-label">Subject *</label>
        <select
          value={selectedSubject}
          onChange={(e) => handleSubjectChange(e.target.value)}
          disabled={disabled || !selectedYear || !selectedClass || !filteredSubjects || filteredSubjects.length === 0}
          className="subject-selector-select"
        >
          <option value="">
            {!selectedYear || !selectedClass
              ? 'Select year and class first'
              : filteredSubjects?.length === 0
                ? 'No subjects configured'
                : 'Select Subject'}
          </option>
          {filteredSubjects?.map((subject) => (
            <option key={subject.name} value={subject.name}>
              {subject.name} {subject.type && `(${subject.type})`}
            </option>
          ))}
        </select>
        {filteredSubjects && filteredSubjects.length === 0 && selectedYear && selectedClass && (
          <span className="subject-selector-hint">
            No subjects found for this class/year. Configure subjects first.
          </span>
        )}
      </div>
    </div>
  );
}

// Export helper to get available subjects for a specific year/class (for external use)
export function getSubjectsForYearAndClass(
  subjectsData: SubjectRecord[],
  year: string,
  className: string
): Subject[] {
  const record = subjectsData.find(
    s => s.academicYear === year && s.className === className
  );
  return record?.subjects || [];
}

// Export helper to extract academic years from subjects
export function extractAcademicYears(subjectsData: SubjectRecord[]): string[] {
  const years = [...new Set(subjectsData.map(s => s.academicYear))];
  return years.sort((a, b) => b.localeCompare(a));
}
