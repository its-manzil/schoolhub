"use client";

import { useState } from "react";
import SchoolAdminNavbar from "../Components/SchoolAdminNavbar";
import "./Dashboard.css";

export default function Dashboard() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState([
    { id: 1, type: "Voucher", description: "Monthly stationery purchase for Grade 10 - Amount exceeds budget by 15%", amount: "Rs. 45,000", date: "2024-04-15", status: "pending" },
    { id: 2, type: "Bill", description: "Electricity bill for March - Unusual spike in consumption detected", amount: "Rs. 28,500", date: "2024-04-14", status: "pending" },
    { id: 3, type: "Voucher", description: "Sports equipment purchase - Missing proper documentation", amount: "Rs. 12,000", date: "2024-04-13", status: "pending" },
  ]);

  const handleApproval = (id: number, action: 'approve' | 'reject') => {
    setPendingApprovals(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status: action } : item
      ).filter(item => item.status === 'pending')
    );
  };

  return (
    <>
      <SchoolAdminNavbar />
      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="sidebar-actions">
            <button className="sidebar-action-btn">
              Add Student
            </button>
            <button className="sidebar-action-btn">
              Create Exam
            </button>
            <button className="sidebar-action-btn">
              Print Results
            </button>
            <button className="sidebar-action-btn">
              Print Admit Card
            </button>
            <button className="sidebar-action-btn">
              Add Staff
            </button>
            <button className="sidebar-action-btn">
              Generate Reports
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {/* Header with Notifications */}
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">School Dashboard</h1>
              <p className="dashboard-subtitle">Welcome back. Here's what's happening in your school today.</p>
            </div>
            <div className="notification-section">
              <button 
                className="notification-bell"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <span className="bell-icon">🔔</span>
                {pendingApprovals.length > 0 && (
                  <span className="notification-badge">{pendingApprovals.length}</span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="notifications-header">
                    <h4>Pending Approvals</h4>
                    <span className="pending-count">{pendingApprovals.length} pending</span>
                  </div>
                  <div className="notifications-list">
                    {pendingApprovals.map(item => (
                      <div key={item.id} className="notification-item">
                        <div className="notification-content">
                          <div className="notification-type">{item.type}</div>
                          <div className="notification-description">{item.description}</div>
                          <div className="notification-meta">
                            <span className="notification-amount">{item.amount}</span>
                            <span className="notification-date">{item.date}</span>
                          </div>
                        </div>
                        <div className="notification-actions">
                          <button 
                            className="approve-btn"
                            onClick={() => handleApproval(item.id, 'approve')}
                          >
                            Approve
                          </button>
                          <button 
                            className="reject-btn"
                            onClick={() => handleApproval(item.id, 'reject')}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                    {pendingApprovals.length === 0 && (
                      <div className="no-notifications">No pending approvals</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon students">👥</div>
              <div className="card-content">
                <h3>Total Students</h3>
                <p className="card-value">1,248</p>
                <span className="card-change positive">+12% this year</span>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon staff">👨‍🏫</div>
              <div className="card-content">
                <h3>Total Staff</h3>
                <p className="card-value">86</p>
                <span className="card-change positive">+3 this month</span>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon revenue">💰</div>
              <div className="card-content">
                <h3>Monthly Revenue</h3>
                <p className="card-value">Rs. 2.4M</p>
                <span className="card-change positive">+8% vs last month</span>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon pending">⚠️</div>
              <div className="card-content">
                <h3>Pending Fees</h3>
                <p className="card-value">Rs. 180K</p>
                <span className="card-change negative">+15% vs last month</span>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon expenses">💳</div>
              <div className="card-content">
                <h3>Monthly Expenses</h3>
                <p className="card-value">Rs. 1.8M</p>
                <span className="card-change negative">+5% vs last month</span>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon profit">📈</div>
              <div className="card-content">
                <h3>Net Profit</h3>
                <p className="card-value">Rs. 600K</p>
                <span className="card-change positive">+22% vs last month</span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-container">
              <h3>Student Enrollment Trends</h3>
              <div className="chart-placeholder">
                <div className="professional-line-chart">
                  <div className="chart-grid">
                    <div className="grid-line" style={{bottom: '20%'}}></div>
                    <div className="grid-line" style={{bottom: '40%'}}></div>
                    <div className="grid-line" style={{bottom: '60%'}}></div>
                    <div className="grid-line" style={{bottom: '80%'}}></div>
                  </div>
                  <div className="chart-line">
                    <div className="chart-point" style={{bottom: '35%'}}>
                      <div className="point-tooltip">FY 2019-20: 980</div>
                    </div>
                    <div className="chart-point" style={{bottom: '45%'}}>
                      <div className="point-tooltip">FY 2020-21: 1,120</div>
                    </div>
                    <div className="chart-point" style={{bottom: '55%'}}>
                      <div className="point-tooltip">FY 2021-22: 1,180</div>
                    </div>
                    <div className="chart-point" style={{bottom: '70%'}}>
                      <div className="point-tooltip">FY 2022-23: 1,220</div>
                    </div>
                    <div className="chart-point" style={{bottom: '85%'}}>
                      <div className="point-tooltip">FY 2023-24: 1,248</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="chart-container">
              <h3>School Profit Trends by Fiscal Year</h3>
              <div className="chart-placeholder">
                <div className="professional-line-chart">
                  <div className="chart-grid">
                    <div className="grid-line" style={{bottom: '20%'}}></div>
                    <div className="grid-line" style={{bottom: '40%'}}></div>
                    <div className="grid-line" style={{bottom: '60%'}}></div>
                    <div className="grid-line" style={{bottom: '80%'}}></div>
                  </div>
                  <div className="chart-line">
                    <svg className="chart-connection-line" style={{position: 'absolute', left: '40px', right: '20px', top: '50%', transform: 'translateY(-50%)', height: '100%', width: '100%', pointerEvents: 'none'}}>
                      <polyline
                        points="0,60 25,50 50,40 75,25 100,10"
                        fill="none"
                        stroke="url(#lineGradient2)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <defs>
                        <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#16A34A" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="chart-point" style={{bottom: '30%'}}>
                      <div className="point-tooltip">FY 2019-20: Rs. 280K</div>
                    </div>
                    <div className="chart-point" style={{bottom: '45%'}}>
                      <div className="point-tooltip">FY 2020-21: Rs. 380K</div>
                    </div>
                    <div className="chart-point" style={{bottom: '60%'}}>
                      <div className="point-tooltip">FY 2021-22: Rs. 520K</div>
                    </div>
                    <div className="chart-point" style={{bottom: '75%'}}>
                      <div className="point-tooltip">FY 2022-23: Rs. 580K</div>
                    </div>
                    <div className="chart-point" style={{bottom: '90%'}}>
                      <div className="point-tooltip">FY 2023-24: Rs. 720K</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}