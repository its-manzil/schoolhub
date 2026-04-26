'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/app/context/ToastContext'
import './ManageFeeSection.css'

interface User {
  role: string
  schoolId?: string
}

interface FeeComponent {
  id: string
  name: string
}

interface ClassFeeEdit {
  className: string
  fees: Record<string, number>
  isDirty: boolean
}

interface ManageFeeSectionProps {
  user: User | null
  academicYears: string[]
  selectedYear: string
  onYearChange: (year: string) => void
}

const CLASSES = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)

export default function ManageFeeSection({
  user,
  academicYears,
  selectedYear,
  onYearChange
}: ManageFeeSectionProps) {
  const { showToast } = useToast()
  const [components, setComponents] = useState<FeeComponent[]>([])
  const [selectedClass, setSelectedClass] = useState('Class 1')
  const [classFeeEdits, setClassFeeEdits] = useState<Record<string, ClassFeeEdit>>({})
  const [isSaving, setIsSaving] = useState(false)

  const canEdit = user?.role === 'schooladmin' || user?.role === 'billing' || user?.role === 'superadmin'

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    const parsedUser = userData ? JSON.parse(userData) : null
    return {
      'Authorization': `Bearer ${token}`,
      'x-school-id': parsedUser?.schoolId || ''
    }
  }, [])

  useEffect(() => {
    const fetchComponents = async () => {
      if (!selectedYear) return
      try {
        const response = await fetch(`/api/accounting/fee-management/components?academicYear=${selectedYear}`, {
          headers: getAuthHeaders()
        })
        const result = await response.json()
        if (result.success) {
          setComponents(result.data)
        }
      } catch {
        showToast('Failed to fetch fee components', 'error')
      }
    }

    if (user && selectedYear) {
      fetchComponents()
    }
  }, [user, selectedYear, getAuthHeaders, showToast])

  useEffect(() => {
    const fetchClassFees = async () => {
      if (!selectedYear) return
      try {
        const response = await fetch(`/api/accounting/fee-management/class-fees?academicYear=${selectedYear}`, {
          headers: getAuthHeaders()
        })
        const result = await response.json()
        if (result.success) {
          const edits: Record<string, ClassFeeEdit> = {}
          result.data.forEach((cf: { className: string; fees: Record<string, number> }) => {
            edits[cf.className] = { className: cf.className, fees: { ...cf.fees }, isDirty: false }
          })
          // Initialize missing classes
          CLASSES.forEach(cls => {
            if (!edits[cls]) {
              edits[cls] = { className: cls, fees: {}, isDirty: false }
            }
          })
          setClassFeeEdits(edits)
        }
      } catch {
        showMessage('error', 'Failed to fetch class fees')
      }
    }

    if (user && selectedYear) {
      fetchClassFees()
    }
  }, [user, selectedYear, getAuthHeaders, showToast])

  const handleFeeChange = (className: string, componentId: string, value: number) => {
    setClassFeeEdits(prev => {
      const existing = prev[className] || { className, fees: {}, isDirty: false }
      return {
        ...prev,
        [className]: {
          ...existing,
          fees: { ...existing.fees, [componentId]: value },
          isDirty: true
        }
      }
    })
  }

  const handleSave = async () => {
    if (!canEdit || !selectedYear) return

    const edit = classFeeEdits[selectedClass]
    if (!edit || !edit.isDirty) return

    try {
      setIsSaving(true)
      const userData = localStorage.getItem('user')
      const parsedUser = userData ? JSON.parse(userData) : null

      const response = await fetch('/api/accounting/fee-management/class-fees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          schoolId: parsedUser?.schoolId,
          academicYear: selectedYear,
          className: selectedClass,
          fees: edit.fees
        })
      })

      const result = await response.json()
      if (result.success) {
        setClassFeeEdits(prev => ({
          ...prev,
          [selectedClass]: { ...prev[selectedClass], isDirty: false }
        }))
        showToast(`${selectedClass} fees saved successfully!`, 'success')
      } else {
        showToast(result.error || 'Failed to save fees', 'error')
      }
    } catch {
      showToast('Failed to save fees', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const currentEdit = classFeeEdits[selectedClass]
  const hasChanges = currentEdit?.isDirty || false

  return (
    <div className="manage-fee-section">
      <div className="manage-fee-form">
        <div className="manage-fee-filters">
          <div className="manage-fee-field">
            <label>Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="manage-fee-select"
            >
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="manage-fee-field">
            <label>Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="manage-fee-select"
            >
              {CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="manage-fee-class-section">
          <div className="manage-fee-class-header">
            <h3>{selectedClass}</h3>
            {hasChanges && canEdit && (
              <span className="manage-fee-unsaved">Unsaved changes</span>
            )}
          </div>

          <div className="manage-fee-inputs">
            {components.length === 0 ? (
              <div className="manage-fee-empty">
                No fee components configured. Please configure components first.
              </div>
            ) : (
              components.map(component => (
                <div key={component.id} className="manage-fee-input-row">
                  <label>{component.name}</label>
                  <input
                    type="number"
                    min="0"
                    value={currentEdit?.fees[component.id] || 0}
                    onChange={(e) => handleFeeChange(selectedClass, component.id, Number(e.target.value))}
                    className="manage-fee-input"
                    disabled={!canEdit}
                  />
                </div>
              ))
            )}
          </div>

          {canEdit && components.length > 0 && (
            <div className="manage-fee-actions">
              <button
                onClick={handleSave}
                className="manage-fee-btn-primary"
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? 'Saving...' : 'Save Fees'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
