'use client'

import { useState, useEffect } from 'react'
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Search,
  PlusCircle,
  FileText,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  Filter,
  MoreVertical,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'
import Link from 'next/link'
import AcademicNavbar from '../Academic/components/AcademicNavbar' // Reusing navbar for consistency or use a separate one
import '../Academic/academic.css' // Reusing styles

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899']

interface DashboardData {
  totalRevenue: number;
  pendingPayments: number;
  expenses: number;
  financialReports: any[];
}

export default function AccountantDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (userData) {
      const user = JSON.parse(userData)
      setUserRole(user.role)
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:2056/api/dashboard/accountant', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const result = await response.json()
        if (result.success) {
          setDashboardData(result.data)
        } else {
          setError(result.message)
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        setError('Failed to connect to server')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchDashboardData()
    }
  }, [])

  if (loading) {
    return (
      <div className="academic-layout bg-[#f8fafc]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4 text-slate-500 font-medium">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            Loading financial data...
          </div>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="academic-layout bg-[#f8fafc]">
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-rose-100 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-slate-500 mb-6">{error || 'Data not available'}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">Retry</button>
          </div>
        </div>
      </div>
    )
  }

  const { totalRevenue, pendingPayments, expenses } = dashboardData

  return (
    <div className="academic-layout bg-[#f8fafc]">
      <AcademicNavbar />
      <main className="academic-main p-4 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Overview</h1>
            <p className="text-slate-500 mt-1">Monitor revenue, expenses, and student billings.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 flex items-center gap-2">
              <PlusCircle size={18} />
              Create Invoice
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <KPICard 
            title="Total Revenue" 
            value={`Rs. ${totalRevenue.toLocaleString()}`} 
            subtext="Lifetime collected" 
            icon={<TrendingUp className="text-emerald-600" />} 
            trend="+12.5%" 
            trendUp={true}
            color="bg-emerald-50"
          />
          <KPICard 
            title="Pending Dues" 
            value={`Rs. ${pendingPayments.toLocaleString()}`} 
            subtext="Unpaid invoices" 
            icon={<CreditCard className="text-rose-600" />} 
            trend="-2.4%" 
            trendUp={false}
            color="bg-rose-50"
          />
          <KPICard 
            title="Total Expenses" 
            value={`Rs. ${expenses.toLocaleString()}`} 
            subtext="This month" 
            icon={<TrendingDown className="text-amber-600" />} 
            trend="+5.1%" 
            trendUp={false}
            color="bg-amber-50"
          />
          <KPICard 
            title="Net Profit" 
            value={`Rs. ${(totalRevenue - expenses).toLocaleString()}`} 
            subtext="Revenue - Expenses" 
            icon={<DollarSign className="text-indigo-600" />} 
            trend="+8.2%" 
            trendUp={true}
            color="bg-indigo-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Revenue Chart */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Revenue Trend</h3>
                <select className="text-xs font-bold text-slate-500 bg-slate-50 border-none rounded-lg px-2 py-1 focus:ring-0">
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                </select>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dummyRevenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Recent Transactions */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Recent Transactions</h3>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {dummyTransactions.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                              {t.student.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{t.student}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{t.desc}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">Rs. {t.amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            t.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{t.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:space-y-8">
            {/* Quick Stats */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Payment Methods</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Bank Transfer</p>
                      <p className="text-xs text-slate-500">65% of payments</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900">Rs. 4.2M</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Cash</p>
                      <p className="text-xs text-slate-500">25% of payments</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900">Rs. 1.8M</span>
                </div>
              </div>
            </section>

            {/* Pending Invoices */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Action Required</h3>
                <AlertCircle size={20} className="text-rose-500" />
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl">
                  <p className="text-sm font-bold text-rose-900">12 Overdue Invoices</p>
                  <p className="text-xs text-rose-700 mt-1">Totaling Rs. 45,000 needs follow up.</p>
                  <button className="mt-3 text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1">
                    Send Reminders <ChevronRight size={14} />
                  </button>
                </div>
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                  <p className="text-sm font-bold text-amber-900">Payroll Pending</p>
                  <p className="text-xs text-amber-700 mt-1">Monthly staff salary needs approval.</p>
                  <button className="mt-3 text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                    Review Payroll <ChevronRight size={14} />
                  </button>
                </div>
              </div>
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

const dummyRevenueData = [
  { month: 'Jan', revenue: 450000 },
  { month: 'Feb', revenue: 520000 },
  { month: 'Mar', revenue: 480000 },
  { month: 'Apr', revenue: 610000 },
  { month: 'May', revenue: 550000 },
  { month: 'Jun', revenue: 670000 },
]

const dummyTransactions = [
  { student: 'Aarav Sharma', desc: 'Quarterly Tuition Fee', amount: 15000, status: 'paid', date: '2024-03-25' },
  { student: 'Ishani Patel', desc: 'Admission Fee', amount: 25000, status: 'paid', date: '2024-03-24' },
  { student: 'Rohan Gupta', desc: 'Monthly Bus Fee', amount: 2500, status: 'pending', date: '2024-03-22' },
  { student: 'Sanya Malhotra', desc: 'Exam Fee', amount: 1500, status: 'paid', date: '2024-03-20' },
  { student: 'Kabir Singh', desc: 'Quarterly Tuition Fee', amount: 15000, status: 'pending', date: '2024-03-18' },
]
