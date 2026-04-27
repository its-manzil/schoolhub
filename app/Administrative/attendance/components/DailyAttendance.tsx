"use client";

import { useState, useEffect } from "react";
import { Lock, Calendar } from "lucide-react";
import { toast } from "sonner";
import TeacherTable from "./TeacherTable";
import AttendanceHeader from "./AttendanceHeader";
import "../styles/daily.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2056";

interface Teacher {
  _id: string;
  staffId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
}

interface AttendanceRecord {
  staffId: string;
  status: string;
}

export default function DailyAttendance() {
  const [date, setDate] = useState<string>("");
  const [isHoliday, setIsHoliday] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  // Check for existing attendance when date changes
  useEffect(() => {
    if (date) {
      checkExistingAttendance();
    }
  }, [date]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const handleAuthError = (response: Response) => {
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
      return true;
    }
    return false;
  };

  const checkExistingAttendance = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/attendance/daily?date=${date}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (handleAuthError(response)) return;

      const data = await response.json();

      if (data.success && data.data) {
        // Attendance exists - lock it
        setIsLocked(true);
        setIsHoliday(data.data.isHoliday || false);
        
        // Restore attendance data
        const savedAttendance: Record<string, string> = {};
        if (data.data.attendance) {
          data.data.attendance.forEach((record: AttendanceRecord) => {
            savedAttendance[record.staffId] = record.status;
          });
        }
        setAttendance(savedAttendance);
        
        // Load teachers if not loaded
        if (teachers.length === 0) {
          await loadTeachers();
        }
        setHasLoaded(true);
      } else {
        // No existing attendance - reset state
        setIsLocked(false);
        setIsHoliday(false);
        setAttendance({});
        setHasLoaded(false);
        setTeachers([]);
      }
    } catch (error) {
      console.error("Error checking attendance:", error);
    }
  };

  const loadTeachers = async () => {
    if (!date) {
      toast.error("Please select a date first");
      return;
    }

    // Check if future date
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      toast.error("Cannot mark attendance for future dates");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/admin/attendance/teachers`, {
        headers: getAuthHeaders(),
      });

      if (handleAuthError(response)) return;

      const data = await response.json();

      if (data.success) {
        setTeachers(data.data);
        // Initialize attendance with all present
        const initialAttendance: Record<string, string> = {};
        data.data.forEach((teacher: Teacher) => {
          initialAttendance[teacher._id] = "present";
        });
        setAttendance(initialAttendance);
        setHasLoaded(true);
        toast.success(`Loaded ${data.data.length} teachers`);
      } else {
        setError(data.message || "Failed to load teachers");
        toast.error(data.message || "Failed to load teachers");
      }
    } catch (error) {
      console.error("Error loading teachers:", error);
      setError("Failed to load teachers. Please try again.");
      toast.error("Failed to load teachers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (teacherId: string, status: string) => {
    if (isLocked) return;
    setAttendance((prev) => ({
      ...prev,
      [teacherId]: status,
    }));
  };

  const handleHolidayChange = (checked: boolean) => {
    if (isLocked) return;
    setIsHoliday(checked);
  };

  const handleSave = async () => {
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    if (!isHoliday && teachers.length === 0) {
      toast.error("No teachers to save attendance for");
      return;
    }

    setIsSaving(true);

    try {
      const attendanceArray: AttendanceRecord[] = Object.entries(attendance).map(
        ([staffId, status]) => ({
          staffId,
          status,
        })
      );

      const response = await fetch(`${API_URL}/api/admin/attendance/daily`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          date,
          attendance: attendanceArray,
          isHoliday,
        }),
      });

      if (handleAuthError(response)) return;

      const data = await response.json();

      if (data.success) {
        setIsLocked(true);
        toast.success(
          isHoliday
            ? "Holiday attendance saved successfully"
            : "Attendance saved successfully"
        );
      } else {
        toast.error(data.message || "Failed to save attendance");
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Failed to save attendance");
    } finally {
      setIsSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter((s) => s === "present").length;
  const absentCount = Object.values(attendance).filter((s) => s === "absent").length;
  const leaveCount = Object.values(attendance).filter((s) => s === "leave").length;

  return (
    <div className="attendance-container">
      <AttendanceHeader
        totalTeachers={teachers.length}
        presentCount={presentCount}
        absentCount={absentCount}
        leaveCount={leaveCount}
        date={date}
        isHoliday={isHoliday}
        isLocked={isLocked}
      />

      {isLocked && (
        <div className="lock-banner">
          <Lock className="lock-icon" />
          <span className="lock-text">
            Attendance for this date has been locked and cannot be modified.
          </span>
        </div>
      )}

      <div className="control-panel">
        <div className="control-row">
          <div className="control-group">
            <label htmlFor="attendance-date">
              <Calendar size={14} style={{ display: "inline", marginRight: "4px" }} />
              Select Date
            </label>
            <input
              id="attendance-date"
              type="date"
              className="date-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isLoading || isLocked}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <label className="holiday-toggle" style={{ cursor: isLocked ? "not-allowed" : "pointer" }}>
            <input
              type="checkbox"
              checked={isHoliday}
              onChange={(e) => handleHolidayChange(e.target.checked)}
              disabled={isLocked}
            />
            <span>Mark as Holiday</span>
          </label>

          <button
            className="load-btn"
            onClick={loadTeachers}
            disabled={isLoading || isLocked || !date || hasLoaded}
          >
            {isLoading ? "Loading..." : hasLoaded ? "Loaded" : "Load Teachers"}
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fed7d7",
            color: "#742a2a",
            borderRadius: "6px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      {hasLoaded && (
        <TeacherTable
          teachers={teachers}
          attendance={attendance}
          onStatusChange={handleStatusChange}
          isLocked={isLocked}
          isHoliday={isHoliday}
          onSave={handleSave}
          isLoading={isSaving}
        />
      )}

      {!hasLoaded && !isLoading && !error && (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#718096",
            background: "#f7fafc",
            borderRadius: "8px",
            border: "1px dashed #e2e8f0",
          }}
        >
          <Calendar size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
          <p>Select a date and click &quot;Load Teachers&quot; to begin marking attendance.</p>
          {isLocked && (
            <p style={{ marginTop: "8px", color: "#dd6b20" }}>
              Attendance for this date is already locked.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
