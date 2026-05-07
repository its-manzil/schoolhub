"use client";

import { useState, useEffect, useCallback } from "react";
import { Lock, Calendar, Search } from "lucide-react";
import { toast } from "sonner";
import "../styles/daily-attendance.css";

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
  staffId: string;
  fullName: string;
  email: string;
  department: string;
  designation: string;
  role: string;
}

interface AttendanceEntry {
  staffId: string;
  status: "Hold" | "Present" | "Absent" | "Late";
  note: string;
  isLocked?: boolean;
}

export default function DailyAttendance() {
  const [yearBS, setYearBS] = useState<number>(2081);
  const [monthBS, setMonthBS] = useState<number>(1);
  const [dayBS, setDayBS] = useState<number>(1);
  const [isHoliday, setIsHoliday] = useState(false);
  const [isHolidayLocked, setIsHolidayLocked] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceEntry>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [isSaturday, setIsSaturday] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const fetchCurrentBSDate = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/attendance/current-bs-date`, {
        headers: getAuthHeaders(),
      });
      if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
      const data = await response.json();
      if (data.success) {
        setYearBS(data.data.year);
        setMonthBS(data.data.month);
        setDayBS(data.data.day);
      }
    } catch (error) {
      console.error("Error fetching BS date:", error);
    }
  }, []);

  // Set default BS date and load current date
  useEffect(() => {
    fetchCurrentBSDate();
  }, [fetchCurrentBSDate]);

  // Auto-load staff when date changes
  useEffect(() => {
    if (yearBS && monthBS && dayBS) {
      checkHolidayAndLoadStaff();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearBS, monthBS, dayBS]);

  // Apply filters when they change
  useEffect(() => {
    const filtered = staff.filter((staffMember) => {
      const matchesSearch = !searchQuery || 
        staffMember.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staffMember.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staffMember.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = !selectedDepartment || staffMember.department === selectedDepartment;
      const matchesRole = !selectedRole || staffMember.role === selectedRole;
      
      return matchesSearch && matchesDepartment && matchesRole;
    });
    setFilteredStaff(filtered);
  }, [searchQuery, selectedDepartment, selectedRole, staff]);

  const formatBSDate = () => {
    return `${yearBS}-${monthBS.toString().padStart(2, "0")}-${dayBS.toString().padStart(2, "0")}`;
  };

  const checkHolidayAndLoadStaff = async () => {
    setIsLoading(true);
    try {
      const dateBS = formatBSDate();
      // Check if holiday is declared for this date
      const checkRes = await fetch(
        `${API_URL}/api/admin/attendance/daily?dateBS=${dateBS}`,
        { headers: getAuthHeaders() }
      );
      
      if (checkRes.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      const checkData = await checkRes.json();
      
      if (checkData.success && checkData.data?.isHoliday) {
        // Holiday declared - lock everything
        setIsHolidayLocked(true);
        setIsHoliday(true);
        
        // Check if it's Saturday
        const saturdayFlag = checkData.data?.isSaturday || false;
        setIsSaturday(saturdayFlag);
        
        // Show Saturday holiday message
        if (saturdayFlag) {
          toast.info("Saturday is a weekly holiday 🎉");
        }
      } else {
        setIsHolidayLocked(false);
        setIsHoliday(false);
        setIsSaturday(false);
        setAttendance({});
      }
      
      // Load staff only if not a holiday
      if (!checkData.data?.isHoliday) {
        await loadStaff();
      } else {
        setStaff([]);
        setFilteredStaff([]);
      }
    } catch (error) {
      console.error("Error checking holiday:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const dateBS = formatBSDate();
      const params = new URLSearchParams({ dateBS });
      
      const response = await fetch(`${API_URL}/api/admin/attendance/staff?${params}`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Backend should already filter, but do a safety filter on frontend too
        // This ensures any staff with P/A/L in current attendance state are excluded
        const currentlyMarkedIds = new Set(
          Object.entries(attendance)
            .filter(([, entry]) => ['P', 'A', 'L', 'Present', 'Absent', 'Late'].includes(entry.status))
            .map(([id]) => id)
        );
        
        const safeFilteredStaff = data.data.filter((s: Staff) => !currentlyMarkedIds.has(s._id));
        
        setStaff(safeFilteredStaff);
        
        // Extract unique departments and roles
        const depts = [...new Set(safeFilteredStaff.map((s: Staff) => s.department).filter(Boolean))] as string[];
        const rs = [...new Set(safeFilteredStaff.map((s: Staff) => s.role || s.designation).filter(Boolean))] as string[];
        setDepartments(depts);
        setRoles(rs);
        
        // Initialize attendance for new staff with Hold as default
        if (!isHolidayLocked) {
          const initial: Record<string, AttendanceEntry> = {};
          safeFilteredStaff.forEach((s: Staff) => {
            // Only initialize if not already in attendance
            if (!attendance[s._id]) {
              initial[s._id] = { staffId: s._id, status: "Hold", note: "" };
            }
          });
          if (Object.keys(initial).length > 0) {
            setAttendance(prev => ({ ...prev, ...initial }));
          }
        }
      }
    } catch (error) {
      console.error("Error loading staff:", error);
      toast.error("Failed to load staff");
    }
  };

  
  const handleStatusChange = (staffId: string, status: "Hold" | "Present" | "Absent" | "Late") => {
    if (isHolidayLocked) return;
    // Allow free switching between statuses before save
    setAttendance(prev => ({
      ...prev,
      [staffId]: { ...prev[staffId], staffId, status },
    }));
  };

  const handleNoteChange = (staffId: string, note: string) => {
    if (isHolidayLocked) return;
    setAttendance(prev => ({
      ...prev,
      [staffId]: { ...prev[staffId], staffId, note },
    }));
  };

  const handleHolidayChange = (checked: boolean) => {
    if (isHolidayLocked) return;
    setIsHoliday(checked);
  };

  const handleSave = async () => {
    if (isHolidayLocked) {
      toast.error("Holiday is declared for this date");
      return;
    }

    // Filter only entries with valid status (P/A/L) for saving - Hold is ignored
    const validEntries = Object.values(attendance).filter(a =>
      (a.status === "Present" || a.status === "Absent" || a.status === "Late") &&
      filteredStaff.some(s => s._id === a.staffId)
    );

    if (!isHoliday && validEntries.length === 0) {
      toast.error("Please mark at least one staff as Present, Absent, or Late");
      return;
    }

    setIsSaving(true);
    try {
      const dateBS = formatBSDate();
      const payload = isHoliday
        ? { dateBS, isHoliday: true, attendance: [] }
        : { 
            dateBS, 
            isHoliday: false, 
            attendance: validEntries
          };

      const response = await fetch(`${API_URL}/api/admin/attendance/daily`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      if (data.success) {
        if (isHoliday) {
          setIsHolidayLocked(true);
          toast.success("Holiday saved successfully");
        } else {
          toast.success(`Attendance saved for ${validEntries.length} staff`);
          // Remove saved staff from local state immediately
          const savedStaffIds = new Set(validEntries.map(e => e.staffId));
          setAttendance(prev => {
            const remaining: Record<string, AttendanceEntry> = {};
            Object.entries(prev).forEach(([id, entry]) => {
              if (!savedStaffIds.has(id)) {
                remaining[id] = entry;
              }
            });
            return remaining;
          });
          // Also remove from staff list immediately for instant UI update
          setStaff(prev => prev.filter(s => !savedStaffIds.has(s._id)));
          // Then do a proper reload from server to sync
          setTimeout(() => loadStaff(), 100);
        }
      } else {
        toast.error(data.message || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save attendance");
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate stats for filtered staff
  const presentCount = filteredStaff.filter(s => attendance[s._id]?.status === "Present").length;
  const absentCount = filteredStaff.filter(s => attendance[s._id]?.status === "Absent").length;
  const lateCount = filteredStaff.filter(s => attendance[s._id]?.status === "Late").length;
  const holdCount = filteredStaff.filter(s => attendance[s._id]?.status === "Hold").length;

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="daily-attendance-container">
      {/* Stats Header */}
      <div className="stats-grid">
        <div className="stat-card date-card">
          <div className="stat-label">
            <Calendar size={14} />
            Date (BS)
          </div>
          <div className="stat-value date-value">{formatBSDate()}</div>
          {isHoliday && <span className="holiday-badge">Holiday</span>}
          {isHolidayLocked && <span className="locked-badge">Holiday</span>}
        </div>

        <div className="stat-card present-card">
          <div className="stat-label">Present</div>
          <div className="stat-value present">{filteredStaff.length > 0 ? presentCount : "-"}</div>
        </div>

        <div className="stat-card absent-card">
          <div className="stat-label">Absent</div>
          <div className="stat-value absent">{filteredStaff.length > 0 ? absentCount : "-"}</div>
        </div>

        <div className="stat-card late-card">
          <div className="stat-label">Late</div>
          <div className="stat-value late">{filteredStaff.length > 0 ? lateCount : "-"}</div>
        </div>

        <div className="stat-card hold-card">
          <div className="stat-label">Hold</div>
          <div className="stat-value hold">{filteredStaff.length > 0 ? holdCount : "-"}</div>
        </div>
      </div>

      {/* Holiday Lock Banner */}
      {isHolidayLocked && (
        <div className="lock-banner">
          <Lock className="lock-icon" />
          <span>Holiday declared for {formatBSDate()}. Attendance is closed.</span>
        </div>
      )}

      {/* Controls */}
      <div className="control-panel">
        {/* BS Date Selectors */}
        <div className="date-selectors">
          <div className="control-group">
            <label>Year (BS)</label>
            <select value={yearBS} onChange={(e) => setYearBS(parseInt(e.target.value))} disabled={isHolidayLocked}>
              {bsYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="control-group">
            <label>Month (BS)</label>
            <select value={monthBS} onChange={(e) => setMonthBS(parseInt(e.target.value))} disabled={isHolidayLocked}>
              {bsMonths.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="control-group">
            <label>Day (BS)</label>
            <input
              type="number"
              min={1}
              max={32}
              value={dayBS}
              onChange={(e) => setDayBS(parseInt(e.target.value) || 1)}
              disabled={isHolidayLocked}
              className="day-input"
            />
          </div>
        </div>

        {/* Holiday Toggle */}
        <label className={`holiday-toggle ${isHolidayLocked ? "disabled" : ""}`}>
          <input
            type="checkbox"
            checked={isHoliday}
            onChange={(e) => handleHolidayChange(e.target.checked)}
            disabled={isHolidayLocked}
          />
          <span>Mark Today as Holiday</span>
        </label>
      </div>

      {/* Filters */}
      {!isHoliday && (
        <div className="filters-panel">
          <div className="filter-group search-group">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              <option value="">All Roles</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state">Loading staff...</div>
      )}

      {/* Holiday View */}
      {!isLoading && isHoliday && (
        <div className="holiday-view">
          <div className={`holiday-banner-large ${isSaturday ? 'saturday-holiday' : ''}`}>
            <Calendar size={48} />
            <h3>{isSaturday ? 'Saturday - Weekly Holiday 🎉' : 'Holiday Declared'}</h3>
            <p>{isSaturday 
              ? 'Saturday is automatically marked as a weekly holiday. No attendance marking allowed.' 
              : 'Attendance will be marked as Holiday for all staff.'
            }</p>
            {isSaturday && (
              <span className="saturday-badge">Automatic Holiday</span>
            )}
          </div>
          {!isHolidayLocked && !isSaturday && (
            <button className="save-btn" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Holiday"}
            </button>
          )}
        </div>
      )}

      {/* Attendance Table */}
      {!isLoading && !isHoliday && filteredStaff.length > 0 && (
        <div className="attendance-table-container">
          <div className="table-header-bar">
            <h3>Staff Attendance ({filteredStaff.length} shown)</h3>
            {!isHolidayLocked && (
              <button className="save-btn" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Attendance"}
              </button>
            )}
          </div>
          
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((s) => (
                <tr key={s._id} className={attendance[s._id]?.status?.toLowerCase()}>
                  <td>
                    <div className="staff-cell">
                      <div className="staff-avatar">{getInitials(s.fullName)}</div>
                      <div className="staff-info">
                        <span className="staff-name">{s.fullName}</span>
                        <span className="staff-email">{s.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{s.department || "N/A"}</td>
                  <td>{s.designation || s.role || "N/A"}</td>
                  <td>
                    <div className="status-options">
                      {["Hold", "Present", "Absent", "Late"].map((status) => {
                        const currentStatus = attendance[s._id]?.status;
                        
                        return (
                          <label
                            key={status}
                            className={`status-option ${status.toLowerCase()} ${
                              currentStatus === status ? "active" : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name={`status-${s._id}`}
                              value={status}
                              checked={currentStatus === status}
                              onChange={() => handleStatusChange(s._id, status as "Hold" | "Present" | "Absent" | "Late")}
                              disabled={isHolidayLocked}
                            />
                            <span>{status === "Hold" ? "H" : status.charAt(0)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="note-input"
                      placeholder="Add note..."
                      value={attendance[s._id]?.note || ""}
                      onChange={(e) => handleNoteChange(s._id, e.target.value)}
                      disabled={isHolidayLocked}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isHoliday && filteredStaff.length === 0 && staff.length > 0 && (
        <div className="empty-state">
          <Search size={48} />
          <p>No staff match your filters.</p>
          <button 
            className="clear-filters-btn"
            onClick={() => { setSearchQuery(""); setSelectedDepartment(""); setSelectedRole(""); }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {!isLoading && !isHoliday && staff.length === 0 && (
        <div className="empty-state">
          <Calendar size={48} />
          <p>No staff found for this date.</p>
        </div>
      )}
    </div>
  );
}
