'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText,
  MessageSquare,
  Search,
  MoreVertical,
  Activity,
  ArrowUpRight,
  PlusCircle,
  ClipboardCheck,
  Award
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import AcademicNavbar from '../Academic/components/AcademicNavbar'
import '../Academic/academic.css'

export default function TeacherDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:2056/api/dashboard/teacher', {
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

  return (
    <div className="academic-layout bg-[#f8fafc]">
      <AcademicNavbar />
      <main className="academic-main p-4 lg:p-8 overflow-y-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Teacher Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back! Here's your schedule for today.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 flex items-center gap-2">
              <PlusCircle size={18} />
              New Assignment
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <KPICard title="Total Students" value="120" subtext="Across 4 classes" icon={<Users className="text-indigo-600" />} color="bg-indigo-50" />
          <KPICard title="Pending Tasks" value="8" subtext="Grading & Reports" icon={<ClipboardCheck className="text-amber-600" />} color="bg-amber-50" />
          <KPICard title="Attendance" value="94%" subtext="Average this week" icon={<CheckCircle2 className="text-emerald-600" />} color="bg-emerald-50" />
          <KPICard title="Active Exams" value="2" subtext="In progress" icon={<FileText className="text-blue-600" />} color="bg-blue-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Today's Schedule */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Today's Schedule</h3>
              <div className="space-y-4">
                {dummySchedule.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                    <div className="w-16 text-center">
                      <p className="text-sm font-bold text-slate-700">{item.time}</p>
                    </div>
                    <div className="w-1 h-10 bg-indigo-500 rounded-full"></div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-800">{item.subject}</h4>
                      <p className="text-xs text-slate-500">Class {item.class} • Room {item.room}</p>
                    </div>
                    <button className="p-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Performance Chart */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Class Performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dummyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="class" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:space-y-8">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Recent Messages</h3>
              <div className="space-y-4">
                {dummyMessages.map((msg, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                      {msg.sender.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-800">{msg.sender}</h4>
                        <span className="text-[10px] text-slate-400">{msg.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2.5 text-indigo-600 text-xs font-bold hover:bg-indigo-50 rounded-xl transition-colors">
                Open Messenger
              </button>
            </section>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Top Students</h3>
              <div className="space-y-4">
                {dummyTopStudents.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-xs">
                        {idx + 1}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                    </div>
                    <span className="text-xs font-bold text-indigo-600">{s.grade}</span>
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

function KPICard({ title, value, subtext, icon, color }: any) {
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

const dummySchedule = [
  { time: '09:00 AM', subject: 'Mathematics', class: '10-A', room: '302' },
  { time: '10:30 AM', subject: 'Physics', class: '12-B', room: 'Lab 1' },
  { time: '12:00 PM', subject: 'Geometry', class: '9-C', room: '105' },
  { time: '02:00 PM', subject: 'Algebra', class: '11-A', room: '401' },
]

const dummyPerformance = [
  { class: '10-A', score: 85 },
  { class: '12-B', score: 92 },
  { class: '9-C', score: 78 },
  { class: '11-A', score: 88 },
]

const dummyMessages = [
  { sender: 'Parent of Rohan', text: 'Regarding the upcoming math exam...', time: '2h ago' },
  { sender: 'Principal', text: 'Staff meeting at 4 PM today.', time: '4h ago' },
  { sender: 'Academic Head', text: 'Syllabus update for next quarter.', time: '1d ago' },
]

const dummyTopStudents = [
  { name: 'Aarav Sharma', grade: 'A+' },
  { name: 'Ishani Patel', grade: 'A' },
  { name: 'Kabir Singh', grade: 'A' },
]
