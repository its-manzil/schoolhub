'use client'

import { useEffect, useMemo, useState } from 'react'
import AcademicNavbar from '../components/AcademicNavbar'
import './exam.css'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface ExamRoutineItem {
  date: string
  subject: string
  startTime: string
  endTime: string
}

interface ExamMarkEntry {
  studentId: string
  studentName: string
  subject: string
  marksObtained: number
  maxMarks: number
  creditHours: number
  verified?: boolean
  locked?: boolean
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
  marks: ExamMarkEntry[]
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

function calculatePercentageAndGpa(entries: ExamMarkEntry[]) {
  if (entries.length === 0) {
    return { percentage: 0, gpa: 0 }
  }

  let totalWeightedMarks = 0
  let totalWeightedMax = 0

  entries.forEach(entry => {
    const weight = entry.creditHours || 1
    totalWeightedMarks += entry.marksObtained * weight
    totalWeightedMax += entry.maxMarks * weight
  })

  if (totalWeightedMax === 0) {
    return { percentage: 0, gpa: 0 }
  }

  const percentage = (totalWeightedMarks / totalWeightedMax) * 100

  let gpa = 0
  if (percentage >= 90) gpa = 4.0
  else if (percentage >= 80) gpa = 3.6
  else if (percentage >= 70) gpa = 3.2
  else if (percentage >= 60) gpa = 2.8
  else if (percentage >= 50) gpa = 2.4
  else if (percentage >= 40) gpa = 2.0
  else gpa = 0

  return { percentage, gpa }
}

export default function AcademicExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newExamName, setNewExamName] = useState('')
  const [newExamTerm, setNewExamTerm] = useState('')
  const [newExamYear, setNewExamYear] = useState('')
  const [newExamClass, setNewExamClass] = useState('')
  const [newExamStartDate, setNewExamStartDate] = useState('')
  const [newExamEndDate, setNewExamEndDate] = useState('')
  const [routine, setRoutine] = useState<ExamRoutineItem[]>([])

  const [marksDraft, setMarksDraft] = useState<ExamMarkEntry[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [isSavingExam, setIsSavingExam] = useState(false)
  const [isSavingMarks, setIsSavingMarks] = useState(false)

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const token = localStorage.getItem('token')
        if (!token) {
          setError('Not authenticated')
          setIsLoading(false)
          return
        }

        const response = await fetch('http://localhost:2056/api/academic/exams', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          setError(data.message || 'Failed to fetch exams')
          setIsLoading(false)
          return
        }

        const fetched: Exam[] = data.data || []
        setExams(fetched)

        if (fetched.length > 0 && !selectedExamId) {
          setSelectedExamId(fetched[0]._id)
          setMarksDraft(fetched[0].marks || [])
        }

        setIsLoading(false)
      } catch {
        setError('Failed to fetch exams')
        setIsLoading(false)
      }
    }

    fetchExams()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedExam = useMemo(
    () => exams.find(exam => exam._id === selectedExamId) || null,
    [exams, selectedExamId]
  )

  useEffect(() => {
    if (selectedExam) {
      setMarksDraft(selectedExam.marks || [])
    } else {
      setMarksDraft([])
    }
  }, [selectedExam])

  const handleAddRoutineRow = () => {
    setRoutine(prev => [
      ...prev,
      { date: '', subject: '', startTime: '', endTime: '' }
    ])
  }

  const handleRoutineChange = (
    index: number,
    field: keyof ExamRoutineItem,
    value: string
  ) => {
    setRoutine(prev =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const handleCreateExam = async () => {
    if (!newExamName || !newExamTerm || !newExamYear || !newExamClass) {
      setError('Fill exam name, term, year and class')
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

      const body = {
        name: newExamName,
        term: newExamTerm,
        academicYear: newExamYear,
        className: newExamClass,
        startDate: newExamStartDate || null,
        endDate: newExamEndDate || null,
        routine
      }

      const response = await fetch('http://localhost:2056/api/academic/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to create exam')
        setIsSavingExam(false)
        return
      }

      const created: Exam = data.data
      setExams(prev => [created, ...prev])
      setSelectedExamId(created._id)
      setMarksDraft([])

      setNewExamName('')
      setNewExamTerm('')
      setNewExamYear('')
      setNewExamClass('')
      setNewExamStartDate('')
      setNewExamEndDate('')
      setRoutine([])

      setIsSavingExam(false)
    } catch {
      setError('Failed to create exam')
      setIsSavingExam(false)
    }
  }

  const handleMarkChange = (
    index: number,
    field: keyof ExamMarkEntry,
    value: string | number | boolean
  ) => {
    setMarksDraft(prev =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value as never } : entry
      )
    )
  }

  const handleAddMarkRow = () => {
    if (!selectedExam) return
    setMarksDraft(prev => [
      ...prev,
      {
        studentId: '',
        studentName: '',
        subject: '',
        marksObtained: 0,
        maxMarks: 100,
        creditHours: 1,
        verified: false,
        locked: false
      }
    ])
  }

  const handleSaveMarks = async () => {
    if (!selectedExam) return

    try {
      setIsSavingMarks(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Not authenticated')
        setIsSavingMarks(false)
        return
      }

      const response = await fetch(
        `http://localhost:2056/api/academic/exams/${selectedExam._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...selectedExam,
            marks: marksDraft
          })
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to save marks')
        setIsSavingMarks(false)
        return
      }

      const updated: Exam = data.data
      setExams(prev =>
        prev.map(exam => (exam._id === updated._id ? updated : exam))
      )
      setIsSavingMarks(false)
    } catch {
      setError('Failed to save marks')
      setIsSavingMarks(false)
    }
  }

  const handleLockMarks = () => {
    setMarksDraft(prev =>
      prev.map(entry => ({
        ...entry,
        locked: true,
        verified: true
      }))
    )
  }

  const selectedStudentMarks = useMemo(() => {
    if (!selectedStudentId) return []
    return marksDraft.filter(entry => entry.studentId === selectedStudentId)
  }, [marksDraft, selectedStudentId])

  const handleExportPdf = async () => {
    const container = document.getElementById('marksheet-container')
    if (!container) return

    const canvas = await html2canvas(container)
    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth - 20
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pageHeight - 20))
    pdf.save('marksheet.pdf')
  }

  return (
    <div className="academic-layout">
      <AcademicNavbar />
      <main className="academic-main">
        <header className="academic-header">
          <div className="academic-header-left">
            <h1 className="academic-page-title">Exams</h1>
            <p className="academic-page-subtitle">
              Create exams, manage routines and record marks with GPA calculation.
            </p>
          </div>
        </header>

        {error && <div className="academic-message academic-message-error">{error}</div>}

        {isLoading ? (
          <div className="academic-loading-container">
            <div className="academic-spinner" />
            <p>Loading exams...</p>
          </div>
        ) : (
          <div className="academic-grid">
            <section className="academic-card">
              <h2>Create exam</h2>
              <div className="academic-form">
                <div className="academic-form-row">
                  <label>
                    Name
                    <input
                      type="text"
                      value={newExamName}
                      onChange={e => setNewExamName(e.target.value)}
                    />
                  </label>
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
                  <label>
                    Class
                    <select
                      value={newExamClass}
                      onChange={e => setNewExamClass(e.target.value)}
                    >
                      <option value="">Select class</option>
                      {CLASS_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="academic-form-row">
                  <label>
                    Start date
                    <input
                      type="date"
                      value={newExamStartDate}
                      onChange={e => setNewExamStartDate(e.target.value)}
                    />
                  </label>
                  <label>
                    End date
                    <input
                      type="date"
                      value={newExamEndDate}
                      onChange={e => setNewExamEndDate(e.target.value)}
                    />
                  </label>
                </div>

                <h3>Routine</h3>
                <div className="academic-table-wrapper">
                  <table className="academic-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Subject</th>
                        <th>Start time</th>
                        <th>End time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routine.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <input
                              type="date"
                              value={item.date}
                              onChange={e =>
                                handleRoutineChange(index, 'date', e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.subject}
                              onChange={e =>
                                handleRoutineChange(index, 'subject', e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="time"
                              value={item.startTime}
                              onChange={e =>
                                handleRoutineChange(index, 'startTime', e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="time"
                              value={item.endTime}
                              onChange={e =>
                                handleRoutineChange(index, 'endTime', e.target.value)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                      {routine.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center' }}>
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

              <h2 style={{ marginTop: '2rem' }}>Existing exams</h2>
              <div className="academic-table-wrapper">
                <table className="academic-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Term</th>
                      <th>Year</th>
                      <th>Class</th>
                      <th>Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center' }}>
                          No exams created yet.
                        </td>
                      </tr>
                    )}
                    {exams.map(exam => (
                      <tr
                        key={exam._id}
                        className={
                          selectedExamId === exam._id
                            ? 'academic-row-selected'
                            : 'academic-row-clickable'
                        }
                        onClick={() => setSelectedExamId(exam._id)}
                      >
                        <td>{exam.name}</td>
                        <td>{exam.term}</td>
                        <td>{exam.academicYear}</td>
                        <td>{exam.className}</td>
                        <td>
                          {exam.startDate || '-'} to {exam.endDate || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="academic-card" id="marksheet-container">
              <h2>Marks entry & result</h2>
              {!selectedExam ? (
                <p>Select an exam to enter marks and view results.</p>
              ) : (
                <>
                  <p>
                    {selectedExam.name} – {selectedExam.term} ({selectedExam.academicYear}) • Class{' '}
                    {selectedExam.className}
                  </p>

                  <div className="academic-form-actions">
                    <button
                      type="button"
                      className="academic-btn"
                      onClick={handleAddMarkRow}
                    >
                      Add marks row
                    </button>
                    <button
                      type="button"
                      className="academic-btn"
                      onClick={handleLockMarks}
                    >
                      Verify & lock
                    </button>
                    <button
                      type="button"
                      className="academic-btn primary"
                      onClick={handleSaveMarks}
                      disabled={isSavingMarks}
                    >
                      {isSavingMarks ? 'Saving...' : 'Save marks'}
                    </button>
                    <button
                      type="button"
                      className="academic-btn"
                      onClick={handleExportPdf}
                    >
                      Export PDF (A4)
                    </button>
                  </div>

                  <div className="academic-table-wrapper">
                    <table className="academic-table">
                      <thead>
                        <tr>
                          <th>Student ID</th>
                          <th>Name</th>
                          <th>Subject</th>
                          <th>Marks</th>
                          <th>Max</th>
                          <th>Credit hrs</th>
                          <th>Verified</th>
                          <th>Locked</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marksDraft.length === 0 && (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center' }}>
                              No marks added yet.
                            </td>
                          </tr>
                        )}
                        {marksDraft.map((entry, index) => (
                          <tr
                            key={index}
                            className={
                              selectedStudentId === entry.studentId
                                ? 'academic-row-selected'
                                : 'academic-row-clickable'
                            }
                            onClick={() => setSelectedStudentId(entry.studentId)}
                          >
                            <td>
                              <input
                                type="text"
                                value={entry.studentId}
                                onChange={e =>
                                  handleMarkChange(index, 'studentId', e.target.value)
                                }
                                disabled={entry.locked}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={entry.studentName}
                                onChange={e =>
                                  handleMarkChange(index, 'studentName', e.target.value)
                                }
                                disabled={entry.locked}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={entry.subject}
                                onChange={e =>
                                  handleMarkChange(index, 'subject', e.target.value)
                                }
                                disabled={entry.locked}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={entry.marksObtained}
                                onChange={e =>
                                  handleMarkChange(
                                    index,
                                    'marksObtained',
                                    Number(e.target.value)
                                  )
                                }
                                disabled={entry.locked}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={entry.maxMarks}
                                onChange={e =>
                                  handleMarkChange(
                                    index,
                                    'maxMarks',
                                    Number(e.target.value)
                                  )
                                }
                                disabled={entry.locked}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={entry.creditHours}
                                onChange={e =>
                                  handleMarkChange(
                                    index,
                                    'creditHours',
                                    Number(e.target.value)
                                  )
                                }
                                disabled={entry.locked}
                              />
                            </td>
                            <td>
                              <input
                                type="checkbox"
                                checked={!!entry.verified}
                                onChange={e =>
                                  handleMarkChange(index, 'verified', e.target.checked)
                                }
                                disabled={entry.locked}
                              />
                            </td>
                            <td>{entry.locked ? 'Yes' : 'No'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {selectedStudentId && (
                    <div className="academic-history-section">
                      <h3>Result summary for {selectedStudentId}</h3>
                      {selectedStudentMarks.length === 0 ? (
                        <p>No marks recorded for this student in this exam.</p>
                      ) : (
                        (() => {
                          const { percentage, gpa } =
                            calculatePercentageAndGpa(selectedStudentMarks)
                          return (
                            <p>
                              Percentage: {percentage.toFixed(2)}% • GPA: {gpa.toFixed(2)}
                            </p>
                          )
                        })()
                      )}
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
