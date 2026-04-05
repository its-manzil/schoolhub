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
import '../academic.css'

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
    <div className="academic-layout bg-[#f8fafc]">
      <AcademicNavbar />
      <main className="academic-main p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Management</h1>
            <p className="text-slate-500 mt-1">Review and manage leave applications from teachers and staff.</p>
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search applicant or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                {['all', 'pending', 'approved', 'rejected'].map((s) => (
                  <button 
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${filterStatus === s ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button 
                onClick={fetchLeaves}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors shadow-sm"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Leaves Table/Grid */}
          {loading ? (
            <div className="bg-white p-20 rounded-2xl border border-slate-100 text-center">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500 font-medium">Loading leave applications...</p>
            </div>
          ) : filteredLeaves.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLeaves.map((leave) => (
                <div key={leave._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-5 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                          {leave.applicantName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{leave.applicantName}</h3>
                          <span className="text-xs font-medium text-slate-500 capitalize">{leave.applicantRole}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        leave.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                        leave.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {leave.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-indigo-600" />
                        {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                        {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-slate-600 mb-6 line-clamp-3 min-h-[60px] italic">
                      &quot;{leave.reason}&quot;
                    </p>
                    {leave.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedLeave(leave)}
                          className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                        >
                          Review
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs font-medium pt-2 border-t border-slate-50">
                        <span className="text-slate-400">Processed</span>
                        <span className="text-slate-600 font-bold">{new Date(leave.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-20 rounded-2xl border border-slate-100 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-slate-900 font-bold">No leave applications found</h3>
              <p className="text-slate-500 text-sm mt-1">Applications matching your filters will appear here.</p>
            </div>
          )}
        </div>

        {/* Review Modal */}
        {selectedLeave && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-900">Review Leave Application</h2>
                <button onClick={() => setSelectedLeave(null)} className="p-2 hover:bg-white rounded-full transition-colors">
                  <XCircle size={24} className="text-slate-400" />
                </button>
              </div>
              <div className="p-8">
                <div className="mb-6 space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {selectedLeave.applicantName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{selectedLeave.applicantName}</h3>
                      <p className="text-sm text-slate-500 capitalize">{selectedLeave.applicantRole} • {selectedLeave.type}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Start Date</span>
                      <p className="font-bold text-slate-700 mt-0.5">{new Date(selectedLeave.startDate).toLocaleDateString()}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">End Date</span>
                      <p className="font-bold text-slate-700 mt-0.5">{new Date(selectedLeave.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Reason for Leave</span>
                    <div className="p-4 bg-slate-50 rounded-2xl text-slate-700 text-sm leading-relaxed italic">
                      &quot;{selectedLeave.reason}&quot;
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Admin Remarks (Optional)</label>
                    <textarea 
                      placeholder="Enter remarks or reason for rejection..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleUpdateStatus(selectedLeave._id, 'rejected')}
                    disabled={isUpdating}
                    className="py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                  >
                    {isUpdating ? <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin"></div> : <XCircle size={18} />}
                    Reject
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedLeave._id, 'approved')}
                    disabled={isUpdating}
                    className="py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                  >
                    {isUpdating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <CheckCircle2 size={18} />}
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
