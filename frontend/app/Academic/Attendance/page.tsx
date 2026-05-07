'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Users, 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Lock,
  AlertTriangle,
  Calendar as CalendarIcon
} from 'lucide-react'
import AcademicNavbar from '../components/AcademicNavbar'
import { 
  getCurrentBSDate, 
  formatBSDate,
  isValidBSDate
} from '../../utils/dateConverter'
import AutoPresentSystem from './components/AutoPresentSystem'
import AttendanceCalendar from './components/AttendanceCalendar'
import AttendanceDashboard from './components/AttendanceDashboard'
import './attendence.css'

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

const SECTIONS = ['A', 'B', 'C', 'D']

interface AttendanceRecord {
  studentId?: string;
  staffId?: string;
  name: string;
  rollNumber?: number;
  status: 'present' | 'absent' | 'late';
  designation?: string;
  isLocked?: boolean;
  isModified?: boolean;
  modificationReason?: string;
  modifiedByRole?: string;
  bsDate?: string;
}

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<'student' | 'staff'>('student')
  const [selectedClass, setSelectedClass] = useState('01')
  const [selectedSection, setSelectedSection] = useState('A')
  const [selectedDate, setSelectedDate] = useState(formatBSDate(getCurrentBSDate()))
  const [displayDate, setDisplayDate] = useState(formatBSDate(getCurrentBSDate()))
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [userRole, setUserRole] = useState<string>('')
  const [showCalendar, setShowCalendar] = useState(false)
  const [overrideReason, setOverrideReason] = useState('')
  const [showOverrideModal, setShowOverrideModal] = useState(false)

  // Get user role on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUserRole(payload.role || '')
      } catch {
        console.error('Failed to decode token')
      }
    }
  }, [])

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const endpoint = activeTab === 'student' 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/attendance/students?className=${selectedClass}&section=${selectedSection}&date=${displayDate}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/attendance/staff?date=${displayDate}`
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success) {
        setAttendanceData(result.data)
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (err) {
      console.error('Fetch attendance error:', err)
      setMessage({ type: 'error', text: 'Failed to connect to server' })
    } finally {
      setLoading(false)
    }
  }, [activeTab, selectedClass, selectedSection, displayDate])

  useEffect(() => {
    fetchAttendance()
  }, [activeTab, selectedClass, selectedSection, displayDate, fetchAttendance])

  // Check if editing is allowed (today only, and not locked)
  const isEditingAllowed = (): boolean => {
    const today = formatBSDate(getCurrentBSDate())
    return displayDate === today
  }

  const canModifyRecord = (item: AttendanceRecord): boolean => {
    // If record is not locked, can edit
    if (!item.isLocked) return true
    // If locked, only schoolAdmin can override
    return userRole === 'schooladmin' || userRole === 'superadmin'
  }

  const handleStatusChange = (recordId: string, status: 'present' | 'absent' | 'late') => {
    if (!isEditingAllowed()) {
      setMessage({ type: 'error', text: 'Attendance can only be modified for today' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return
    }

    setAttendanceData(prev => prev.map(item => {
      const itemId = item.studentId || item.staffId
      if (itemId !== recordId) return item

      // Check if can modify
      if (!canModifyRecord(item)) {
        setShowOverrideModal(true)
        return item
      }

      // If already modified once, check override
      if (item.isModified && userRole !== 'schooladmin' && userRole !== 'superadmin') {
        setShowOverrideModal(true)
        return item
      }

      return { ...item, status }
    }))
  }

  const saveAttendance = async () => {
    if (!isEditingAllowed()) {
      setMessage({ type: 'error', text: 'Attendance can only be saved for today' })
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const endpoint = activeTab === 'student' 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/attendance/students`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/attendance/staff`
      
      const body = activeTab === 'student'
        ? { 
            className: selectedClass, 
            section: selectedSection, 
            date: displayDate, 
            attendance: attendanceData.map(a => ({ 
              studentId: a.studentId, 
              status: a.status,
              isModified: a.isModified || false,
              modificationReason: overrideReason || undefined
            })) 
          }
        : { 
            date: displayDate, 
            attendance: attendanceData.map(a => ({ 
              staffId: a.staffId, 
              status: a.status,
              isModified: a.isModified || false,
              modificationReason: overrideReason || undefined
            })) 
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      const result = await response.json()
      if (result.success) {
        setMessage({ type: 'success', text: 'Attendance saved successfully' })
        setOverrideReason('')
        fetchAttendance()
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (err) {
      console.error('Save attendance error:', err)
      setMessage({ type: 'error', text: 'Failed to save attendance' })
    } finally {
      setSaving(false)
    }
  }

  const handleMarkAllPresent = () => {
    if (!isEditingAllowed()) {
      setMessage({ type: 'error', text: 'Can only mark attendance for today' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return
    }

    setAttendanceData(prev => prev.map(item => {
      if (item.isLocked) return item
      return { ...item, status: 'present' }
    }))
  }

  const handleDateSelect = (date: string) => {
    setDisplayDate(date)
    setSelectedDate(date)
    setShowCalendar(false)
  }

  const validateBSDateInput = (value: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/
    if (!regex.test(value)) return false
    
    const parts = value.split('-').map(Number)
    const [year, month, day] = parts
    
    if (month < 1 || month > 12) return false
    if (day < 1 || day > 32) return false
    if (year < 2000 || year > 2100) return false
    
    return isValidBSDate({ year, month, day })
  }

  const handleDateInputChange = (value: string) => {
    setSelectedDate(value)
    if (validateBSDateInput(value)) {
      setDisplayDate(value)
    }
  }

  return (
    <div className="atten-layout">
      <AcademicNavbar />
      <main className="atten-main">
        <div className="atten-container">
          {/* Header */}
          <div className="atten-header">
            <div>
              <h1 className="atten-title">Attendance Management</h1>
              <p className="atten-subtitle">Record and track daily attendance for students and staff (BS Date).</p>
            </div>
            <div className="atten-tab-group">
              <button 
                onClick={() => setActiveTab('student')}
                className={`atten-tab ${activeTab === 'student' ? 'atten-tab-active' : ''}`}
              >
                Students
              </button>
              <button 
                onClick={() => setActiveTab('staff')}
                className={`atten-tab ${activeTab === 'staff' ? 'atten-tab-active' : ''}`}
              >
                Staff
              </button>
            </div>
          </div>

          {/* Dashboard */}
          <AttendanceDashboard 
            selectedDate={displayDate}
            className={activeTab === 'student' ? selectedClass : undefined}
            section={activeTab === 'student' ? selectedSection : undefined}
          />

          {/* Filters */}
          <div className="atten-filters">
            <div className="atten-filters-grid">
              {activeTab === 'student' && (
                <>
                  <div className="atten-filter-field">
                    <label className="atten-filter-label">Class</label>
                    <select 
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="atten-select"
                    >
                      {CLASS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="atten-filter-field">
                    <label className="atten-filter-label">Section</label>
                    <select 
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      className="atten-select"
                    >
                      {SECTIONS.map(sec => (
                        <option key={sec} value={sec}>Section {sec}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div className="atten-filter-field">
                <label className="atten-filter-label">Date (BS) - YYYY-MM-DD</label>
                <input 
                  type="text" 
                  value={selectedDate}
                  onChange={(e) => handleDateInputChange(e.target.value)}
                  placeholder="2081-04-15"
                  className="atten-date-input"
                />
              </div>
              <div className="atten-filter-actions">
                <button onClick={fetchAttendance} className="atten-btn atten-btn-secondary">
                  <Search size={18} />
                  Load
                </button>
                <AutoPresentSystem 
                  attendanceData={attendanceData}
                  onMarkAllPresent={handleMarkAllPresent}
                  disabled={!isEditingAllowed()}
                />
                <button 
                  onClick={saveAttendance}
                  disabled={saving || attendanceData.length === 0 || !isEditingAllowed()}
                  className="atten-btn atten-btn-primary"
                >
                  {saving ? (
                    <span className="atten-spinner-small"></span>
                  ) : (
                    <>
                      <Save size={18} />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
            {!isEditingAllowed() && (
              <div className="atten-edit-warning">
                <AlertTriangle size={16} />
                <span>Attendance can only be marked for today (BS: {formatBSDate(getCurrentBSDate())}). Viewing historical data.</span>
              </div>
            )}
          </div>

          {/* Calendar Toggle */}
          <div className="atten-calendar-toggle">
            <button 
              onClick={() => setShowCalendar(!showCalendar)}
              className="atten-btn atten-btn-secondary"
            >
              <CalendarIcon size={18} />
              {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
            </button>
          </div>

          {/* Calendar */}
          {showCalendar && (
            <div className="atten-calendar-section">
              <AttendanceCalendar 
                onDateSelect={handleDateSelect}
                selectedDate={displayDate}
                type={activeTab}
                className={activeTab === 'student' ? selectedClass : undefined}
                section={activeTab === 'student' ? selectedSection : undefined}
              />
            </div>
          )}

          {/* Message */}
          {message.text && (
            <div className={`atten-message atten-message-${message.type}`}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Attendance Table */}
          <div className="atten-table-container">
            {loading ? (
              <div className="atten-loading">
                <div className="atten-spinner"></div>
                <p>Loading attendance data...</p>
              </div>
            ) : attendanceData.length > 0 ? (
              <div className="atten-table-wrapper">
                <table className="atten-table">
                  <thead>
                    <tr>
                      <th>{activeTab === 'student' ? 'Roll No' : 'ID'}</th>
                      <th>Name</th>
                      {activeTab === 'staff' && <th>Designation</th>}
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((record) => {
                    const recordId = record.studentId || record.staffId || ''
                    return (
                      <tr key={recordId} className={record.isLocked ? 'atten-row-locked' : ''}>
                        <td>
                          <span className="atten-badge">
                            {activeTab === 'student' ? (record.rollNumber ?? 'N/A') : (record.staffId || 'N/A').slice(-4)}
                          </span>
                          {record.isLocked && (
                            <span className="atten-lock-icon" title="Locked - Modified once">
                              <Lock size={14} />
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="atten-user-cell">
                            <div className="atten-avatar">{record.name.charAt(0)}</div>
                            <span>{record.name}</span>
                          </div>
                        </td>
                        {activeTab === 'staff' && (
                          <td>
                            <span className="atten-designation">{record.designation}</span>
                          </td>
                        )}
                        <td>
                          <div className="atten-status-buttons">
                            <button 
                              onClick={() => handleStatusChange(recordId, 'present')}
                              disabled={record.isLocked && userRole !== 'schooladmin' && userRole !== 'superadmin'}
                              className={`atten-status-btn atten-status-present ${record.status === 'present' ? 'active' : ''}`}
                            >
                              <CheckCircle2 size={14} />
                              Present
                            </button>
                            <button 
                              onClick={() => handleStatusChange(recordId, 'absent')}
                              disabled={record.isLocked && userRole !== 'schooladmin' && userRole !== 'superadmin'}
                              className={`atten-status-btn atten-status-absent ${record.status === 'absent' ? 'active' : ''}`}
                            >
                              <XCircle size={14} />
                              Absent
                            </button>
                            <button 
                              onClick={() => handleStatusChange(recordId, 'late')}
                              disabled={record.isLocked && userRole !== 'schooladmin' && userRole !== 'superadmin'}
                              className={`atten-status-btn atten-status-late ${record.status === 'late' ? 'active' : ''}`}
                            >
                              <Clock size={14} />
                              Late
                            </button>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="atten-empty">
                <div className="atten-empty-icon">
                  <Users size={32} />
                </div>
                <p>No students found for this class/section.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Override Modal */}
      {showOverrideModal && (
        <div className="atten-modal-overlay">
          <div className="atten-modal">
            <div className="atten-modal-header">
              <Lock size={24} />
              <h3>Override Required</h3>
            </div>
            <div className="atten-modal-body">
              <p>This attendance record has been modified once and is locked.</p>
              <p>Only School Admin can override. Please provide a reason:</p>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Enter reason for override..."
                className="atten-override-input"
                rows={3}
              />
            </div>
            <div className="atten-modal-actions">
              <button onClick={() => setShowOverrideModal(false)} className="atten-btn atten-btn-secondary">
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowOverrideModal(false)
                  if (userRole === 'schooladmin' || userRole === 'superadmin') {
                    setMessage({ type: 'success', text: 'Override authorized. Save to apply changes.' })
                  } else {
                    setMessage({ type: 'error', text: 'Only School Admin can override locked records.' })
                  }
                }}
                disabled={!overrideReason.trim()}
                className="atten-btn atten-btn-primary"
              >
                Confirm Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}