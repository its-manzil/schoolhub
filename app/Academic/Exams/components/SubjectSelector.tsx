'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SubjectRecord, Subject } from '@/app/modules/academic/subjects/types';
import './SubjectSelector.css';

interface SubjectSelectorProps {
  onSubjectSelect: (subject: string, subjectData: Subject | null) => void;
  selectedSubject: string;
  academicYear: string;
  clsName: string;
  disabled?: boolean;
  className?: string;
  usedSubjects?: string[]; // Subjects already selected elsewhere
  subjectTypeFilter?: string; // Filter by type: 'Optional', 'Minor', 'Primary'
}

export default function SubjectSelector({
  onSubjectSelect,
  selectedSubject,
  academicYear,
  clsName,
  disabled = false,
  className = '',
  usedSubjects = [],
  subjectTypeFilter
}: SubjectSelectorProps) {
  const [subjectsData, setSubjectsData] = useState<SubjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Normalize class name for comparison (handles "10" vs "Class 10")
  const normalizeClassName = (name: string): string => {
    return name.replace(/^Class\s*/i, '').trim();
  };

  // Filter subjects by year, class, used subjects, and subject type
  const filteredSubjects = useMemo(() => {
    if (!academicYear || !clsName) return null;

    const normalizedInputClass = normalizeClassName(clsName);

    const record = subjectsData.find(
      s => s.academicYear === academicYear && normalizeClassName(s.className) === normalizedInputClass
    );

    let subjects = record?.subjects || [];

    // Filter out already used subjects
    subjects = subjects.filter(s => !usedSubjects.includes(s.name) || s.name === selectedSubject);

    // Filter by subject type if specified
    if (subjectTypeFilter) {
      subjects = subjects.filter(s => s.type === subjectTypeFilter);
    }

    return subjects;
  }, [subjectsData, academicYear, clsName, usedSubjects, selectedSubject, subjectTypeFilter]);

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
      {/* Subject Dropdown - Year and Class come from parent props */}
      <div className="subject-selector-field">
        <select
          value={selectedSubject}
          onChange={(e) => handleSubjectChange(e.target.value)}
          disabled={disabled || !academicYear || !clsName || !filteredSubjects || filteredSubjects.length === 0}
          className="subject-selector-select"
        >
          <option value="">
            {!academicYear || !clsName
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
        {filteredSubjects && filteredSubjects.length === 0 && academicYear && clsName && (
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
