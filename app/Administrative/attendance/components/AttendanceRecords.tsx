"use client";

import { useState, useEffect, useMemo } from "react";
import { Download, Filter, Users, Calendar, FileText, CheckCircle, XCircle, Clock, Umbrella } from "lucide-react";
import { toast } from "sonner";
import "../styles/attendance-records.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2056";

interface Staff {
  _id: string;
  fullName: string;
  department: string;
  designation: string;
}

interface ReportData {
  staffId: string;
  staffName: string;
  department: string;
  present: number;
  absent: number;
  late: number;
  holidays: number;
  total: number;
}

type DateRange = "weekly" | "monthly" | "yearly" | "custom";

export default function AttendanceRecords() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange>("monthly");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData[]>([]);

  const setDefaultDateRange = () => {
    const today = new Date();
    let start: Date;
    const end: Date = today;

    switch (dateRange) {
      case "weekly":
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        break;
      case "monthly":
        start = new Date(today);
        start.setMonth(today.getMonth() - 1);
        break;
      case "yearly":
        start = new Date(today);
        start.setFullYear(today.getFullYear() - 1);
        break;
      default:
        start = new Date(today);
        start.setMonth(today.getMonth() - 1);
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const loadStaffList = async () => {
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
        const uniqueDepts = [...new Set(data.data.map((s: Staff) => s.department).filter(Boolean))] as string[];
        setDepartments(uniqueDepts);
      }
    } catch (error) {
      console.error("Error loading staff:", error);
    }
  };

  useEffect(() => {
    loadStaffList();
    setDefaultDateRange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (dateRange !== "custom") {
      setDefaultDateRange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select date range");
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...(selectedStaff && { staffId: selectedStaff }),
        ...(selectedDepartment && { department: selectedDepartment }),
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
        setReportData(data.data.summary || []);
        toast.success(`Loaded ${data.data.summary?.length || 0} staff records`);
      } else {
        toast.error(data.message || "Failed to load report");
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to load report");
    } finally {
      setIsLoading(false);
    }
  };

  const totals = useMemo(() => {
    return reportData.reduce(
      (acc, curr) => ({
        present: acc.present + curr.present,
        absent: acc.absent + curr.absent,
        late: acc.late + curr.late,
        holidays: acc.holidays + curr.holidays,
      }),
      { present: 0, absent: 0, late: 0, holidays: 0 }
    );
  }, [reportData]);

  const exportReport = () => {
    if (reportData.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csvContent = [
      ["Staff Name", "Department", "Present", "Absent", "Late", "Holidays", "Total"].join(","),
      ...reportData.map((r) =>
        [r.staffName, r.department, r.present, r.absent, r.late, r.holidays, r.total].join(",")
      ),
      ["", "TOTAL", totals.present, totals.absent, totals.late, totals.holidays, ""].join(","),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `attendance-report-${startDate}-to-${endDate}.csv`;
    link.click();
    toast.success("Report downloaded");
  };

  return (
    <div className="records-container">
      <div className="records-filters">
        <div className="filter-section">
          <h3 className="filter-title">
            <Filter size={16} />
            Filters
          </h3>

          <div className="filter-grid">
            <div className="filter-group">
              <label>Staff</label>
              <select value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)}>
                <option value="">All Staff</option>
                {staffList.map((staff) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Department</label>
              <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Date Range</label>
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value as DateRange)}>
                <option value="weekly">Last 7 Days</option>
                <option value="monthly">Last 30 Days</option>
                <option value="yearly">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>

          {dateRange === "custom" && (
            <div className="custom-date-range">
              <div className="filter-group">
                <label>Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="filter-group">
                <label>End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          )}

          <div className="filter-actions">
            <button className="btn-generate" onClick={fetchReport} disabled={isLoading}>
              <FileText size={16} />
              {isLoading ? "Generating..." : "Generate Report"}
            </button>
            <button className="btn-export" onClick={exportReport} disabled={reportData.length === 0}>
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {reportData.length > 0 && (
        <>
          <div className="stats-overview">
            <div className="stat-box present">
              <CheckCircle size={24} />
              <div className="stat-info">
                <span className="stat-count">{totals.present}</span>
                <span className="stat-label">Present</span>
              </div>
            </div>
            <div className="stat-box absent">
              <XCircle size={24} />
              <div className="stat-info">
                <span className="stat-count">{totals.absent}</span>
                <span className="stat-label">Absent</span>
              </div>
            </div>
            <div className="stat-box late">
              <Clock size={24} />
              <div className="stat-info">
                <span className="stat-count">{totals.late}</span>
                <span className="stat-label">Late</span>
              </div>
            </div>
            <div className="stat-box holiday">
              <Umbrella size={24} />
              <div className="stat-info">
                <span className="stat-count">{totals.holidays}</span>
                <span className="stat-label">Holidays</span>
              </div>
            </div>
          </div>

          <div className="report-table-container">
            <h3 className="table-title">
              <Users size={18} />
              Attendance Summary by Staff
            </h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Department</th>
                  <th className="col-present">Present</th>
                  <th className="col-absent">Absent</th>
                  <th className="col-late">Late</th>
                  <th className="col-holiday">Holidays</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row) => (
                  <tr key={row.staffId}>
                    <td>
                      <div className="staff-name-cell">{row.staffName}</div>
                    </td>
                    <td>{row.department || "N/A"}</td>
                    <td className="col-present">{row.present}</td>
                    <td className="col-absent">{row.absent}</td>
                    <td className="col-late">{row.late}</td>
                    <td className="col-holiday">{row.holidays}</td>
                    <td className="font-medium">{row.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="total-label">
                    TOTAL
                  </td>
                  <td className="col-present">{totals.present}</td>
                  <td className="col-absent">{totals.absent}</td>
                  <td className="col-late">{totals.late}</td>
                  <td className="col-holiday">{totals.holidays}</td>
                  <td>-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {reportData.length === 0 && !isLoading && (
        <div className="empty-state-records">
          <Calendar size={48} />
          <p>Select filters and click &quot;Generate Report&quot; to view attendance records</p>
        </div>
      )}
    </div>
  );
}
