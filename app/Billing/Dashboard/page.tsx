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
      <SchoolAdminNavbar />
      <div className="billing-layout">
        <BillingNavbar />
        <main className="billing-main-content">

          {/* Page Header */}
          <div className="billing-page-header">
            <div className="billing-page-header-left">
              <h1 className="billing-page-title">
                Billing <span className="billing-page-title-accent">Overview</span>
              </h1>
              <p className="billing-page-subtitle">
                Welcome back. Here&apos;s what&apos;s happening in your billing today.
              </p>
            </div>
            <div className="billing-page-header-right">
              <div className="billing-user-badge">
                <i className="fas fa-user-circle"></i>
                <span>{isSchoolAdmin ? 'School Admin' : 'Billing Staff'}</span>
              </div>
            </div>
          </div>

          {/* KPI Stat Cards */}
          <div className="billing-kpi-grid">
            <div className="billing-kpi-card">
              <div className="billing-kpi-icon billing-kpi-indigo">
                <i className="fas fa-users"></i>
              </div>
              <div className="billing-kpi-badge billing-kpi-badge-up">+0.0%</div>
              <div className="billing-kpi-label">TOTAL STUDENTS</div>
              <div className="billing-kpi-value">1,234</div>
              <div className="billing-kpi-sub">Active enrollments</div>
            </div>

            <div className="billing-kpi-card">
              <div className="billing-kpi-icon billing-kpi-emerald">
                <i className="fas fa-rupee-sign"></i>
              </div>
              <div className="billing-kpi-badge billing-kpi-badge-up">+12.4%</div>
              <div className="billing-kpi-label">TOTAL COLLECTION</div>
              <div className="billing-kpi-value">Rs 2,45,678</div>
              <div className="billing-kpi-sub">This month</div>
            </div>

            <div className="billing-kpi-card">
              <div className="billing-kpi-icon billing-kpi-amber">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="billing-kpi-badge billing-kpi-badge-warn">Review</div>
              <div className="billing-kpi-label">OUTSTANDING DUES</div>
              <div className="billing-kpi-value">Rs 45,234</div>
              <div className="billing-kpi-sub">Pending payments</div>
            </div>

            <div className="billing-kpi-card">
              <div className="billing-kpi-icon billing-kpi-blue">
                <i className="fas fa-file-invoice"></i>
              </div>
              <div className="billing-kpi-badge billing-kpi-badge-active">Active</div>
              <div className="billing-kpi-label">PENDING INVOICES</div>
              <div className="billing-kpi-value">234</div>
              <div className="billing-kpi-sub">Awaiting payment</div>
            </div>

            <div className="billing-kpi-card">
              <div className="billing-kpi-icon billing-kpi-rose">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="billing-kpi-badge billing-kpi-badge-warn">Review</div>
              <div className="billing-kpi-label">UNPAID FEES</div>
              <div className="billing-kpi-value">0</div>
              <div className="billing-kpi-sub">Unpaid invoices</div>
            </div>
          </div>

          {/* Two Column Section */}
          <div className="billing-two-col">

            {/* Quick Actions */}
            <div className="billing-section">
              <div className="billing-section-header">
                <h2 className="billing-section-title">Quick Actions</h2>
              </div>
              <div className="billing-quick-actions">
                <Link href={`${basePath}/BillGenerate`} className="billing-quick-action-item">
                  <div className="billing-qa-icon billing-qa-emerald">
                    <i className="fas fa-plus"></i>
                  </div>
                  <div className="billing-qa-text">
                    <span className="billing-qa-label">Generate Bill</span>
                    <span className="billing-qa-sub">Create new invoices</span>
                  </div>
                  <i className="fas fa-chevron-right billing-qa-arrow"></i>
                </Link>

                <Link href={`${basePath}/ReceiptCollection`} className="billing-quick-action-item">
                  <div className="billing-qa-icon billing-qa-blue">
                    <i className="fas fa-hand-holding-usd"></i>
                  </div>
                  <div className="billing-qa-text">
                    <span className="billing-qa-label">Collect Payment</span>
                    <span className="billing-qa-sub">Record payments</span>
                  </div>
                  <i className="fas fa-chevron-right billing-qa-arrow"></i>
                </Link>

                <Link href={`${basePath}/AdvanceBillPrint`} className="billing-quick-action-item">
                  <div className="billing-qa-icon billing-qa-indigo">
                    <i className="fas fa-print"></i>
                  </div>
                  <div className="billing-qa-text">
                    <span className="billing-qa-label">Print Bills</span>
                    <span className="billing-qa-sub">Generate PDFs</span>
                  </div>
                  <i className="fas fa-chevron-right billing-qa-arrow"></i>
                </Link>

                <Link href={`${basePath}/CollectionReport`} className="billing-quick-action-item">
                  <div className="billing-qa-icon billing-qa-amber">
                    <i className="fas fa-chart-bar"></i>
                  </div>
                  <div className="billing-qa-text">
                    <span className="billing-qa-label">View Reports</span>
                    <span className="billing-qa-sub">Analytics & insights</span>
                  </div>
                  <i className="fas fa-chevron-right billing-qa-arrow"></i>
                </Link>

                <Link href={`${basePath}/Settings`} className="billing-quick-action-item">
                  <div className="billing-qa-icon billing-qa-gray">
                    <i className="fas fa-cog"></i>
                  </div>
                  <div className="billing-qa-text">
                    <span className="billing-qa-label">Billing Settings</span>
                    <span className="billing-qa-sub">Configure fee heads</span>
                  </div>
                  <i className="fas fa-chevron-right billing-qa-arrow"></i>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="billing-section">
              <div className="billing-section-header">
                <h2 className="billing-section-title">Recent Activity</h2>
                <button className="billing-view-all-btn">View All</button>
              </div>
              <div className="billing-activity-feed">
                <div className="billing-feed-item">
                  <div className="billing-feed-icon billing-feed-success">
                    <i className="fas fa-check"></i>
                  </div>
                  <div className="billing-feed-body">
                    <p className="billing-feed-title">Payment Received</p>
                    <p className="billing-feed-desc">STU001 — Monthly fee payment</p>
                    <span className="billing-feed-time">2 hours ago</span>
                  </div>
                </div>

                <div className="billing-feed-item">
                  <div className="billing-feed-icon billing-feed-warning">
                    <i className="fas fa-exclamation"></i>
                  </div>
                  <div className="billing-feed-body">
                    <p className="billing-feed-title">Overdue Invoice</p>
                    <p className="billing-feed-desc">STU045 — Payment 15 days overdue</p>
                    <span className="billing-feed-time">5 hours ago</span>
                  </div>
                </div>

                <div className="billing-feed-item">
                  <div className="billing-feed-icon billing-feed-info">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <div className="billing-feed-body">
                    <p className="billing-feed-title">Bill Generated</p>
                    <p className="billing-feed-desc">Class 10A — Monthly bills generated</p>
                    <span className="billing-feed-time">1 day ago</span>
                  </div>
                </div>

                <div className="billing-feed-item">
                  <div className="billing-feed-icon billing-feed-success">
                    <i className="fas fa-check"></i>
                  </div>
                  <div className="billing-feed-body">
                    <p className="billing-feed-title">Payment Received</p>
                    <p className="billing-feed-desc">STU089 — Transport fee cleared</p>
                    <span className="billing-feed-time">2 days ago</span>
                  </div>
                </div>

                <div className="billing-feed-item">
                  <div className="billing-feed-icon billing-feed-warning">
                    <i className="fas fa-exclamation"></i>
                  </div>
                  <div className="billing-feed-body">
                    <p className="billing-feed-title">Due Reminder Sent</p>
                    <p className="billing-feed-desc">Class 9B — 12 students notified</p>
                    <span className="billing-feed-time">3 days ago</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Revenue Analytics Placeholder */}
          <div className="billing-section">
            <div className="billing-section-header">
              <h2 className="billing-section-title">Revenue Analytics</h2>
              <button className="billing-view-all-btn">View Details</button>
            </div>
            <div className="billing-analytics-empty">
              <i className="fas fa-chart-line billing-analytics-icon"></i>
              <p>Revenue charts and analytics will be displayed here</p>
            </div>
          </div>

        </main>
      </div>
    </>
  )
}