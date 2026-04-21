'use client';

import { ViewMode } from '../types';

interface ViewToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  return (
    <div className="routine-view-toggle">
      <span className="routine-view-toggle-label">View Mode:</span>
      <div className="routine-view-toggle-buttons">
        <button
          type="button"
          className={`routine-view-btn ${viewMode === 'period' ? 'routine-view-btn-active' : ''}`}
          onClick={() => onChange('period')}
          title="Period View: Rows = Periods, Columns = Days"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="1" y="6" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="1" y="11" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <span>Period View</span>
        </button>
        <button
          type="button"
          className={`routine-view-btn ${viewMode === 'day' ? 'routine-view-btn-active' : ''}`}
          onClick={() => onChange('day')}
          title="Day View: Rows = Days, Columns = Periods"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="6" y="1" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="11" y="1" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <span>Day View</span>
        </button>
      </div>
    </div>
  );
}
