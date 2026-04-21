'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { 
  getCurrentBSDate, 
  formatBSDate, 
  NEPALI_MONTHS 
} from '../../../utils/dateConverter'
import './AttendanceCalendar.css'

interface AttendanceCalendarProps {
  onDateSelect: (bsDate: string) => void
  selectedDate: string
  type: 'student' | 'staff'
  className?: string
  section?: string
}

interface DayData {
  date: string
  day: number
  isCurrentMonth: boolean
  presentCount: number
  absentCount: number
  lateCount: number
  totalCount: number
}

export default function AttendanceCalendar({
  onDateSelect,
  selectedDate,
  type,
  className: classNameProp,
  section: sectionProp
}: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(getCurrentBSDate())
  const [calendarDays, setCalendarDays] = useState<DayData[]>([])

  // Get days in BS month (approximate - actual implementation may vary)
  const getDaysInBSMonth = (year: number, month: number): number => {
    const daysInMonth = [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30]
    // Handle leap year for Chaitra
    if (month === 12) {
      // Check if it's a leap year (simplified logic)
      if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
        return 31
      }
    }
    return daysInMonth[month - 1] || 30
  }

  // Fetch attendance summary for the month
  const fetchMonthlySummary = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Build month date range
      const startDate = formatBSDate({ ...currentMonth, day: 1 })
      const daysInMonth = getDaysInBSMonth(currentMonth.year, currentMonth.month)
      const endDate = formatBSDate({ ...currentMonth, day: daysInMonth })

      let url = `http://localhost:2056/api/attendance/monthly-summary?startDate=${startDate}&endDate=${endDate}&type=${type}`
      
      if (type === 'student' && classNameProp && sectionProp) {
        url += `&className=${classNameProp}&section=${sectionProp}`
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error('Failed to fetch summary')
      
      const result = await response.json()
      return result.data || {}
    } catch (err) {
      console.error('Fetch monthly summary error:', err)
      return {}
    }
  }, [currentMonth, type, classNameProp, sectionProp])

  // Build calendar grid
  const buildCalendar = useCallback(async () => {
    const summaryData = await fetchMonthlySummary()
    const daysInMonth = getDaysInBSMonth(currentMonth.year, currentMonth.month)
    const days: DayData[] = []

    // Add placeholder days for previous month
    const startDayOfWeek = 0 // BS calendar typically starts from Sunday
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({
        date: '',
        day: 0,
        isCurrentMonth: false,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        totalCount: 0
      })
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatBSDate({ ...currentMonth, day })
      const daySummary = summaryData[dateStr] || { present: 0, absent: 0, late: 0, total: 0 }
      
      days.push({
        date: dateStr,
        day,
        isCurrentMonth: true,
        presentCount: daySummary.present || 0,
        absentCount: daySummary.absent || 0,
        lateCount: daySummary.late || 0,
        totalCount: daySummary.total || 0
      })
    }

    setCalendarDays(days)
  }, [currentMonth, fetchMonthlySummary])

  useEffect(() => {
    buildCalendar()
  }, [buildCalendar])

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 1) {
        return { year: prev.year - 1, month: 12, day: 1 }
      }
      return { ...prev, month: prev.month - 1, day: 1 }
    })
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 12) {
        return { year: prev.year + 1, month: 1, day: 1 }
      }
      return { ...prev, month: prev.month + 1, day: 1 }
    })
  }

  const handleDayClick = (date: string) => {
    if (date) {
      onDateSelect(date)
    }
  }

  // Calculate heatmap color for a day
  const getHeatmapColor = (day: DayData): string => {
    if (!day.isCurrentMonth || day.totalCount === 0) return ''
    
    const presentRate = day.presentCount / day.totalCount
    const absentRate = day.absentCount / day.totalCount
    
    if (presentRate >= 0.9) return 'heatmap-green'
    if (absentRate >= 0.3) return 'heatmap-red'
    return 'heatmap-yellow'
  }

  const isSelected = (date: string): boolean => {
    return date === selectedDate
  }

  const isToday = (date: string): boolean => {
    const today = formatBSDate(getCurrentBSDate())
    return date === today
  }

  return (
    <div className="attendance-calendar">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="calendar-nav-btn">
          <ChevronLeft size={20} />
        </button>
        <h3 className="calendar-title">
          {NEPALI_MONTHS[currentMonth.month - 1]} {currentMonth.year}
        </h3>
        <button onClick={handleNextMonth} className="calendar-nav-btn">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() => day.isCurrentMonth && handleDayClick(day.date)}
            className={`
              calendar-day
              ${!day.isCurrentMonth ? 'calendar-day-empty' : ''}
              ${day.isCurrentMonth ? getHeatmapColor(day) : ''}
              ${isSelected(day.date) ? 'calendar-day-selected' : ''}
              ${isToday(day.date) ? 'calendar-day-today' : ''}
            `}
          >
            {day.isCurrentMonth && (
              <>
                <span className="calendar-day-number">{day.day}</span>
                {day.totalCount > 0 && (
                  <div className="calendar-day-indicator">
                    <span className="indicator-present">{day.presentCount}</span>
                    {day.absentCount > 0 && (
                      <span className="indicator-absent">{day.absentCount}</span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot heatmap-green"></span>
          <span>High Present (&gt;90%)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot heatmap-yellow"></span>
          <span>Partial</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot heatmap-red"></span>
          <span>High Absence (&gt;30%)</span>
        </div>
      </div>
    </div>
  )
}
