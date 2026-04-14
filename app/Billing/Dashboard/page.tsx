'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SchoolAdminNavbar from '../../SchoolAdmin/Components/SchoolAdminNavbar'
import BillingNavbar from '../components/BillingNavbar'
import '../billingMain.css'

export default function BillingDashboard() {
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        setUserRole(user.role)
      }
    } catch (error) {
      console.error('Error reading user role:', error)
    }
  }, [])

  const isSchoolAdmin = userRole === 'schooladmin'
  const basePath = isSchoolAdmin ? '/SchoolAdmin/Billing' : '/Billing'

  return (
    <>
      {/* Main Navigation */}
      <SchoolAdminNavbar />

      <div className="billing-layout">
        {/* Sidebar Navigation */}
        <BillingNavbar />
        <main className="billing-main-content">
        {/* Header */}
        {/* <div className="billing-header">
          <div>
            <h1 className="billing-title">Billing Dashboard</h1>
            <p className="billing-subtitle">Welcome back. Here&apos;s what&apos;s happening in your billing today.</p>
          </div>
          <div className="billing-header-actions">
            <div className="billing-role-badge">
              <div className="billing-role-icon">B</div>
              <span className="billing-role-text">{isSchoolAdmin ? 'School Admin' : 'Billing'}</span>
            </div>
          </div>
        </div> */}

        {/* Quick Stats */}
        <div className="billing-stats-grid">
          <div className="billing-stat-card billing-stat-primary">
            <div className="billing-stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="billing-stat-content">
              <h3>Total Students</h3>
              <div className="billing-stat-value">1,234</div>
              <div className="billing-stat-subtext">Active enrollments</div>
            </div>
          </div>

          <div className="billing-stat-card billing-stat-success">
            <div className="billing-stat-icon">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div className="billing-stat-content">
              <h3>Total Collection</h3>
              <div className="billing-stat-value">Rs 2,45,678</div>
              <div className="billing-stat-subtext">This month</div>
            </div>
          </div>

          <div className="billing-stat-card billing-stat-warning">
            <div className="billing-stat-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="billing-stat-content">
              <h3>Outstanding Dues</h3>
              <div className="billing-stat-value">Rs 45,234</div>
              <div className="billing-stat-subtext">Pending payments</div>
            </div>
          </div>

          <div className="billing-stat-card billing-stat-info">
            <div className="billing-stat-icon">
              <i className="fas fa-file-invoice"></i>
            </div>
            <div className="billing-stat-content">
              <h3>Pending Invoices</h3>
              <div className="billing-stat-value">234</div>
              <div className="billing-stat-subtext">Awaiting payment</div>
            </div>
          </div>
        </div>

        {/* Revenue Analytics */}
        <div className="billing-section">
          <div className="billing-section-header">
            <h2 className="billing-section-title">Revenue Analytics</h2>
            <button className="billing-view-all-btn">View Details</button>
          </div>
          <div style={{
            background: 'var(--billing-surface-alt)',
            border: '2px dashed var(--billing-border)',
            borderRadius: 'var(--billing-radius)',
            padding: '40px',
            textAlign: 'center',
            color: 'var(--billing-text-muted)'
          }}>
            <i className="fas fa-chart-line" style={{ fontSize: '48px', marginBottom: '16px', color: 'var(--billing-primary)' }}></i>
            <p style={{ fontSize: '16px', margin: 0 }}>Revenue charts and analytics will be displayed here</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="billing-section">
          <div className="billing-section-header">
            <h2 className="billing-section-title">Quick Actions</h2>
          </div>
          <div className="billing-actions-grid">
            <Link href={`${basePath}/BillGenerate`} className="billing-action-card">
              <div className="billing-action-icon billing-action-primary">
                <i className="fas fa-plus"></i>
              </div>
              <div className="billing-action-content">
                <h3>Generate Bill</h3>
                <p>Create new invoices</p>
              </div>
            </Link>

            <Link href={`${basePath}/ReceiptCollection`} className="billing-action-card">
              <div className="billing-action-icon billing-action-success">
                <i className="fas fa-hand-holding-usd"></i>
              </div>
              <div className="billing-action-content">
                <h3>Collect Payment</h3>
                <p>Record payments</p>
              </div>
            </Link>

            <Link href={`${basePath}/AdvanceBillPrint`} className="billing-action-card">
              <div className="billing-action-icon billing-action-info">
                <i className="fas fa-print"></i>
              </div>
              <div className="billing-action-content">
                <h3>Print Bills</h3>
                <p>Generate PDFs</p>
              </div>
            </Link>

            <Link href={`${basePath}/CollectionReport`} className="billing-action-card">
              <div className="billing-action-icon billing-action-warning">
                <i className="fas fa-chart-bar"></i>
              </div>
              <div className="billing-action-content">
                <h3>View Reports</h3>
                <p>Analytics & insights</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="billing-section">
          <div className="billing-section-header">
            <h2 className="billing-section-title">Recent Activity</h2>
            <button className="billing-view-all-btn">View All</button>
          </div>
          <div className="billing-activity-list">
            <div className="billing-activity-item">
              <div className="billing-activity-icon billing-activity-success">
                <i className="fas fa-check"></i>
              </div>
              <div className="billing-activity-content">
                <h4>Payment Received</h4>
                <p>Student ID: STU001 - Monthly fee payment</p>
                <span className="billing-activity-time">2 hours ago</span>
              </div>
            </div>

            <div className="billing-activity-item">
              <div className="billing-activity-icon billing-activity-warning">
                <i className="fas fa-exclamation"></i>
              </div>
              <div className="billing-activity-content">
                <h4>Overdue Invoice</h4>
                <p>Student ID: STU045 - Payment 15 days overdue</p>
                <span className="billing-activity-time">5 hours ago</span>
              </div>
            </div>

            <div className="billing-activity-item">
              <div className="billing-activity-icon billing-activity-info">
                <i className="fas fa-file"></i>
              </div>
              <div className="billing-activity-content">
                <h4>Bill Generated</h4>
                <p>Class 10A - Monthly bills generated</p>
                <span className="billing-activity-time">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
        </main>
      </div>
    </>
  )
}