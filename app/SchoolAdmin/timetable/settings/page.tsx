"use client";

import { useState } from "react";
import Layout from "../../Components/Layout";

export default function SettingsPage() {
  const [schoolInfo, setSchoolInfo] = useState({
    name: "SchoolHub International",
    code: "SH-9901",
    email: "info@schoolhub.com",
    phone: "+1 234-567-8900"
  });

  const [academicData, setAcademicData] = useState({
    year: "2025-2026",
    term: "Term 2",
    currency: "$"
  });

  const [branding, setBranding] = useState({
    themeColor: "#2563eb"
  });

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSchoolInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleAcademicChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setAcademicData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (section: string) => {
    alert(`${section} settings saved successfully!`);
  };

  return (
    <Layout>
      <div className="card">
        <div className="card-title">General School Information</div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label htmlFor="school-name">School Name</label>
            <input
              type="text"
              id="school-name"
              name="name"
              value={schoolInfo.name}
              onChange={handleInfoChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="school-code">School Code</label>
            <input
              type="text"
              id="school-code"
              name="code"
              value={schoolInfo.code}
              onChange={handleInfoChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label htmlFor="school-email">Official Email Address</label>
            <input
              type="email"
              id="school-email"
              name="email"
              value={schoolInfo.email}
              onChange={handleInfoChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="school-phone">Phone Number</label>
            <input
              type="text"
              id="school-phone"
              name="phone"
              value={schoolInfo.phone}
              onChange={handleInfoChange}
            />
          </div>
        </div>

        <div className="action-row">
          <button className="submit-btn" onClick={() => handleSave("School Info")}>Save School Info</button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Academic & Session Controls</div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="academic-year">Active Academic Year</label>
            <select
              id="academic-year"
              name="year"
              value={academicData.year}
              onChange={handleAcademicChange}
            >
              <option>2025-2026</option>
              <option>2026-2027</option>
              <option>2027-2028</option>
            </select>
            <span style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
              This controls the default data loaded across all modules.
            </span>
          </div>
          <div className="form-group">
            <label htmlFor="current-term">Current Term/Semester</label>
            <select
              id="current-term"
              name="term"
              value={academicData.term}
              onChange={handleAcademicChange}
            >
              <option>Term 1</option>
              <option>Term 2</option>
              <option>Term 3</option>
              <option>Final Examination</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="currency">Default Currency Symbol</label>
            <input
              type="text"
              id="currency"
              name="currency"
              value={academicData.currency}
              onChange={handleAcademicChange}
            />
          </div>
        </div>

        <div className="action-row">
          <button className="submit-btn" onClick={() => handleSave("Academic session")}>Update Session</button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Branding (Receipts & Reports)</div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="logo-upload">School Logo</label>
            <input type="file" id="logo-upload" accept="image/*" onChange={() => alert("Logo uploaded!")} />
            <span style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
              Recommended size: 200x200px (PNG or JPG).
            </span>
          </div>
          <div className="form-group">
            <label htmlFor="theme-color">Primary Theme Color</label>
            <input
              type="color"
              id="theme-color"
              value={branding.themeColor}
              onChange={(e) => setBranding({ themeColor: e.target.value })}
            />
            <span style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
              This updates buttons and accents system-wide.
            </span>
          </div>
        </div>

        <div className="action-row">
          <button className="submit-btn" onClick={() => handleSave("Branding")}>Apply Branding</button>
        </div>
      </div>
    </Layout>
  );
}
