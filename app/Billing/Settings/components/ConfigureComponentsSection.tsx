'use client'

import { useState, useEffect, useCallback } from 'react'
import './ConfigureComponentsSection.css'

interface User {
  role: string
  schoolId?: string
}

interface FeeComponent {
  id: string
  name: string
}

interface ConfigureComponentsSectionProps {
  user: User | null
  academicYears: string[]
  selectedYear: string
  onYearChange: (year: string) => void
}

export default function ConfigureComponentsSection({
  user,
  academicYears,
  selectedYear,
  onYearChange
}: ConfigureComponentsSectionProps) {
  const [components, setComponents] = useState<FeeComponent[]>([])
  const [pendingComponents, setPendingComponents] = useState<FeeComponent[]>([])
  const [newComponent, setNewComponent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

  const showMessage = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
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
          setPendingComponents(result.data)
        }
      } catch {
        showMessage('error', 'Failed to fetch fee components')
      }
    }

    if (user && selectedYear) {
      fetchComponents()
    }
  }, [user, selectedYear, getAuthHeaders, showMessage])

  const handleAddComponent = () => {
    if (!newComponent.trim() || !canEdit) return
    const newComp: FeeComponent = { id: `temp-${Date.now()}`, name: newComponent.trim() }
    setPendingComponents(prev => [...prev, newComp])
    setNewComponent('')
  }

  const handleRemoveComponent = (id: string) => {
    if (!canEdit) return
    setPendingComponents(prev => prev.filter(c => c.id !== id))
  }

  const handleSave = async () => {
    if (!canEdit || !selectedYear) return

    try {
      setIsSaving(true)
      const userData = localStorage.getItem('user')
      const parsedUser = userData ? JSON.parse(userData) : null

      const response = await fetch('/api/accounting/fee-management/components', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          schoolId: parsedUser?.schoolId,
          academicYear: selectedYear,
          components: pendingComponents.map(c => ({ id: c.id, name: c.name }))
        })
      })

      const result = await response.json()
      if (result.success) {
        setComponents(pendingComponents)
        showMessage('success', 'Fee components saved successfully!')
      } else {
        showMessage('error', result.error || 'Failed to save components')
      }
    } catch {
      showMessage('error', 'Failed to save components')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscard = () => {
    setPendingComponents(components)
  }

  const hasChanges = JSON.stringify(pendingComponents) !== JSON.stringify(components)

  return (
    <div className="configure-components-section">
      <div className="configure-components-form">
        <div className="configure-components-row">
          <div className="configure-components-field">
            <label>Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="configure-components-select"
            >
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {canEdit && (
          <div className="configure-components-row">
            <div className="configure-components-field">
              <label>Add New Component</label>
              <div className="configure-components-input-group">
                <input
                  type="text"
                  value={newComponent}
                  onChange={(e) => setNewComponent(e.target.value)}
                  className="configure-components-input"
                  placeholder="e.g., Admission Fee, Bus Fee, Lab Fee"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComponent()}
                />
                <button
                  onClick={handleAddComponent}
                  className="configure-components-btn-add"
                  disabled={!newComponent.trim()}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="configure-components-list">
          <label>Configured Components</label>
          {pendingComponents.length === 0 ? (
            <div className="configure-components-empty">
              No components configured. {canEdit && 'Add some components above.'}
            </div>
          ) : (
            <div className="configure-components-items">
              {pendingComponents.map(component => (
                <div key={component.id} className="configure-components-item">
                  <span className="configure-components-name">{component.name}</span>
                  {canEdit && (
                    <button
                      onClick={() => handleRemoveComponent(component.id)}
                      className="configure-components-btn-remove"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {canEdit && hasChanges && (
          <div className="configure-components-actions">
            <button
              onClick={handleDiscard}
              className="configure-components-btn-secondary"
            >
              Discard Changes
            </button>
            <button
              onClick={handleSave}
              className="configure-components-btn-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Components'}
            </button>
          </div>
        )}

        {message && (
          <div className={`configure-components-message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}
