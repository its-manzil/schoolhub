'use client'

import { ParentRecord } from './types'
import './ParentProfilePanel.css'

interface ParentProfilePanelProps {
  parent: ParentRecord
}

export default function ParentProfilePanel({ parent }: ParentProfilePanelProps) {
  return (
    <div className="parent-profile">
      {/* Header */}
      <div className="parent-profile__header">
        <div className="parent-profile__header-content">
          <div className="parent-profile__avatar">
            {parent.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="parent-profile__name">{parent.name}</h2>
            <p className="parent-profile__id">Parent ID: {parent._id}</p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="parent-profile__actions">
          <a href={`tel:${parent.phone}`} className="parent-profile__btn parent-profile__btn--primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Call
          </a>
          {parent.email && (
            <a href={`mailto:${parent.email}`} className="parent-profile__btn parent-profile__btn--secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Email
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="parent-profile__content">
        {/* Contact Info Section */}
        <div className="parent-profile__section">
          <h3 className="parent-profile__section-title">Contact Information</h3>
          <div className="parent-profile__contact-list">
            <div className="parent-profile__contact-item">
              <div className="parent-profile__contact-icon parent-profile__contact-icon--green">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div>
                <p className="parent-profile__contact-label">Phone Number</p>
                <p className="parent-profile__contact-value">{parent.phone}</p>
              </div>
            </div>
            
            <div className="parent-profile__contact-item">
              <div className="parent-profile__contact-icon parent-profile__contact-icon--blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div>
                <p className="parent-profile__contact-label">Email Address</p>
                <p className="parent-profile__contact-value">{parent.email || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Children Section */}
        <div>
          <div className="parent-profile__children-header">
            <h3 className="parent-profile__section-title">Children</h3>
            <span className="parent-profile__children-count">
              {parent.childrenDetails.length} {parent.childrenDetails.length === 1 ? 'Child' : 'Children'}
            </span>
          </div>

          {parent.childrenDetails.length === 0 ? (
            <div className="parent-profile__children-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              <p className="parent-profile__children-empty-text">No children linked to this parent</p>
            </div>
          ) : (
            <div className="parent-profile__children-list">
              {parent.childrenDetails.map(child => (
                <div key={child._id} className="child-card">
                  <div className="child-card__header">
                    <div>
                      <h4 className="child-card__name">{child.name}</h4>
                      <p className="child-card__id">Student ID: {child.studentId}</p>
                    </div>
                    {child.academicStatus && (
                      <span className={`child-card__status ${child.academicStatus === 'Active' ? 'child-card__status--active' : 'child-card__status--inactive'}`}>
                        {child.academicStatus}
                      </span>
                    )}
                  </div>

                  {/* Academic Grid */}
                  <div className="child-card__grid">
                    <div className="child-card__info-box">
                      <p className="child-card__info-label">Class</p>
                      <p className="child-card__info-value">{child.className}</p>
                    </div>
                    <div className="child-card__info-box">
                      <p className="child-card__info-label">Section</p>
                      <p className="child-card__info-value">{child.section}</p>
                    </div>
                    <div className="child-card__info-box">
                      <p className="child-card__info-label">Roll No</p>
                      <p className="child-card__info-value">{child.rollNumber}</p>
                    </div>
                    <div className="child-card__info-box">
                      <p className="child-card__info-label">Adm. Year</p>
                      <p className="child-card__info-value">{child.admissionYear}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
