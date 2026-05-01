'use client'

import './ParentClassMatrix.css'

const DISPLAY_CLASSES = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

interface ParentClassMatrixProps {
  classCounts: Record<string, number>
  selectedClass: string | null
  onSelectClass: (className: string | null) => void
}

export default function ParentClassMatrix({ classCounts, selectedClass, onSelectClass }: ParentClassMatrixProps) {
  return (
    <div className="class-matrix">
      <div className="class-matrix__header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
        </svg>
        <h3 className="class-matrix__title">Class Filter Matrix</h3>
        <span className="class-matrix__hint">Click to filter by class</span>
      </div>

      <div className="class-matrix__grid">
        {DISPLAY_CLASSES.map(className => {
          const count = classCounts[className] || 0
          const isSelected = selectedClass === className
          const hasParents = count > 0
          
          let buttonClass = 'class-matrix__button'
          if (isSelected) {
            buttonClass += ' class-matrix__button--selected'
          } else if (hasParents) {
            buttonClass += ' class-matrix__button--has-parents'
          } else {
            buttonClass += ' class-matrix__button--disabled'
          }
          
          return (
            <button
              key={className}
              onClick={() => onSelectClass(isSelected ? null : className)}
              disabled={!hasParents}
              className={buttonClass}
            >
              <span className="class-matrix__button-class">{className}</span>
              <span className="class-matrix__button-count">{count} parents</span>
              {isSelected && <div className="class-matrix__button-indicator" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
