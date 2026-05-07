'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  UserCheck,
  Calendar,
  Bell,
  PlusCircle,
  ClipboardCheck,
  FilePlus,
  TrendingUp,
  Activity,
  ChevronRight,
  AlertCircle,
  Clock,
  GraduationCap
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts'
import Link from 'next/link'
import AcademicNavbar from './components/AcademicNavbar'
import './AcaOv.css' // Import newly created custom CSS

const COLORS = ['#4f46e5', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899']

interface DashboardData {
  kpis: {
    totalStudents: number;
    totalTeachers: number;
    studentsPresentToday: number;
    staffPresenceRate: number;
    upcomingExamsCount: number;
    capacityPercentage: number;
    studentTrend: string;
    attendanceTrend: string;
    pendingFeesCount: number;
  };
  analytics: {
    classDistribution: Array<{ name: string; students: number }>;
    attendanceTrend: Array<{ name: string; attendance: number }>;
  };
  alerts: Array<{
    type: 'urgent' | 'pending';
    title: string;
    desc: string;
    time: string;
    href?: string;
  }>;
  upcomingEvents: Array<{
    date: string;
    title: string;
    type: 'exam' | 'meeting' | 'holiday' | 'event';
  }>;
  recentActivity: Array<{
    action: string;
    desc: string;
    time: string;
    color: string;
  }>;
}

export default function AcademicDashboard() {
  const [mounted, setMounted] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (userData) {
      const user = JSON.parse(userData)
      setUserRole(user.role)
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/academic/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const result = await response.json()
        if (result.success) {
          setDashboardData(result.data)
        } else {
          setError(result.message || 'Failed to fetch dashboard data')
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

  if (!mounted) return null

  if (loading) {
    return (
      <div className="AcaOv-layout">
        <AcademicNavbar />
        <main className="AcaOv-main">
          <div className="AcaOv-loading-wrap">
            <div className="AcaOv-spinner"></div>
            <div style={{ color: 'var(--AcaOv-text-muted)', fontWeight: 600 }}>Loading dashboard data...</div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="AcaOv-layout">
        <AcademicNavbar />
        <main className="AcaOv-main">
          <div className="AcaOv-error-wrap">
            <div className="AcaOv-error-card">
              <div className="AcaOv-error-icon">
                <AlertCircle size={32} />
              </div>
              <h2 className="AcaOv-error-title">Error Loading Dashboard</h2>
              <p className="AcaOv-error-desc">{error || 'Data not available'}</p>
              <button
                onClick={() => window.location.reload()}
                className="AcaOv-btn-retry"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const { kpis, analytics, alerts, upcomingEvents, recentActivity } = dashboardData

  return (
    <div className="AcaOv-layout">
      <AcademicNavbar />
      <main className="AcaOv-main">
        {/* Header */}
        <div className="AcaOv-header">
          <div>
            <h1 className="AcaOv-title">Academic Overview</h1>
            <p className="AcaOv-subtitle">Welcome back. Here&apos;s what&apos;s happening in your school today.</p>
          </div>
          <div className="AcaOv-header-actions">
            <button className="AcaOv-icon-btn">
              <Bell size={20} />
              {alerts.length > 0 && (
                <span className="AcaOv-badge-dot"></span>
              )}
            </button>
            <div className="AcaOv-role-badge">
              <div className="AcaOv-role-icon">
                <GraduationCap size={14} />
              </div>
              <span className="AcaOv-role-text">{userRole || 'Academic'}</span>
            </div>
          </div>
        </div>

        {/* Top Section - KPI Cards */}
        <div className="AcaOv-kpi-grid">
          <KPICard
            title="Total Enrollment"
            value={(kpis?.totalStudents ?? 0).toLocaleString()}
            subtext={`${kpis?.capacityPercentage ?? 0}% capacity`}
            icon={<Users size={20} />}
            trend={kpis?.studentTrend ?? "+0.0%"}
            trendUp={parseFloat(kpis?.studentTrend ?? "0") >= 0}
            colorClass="AcaOv-color-indigo"
          />
          <KPICard
            title="Students Present"
            value={(kpis?.studentsPresentToday ?? 0).toString()}
            subtext={(kpis?.totalStudents ?? 0) > 0 ? `${Math.round(((kpis?.studentsPresentToday ?? 0) / (kpis?.totalStudents ?? 1)) * 100)}% present` : "No data"}
            icon={<UserCheck size={20} />}
            trend={kpis?.attendanceTrend ?? "+0.0%"}
            trendUp={parseFloat(kpis?.attendanceTrend ?? "0") >= 0}
            colorClass="AcaOv-color-emerald"
          />
          <KPICard
            title="Staff Registered"
            value={(kpis?.totalTeachers ?? 0).toString()}
            subtext={`${kpis?.staffPresenceRate ?? 0}% present today`}
            icon={<ClipboardCheck size={20} />}
            trend="Active"
            trendUp={true}
            colorClass="AcaOv-color-blue"
          />
          <KPICard
            title="Upcoming Exams"
            value={(kpis?.upcomingExamsCount ?? 0).toString()}
            subtext="Next 30 days"
            icon={<Calendar size={20} />}
            trend="Active"
            trendUp={true}
            colorClass="AcaOv-color-amber"
          />
          <KPICard
            title="Pending Fees"
            value={(kpis?.pendingFeesCount ?? 0).toString()}
            subtext="Unpaid invoices"
            icon={<Activity size={20} />}
            trend="Review"
            trendUp={false}
            colorClass="AcaOv-color-rose"
          />
        </div>

        <div className="AcaOv-content-grid">
          {/* Left/Main Column */}
          <div className="AcaOv-left-col">

            {/* Alerts & Action Items */}
            <section className="AcaOv-section">
              <div className="AcaOv-section-header">
                <h2 className="AcaOv-section-title">Alerts & Actions</h2>
                <button className="AcaOv-view-all">
                  View All <ChevronRight size={16} />
                </button>
              </div>
              <div className="AcaOv-alerts-list">
                {alerts.length > 0 ? (
                  alerts.map((alert, idx) => (
                    <AlertItem
                      key={idx}
                      type={alert.type}
                      title={alert.title}
                      desc={alert.desc}
                      time={alert.time}
                      href={alert.href}
                    />
                  ))
                ) : (
                  <div className="AcaOv-empty-alerts">
                    <div className="AcaOv-empty-icon">
                      <UserCheck size={24} />
                    </div>
                    <p className="AcaOv-empty-text">All caught up! No pending alerts.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="AcaOv-section">
              <div className="AcaOv-section-header">
                <h2 className="AcaOv-section-title">Quick Actions</h2>
              </div>
              <div className="AcaOv-actions-grid">
                <ActionButton
                  icon={<PlusCircle size={24} />}
                  label="Add Student"
                  colorClass="AcaOv-bg-indigo"
                  href="/Academic/Students"
                />
                <ActionButton
                  icon={<UserCheck size={24} />}
                  label="Attendance"
                  colorClass="AcaOv-bg-emerald"
                  href="/Academic/Attendance"
                />
                <ActionButton
                  icon={<FilePlus size={24} />}
                  label="Create Exam"
                  colorClass="AcaOv-bg-amber"
                  href="/Academic/Exams"
                />
                <ActionButton
                  icon={<Activity size={24} />}
                  label="Enter Marks"
                  colorClass="AcaOv-bg-rose"
                  href="/Academic/Exams"
                />
                <ActionButton
                  icon={<Bell size={24} />}
                  label="Notify"
                  colorClass="AcaOv-bg-slate"
                  href="/Academic/Notifications"
                />
              </div>
            </section>

            {/* Analytics */}
            <section className="AcaOv-analytics-grid">
              <div className="AcaOv-chart-card">
                <h3 className="AcaOv-chart-header">Attendance Trend</h3>
                <div className="AcaOv-chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.attendanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                        domain={[80, 100]}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: 'var(--AcaOv-shadow)' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="attendance"
                        stroke="var(--AcaOv-primary)"
                        strokeWidth={3}
                        dot={{ fill: 'var(--AcaOv-primary)', strokeWidth: 2, r: 4, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="AcaOv-chart-card">
                <h3 className="AcaOv-chart-header">Class Distribution</h3>
                <div className="AcaOv-chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.classDistribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                      />
                      <Tooltip
                        cursor={{ fill: 'var(--AcaOv-bg)' }}
                        contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: 'var(--AcaOv-shadow)' }}
                      />
                      <Bar dataKey="students" radius={[6, 6, 0, 0]}>
                        {analytics.classDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column / Sidebar Widget */}
          <div className="AcaOv-right-col">
            {/* Calendar Widget */}
            <section className="AcaOv-widget-card">
              <div className="AcaOv-widget-header">
                <h3 className="AcaOv-widget-title">Academic Calendar</h3>
                <div className="AcaOv-widget-icon"><Calendar size={20} /></div>
              </div>
              <div className="AcaOv-event-list">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event, idx) => {
                    const date = new Date(event.date);
                    const month = date.toLocaleDateString('en-US', { month: 'short' });
                    const day = date.toLocaleDateString('en-US', { day: '2-digit' });
                    return (
                      <CalendarEvent
                        key={idx}
                        month={month}
                        day={day}
                        title={event.title}
                        type={event.type}
                      />
                    )
                  })
                ) : (
                  <p className="AcaOv-widget-empty">No upcoming events scheduled</p>
                )}
              </div>
              <button className="AcaOv-btn-full">
                View Full Calendar
              </button>
            </section>

            {/* Recent Activity Feed */}
            <section className="AcaOv-widget-card">
              <div className="AcaOv-widget-header">
                <h3 className="AcaOv-widget-title">Recent Activity</h3>
                <div className="AcaOv-widget-icon-sub"><Clock size={20} /></div>
              </div>
              <div className="AcaOv-activity-feed">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, idx) => {
                    const date = new Date(activity.time);
                    const now = new Date();
                    const diffMs = now.getTime() - date.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMins / 60)
                    const diffDays = Math.floor(diffHours / 24)

                    let timeStr = 'Just now';
                    if (diffDays > 0) timeStr = `${diffDays} days ago`;
                    else if (diffHours > 0) timeStr = `${diffHours} hours ago`;
                    else if (diffMins > 0) timeStr = `${diffMins} mins ago`;

                    // Mapping backend general colors to AcaOv css color variables manually handles it
                    let dotColorClass = 'AcaOv-bg-indigo';
                    if (activity.color.includes('emerald') || activity.color.includes('green')) dotColorClass = 'AcaOv-bg-emerald';
                    if (activity.color.includes('rose') || activity.color.includes('red')) dotColorClass = 'AcaOv-bg-rose';
                    if (activity.color.includes('amber') || activity.color.includes('yellow')) dotColorClass = 'AcaOv-bg-amber';

                    return (
                      <ActivityItem
                        key={idx}
                        action={activity.action}
                        desc={activity.desc}
                        time={timeStr}
                        colorClass={dotColorClass}
                      />
                    )
                  })
                ) : (
                  <p className="AcaOv-widget-empty">No recent activity</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

// Components
interface KPICardProps {
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
  colorClass: string;
}

function KPICard({ title, value, subtext, icon, trend, trendUp, colorClass }: KPICardProps) {
  const trendClass = trendUp ? 'AcaOv-trend-up' : trend.includes('Active') || trend.includes('Review') ? 'AcaOv-trend-neutral' : 'AcaOv-trend-down';

  return (
    <div className="AcaOv-kpi-card">
      <div className="AcaOv-kpi-top">
        <div className={`AcaOv-kpi-icon-wrap ${colorClass}`}>
          {icon}
        </div>
        <div className={`AcaOv-kpi-trend ${trendClass}`}>
          {trendUp ? <TrendingUp size={12} /> : <Activity size={12} />}
          {trend}
        </div>
      </div>
      <div>
        <h3 className="AcaOv-kpi-title">{title}</h3>
        <div className="AcaOv-kpi-value-wrap">
          <span className="AcaOv-kpi-val">{value}</span>
          <span className="AcaOv-kpi-sub">{subtext}</span>
        </div>
      </div>
    </div>
  )
}

interface AlertItemProps {
  type: 'urgent' | 'pending';
  title: string;
  desc: string;
  time: string;
  href?: string;
}

function AlertItem({ type, title, desc, time, href }: AlertItemProps) {
  const isUrgent = type === 'urgent'
  const rootClass = isUrgent ? 'AcaOv-alert-item AcaOv-alert-urgent' : 'AcaOv-alert-item AcaOv-alert-pending';

  const content = (
    <div className={rootClass}>
      <div className="AcaOv-alert-icon-box">
        <AlertCircle size={18} />
      </div>
      <div className="AcaOv-alert-content">
        <div className="AcaOv-alert-top">
          <h4 className="AcaOv-alert-title">{title}</h4>
          <span className="AcaOv-alert-badge">
            {type}
          </span>
        </div>
        <p className="AcaOv-alert-desc">{desc}</p>
        <div className="AcaOv-alert-time">
          <Clock size={12} />
          {time}
        </div>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link>
  }

  return content
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  colorClass: string;
  href: string;
}

function ActionButton({ icon, label, colorClass, href }: ActionButtonProps) {
  return (
    <Link href={href} className="AcaOv-action-btn-wrap">
      <div className={`AcaOv-action-icon-box ${colorClass}`}>
        {icon}
      </div>
      <span className="AcaOv-action-label">{label}</span>
    </Link>
  )
}

interface CalendarEventProps {
  month: string;
  day: string;
  title: string;
  type: 'exam' | 'meeting' | 'holiday' | 'event';
}

function CalendarEvent({ month, day, title, type }: CalendarEventProps) {
  const typeClass = `AcaOv-event-content AcaOv-event-type-${type}`;

  return (
    <div className="AcaOv-event-item">
      <div className="AcaOv-event-date-box">
        <div className="AcaOv-event-month">{month}</div>
        <div className="AcaOv-event-day">{day}</div>
      </div>
      <div className={typeClass}>
        <h4 className="AcaOv-event-title">{title}</h4>
        <span className="AcaOv-event-subtitle">{type}</span>
      </div>
    </div>
  )
}

interface ActivityItemProps {
  action: string;
  desc: string;
  time: string;
  colorClass: string;
}

function ActivityItem({ action, desc, time, colorClass }: ActivityItemProps) {
  return (
    <div className="AcaOv-activity-item">
      <div className={`AcaOv-activity-dot ${colorClass}`} />
      <div className="AcaOv-activity-content">
        <h4 className="AcaOv-activity-action">{action}</h4>
        <p className="AcaOv-activity-desc">{desc}</p>
        <span className="AcaOv-activity-time">{time}</span>
      </div>
    </div>
  )
}
