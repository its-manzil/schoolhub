"use client";

import React, { useState } from 'react';
import Layout from "../components/AdmLayout";

export default function TeacherApp() {
  const [activeTab, setActiveTab] = useState('overview');

  const teacherStats = [
    { label: "My Classes", value: "4", icon: "🏫" },
    { label: "Total Students", value: "142", icon: "👥" },
    { label: "Pending Assignments", value: "12", icon: "📝" },
    { label: "Attendance Done", value: "85%", icon: "✅" },
  ];

  return (
    <Layout>
      <div className="teacher-app-container">
        {/* Welcome Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
          color: 'white', 
          padding: '25px', 
          borderRadius: '15px', 
          marginBottom: '25px',
          boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '5px' }}>Welcome Back, Instructor!</h1>
          <p style={{ opacity: 0.9 }}>Check your schedule and manage your classes for today.</p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {teacherStats.map((stat, index) => (
            <div key={index} style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div style={{ fontSize: '30px' }}>{stat.icon}</div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>{stat.label}</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px' }}>
          {/* Main Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {/* Today's Schedule */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#1e293b' }}>Today&apos;s Schedule</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <ScheduleItem time="09:00 - 10:00" subject="Mathematics" class="Grade 10-A" room="Room 102" status="Completed" />
                <ScheduleItem time="10:00 - 11:00" subject="Physics" class="Grade 10-B" room="Lab 2" status="Ongoing" />
                <ScheduleItem time="11:30 - 12:30" subject="Additional Math" class="Grade 9-A" room="Room 204" status="Upcoming" />
              </div>
            </div>

            {/* Recent Submissions */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#1e293b' }}>Recent Assignment Submissions</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <th style={{ padding: '12px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>STUDENT</th>
                      <th style={{ padding: '12px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>ASSIGNMENT</th>
                      <th style={{ padding: '12px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>STATUS</th>
                      <th style={{ padding: '12px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    <SubmissionRow name="John Doe" title="Algebra Proofs" status="Pending Review" />
                    <SubmissionRow name="Jane Smith" title="Algebra Proofs" status="Graded" />
                    <SubmissionRow name="Alex Turner" title="Physics Lab Report" status="Late" />
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {/* Quick Actions */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#1e293b' }}>Quick Actions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                <ActionButton label="Create Assignment" icon="➕" color="#2563eb" />
                <ActionButton label="Mark Attendance" icon="📝" color="#059669" />
                <ActionButton label="Upload Study Material" icon="📂" color="#7c3aed" />
                <ActionButton label="Class Announcement" icon="📢" color="#ea580c" />
              </div>
            </div>

            {/* Class Announcements */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#1e293b' }}>My Announcements</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ borderLeft: '3px solid #2563eb', paddingLeft: '12px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Math Test Next Monday</p>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>Posted 2 hours ago for Grade 10-A</p>
                </div>
                <div style={{ borderLeft: '3px solid #cbd5e1', paddingLeft: '12px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Bring Graph paper tomorrow</p>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>Posted yesterday for Grade 9-B</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ScheduleItem({ time, subject, class: className, room, status }: { time: string, subject: string, class: string, room: string, status: string }) {
  const getStatusColor = () => {
    switch(status) {
      case 'Completed': return '#059669';
      case 'Ongoing': return '#2563eb';
      default: return '#64748b';
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '15px', 
      background: status === 'Ongoing' ? '#f0f7ff' : '#f8fafc',
      borderRadius: '10px',
      border: status === 'Ongoing' ? '1px solid #bfdbfe' : '1px solid transparent'
    }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', width: '90px' }}>{time}</div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{subject}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>{className} • {room}</div>
        </div>
      </div>
      <div style={{ 
        fontSize: '11px', 
        fontWeight: '700', 
        color: 'white', 
        background: getStatusColor(), 
        padding: '4px 10px', 
        borderRadius: '20px',
        textTransform: 'uppercase'
      }}>
        {status}
      </div>
    </div>
  );
}

function SubmissionRow({ name, title, status }: { name: string, title: string, status: string }) {
  return (
    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{name}</td>
      <td style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>{title}</td>
      <td style={{ padding: '12px' }}>
        <span style={{ 
          fontSize: '12px', 
          fontWeight: '600', 
          color: status === 'Graded' ? '#059669' : (status === 'Late' ? '#dc2626' : '#ea580c'),
          background: status === 'Graded' ? '#ecfdf5' : (status === 'Late' ? '#fef2f2' : '#fff7ed'),
          padding: '4px 8px',
          borderRadius: '6px'
        }}>{status}</span>
      </td>
      <td style={{ padding: '12px' }}>
        <button style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>View File</button>
      </td>
    </tr>
  );
}

function ActionButton({ label, icon, color }: { label: string, icon: string, color: string }) {
  return (
    <button style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px', 
      padding: '12px 15px', 
      background: '#f8fafc', 
      border: '1px solid #e2e8f0', 
      borderRadius: '10px',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all 0.2s'
    }}
    onMouseOver={(e) => (e.currentTarget.style.background = '#f1f5f9')}
    onMouseOut={(e) => (e.currentTarget.style.background = '#f8fafc')}
    >
      <span style={{ 
        fontSize: '18px', 
        background: 'white', 
        width: '32px', 
        height: '32px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        color: color
      }}>{icon}</span>
      <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{label}</span>
    </button>
  );
}
