"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Download, Filter, Users, Calendar, Search, Printer, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import "../styles/attendance-records.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2056";

// BS Months
const bsMonths = [
  { value: 1, label: "Baishakh" },
  { value: 2, label: "Jestha" },
  { value: 3, label: "Ashadh" },
  { value: 4, label: "Shrawan" },
  { value: 5, label: "Bhadra" },
  { value: 6, label: "Ashwin" },
  { value: 7, label: "Kartik" },
  { value: 8, label: "Mangsir" },
  { value: 9, label: "Poush" },
  { value: 10, label: "Magh" },
  { value: 11, label: "Falgun" },
  { value: 12, label: "Chaitra" },
];

const bsYears = Array.from({ length: 13 }, (_, i) => 2078 + i);

interface AttendanceRecord {
  _id: string;
  schoolId: string;
  date: string;
  dateBS: string;
  type: string;
  isHoliday: boolean;
  staffId: string;
  fullName: string;
  department: string;
  role: string;
  status: "P" | "A" | "L" | "Hold";
  note?: string;
}

interface StaffMatrix {
  [staffName: string]: {
    [day: number]: "P" | "A" | "H" | "L" | "";
    totalPresent: number;
    totalHolidays: number;
    totalAbsent: number;
    totalLeave: number;
    role: string;
    department: string;
    staffId: string;
  };
}

interface RoleGroup {
  [role: string]: StaffMatrix;
}

export default function AttendanceRecords() {
  const [yearBS, setYearBS] = useState<number>(2081);
  const [monthBS, setMonthBS] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [staffFilter, setStaffFilter] = useState<string>("");
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  // Get days in selected BS month (max 32 for BS calendar)
  const daysInMonth = useMemo(() => {
    // BS months have varying days (29-32), use 32 as max for safety
    return 32;
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }, []);

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
      }
    } catch (error) {
      console.error("Error fetching BS date:", error);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchCurrentBSDate();
  }, [fetchCurrentBSDate]);

  const fetchAttendance = useCallback(async () => {
    if (!yearBS || !monthBS) return;

    setIsLoading(true);
    try {
      // Use the report API with BS year/month filter
      const params = new URLSearchParams({
        yearBS: yearBS.toString(),
        monthBS: monthBS.toString(),
      });

      const response = await fetch(`${API_URL}/api/admin/attendance/report?${params}`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Fetch detailed records for the sheet view
        const recordsRes = await fetch(
          `${API_URL}/api/admin/attendance/detailed?${params}`,
          { headers: getAuthHeaders() }
        );
        
        if (recordsRes.status === 401) {
          localStorage.clear();
          window.location.href = "/login";
          return;
        }

        let records: AttendanceRecord[] = [];
        const recordsData = await recordsRes.json();
        if (recordsData.success && recordsData.data) {
          records = recordsData.data;
        }

        // Extract unique roles from records
        if (records.length > 0) {
          const roles: string[] = [...new Set(records.map(r => r.role).filter((r): r is string => Boolean(r)))];
          setAvailableRoles(roles);
          toast.success(`Loaded ${records.length} attendance records`);
        } else {
          // Fetch staff to get available roles even if no attendance
          const staffRes = await fetch(`${API_URL}/api/admin/attendance/staff`, {
            headers: getAuthHeaders(),
          });
          if (staffRes.ok) {
            const staffData = await staffRes.json();
            if (staffData.success) {
              const staffRoles = staffData.data.map((s: { role?: string; designation?: string }) => s.role || s.designation).filter(Boolean) as string[];
              const roles: string[] = [...new Set(staffRoles)];
              setAvailableRoles(roles);
            }
          }
          toast.info("No attendance records found for selected month");
        }

        setAttendanceData(records);
      } else {
        toast.error(data.message || "Failed to load attendance");
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to load attendance records");
    } finally {
      setIsLoading(false);
    }
  }, [yearBS, monthBS, getAuthHeaders]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Build the matrix data structure
  const matrixData = useMemo((): RoleGroup => {
    const matrix: RoleGroup = {};

    attendanceData.forEach((record) => {
      if (!record.staffId) return;

      const role = record.role || record.department || "Staff";
      const staffName = record.fullName || "Unknown";

      if (!matrix[role]) {
        matrix[role] = {};
      }

      if (!matrix[role][staffName]) {
        matrix[role][staffName] = {
          totalPresent: 0,
          totalHolidays: 0,
          totalAbsent: 0,
          totalLeave: 0,
          role,
          department: record.department || "",
          staffId: record.staffId,
        };
        // Initialize all days as empty
        for (let i = 1; i <= daysInMonth; i++) {
          matrix[role][staffName][i] = "";
        }
      }

      // Parse day from dateBS (format: YYYY-MM-DD)
      if (record.dateBS) {
        const day = parseInt(record.dateBS.split("-")[2]);
        if (day >= 1 && day <= daysInMonth) {
          let status: "P" | "A" | "H" | "L" | "" = "";
          
          if (record.isHoliday) {
            status = "H";
            matrix[role][staffName].totalHolidays++;
          } else if (record.status === "P") {
            status = "P";
            matrix[role][staffName].totalPresent++;
          } else if (record.status === "A") {
            status = "A";
            matrix[role][staffName].totalAbsent++;
          } else if (record.status === "L") {
            status = "L";
            matrix[role][staffName].totalLeave++;
          }

          matrix[role][staffName][day] = status;
        }
      }
    });

    return matrix;
  }, [attendanceData, daysInMonth]);

  // Filter the matrix
  const filteredMatrix = useMemo((): RoleGroup => {
    if (!roleFilter && !staffFilter) return matrixData;

    const filtered: RoleGroup = {};

    Object.entries(matrixData).forEach(([role, staffData]) => {
      if (roleFilter && role !== roleFilter) return;

      const filteredStaff: StaffMatrix = {};
      Object.entries(staffData).forEach(([staffName, data]) => {
        if (staffFilter && !staffName.toLowerCase().includes(staffFilter.toLowerCase())) return;
        filteredStaff[staffName] = data;
      });

      if (Object.keys(filteredStaff).length > 0) {
        filtered[role] = filteredStaff;
      }
    });

    return filtered;
  }, [matrixData, roleFilter, staffFilter]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "P":
        return "status-present";
      case "A":
        return "status-absent";
      case "H":
        return "status-holiday";
      case "L":
        return "status-leave";
      default:
        return "status-empty";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSVG = () => {
    const svgContent = generateSVG();
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `attendance-record-${yearBS}-${monthBS.toString().padStart(2, "0")}.svg`;
    link.click();
    toast.success("SVG downloaded successfully");
  };

  const generateSVG = (): string => {
    const monthName = bsMonths.find(m => m.value === monthBS)?.label || "";
    const width = 1200;
    const rowHeight = 35;
    const headerHeight = 80;
    const colWidth = 32;
    const nameColWidth = 180;
    const totalColWidth = 80;
    
    const roles = Object.keys(filteredMatrix);
    let totalRows = 0;
    roles.forEach(role => {
      totalRows++; // Role header
      totalRows += Object.keys(filteredMatrix[role]).length; // Staff rows
    });
    
    const height = headerHeight + (totalRows * rowHeight) + 40;
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    svg += `<style>`;
    svg += `text { font-family: system-ui, -apple-system, sans-serif; font-size: 12px; }`;
    svg += `.header { fill: #1e293b; font-weight: bold; font-size: 14px; }`;
    svg += `.role-header { fill: #fff; font-weight: bold; font-size: 13px; }`;
    svg += `.cell { fill: #334155; }`;
    svg += `.present { fill: #16a34a; font-weight: bold; }`;
    svg += `.absent { fill: #dc2626; font-weight: bold; }`;
    svg += `.holiday { fill: #ea580c; font-weight: bold; }`;
    svg += `.leave { fill: #9333ea; font-weight: bold; }`;
    svg += `</style>`;
    
    // Background
    svg += `<rect width="${width}" height="${height}" fill="#f8fafc"/>`;
    
    // Title
    svg += `<text x="20" y="30" class="header">Attendance Record - ${monthName} ${yearBS}</text>`;
    
    // Table header background
    svg += `<rect x="20" y="50" width="${width - 40}" height="30" fill="#1e293b"/>`;
    
    // Column headers
    let x = 20;
    svg += `<text x="${x + 10}" y="70" fill="#fff" font-weight="bold">Name</text>`;
    x += nameColWidth;
    
    for (let i = 1; i <= daysInMonth; i++) {
      svg += `<text x="${x + 10}" y="70" fill="#fff" font-size="10">${i}</text>`;
      x += colWidth;
    }
    
    svg += `<text x="${x + 10}" y="70" fill="#fff" font-weight="bold">P</text>`;
    x += totalColWidth;
    svg += `<text x="${x + 10}" y="70" fill="#fff" font-weight="bold">H</text>`;
    
    // Data rows
    let y = headerHeight;
    roles.forEach(role => {
      // Role header
      svg += `<rect x="20" y="${y}" width="${width - 40}" height="${rowHeight}" fill="#3b82f6"/>`;
      svg += `<text x="30" y="${y + 22}" class="role-header">${role}</text>`;
      y += rowHeight;
      
      // Staff rows
      Object.entries(filteredMatrix[role]).forEach(([staffName, data]) => {
        const bgColor = y % (rowHeight * 2) === headerHeight % (rowHeight * 2) ? "#fff" : "#f1f5f9";
        svg += `<rect x="20" y="${y}" width="${width - 40}" height="${rowHeight}" fill="${bgColor}" stroke="#e2e8f0" stroke-width="0.5"/>`;
        
        x = 20;
        svg += `<text x="${x + 10}" y="${y + 22}" class="cell">${staffName}</text>`;
        x += nameColWidth;
        
        for (let i = 1; i <= daysInMonth; i++) {
          const status = data[i] as string;
          const statusClass = status === "P" ? "present" : status === "A" ? "absent" : status === "H" ? "holiday" : status === "L" ? "leave" : "cell";
          svg += `<text x="${x + 10}" y="${y + 22}" class="${statusClass}">${status || "-"}</text>`;
          x += colWidth;
        }
        
        svg += `<text x="${x + 10}" y="${y + 22}" class="present">${data.totalPresent}</text>`;
        x += totalColWidth;
        svg += `<text x="${x + 10}" y="${y + 22}" class="holiday">${data.totalHolidays}</text>`;
        
        y += rowHeight;
      });
    });
    
    svg += `</svg>`;
    return svg;
  };

  const hasData = Object.keys(filteredMatrix).length > 0;

  return (
    <div className="records-container">
      {/* Header with Filters */}
      <div className="records-header">
        <div className="records-title-section">
          <h2 className="records-title">
            <FileSpreadsheet size={22} />
            Attendance Record
          </h2>
          <span className="records-subtitle">Monthly attendance sheet view</span>
        </div>

        <div className="records-filters-row">
          <div className="filter-control">
            <label>Year (BS)</label>
            <select value={yearBS} onChange={(e) => setYearBS(parseInt(e.target.value))}>
              {bsYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-control">
            <label>Month (BS)</label>
            <select value={monthBS} onChange={(e) => setMonthBS(parseInt(e.target.value))}>
              {bsMonths.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-control">
            <label>Role</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-control">
            <label>Staff</label>
            <div className="search-input-wrapper">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search staff..."
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="filter-actions-row">
            <button className="btn-icon" onClick={handlePrint} title="Print">
              <Printer size={16} />
            </button>
            <button className="btn-icon" onClick={handleDownloadSVG} title="Download SVG">
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="records-legend">
        <span className="legend-item">
          <span className="legend-dot present" /> P = Present
        </span>
        <span className="legend-item">
          <span className="legend-dot absent" /> A = Absent
        </span>
        <span className="legend-item">
          <span className="legend-dot holiday" /> H = Holiday
        </span>
        <span className="legend-item">
          <span className="legend-dot leave" /> L = Leave
        </span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state">
          <Calendar size={32} />
          <p>Loading attendance records...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !hasData && (
        <div className="empty-state">
          <Filter size={48} />
          <p>No attendance records found</p>
          <span>Select a different month or check if attendance has been recorded</span>
        </div>
      )}

      {/* Attendance Sheet Table */}
      {!isLoading && hasData && (
        <div className="attendance-sheet-wrapper">
          <div className="attendance-sheet-container">
            <table className="attendance-sheet-table">
              <thead>
                <tr>
                  <th className="sticky-header name-col">Name</th>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <th key={i} className="day-col">
                      {i + 1}
                    </th>
                  ))}
                  <th className="sticky-header total-col present-col">Total P</th>
                  <th className="sticky-header total-col holiday-col">Holidays</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(filteredMatrix).map(([role, staffData]) => (
                  <>
                    {/* Role Header Row */}
                    <tr key={`role-${role}`} className="role-header-row">
                      <td colSpan={daysInMonth + 3} className="role-header-cell">
                        <Users size={14} />
                        {role}
                      </td>
                    </tr>
                    
                    {/* Staff Rows */}
                    {Object.entries(staffData).map(([staffName, data]) => (
                      <tr key={`staff-${data.staffId}`} className="staff-row">
                        <td className="sticky-cell name-col">
                          <div className="staff-info-cell">
                            <span className="staff-name">{staffName}</span>
                            <span className="staff-dept">{data.department}</span>
                          </div>
                        </td>
                        {Array.from({ length: daysInMonth }, (_, i) => {
                          const day = i + 1;
                          const status = data[day] as string;
                          return (
                            <td key={day} className={`day-cell ${getStatusColor(status)}`}>
                              {status || "-"}
                            </td>
                          );
                        })}
                        <td className="total-cell present-total">{data.totalPresent}</td>
                        <td className="total-cell holiday-total">{data.totalHolidays}</td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {!isLoading && hasData && (
        <div className="records-summary">
          <div className="summary-item">
            <span className="summary-label">Total Roles</span>
            <span className="summary-value">{Object.keys(filteredMatrix).length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Staff</span>
            <span className="summary-value">
              {Object.values(filteredMatrix).reduce((acc, staffData) => acc + Object.keys(staffData).length, 0)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Month</span>
            <span className="summary-value">{bsMonths.find(m => m.value === monthBS)?.label} {yearBS}</span>
          </div>
        </div>
      )}
    </div>
  );
}
