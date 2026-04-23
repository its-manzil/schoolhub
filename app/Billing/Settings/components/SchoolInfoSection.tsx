'use client'

import { useState, useEffect, useCallback } from 'react'
import './SchoolInfoSection.css'

interface User {
  role: string
  schoolId?: string
  schoolName?: string
}

interface SchoolInfo {
  phone: string
  email: string
  name: string
  id?: string
}

interface SchoolInfoSectionProps {
  user: User | null
}

export default function SchoolInfoSection({ user }: SchoolInfoSectionProps) {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({ phone: '', email: '', name: '' })
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
    const fetchSchoolInfo = async () => {
      try {
        const response = await fetch('/api/accounting/fee-management/school-info', {
          headers: getAuthHeaders()
        })
        const result = await response.json()
        if (result.success) {
          setSchoolInfo(result.data)
        }
      } catch {
        showMessage('error', 'Failed to fetch school info')
      }
    }

    if (user) {
      fetchSchoolInfo()
    }
  }, [user, getAuthHeaders, showMessage])

  const handleSave = async () => {
    if (!canEdit) return

    try {
      setIsSaving(true)
      const userData = localStorage.getItem('user')
      const parsedUser = userData ? JSON.parse(userData) : null

      const response = await fetch('/api/accounting/fee-management/school-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          schoolId: parsedUser?.schoolId,
          phone: schoolInfo.phone,
          email: schoolInfo.email
        })
      })

      const result = await response.json()
      if (result.success) {
        showMessage('success', 'School information updated successfully!')
      } else {
        showMessage('error', result.error || 'Failed to update school info')
      }
    } catch {
      showMessage('error', 'Failed to save school info')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="school-info-section">
      <div className="school-info-form">
        <div className="school-info-row">
          <div className="school-info-field readonly">
            <label>School Name</label>
            <input
              type="text"
              value={schoolInfo.name}
              readOnly
              className="school-info-input readonly"
            />
          </div>
          <div className="school-info-field readonly">
            <label>School ID</label>
            <input
              type="text"
              value={user?.schoolId || ''}
              readOnly
              className="school-info-input readonly"
            />
          </div>
        </div>

        <div className="school-info-row">
          <div className="school-info-field">
            <label>Phone Number</label>
            <input
              type="tel"
              value={schoolInfo.phone}
              onChange={(e) => setSchoolInfo(prev => ({ ...prev, phone: e.target.value }))}
              className="school-info-input"
              disabled={!canEdit}
              placeholder="Enter phone number"
            />
          </div>
          <div className="school-info-field">
            <label>Email</label>
            <input
              type="email"
              value={schoolInfo.email}
              onChange={(e) => setSchoolInfo(prev => ({ ...prev, email: e.target.value }))}
              className="school-info-input"
              disabled={!canEdit}
              placeholder="Enter email address"
            />
          </div>
        </div>

        {canEdit && (
          <div className="school-info-actions">
            <button
              onClick={handleSave}
              className="school-info-btn-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save School Info'}
            </button>
          </div>
        )}

        {message && (
          <div className={`school-info-message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}
