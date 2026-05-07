"use client";

import { useState, useEffect, useCallback } from "react";
import { Lock, AlertTriangle, CheckCircle, Users } from "lucide-react";
import { toast } from "sonner";
import "../styles/monthly-attendance.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056';

// BS Months
const bsMonths = [
  { value: 1, label: "Baishakh" }, { value: 2, label: "Jestha" },
  { value: 3, label: "Ashadh" }, { value: 4, label: "Shrawan" },
  { value: 5, label: "Bhadra" }, { value: 6, label: "Ashwin" },
  { value: 7, label: "Kartik" }, { value: 8, label: "Mangsir" },
  { value: 9, label: "Poush" }, { value: 10, label: "Magh" },
  { value: 11, label: "Falgun" }, { value: 12, label: "Chaitra" },
];

const bsYears = Array.from({ length: 13 }, (_, i) => 2078 + i);

interface Staff {
  _id: string;
  fullName: string;
  department: string;
  designation: string;
}

export default function MonthlyAttendance() {
  const [yearBS, setYearBS] = useState<number>(2081);
  const [monthBS, setMonthBS] = useState<number>(1);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [totalHolidays, setTotalHolidays] = useState<string>("");
  const [totalPresent, setTotalPresent] = useState<string>("");
  const [isLocked, setIsLocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingRecord, setHasExistingRecord] = useState(false);
  const [conflictInfo, setConflictInfo] = useState<{ hasConflict: boolean; message: string } | null>(null);
  const [recordedStaffIds, setRecordedStaffIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const loadStaffList = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/attendance/staff`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      const data = await response.json();
      if (data.success) {
        setStaffList(data.data);
      }
    } catch (error) {
      console.error("Error loading staff:", error);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadStaffList();
    // Set current month
    const now = new Date();
    setMonthBS(now.getMonth() + 1);
  }, [loadStaffList]);

  // Check for existing records and conflicts when year/month changes
  useEffect(() => {
    if (yearBS && monthBS) {
      checkExistingAndConflicts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearBS, monthBS]);

  const checkExistingAndConflicts = async () => {
    setIsLoading(true);
    try {
      // Check if selected staff already has monthly record
      if (selectedStaff) {
        const checkRes = await fetch(
          `${API_URL}/api/admin/attendance/monthly?yearBS=${yearBS}&monthBS=${bsMonths[monthBS - 1].label}&staffId=${selectedStaff}`,
          { headers: getAuthHeaders() }
        );
        
        if (checkRes.status === 401) {
          localStorage.clear();
          window.location.href = "/login";
          return;
        }

        const checkData = await checkRes.json();
        
        if (checkData.success && checkData.data) {
          setIsLocked(true);
          setHasExistingRecord(true);
          setTotalHolidays(checkData.data.totalHolidays?.toString() || "");
          setTotalPresent(checkData.data.totalPresent?.toString() || "");
        } else {
          setIsLocked(false);
          setHasExistingRecord(false);
          setTotalHolidays("");
          setTotalPresent("");
        }
      }

      // Check for conflicts (daily attendance in this month)
      const conflictRes = await fetch(
        `${API_URL}/api/admin/attendance/check-conflict?yearBS=${yearBS}&monthBS=${monthBS}`,
        { headers: getAuthHeaders() }
      );

      if (conflictRes.ok) {
        const conflictData = await conflictRes.json();
        if (conflictData.success && conflictData.data?.hasConflict) {
          setConflictInfo({
            hasConflict: true,
            message: conflictData.data.message || "Daily attendance exists for this month. Monthly attendance is blocked.",
          });
        } else {
          setConflictInfo(null);
        }
      }

      // Get list of staff already recorded for this month
      const recordedRes = await fetch(
        `${API_URL}/api/admin/attendance/monthly-recorded?yearBS=${yearBS}&monthBS=${bsMonths[monthBS - 1].label}`,
        { headers: getAuthHeaders() }
      );

      if (recordedRes.ok) {
        const recordedData = await recordedRes.json();
        if (recordedData.success) {
          setRecordedStaffIds(recordedData.data?.staffIds || []);
        }
      }
    } catch (error) {
      console.error("Error checking conflicts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-check when staff selection changes
  useEffect(() => {
    if (selectedStaff && yearBS && monthBS) {
      checkExistingForStaff();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStaff]);

  const checkExistingForStaff = async () => {
    if (!selectedStaff) return;
    
    try {
      const checkRes = await fetch(
        `${API_URL}/api/admin/attendance/monthly?yearBS=${yearBS}&monthBS=${bsMonths[monthBS - 1].label}&staffId=${selectedStaff}`,
        { headers: getAuthHeaders() }
      );

      const checkData = await checkRes.json();
      
      if (checkData.success && checkData.data) {
        setIsLocked(true);
        setHasExistingRecord(true);
        setTotalHolidays(checkData.data.totalHolidays?.toString() || "");
        setTotalPresent(checkData.data.totalPresent?.toString() || "");
      } else {
        setIsLocked(false);
        setHasExistingRecord(false);
        setTotalHolidays("");
        setTotalPresent("");
      }
    } catch (error) {
      console.error("Error checking existing:", error);
    }
  };

  const handleSave = async () => {
    if (!selectedStaff) {
      toast.error("Please select a staff member");
      return;
    }

    if (!totalHolidays || !totalPresent) {
      toast.error("Please enter total holidays and present days");
      return;
    }

    if (conflictInfo?.hasConflict) {
      toast.error("Cannot save: " + conflictInfo.message);
      return;
    }

    const holidays = parseInt(totalHolidays);
    const present = parseInt(totalPresent);

    if (isNaN(holidays) || holidays < 0) {
      toast.error("Invalid holidays value");
      return;
    }

    if (isNaN(present) || present < 0) {
      toast.error("Invalid present days value");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/attendance/monthly`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          yearBS,
          monthBS: bsMonths[monthBS - 1].label,
          staffId: selectedStaff,
          totalHolidays: holidays,
          totalPresent: present,
        }),
      });

      if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      if (data.success) {
        setIsLocked(true);
        setHasExistingRecord(true);
        setRecordedStaffIds([...recordedStaffIds, selectedStaff]);
        toast.success("Monthly attendance saved and locked");
      } else {
        toast.error(data.message || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save monthly attendance");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter out already recorded staff
  const availableStaff = staffList.filter(s => !recordedStaffIds.includes(s._id));

  const workingDays = (parseInt(totalPresent) || 0) + (parseInt(totalHolidays) || 0);

  return (
    <div className="monthly-attendance-container">
      <h2 className="section-title">Monthly Attendance Summary (BS Calendar)</h2>

      {/* Conflict Warning */}
      {conflictInfo?.hasConflict && (
        <div className="conflict-banner">
          <AlertTriangle size={24} />
          <div>
            <strong>Attendance Conflict</strong>
            <p>{conflictInfo.message}</p>
          </div>
        </div>
      )}

      {/* Lock Banner */}
      {isLocked && !conflictInfo?.hasConflict && (
        <div className="lock-banner-monthly">
          <Lock size={20} />
          <span>Monthly attendance for {bsMonths[monthBS - 1]?.label} {yearBS} is locked for this staff.</span>
        </div>
      )}

      {/* Form Panel */}
      <div className="monthly-form-panel">
        <div className="form-row">
          {/* BS Year */}
          <div className="form-group">
            <label>BS Year</label>
            <select value={yearBS} onChange={(e) => setYearBS(parseInt(e.target.value))} disabled={isSaving}>
              {bsYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* BS Month */}
          <div className="form-group">
            <label>BS Month</label>
            <select value={monthBS} onChange={(e) => setMonthBS(parseInt(e.target.value))} disabled={isSaving}>
              {bsMonths.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          {/* Staff Selector */}
          <div className="form-group staff-select-group">
            <label>
              <Users size={14} />
              Staff Member
            </label>
            <select 
              value={selectedStaff} 
              onChange={(e) => setSelectedStaff(e.target.value)}
              disabled={isLocked || isSaving || conflictInfo?.hasConflict}
            >
              <option value="">Select Staff</option>
              {availableStaff.map(s => (
                <option key={s._id} value={s._id}>
                  {s.fullName} ({s.department || "No Dept"})
                </option>
              ))}
            </select>
            {recordedStaffIds.length > 0 && (
              <span className="hint-text">{recordedStaffIds.length} staff already recorded</span>
            )}
          </div>
        </div>

        {/* Attendance Inputs */}
        {selectedStaff && !conflictInfo?.hasConflict && (
          <div className="attendance-inputs">
            <div className="input-group">
              <label>Total Holidays</label>
              <input
                type="number"
                min="0"
                placeholder="Enter holidays"
                value={totalHolidays}
                onChange={(e) => setTotalHolidays(e.target.value)}
                disabled={isLocked || isSaving}
              />
            </div>

            <div className="input-group">
              <label>Total Present Days</label>
              <input
                type="number"
                min="0"
                placeholder="Enter present days"
                value={totalPresent}
                onChange={(e) => setTotalPresent(e.target.value)}
                disabled={isLocked || isSaving}
              />
            </div>
          </div>
        )}

        {/* Summary Preview */}
        {selectedStaff && totalHolidays && totalPresent && !conflictInfo?.hasConflict && (
          <div className="summary-preview">
            <h4>Summary for {bsMonths[monthBS - 1]?.label} {yearBS}</h4>
            <div className="summary-cards">
              <div className="summary-card holidays">
                <span className="card-value">{totalHolidays}</span>
                <span className="card-label">Holidays</span>
              </div>
              <div className="summary-card present">
                <span className="card-value">{totalPresent}</span>
                <span className="card-label">Present Days</span>
              </div>
              <div className="summary-card total">
                <span className="card-value">{workingDays}</span>
                <span className="card-label">Working Days</span>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        {selectedStaff && !conflictInfo?.hasConflict && (
          <button
            className={`save-monthly-btn ${isLocked ? "saved" : ""}`}
            onClick={handleSave}
            disabled={isLocked || isSaving}
          >
            {isLocked ? (
              <>
                <CheckCircle size={18} />
                Saved & Locked
              </>
            ) : isSaving ? (
              "Saving..."
            ) : hasExistingRecord ? (
              "Update Record"
            ) : (
              "Save Monthly Attendance"
            )}
          </button>
        )}
      </div>

      {/* Info Panel */}
      <div className="info-panel">
        <h4>About Monthly Attendance</h4>
        <ul>
          <li>Monthly attendance is recorded once per staff member per month</li>
          <li>If daily attendance exists for any day in the month, monthly attendance is blocked</li>
          <li>Once saved, monthly records are permanent and cannot be modified</li>
          <li>Staff members with existing monthly records are hidden from the dropdown</li>
          <li>This data is used for monthly payroll and reporting</li>
        </ul>
      </div>

      {isLoading && <div className="loading-overlay">Checking...</div>}
    </div>
  );
}
