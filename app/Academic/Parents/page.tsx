'use client'

import { useEffect, useMemo, useState } from 'react'
import AcademicNavbar from '../components/AcademicNavbar'
import './parents.css'

interface ParentChild {
  _id: string
  studentId: string
  name: string
  className: string
  section: string
  rollNumber: number
  admissionYear: number
  academicStatus?: string
}

interface ParentRecord {
  _id: string
  name: string
  phone: string
  email: string | null
  schoolId: number
  children: string[]
  childrenDetails: ParentChild[]
  createdAt: string
  updatedAt: string
}

export default function AcademicParentsPage() {
  const [parents, setParents] = useState<ParentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

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

  const filteredParents = useMemo(() => {
    if (!search.trim()) return parents
    const lower = search.toLowerCase()
    return parents.filter(parent => {
      if (parent.name.toLowerCase().includes(lower)) return true
      if (parent.phone.toLowerCase().includes(lower)) return true
      if (parent.email && parent.email.toLowerCase().includes(lower)) return true
      return parent.childrenDetails.some(child =>
        child.name.toLowerCase().includes(lower) ||
        child.studentId.toLowerCase().includes(lower)
      )
    })
  }, [parents, search])

  return (
    <>
    
    <div className="academic-layout">
      <AcademicNavbar />
      <main className="academic-main">
        <header className="academic-header">
          <div className="academic-header-left">
            <h1 className="academic-page-title">Parents & Guardians</h1>
            <p className="academic-page-subtitle">
              View parent records, their contact details and linked children.
            </p>
          </div>
        </header>

        {error && <div className="academic-message academic-message-error">{error}</div>}

        {isLoading ? (
          <div className="academic-loading-container">
            <div className="academic-spinner" />
            <p>Loading parents...</p>
          </div>
        ) : (
          <section className="academic-card">
            <div className="academic-form">
              <div className="academic-form-row">
                <label className="academic-form-full">
                  Search parent or child
                  <input
                    type="text"
                    placeholder="Search by parent name, phone, email or child name/ID"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="academic-table-wrapper">
              <table className="academic-table">
                <thead>
                  <tr>
                    <th>Parent / Guardian</th>
                    <th>Contact</th>
                    <th>Children</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParents.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center' }}>
                        No parents found.
                      </td>
                    </tr>
                  )}
                  {filteredParents.map(parent => (
                    <tr key={parent._id}>
                      <td>
                        <div className="academic-parent-name">{parent.name}</div>
                        <div className="academic-parent-meta">
                          Parent ID: {parent._id}
                        </div>
                      </td>
                      <td>
                        <div>{parent.phone}</div>
                        <div>{parent.email || 'No email'}</div>
                      </td>
                      <td>
                        {parent.childrenDetails.length === 0 && (
                          <span>No linked children</span>
                        )}
                        {parent.childrenDetails.length > 0 && (
                          <ul className="academic-children-list">
                            {parent.childrenDetails.map(child => (
                              <li key={child._id}>
                                <strong>{child.name}</strong> ({child.studentId}) – Class{' '}
                                {child.className}, Sec {child.section}, Roll {child.rollNumber}{' '}
                                {child.academicStatus && (
                                  <span>• Status: {child.academicStatus}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
    </>
  )
}
