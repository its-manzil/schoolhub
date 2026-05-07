'use client'

import './ParentEmptyState.css'

interface ParentEmptyStateProps {
  onSelectFirst?: () => void
}

export default function ParentEmptyState({ onSelectFirst }: ParentEmptyStateProps) {
  return (
    <div className="parent-empty">
      <div className="parent-empty__icon-wrapper">
        <svg className="parent-empty__icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      
      <h3 className="parent-empty__title">Select a Parent</h3>
      
      <p className="parent-empty__text">
        Click on any parent from the directory to view their complete profile and children details
      </p>

      {onSelectFirst && (
        <button onClick={onSelectFirst} className="parent-empty__btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          View First Parent
        </button>
      )}
    </div>
  )
}
