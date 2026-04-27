"use client";

import { useState } from "react";
import Layout from "../components/AdmLayout";
import { Toaster } from 'sonner';
import DailyAttendance from "./components/DailyAttendance";
import MonthlyAttendance from "./components/MonthlyAttendance";
import "./attendance.css";

type TabType = "daily" | "monthly";

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<TabType>("daily");

  return (
    <Layout>
      <Toaster position="top-right" />
      
      <div className="attendance-header">
        <h1 className="attendance-title">Teacher Attendance</h1>
        <div className="attendance-tabs">
          <button
            className={`tab-btn ${activeTab === "daily" ? "active" : ""}`}
            onClick={() => setActiveTab("daily")}
          >
            Daily Attendance
          </button>
          <button
            className={`tab-btn ${activeTab === "monthly" ? "active" : ""}`}
            onClick={() => setActiveTab("monthly")}
          >
            Monthly Attendance
          </button>
        </div>
      </div>

      {activeTab === "daily" ? (
        <DailyAttendance />
      ) : (
        <MonthlyAttendance />
      )}
    </Layout>
  );
}
