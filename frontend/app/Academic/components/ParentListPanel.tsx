'use client'

import { ParentRecord, ParentChild } from './types'
import './ParentListPanel.css'

interface ParentListPanelProps {
  parents: ParentRecord[]
  selectedParent: ParentRecord | null
  onSelectParent: (parent: ParentRecord) => void
  searchQuery: string
}

export default function ParentListPanel({ 
  parents, 
  selectedParent, 
  onSelectParent,
  searchQuery 
}: ParentListPanelProps) {
  const getUniqueClasses = (children: ParentChild[]) => {
    const classes = new Set(children.map((c: ParentChild) => `Class ${c.className}`))
    return Array.from(classes).slice(0, 3)
  }

  if (parents.length === 0) {
    return (
      <div className="parent-list__empty">
        <svg className="parent-list__empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <p className="parent-list__empty-title">No parents found</p>
        <p className="parent-list__empty-text">
          {searchQuery ? 'Try adjusting your search or filters' : 'No parent records available'}
        </p>
      </div>
    )
  }

  return (
    <div className="parent-list">
      <div className="parent-list__header">
        <h3 className="parent-list__title">Parent Directory</h3>
        <p className="parent-list__count">
          {parents.length} {parents.length === 1 ? 'parent' : 'parents'} found
        </p>
      </div>
      
      <div className="parent-list__content">
        <div className="parent-list__grid">
          {parents.map(parent => {
            const isSelected = selectedParent?._id === parent._id
            const uniqueClasses = getUniqueClasses(parent.childrenDetails)
            
            return (
              <div
                key={parent._id}
                onClick={() => onSelectParent(parent)}
                className={`parent-card ${isSelected ? 'parent-card--selected' : ''}`}
              >
                <div className="parent-card__header">
                  <div>
                    <h4 className="parent-card__name">{parent.name}</h4>
                    <p className="parent-card__id">ID: {parent._id}</p>
                  </div>
                  <div className={`parent-card__badge ${parent.childrenDetails.length > 0 ? 'parent-card__badge--has-children' : 'parent-card__badge--no-children'}`}>
                    {parent.childrenDetails.length} {parent.childrenDetails.length === 1 ? 'child' : 'children'}
                  </div>
                </div>
                
                {/* Class Badges */}
                {uniqueClasses.length > 0 && (
                  <div className="parent-card__classes">
                    {uniqueClasses.map((cls, idx) => (
                      <span key={idx} className="parent-card__class-tag">
                        {cls}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Contact Info */}
                <div className="parent-card__contact">
                  <div className="parent-card__contact-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    {parent.phone}
                  </div>
                  {parent.email && (
                    <div className="parent-card__contact-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      <span className="parent-card__email">{parent.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
