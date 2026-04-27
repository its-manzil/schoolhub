"use client";

import { useState, useEffect } from "react";
import { Lock, Calendar, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import "../styles/monthly.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2056";

// BS Months
const bsMonths = [
  { value: "Baisakh", label: "Baisakh" },
  { value: "Jestha", label: "Jestha" },
  { value: "Ashadh", label: "Ashadh" },
  { value: "Shrawan", label: "Shrawan" },
  { value: "Bhadra", label: "Bhadra" },
  { value: "Ashwin", label: "Ashwin" },
  { value: "Kartik", label: "Kartik" },
  { value: "Mangsir", label: "Mangsir" },
  { value: "Poush", label: "Poush" },
  { value: "Magh", label: "Magh" },
  { value: "Falgun", label: "Falgun" },
  { value: "Chaitra", label: "Chaitra" },
];

// Generate BS years (2078-2090)
const bsYears = Array.from({ length: 13 }, (_, i) => 2078 + i);

export default function MonthlyAttendance() {
  const [yearBS, setYearBS] = useState<number>(2081);
  const [monthBS, setMonthBS] = useState<string>("Baisakh");
  const [totalHolidays, setTotalHolidays] = useState<string>("");
  const [totalPresentDays, setTotalPresentDays] = useState<string>("");
  const [isLocked, setIsLocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);

  // Check for existing monthly attendance when year/month changes
  useEffect(() => {
    if (yearBS && monthBS) {
      checkExistingMonthlyAttendance();
    }
  }, [yearBS, monthBS]);

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

  const checkExistingMonthlyAttendance = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/attendance/monthly?yearBS=${yearBS}&monthBS=${monthBS}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (handleAuthError(response)) return;

      const data = await response.json();

      if (data.success && data.data) {
        setIsLocked(true);
        setHasExistingData(true);
        setTotalHolidays(data.data.totalHolidays?.toString() || "");
        setTotalPresentDays(data.data.totalPresentDays?.toString() || "");
      } else {
        setIsLocked(false);
        setHasExistingData(false);
        setTotalHolidays("");
        setTotalPresentDays("");
      }
    } catch (error) {
      console.error("Error checking monthly attendance:", error);
    }
  };

  const handleSave = async () => {
    if (!yearBS || !monthBS) {
      toast.error("Please select year and month");
      return;
    }

    if (totalHolidays === "" || totalPresentDays === "") {
      toast.error("Please enter total holidays and present days");
      return;
    }

    const holidays = parseInt(totalHolidays);
    const presentDays = parseInt(totalPresentDays);

    if (isNaN(holidays) || holidays < 0) {
      toast.error("Invalid number of holidays");
      return;
    }

    if (isNaN(presentDays) || presentDays < 0) {
      toast.error("Invalid number of present days");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/attendance/monthly`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          yearBS,
          monthBS,
          totalHolidays: holidays,
          totalPresentDays: presentDays,
        }),
      });

      if (handleAuthError(response)) return;

      const data = await response.json();

      if (data.success) {
        setIsLocked(true);
        setHasExistingData(true);
        toast.success("Monthly attendance saved successfully");
      } else {
        toast.error(data.message || "Failed to save monthly attendance");
      }
    } catch (error) {
      console.error("Error saving monthly attendance:", error);
      toast.error("Failed to save monthly attendance");
    } finally {
      setIsSaving(false);
    }
  };

  const workingDays =
    totalPresentDays && totalHolidays
      ? parseInt(totalPresentDays) + parseInt(totalHolidays)
      : 0;

  return (
    <div className="monthly-container">
      <h2 className="monthly-title">Monthly Attendance Summary (BS Calendar)</h2>

      {isLocked && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 20px",
            background: "#fffaf0",
            border: "1px solid #fbd38d",
            borderRadius: "8px",
            marginBottom: "24px",
          }}
        >
          <Lock size={24} color="#dd6b20" />
          <span style={{ fontSize: "14px", color: "#c05621", fontWeight: 500 }}>
            Monthly attendance for {monthBS} {yearBS} has been locked and cannot
            be modified.
          </span>
        </div>
      )}

      <div className="bs-calendar-panel">
        <div className="bs-selectors">
          <div className="bs-select-group">
            <label htmlFor="bs-year">
              <Calendar size={14} style={{ display: "inline", marginRight: "4px" }} />
              BS Year
            </label>
            <select
              id="bs-year"
              className="bs-select"
              value={yearBS}
              onChange={(e) => setYearBS(parseInt(e.target.value))}
              disabled={isLocked || isSaving}
            >
              {bsYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="bs-select-group">
            <label htmlFor="bs-month">
              <Calendar size={14} style={{ display: "inline", marginRight: "4px" }} />
              BS Month
            </label>
            <select
              id="bs-month"
              className="bs-select"
              value={monthBS}
              onChange={(e) => setMonthBS(e.target.value)}
              disabled={isLocked || isSaving}
            >
              {bsMonths.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="monthly-inputs">
          <div className="input-group">
            <label htmlFor="total-holidays">Total Holidays</label>
            <input
              id="total-holidays"
              type="number"
              className="number-input"
              placeholder="Enter number of holidays"
              value={totalHolidays}
              onChange={(e) => setTotalHolidays(e.target.value)}
              disabled={isLocked || isSaving}
              min="0"
            />
          </div>

          <div className="input-group">
            <label htmlFor="present-days">Total Present Days</label>
            <input
              id="present-days"
              type="number"
              className="number-input"
              placeholder="Enter present days"
              value={totalPresentDays}
              onChange={(e) => setTotalPresentDays(e.target.value)}
              disabled={isLocked || isSaving}
              min="0"
            />
          </div>
        </div>

        {(totalHolidays || totalPresentDays) && (
          <div className="monthly-summary">
            <h3 className="summary-title">Summary for {monthBS} {yearBS}</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-label">Holidays</div>
                <div className="summary-value" style={{ color: "#e53e3e" }}>
                  {totalHolidays || "0"}
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Present Days</div>
                <div className="summary-value" style={{ color: "#2563eb" }}>
                  {totalPresentDays || "0"}
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Total Working Days</div>
                <div className="summary-value" style={{ color: "#38a169" }}>
                  {workingDays || "0"}
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          className={`save-btn ${isLocked ? "saved" : ""}`}
          onClick={handleSave}
          disabled={isLocked || isSaving}
        >
          {isLocked ? (
            <>
              <CheckCircle size={18} style={{ marginRight: "8px" }} />
              Saved & Locked
            </>
          ) : isSaving ? (
            "Saving..."
          ) : hasExistingData ? (
            "Update Monthly Attendance"
          ) : (
            "Save Monthly Attendance"
          )}
        </button>
      </div>

      <div
        style={{
          background: "#f7fafc",
          borderRadius: "8px",
          padding: "20px",
          marginTop: "20px",
        }}
      >
        <h3
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#2d3748",
            marginBottom: "12px",
          }}
        >
          About Monthly Attendance
        </h3>
        <ul
          style={{
            fontSize: "13px",
            color: "#718096",
            lineHeight: "1.8",
            paddingLeft: "16px",
          }}
        >
          <li>Enter the total number of holidays in the selected month</li>
          <li>Enter the total number of days teachers were present</li>
          <li>Once saved, monthly attendance cannot be modified</li>
          <li>This data is used for monthly payroll and reporting</li>
        </ul>
      </div>
    </div>
  );
}
