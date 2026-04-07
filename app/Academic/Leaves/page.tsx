'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Search,
  Calendar,
} from 'lucide-react'
import AcademicNavbar from '../components/AcademicNavbar'
import './leaves.css'

interface LeaveRequest {
  _id: string;
  applicantId: string;
  applicantName: string;
  applicantRole: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  createdAt: string;
}

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null)
  const [remarks, setRemarks] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchLeaves = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:2056/api/leaves', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success) {
        setLeaves(result.data)
      }
    } catch (err) {
      console.error('Fetch leaves error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaves()
  }, [])

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setIsUpdating(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:2056/api/leaves/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, remarks })
      })
      const result = await response.json()
      if (result.success) {
        setSelectedLeave(null)
        setRemarks('')
        fetchLeaves()
      }
    } catch (err) {
      console.error('Update leave error:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredLeaves = leaves.filter(leave => {
    const matchesStatus = filterStatus === 'all' || leave.status === filterStatus
    const matchesSearch = leave.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          leave.reason.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="leaves-layout">
      <AcademicNavbar />
      <main className="leaves-main">
        <div className="leaves-container">
          {/* Header */}
          <div className="leaves-header">
            <h1 className="leaves-title">Leave Management</h1>
            <p className="leaves-subtitle">Review and manage leave applications from teachers and staff.</p>
          </div>

          {/* Filters & Actions */}
          <div className="leaves-filters">
            <div className="leaves-search-wrapper">
              <Search className="leaves-search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search applicant or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="leaves-search-input"
              />
            </div>
            <div className="leaves-filter-group">
              <div className="leaves-status-tabs">
                {['all', 'pending', 'approved', 'rejected'].map((s) => (
                  <button 
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`leaves-status-tab ${filterStatus === s ? 'active' : ''}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button onClick={fetchLeaves} className="leaves-refresh-btn">
                Refresh
              </button>
            </div>
          </div>

          {/* Leaves Grid */}
          {loading ? (
            <div className="leaves-loading">
              <div className="leaves-spinner"></div>
              <p>Loading leave applications...</p>
            </div>
          ) : filteredLeaves.length > 0 ? (
            <div className="leaves-grid">
              {filteredLeaves.map((leave) => (
                <div key={leave._id} className="leaves-card">
                  <div className="leaves-card-header">
                    <div className="leaves-applicant">
                      <div className="leaves-avatar">{leave.applicantName.charAt(0)}</div>
                      <div>
                        <h3 className="leaves-name">{leave.applicantName}</h3>
                        <span className="leaves-role">{leave.applicantRole}</span>
                      </div>
                    </div>
                    <span className={`leaves-status-badge leaves-status-${leave.status}`}>
                      {leave.status}
                    </span>
                  </div>
                  <div className="leaves-card-dates">
                    <Calendar size={14} />
                    {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                    {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="leaves-card-reason">
                    &quot;{leave.reason}&quot;
                  </div>
                  {leave.status === 'pending' ? (
                    <button 
                      onClick={() => setSelectedLeave(leave)}
                      className="leaves-review-btn"
                    >
                      Review
                    </button>
                  ) : (
                    <div className="leaves-processed">
                      <span>Processed</span>
                      <span>{new Date(leave.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="leaves-empty">
              <div className="leaves-empty-icon">
                <FileText size={32} />
              </div>
              <h3>No leave applications found</h3>
              <p>Applications matching your filters will appear here.</p>
            </div>
          )}
        </div>

        {/* Review Modal */}
        {selectedLeave && (
          <div className="leaves-modal-overlay">
            <div className="leaves-modal">
              <div className="leaves-modal-header">
                <h2>Review Leave Application</h2>
                <button onClick={() => setSelectedLeave(null)} className="leaves-modal-close">
                  <XCircle size={24} />
                </button>
              </div>
              <div className="leaves-modal-body">
                <div className="leaves-modal-applicant">
                  <div className="leaves-modal-avatar">{selectedLeave.applicantName.charAt(0)}</div>
                  <div>
                    <h3>{selectedLeave.applicantName}</h3>
                    <p>{selectedLeave.applicantRole} • {selectedLeave.type}</p>
                  </div>
                </div>
                <div className="leaves-modal-dates">
                  <div>
                    <span>Start Date</span>
                    <p>{new Date(selectedLeave.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span>End Date</span>
                    <p>{new Date(selectedLeave.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="leaves-modal-reason">
                  <span>Reason for Leave</span>
                  <div>&quot;{selectedLeave.reason}&quot;</div>
                </div>
                <div className="leaves-modal-remarks">
                  <label>Admin Remarks (Optional)</label>
                  <textarea 
                    placeholder="Enter remarks or reason for rejection..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              </div>
              <div className="leaves-modal-actions">
                <button 
                  onClick={() => handleUpdateStatus(selectedLeave._id, 'rejected')}
                  disabled={isUpdating}
                  className="leaves-btn-reject"
                >
                  {isUpdating ? <span className="leaves-spinner-small"></span> : <XCircle size={18} />}
                  Reject
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedLeave._id, 'approved')}
                  disabled={isUpdating}
                  className="leaves-btn-approve"
                >
                  {isUpdating ? <span className="leaves-spinner-small"></span> : <CheckCircle2 size={18} />}
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}