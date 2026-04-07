'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Users, 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Save
} from 'lucide-react'
import AcademicNavbar from '../components/AcademicNavbar'
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
  studentId: string;
  name: string;
  rollNumber: number;
  status: 'present' | 'absent' | 'late';
  designation?: string;
}

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<'student' | 'staff'>('student')
  const [selectedClass, setSelectedClass] = useState('01')
  const [selectedSection, setSelectedSection] = useState('A')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const endpoint = activeTab === 'student' 
        ? `http://localhost:2056/api/attendance/students?className=${selectedClass}&section=${selectedSection}&date=${selectedDate}`
        : `http://localhost:2056/api/attendance/staff?date=${selectedDate}`
      
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
  }, [activeTab, selectedClass, selectedSection, selectedDate])

  useEffect(() => {
    fetchAttendance()
  }, [activeTab, selectedClass, selectedSection, selectedDate, fetchAttendance])

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceData(prev => prev.map(item => 
      item.studentId === studentId ? { ...item, status } : item
    ))
  }

  const saveAttendance = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const endpoint = activeTab === 'student' 
        ? 'http://localhost:2056/api/attendance/students'
        : 'http://localhost:2056/api/attendance/staff'
      
      const body = activeTab === 'student'
        ? { className: selectedClass, section: selectedSection, date: selectedDate, attendance: attendanceData }
        : { date: selectedDate, attendance: attendanceData.map(a => ({ staffId: a.studentId, status: a.status })) }

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

  return (
    <div className="atten-layout">
      <AcademicNavbar />
      <main className="atten-main">
        <div className="atten-container">
          {/* Header */}
          <div className="atten-header">
            <div>
              <h1 className="atten-title">Attendance Management</h1>
              <p className="atten-subtitle">Record and track daily attendance for students and staff.</p>
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
                <label className="atten-filter-label">Date</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="atten-date-input"
                />
              </div>
              <div className="atten-filter-actions">
                <button onClick={fetchAttendance} className="atten-btn atten-btn-secondary">
                  <Search size={18} />
                  Load
                </button>
                <button 
                  onClick={saveAttendance}
                  disabled={saving || attendanceData.length === 0}
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
          </div>

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
                    {attendanceData.map((record) => (
                      <tr key={record.studentId}>
                        <td>
                          <span className="atten-badge">
                            {activeTab === 'student' ? record.rollNumber : record.studentId.slice(-4)}
                          </span>
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
                              onClick={() => handleStatusChange(record.studentId, 'present')}
                              className={`atten-status-btn atten-status-present ${record.status === 'present' ? 'active' : ''}`}
                            >
                              <CheckCircle2 size={14} />
                              Present
                            </button>
                            <button 
                              onClick={() => handleStatusChange(record.studentId, 'absent')}
                              className={`atten-status-btn atten-status-absent ${record.status === 'absent' ? 'active' : ''}`}
                            >
                              <XCircle size={14} />
                              Absent
                            </button>
                            <button 
                              onClick={() => handleStatusChange(record.studentId, 'late')}
                              className={`atten-status-btn atten-status-late ${record.status === 'late' ? 'active' : ''}`}
                            >
                              <Clock size={14} />
                              Late
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
    </div>
  )
}