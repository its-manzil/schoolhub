'use client'

import { useEffect, useCallback, useMemo, useState } from 'react'
import { adToBs } from '@sbmdkl/nepali-date-converter'
import AcademicNavbar from '../components/AcademicNavbar'
import '../academic.css'
import './routine.css'

type DayKey = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'

type PeriodType = 'subject' | 'break'

interface Subject {
  id: string
  name: string
  type: 'primary' | 'minor' | 'optional'
  className: string
  academicYear: string
}

interface RoutinePeriod {
  day: DayKey
  startTime: string
  endTime: string
  type: PeriodType
  subjectId?: string
  subjectName?: string
  subjectType?: 'primary' | 'minor' | 'optional'
  breakType?: 'short' | 'lunch'
  teacherId?: string
}

interface TeacherOption {
  _id: string
  name: string
  teacherId?: string
}

const CLASS_OPTIONS = [
  { value: 'N', label: 'Nursery' },
  { value: 'LKG', label: 'LKG' },
  { value: 'UKG', label: 'UKG' },
  { value: '01', label: 'Class 1' },
  { value: '02', label: 'Class 2' },
  { value: '03', label: 'Class 3' },
  { value: '04', label: 'Class 4' },
  { value: '05', label: 'Class 5' },
  { value: '06', label: 'Class 6' },
  { value: '07', label: 'Class 7' },
  { value: '08', label: 'Class 8' },
  { value: '09', label: 'Class 9' },
  { value: '10', label: 'Class 10' },
  { value: '11', label: 'Class 11' },
  { value: '12', label: 'Class 12' }
]

const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' }
]

const BS_ACADEMIC_YEAR_OPTIONS = [
  '2083-2084', '2084-2085', '2085-2086', '2086-2087', '2087-2088',
  '2088-2089', '2089-2090', '2090-2091', '2091-2092', '2092-2093',
  '2093-2094', '2094-2095', '2095-2096', '2096-2097', '2097-2098',
  '2098-2099', '2099-2100'
]

const BS_YEAR_OPTIONS = [
  '2083', '2084', '2086', '2087', '2088', '2089', '2090',
  '2091', '2092', '2093', '2094', '2095', '2096', '2097',
  '2098', '2099', '2100'
]

const BS_MONTH_OPTIONS = [
  { value: '01', label: 'Baisakh' }, { value: '02', label: 'Jestha' },
  { value: '03', label: 'Ashadh' }, { value: '04', label: 'Shrawan' },
  { value: '05', label: 'Bhadra' }, { value: '06', label: 'Ashwin' },
  { value: '07', label: 'Kartik' }, { value: '08', label: 'Mangsir' },
  { value: '09', label: 'Poush' }, { value: '10', label: 'Magh' },
  { value: '11', label: 'Falgun' }, { value: '12', label: 'Chaitra' }
]

const BS_DAY_OPTIONS = Array.from({ length: 32 }, (_, i) => String(i + 1).padStart(2, '0'))

function hasOverlap(periods: RoutinePeriod[], candidate: RoutinePeriod) {
  const sameDay = periods.filter(p => p.day === candidate.day)
  for (const p of sameDay) {
    const overlapsInTime = candidate.startTime < p.endTime && candidate.endTime > p.startTime
    if (!overlapsInTime) continue
    const bothOptional =
      candidate.type === 'subject' && candidate.subjectType === 'optional' &&
      p.type === 'subject' && p.subjectType === 'optional'
    if (bothOptional) continue
    return true
  }
  return false
}

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
  const [selectedClass, setSelectedClass] = useState<string>('N')
  const [viewAcademicYearBs, setViewAcademicYearBs] = useState<string>('')
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('')

  const [routinePeriods, setRoutinePeriods] = useState<RoutinePeriod[]>([])
  const [effectiveFromBs, setEffectiveFromBs] = useState<string>('')
  const [loadedAcademicYearBs, setLoadedAcademicYearBs] = useState<string>('')

  const [editAcademicYearBs, setEditAcademicYearBs] = useState<string>('')
  const [editEffectiveFromBs, setEditEffectiveFromBs] = useState<string>('')
  const [editEffectiveYearBs, setEditEffectiveYearBs] = useState<string>('')
  const [editEffectiveMonthBs, setEditEffectiveMonthBs] = useState<string>('')
  const [editEffectiveDayBs, setEditEffectiveDayBs] = useState<string>('')

  // Subject selection states
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [subjectDays, setSubjectDays] = useState<DayKey[]>([])
  const [subjectStartTime, setSubjectStartTime] = useState<string>('')
  const [subjectEndTime, setSubjectEndTime] = useState<string>('')

  // Break states
  const [breakType, setBreakType] = useState<'short' | 'lunch'>('short')
  const [breakDays, setBreakDays] = useState<DayKey[]>([])
  const [breakStartTime, setBreakStartTime] = useState<string>('')
  const [breakEndTime, setBreakEndTime] = useState<string>('')

  // Select all functionality
  const [selectAllSubjects, setSelectAllSubjects] = useState(false)
  const [selectAllBreaks, setSelectAllBreaks] = useState(false)

  // Print modal state
  const [showPrintModal, setShowPrintModal] = useState(false)

  // Teacher states
  const [teachers, setTeachers] = useState<TeacherOption[]>([])
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false)
  const [teachersError, setTeachersError] = useState<string | null>(null)
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [teacherSearch, setTeacherSearch] = useState('')

  // Edit states
  const [editingPeriodIndex, setEditingPeriodIndex] = useState<number | null>(null)
  const [editPeriodDay, setEditPeriodDay] = useState<DayKey>('sunday')
  const [editPeriodType, setEditPeriodType] = useState<PeriodType>('subject')
  const [editPeriodStartTime, setEditPeriodStartTime] = useState<string>('')
  const [editPeriodEndTime, setEditPeriodEndTime] = useState<string>('')
  const [editPeriodSubjectId, setEditPeriodSubjectId] = useState<string>('')
  const [editPeriodBreakType, setEditPeriodBreakType] = useState<'short' | 'lunch'>('short')

  const [currentBsDateTime, setCurrentBsDateTime] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const updateEffectiveFromBs = (year: string, month: string, day: string) => {
    setEditEffectiveYearBs(year)
    setEditEffectiveMonthBs(month)
    setEditEffectiveDayBs(day)
    if (year && month && day) setEditEffectiveFromBs(`${year}/${month}/${day}`)
    else setEditEffectiveFromBs('')
  }

  const fetchSubjects = useCallback(async () => {
    if (!selectedClass || !selectedAcademicYear) return
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const params = new URLSearchParams()
      params.set('className', selectedClass)
      params.set('academicYear', selectedAcademicYear)

      const response = await fetch(
        `http://localhost:2056/api/academic/subjects?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const data = await response.json()
      if (response.ok && data.success) {
        setSubjects(Array.isArray(data.data) ? data.data : [])
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err)
    }
  }, [selectedClass, selectedAcademicYear])

  const fetchRoutine = useCallback(async () => {
    try {
      setIsLoading(true); setError(null)
      const token = localStorage.getItem('token')
      if (!token) { setError('Not authenticated'); setIsLoading(false); return }
      const params = new URLSearchParams()
      params.set('className', selectedClass)
      if (viewAcademicYearBs.trim()) params.set('academicYearBs', viewAcademicYearBs.trim())
      const response = await fetch(
        `http://localhost:2056/api/academic/subjects/routines?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await response.json()
      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to fetch routine')
        setRoutinePeriods([]); setEffectiveFromBs(''); setLoadedAcademicYearBs('')
        updateEffectiveFromBs('', '', ''); setIsLoading(false); return
      }
      if (!data.data) {
        setRoutinePeriods([]); setEffectiveFromBs(''); setLoadedAcademicYearBs('')
        updateEffectiveFromBs('', '', ''); setIsLoading(false); return
      }
      const routine = data.data as {
        academicYearBs?: string
        effectiveFromBs?: string
        periods?: RoutinePeriod[]
      }
      setRoutinePeriods(Array.isArray(routine.periods) ? routine.periods : [])
      setEffectiveFromBs(routine.effectiveFromBs || '')
      setLoadedAcademicYearBs(routine.academicYearBs || '')
      setEditAcademicYearBs(routine.academicYearBs || '')
      if (routine.effectiveFromBs) {
        const parts = routine.effectiveFromBs.split('/')
        if (parts.length === 3) updateEffectiveFromBs(parts[0], parts[1], parts[2])
        else updateEffectiveFromBs('', '', '')
      } else {
        updateEffectiveFromBs('', '', '')
      }
      setIsLoading(false)
    } catch {
      setError('Failed to fetch routine')
      setRoutinePeriods([]); setEffectiveFromBs(''); setLoadedAcademicYearBs('')
      updateEffectiveFromBs('', '', ''); setIsLoading(false)
    }
  }, [selectedClass, viewAcademicYearBs])

  useEffect(() => {
    const updateDateTime = () => {
      try {
        const now = new Date()
        const dateFormatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Kathmandu', year: 'numeric', month: '2-digit', day: '2-digit'
        })
        const timeFormatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kathmandu', hour: 'numeric', minute: '2-digit',
          second: '2-digit', hour12: true
        })
        const adDate = dateFormatter.format(now)
        const bsDate = adToBs(adDate)
        setCurrentBsDateTime(`${bsDate} ${timeFormatter.format(now)}`)
      } catch {
        setCurrentBsDateTime(new Intl.DateTimeFormat('en-US', {
          hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
        }).format(new Date()))
      }
    }
    updateDateTime()
    const id = setInterval(updateDateTime, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  useEffect(() => {
    fetchTeachers()
  }, [])

  useEffect(() => {
    fetchRoutine()
  }, [fetchRoutine])

  const fetchTeachers = async () => {
    try {
      setIsLoadingTeachers(true)
      setTeachersError(null)
      const token = localStorage.getItem('token')
      if (!token) { setIsLoadingTeachers(false); return }
      const response = await fetch('http://localhost:2056/api/teachers', {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        setTeachersError(data.message || 'Failed to load teachers')
        setIsLoadingTeachers(false); return
      }
      const list: TeacherOption[] = Array.isArray(data.data) ? data.data : []
      list.sort((a, b) => (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase()))
      setTeachers(list)
      setIsLoadingTeachers(false)
    } catch {
      setTeachersError('Failed to load teachers')
      setIsLoadingTeachers(false)
    }
  }

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

  const toggleDayInList = (list: DayKey[], day: DayKey) =>
    list.includes(day) ? list.filter(d => d !== day) : [...list, day]

  const validateTimeRange = (start: string, end: string) => {
    if (!start || !end) { setError('Start time and end time are required'); return false }
    if (start >= end) { setError('Start time must be before end time'); return false }
    return true
  }

  const addSubjectPeriod = () => {
    setError(null)
    if (!selectedSubjectId) { setError('Select a subject'); return }
    if (subjectDays.length === 0) { setError('Select at least one day'); return }
    if (!validateTimeRange(subjectStartTime, subjectEndTime)) return

    const subject = subjects.find(s => s.id === selectedSubjectId)
    if (!subject) { setError('Subject not found'); return }

    const newPeriods: RoutinePeriod[] = []
    subjectDays.forEach(day => {
      const candidate: RoutinePeriod = {
        day, 
        startTime: subjectStartTime, 
        endTime: subjectEndTime,
        type: 'subject', 
        subjectId: subject.id,
        subjectName: subject.name,
        subjectType: subject.type,
        teacherId: teacherId || undefined
      }
      if (!hasOverlap(routinePeriods, candidate)) newPeriods.push(candidate)
    })

    if (newPeriods.length === 0) { 
      setError('Subject periods overlap with existing routine'); return 
    }
    setRoutinePeriods(prev => [...prev, ...newPeriods])
    setSelectedSubjectId('')
    setSubjectDays([])
    setSubjectStartTime('')
    setSubjectEndTime('')
    setTeacherId(null)
    setTeacherSearch('')
  }

  const addBreakPeriods = () => {
    setError(null)
    if (breakDays.length === 0) { setError('Select at least one day for break'); return }
    if (!validateTimeRange(breakStartTime, breakEndTime)) return
    const newPeriods: RoutinePeriod[] = []
    breakDays.forEach(day => {
      const candidate: RoutinePeriod = {
        day, startTime: breakStartTime, endTime: breakEndTime, type: 'break', breakType
      }
      if (!hasOverlap(routinePeriods, candidate)) newPeriods.push(candidate)
    })
    if (newPeriods.length === 0) { setError('New break overlaps with existing routine'); return }
    setRoutinePeriods(prev => [...prev, ...newPeriods])
    setBreakDays([])
    setBreakStartTime('')
    setBreakEndTime('')
  }

  const startEditPeriod = (index: number) => {
    const period = routinePeriods[index]
    if (!period) return
    setEditingPeriodIndex(index)
    setEditPeriodDay(period.day)
    setEditPeriodType(period.type)
    setEditPeriodStartTime(period.startTime)
    setEditPeriodEndTime(period.endTime)
    setEditPeriodSubjectId(period.subjectId || '')
    setEditPeriodBreakType(period.breakType || 'short')
  }

  const cancelEditPeriod = () => setEditingPeriodIndex(null)

  const applyEditPeriod = () => {
    if (editingPeriodIndex === null) return
    if (!validateTimeRange(editPeriodStartTime, editPeriodEndTime)) return
    const original = routinePeriods[editingPeriodIndex]
    if (!original) return
    const updated: RoutinePeriod = {
      ...original, day: editPeriodDay,
      startTime: editPeriodStartTime, endTime: editPeriodEndTime, type: editPeriodType
    }
    if (editPeriodType === 'subject') {
      if (!editPeriodSubjectId) { setError('Select subject for period'); return }
      const subject = subjects.find(s => s.id === editPeriodSubjectId)
      if (!subject) { setError('Subject not found'); return }
      updated.subjectId = subject.id
      updated.subjectName = subject.name
      updated.subjectType = subject.type
      delete updated.breakType
    } else {
      updated.breakType = editPeriodBreakType
      delete updated.subjectId
      delete updated.subjectName
      delete updated.subjectType
    }
    const otherPeriods = routinePeriods.filter((_, i) => i !== editingPeriodIndex)
    if (hasOverlap(otherPeriods, updated)) { setError('Updated period overlaps with existing routine'); return }
    setRoutinePeriods(prev => prev.map((item, i) => i === editingPeriodIndex ? updated : item))
    setEditingPeriodIndex(null)
  }

  const removeEditingPeriod = () => {
    if (editingPeriodIndex === null) return
    setRoutinePeriods(prev => prev.filter((_, i) => i !== editingPeriodIndex))
    setEditingPeriodIndex(null)
  }

  const validateAllPeriods = () => {
    const byDay: { [key in DayKey]?: RoutinePeriod[] } = {}
    routinePeriods.forEach(p => { byDay[p.day] = [...(byDay[p.day] || []), p] })
    for (const key of Object.keys(byDay) as DayKey[]) {
      const sorted = (byDay[key] || []).slice().sort((a, b) => a.startTime.localeCompare(b.startTime))
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1]; const curr = sorted[i]
        if (curr.startTime < prev.endTime) {
          const bothOptional =
            curr.type === 'subject' && curr.subjectType === 'optional' &&
            prev.type === 'subject' && prev.subjectType === 'optional'
          if (!bothOptional) { setError('Routine has overlapping periods'); return false }
        }
      }
    }
    setError(null); return true
  }

  const handleSaveRoutine = async () => {
    setMessage(null)
    if (!selectedClass) { setError('Select class'); return }
    if (!editAcademicYearBs.trim()) { setError('Enter academic year (B.S.)'); return }
    if (!validateAllPeriods()) return
    try {
      setIsSaving(true); setError(null)
      const token = localStorage.getItem('token')
      if (!token) { setError('Not authenticated'); setIsSaving(false); return }
      const response = await fetch('http://localhost:2056/api/academic/subjects/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          className: selectedClass,
          academicYearBs: editAcademicYearBs.trim(),
          effectiveFromBs: editEffectiveFromBs.trim(),
          periods: routinePeriods
        })
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to save routine')
        setIsSaving(false); return
      }
      setLoadedAcademicYearBs(editAcademicYearBs.trim())
      setEffectiveFromBs(editEffectiveFromBs.trim())
      if (data.data?.periods && Array.isArray(data.data.periods)) {
        setRoutinePeriods(data.data.periods)
      }
      setMessage('Routine saved successfully')
      setIsSaving(false)
    } catch {
      setError('Failed to save routine'); setIsSaving(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'primary': return 'subjects-type-primary'
      case 'minor': return 'subjects-type-minor'
      case 'optional': return 'subjects-type-optional'
      default: return 'subjects-type-primary'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'primary': return 'Primary'
      case 'minor': return 'Minor'
      case 'optional': return 'Optional'
      default: return 'Primary'
    }
  }

  return (
    <div className="academic-layout">
      <AcademicNavbar />
      <main className="academic-main">
        <header className="academic-header">
          <div className="academic-header-left">
            <h1 className="title-text">Class Routine Management</h1>
            <p className="body-text">
              Create and manage class-wise routines using subjects from the Subjects section.
            </p>
          </div>
          <div className="academic-header-right">
            <div className="subjects-datetime">
              <div className="small-text">Current B.S. date and time (Nepal)</div>
              <div className="body-text" style={{ fontWeight: 600 }}>
                {currentBsDateTime || 'Loading...'}
              </div>
            </div>
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

        {error && <div className="academic-message academic-message-error">{error}</div>}
        {message && <div className="academic-message academic-message-success">{message}</div>}

        {/* Class and Academic Year Selection */}
        <section className="card">
          <div className="academic-form">
            <div className="academic-form-row">
              <label>
                Class
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                  {CLASS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
              <label>
                Academic Year
                <select 
                  value={selectedAcademicYear} 
                  onChange={e => setSelectedAcademicYear(e.target.value)}
                >
                  <option value="">Select Academic Year</option>
                  {BS_ACADEMIC_YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </label>
              <label>
                Academic Year (B.S.) for view
                <select value={viewAcademicYearBs} onChange={e => setViewAcademicYearBs(e.target.value)}>
                  <option value="">Latest</option>
                  {BS_ACADEMIC_YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </label>
              <div>
                <div className="small-text">Loaded academic year (B.S.): {loadedAcademicYearBs || 'Not set'}</div>
                <div className="small-text">Effective from (B.S.): {effectiveFromBs || 'Not set'}</div>
              </div>
            </div>
          </div>
        </section>

        {/* View Routine */}
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
          
          {isLoading ? (
            <div className="academic-loading-container">
              <div className="academic-spinner" />
              <p>Loading routine...</p>
            </div>
          ) : routinePeriods.length === 0 ? (
            <div className="academic-empty-state">
              <p>Routine not scheduled yet for this class.</p>
              <p>Use the forms below to create the routine.</p>
            </div>
          ) : (
            <div className="subjects-table-wrapper">
              <table className="subjects-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    {timeSlots.map(slot => (
                      <th key={`${slot.startTime}-${slot.endTime}`}>
                        <span className="subjects-time-start">{formatTime12Hour(slot.startTime)}</span>
                        <span className="subjects-time-sep">–</span>
                        <span className="subjects-time-end">{formatTime12Hour(slot.endTime)}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeDays.map(day => (
                    <tr key={day.key}>
                      <td className="subjects-day-label-cell">
                        <span className="body-text" style={{ fontWeight: 600 }}>{day.label}</span>
                        <span className="small-text">{day.short}</span>
                      </td>
                      {timeSlots.map(slot => {
                        const cellPeriods = routinePeriods.filter(
                          p => p.day === day.key &&
                            p.startTime === slot.startTime &&
                            p.endTime === slot.endTime
                        )
                        if (cellPeriods.length === 0) {
                          return (
                            <td key={`${slot.startTime}-${slot.endTime}`} className="subjects-empty-cell" />
                          )
                        }
                        return (
                          <td key={`${slot.startTime}-${slot.endTime}`} className="subjects-period-cell">
                            <div className="subjects-period-list">
                              {cellPeriods.map((period, idx) => {
                                const routineIndex = routinePeriods.indexOf(period)
                                const teacher = period.teacherId &&
                                  teachers.find(t => t._id === period.teacherId)

                                if (period.type === 'break') {
                                  return (
                                    <div key={idx} className="subjects-period-pill subjects-period-break">
                                      <span>
                                        {period.breakType === 'lunch' ? '🍱 Lunch' : '☕ Break'}
                                      </span>
                                      <button
                                        type="button"
                                        className="subjects-action-btn"
                                        onClick={() => startEditPeriod(routineIndex === -1 ? 0 : routineIndex)}
                                      >
                                        Edit
                                      </button>
                                    </div>
                                  )
                                }

                                return (
                                  <div key={idx} className="subjects-period-pill">
                                    <div className="subjects-period-main">
                                      <div className="subjects-period-text">
                                        <span className="subjects-period-name">
                                          {period.subjectName}
                                        </span>
                                        {teacher && (
                                          <span className="subjects-period-teacher">
                                            {teacher.name}
                                            {teacher.teacherId ? ` (${teacher.teacherId})` : ''}
                                          </span>
                                        )}
                                      </div>
                                      <span className={`subjects-type-badge ${getTypeColor(period.subjectType || 'primary')}`}>
                                        {getTypeLabel(period.subjectType || 'primary')}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      className="subjects-action-btn"
                                      onClick={() => startEditPeriod(routineIndex === -1 ? 0 : routineIndex)}
                                    >
                                      Edit
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Create/Edit Routine */}
        <section className="card">
          <h2 className="heading-text">Create/Edit Routine</h2>
          <div className="academic-form">
            <div className="academic-form-row">
              <label>
                Class
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                  {CLASS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
              <label>
                Academic year (B.S.)
                <select value={editAcademicYearBs} onChange={e => setEditAcademicYearBs(e.target.value)}>
                  <option value="">Select academic year</option>
                  {BS_ACADEMIC_YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </label>
              <label>
                Effective from (B.S.)
                <div className="academic-bs-date-row">
                  <select
                    value={editEffectiveYearBs}
                    onChange={e => updateEffectiveFromBs(e.target.value, editEffectiveMonthBs, editEffectiveDayBs)}
                  >
                    <option value="">Year</option>
                    {BS_YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <select
                    value={editEffectiveMonthBs}
                    onChange={e => updateEffectiveFromBs(editEffectiveYearBs, e.target.value, editEffectiveDayBs)}
                  >
                    <option value="">Month</option>
                    {BS_MONTH_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <select
                    value={editEffectiveDayBs}
                    onChange={e => updateEffectiveFromBs(editEffectiveYearBs, editEffectiveMonthBs, e.target.value)}
                  >
                    <option value="">Day</option>
                    {BS_DAY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </label>
            </div>
          </div>

          <div className="academic-section-split">
            {/* Subject Periods */}
            <div className="academic-split-column">
              <h3 className="heading-text">Subject Periods</h3>
              <div className="academic-form">
                <div className="academic-form-row">
                  <label>
                    Select Subject
                    <select
                      value={selectedSubjectId}
                      onChange={e => setSelectedSubjectId(e.target.value)}
                    >
                      <option value="">Select a subject</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name} ({getTypeLabel(subject.type)})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                
                <div className="academic-form-row">
                  <label>
                    Start time
                    <input type="time" value={subjectStartTime} onChange={e => setSubjectStartTime(e.target.value)} />
                  </label>
                  <label>
                    End time
                    <input type="time" value={subjectEndTime} onChange={e => setSubjectEndTime(e.target.value)} />
                  </label>
                </div>

                <div className="academic-form-row">
                  <label>
                    Assign teacher (optional)
                    <div className="subjects-teacher-search">
                      <input
                        type="text"
                        placeholder="Search teacher by name"
                        value={teacherSearch}
                        onChange={e => setTeacherSearch(e.target.value)}
                      />
                    </div>
                  </label>
                </div>

                <div className="subjects-teacher-dropdown">
                  {isLoadingTeachers && (
                    <div className="small-text">Loading teachers...</div>
                  )}
                  {teachersError && (
                    <div className="small-text" style={{ color: 'var(--accent-red)' }}>{teachersError}</div>
                  )}
                  {!isLoadingTeachers && !teachersError && teachers.length > 0 && (
                    <ul className="subjects-teacher-list">
                      {teachers
                        .filter(t => t.name.toLowerCase().includes(teacherSearch.toLowerCase()))
                        .map(teacher => (
                          <li key={teacher._id}>
                            <button
                              type="button"
                              className={`subjects-teacher-option ${teacherId === teacher._id ? 'subjects-teacher-option-selected' : ''}`}
                              onClick={() => {
                                if (teacherId === teacher._id) {
                                  setTeacherId(null)
                                } else {
                                  setTeacherId(teacher._id)
                                  setTeacherSearch(teacher.name)
                                }
                              }}
                            >
                              <span className="body-text">{teacher.name}</span>
                              {teacher.teacherId && (
                                <span className="small-text">{teacher.teacherId}</span>
                              )}
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>

                <div className="academic-form-row">
                  <div>
                    <div className="body-text">Select days</div>
                    <div className="academic-day-selector-with-select-all">
                      <label className="select-all-checkbox">
                        <input
                          type="checkbox"
                          checked={selectAllSubjects}
                          onChange={(e) => {
                            const checked = e.target.checked
                            setSelectAllSubjects(checked)
                            setSubjectDays(checked ? DAYS.map(d => d.key) : [])
                          }}
                        />
                        Select All
                      </label>
                      <div className="academic-day-selector">
                        {DAYS.map(day => (
                          <label key={day.key}>
                            <input
                              type="checkbox"
                              checked={subjectDays.includes(day.key)}
                              onChange={() => setSubjectDays(toggleDayInList(subjectDays, day.key))}
                            />
                            {day.short}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="academic-form-actions">
                  <button type="button" className="btn-primary" onClick={addSubjectPeriod}>
                    Add Subject to Routine
                  </button>
                </div>
              </div>
            </div>

            {/* Breaks */}
            <div className="academic-split-column">
              <h3 className="heading-text">Breaks</h3>
              <div className="academic-form">
                <div className="academic-form-row">
                  <label>
                    Break type
                    <select value={breakType} onChange={e => setBreakType(e.target.value as 'short' | 'lunch')}>
                      <option value="short">Short Break</option>
                      <option value="lunch">Lunch Break</option>
                    </select>
                  </label>
                </div>
                
                <div className="academic-form-row">
                  <label>
                    Start time
                    <input type="time" value={breakStartTime} onChange={e => setBreakStartTime(e.target.value)} />
                  </label>
                  <label>
                    End time
                    <input type="time" value={breakEndTime} onChange={e => setBreakEndTime(e.target.value)} />
                  </label>
                </div>
                
                <div className="academic-form-row">
                  <div>
                    <div className="body-text">Select break days</div>
                    <div className="academic-day-selector-with-select-all">
                      <label className="select-all-checkbox">
                        <input
                          type="checkbox"
                          checked={selectAllBreaks}
                          onChange={(e) => {
                            const checked = e.target.checked
                            setSelectAllBreaks(checked)
                            setBreakDays(checked ? DAYS.map(d => d.key) : [])
                          }}
                        />
                        Select All
                      </label>
                      <div className="academic-day-selector">
                        {DAYS.map(day => (
                          <label key={day.key}>
                            <input
                              type="checkbox"
                              checked={breakDays.includes(day.key)}
                              onChange={() => setBreakDays(toggleDayInList(breakDays, day.key))}
                            />
                            {day.short}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="academic-form-actions">
                  <button type="button" className="btn-secondary" onClick={addBreakPeriods}>
                    Add Break to Routine
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Period Panel */}
          {editingPeriodIndex !== null && (
            <div className="subjects-edit-panel card">
              <h3 className="heading-text">Edit Period</h3>
              <div className="academic-form">
                <div className="academic-form-row">
                  <label>
                    Day
                    <select value={editPeriodDay} onChange={e => setEditPeriodDay(e.target.value as DayKey)}>
                      {DAYS.map(day => <option key={day.key} value={day.key}>{day.label}</option>)}
                    </select>
                  </label>
                  <label>
                    Type
                    <select value={editPeriodType} onChange={e => setEditPeriodType(e.target.value as PeriodType)}>
                      <option value="subject">Subject</option>
                      <option value="break">Break</option>
                    </select>
                  </label>
                </div>
                
                <div className="academic-form-row">
                  <label>
                    Start time
                    <input type="time" value={editPeriodStartTime} onChange={e => setEditPeriodStartTime(e.target.value)} />
                  </label>
                  <label>
                    End time
                    <input type="time" value={editPeriodEndTime} onChange={e => setEditPeriodEndTime(e.target.value)} />
                  </label>
                </div>
                
                {editPeriodType === 'subject' && (
                  <div className="academic-form-row">
                    <label>
                      Subject
                      <select value={editPeriodSubjectId} onChange={e => setEditPeriodSubjectId(e.target.value)}>
                        <option value="">Select subject</option>
                        {subjects.map(subject => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name} ({getTypeLabel(subject.type)})
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
                
                {editPeriodType === 'break' && (
                  <div className="academic-form-row">
                    <label>
                      Break type
                      <select
                        value={editPeriodBreakType}
                        onChange={e => setEditPeriodBreakType(e.target.value as 'short' | 'lunch')}
                      >
                        <option value="short">Short Break</option>
                        <option value="lunch">Lunch Break</option>
                      </select>
                    </label>
                  </div>
                )}
                
                <div className="academic-form-actions">
                  <button type="button" className="btn-secondary" onClick={cancelEditPeriod}>Cancel</button>
                  <button type="button" className="btn-secondary subjects-delete-btn" onClick={removeEditingPeriod}>Remove</button>
                  <button type="button" className="btn-primary" onClick={applyEditPeriod}>Save Changes</button>
                </div>
              </div>
            </div>
          )}
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
                  onClick={() => {
                    // Simple PDF generation using window.print
                    window.print()
                  }}
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
