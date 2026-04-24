'use client';

import React, { useState, useEffect } from 'react';
import './AcademicYearSelector.css';

interface AcademicYearSelectorProps {
  selectedYear: string;
  onChange: (year: string) => void;
  schoolId: number;
}

export default function AcademicYearSelector({
  selectedYear,
  onChange,
  schoolId
}: AcademicYearSelectorProps) {
  const [years, setYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch(
          `http://localhost:2056/api/accounting/fee-management/academic-years`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-school-id': schoolId.toString()
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch academic years');
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          setYears(data.data);
          // Select first year if none selected
          if (!selectedYear && data.data.length > 0) {
            onChange(data.data[0]);
          }
        } else {
          // Fallback to generated years
          const fallbackYears = generateDefaultYears();
          setYears(fallbackYears);
          if (!selectedYear) {
            onChange(fallbackYears[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching academic years:', err);
        setError('Failed to load academic years');
        // Fallback to default years
        const fallbackYears = generateDefaultYears();
        setYears(fallbackYears);
        if (!selectedYear) {
          onChange(fallbackYears[0]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (schoolId) {
      fetchAcademicYears();
    }
  }, [schoolId, selectedYear, onChange]);

  const generateDefaultYears = (): string[] => {
    const currentYear = new Date().getFullYear() + 57; // BS year approximation
    const years: string[] = [];
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      years.push(`${year}-${year + 1}`);
    }
    return years;
  };

  if (loading) {
    return (
      <div className="academic-year-selector">
        <label className="filter-label">Academic Year</label>
        <div className="filter-loading">Loading...</div>
      </div>
    );
  }

  if (error && years.length === 0) {
    return (
      <div className="academic-year-selector">
        <label className="filter-label">Academic Year</label>
        <div className="filter-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="academic-year-selector">
      <label className="filter-label" htmlFor="academic-year">
        Academic Year <span className="required">*</span>
      </label>
      <select
        id="academic-year"
        className="filter-select"
        value={selectedYear}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select Academic Year</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year} (BS)
          </option>
        ))}
      </select>
    </div>
  );
}
