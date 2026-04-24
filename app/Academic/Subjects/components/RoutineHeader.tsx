'use client';

import React from 'react';
import './RoutineHeader.css';
import { CLASS_OPTIONS } from '../types';
import { getCurrentBSDate } from '../../../utils/dateConverter';

interface RoutineHeaderProps {
  academicYear: string;
  setAcademicYear: (year: string) => void;
  className: string;
  setClassName: (cls: string) => void;
  onFetch: () => void;
}

const RoutineHeader: React.FC<RoutineHeaderProps> = ({ 
  academicYear, setAcademicYear, className, setClassName, onFetch 
}) => {
  const currentBS = getCurrentBSDate();
  const years = Array.from({ length: 15 }, (_, i) => `${2080 + i}-${2081 + i}`);

  return (
    <div className="routine-header">
      <h2 className="section-title">Create Class Routine</h2>
      <div className="header-inputs">
        <div className="form-group">
          <label>Academic Year (BS)</label>
          <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Class</label>
          <select value={className} onChange={(e) => setClassName(e.target.value)}>
            {CLASS_OPTIONS.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary" onClick={onFetch}>Load Routine</button>
      </div>
    </div>
  );
};

export default RoutineHeader;
