"use client";

import { useState } from "react";
import Layout from "../components/AdmLayout";
import { useBasePath } from "../components/useBasePath";
import { Toaster } from 'sonner';
import AttendanceNavbar from "./components/AttendanceNavbar";
import DailyAttendance from "./components/DailyAttendance";
import MonthlyAttendance from "./components/MonthlyAttendance";
import AttendanceRecords from "./components/AttendanceRecords";
import "./attendance.css";

type TabType = "daily" | "monthly" | "records";

export default function AttendancePage() {
  const basePath = useBasePath();
  const [activeTab, setActiveTab] = useState<TabType>("daily");

  const renderComponent = () => {
    switch (activeTab) {
      case "daily":
        return <DailyAttendance />;
      case "monthly":
        return <MonthlyAttendance />;
      case "records":
        return <AttendanceRecords />;
      default:
        return <DailyAttendance />;
    }
  };

  return (
    <Layout basePath={basePath}>
      <Toaster position="top-right" />
      
      <div className="attendance-header">
        <h1 className="attendance-title">Teacher Attendance</h1>
        <AttendanceNavbar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {renderComponent()}
    </Layout>
  );
}
