'use client';

import { CLASS_OPTIONS, BS_ACADEMIC_YEAR_OPTIONS } from '../types';

interface ClassSelectorProps {
  selectedClass: string;
  onClassChange: (value: string) => void;
  selectedAcademicYear: string;
  onAcademicYearChange: (value: string) => void;
  loadedAcademicYearBs?: string;
  effectiveFromBs?: string;
}

export function ClassSelector({
  selectedClass,
  onClassChange,
  selectedAcademicYear,
  onAcademicYearChange,
  loadedAcademicYearBs,
  effectiveFromBs
}: ClassSelectorProps) {
  return (
    <div className="routine-class-selector">
      <div className="routine-selector-row">
        <label className="routine-selector-label">
          <span className="routine-selector-label-text">Class</span>
          <select
            className="routine-selector-select"
            value={selectedClass}
            onChange={(e) => onClassChange(e.target.value)}
          >
            {CLASS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="routine-selector-label">
          <span className="routine-selector-label-text">Academic Year (B.S.)</span>
          <select
            className="routine-selector-select"
            value={selectedAcademicYear}
            onChange={(e) => onAcademicYearChange(e.target.value)}
          >
            <option value="">Latest</option>
            {BS_ACADEMIC_YEAR_OPTIONS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>

      {(loadedAcademicYearBs || effectiveFromBs) && (
        <div className="routine-selector-meta">
          {loadedAcademicYearBs && (
            <span className="routine-selector-meta-item">
              <span className="routine-selector-meta-label">Loaded:</span>
              <span className="routine-selector-meta-value">{loadedAcademicYearBs}</span>
            </span>
          )}
          {effectiveFromBs && (
            <span className="routine-selector-meta-item">
              <span className="routine-selector-meta-label">Effective from:</span>
              <span className="routine-selector-meta-value">{effectiveFromBs}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
