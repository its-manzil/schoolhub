"use client";

import { CalendarDays, CalendarRange, FileText } from "lucide-react";
import "../styles/attendance-navbar.css";

type TabType = "daily" | "monthly" | "records";

interface AttendanceNavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function AttendanceNavbar({ activeTab, onTabChange }: AttendanceNavbarProps) {
  const tabs = [
    { id: "daily" as TabType, label: "Daily Attendance", icon: CalendarDays },
    { id: "monthly" as TabType, label: "Monthly Attendance", icon: CalendarRange },
    { id: "records" as TabType, label: "Attendance Records", icon: FileText },
  ];

  const getModeLabel = () => {
    switch (activeTab) {
      case "daily":
        return "Daily Mode";
      case "monthly":
        return "Monthly Mode";
      case "records":
        return "Reports Mode";
    }
  };

  return (
    <div className="attendance-navbar-wrapper">
      <div className="attendance-mode-indicator">
        <span className="mode-label">Attendance Mode:</span>
        <span className={`mode-value mode-${activeTab}`}>{getModeLabel()}</span>
      </div>
      <nav className="attendance-navbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`navbar-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
