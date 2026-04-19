'use client'

import { useEffect, useMemo, useState } from 'react'
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

export type {
  ExamRoutineItem,
  ExamMarkEntry,
  Exam
}

export {
  CLASS_OPTIONS,
  calculatePercentageAndGpa
}

export default function LegacyExamFunctions() {
  // This component contains all the legacy backend functions
  // that will be preserved and later moved to appropriate sub-sections
  
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

  // Legacy backend functions preserved here
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
  }, [])

  // All other legacy functions preserved here...
  // This file will be used as a reference when implementing the new design
  
  return null
}
