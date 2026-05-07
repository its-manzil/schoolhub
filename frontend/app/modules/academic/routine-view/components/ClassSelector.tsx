'use client';

import { CLASS_OPTIONS, BS_ACADEMIC_YEAR_OPTIONS } from '../types';

interface ClassSelectorProps {
  selectedClass: string;
  onClassChange: (value: string) => void;
  selectedAcademicYear: string;
  onAcademicYearChange: (value: string) => void;
  loadedAcademicYearBs?: string;
  effectiveFromBs?: string;
  availableYears?: string[];
}

export function ClassSelector({
  selectedClass,
  onClassChange,
  selectedAcademicYear,
  onAcademicYearChange,
  loadedAcademicYearBs,
  effectiveFromBs,
  availableYears
}: ClassSelectorProps) {
  // Use available years from database if provided, otherwise use default options
  const yearOptions = availableYears && availableYears.length > 0 
    ? availableYears 
    : BS_ACADEMIC_YEAR_OPTIONS;

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
            disabled={yearOptions.length === 0}
          >
            {availableYears && availableYears.length > 0 ? (
              // When using database years, show all options without "Latest"
              yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))
            ) : (
              // When using default options, include "Latest" option
              <>
                <option value="">Latest</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </>
            )}
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
