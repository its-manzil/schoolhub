'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Save
} from 'lucide-react'
import AcademicNavbar from '../components/AcademicNavbar'
import '../academic.css'

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

  const fetchAttendance = async () => {
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
  }

  useEffect(() => {
    fetchAttendance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedClass, selectedSection, selectedDate])

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
    <div className="academic-layout bg-[#f8fafc]">
      <AcademicNavbar />
      <main className="academic-main p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Management</h1>
              <p className="text-slate-500 mt-1">Record and track daily attendance for students and staff.</p>
            </div>
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <button 
                onClick={() => setActiveTab('student')}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'student' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Students
              </button>
              <button 
                onClick={() => setActiveTab('staff')}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'staff' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Staff
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {activeTab === 'student' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Class</label>
                    <div className="relative">
                      <select 
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none"
                      >
                        {CLASS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Section</label>
                    <select 
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      {SECTIONS.map(sec => (
                        <option key={sec} value={sec}>Section {sec}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={fetchAttendance}
                  className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Search size={18} />
                  Load
                </button>
                <button 
                  onClick={saveAttendance}
                  disabled={saving || attendanceData.length === 0}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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

          {/* Success/Error Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loading ? (
              <div className="p-20 text-center">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 font-medium">Loading attendance data...</p>
              </div>
            ) : attendanceData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {activeTab === 'student' ? 'Roll No' : 'ID'}
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                      {activeTab === 'staff' && (
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Designation</th>
                      )}
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {attendanceData.map((record) => (
                      <tr key={record.studentId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">
                            {activeTab === 'student' ? record.rollNumber : record.studentId.slice(-4)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                              {record.name.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{record.name}</span>
                          </div>
                        </td>
                        {activeTab === 'staff' && (
                          <td className="px-6 py-4">
                            <span className="text-xs font-medium text-slate-500">{record.designation}</span>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleStatusChange(record.studentId, 'present')}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${record.status === 'present' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'}`}
                            >
                              <CheckCircle2 size={14} />
                              Present
                            </button>
                            <button 
                              onClick={() => handleStatusChange(record.studentId, 'absent')}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${record.status === 'absent' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'}`}
                            >
                              <XCircle size={14} />
                              Absent
                            </button>
                            <button 
                              onClick={() => handleStatusChange(record.studentId, 'late')}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${record.status === 'late' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'}`}
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
              <div className="p-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                  <Users size={32} />
                </div>
                <p className="text-slate-500 font-medium">No students found for this class/section.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
