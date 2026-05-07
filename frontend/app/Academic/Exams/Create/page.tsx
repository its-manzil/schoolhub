'use client'

import { useEffect, useRef, useState } from 'react'
import AcademicNavbar from '../../components/AcademicNavbar'
import '../exam.css'
import { toBS, formatBSDateWithMonth } from '@/app/utils/dateConverter'

interface ExamRoutineItem {
  date: string
  subject: string
  startTime: string
  endTime: string
}

interface Exam {
  _id: string
  name: string
  term: string
  academicYear: string
  className: string
  startDate: string | null
  endDate: string | null
  routine: ExamRoutineItem[]
  schoolId: number
  createdAt: string
  updatedAt: string
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

export default function CreateExamPage() {
  const [newExamTerm, setNewExamTerm] = useState('')
  const [newExamYear, setNewExamYear] = useState('')
  const [newExamStartDate, setNewExamStartDate] = useState('')
  const [newExamEndDate, setNewExamEndDate] = useState('')
  const [exams, setExams] = useState<Exam[]>([])
  const [routine, setRoutine] = useState<ExamRoutineItem[]>([])
  const [isSavingExam, setIsSavingExam] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false)
  const [selectedClassForRoutine, setSelectedClassForRoutine] = useState<string>('')
  const [isRoutineClassDropdownOpen, setIsRoutineClassDropdownOpen] = useState(false)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [isRoutinePreviewOpen, setIsRoutinePreviewOpen] = useState(false)
  const [isRoutineEnabled, setIsRoutineEnabled] = useState(false)
  const [routineAvailableClasses, setRoutineAvailableClasses] = useState<string[]>([])
  const [admitCardExam, setAdmitCardExam] = useState<Exam | null>(null)
  const [admitCardClass, setAdmitCardClass] = useState<string>('')
  const [admitCardName, setAdmitCardName] = useState<string>('')
  const [admitCardRollNo, setAdmitCardRollNo] = useState<string>('')
  const [admitCardSection, setAdmitCardSection] = useState<string>('')
  const [admitCardSymbolNo, setAdmitCardSymbolNo] = useState<string>('')
  const [isAdmitCardClassDropdownOpen, setIsAdmitCardClassDropdownOpen] = useState(false)
  const [isAdmitCardPreviewOpen, setIsAdmitCardPreviewOpen] = useState(false)
  const classDropdownRef = useRef<HTMLDivElement>(null)
  const routineClassDropdownRef = useRef<HTMLDivElement>(null)
  const admitCardClassDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (classDropdownRef.current && !classDropdownRef.current.contains(e.target as Node)) {
        setIsClassDropdownOpen(false)
      }
    }
    if (isClassDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isClassDropdownOpen])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (routineClassDropdownRef.current && !routineClassDropdownRef.current.contains(e.target as Node)) {
        setIsRoutineClassDropdownOpen(false)
      }
    }
    if (isRoutineClassDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isRoutineClassDropdownOpen])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (admitCardClassDropdownRef.current && !admitCardClassDropdownRef.current.contains(e.target as Node)) {
        setIsAdmitCardClassDropdownOpen(false)
      }
    }
    if (isAdmitCardClassDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isAdmitCardClassDropdownOpen])

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('token')
        if (!token) {
          setIsLoading(false)
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/exams`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setExams(data.data || [])
        }

        setIsLoading(false)
      } catch {
        setIsLoading(false)
      }
    }

    fetchExams()
  }, [])

  const handleAddRoutineRow = () => {
    setRoutine(prev => [...prev, { date: '', subject: '', startTime: '', endTime: '' }])
  }

  const handleDeleteRoutineRow = (index: number) => {
    setRoutine(prev => prev.filter((_, i) => i !== index))
  }

  const handleRoutineChange = (index: number, field: keyof ExamRoutineItem, value: string) => {
    setRoutine(prev => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const handleSaveRoutine = async () => {
    if (!selectedClassForRoutine) {
      setError('Please select a class for routine')
      return
    }

    if (routine.length === 0) {
      setError('Please add at least one routine item')
      return
    }

    try {
      setIsSavingExam(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Not authenticated')
        setIsSavingExam(false)
        return
      }

      // Find the exam for the selected class
      const examToUpdate = exams.find(e => e.className === selectedClassForRoutine)
      if (!examToUpdate) {
        setError('Exam not found for selected class')
        setIsSavingExam(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/exams/${examToUpdate._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(examToUpdate)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Update the exam in the state
        setExams(prev => prev.map(e => e._id === examToUpdate._id ? data.data : e))
        setSelectedExam(data.data)
        setError(null)
      } else {
        setError('Failed to save routine')
      }

      setIsSavingExam(false)
    } catch {
      setError('Failed to save routine')
      setIsSavingExam(false)
    }
  }

  const handleCreateExam = async () => {
    if (!newExamTerm || !newExamYear || selectedClasses.length === 0) {
      setError('Fill term, year and class')
      return
    }

    try {
      setIsSavingExam(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Not authenticated')
        setIsSavingExam(false)
        return
      }

      const classesToCreate = selectedClasses

      const createdExams: Exam[] = []

      for (const classValue of classesToCreate) {
        const body = {
          name: `${newExamTerm} - ${newExamYear}`,
          term: newExamTerm,
          academicYear: newExamYear,
          className: classValue,
          startDate: newExamStartDate || null,
          endDate: newExamEndDate || null,
          routine
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/exams`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        })

        const data = await response.json()

        if (response.ok && data.success) {
          createdExams.push(data.data)
        }
      }

      if (createdExams.length === 0) {
        setError('Failed to create exam(s)')
        setIsSavingExam(false)
        return
      }

      setExams(prev => [...createdExams, ...prev])
      setSelectedExam(createdExams[0])
      setIsRoutineEnabled(true)
      setRoutineAvailableClasses(selectedClasses)

      setNewExamTerm('')
      setNewExamYear('')
      setNewExamStartDate('')
      setNewExamEndDate('')
      setRoutine([])
      setError(null)
      setSelectedClasses([])

      setIsSavingExam(false)
    } catch {
      setError('Failed to create exam')
      setIsSavingExam(false)
    }
  }

  return (
    <div className="academic-layout">
      <AcademicNavbar />
      <main className="academic-main">
        <header className="academic-header">
          <div className="academic-header-left">
            <h1 className="academic-page-title">Create Exam</h1>
            <p className="academic-page-subtitle">
              Create a new exam with schedule and routine details.
            </p>
          </div>
        </header>

        {error && <div className="academic-message academic-message-error">{error}</div>}

        {!isRoutinePreviewOpen && !isAdmitCardPreviewOpen ? (
          <div className="academic-single-column">
            <div style={{ marginBottom: '24px' }}>
              <button
                type="button"
                className="academic-btn primary"
                onClick={() => {
                  // TODO: Implement admit card functionality
                  console.log('Admit Card button clicked')
                }}
              >
                Add Admit Card
              </button>
            </div>

            {/* Create Exam Form */}
            <section className="academic-card">
              <h2>Create exam</h2>
              <div className="academic-form">
                <div className="academic-form-row">
                  <label>
                    Term
                    <input
                      type="text"
                      value={newExamTerm}
                      onChange={e => setNewExamTerm(e.target.value)}
                      placeholder="e.g. Mid Term, Final"
                    />
                  </label>
                  <label>
                    Academic year
                    <input
                      type="text"
                      value={newExamYear}
                      onChange={e => setNewExamYear(e.target.value)}
                      placeholder="2024-25"
                    />
                  </label>
                  <label className="academic-class-dropdown-label">
                    Class
                    <div className="academic-class-dropdown" ref={classDropdownRef}>
                      <button 
                        type="button" 
                        className="academic-class-dropdown-trigger"
                        onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                      >
                        {selectedClasses.length === 0 
                          ? 'Select class' 
                          : selectedClasses.length === CLASS_OPTIONS.length 
                            ? 'All Classes' 
                            : selectedClasses.map(v => CLASS_OPTIONS.find(c => c.value === v)?.label || v).join(', ')}
                        <span className="academic-class-dropdown-arrow">▼</span>
                      </button>
                      {isClassDropdownOpen && (
                        <div className="academic-class-dropdown-menu">
                          <label className="academic-class-dropdown-item academic-class-select-all">
                            <input
                              type="checkbox"
                              checked={selectedClasses.length === CLASS_OPTIONS.length}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSelectedClasses(CLASS_OPTIONS.map(c => c.value))
                                } else {
                                  setSelectedClasses([])
                                }
                              }}
                            />
                            Select All Classes
                          </label>
                          <div className="academic-class-dropdown-divider" />
                          {CLASS_OPTIONS.map(option => (
                            <label key={option.value} className="academic-class-dropdown-item">
                              <input
                                type="checkbox"
                                value={option.value}
                                checked={selectedClasses.includes(option.value)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSelectedClasses(prev => [...prev, option.value])
                                  } else {
                                    setSelectedClasses(prev => prev.filter(item => item !== option.value))
                                  }
                                }}
                              />
                              {option.label}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                </div>
                <div className="academic-form-row">
                  <label>
                    Start date
                    <input
                      type="date"
                      value={newExamStartDate}
                      onChange={e => setNewExamStartDate(e.target.value)}
                      placeholder="dd/mm/yyyy"
                    />
                    {newExamStartDate && (
                      <span style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
                        BS: {formatBSDateWithMonth(toBS(newExamStartDate))}
                      </span>
                    )}
                  </label>
                  <label>
                    End date
                    <input
                      type="date"
                      value={newExamEndDate}
                      onChange={e => setNewExamEndDate(e.target.value)}
                      placeholder="dd/mm/yyyy"
                    />
                    {newExamEndDate && (
                      <span style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
                        BS: {formatBSDateWithMonth(toBS(newExamEndDate))}
                      </span>
                    )}
                  </label>
                </div>
                <div className="academic-form-actions">
                  <button
                    type="button"
                    className="academic-btn primary"
                    onClick={handleCreateExam}
                    disabled={isSavingExam}
                  >
                    {isSavingExam ? 'Creating...' : 'Create exam'}
                  </button>
                </div>
              </div>
            </section>

            {/* Routine Section */}
            {isRoutineEnabled && (
              <section className="academic-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0 }}>Routine</h2>
                  {routine.length > 0 && (
                    <button
                      type="button"
                      className="academic-btn primary"
                      onClick={() => {
                        setSelectedExam(exams.find(e => e.className === selectedClassForRoutine) || null)
                        setIsRoutinePreviewOpen(true)
                        setTimeout(() => window.print(), 100)
                      }}
                    >
                      Preview
                    </button>
                  )}
                </div>
                <div className="academic-routine-class-display">
                  <label className="academic-routine-class-label">
                    Class
                    <div className="academic-class-dropdown" ref={routineClassDropdownRef}>
                      <button
                        type="button"
                        className="academic-class-dropdown-trigger"
                        onClick={() => routineAvailableClasses.length > 0 && setIsRoutineClassDropdownOpen(!isRoutineClassDropdownOpen)}
                        disabled={routineAvailableClasses.length === 0}
                      >
                        {selectedClassForRoutine
                          ? CLASS_OPTIONS.find(c => c.value === selectedClassForRoutine)?.label || selectedClassForRoutine
                          : routineAvailableClasses.length === 0
                            ? 'No class selected'
                            : 'Select class for routine'}
                        <span className="academic-class-dropdown-arrow">▼</span>
                      </button>
                      {isRoutineClassDropdownOpen && routineAvailableClasses.length > 0 && (
                        <div className="academic-class-dropdown-menu">
                          {routineAvailableClasses.map(classValue => (
                            <label
                              key={classValue}
                              className="academic-class-dropdown-item"
                              onClick={() => {
                            setSelectedClassForRoutine(classValue)
                            setIsRoutineClassDropdownOpen(false)
                          }}
                        >
                          {CLASS_OPTIONS.find(c => c.value === classValue)?.label || classValue}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </label>
            </div>
            <div className="academic-table-wrapper">
              <table className="academic-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {routine.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="date"
                          value={item.date}
                          onChange={e => handleRoutineChange(index, 'date', e.target.value)}
                        />
                        {item.date && (
                          <div style={{ fontSize: '0.65rem', color: '#10b981', marginTop: '2px' }}>
                            BS: {formatBSDateWithMonth(toBS(item.date))}
                          </div>
                        )}
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.subject}
                          onChange={e => handleRoutineChange(index, 'subject', e.target.value)}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="academic-btn academic-btn-delete"
                          onClick={() => handleDeleteRoutineRow(index)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {routine.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center' }}>
                        No routine items added.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="academic-form-actions">
              <button type="button" className="academic-btn" onClick={handleAddRoutineRow}>
                Add routine row
              </button>
              <button type="button" className="academic-btn primary" onClick={handleSaveRoutine} disabled={isSavingExam}>
                {isSavingExam ? 'Saving...' : 'Save routine'}
              </button>
            </div>
          </section>
          )}

          {/* Admit Card Section */}
          <section className="academic-card">
            <h2>Add Admit Card</h2>
            <div className="academic-form">
              <div className="academic-form-row">
                <label>
                  Select Exam
                  <select
                    value={admitCardExam?._id || ''}
                    onChange={e => {
                      const exam = exams.find(ex => ex._id === e.target.value)
                      setAdmitCardExam(exam || null)
                      setAdmitCardClass(exam?.className || '')
                    }}
                  >
                    <option value="">Select exam</option>
                    {exams.map(exam => (
                      <option key={exam._id} value={exam._id}>
                        {exam.name} - {exam.term} - {CLASS_OPTIONS.find(c => c.value === exam.className)?.label || exam.className}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="academic-class-dropdown-label">
                  Class
                  <div className="academic-class-dropdown" ref={admitCardClassDropdownRef}>
                    <button
                      type="button"
                      className="academic-class-dropdown-trigger"
                      onClick={() => setIsAdmitCardClassDropdownOpen(!isAdmitCardClassDropdownOpen)}
                    >
                      {admitCardClass
                        ? CLASS_OPTIONS.find(c => c.value === admitCardClass)?.label || admitCardClass
                        : 'Select class'}
                      <span className="academic-class-dropdown-arrow">▼</span>
                    </button>
                    {isAdmitCardClassDropdownOpen && (
                      <div className="academic-class-dropdown-menu">
                        {CLASS_OPTIONS.map(classOption => (
                          <label
                            key={classOption.value}
                            className="academic-class-dropdown-item"
                            onClick={() => {
                              setAdmitCardClass(classOption.value)
                              setIsAdmitCardClassDropdownOpen(false)
                            }}
                          >
                            {classOption.label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </label>
              </div>
              <div className="academic-form-row">
                <label>
                  Name
                  <input
                    type="text"
                    value={admitCardName}
                    onChange={e => setAdmitCardName(e.target.value)}
                    placeholder="Enter student name"
                  />
                </label>
                <label>
                  Roll No
                  <input
                    type="text"
                    value={admitCardRollNo}
                    onChange={e => setAdmitCardRollNo(e.target.value)}
                    placeholder="Enter roll number"
                  />
                </label>
              </div>
              <div className="academic-form-row">
                <label>
                  Section
                  <input
                    type="text"
                    value={admitCardSection}
                    onChange={e => setAdmitCardSection(e.target.value)}
                    placeholder="Enter section"
                  />
                </label>
                <label>
                  Symbol No
                  <input
                    type="text"
                    value={admitCardSymbolNo}
                    onChange={e => setAdmitCardSymbolNo(e.target.value)}
                    placeholder="Enter symbol number"
                  />
                </label>
              </div>
              <div className="academic-form-actions">
                <button
                  type="button"
                  className="academic-btn primary"
                  onClick={() => {
                    setIsAdmitCardPreviewOpen(true)
                  }}
                >
                  Generate Admit Card
                </button>
              </div>
            </div>
          </section>

          {/* Existing Exams Section */}
          <section className="academic-card">
            <h2>Existing exams</h2>
            <div className="academic-table-wrapper">
              <table className="academic-table">
                <thead>
                <tr>
                  <th>Term</th>
                  <th>Year</th>
                  <th>Class</th>
                  <th>Period</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center' }}>
                      Loading exams...
                    </td>
                  </tr>
                ) : exams.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center' }}>
                      No exams created yet.
                    </td>
                  </tr>
                ) : (
                  exams.map(exam => (
                    <tr key={exam._id}>
                      <td>{exam.term}</td>
                      <td>{exam.academicYear}</td>
                      <td>{CLASS_OPTIONS.find(c => c.value === exam.className)?.label || exam.className}</td>
                      <td>
                        {exam.startDate ? formatBSDateWithMonth(toBS(exam.startDate)) : '-'} to {exam.endDate ? formatBSDateWithMonth(toBS(exam.endDate)) : '-'}
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>
          </section>
          </div>
        ) : isRoutinePreviewOpen ? (
          /* Routine Preview Container */
          <section className="academic-card academic-exam-detail">
            <div className="academic-exam-detail-actions">
              <button
                type="button"
                className="academic-btn"
                onClick={() => setIsRoutinePreviewOpen(false)}
              >
                Back
              </button>
              <button
                type="button"
                className="academic-btn primary"
                onClick={() => window.print()}
              >
                Print Routine
              </button>
            </div>

            <div id="exam-routine-print" className="academic-routine-print">
              <div className="academic-routine-header">
                <h1 className="academic-routine-school-name">School Hub Academy</h1>
                <h2 className="academic-routine-exam-title">{selectedExam?.name || 'Weekly Routine'}</h2>
                <p className="academic-routine-subtitle">
                  Academic Year: {selectedExam?.academicYear || 'N/A'}
                </p>
                <p className="academic-routine-period">
                  Exam Period: {selectedExam?.startDate ? formatBSDateWithMonth(toBS(selectedExam.startDate)) : 'TBD'} — {selectedExam?.endDate ? formatBSDateWithMonth(toBS(selectedExam.endDate)) : 'TBD'}
                </p>
              </div>

              <div className="academic-routine-table-wrapper">
                <table className="academic-routine-table">
                  <thead>
                    <tr>
                      <th className="academic-routine-day-col">Class</th>
                      <th className="academic-routine-date-col">Sunday</th>
                      <th className="academic-routine-date-col">Monday</th>
                      <th className="academic-routine-date-col">Tuesday</th>
                      <th className="academic-routine-date-col">Wednesday</th>
                      <th className="academic-routine-date-col">Thursday</th>
                      <th className="academic-routine-date-col">Friday</th>
                      <th className="academic-routine-date-col">Saturday</th>
                      <th className="academic-routine-date-col">Sunday</th>
                      <th className="academic-routine-date-col">Monday</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CLASS_OPTIONS.map((classOption) => (
                      <tr key={classOption.value}>
                        <td>{classOption.label}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : (
          /* Admit Card Preview Container */
          <section className="academic-card academic-exam-detail">
            <div className="academic-exam-detail-actions">
              <button
                type="button"
                className="academic-btn"
                onClick={() => setIsAdmitCardPreviewOpen(false)}
              >
                Back
              </button>
              <button
                type="button"
                className="academic-btn primary"
                onClick={() => window.print()}
              >
                Print Admit Card
              </button>
            </div>

            <div id="admit-card-print" className="academic-routine-print">
              <div className="academic-routine-header">
                <h1 className="academic-routine-school-name">School Hub Academy</h1>
                <h2 className="academic-routine-exam-title">Admit Card</h2>
                <p className="academic-routine-subtitle">
                  Exam: {admitCardExam?.name}
                  &nbsp;|&nbsp; Term: {admitCardExam?.term}
                  &nbsp;|&nbsp; Academic Year: {admitCardExam?.academicYear}
                </p>
                <p className="academic-routine-period">
                  Exam Period: {admitCardExam?.startDate ? formatBSDateWithMonth(toBS(admitCardExam.startDate)) : 'TBD'} — {admitCardExam?.endDate ? formatBSDateWithMonth(toBS(admitCardExam.endDate)) : 'TBD'}
                </p>
              </div>

              <div className="academic-routine-table-wrapper">
                <table className="academic-routine-table">
                  <tbody>
                    <tr>
                      <td><strong>Name:</strong></td>
                      <td>{admitCardName || '-'}</td>
                    </tr>
                    <tr>
                      <td><strong>Class:</strong></td>
                      <td>{CLASS_OPTIONS.find(c => c.value === admitCardClass)?.label || admitCardClass || '-'}</td>
                    </tr>
                    <tr>
                      <td><strong>Roll No:</strong></td>
                      <td>{admitCardRollNo || '-'}</td>
                    </tr>
                    <tr>
                      <td><strong>Section:</strong></td>
                      <td>{admitCardSection || '-'}</td>
                    </tr>
                    <tr>
                      <td><strong>Symbol No:</strong></td>
                      <td>{admitCardSymbolNo || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="academic-routine-table-wrapper">
                <h3>Exam Schedule</h3>
                <table className="academic-routine-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Subject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admitCardExam?.routine && admitCardExam.routine.length > 0 ? (
                      admitCardExam.routine.map((item, index) => (
                        <tr key={index}>
                          <td>{item.date ? formatBSDateWithMonth(toBS(item.date)) : '-'}</td>
                          <td>{item.subject || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} style={{ textAlign: 'center' }}>No exam schedule available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="academic-routine-footer">
                <p><strong>Instructions:</strong></p>
                <p>1. Bring this admit card to the examination center.</p>
                <p>2. Students must arrive 15 minutes before the exam start time.</p>
                <p>3. Bring necessary stationery and ID proof.</p>
                <p>4. No electronic devices allowed in the exam hall.</p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
