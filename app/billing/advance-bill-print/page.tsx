'use client'

import { useState, useEffect } from 'react'

import BillingNavbar from '../components/BillingNavbar'
import '../billingMain.css'

interface PrintSettings {
  template: 'classic' | 'modern'
  copy: 'OFFICE COPY' | 'STUDENT COPY' | 'DUPLICATE'
  session: string
  schoolName: string
}

interface Bill {
  id: string
  studentName: string
  studentClass: string
  rollNumber: string
  totalAmount: number
  status: 'paid' | 'pending' | 'overdue'
  issueDate: string
  dueDate: string
}

export default function AdvanceBillPrint() {
  const [settings, setSettings] = useState<PrintSettings>({
    template: 'classic',
    copy: 'OFFICE COPY',
    session: '2082-2083',
    schoolName: 'Nepsof Academy'
  })

  const [selectedBills, setSelectedBills] = useState<string[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  useEffect(() => {
    // Mock data for demonstration
    const mockBills: Bill[] = [
      {
        id: '1',
        studentName: 'Ram Bahadur',
        studentClass: '10',
        rollNumber: '001',
        totalAmount: 15000,
        status: 'pending',
        issueDate: '2024-04-01',
        dueDate: '2024-04-15'
      },
      {
        id: '2',
        studentName: 'Sita Kumari',
        studentClass: '10',
        rollNumber: '002',
        totalAmount: 15000,
        status: 'paid',
        issueDate: '2024-04-01',
        dueDate: '2024-04-15'
      },
      {
        id: '3',
        studentName: 'Hari Sharma',
        studentClass: '9',
        rollNumber: '001',
        totalAmount: 12000,
        status: 'overdue',
        issueDate: '2024-03-01',
        dueDate: '2024-03-15'
      }
    ]

    setBills(mockBills)
  }, [])

  const handleBillSelection = (billId: string) => {
    setSelectedBills(prev =>
      prev.includes(billId)
        ? prev.filter(id => id !== billId)
        : [...prev, billId]
    )
  }

  const selectAllBills = () => {
    if (selectedBills.length === bills.length) {
      setSelectedBills([])
    } else {
      setSelectedBills(bills.map(b => b.id))
    }
  }

  const handlePrint = () => {
    if (selectedBills.length === 0) {
      alert('Please select at least one bill to print')
      return
    }

    setIsPrinting(true)

    // Mock print logic
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
      alert(`Printed ${selectedBills.length} bill(s) successfully!`)
    }, 2000)
  }

  const handlePreview = () => {
    if (selectedBills.length === 0) {
      alert('Please select at least one bill to preview')
      return
    }
    setShowPreview(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'var(--primary-green)'
      case 'pending': return 'var(--accent-yellow)'
      case 'overdue': return 'var(--accent-red)'
      default: return 'var(--secondary-text)'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'paid': return 'var(--light-green)'
      case 'pending': return 'var(--accent-yellow)'
      case 'overdue': return '#FEF2F2'
      default: return 'var(--section-backgrounds)'
    }
  }

  return (
    <>
      <div className="billing-layout">
        <header className="billing-header">
        <BillingNavbar />
          <div className="billing-header-content">
            <div className="billing-logo">
              <h1 className="billing-title">Print Bills</h1>
              <p className="billing-subtitle">Generate and print student bills</p>
            </div>
          </div>
        </header>
{/* 
        <nav className="billing-nav">
          <div className="billing-nav-container">
            <a href="/SchoolAdmin/Billing/Dashboard" className="billing-nav-item">Dashboard</a>
            <a href="/SchoolAdmin/Billing/BillGenerate" className="billing-nav-item">Generate Bill</a>
            <a href="/SchoolAdmin/Billing/ReceiptCollection" className="billing-nav-item">Collection</a>
            <a href="/SchoolAdmin/Billing/AdvanceBillPrint" className="billing-nav-item active">Print Bills</a>
            <a href="/SchoolAdmin/Billing/CollectionReport" className="billing-nav-item">Reports</a>
            <a href="/SchoolAdmin/Billing/Settings" className="billing-nav-item">Settings</a>
          </div>
        </nav> */}

        <main className="billing-main">
          <div className="billing-content-grid">
            {/* Print Settings */}
            <div className="billing-card">
              <h2 className="billing-section-title">Print Settings</h2>

              <div className="billing-form">
                <div className="billing-form-row">
                  <label>
                    Template
                    <select
                      value={settings.template}
                      onChange={(e) => setSettings(prev => ({ ...prev, template: e.target.value as 'classic' | 'modern' }))}
                      className="billing-select"
                    >
                      <option value="classic">Classic Template</option>
                      <option value="modern">Modern Template</option>
                    </select>
                  </label>
                  <label>
                    Copy Type
                    <select
                      value={settings.copy}
                      onChange={(e) => setSettings(prev => ({ ...prev, copy: e.target.value as 'OFFICE COPY' | 'STUDENT COPY' | 'DUPLICATE' }))}
                      className="billing-select"
                    >
                      <option value="OFFICE COPY">Office Copy</option>
                      <option value="STUDENT COPY">Student Copy</option>
                      <option value="DUPLICATE">Duplicate</option>
                    </select>
                  </label>
                </div>

                <div className="billing-form-row">
                  <label>
                    Session
                    <input
                      type="text"
                      value={settings.session}
                      onChange={(e) => setSettings(prev => ({ ...prev, session: e.target.value }))}
                      className="billing-input"
                      placeholder="e.g., 2082-2083"
                    />
                  </label>
                  <label>
                    School Name
                    <input
                      type="text"
                      value={settings.schoolName}
                      onChange={(e) => setSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                      className="billing-input"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Bill Selection */}
            <div className="billing-card">
              <h2 className="billing-section-title">Select Bills to Print</h2>

              <div className="billing-select-all">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedBills.length === bills.length}
                    onChange={selectAllBills}
                  />
                  Select All ({selectedBills.length}/{bills.length})
                </label>
              </div>

              <div className="billing-bill-list">
                {bills.map(bill => (
                  <div key={bill.id} className="billing-bill-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedBills.includes(bill.id)}
                        onChange={() => handleBillSelection(bill.id)}
                      />
                      <div className="billing-bill-info">
                        <div className="billing-bill-header">
                          <strong>{bill.studentName}</strong>
                          <span className="billing-bill-roll">Roll: {bill.rollNumber}</span>
                        </div>
                        <div className="billing-bill-details">
                          <div>Class {bill.studentClass}</div>
                          <div>Issue: {bill.issueDate}</div>
                          <div>Due: {bill.dueDate}</div>
                        </div>
                      </div>
                      <div className="billing-bill-amount">
                        Rs {bill.totalAmount.toLocaleString()}
                      </div>
                      <div className="billing-bill-status">
                        <span
                          className="billing-bill-status-badge"
                          style={{
                            backgroundColor: getStatusBg(bill.status),
                            color: getStatusColor(bill.status)
                          }}
                        >
                          {bill.status.toUpperCase()}
                        </span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="billing-actions">
                <button
                  onClick={handlePreview}
                  className="billing-btn-secondary"
                  disabled={selectedBills.length === 0}
                >
                  Preview ({selectedBills.length})
                </button>
                <button
                  onClick={handlePrint}
                  className="billing-btn-primary"
                  disabled={isPrinting || selectedBills.length === 0}
                >
                  {isPrinting ? 'Printing...' : `Print (${selectedBills.length})`}
                </button>
              </div>
            </div>
          </div>

          {/* Preview Modal */}
          {showPreview && (
            <div className="billing-preview-modal">
              <div className="billing-preview-content billing-print-preview">
                <div className="billing-preview-header">
                  <h3>Print Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="billing-btn-close"
                  >
                    ×
                  </button>
                </div>

                <div className="billing-print-header-info">
                  <h2>{settings.schoolName}</h2>
                  <p>Session: {settings.session}</p>
                  <p>Copy Type: {settings.copy}</p>
                  <p>Date: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="billing-print-bills">
                  {bills.filter(bill => selectedBills.includes(bill.id)).map(bill => (
                    <div key={bill.id} className="billing-print-bill">
                      <div className="billing-print-bill-header">
                        <h4>{bill.studentName}</h4>
                        <p>Class {bill.studentClass} • Roll No: {bill.rollNumber}</p>
                      </div>
                      <div className="billing-print-bill-details">
                        <div className="billing-print-detail-row">
                          <span>Issue Date:</span>
                          <span>{bill.issueDate}</span>
                        </div>
                        <div className="billing-print-detail-row">
                          <span>Due Date:</span>
                          <span>{bill.dueDate}</span>
                        </div>
                        <div className="billing-print-detail-row">
                          <span>Total Amount:</span>
                          <span>Rs {bill.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="billing-print-detail-row">
                          <span>Status:</span>
                          <span className="billing-print-status">{bill.status.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="billing-preview-actions">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="billing-btn-secondary"
                  >
                    Back to Edit
                  </button>
                  <button
                    onClick={handlePrint}
                    className="billing-btn-primary"
                  >
                    Print Bills
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
