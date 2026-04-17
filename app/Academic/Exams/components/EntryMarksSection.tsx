'use client'

import { useEffect, useMemo, useState } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

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
  marks: ExamMarkEntry[]
}

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

export default function EntryMarksSection() {
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null)
  const [marksDraft, setMarksDraft] = useState<ExamMarkEntry[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingMarks, setIsSavingMarks] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [marksEntryAcademicYear, setMarksEntryAcademicYear] = useState<string>('')
  const [marksEntryExamType, setMarksEntryExamType] = useState<string>('')
  const [marksEntryClass, setMarksEntryClass] = useState<string>('')
  const [isMarksTableOpen, setIsMarksTableOpen] = useState(false)
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('')

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('token')
        if (!token) {
          setIsLoading(false)
          return
        }

        const response = await fetch('http://localhost:2056/api/academic/exams', {
          headers: { Authorization: `Bearer ${token}` }
        })

        const data = await response.json()
        if (response.ok && data.success) {
          const fetched: Exam[] = data.data || []
          setExams(fetched)
          if (fetched.length > 0) {
            setSelectedExamId(fetched[0]._id)
            setMarksDraft(fetched[0].marks || [])
          }
        }
        setIsLoading(false)
      } catch {
        setIsLoading(false)
      }
    }

    fetchExams()
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

  const handleMarkChange = (index: number, field: keyof ExamMarkEntry, value: string | number | boolean) => {
    setMarksDraft(prev => prev.map((entry, i) => (i === index ? { ...entry, [field]: value as never } : entry)))
  }

  const handleAddMarkRow = () => {
    if (!selectedExam) return
    setMarksDraft(prev => [...prev, { studentId: '', studentName: '', subject: '', marksObtained: 0, maxMarks: 100, creditHours: 1, verified: false, locked: false }])
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

      const response = await fetch(`http://localhost:2056/api/academic/exams/${selectedExam._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...selectedExam, marks: marksDraft })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to save marks')
        setIsSavingMarks(false)
        return
      }

      const updated: Exam = data.data
      setExams(prev => prev.map(exam => (exam._id === updated._id ? updated : exam)))
      setIsSavingMarks(false)
    } catch {
      setError('Failed to save marks')
      setIsSavingMarks(false)
    }
  }

  const handleLockMarks = () => {
    setMarksDraft(prev => prev.map(entry => ({ ...entry, locked: true, verified: true })))
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

  if (isLoading) {
    return (
      <div className="academic-loading-container">
        <div className="academic-spinner" />
        <p>Loading exams...</p>
      </div>
    )
  }

  return (
    <>
      {!isMarksTableOpen ? (
        <>
          {/* Marks Entry Container */}
          <section className="academic-card">
            <h2>Marks Entry</h2>
            <div className="academic-form">
              <div className="academic-form-row">
                <label>
                  Academic Year
                  <input
                    type="text"
                    value={marksEntryAcademicYear}
                    onChange={e => setMarksEntryAcademicYear(e.target.value)}
                    placeholder="Enter academic year"
                  />
                </label>
                <label>
                  Exam Type
                  <input
                    type="text"
                    value={marksEntryExamType}
                    onChange={e => setMarksEntryExamType(e.target.value)}
                    placeholder="Enter exam type"
                  />
                </label>
                <label>
                  Class
                  <select
                    value={marksEntryClass}
                    onChange={e => setMarksEntryClass(e.target.value)}
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
            </div>
            <div className="academic-form-actions">
              <button
                type="button"
                className="academic-btn primary"
                onClick={() => setIsMarksTableOpen(true)}
              >
                Add Marks
              </button>
            </div>
          </section>

          {/* Exam Selection */}
          <section className="academic-card">
            <h2>Select Exam</h2>
            <div className="academic-table-wrapper">
              <table className="academic-table">
                <thead>
                  <tr><th>Name</th><th>Term</th><th>Year</th><th>Class</th><th>Period</th></tr>
                </thead>
                <tbody>
                  {exams.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center' }}>No exams created yet.</td></tr>
                  ) : (
                    exams.map(exam => (
                      <tr key={exam._id} className={selectedExamId === exam._id ? 'academic-row-selected' : 'academic-row-clickable'} onClick={() => setSelectedExamId(exam._id)}>
                        <td>{exam.name}</td>
                        <td>{exam.term}</td>
                        <td>{exam.academicYear}</td>
                        <td>{exam.className}</td>
                        <td>{exam.startDate || '-'} to {exam.endDate || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Marks Entry */}
          {selectedExam && (
            <section className="academic-card" id="marksheet-container">
              <h2>Marks Entry for {selectedExam.name}</h2>

              <div className="academic-form-actions" style={{ justifyContent: 'space-between' }}>
                <div>
                  <button type="button" className="academic-btn" onClick={handleAddMarkRow}>Add marks row</button>
                  <button type="button" className="academic-btn" onClick={handleLockMarks}>Verify & lock</button>
                  <button type="button" className="academic-btn primary" onClick={handleSaveMarks} disabled={isSavingMarks}>
                    {isSavingMarks ? 'Saving...' : 'Save marks'}
                  </button>
                </div>
                <div>
                  <button type="button" className="academic-btn primary" onClick={handleExportPdf}>Print Results</button>
                </div>
              </div>

              <div className="academic-table-wrapper">
                <table className="academic-table">
                  <thead>
                    <tr><th>Student ID</th><th>Name</th><th>Subject</th><th>Marks</th><th>Max</th><th>Credit hrs</th><th>Verified</th><th>Locked</th><th>Save</th></tr>
                  </thead>
                  <tbody>
                    {marksDraft.length === 0 && (
                      <tr><td colSpan={9} style={{ textAlign: 'center' }}>No marks added yet.</td></tr>
                    )}
                    {marksDraft.map((entry, index) => (
                      <tr key={index} className={selectedStudentId === entry.studentId ? 'academic-row-selected' : 'academic-row-clickable'} onClick={() => setSelectedStudentId(entry.studentId)}>
                        <td><input type="text" value={entry.studentId} onChange={e => handleMarkChange(index, 'studentId', e.target.value)} disabled={entry.locked} /></td>
                        <td><input type="text" value={entry.studentName} onChange={e => handleMarkChange(index, 'studentName', e.target.value)} disabled={entry.locked} /></td>
                        <td><input type="text" value={entry.subject} onChange={e => handleMarkChange(index, 'subject', e.target.value)} disabled={entry.locked} /></td>
                        <td><input type="number" value={entry.marksObtained} onChange={e => handleMarkChange(index, 'marksObtained', Number(e.target.value))} disabled={entry.locked} /></td>
                        <td><input type="number" value={entry.maxMarks} onChange={e => handleMarkChange(index, 'maxMarks', Number(e.target.value))} disabled={entry.locked} /></td>
                        <td><input type="number" value={entry.creditHours} onChange={e => handleMarkChange(index, 'creditHours', Number(e.target.value))} disabled={entry.locked} /></td>
                        <td><input type="checkbox" checked={!!entry.verified} onChange={e => handleMarkChange(index, 'verified', e.target.checked)} disabled={entry.locked} /></td>
                        <td>{entry.locked ? 'Yes' : 'No'}</td>
                        <td>
                          <button
                            type="button"
                            className="academic-btn primary"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSaveMarks()
                            }}
                            disabled={entry.locked}
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            Save
                          </button>
                        </td>
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
                      const { percentage, gpa } = calculatePercentageAndGpa(selectedStudentMarks)
                      return <p>Percentage: {percentage.toFixed(2)}% - GPA: {gpa.toFixed(2)}</p>
                    })()
                  )}
                </div>
              )}
            </section>
          )}
        </>
      ) : (
        /* Marks Table Container */
        <section className="academic-card">
          <h2>Marks Entry Table</h2>
          <div className="academic-form-actions">
            <input
              type="text"
              placeholder="Search student name..."
              value={studentSearchQuery}
              onChange={e => setStudentSearchQuery(e.target.value)}
              style={{ marginRight: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button
              type="button"
              className="academic-btn"
              onClick={() => setIsMarksTableOpen(false)}
            >
              Close
            </button>
          </div>
          <div className="academic-table-wrapper">
            <table className="academic-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>English (TH)</th>
                  <th>English (PR)</th>
                  <th>Math (TH)</th>
                  <th>Math (PR)</th>
                  <th>Science (TH)</th>
                  <th>Science (PR)</th>
                  <th>Nepali (TH)</th>
                  <th>Nepali (PR)</th>
                  <th>Social (TH)</th>
                  <th>Social (PR)</th>
                  <th>Economics (TH)</th>
                  <th>Economics (PR)</th>
                  <th>Account (TH)</th>
                  <th>Account (PR)</th>
                  <th>Health (TH)</th>
                  <th>Health (PR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><input type="text" placeholder="Roll No" /></td>
                  <td><input type="text" placeholder="Name" /></td>
                  <td><input type="number" placeholder="TH" /></td>
                  <td><input type="number" placeholder="PR" /></td>
                  <td><input type="number" placeholder="TH" /></td>
                  <td><input type="number" placeholder="PR" /></td>
                  <td><input type="number" placeholder="TH" /></td>
                  <td><input type="number" placeholder="PR" /></td>
                  <td><input type="number" placeholder="TH" /></td>
                  <td><input type="number" placeholder="PR" /></td>
                  <td><input type="number" placeholder="TH" /></td>
                  <td><input type="number" placeholder="PR" /></td>
                  <td><input type="number" placeholder="TH" /></td>
                  <td><input type="number" placeholder="PR" /></td>
                  <td><input type="number" placeholder="TH" /></td>
                  <td><input type="number" placeholder="PR" /></td>
                  <td><input type="number" placeholder="TH" /></td>
                  <td><input type="number" placeholder="PR" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  )
}
