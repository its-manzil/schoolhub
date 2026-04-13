'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SchoolAdminNavbar from '../../SchoolAdmin/Components/SchoolAdminNavbar'
import BillingNavbar from '../components/BillingNavbar'
import '../billingMain.css'
import './CollectionReport.css'

interface CollectionData {
  sno: number
  studentName: string
  studentClass: string
  rollNumber: string
  totalAmount: number
  paidAmount: number
  dueAmount: number
  lastPaymentDate: string
  status: 'paid' | 'partial' | 'unpaid'
}

interface ReportFilters {
  class: string
  status: string
  dateRange: 'all' | 'this-month' | 'last-month' | 'this-year'
  searchTerm: string
}

export default function CollectionReport() {
  const router = useRouter()
  const [collections, setCollections] = useState<CollectionData[]>([])
  const [filters, setFilters] = useState<ReportFilters>({
    class: 'all',
    status: 'all',
    dateRange: 'all',
    searchTerm: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Mock data for demonstration
    const mockCollections: CollectionData[] = [
      {
        sno: 1,
        studentName: 'Ram Bahadur',
        studentClass: '10',
        rollNumber: '001',
        totalAmount: 15000,
        paidAmount: 8000,
        dueAmount: 7000,
        lastPaymentDate: '2024-04-10',
        status: 'partial'
      },
      {
        sno: 2,
        studentName: 'Sita Kumari',
        studentClass: '10',
        rollNumber: '002',
        totalAmount: 15000,
        paidAmount: 15000,
        dueAmount: 0,
        lastPaymentDate: '2024-04-01',
        status: 'paid'
      },
      {
        sno: 3,
        studentName: 'Hari Sharma',
        studentClass: '9',
        rollNumber: '001',
        totalAmount: 12000,
        paidAmount: 6000,
        dueAmount: 6000,
        lastPaymentDate: '2024-04-05',
        status: 'partial'
      },
      {
        sno: 4,
        studentName: 'Gita Devi',
        studentClass: '9',
        rollNumber: '002',
        totalAmount: 12000,
        paidAmount: 0,
        dueAmount: 12000,
        lastPaymentDate: '-',
        status: 'unpaid'
      },
      {
        sno: 5,
        studentName: 'Ramesh Thapa',
        studentClass: '8',
        rollNumber: '001',
        totalAmount: 10000,
        paidAmount: 10000,
        dueAmount: 0,
        lastPaymentDate: '2024-03-28',
        status: 'paid'
      }
    ]

    setCollections(mockCollections)
  }, [])

  const filteredCollections = useMemo(() => {
    return collections.filter(collection => {
      const matchesClass = filters.class === 'all' || collection.studentClass === filters.class
      const matchesStatus = filters.status === 'all' || collection.status === filters.status
      const matchesSearch = collection.studentName.toLowerCase().includes(filters.searchTerm.toLowerCase())
      return matchesClass && matchesStatus && matchesSearch
    })
  }, [collections, filters])

  const summaryData = useMemo(() => {
    const total = filteredCollections.reduce((sum, c) => sum + c.totalAmount, 0)
    const paid = filteredCollections.reduce((sum, c) => sum + c.paidAmount, 0)
    const due = filteredCollections.reduce((sum, c) => sum + c.dueAmount, 0)
    const paidCount = filteredCollections.filter(c => c.status === 'paid').length
    const partialCount = filteredCollections.filter(c => c.status === 'partial').length
    const unpaidCount = filteredCollections.filter(c => c.status === 'unpaid').length

    return {
      total,
      paid,
      due,
      paidCount,
      partialCount,
      unpaidCount,
      collectionRate: total > 0 ? ((paid / total) * 100).toFixed(1) : '0'
    }
  }, [filteredCollections])

  const handleExport = () => {
    // Mock export functionality
    const csvContent = [
      ['S.No', 'Student Name', 'Class', 'Roll No', 'Total Amount', 'Paid Amount', 'Due Amount', 'Status', 'Last Payment Date'],
      ...filteredCollections.map(c => [
        c.sno,
        c.studentName,
        c.studentClass,
        c.rollNumber,
        c.totalAmount,
        c.paidAmount,
        c.dueAmount,
        c.status,
        c.lastPaymentDate
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `collection-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'var(--primary-green)'
      case 'partial': return 'var(--accent-yellow)'
      case 'unpaid': return 'var(--accent-red)'
      default: return 'var(--secondary-text)'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'paid': return 'var(--light-green)'
      case 'partial': return 'var(--accent-yellow)'
      case 'unpaid': return '#FEF2F2'
      default: return 'var(--section-backgrounds)'
    }
  }

  return (
    <>
      {/* Main Navigation */}
      <SchoolAdminNavbar />
      
      <div className="billing-layout">
        {/* Sidebar Navigation */}
        <BillingNavbar />
        
        {/* Main Content */}
        <main className="billing-main-content">
          {/* Summary Cards */}
          <div className="billing-metrics-grid">
            <div className="billing-metric-card">
              <div className="billing-metric-icon">
                <i className="fas fa-hand-holding-usd"></i>
              </div>
              <div className="billing-metric-info">
                <h3>Total Collection</h3>
                <div className="billing-metric-value">Rs {summaryData.paid.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="billing-metric-card">
              <div className="billing-metric-icon billing-metric-danger">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="billing-metric-info">
                <h3>Total Dues</h3>
                <div className="billing-metric-value">Rs {summaryData.due.toLocaleString()}</div>
              </div>
            </div>

            <div className="billing-metric-card">
              <div className="billing-metric-icon billing-metric-success">
                <i className="fas fa-percentage"></i>
              </div>
              <div className="billing-metric-info">
                <h3>Collection Rate</h3>
                <div className="billing-metric-value">{summaryData.collectionRate}%</div>
              </div>
            </div>

            <div className="billing-metric-card">
              <div className="billing-metric-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="billing-metric-info">
                <h3>Total Students</h3>
                <div className="billing-metric-value">{filteredCollections.length}</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="billing-card">
            <h2 className="billing-section-title">Collection Details</h2>
            
            <div className="billing-filters">
              <input
                type="text"
                placeholder="Search students..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="billing-input"
              />
              <select
                value={filters.class}
                onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
                className="billing-select"
              >
                <option value="all">All Classes</option>
                <option value="10">Class 10</option>
                <option value="9">Class 9</option>
                <option value="8">Class 8</option>
              </select>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="billing-select"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="unpaid">Unpaid</option>
              </select>
              <button
                onClick={handleExport}
                className="billing-btn-secondary"
              >
                <i className="fas fa-download"></i> Export CSV
              </button>
            </div>

            {/* Collection Table */}
            <div className="billing-table-container">
              <table className="billing-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Roll No</th>
                    <th>Total Amount</th>
                    <th>Paid Amount</th>
                    <th>Due Amount</th>
                    <th>Status</th>
                    <th>Last Payment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCollections.map((collection, index) => (
                    <tr key={collection.sno}>
                      <td>{collection.sno}</td>
                      <td>{collection.studentName}</td>
                      <td>{collection.studentClass}</td>
                      <td>{collection.rollNumber}</td>
                      <td>Rs {collection.totalAmount.toLocaleString()}</td>
                      <td>Rs {collection.paidAmount.toLocaleString()}</td>
                      <td>Rs {collection.dueAmount.toLocaleString()}</td>
                      <td>
                        <span
                          className="billing-status-badge"
                          style={{
                            backgroundColor: getStatusBg(collection.status),
                            color: getStatusColor(collection.status)
                          }}
                        >
                          {collection.status.toUpperCase()}
                        </span>
                      </td>
                      <td>{collection.lastPaymentDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
