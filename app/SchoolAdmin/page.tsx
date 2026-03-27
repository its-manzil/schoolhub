'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  School,
  TrendingUp,
  TrendingDown,
  Calendar,
  Bell,
  Search,
  Settings,
  MoreVertical,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ClipboardList
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'
import AcademicNavbar from '../Academic/components/AcademicNavbar' // Reusing or create a specific one
import '../Academic/academic.css'

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899']

interface DashboardData {
  schoolName: string;
  totalStudents: number;
  totalTeachers: number;
  attendance: number;
}

export default function SchoolAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:2056/api/dashboard/schooladmin', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const result = await response.json()
        if (result.success) {
          setData(result.data)
        } else {
          setError(result.message)
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError('Failed to connect to server')
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
          <div className="flex flex-col items-center gap-4 text-slate-500 font-medium">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            Loading school statistics...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="academic-layout bg-[#f8fafc]">
      <AcademicNavbar />
      <main className="academic-main p-4 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{data?.schoolName || 'School Dashboard'}</h1>
            <p className="text-slate-500 mt-1">Management overview and key performance indicators.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-slate-600 transition-colors shadow-sm">
              <Search size={20} />
            </button>
            <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-slate-600 transition-colors shadow-sm relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 flex items-center gap-2">
              <Settings size={18} />
              Settings
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <KPICard 
            title="Total Students" 
            value={data?.totalStudents.toString() || '0'} 
            subtext="Active enrollment" 
            icon={<GraduationCap className="text-indigo-600" />} 
            trend="+3.2%" 
            trendUp={true}
            color="bg-indigo-50"
          />
          <KPICard 
            title="Total Staff" 
            value={data?.totalTeachers.toString() || '0'} 
            subtext="Teaching & Support" 
            icon={<Users className="text-blue-600" />} 
            trend="+1.5%" 
            trendUp={true}
            color="bg-blue-50"
          />
          <KPICard 
            title="Avg Attendance" 
            value={`${data?.attendance}%` || '0%'} 
            subtext="Students present today" 
            icon={<UserCheck className="text-emerald-600" />} 
            trend="+0.8%" 
            trendUp={true}
            color="bg-emerald-50"
          />
          <KPICard 
            title="Monthly Revenue" 
            value="Rs. 2.4M" 
            subtext="Fee collections" 
            icon={<TrendingUp className="text-violet-600" />} 
            trend="+12%" 
            trendUp={true}
            color="bg-violet-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Charts */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Enrollment Growth */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Enrollment Growth</h3>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> This Year
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <span className="w-2 h-2 bg-slate-200 rounded-full"></span> Last Year
                  </span>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dummyGrowthData}>
                    <defs>
                      <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Area type="monotone" dataKey="current" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
                    <Area type="monotone" dataKey="previous" stroke="#e2e8f0" strokeWidth={2} fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Department Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Staff Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dummyPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {dummyPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {dummyPieData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></span>
                      <span className="text-xs text-slate-500 font-medium">{item.name}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Recent Alerts</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 flex-shrink-0">
                      <Activity size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Exam Results Pending</p>
                      <p className="text-xs text-slate-500 mt-0.5">Grade 10 marks not uploaded yet.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 flex-shrink-0">
                      <ClipboardList size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Attendance Low</p>
                      <p className="text-xs text-slate-500 mt-0.5">Section 8B reported 65% today.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="space-y-6 lg:space-y-8">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Upcoming Events</h3>
              <div className="space-y-6">
                {dummyEvents.map((event, idx) => (
                  <div key={idx} className="flex gap-4 group cursor-pointer">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                      <span className="text-[10px] font-bold text-slate-400 uppercase group-hover:text-indigo-400">{event.month}</span>
                      <span className="text-lg font-bold text-slate-700 group-hover:text-indigo-600 leading-tight">{event.day}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors border border-slate-100">
                View Calendar
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

function KPICard({ title, value, subtext, icon, trend, trendUp, color }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-indigo-100 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold text-slate-900">{value}</span>
          <span className="text-xs text-slate-400 font-medium">{subtext}</span>
        </div>
      </div>
    </div>
  )
}

const dummyGrowthData = [
  { month: 'Sep', current: 1200, previous: 1100 },
  { month: 'Oct', current: 1250, previous: 1120 },
  { month: 'Nov', current: 1280, previous: 1150 },
  { month: 'Dec', current: 1300, previous: 1180 },
  { month: 'Jan', current: 1350, previous: 1200 },
  { month: 'Feb', current: 1400, previous: 1220 },
]

const dummyPieData = [
  { name: 'Teaching', value: 45 },
  { name: 'Admin', value: 15 },
  { name: 'Support', value: 25 },
  { name: 'IT', value: 15 },
]

const dummyEvents = [
  { month: 'APR', day: '12', title: 'Parent Teacher Meeting', time: '09:00 AM - 01:00 PM' },
  { month: 'APR', day: '15', title: 'Annual Sports Day', time: 'Full Day Event' },
  { month: 'APR', day: '22', title: 'Science Exhibition', time: '10:00 AM onwards' },
]
