'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, UserCheck, TrendingUp, AlertCircle, Clock } from 'lucide-react'
import { formatBSDate, getCurrentBSDate } from '../../../utils/dateConverter'
import './AttendanceDashboard.css'

interface AttendanceDashboardProps {
  selectedDate: string
  className?: string
  section?: string
}

interface DashboardStats {
  student: {
    total: number
    present: number
    absent: number
    late: number
    percentage: number
  }
  staff: {
    total: number
    present: number
    absent: number
    late: number
    percentage: number
  }
}

export default function AttendanceDashboard({
  selectedDate,
  className: classNameProp,
  section: sectionProp
}: AttendanceDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    student: { total: 0, present: 0, absent: 0, late: 0, percentage: 0 },
    staff: { total: 0, present: 0, absent: 0, late: 0, percentage: 0 }
  })
  const [loading, setLoading] = useState(false)

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      let url = `http://localhost:2056/api/attendance/dashboard-stats?date=${selectedDate}`
      
      if (classNameProp && sectionProp) {
        url += `&className=${classNameProp}&section=${sectionProp}`
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to fetch stats')

      const result = await response.json()
      
      if (result.success && result.data) {
        setStats(result.data)
      }
    } catch (err) {
      console.error('Fetch dashboard stats error:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedDate, classNameProp, sectionProp])

  useEffect(() => {
    fetchDashboardStats()
  }, [fetchDashboardStats])

  const StatCard = ({ 
    title, 
    icon: Icon, 
    stats, 
    type 
  }: { 
    title: string
    icon: React.ElementType
    stats: DashboardStats['student']
    type: 'student' | 'staff'
  }) => {
    const isStudent = type === 'student'
    const colorClass = isStudent ? 'student' : 'staff'
    
    return (
      <div className={`dashboard-card ${colorClass}`}>
        <div className="dashboard-card-header">
          <div className={`dashboard-card-icon ${colorClass}`}>
            <Icon size={24} />
          </div>
          <h3 className="dashboard-card-title">{title}</h3>
        </div>

        <div className="dashboard-card-body">
          <div className="dashboard-main-stat">
            <span className={`dashboard-percentage ${colorClass}`}>
              {loading ? '-' : `${stats.percentage.toFixed(1)}%`}
            </span>
            <span className="dashboard-label">Attendance Rate</span>
          </div>

          <div className="dashboard-stats-grid">
            <div className="dashboard-stat-item">
              <span className="dashboard-stat-value present">{stats.present}</span>
              <span className="dashboard-stat-label">
                <UserCheck size={14} /> Present
              </span>
            </div>
            <div className="dashboard-stat-item">
              <span className="dashboard-stat-value absent">{stats.absent}</span>
              <span className="dashboard-stat-label">
                <AlertCircle size={14} /> Absent
              </span>
            </div>
            <div className="dashboard-stat-item">
              <span className="dashboard-stat-value late">{stats.late}</span>
              <span className="dashboard-stat-label">
                <Clock size={14} /> Late
              </span>
            </div>
            <div className="dashboard-stat-item">
              <span className="dashboard-stat-value total">{stats.total}</span>
              <span className="dashboard-stat-label">
                <Users size={14} /> Total
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-card-footer">
          <TrendingUp size={16} />
          <span>
            {stats.percentage >= 90 
              ? 'Excellent attendance rate!' 
              : stats.percentage >= 75 
                ? 'Good attendance rate'
                : 'Attention needed'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="attendance-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">
          Attendance Overview
        </h2>
        <span className="dashboard-date">
          {formatBSDate(getCurrentBSDate()) === selectedDate ? 'Today' : selectedDate}
        </span>
      </div>

      <div className="dashboard-grid">
        <StatCard 
          title="Students"
          icon={Users}
          stats={stats.student}
          type="student"
        />
        <StatCard 
          title="Staff"
          icon={UserCheck}
          stats={stats.staff}
          type="staff"
        />
      </div>
    </div>
  )
}
