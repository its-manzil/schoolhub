"use client";

import { Users, UserCheck, UserX, Calendar } from "lucide-react";
import "../styles/daily.css";

interface AttendanceHeaderProps {
  totalTeachers: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  date: string;
  isHoliday: boolean;
  isLocked: boolean;
}

export default function AttendanceHeader({
  totalTeachers,
  presentCount,
  absentCount,
  leaveCount,
  date,
  isHoliday,
  isLocked,
}: AttendanceHeaderProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPercentage = () => {
    if (totalTeachers === 0) return 0;
    return ((presentCount / totalTeachers) * 100).toFixed(1);
  };

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label" style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
          <Calendar size={14} />
          Attendance Date
        </div>
        <div className="stat-value" style={{ fontSize: "18px", marginTop: "4px" }}>
          {date ? formatDate(date) : "---"}
        </div>
        {isHoliday && (
          <div style={{ fontSize: "12px", color: "#e53e3e", marginTop: "4px", fontWeight: 500 }}>
            Holiday Declared
          </div>
        )}
        {isLocked && !isHoliday && (
          <div style={{ fontSize: "12px", color: "#dd6b20", marginTop: "4px", fontWeight: 500 }}>
            Attendance Locked
          </div>
        )}
      </div>

      <div className="stat-card">
        <div className="stat-label" style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
          <UserCheck size={14} />
          Present
        </div>
        <div className="stat-value present">
          {totalTeachers > 0 ? presentCount : "---"}
        </div>
        {totalTeachers > 0 && (
          <div style={{ fontSize: "12px", color: "#718096", marginTop: "4px" }}>
            {getPercentage()}%
          </div>
        )}
      </div>

      <div className="stat-card">
        <div className="stat-label" style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
          <UserX size={14} />
          Absent
        </div>
        <div className="stat-value absent">
          {totalTeachers > 0 ? absentCount : "---"}
        </div>
        {totalTeachers > 0 && (
          <div style={{ fontSize: "12px", color: "#718096", marginTop: "4px" }}>
            {((absentCount / totalTeachers) * 100).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="stat-card">
        <div className="stat-label" style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
          <Users size={14} />
          On Leave
        </div>
        <div className="stat-value" style={{ color: "#d69e2e" }}>
          {totalTeachers > 0 ? leaveCount : "---"}
        </div>
        {totalTeachers > 0 && (
          <div style={{ fontSize: "12px", color: "#718096", marginTop: "4px" }}>
            {((leaveCount / totalTeachers) * 100).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}
