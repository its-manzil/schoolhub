"use client";

import { useState } from "react";
import Layout from "../Components/Layout";

export default function ParentAppPage() {
  const [homework] = useState([
    { id: 1, subject: "Math", task: "Complete Exercise 4B", desc: "Please ensure your child completes the geometry proofs.", due: "Tomorrow", pending: true },
    { id: 2, subject: "Physics", task: "Read Chapter 3", due: "Friday", pending: false },
  ]);

  const [notices] = useState([
    { id: 1, title: "Parent-Teacher Meeting", desc: "Scheduled for next Saturday from 10:00 AM.", date: "2 days ago" },
  ]);

  return (
    <Layout>
      <div style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "white", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "25px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }}>
        <div>
          <h2 style={{ fontSize: "22px", marginBottom: "5px" }}>John Doe</h2>
          <p style={{ fontSize: "14px", opacity: 0.9 }}>Grade 10 - Section A | Roll No: 1001</p>
        </div>
        <div style={{ backgroundColor: "rgba(255, 255, 255, 0.2)", padding: "8px 15px", borderRadius: "20px", fontSize: "14px", fontWeight: "600" }}>📍 Present Today</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "25px" }}>
        <div>
          <div className="card">
            <div className="card-title">Today&apos;s Class Schedule</div>

            <div style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #edf2f7" }}>
              <div style={{ width: "80px", fontSize: "13px", fontWeight: "600", color: "#718096" }}>09:00 AM</div>
              <div style={{ flex: 1, fontSize: "14px", color: "#2d3748", fontWeight: "600" }}>Advanced Mathematics</div>
              <div style={{ fontSize: "12px", color: "#718096", fontStyle: "italic" }}>Scarlett J.</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #edf2f7" }}>
              <div style={{ width: "80px", fontSize: "13px", fontWeight: "600", color: "#718096" }}>10:00 AM</div>
              <div style={{ flex: 1, fontSize: "14px", color: "#2d3748", fontWeight: "600" }}>Physics</div>
              <div style={{ fontSize: "12px", color: "#718096", fontStyle: "italic" }}>Robert D.</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "none" }}>
              <div style={{ width: "80px", fontSize: "13px", fontWeight: "600", color: "#718096" }}>11:30 AM</div>
              <div style={{ flex: 1, fontSize: "14px", color: "#2d3748", fontWeight: "600" }}>English Literature</div>
              <div style={{ fontSize: "12px", color: "#718096", fontStyle: "italic" }}>Chris E.</div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Assigned Homework</div>

            {homework.map(hw => (
              <div key={hw.id} style={{ borderLeft: hw.pending ? "4px solid #ef4444" : "4px solid #2563eb", backgroundColor: "#f8fafc", padding: "12px", borderRadius: "4px", marginBottom: "12px" }}>
                <p style={{ fontWeight: 600, fontSize: "14px", color: "#2d3748", marginBottom: "4px" }}>{hw.subject}: {hw.task}</p>
                {hw.desc && <p style={{ fontSize: "13px", color: "#4a5568" }}>{hw.desc}</p>}
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Due: {hw.due}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-title">Term 2 Progress</div>

            <div style={{ marginBottom: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span>Overall Attendance</span>
                <span style={{ fontWeight: "bold" }}>92%</span>
              </div>
              <div style={{ height: "8px", backgroundColor: "#f1f5f9", borderRadius: "4px", overflow: "hidden", marginTop: "5px" }}>
                <div style={{ height: "100%", backgroundColor: "#2563eb", borderRadius: "4px", width: "92%" }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span>Academic Average</span>
                <span style={{ fontWeight: "bold" }}>85%</span>
              </div>
              <div style={{ height: "8px", backgroundColor: "#f1f5f9", borderRadius: "4px", overflow: "hidden", marginTop: "5px" }}>
                <div style={{ height: "100%", backgroundColor: "#0ea5e9", borderRadius: "4px", width: "85%" }}></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Latest School Notices</div>

            {notices.map(notice => (
              <div key={notice.id} style={{ borderLeft: "4px solid #f59e0b", backgroundColor: "#f8fafc", padding: "12px", borderRadius: "4px", marginBottom: "12px" }}>
                <p style={{ fontWeight: 600, fontSize: "14px", color: "#2d3748", marginBottom: "4px" }}>{notice.title}</p>
                <p style={{ fontSize: "13px", color: "#4a5568" }}>{notice.desc}</p>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Posted: {notice.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
