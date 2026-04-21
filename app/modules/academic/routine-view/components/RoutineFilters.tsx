'use client';

import { ClassSelector } from './ClassSelector';
import { ViewToggle } from './ViewToggle';
import { ViewMode, Subject } from '../types';

interface RoutineFiltersProps {
  selectedClass: string;
  onClassChange: (value: string) => void;
  selectedAcademicYear: string;
  onAcademicYearChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  highlightSubject: string;
  onHighlightSubjectChange: (value: string) => void;
  subjects: Subject[];
  loadedAcademicYearBs?: string;
  effectiveFromBs?: string;
}

export function RoutineFilters({
  selectedClass,
  onClassChange,
  selectedAcademicYear,
  onAcademicYearChange,
  viewMode,
  onViewModeChange,
  highlightSubject,
  onHighlightSubjectChange,
  subjects,
  loadedAcademicYearBs,
  effectiveFromBs
}: RoutineFiltersProps) {
  return (
    <div className="routine-filters">
      <div className="routine-filters-main">
        <ClassSelector
          selectedClass={selectedClass}
          onClassChange={onClassChange}
          selectedAcademicYear={selectedAcademicYear}
          onAcademicYearChange={onAcademicYearChange}
          loadedAcademicYearBs={loadedAcademicYearBs}
          effectiveFromBs={effectiveFromBs}
        />

        <ViewToggle viewMode={viewMode} onChange={onViewModeChange} />
      </div>

      {subjects.length > 0 && (
        <div className="routine-filters-secondary">
          <label className="routine-highlight-label">
            <span className="routine-highlight-label-text">Highlight Subject:</span>
            <select
              className="routine-highlight-select"
              value={highlightSubject}
              onChange={(e) => onHighlightSubjectChange(e.target.value)}
            >
              <option value="">None</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
