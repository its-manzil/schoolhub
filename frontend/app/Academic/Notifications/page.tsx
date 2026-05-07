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
import './notifications.css'

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/notifications`, {
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/notifications`, {
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
    <div className="notif-layout notifications-page">
      <AcademicNavbar />
      <div className="notifications-content-blur">
        <main className="notif-main">
        <div className="notif-container">
          {/* Header */}
          <div className="notif-header">
            <h1 className="notif-title">Notification Center</h1>
            <p className="notif-subtitle">Broadcast important updates and alerts to students, parents, and staff.</p>
          </div>

          <div className="notif-grid">
            {/* Compose Notification */}
            <div className="notif-compose-col">
              <div className="notif-compose-card">
                <div className="notif-compose-header">
                  <div className="notif-compose-icon">
                    <PlusCircle size={18} />
                  </div>
                  <h2>New Notification</h2>
                </div>

                <div className="notif-compose-form">
                  <div className="notif-field">
                    <label>Target Audience</label>
                    <select 
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      className="notif-select"
                    >
                      {TARGETS.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {target === 'class' && (
                    <div className="notif-class-row">
                      <div className="notif-field">
                        <label>Class</label>
                        <select 
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="notif-select"
                        >
                          {CLASS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="notif-field">
                        <label>Section</label>
                        <select 
                          value={selectedSection}
                          onChange={(e) => setSelectedSection(e.target.value)}
                          className="notif-select"
                        >
                          {SECTIONS.map(sec => (
                            <option key={sec} value={sec}>Section {sec}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="notif-field">
                    <label>Title</label>
                    <input 
                      type="text" 
                      placeholder="Enter title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="notif-input"
                    />
                  </div>

                  <div className="notif-field">
                    <label>Message</label>
                    <textarea 
                      rows={5}
                      placeholder="Enter message details..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="notif-textarea"
                    />
                  </div>

                  {status.text && (
                    <div className={`notif-status notif-status-${status.type}`}>
                      {status.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {status.text}
                    </div>
                  )}

                  <button 
                    onClick={handleSend}
                    disabled={sending}
                    className="notif-send-btn"
                  >
                    {sending ? (
                      <span className="notif-spinner-small"></span>
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
            <div className="notif-list-col">
              <div className="notif-list-card">
                <div className="notif-list-header">
                  <div className="notif-list-icon">
                    <Bell size={18} />
                  </div>
                  <h2>Sent Notifications</h2>
                  <button onClick={fetchNotifications} className="notif-refresh-btn">Refresh</button>
                </div>

                {loading ? (
                  <div className="notif-loading">
                    <div className="notif-spinner"></div>
                    <p>Loading history...</p>
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="notif-list">
                    {notifications.map((notif) => (
                      <div key={notif._id} className="notif-item">
                        <div className="notif-item-header">
                          <h3>{notif.title}</h3>
                          <span className="notif-date">
                            <Clock size={10} />
                            {new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="notif-message">{notif.message}</p>
                        <div className="notif-badge">
                          <Users size={12} />
                          {TARGETS.find(t => t.value === notif.target)?.label}
                          {notif.target === 'class' && ` (Class ${notif.className}${notif.section})`}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="notif-empty">
                    <div className="notif-empty-icon">
                      <Bell size={32} />
                    </div>
                    <p className="notif-empty-title">No notifications sent yet</p>
                    <p className="notif-empty-subtitle">Sent messages will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>

      {/* Coming Soon Overlay */}
      <div className="notifications-coming-soon-overlay">
        <h1>Coming Soon 🚧</h1>
        <p>We are working on this feature</p>
        <span className="notifications-soon-desc">Stay tuned for updates!</span>
      </div>
    </div>
  )
}