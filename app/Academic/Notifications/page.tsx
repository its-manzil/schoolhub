'use client'

import { useState, useEffect } from 'react'
import { 
  Bell, 
  Send, 
  Users, 
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
} from 'lucide-react'
import AcademicNavbar from '../components/AcademicNavbar'
import '../academic.css'

const TARGETS = [
  { value: 'all', label: 'Everyone' },
  { value: 'students', label: 'All Students' },
  { value: 'parents', label: 'All Parents' },
  { value: 'staff', label: 'All Staff' },
  { value: 'class', label: 'Specific Class' }
]

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

interface Notification {
  _id: string;
  title: string;
  message: string;
  target: string;
  className?: string;
  section?: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState('all')
  const [selectedClass, setSelectedClass] = useState('01')
  const [selectedSection, setSelectedSection] = useState('A')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState({ type: '', text: '' })

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:2056/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success) {
        setNotifications(result.data)
      }
    } catch (err) {
      console.error('Fetch notifications error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleSend = async () => {
    if (!title || !message) {
      setStatus({ type: 'error', text: 'Title and message are required' })
      return
    }

    try {
      setSending(true)
      const token = localStorage.getItem('token')
      const body = {
        title,
        message,
        target,
        className: target === 'class' ? selectedClass : null,
        section: target === 'class' ? selectedSection : null
      }

      const response = await fetch('http://localhost:2056/api/notifications', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      const result = await response.json()
      if (result.success) {
        setStatus({ type: 'success', text: 'Notification sent successfully' })
        setTitle('')
        setMessage('')
        fetchNotifications()
        setTimeout(() => setStatus({ type: '', text: '' }), 3000)
      } else {
        setStatus({ type: 'error', text: result.message })
      }
    } catch (err) {
      console.error('Send notification error:', err)
      setStatus({ type: 'error', text: 'Failed to send notification' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="academic-layout bg-[#f8fafc]">
      <AcademicNavbar />
      <main className="academic-main p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:items-start">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
            <p className="text-slate-500 mt-1">Broadcast important updates and alerts to students, parents, and staff.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Compose Notification */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                    <PlusCircle size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">New Notification</h2>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Target Audience</label>
                    <select 
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      {TARGETS.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {target === 'class' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Class</label>
                        <select 
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        >
                          {CLASS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Section</label>
                        <select 
                          value={selectedSection}
                          onChange={(e) => setSelectedSection(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        >
                          {SECTIONS.map(sec => (
                            <option key={sec} value={sec}>Section {sec}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Title</label>
                    <input 
                      type="text" 
                      placeholder="Enter title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Message</label>
                    <textarea 
                      rows={5}
                      placeholder="Enter message details..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                    />
                  </div>

                  {status.text && (
                    <div className={`p-3 rounded-xl flex items-center gap-2 text-sm font-medium ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                      {status.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {status.text}
                    </div>
                  )}

                  <button 
                    onClick={handleSend}
                    disabled={sending}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send size={18} />
                        Broadcast Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Notification List */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[600px]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                      <Bell size={18} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Sent Notifications</h2>
                  </div>
                  <button onClick={fetchNotifications} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Refresh</button>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Loading history...</p>
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notif) => (
                      <div key={notif._id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{notif.title}</h3>
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100">
                            <Clock size={10} />
                            {new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{notif.message}</p>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-lg uppercase">
                            <Users size={12} />
                            {TARGETS.find(t => t.value === notif.target)?.label}
                            {notif.target === 'class' && ` (Class ${notif.className}${notif.section})`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                      <Bell size={32} />
                    </div>
                    <div className="text-center">
                      <p className="text-slate-900 font-bold">No notifications sent yet</p>
                      <p className="text-slate-500 text-sm mt-1">Sent messages will appear here.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
