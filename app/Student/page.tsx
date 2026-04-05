'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle2, 
  FileText,
  Award,
  Bell,
  Star,
  Download
} from 'lucide-react'
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import AcademicNavbar from '../Academic/components/AcademicNavbar'
import '../Academic/academic.css'

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:2056/api/dashboard/student', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const result = await response.json()
        if (result.success) {
          // setData(result.data)
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

  return (
    <div className="academic-layout bg-[#f8fafc]">
      <AcademicNavbar />
      <main className="academic-main p-4 lg:p-8 overflow-y-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Portal</h1>
            <p className="text-slate-500 mt-1">Check your progress and upcoming assignments.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-slate-600 transition-colors shadow-sm relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 flex items-center gap-2">
              <Download size={18} />
              Report Card
            </button>
          </div>
        </div>

        {/* Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <KPICard title="Attendance" value="96%" subtext="Present 18/20 days" icon={<CheckCircle2 className="text-emerald-600" />} color="bg-emerald-50" />
          <KPICard title="Avg Grade" value="A (88%)" subtext="Across all subjects" icon={<Award className="text-amber-600" />} color="bg-amber-50" />
          <KPICard title="Assignments" value="12/15" subtext="Completed this month" icon={<FileText className="text-indigo-600" />} color="bg-indigo-50" />
          <KPICard title="Class Rank" value="#05" subtext="Out of 45 students" icon={<Star className="text-blue-600" />} color="bg-blue-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Grade History */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Grade History</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dummyGradeHistory}>
                    <defs>
                      <linearGradient id="colorGrades" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="exam" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip />
                    <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorGrades)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Subject Grades */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Subject Progress</h3>
              <div className="space-y-4">
                {dummySubjectProgress.map((s, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-700">{s.subject}</span>
                      <span className="text-xs font-bold text-indigo-600">{s.grade}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${s.grade}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:space-y-8">
            {/* Today's Classes */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Today&apos;s Classes</h3>
              <div className="space-y-4">
                {dummyTodayClasses.map((c, idx) => (
                  <div key={idx} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="w-1 h-10 bg-indigo-500 rounded-full"></div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{c.subject}</h4>
                      <p className="text-xs text-slate-500">{c.time} • Room {c.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Upcoming Deadlines */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Deadlines</h3>
              <div className="space-y-4">
                {dummyDeadlines.map((d, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        d.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {d.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">{d.daysLeft} days left</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">{d.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{d.subject}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

interface KPICardProps {
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  color: string;
}

function KPICard({ title, value, subtext, icon, color }: KPICardProps) {
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

const dummyGradeHistory = [
  { exam: 'Unit 1', score: 75 },
  { exam: 'Unit 2', score: 82 },
  { exam: 'Mid-Term', score: 78 },
  { exam: 'Unit 3', score: 85 },
  { exam: 'Unit 4', score: 92 },
  { exam: 'Finals', score: 88 },
]

const dummySubjectProgress = [
  { subject: 'Mathematics', grade: 92 },
  { subject: 'Physics', grade: 85 },
  { subject: 'Computer Science', grade: 96 },
  { subject: 'English', grade: 78 },
]

const dummyTodayClasses = [
  { subject: 'Mathematics', time: '09:00 AM', room: '302' },
  { subject: 'Physics', time: '10:30 AM', room: 'Lab 1' },
  { subject: 'Computer Science', time: '01:00 PM', room: 'IT Hall' },
]

const dummyDeadlines = [
  { title: 'Calculus Assignment', subject: 'Mathematics', daysLeft: 2, priority: 'High' },
  { title: 'Optics Lab Report', subject: 'Physics', daysLeft: 5, priority: 'Normal' },
]
