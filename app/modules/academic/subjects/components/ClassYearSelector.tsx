import React from 'react';
import { CLASS_OPTIONS } from '../types';

interface ClassYearSelectorProps {
  academicYear: string;
  setAcademicYear: (year: string) => void;
  className: string;
  setClassName: (cls: string) => void;
  onImport: () => void;
  onFetch: () => void;
}

const ClassYearSelector: React.FC<ClassYearSelectorProps> = ({
  academicYear,
  setAcademicYear,
  className,
  setClassName,
  onImport,
  onFetch
}) => {
  const years = Array.from({ length: 15 }, (_, i) => `${2080 + i}-${2081 + i}`);

  return (
    <div className="class-year-selector">
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
        <div className="selector-actions">
          <button className="btn-primary" onClick={onFetch}>Load Record</button>
          <button className="btn-secondary" onClick={onImport}>Import Subjects</button>
        </div>
      </div>
    </div>
  );
};

export default ClassYearSelector;
