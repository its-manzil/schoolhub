'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  FileText,
  DollarSign,
  MessageSquare,
  Bell,
  ChevronRight,
  Award,
  CreditCard
} from 'lucide-react'
import AcademicNavbar from '../Academic/components/AcademicNavbar'
import '../Academic/academic.css'

export default function ParentDashboard() {
  const [, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [selectedChild, setSelectedChild] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:2056/api/dashboard/parent', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const result = await response.json()
        if (result.success) {
          setData(result.data)
        }
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="academic-layout bg-[#f8fafc]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  const children = dummyChildren

  return (
    <div className="academic-layout bg-[#f8fafc]">
      <AcademicNavbar />
      <main className="academic-main p-4 lg:p-8 overflow-y-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Parent Portal</h1>
            <p className="text-slate-500 mt-1">Monitor your children&apos;s academic journey.</p>
          </div>
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            {children.map((child, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedChild(idx)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedChild === idx ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {child.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Child Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <KPICard title="Attendance" value={children[selectedChild].attendance} subtext="Present this month" icon={<CheckCircle2 className="text-emerald-600" />} color="bg-emerald-50" />
          <KPICard title="Average Grade" value={children[selectedChild].grade} subtext="Last examination" icon={<Award className="text-amber-600" />} color="bg-amber-50" />
          <KPICard title="Pending Fees" value={children[selectedChild].fees} subtext="Due this week" icon={<DollarSign className="text-rose-600" />} color="bg-rose-50" />
          <KPICard title="Next Exam" value={children[selectedChild].nextExam} subtext="In 5 days" icon={<Calendar className="text-blue-600" />} color="bg-blue-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Recent Activity & Reports */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Academic Performance</h3>
              <div className="space-y-4">
                {children[selectedChild].subjects.map((s: { name: string; teacher: string; score: number; trend: string }, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-500">Teacher: {s.teacher}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{s.score}%</p>
                      <p className={`text-[10px] font-bold uppercase ${s.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {s.trend === 'up' ? 'Improving' : 'Needs Attention'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Recent School Notices</h3>
              <div className="space-y-4">
                {dummyNotices.map((n, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{n.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.desc}</p>
                      <span className="text-[10px] text-slate-400 font-bold mt-2 block uppercase">{n.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:space-y-8">
            {/* Quick Actions */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full p-4 flex items-center justify-between bg-indigo-50/50 rounded-xl border border-indigo-100 hover:bg-indigo-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <CreditCard size={20} className="text-indigo-600" />
                    <span className="text-sm font-bold text-slate-800">Pay Fees</span>
                  </div>
                  <ChevronRight size={18} className="text-indigo-300 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full p-4 flex items-center justify-between bg-emerald-50/50 rounded-xl border border-emerald-100 hover:bg-emerald-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={20} className="text-emerald-600" />
                    <span className="text-sm font-bold text-slate-800">Chat with Teachers</span>
                  </div>
                  <ChevronRight size={18} className="text-emerald-300 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full p-4 flex items-center justify-between bg-blue-50/50 rounded-xl border border-blue-100 hover:bg-blue-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-blue-600" />
                    <span className="text-sm font-bold text-slate-800">Leave Application</span>
                  </div>
                  <ChevronRight size={18} className="text-blue-300 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </section>

            {/* Attendance Summary */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Attendance Summary</h3>
              <div className="flex items-center justify-center p-8">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * 0.96)} className="text-indigo-500" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold text-slate-900">96%</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Present</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

function KPICard({ title, value, subtext, icon, color }: { title: string; value: string; subtext: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-indigo-100 group">
      <div className={`p-2.5 rounded-xl ${color} w-fit mb-4 group-hover:scale-110 transition-transform`}>{icon}</div>
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        <span className="text-xs text-slate-400 font-medium">{subtext}</span>
      </div>
    </div>
  )
}

const dummyChildren = [
  {
    name: 'Aarav Sharma',
    grade: 'A+',
    attendance: '98%',
    fees: 'Rs. 0',
    nextExam: 'Mathematics',
    subjects: [
      { name: 'Mathematics', teacher: 'Mr. Verma', score: 95, trend: 'up' },
      { name: 'Science', teacher: 'Ms. Gupta', score: 88, trend: 'up' },
      { name: 'English', teacher: 'Mr. Das', score: 72, trend: 'down' },
    ]
  },
  {
    name: 'Ishani Sharma',
    grade: 'A',
    attendance: '94%',
    fees: 'Rs. 5,500',
    nextExam: 'Science',
    subjects: [
      { name: 'Mathematics', teacher: 'Mr. Verma', score: 82, trend: 'up' },
      { name: 'Science', teacher: 'Ms. Gupta', score: 94, trend: 'up' },
      { name: 'English', teacher: 'Mr. Das', score: 88, trend: 'up' },
    ]
  },
]

const dummyNotices = [
  { title: 'Annual Sports Meet', desc: 'The annual sports meet will be held on April 15th at the city stadium.', date: 'Mar 25, 2024' },
  { title: 'Summer Vacation Dates', desc: 'Summer break will start from May 20th and classes resume on July 1st.', date: 'Mar 22, 2024' },
]

function Calendar({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    </div>
  )
}
