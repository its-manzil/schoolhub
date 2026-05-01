'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import AcademicNavbar from '../components/AcademicNavbar'
import '../academic.css'
import './routine.css'

// Import new routine-view components
import { RoutineGrid, RoutineFilters, useRoutineView, routineViewService } from '@/app/modules/academic/routine-view'
import { DAYS, CLASS_OPTIONS } from '@/app/modules/academic/routine-view'
import '@/app/modules/academic/routine-view/routine-view.css'

// Import dependencies
import { useSubjects } from '@/app/modules/academic/subjects/hooks/useSubjects'
import { useRoutineBuilder } from '@/app/modules/academic/routine/hooks/useRoutineBuilder'
import { routineService } from '@/app/modules/academic/routine/services/routineService'
import TimeConfigForm from '@/app/modules/academic/routine/components/TimeConfigForm'
import WeeklyGrid from '@/app/modules/academic/routine/components/WeeklyGrid'
import { Period } from '@/app/modules/academic/routine/types'
import { toast } from 'sonner'

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

type TabType = 'view' | 'create' | 'update'

export default function RoutinePage() {
  // Mini navbar state
  const [activeTab, setActiveTab] = useState<TabType>('view')

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

  // ==========================================
  // ACADEMIC YEARS FROM DATABASE
  // ==========================================
  const [availableYears, setAvailableYears] = useState<string[]>([])

  // Fetch subjects for the routine builder
  const { subjects: subjectsRecords, fetchSubjects } = useSubjects()

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  // ==========================================
  // CREATE ROUTINE STATE (Inline, not modal)
  // ==========================================
  const [createClassName, setCreateClassName] = useState('Class 1')
  const [createAcademicYear, setCreateAcademicYear] = useState('2081-2082')
  const [createStep, setCreateStep] = useState(1)
  
  const availableCreateSubjects = subjectsRecords.find(
    r => r.className === createClassName && r.academicYear === createAcademicYear
  )?.subjects || []
  
  const {
    periods: createPeriods,
    setPeriods: setCreatePeriods,
    holidays: createHolidays,
    setHolidays: setCreateHolidays,
    generateTimeSlots: generateCreateTimeSlots,
    saveRoutine: saveCreateRoutine,
    isLoading: isCreateLoading,
    error: createError
  } = useRoutineBuilder(createClassName, createAcademicYear)

  useEffect(() => {
    if (createError) {
      toast.error(createError)
    }
  }, [createError])

  const handleCreateSave = async () => {
    const success = await saveCreateRoutine()
    if (success) {
      toast.success('Routine created successfully')
      // Reset to step 1
      setCreateStep(1)
      setCreatePeriods([])
      setCreateHolidays({
        Sunday: false, Monday: false, Tuesday: false, Wednesday: false,
        Thursday: false, Friday: false, Saturday: false
      })
      // Switch to view tab and refresh
      setActiveTab('view')
      fetchRoutine()
    }
  }

  // ==========================================
  // UPDATE ROUTINE STATE
  // ==========================================
  const [updateClassName, setUpdateClassName] = useState('Class 1')
  const [updateAcademicYear, setUpdateAcademicYear] = useState('2081-2082')
  const [updateStep, setUpdateStep] = useState(1)
  const [updatePeriods, setUpdatePeriods] = useState<Period[]>([])
  const [updateHolidays, setUpdateHolidays] = useState<Record<string, boolean>>({
    Sunday: false, Monday: false, Tuesday: false, Wednesday: false,
    Thursday: false, Friday: false, Saturday: false
  })
  const [isUpdateLoading, setIsUpdateLoading] = useState(false)
  const [isUpdateSaving, setIsUpdateSaving] = useState(false)
  const [updateNotFoundMessage, setUpdateNotFoundMessage] = useState<string | null>(null)

  const availableUpdateSubjects = subjectsRecords.find(
    r => r.className === updateClassName && r.academicYear === updateAcademicYear
  )?.subjects || []

  // Fetch existing routine for update
  const fetchExistingRoutine = useCallback(async () => {
    setIsUpdateLoading(true)
    setUpdateNotFoundMessage(null)
    try {
      const result = await routineViewService.fetchRoutine(updateClassName, updateAcademicYear)
      if (result.success && result.data) {
        // Convert RoutinePeriod[] to Period[] format expected by WeeklyGrid
        // Group by time slot to create period entries
        const timeSlotMap = new Map<string, Period[]>()
        result.data.periods.forEach(p => {
          const key = `${p.startTime}-${p.endTime}`
          if (!timeSlotMap.has(key)) {
            timeSlotMap.set(key, [])
          }
          const existing = timeSlotMap.get(key)!
          // Find or create period entry
          let periodEntry = existing.find(ep => ep.startTime === p.startTime && ep.endTime === p.endTime)
          if (!periodEntry) {
            periodEntry = {
              periodNumber: existing.length + 1,
              periodName: `Period ${existing.length + 1}`,
              startTime: p.startTime,
              endTime: p.endTime,
              subjectType: p.subjectType === 'primary' ? 'Primary' : p.subjectType === 'minor' ? 'Minor' : p.subjectType === 'optional' ? 'Optional' : p.type === 'break' ? 'Break' : 'Primary',
              subjects: [],
              applyMode: 'weekly',
              daySpecificAssignments: {}
            }
            existing.push(periodEntry)
          }
          // Add subject to the period
          if (p.subjectName && !periodEntry.subjects.includes(p.subjectName)) {
            periodEntry.subjects.push(p.subjectName)
          }
          // Track day-specific assignment
          if (p.day && p.subjectName) {
            periodEntry.daySpecificAssignments = periodEntry.daySpecificAssignments || {}
            periodEntry.daySpecificAssignments[p.day] = p.subjectName
          }
        })
        // Flatten all periods
        const periods: Period[] = []
        timeSlotMap.forEach((slotPeriods) => {
          periods.push(...slotPeriods)
        })
        setUpdatePeriods(periods)
        // Extract holidays - for now assume no holidays in loaded data
        // The holidays are stored separately in the routine data
        const holidayDays = new Set<string>()
        setUpdateHolidays({
          Sunday: holidayDays.has('Sunday'), Monday: holidayDays.has('Monday'), 
          Tuesday: holidayDays.has('Tuesday'), Wednesday: holidayDays.has('Wednesday'),
          Thursday: holidayDays.has('Thursday'), Friday: holidayDays.has('Friday'), 
          Saturday: holidayDays.has('Saturday')
        })
        setUpdateStep(2)
        toast.success('Existing routine loaded for editing')
      } else {
        setUpdateNotFoundMessage(`No routine found for ${updateClassName} in ${updateAcademicYear}. Create a routine first using the "Create Routine" tab.`)
        toast.error('No existing routine found for this class and year')
      }
    } catch {
      setUpdateNotFoundMessage('Failed to fetch routine. Please try again.')
      toast.error('Failed to fetch routine')
    } finally {
      setIsUpdateLoading(false)
    }
  }, [updateClassName, updateAcademicYear])

  const handleUpdateHolidayToggle = (day: string) => {
    setUpdateHolidays(prev => ({
      ...prev,
      [day]: !prev[day]
    }))
  }

  const handleUpdateSave = async () => {
    setIsUpdateSaving(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Not authenticated')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/academic/subjects/routines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          className: updateClassName,
          academicYearBs: updateAcademicYear,
          effectiveFromBs: effectiveFromBs || new Date().toISOString().split('T')[0],
          periods: updatePeriods
        })
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        toast.error(data.message || 'Failed to update routine')
        return
      }
      toast.success('Routine updated successfully')
      setUpdateStep(1)
      setUpdatePeriods([])
      setActiveTab('view')
      fetchRoutine()
    } catch {
      toast.error('Failed to update routine')
    } finally {
      setIsUpdateSaving(false)
    }
  }

  // ==========================================
  // FETCH ACADEMIC YEARS FROM DATABASE
  // ==========================================
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const res = await routineService.fetchAcademicYearsFromSchedules()
        if (res.success && res.data.length > 0) {
          setAvailableYears(res.data)
        } else {
          // Fallback to default years if no data in database
          setAvailableYears(['2080-2081', '2081-2082', '2082-2083'])
        }
      } catch {
        setAvailableYears(['2080-2081', '2081-2082', '2082-2083'])
      }
    }
    fetchAcademicYears()
  }, [])

  // Update default academic years when availableYears changes
  useEffect(() => {
    if (availableYears.length > 0) {
      if (!availableYears.includes(createAcademicYear)) {
        setCreateAcademicYear(availableYears[0])
      }
      if (!availableYears.includes(updateAcademicYear)) {
        setUpdateAcademicYear(availableYears[0])
      }
    }
  }, [availableYears, createAcademicYear, updateAcademicYear])

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
              View, create, and update class-wise routines using the dynamic grid system.
            </p>
          </div>
        </header>

        {/* Mini Navbar */}
        <nav className="routine-mini-navbar">
          <button
            type="button"
            className={`routine-nav-btn ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            View Routine
          </button>
          <button
            type="button"
            className={`routine-nav-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create Routine
          </button>
          <button
            type="button"
            className={`routine-nav-btn ${activeTab === 'update' ? 'active' : ''}`}
            onClick={() => setActiveTab('update')}
          >
            Update Routine
          </button>
        </nav>

        {(error || viewError) && (
          <div className="academic-message academic-message-error">{error || viewError}</div>
        )}
        {message && (
          <div className="academic-message academic-message-success">{message}</div>
        )}

        {/* ==========================================
            TAB 1: VIEW ROUTINE
        ========================================== */}
        {activeTab === 'view' && (
          <>
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
                availableYears={availableYears}
              />
            </section>

            <section className="card">
              <div className="routine-header-with-print">
                <h2 className="heading-text">Routine Overview</h2>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  {routinePeriods.length > 0 && (
                    <button
                      type="button"
                      className="btn-primary btn-print-routine"
                      onClick={() => setShowPrintModal(true)}
                    >
                      Print Routine
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-primary btn-save-routine"
                    onClick={handleSaveRoutine}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Routine'}
                  </button>
                </div>
              </div>

              <div className="routine-view-container">
                {!isLoading && routinePeriods.length === 0 && (
                  <div className="academic-empty-state">
                    <p>No routine set yet for {CLASS_OPTIONS.find(c => c.value === selectedClass)?.label || selectedClass} in {selectedAcademicYear || loadedAcademicYearBs || 'this academic year'}.</p>
                    <p>Create a routine first using the &quot;Create Routine&quot; tab.</p>
                  </div>
                )}
                
                <RoutineGrid
                  routinePeriods={routinePeriods}
                  teachers={teachers}
                  viewMode={viewMode}
                  highlightSubject={highlightSubject}
                  isLoading={isLoading}
                />

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
          </>
        )}

        {/* ==========================================
            TAB 2: CREATE ROUTINE
        ========================================== */}
        {activeTab === 'create' && (
          <section className="card routine-create-section">
            <h2 className="heading-text">Create New Routine</h2>
            
            {createStep === 1 && (
              <TimeConfigForm
                academicYear={createAcademicYear}
                className={createClassName}
                onGenerate={() => {
                  generateCreateTimeSlots()
                  setCreateStep(2)
                }}
                onAcademicYearChange={setCreateAcademicYear}
                onClassChange={setCreateClassName}
                availableYears={availableYears}
              />
            )}

            {createStep === 2 && (
              <div className="builder-step-2">
                <div className="step-info">
                  <span><strong>Class:</strong> {createClassName}</span>
                  <span><strong>Year:</strong> {createAcademicYear}</span>
                </div>

                <WeeklyGrid
                  periods={createPeriods}
                  holidays={createHolidays}
                  availableSubjects={availableCreateSubjects}
                  onUpdatePeriod={(idx: number, updated: Period) => {
                    const next = [...createPeriods]
                    next[idx] = updated
                    setCreatePeriods(next)
                  }}
                  onHolidayToggle={(day: string) => {
                    setCreateHolidays((prev: Record<string, boolean>) => ({
                      ...prev,
                      [day]: !prev[day]
                    }))
                  }}
                />

                <div className="step-actions">
                  <button
                    type="button"
                    onClick={() => setCreateStep(1)}
                    className="btn-secondary"
                    disabled={isCreateLoading}
                  >
                    Back to Config
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateSave}
                    className="btn-primary"
                    disabled={isCreateLoading || createPeriods.length === 0}
                  >
                    {isCreateLoading ? 'Saving...' : 'Save Routine'}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ==========================================
            TAB 3: UPDATE ROUTINE
        ========================================== */}
        {activeTab === 'update' && (
          <section className="card routine-update-section">
            <h2 className="heading-text">Update Existing Routine</h2>
            
            {updateStep === 1 && (
              <div className="update-step-1">
                <p className="body-text" style={{ marginBottom: 'var(--spacing-md)' }}>
                  Select the class and academic year of the routine you want to update.
                </p>
                <div className="update-load-section">
                  <TimeConfigForm
                    academicYear={updateAcademicYear}
                    className={updateClassName}
                    onGenerate={fetchExistingRoutine}
                    onAcademicYearChange={(year) => {
                      setUpdateAcademicYear(year)
                      setUpdateNotFoundMessage(null)
                    }}
                    onClassChange={(cls) => {
                      setUpdateClassName(cls)
                      setUpdateNotFoundMessage(null)
                    }}
                    availableYears={availableYears}
                  />
                  <div style={{ marginTop: 'var(--spacing-md)', textAlign: 'center' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={fetchExistingRoutine}
                      disabled={isUpdateLoading}
                      style={{ minWidth: '200px' }}
                    >
                      {isUpdateLoading ? 'Loading...' : 'Load Existing Routine'}
                    </button>
                  </div>
                  {updateNotFoundMessage && (
                    <div className="academic-message academic-message-error" style={{ marginTop: 'var(--spacing-md)' }}>
                      {updateNotFoundMessage}
                    </div>
                  )}
                </div>
              </div>
            )}

            {updateStep === 2 && (
              <div className="builder-step-2">
                <div className="step-info" style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span><strong>Class:</strong> {updateClassName}</span>
                  <span><strong>Year:</strong> {updateAcademicYear}</span>
                  <span className="update-badge" style={{ 
                    backgroundColor: 'var(--accent-yellow)', 
                    color: 'var(--main-text)', 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    fontSize: 'var(--font-size-small)',
                    fontWeight: 600
                  }}>Editing Mode</span>
                </div>

                <WeeklyGrid
                  periods={updatePeriods}
                  holidays={updateHolidays}
                  availableSubjects={availableUpdateSubjects}
                  onUpdatePeriod={(idx: number, updated: Period) => {
                    const next = [...updatePeriods]
                    next[idx] = updated
                    setUpdatePeriods(next)
                  }}
                  onHolidayToggle={handleUpdateHolidayToggle}
                />

                <div className="step-actions">
                  <button
                    type="button"
                    onClick={() => setUpdateStep(1)}
                    className="btn-secondary"
                    disabled={isUpdateSaving}
                  >
                    Back to Selection
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateSave}
                    className="btn-primary"
                    disabled={isUpdateSaving || updatePeriods.length === 0}
                  >
                    {isUpdateSaving ? 'Updating...' : 'Update Routine'}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

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
