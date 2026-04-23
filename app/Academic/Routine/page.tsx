'use client'

import { useEffect, useMemo, useState } from 'react'
import AcademicNavbar from '../components/AcademicNavbar'
import '../academic.css'
import './routine.css'

// Import new routine-view components
import { RoutineGrid, RoutineFilters, useRoutineView } from '@/app/modules/academic/routine-view'
import { DAYS, CLASS_OPTIONS } from '@/app/modules/academic/routine-view'
import '@/app/modules/academic/routine-view/routine-view.css'

// Helper functions
function formatTime12Hour(value: string) {
  if (!value) return ''
  const [hourPart, minutePart] = value.split(':')
  const hourNumber = Number(hourPart)
  if (Number.isNaN(hourNumber)) return value
  const suffix = hourNumber >= 12 ? 'PM' : 'AM'
  let displayHour = hourNumber
  if (displayHour === 0) displayHour = 12
  else if (displayHour > 12) displayHour -= 12
  return `${displayHour}:${minutePart} ${suffix}`
}

export default function RoutinePage() {
  // Use the new hook for viewing routines
  const {
    routinePeriods,
    teachers,
    isLoading,
    error: viewError,
    selectedClass,
    setSelectedClass,
    selectedAcademicYear,
    setSelectedAcademicYear,
    viewMode,
    setViewMode,
    highlightSubject,
    setHighlightSubject,
    loadedAcademicYearBs,
    effectiveFromBs,
    fetchRoutine
  } = useRoutineView()

  const [showPrintModal, setShowPrintModal] = useState(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSaveRoutine = async () => {
    setMessage(null)
    if (!selectedClass) { setError('Select class'); return }
    if (!loadedAcademicYearBs.trim()) { setError('Enter academic year (B.S.)'); return }

    try {
      setIsSaving(true)
      setError(null)
      const token = localStorage.getItem('token')
      if (!token) { setError('Not authenticated'); setIsSaving(false); return }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/academic/subjects/routines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          className: selectedClass,
          academicYearBs: loadedAcademicYearBs.trim(),
          effectiveFromBs: effectiveFromBs.trim(),
          periods: routinePeriods
        })
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to save routine')
        setIsSaving(false)
        return
      }
      setMessage('Routine saved successfully')
      setIsSaving(false)
      fetchRoutine()
    } catch {
      setError('Failed to save routine')
      setIsSaving(false)
    }
  }

  // Time slots for print modal
  const timeSlots = useMemo(() => {
    const map = new Map<string, { startTime: string; endTime: string }>()
    routinePeriods.forEach(p => {
      const key = `${p.startTime}-${p.endTime}`
      if (!map.has(key)) map.set(key, { startTime: p.startTime, endTime: p.endTime })
    })
    return Array.from(map.values()).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [routinePeriods])

  const activeDays = useMemo(() => {
    const daySet = new Set(routinePeriods.map(p => p.day))
    return DAYS.filter(d => daySet.has(d.key))
  }, [routinePeriods])

  return (
    <div className="academic-layout">
      <AcademicNavbar />
      <main className="academic-main">
        <header className="academic-header">
          <div className="academic-header-left">
            <h1 className="title-text">Class Routine Management</h1>
            <p className="body-text">
              View and manage class-wise routines using the dynamic grid system.
            </p>
          </div>
          <div className="academic-header-right">
            <button
              type="button"
              className="btn-primary btn-save-routine"
              onClick={handleSaveRoutine}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Routine'}
            </button>
          </div>
        </header>

        {(error || viewError) && (
          <div className="academic-message academic-message-error">{error || viewError}</div>
        )}
        {message && (
          <div className="academic-message academic-message-success">{message}</div>
        )}

        {/* NEW: Professional Routine Filters */}
        <section className="card">
          <RoutineFilters
            selectedClass={selectedClass}
            onClassChange={setSelectedClass}
            selectedAcademicYear={selectedAcademicYear}
            onAcademicYearChange={setSelectedAcademicYear}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            highlightSubject={highlightSubject}
            onHighlightSubjectChange={setHighlightSubject}
            subjects={[]}
            loadedAcademicYearBs={loadedAcademicYearBs}
            effectiveFromBs={effectiveFromBs}
          />
        </section>

        {/* NEW: Professional Routine Grid */}
        <section className="card">
          <div className="routine-header-with-print">
            <h2 className="heading-text">Routine Overview</h2>
            {routinePeriods.length > 0 && (
              <button
                type="button"
                className="btn-primary btn-print-routine"
                onClick={() => setShowPrintModal(true)}
              >
                Print Routine
              </button>
            )}
          </div>

          <div className="routine-view-container">
            <RoutineGrid
              routinePeriods={routinePeriods}
              teachers={teachers}
              viewMode={viewMode}
              highlightSubject={highlightSubject}
              isLoading={isLoading}
            />

            {/* Legend */}
            {routinePeriods.length > 0 && (
              <div className="routine-legend">
                <div className="routine-legend-item">
                  <div className="routine-legend-dot routine-legend-dot-primary" />
                  <span>Primary Subject</span>
                </div>
                <div className="routine-legend-item">
                  <div className="routine-legend-dot routine-legend-dot-minor" />
                  <span>Minor Subject</span>
                </div>
                <div className="routine-legend-item">
                  <div className="routine-legend-dot routine-legend-dot-optional" />
                  <span>Optional Subject</span>
                </div>
                <div className="routine-legend-item">
                  <div className="routine-legend-dot routine-legend-dot-break" />
                  <span>Break/Lunch</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Print Modal */}
        {showPrintModal && (
          <div className="subjects-modal-overlay">
            <div className="subjects-modal card subjects-print-modal">
              <div className="subjects-modal-header">
                <h3 className="heading-text">Print Routine</h3>
                <button
                  type="button"
                  className="subjects-modal-close"
                  onClick={() => setShowPrintModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="subjects-print-content">
                <div className="subjects-print-info">
                  <p className="body-text">
                    <strong>Class:</strong> {CLASS_OPTIONS.find(c => c.value === selectedClass)?.label}
                  </p>
                  <p className="body-text">
                    <strong>Academic Year:</strong> {loadedAcademicYearBs || 'Not set'}
                  </p>
                  <p className="body-text">
                    <strong>Effective From:</strong> {effectiveFromBs || 'Not set'}
                  </p>
                </div>

                <div className="subjects-print-table">
                  <table className="subjects-print-routine-table">
                    <thead>
                      <tr>
                        <th>Day</th>
                        {timeSlots.map(slot => (
                          <th key={`${slot.startTime}-${slot.endTime}`}>
                            {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeDays.map(day => (
                        <tr key={day.key}>
                          <td>{day.label}</td>
                          {timeSlots.map(slot => {
                            const cellPeriods = routinePeriods.filter(
                              p => p.day === day.key &&
                                p.startTime === slot.startTime &&
                                p.endTime === slot.endTime
                            )
                            return (
                              <td key={`${slot.startTime}-${slot.endTime}`}>
                                {cellPeriods.length > 0 ? (
                                  <div className="subjects-print-period">
                                    {cellPeriods.map((period, idx) => (
                                      <div key={idx}>
                                        {period.type === 'break' 
                                          ? (period.breakType === 'lunch' ? 'Lunch' : 'Break')
                                          : period.subjectName
                                        }
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="subjects-print-empty">-</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="subjects-print-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => window.print()}
                >
                  Print
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => window.print()}
                >
                  Save as PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
