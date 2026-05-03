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
import '@/app/modules/academic/routine/components/CreateRoutine.css'
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
  const [createClassValue, setCreateClassValue] = useState('01')
  const [createAcademicYear, setCreateAcademicYear] = useState('2081-2082')
  const [createStep, setCreateStep] = useState(1)
  
  // Get the class label (e.g., "Class 1") from the value (e.g., "01") for database lookup
  const createClassName = CLASS_OPTIONS.find(c => c.value === createClassValue)?.label || 'Class 1'
  
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
  const [updateClassValue, setUpdateClassValue] = useState('01')
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

  // Get the class label (e.g., "Class 1") from the value (e.g., "01") for database lookup
  const updateClassName = CLASS_OPTIONS.find(c => c.value === updateClassValue)?.label || 'Class 1'

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
          <section className="routine-create-section">
            <h2>Create New Routine</h2>

            {createStep === 1 && (
              <div className="create-config-form">
                <div className="create-config-header">
                  <h3>Configure Schedule</h3>
                  <p>Select academic year and class to generate the routine structure</p>
                </div>

                <div className="create-form-grid">
                  <div className="create-form-group">
                    <label>
                      Academic Year (BS) <span className="required">*</span>
                    </label>
                    <select
                      className="create-form-select"
                      value={createAcademicYear}
                      onChange={(e) => setCreateAcademicYear(e.target.value)}
                      disabled={availableYears.length === 0}
                    >
                      {availableYears.length === 0 ? (
                        <option value="">No years available</option>
                      ) : (
                        availableYears.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))
                      )}
                    </select>
                    {availableYears.length === 0 && (
                      <div className="academic-year-info">
                        <span className="info-label">⚠️ No Academic Years Found</span>
                        Please configure a school schedule first to enable academic years.
                      </div>
                    )}
                  </div>

                  <div className="create-form-group">
                    <label>
                      Class <span className="required">*</span>
                    </label>
                    <select
                      className="create-form-select"
                      value={createClassValue}
                      onChange={(e) => setCreateClassValue(e.target.value)}
                    >
                      {CLASS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  className="create-generate-btn"
                  onClick={() => {
                    generateCreateTimeSlots()
                    setCreateStep(2)
                  }}
                  disabled={isCreateLoading || availableYears.length === 0}
                >
                  Generate Periods
                </button>
              </div>
            )}

            {createStep === 2 && (
              <div className="create-builder-container">
                {/* Subject Type Legend */}
                <div className="subject-type-legend">
                  <div className="subject-type-legend-item">
                    <span className="subject-type-dot primary"></span>
                    <span>Primary (Weekly)</span>
                  </div>
                  <div className="subject-type-legend-item">
                    <span className="subject-type-dot minor"></span>
                    <span>Minor (Daily)</span>
                  </div>
                  <div className="subject-type-legend-item">
                    <span className="subject-type-dot optional"></span>
                    <span>Optional (Multiple)</span>
                  </div>
                  <div className="subject-type-legend-item">
                    <span className="subject-type-dot break"></span>
                    <span>Break/Lunch</span>
                  </div>
                </div>

                <div className="create-step-info">
                  <span><strong>Class:</strong> {createClassName}</span>
                  <span><strong>Year:</strong> {createAcademicYear}</span>
                  <span className="academic-year-badge">{createAcademicYear}</span>
                </div>

                {/* School Schedule Info */}
                {(() => {
                  const schedule = subjectsRecords.find(
                    r => r.className === createClassName && r.academicYear === createAcademicYear
                  )
                  return schedule ? (
                    <div className="create-info-box">
                      <strong>📚 Available Subjects for {createClassName} - {createAcademicYear}:</strong>
                      <br />
                      Primary: {schedule.subjects.filter(s => s.type === 'Primary').map(s => s.name).join(', ') || 'None'}
                      <br />
                      Minor: {schedule.subjects.filter(s => s.type === 'Minor').map(s => s.name).join(', ') || 'None'}
                      <br />
                      Optional: {schedule.subjects.filter(s => s.type === 'Optional').map(s => s.name).join(', ') || 'None'}
                    </div>
                  ) : (
                    <div className="create-warning">
                      No subjects configured for {createClassName} in {createAcademicYear}.
                      Please configure subjects first in the Subjects section.
                    </div>
                  )
                })()}

                <div className="create-weekly-grid">
                  <table>
                    <thead>
                      <tr>
                        <th className="period-header">Period / Time</th>
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                          <th key={day} className={`day-column-header ${createHolidays[day] ? 'holiday' : ''}`}>
                            <div className="day-header-content">
                              <span className="day-name">{day.substring(0, 3)}</span>
                              <button
                                type="button"
                                className={`holiday-toggle-small ${createHolidays[day] ? 'is-holiday' : ''}`}
                                onClick={() => {
                                  setCreateHolidays((prev: Record<string, boolean>) => ({
                                    ...prev,
                                    [day]: !prev[day]
                                  }))
                                }}
                                title={createHolidays[day] ? 'Mark as working day' : 'Mark as holiday'}
                              >
                                {createHolidays[day] ? '🏖️' : '☀️'}
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Get all used subjects across all periods and days
                        const usedSubjects = new Set<string>()
                        createPeriods.forEach((period) => {
                          // Skip current period - allow it to see its own selections
                          period.subjects.forEach(s => usedSubjects.add(s))
                        })

                        return createPeriods.map((p, pIdx) => {
                          // Get subjects used by OTHER periods only
                          const otherUsedSubjects = new Set<string>()
                          createPeriods.forEach((period, idx) => {
                            if (idx !== pIdx) {
                              period.subjects.forEach(s => otherUsedSubjects.add(s))
                            }
                          })

                          // Get currently assigned for this period
                          const periodAssigned = p.subjects
                          const assignedSubjectType = periodAssigned.length > 0
                            ? availableCreateSubjects.find(s => s.name === periodAssigned[0])?.type
                            : null

                          return (
                            <tr key={pIdx}>
                              <td className="period-info-cell">
                                <div className="period-info">
                                  {p.subjectType === 'Break' || p.subjectType === 'Lunch' ? (
                                    <>
                                      <span className={`period-type-badge ${p.subjectType.toLowerCase()}`}>{p.subjectType}</span>
                                      <span className="period-time-12h">{formatTime12Hour(p.startTime)} - {formatTime12Hour(p.endTime)}</span>
                                    </>
                                  ) : assignedSubjectType ? (
                                    <>
                                      <span className="period-number">Period {p.periodNumber}</span>
                                      <span className="period-time-12h">{formatTime12Hour(p.startTime)} - {formatTime12Hour(p.endTime)}</span>
                                      <span className={`period-type-badge ${assignedSubjectType.toLowerCase()}`}>{assignedSubjectType}</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="period-number">Period {p.periodNumber}</span>
                                      <span className="period-time-12h">{formatTime12Hour(p.startTime)} - {formatTime12Hour(p.endTime)}</span>
                                      <span className="period-type-badge">Unassigned</span>
                                    </>
                                  )}
                                </div>
                              </td>
                              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                                const isHoliday = createHolidays[day]
                                const isBreakOrLunch = p.subjectType === 'Break' || p.subjectType === 'Lunch'

                                // Get currently assigned for this cell
                                const isOptionalMode = assignedSubjectType === 'Optional'

                                // Filter available subjects - hide ones used in OTHER periods
                                const availableForThisCell = availableCreateSubjects.filter(s => !otherUsedSubjects.has(s.name))

                                return (
                                  <td key={day} className={`subject-cell ${isHoliday ? 'holiday' : ''} ${isBreakOrLunch ? 'break-cell' : ''}`}>
                                    {isHoliday ? (
                                      <span className="holiday-label">🏖️ Holiday</span>
                                    ) : isBreakOrLunch ? (
                                      <span className="break-label">{p.subjectType}</span>
                                    ) : isOptionalMode ? (
                                      // Optional: Multiple dropdowns for optional subjects - SAME for all days (whole week)
                                      <div className="optional-dropdowns-container">
                                        {(() => {
                                          // Get currently selected optional subjects (same for all days)
                                          const weekAssignments = (p.daySpecificAssignments?.['Sunday'] as string[]) || []
                                          // Filter to only show optional subjects
                                          const optionalOnly = availableForThisCell.filter(s => s.type === 'Optional')

                                          return (
                                            <>
                                              {/* Render dropdown for each selected optional subject + one empty */}
                                              {[...weekAssignments, ''].map((assignedSubject, dropdownIdx) => (
                                                <select
                                                  key={dropdownIdx}
                                                  className="subject-select optional-mode"
                                                  value={assignedSubject}
                                                  onChange={(e) => {
                                                    const next = [...createPeriods]
                                                    const newValue = e.target.value

                                                    // Build new assignments array
                                                    let newAssignments: string[]
                                                    if (newValue === '') {
                                                      // Remove this dropdown's value
                                                      newAssignments = weekAssignments.filter((_, i) => i !== dropdownIdx)
                                                    } else if (dropdownIdx < weekAssignments.length) {
                                                      // Update existing
                                                      newAssignments = weekAssignments.map((s, i) => i === dropdownIdx ? newValue : s)
                                                    } else {
                                                      // Add new
                                                      newAssignments = [...weekAssignments, newValue]
                                                    }

                                                    // Remove duplicates
                                                    newAssignments = Array.from(new Set(newAssignments))

                                                    // Apply to ALL days (whole week)
                                                    const updatedDaySpecific: Record<string, string[]> = {}
                                                    ;['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach(d => {
                                                      updatedDaySpecific[d] = newAssignments
                                                    })

                                                    next[pIdx] = {
                                                      ...p,
                                                      daySpecificAssignments: updatedDaySpecific,
                                                      subjects: newAssignments
                                                    }
                                                    setCreatePeriods(next)
                                                  }}
                                                >
                                                  <option value="">
                                                    {dropdownIdx < weekAssignments.length ? '- Remove -' : '- Add Optional Subject -'}
                                                  </option>
                                                  {optionalOnly.map(s => (
                                                    <option key={s.name} value={s.name}>{s.name}</option>
                                                  ))}
                                                </select>
                                              ))}
                                            </>
                                          )
                                        })()}
                                      </div>
                                    ) : (
                                      // Single select for Primary and Minor - grouped by type
                                      <select
                                        className="subject-select"
                                        value={p.daySpecificAssignments?.[day] || p.subjects[0] || ''}
                                        onChange={(e) => {
                                          const selectedSubject = availableCreateSubjects.find(s => s.name === e.target.value)
                                          if (!selectedSubject) return

                                          const next = [...createPeriods]

                                          if (selectedSubject.type === 'Primary') {
                                            // Primary: Same for all days
                                            next[pIdx] = {
                                              ...p,
                                              subjects: [e.target.value],
                                              subjectType: 'Primary',
                                              applyMode: 'weekly',
                                              daySpecificAssignments: {}
                                            }
                                          } else if (selectedSubject.type === 'Minor') {
                                            // Minor: Different per day
                                            const updatedAssignments = {
                                              ...(p.daySpecificAssignments || {}),
                                              [day]: e.target.value
                                            }
                                            const allMinorSubjects = Object.values(updatedAssignments)
                                              .filter((s): s is string => typeof s === 'string' && Boolean(s))
                                            next[pIdx] = {
                                              ...p,
                                              subjects: Array.from(new Set(allMinorSubjects)),
                                              subjectType: 'Minor',
                                              applyMode: 'daily',
                                              daySpecificAssignments: updatedAssignments
                                            }
                                          } else if (selectedSubject.type === 'Optional') {
                                            // Optional: Same for whole week (all days)
                                            const weekAssignments: Record<string, string[]> = {}
                                            ;['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach(d => {
                                              weekAssignments[d] = [e.target.value]
                                            })
                                            next[pIdx] = {
                                              ...p,
                                              subjects: [e.target.value],
                                              subjectType: 'Optional',
                                              applyMode: 'multiple',
                                              daySpecificAssignments: weekAssignments
                                            }
                                          }
                                          setCreatePeriods(next)
                                        }}
                                      >
                                        <option value="">- Select Subject -</option>
                                        <optgroup label="Primary Subjects">
                                          {availableForThisCell.filter(s => s.type === 'Primary').map(s => (
                                            <option key={s.name} value={s.name}>{s.name}</option>
                                          ))}
                                        </optgroup>
                                        <optgroup label="Minor Subjects">
                                          {availableForThisCell.filter(s => s.type === 'Minor').map(s => (
                                            <option key={s.name} value={s.name}>{s.name}</option>
                                          ))}
                                        </optgroup>
                                        <optgroup label="Optional Subjects">
                                          {availableForThisCell.filter(s => s.type === 'Optional').map(s => (
                                            <option key={s.name} value={s.name}>{s.name}</option>
                                          ))}
                                        </optgroup>
                                      </select>
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          )
                        })
                      })()}
                    </tbody>
                  </table>
                </div>

                {createPeriods.some(p => {
                  if (p.subjectType === 'Break' || p.subjectType === 'Lunch') return false;
                  if (p.applyMode === 'weekly') return p.subjects.length === 0;
                  // For daily/multiple modes
                  return !Object.values(p.daySpecificAssignments || {}).some(s => {
                    if (Array.isArray(s)) return s.some(item => item && item.trim() !== '');
                    return s && s.trim() !== '';
                  });
                }) && (
                  <div className="create-warning">
                    Some periods don&apos;t have subjects assigned. Please assign subjects before saving.
                  </div>
                )}

                <div className="create-actions">
                  <button
                    type="button"
                    className="create-btn-back"
                    onClick={() => setCreateStep(1)}
                    disabled={isCreateLoading}
                  >
                    Back to Config
                  </button>
                  <button
                    type="button"
                    className="create-btn-save"
                    onClick={handleCreateSave}
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
                    className={updateClassValue}
                    onGenerate={fetchExistingRoutine}
                    onAcademicYearChange={(year) => {
                      setUpdateAcademicYear(year)
                      setUpdateNotFoundMessage(null)
                    }}
                    onClassChange={(cls) => {
                      setUpdateClassValue(cls)
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
