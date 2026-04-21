'use client'

import { Clock } from 'lucide-react'
import AcademicNavbar from '../components/AcademicNavbar'
import './leaves.css'

export default function LeavesPage() {
  return (
    <div className="leaves-layout">
      <AcademicNavbar />
      <main className="leaves-main">
        {/* Dummy background content (blurred) */}
        <div className="coming-soon-background">
          {/* Dummy header */}
          <div className="dummy-header">
            <div className="dummy-title-block"></div>
            <div className="dummy-subtitle-block"></div>
          </div>
          {/* Dummy filter bar */}
          <div className="dummy-filter-bar">
            <div className="dummy-search"></div>
            <div className="dummy-tabs">
              <div className="dummy-tab"></div>
              <div className="dummy-tab"></div>
              <div className="dummy-tab"></div>
            </div>
          </div>
          {/* Dummy cards grid */}
          <div className="dummy-grid">
            <div className="dummy-card">
              <div className="dummy-card-header">
                <div className="dummy-avatar"></div>
                <div className="dummy-text-lines">
                  <div className="dummy-line short"></div>
                  <div className="dummy-line shorter"></div>
                </div>
              </div>
              <div className="dummy-card-body">
                <div className="dummy-line"></div>
                <div className="dummy-line medium"></div>
              </div>
            </div>
            <div className="dummy-card">
              <div className="dummy-card-header">
                <div className="dummy-avatar"></div>
                <div className="dummy-text-lines">
                  <div className="dummy-line short"></div>
                  <div className="dummy-line shorter"></div>
                </div>
              </div>
              <div className="dummy-card-body">
                <div className="dummy-line"></div>
                <div className="dummy-line medium"></div>
              </div>
            </div>
            <div className="dummy-card">
              <div className="dummy-card-header">
                <div className="dummy-avatar"></div>
                <div className="dummy-text-lines">
                  <div className="dummy-line short"></div>
                  <div className="dummy-line shorter"></div>
                </div>
              </div>
              <div className="dummy-card-body">
                <div className="dummy-line"></div>
                <div className="dummy-line medium"></div>
              </div>
            </div>
            <div className="dummy-card">
              <div className="dummy-card-header">
                <div className="dummy-avatar"></div>
                <div className="dummy-text-lines">
                  <div className="dummy-line short"></div>
                  <div className="dummy-line shorter"></div>
                </div>
              </div>
              <div className="dummy-card-body">
                <div className="dummy-line"></div>
                <div className="dummy-line medium"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dark overlay */}
        <div className="coming-soon-overlay"></div>

        {/* Coming Soon card */}
        <div className="coming-soon-container">
          <div className="coming-soon-card">
            <div className="coming-soon-icon">
              <Clock size={48} />
            </div>
            <h1 className="coming-soon-title">Coming Soon!</h1>
            <p className="coming-soon-subtitle">
              Leave management system is under development
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}