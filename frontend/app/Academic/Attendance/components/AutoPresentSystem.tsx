'use client'

import { useState } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import './AutoPresentSystem.css'

interface AutoPresentSystemProps {
  attendanceData: Array<{
    studentId?: string
    staffId?: string
    name: string
    status: 'present' | 'absent' | 'late'
    isLocked?: boolean
  }>
  onMarkAllPresent: () => void
  disabled?: boolean
}

export default function AutoPresentSystem({ 
  attendanceData, 
  onMarkAllPresent,
  disabled = false
}: AutoPresentSystemProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleMarkAllClick = () => {
    if (disabled) return
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    onMarkAllPresent()
    setShowConfirm(false)
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  // Count records that would be affected (excluding locked ones)
  const unlockedCount = attendanceData.filter(item => !item.isLocked).length
  const lockedCount = attendanceData.filter(item => item.isLocked).length

  return (
    <div className="auto-present-container">
      <button
        onClick={handleMarkAllClick}
        disabled={disabled || attendanceData.length === 0}
        className="auto-present-btn"
      >
        <CheckCircle2 size={18} />
        Mark All Present
      </button>

      {showConfirm && (
        <div className="auto-present-modal-overlay">
          <div className="auto-present-modal">
            <div className="auto-present-modal-header">
              <AlertCircle size={24} className="auto-present-modal-icon" />
              <h3>Confirm Action</h3>
            </div>
            <div className="auto-present-modal-body">
              <p>Are you sure you want to mark all <strong>{unlockedCount}</strong> records as present?</p>
              {lockedCount > 0 && (
                <p className="auto-present-locked-info">
                  ({lockedCount} locked records will not be modified)
                </p>
              )}
            </div>
            <div className="auto-present-modal-actions">
              <button onClick={handleCancel} className="auto-present-btn-cancel">
                Cancel
              </button>
              <button onClick={handleConfirm} className="auto-present-btn-confirm">
                Yes, Mark All Present
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
