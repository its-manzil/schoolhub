'use client'

import { useEffect, useState } from 'react'
import AcademicNavbar from '../components/AcademicNavbar'
import '../academic.css'
import './subjects.css'

interface Subject {
  id: string
  name: string
  type: 'primary' | 'minor' | 'optional'
  creditHours?: number
  className: string
  academicYear: string
  description?: string
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

const ACADEMIC_YEAR_OPTIONS = [
  '2083-2084', '2084-2085', '2085-2086', '2086-2087', '2087-2088',
  '2088-2089', '2089-2090', '2090-2091', '2091-2092', '2092-2093',
  '2093-2094', '2094-2095', '2095-2096', '2096-2097', '2097-2098',
  '2098-2099', '2099-2100'
]

export default function SubjectsPage() {
  const [selectedClass, setSelectedClass] = useState<string>('N')
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Form states
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'primary' as 'primary' | 'minor' | 'optional',
    creditHours: '',
    description: '',
    className: '',
    academicYear: ''
  })

  // Import states
  const [showImportModal, setShowImportModal] = useState(false)
  const [sourceClass, setSourceClass] = useState('')
  const [sourceAcademicYear, setSourceAcademicYear] = useState('')

  useEffect(() => {
    fetchSubjects()
  }, [selectedClass, selectedAcademicYear])

  const fetchSubjects = async () => {
    if (!selectedClass) return
    
    try {
      setIsLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Not authenticated')
        setIsLoading(false)
        return
      }

      const params = new URLSearchParams()
      params.set('className', selectedClass)
      if (selectedAcademicYear) {
        params.set('academicYear', selectedAcademicYear)
      }

      const response = await fetch(
        `http://localhost:2056/api/academic/subjects?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const data = await response.json()
      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to fetch subjects')
        setSubjects([])
      } else {
        setSubjects(Array.isArray(data.data) ? data.data : [])
      }
    } catch (err) {
      setError('Failed to connect to server')
      setSubjects([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!formData.name.trim()) {
      setError('Subject name is required')
      return
    }

    if (!formData.className) {
      setError('Class selection is required')
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Not authenticated')
        return
      }

      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        className: formData.className,
        academicYear: formData.academicYear || ACADEMIC_YEAR_OPTIONS[0],
        description: formData.description.trim() || undefined,
        creditHours: formData.creditHours ? parseInt(formData.creditHours) : undefined
      }

      let response
      if (editingSubject) {
        response = await fetch(
          `http://localhost:2056/api/academic/subjects/${editingSubject.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          }
        )
      } else {
        response = await fetch('http://localhost:2056/api/academic/subjects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })
      }

      const data = await response.json()
      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to save subject')
      } else {
        setMessage(editingSubject ? 'Subject updated successfully' : 'Subject added successfully')
        resetForm()
        fetchSubjects()
      }
    } catch (err) {
      setError('Failed to connect to server')
    }
  }

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name,
      type: subject.type,
      creditHours: subject.creditHours?.toString() || '',
      description: subject.description || '',
      className: subject.className,
      academicYear: subject.academicYear
    })
    setShowAddForm(true)
  }

  const handleDelete = async (subjectId: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Not authenticated')
        return
      }

      const response = await fetch(
        `http://localhost:2056/api/academic/subjects/${subjectId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const data = await response.json()
      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to delete subject')
      } else {
        setMessage('Subject deleted successfully')
        fetchSubjects()
      }
    } catch (err) {
      setError('Failed to connect to server')
    }
  }

  const handleImport = async () => {
    if (!sourceClass || !sourceAcademicYear) {
      setError('Please select source class and academic year')
      return
    }

    if (sourceClass === selectedClass && sourceAcademicYear === selectedAcademicYear) {
      setError('Cannot import from the same class and academic year')
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Not authenticated')
        return
      }

      const response = await fetch('http://localhost:2056/api/academic/subjects/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sourceClass,
          sourceAcademicYear,
          targetClass: selectedClass,
          targetAcademicYear: selectedAcademicYear || ACADEMIC_YEAR_OPTIONS[0]
        })
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to import subjects')
      } else {
        setMessage(`Successfully imported ${data.data?.importedCount || 0} subjects`)
        setShowImportModal(false)
        setSourceClass('')
        setSourceAcademicYear('')
        fetchSubjects()
      }
    } catch (err) {
      setError('Failed to connect to server')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'primary',
      creditHours: '',
      description: '',
      className: '',
      academicYear: ''
    })
    setEditingSubject(null)
    setShowAddForm(false)
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
            <h1 className="title-text">Subjects Management</h1>
            <p className="body-text">
              Manage class-wise subjects with credit hours and import functionality.
            </p>
          </div>
          <div className="academic-header-right">
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              Add Subject
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
                <select 
                  value={selectedClass} 
                  onChange={e => setSelectedClass(e.target.value)}
                >
                  {CLASS_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Academic Year
                <select 
                  value={selectedAcademicYear} 
                  onChange={e => setSelectedAcademicYear(e.target.value)}
                >
                  <option value="">Select Academic Year</option>
                  {ACADEMIC_YEAR_OPTIONS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </label>
              {selectedClass && (
                <div className="import-subject-btn-container">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowImportModal(true)}
                  >
                    Import Subjects
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Subjects List */}
        <section className="card">
          <h2 className="heading-text">
            Subjects for {CLASS_OPTIONS.find(c => c.value === selectedClass)?.label}
          </h2>
          
          {isLoading ? (
            <div className="academic-loading-container">
              <div className="academic-spinner" />
              <p>Loading subjects...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="academic-empty-state">
              <p>No subjects found for this class.</p>
              <p>Click "Add Subject" to create the first subject.</p>
            </div>
          ) : (
            <div className="subjects-table-wrapper">
              <table className="subjects-table">
                <thead>
                  <tr>
                    <th>Subject Name</th>
                    <th>Type</th>
                    <th>Credit Hours</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.id}>
                      <td className="subjects-name-cell">
                        <span className="body-text">{subject.name}</span>
                      </td>
                      <td>
                        <span className={`subjects-type-badge ${getTypeColor(subject.type)}`}>
                          {getTypeLabel(subject.type)}
                        </span>
                      </td>
                      <td>
                        <span className="body-text">
                          {subject.creditHours || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="small-text">
                          {subject.description || 'No description'}
                        </span>
                      </td>
                      <td>
                        <div className="subjects-actions">
                          <button
                            type="button"
                            className="btn-secondary subjects-action-btn"
                            onClick={() => handleEdit(subject)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-secondary subjects-action-btn subjects-delete-btn"
                            onClick={() => handleDelete(subject.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Add/Edit Subject Modal */}
        {showAddForm && (
          <div className="subjects-modal-overlay">
            <div className="subjects-modal card">
              <div className="subjects-modal-header">
                <h3 className="heading-text">
                  {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                </h3>
                <button
                  type="button"
                  className="subjects-modal-close"
                  onClick={resetForm}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="academic-form">
                <div className="academic-form-row">
                  <label>
                    Subject Name *
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter subject name"
                      required
                    />
                  </label>
                  <label>
                    Subject Type
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as 'primary' | 'minor' | 'optional' })}
                    >
                      <option value="primary">Primary</option>
                      <option value="minor">Minor</option>
                      <option value="optional">Optional</option>
                    </select>
                  </label>
                </div>
                
                <div className="academic-form-row">
                  <label>
                    Class *
                    <select
                      value={formData.className}
                      onChange={e => setFormData({ ...formData, className: e.target.value })}
                      required
                    >
                      <option value="">Select Class</option>
                      {CLASS_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Academic Year *
                    <select
                      value={formData.academicYear}
                      onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                      required
                    >
                      <option value="">Select Academic Year</option>
                      {ACADEMIC_YEAR_OPTIONS.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </label>
                </div>
                
                <div className="academic-form-row">
                  <label>
                    Credit Hours (Optional)
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.creditHours}
                      onChange={e => setFormData({ ...formData, creditHours: e.target.value })}
                      placeholder="Enter credit hours"
                    />
                  </label>
                </div>
                
                <div className="academic-form-row">
                  <label>
                    Description (Optional)
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter subject description"
                      rows={3}
                    />
                  </label>
                </div>
                
                <div className="academic-form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {editingSubject ? 'Update Subject' : 'Add Subject'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Import Subjects Modal */}
        {showImportModal && (
          <div className="subjects-modal-overlay">
            <div className="subjects-modal card">
              <div className="subjects-modal-header">
                <h3 className="heading-text">Import Subjects</h3>
                <button
                  type="button"
                  className="subjects-modal-close"
                  onClick={() => setShowImportModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="academic-form">
                <p className="body-text">
                  Import subjects from another class to {CLASS_OPTIONS.find(c => c.value === selectedClass)?.label}
                </p>
                
                <div className="academic-form-row">
                  <label>
                    Source Class *
                    <select
                      value={sourceClass}
                      onChange={e => setSourceClass(e.target.value)}
                      required
                    >
                      <option value="">Select Source Class</option>
                      {CLASS_OPTIONS.filter(c => c.value !== selectedClass).map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Source Academic Year *
                    <select
                      value={sourceAcademicYear}
                      onChange={e => setSourceAcademicYear(e.target.value)}
                      required
                    >
                      <option value="">Select Academic Year</option>
                      {ACADEMIC_YEAR_OPTIONS.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </label>
                </div>
                
                <div className="academic-form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowImportModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleImport}
                    disabled={!sourceClass || !sourceAcademicYear}
                  >
                    Import Subjects
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
