'use client'

import { useEffect, useMemo, useState } from 'react'
import ParentsLayout from '../components/ParentsLayout'
import ParentOverviewCards from '../components/ParentOverviewCards'
import ParentToolbar from '../components/ParentToolbar'
import ParentClassMatrix from '../components/ParentClassMatrix'
import ParentListPanel from '../components/ParentListPanel'
import ParentProfilePanel from '../components/ParentProfilePanel'
import ParentEmptyState from '../components/ParentEmptyState'
import { ParentRecord, FilterType } from '../components/types'
import './parents.css'

// Database class codes to display names mapping
const DB_CLASSES = ['0N', '0L', '0U', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'] as const
const DISPLAY_CLASSES = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const

// Create mapping objects
const dbToDisplay: Record<string, string> = {}
const displayToDb: Record<string, string> = {}
DB_CLASSES.forEach((db, i) => {
  dbToDisplay[db] = DISPLAY_CLASSES[i]
  displayToDb[DISPLAY_CLASSES[i]] = db
})

export default function AcademicParentsPage() {
  const [parents, setParents] = useState<ParentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [selectedParent, setSelectedParent] = useState<ParentRecord | null>(null)

  // Fetch parents data
  useEffect(() => {
    const fetchParents = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const token = localStorage.getItem('token')
        if (!token) {
          setError('Not authenticated')
          setIsLoading(false)
          return
        }

        const response = await fetch('http://localhost:2056/api/academic/parents', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          setError(data.message || 'Failed to fetch parents')
          setIsLoading(false)
          return
        }

        setParents(data.data || [])
        setIsLoading(false)
      } catch {
        setError('Failed to fetch parents')
        setIsLoading(false)
      }
    }

    fetchParents()
  }, [])

  // Calculate stats
  const stats = useMemo(() => {
    const totalParents = parents.length
    const parentsWithChildren = parents.filter(p => p.childrenDetails.length > 0).length
    const totalChildren = parents.reduce((sum, p) => sum + p.childrenDetails.length, 0)
    const multiChildFamilies = parents.filter(p => p.childrenDetails.length > 1).length
    
    // Calculate class coverage
    const coveredClasses = new Set<string>()
    parents.forEach(p => {
      p.childrenDetails.forEach(c => {
        coveredClasses.add(c.className)
      })
    })
    const classCoverage = coveredClasses.size

    return {
      totalParents,
      parentsWithChildren,
      totalChildren,
      multiChildFamilies,
      classCoverage
    }
  }, [parents])

  // Calculate class counts for matrix (map DB codes to display names)
  const classCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    DISPLAY_CLASSES.forEach(c => counts[c] = 0)
    
    parents.forEach(parent => {
      const parentClasses = new Set<string>()
      parent.childrenDetails.forEach(child => {
        // Map DB class code to display name
        const displayName = dbToDisplay[child.className] || child.className
        parentClasses.add(displayName)
      })
      parentClasses.forEach(cls => {
        if (counts[cls] !== undefined) {
          counts[cls]++
        }
      })
    })
    
    return counts
  }, [parents])

  // Filter parents
  const filteredParents = useMemo(() => {
    let result = [...parents]

    // Search filter
    if (search.trim()) {
      const lower = search.toLowerCase()
      result = result.filter(parent => {
        if (parent.name.toLowerCase().includes(lower)) return true
        if (parent.phone.toLowerCase().includes(lower)) return true
        if (parent.email && parent.email.toLowerCase().includes(lower)) return true
        return parent.childrenDetails.some(child =>
          child.name.toLowerCase().includes(lower) ||
          child.studentId.toLowerCase().includes(lower)
        )
      })
    }

    // Type filter
    switch (filter) {
      case 'single-child':
        result = result.filter(p => p.childrenDetails.length === 1)
        break
      case 'multi-child':
        result = result.filter(p => p.childrenDetails.length > 1)
        break
    }

    // Class filter (convert display name to DB code for comparison)
    if (selectedClass) {
      const dbClassCode = displayToDb[selectedClass]
      result = result.filter(p => 
        p.childrenDetails.some(c => c.className === dbClassCode || c.className === selectedClass)
      )
    }

    return result
  }, [parents, search, filter, selectedClass])

  const handleSelectParent = (parent: ParentRecord) => {
    setSelectedParent(parent)
  }

  const handleSelectFirstParent = () => {
    if (filteredParents.length > 0) {
      setSelectedParent(filteredParents[0])
    }
  }

  if (isLoading) {
    return (
      <ParentsLayout>
        <div className="parents-page__loading">
          <div className="parents-page__spinner" />
          <p className="parents-page__loading-text">Loading parent data...</p>
        </div>
      </ParentsLayout>
    )
  }

  if (error) {
    return (
      <ParentsLayout>
        <div className="parents-page__error">
          <svg className="parents-page__error-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="parents-page__error-title">Error</p>
          <p className="parents-page__error-text">{error}</p>
        </div>
      </ParentsLayout>
    )
  }

  return (
    <ParentsLayout>
      {/* Page Header */}
      <div className="parents-page__header">
        <h1 className="parents-page__title">Parents & Guardians</h1>
        <p className="parents-page__subtitle">
          Parent Intelligence Dashboard - Manage parent records, contact details, and student relationships
        </p>
      </div>

      {/* Overview Cards */}
      <ParentOverviewCards stats={stats} />

      {/* Class Matrix */}
      <ParentClassMatrix
        classCounts={classCounts}
        selectedClass={selectedClass}
        onSelectClass={setSelectedClass}
      />

      {/* Toolbar */}
      <ParentToolbar
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
      />

      {/* Main Content Grid */}
      <div className="parents-page__grid">
        {/* Left Panel - Parent List */}
        <ParentListPanel
          parents={filteredParents}
          selectedParent={selectedParent}
          onSelectParent={handleSelectParent}
          searchQuery={search}
        />

        {/* Right Panel - Parent Profile */}
        {selectedParent ? (
          <ParentProfilePanel parent={selectedParent} />
        ) : (
          <ParentEmptyState onSelectFirst={filteredParents.length > 0 ? handleSelectFirstParent : undefined} />
        )}
      </div>
    </ParentsLayout>
  )
}

