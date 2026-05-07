"use client";

interface StaffTabsProps {
  activeTab: "add" | "list";
  onTabChange: (tab: "add" | "list") => void;
}

export default function StaffTabs({ activeTab, onTabChange }: StaffTabsProps) {
  return (
    <div className="staff-tabs">
      <button
        className={`tab-btn ${activeTab === "list" ? "active" : ""}`}
        onClick={() => onTabChange("list")}
      >
        Staff List
      </button>
      <button
        className={`tab-btn ${activeTab === "add" ? "active" : ""}`}
        onClick={() => onTabChange("add")}
      >
        Add Staff
      </button>
    </div>
  );
}
