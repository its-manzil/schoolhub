'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import './AcademicSelector.css';

interface AcademicSelectorProps {
  selectedYear: string;
  onChange: (year: string) => void;
  schoolId: number;
}

export default function AcademicSelector({
  selectedYear,
  onChange,
  schoolId
}: AcademicSelectorProps) {
  const [years, setYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:2056/api/accounting/fee-management/academic-years`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-school-id': schoolId.toString()
          }
        });
        const result = await response.json();
        if (result.success && result.data) {
          setYears(result.data);
          if (!selectedYear && result.data.length > 0) onChange(result.data[0]);
        }
      } catch (error) {
        console.error('Error fetching academic years:', error);
      } finally {
        setLoading(false);
      }
    };

    if (schoolId) fetchAcademicYears();
  }, [schoolId, selectedYear, onChange]);

  return (
    <div className="academic-selector-minimal">
      <div className="selector-icon">
        <Calendar size={18} />
      </div>
      <div className="selector-content">
        <label>Academic Year</label>
        {loading ? (
          <div className="selector-loading-text">Loading...</div>
        ) : (
          <select value={selectedYear} onChange={(e) => onChange(e.target.value)}>
            {years.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        )}
      </div>
    </div>
  );
}
