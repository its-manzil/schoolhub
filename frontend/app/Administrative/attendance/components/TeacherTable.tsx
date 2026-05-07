"use client";

import { User } from "lucide-react";
import "../styles/table.css";

interface Teacher {
  _id: string;
  staffId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  status?: "present" | "absent" | "leave";
}

interface TeacherTableProps {
  teachers: Teacher[];
  attendance: Record<string, string>;
  onStatusChange: (teacherId: string, status: string) => void;
  isLocked: boolean;
  isHoliday: boolean;
  onSave: () => void;
  isLoading: boolean;
}

export default function TeacherTable({
  teachers,
  attendance,
  onStatusChange,
  isLocked,
  isHoliday,
  onSave,
  isLoading,
}: TeacherTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <span className="status-badge present">Present</span>;
      case "absent":
        return <span className="status-badge absent">Absent</span>;
      case "leave":
        return <span className="status-badge leave">Leave</span>;
      default:
        return <span className="status-badge present">Present</span>;
    }
  };

  if (teachers.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <User className="empty-icon" />
          <p className="empty-text">No teachers found. Please load the teacher list.</p>
        </div>
      </div>
    );
  }

  if (isHoliday) {
    return (
      <div className="table-container">
        <div className="holiday-banner">
          <svg
            className="holiday-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
          <p className="holiday-text">Holiday Declared</p>
          <p className="holiday-subtext">
            Attendance will be marked as holiday for all teachers.
          </p>
        </div>
        {!isLocked && (
          <div className="table-footer">
            <button
              className="save-attendance-btn"
              onClick={onSave}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Holiday Attendance"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-header">
        <h3 className="table-title">Teacher Attendance</h3>
        <p className="table-subtitle">
          Total: {teachers.length} teachers | Present:{" "}
          {Object.values(attendance).filter((s) => s === "present").length} |
          Absent: {Object.values(attendance).filter((s) => s === "absent").length} | Leave:{" "}
          {Object.values(attendance).filter((s) => s === "leave").length}
        </p>
      </div>
      <table className="teacher-table">
        <thead>
          <tr>
            <th>Teacher</th>
            <th>Department</th>
            <th>Status</th>
            <th>Current Status</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <tr key={teacher._id}>
              <td>
                <div className="teacher-info">
                  <div className="teacher-avatar">
                    {getInitials(teacher.fullName)}
                  </div>
                  <div className="teacher-details">
                    <span className="teacher-name">{teacher.fullName}</span>
                    <span className="teacher-dept">{teacher.email}</span>
                  </div>
                </div>
              </td>
              <td>{teacher.department || "N/A"}</td>
              <td>
                <div className="status-options">
                  <label className="status-option present">
                    <input
                      type="radio"
                      name={`status-${teacher._id}`}
                      value="present"
                      checked={(attendance[teacher._id] || "present") === "present"}
                      onChange={() => onStatusChange(teacher._id, "present")}
                      disabled={isLocked}
                    />
                    <span>P</span>
                  </label>
                  <label className="status-option absent">
                    <input
                      type="radio"
                      name={`status-${teacher._id}`}
                      value="absent"
                      checked={(attendance[teacher._id] || "present") === "absent"}
                      onChange={() => onStatusChange(teacher._id, "absent")}
                      disabled={isLocked}
                    />
                    <span>A</span>
                  </label>
                  <label className="status-option leave">
                    <input
                      type="radio"
                      name={`status-${teacher._id}`}
                      value="leave"
                      checked={(attendance[teacher._id] || "present") === "leave"}
                      onChange={() => onStatusChange(teacher._id, "leave")}
                      disabled={isLocked}
                    />
                    <span>L</span>
                  </label>
                </div>
              </td>
              <td>
                {getStatusBadge(attendance[teacher._id] || "present")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!isLocked && (
        <div className="table-footer">
          <button
            className="save-attendance-btn"
            onClick={onSave}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      )}
    </div>
  );
}
