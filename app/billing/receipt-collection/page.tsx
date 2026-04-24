'use client'

import { useState, useEffect } from 'react'

import BillingNavbar from '../components/BillingNavbar'
import '../billingMain.css'
import './ReceiptCollection.css'

interface Receipt {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  rollNumber: string
  amount: number
  receiptNumber: string
  date: string
  paymentMethod: string
  status: 'paid' | 'pending' | 'failed'
}

interface Student {
  id: string
  name: string
  class: string
  rollNo: string
  total: number
  paid: number
  due: number
}

export default function ReceiptCollection() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('cash')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const [filters, setFilters] = useState({
    searchTerm: '',
    class: 'all',
    status: 'all'
  })

  useEffect(() => {
    // Mock data for demonstration
    const mockStudents: Student[] = [
      { id: '1', name: 'Ram Bahadur', class: '10', rollNo: '001', total: 15000, paid: 8000, due: 7000 },
      { id: '2', name: 'Sita Kumari', class: '10', rollNo: '002', total: 15000, paid: 15000, due: 0 },
      { id: '3', name: 'Hari Sharma', class: '9', rollNo: '001', total: 12000, paid: 6000, due: 6000 }
    ]

    const mockReceipts: Receipt[] = [
      {
        id: '1',
        studentId: '2',
        studentName: 'Sita Kumari',
        studentClass: '10',
        rollNumber: '002',
        amount: 5000,
        receiptNumber: 'RCP-2024-001',
        date: '2024-04-10',
        paymentMethod: 'cash',
        status: 'paid'
      },
      {
        id: '2',
        studentId: '1',
        studentName: 'Ram Bahadur',
        studentClass: '10',
        rollNumber: '001',
        amount: 3000,
        receiptNumber: 'RCP-2024-002',
        date: '2024-04-09',
        paymentMethod: 'bank',
        status: 'paid'
      }
    ]

    setStudents(mockStudents)
    setReceipts(mockReceipts)
  }, [])

  const collectPayment = () => {
    if (!selectedStudent || !amount) {
      alert('Please select student and enter amount')
      return
    }

    setIsLoading(true)
    
    // Mock collection logic
    const newReceipt: Receipt = {
      id: Math.random().toString(),
      studentId: selectedStudent,
      studentName: students.find(s => s.id === selectedStudent)?.name || '',
      studentClass: students.find(s => s.id === selectedStudent)?.class || '',
      rollNumber: students.find(s => s.id === selectedStudent)?.rollNo || '',
      amount: Number(amount),
      receiptNumber: `RCP-${new Date().getFullYear()}-${String(receipts.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      status: 'paid'
    }

    setTimeout(() => {
      setReceipts(prev => [newReceipt, ...prev])
      setSelectedStudent('')
      setAmount('')
      setPaymentMethod('cash')
      setIsLoading(false)
      setShowSuccess(true)
      
      setTimeout(() => setShowSuccess(false), 3000)
    }, 1000)
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
    const matchesClass = filters.class === 'all' || student.class === filters.class
    return matchesSearch && matchesClass
  })

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.studentName.toLowerCase().includes(filters.searchTerm.toLowerCase())
    const matchesClass = filters.class === 'all' || receipt.studentClass === filters.class
    return matchesSearch && matchesClass
  })

  return (
    <>
      {/* Main Navigation */}
    
      
      <div className="billing-layout">
        {/* Sidebar Navigation */}
        <BillingNavbar />
        
        {/* Main Content */}
        <main className="billing-main-content">
        <div className="billing-content-grid">
          {/* Payment Collection Form */}
          <div className="billing-card">
            <h2 className="billing-section-title">Collect Payment</h2>
            
            <div className="billing-form">
              <div className="billing-form-row">
                <label>
                  Select Student
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="billing-select"
                  >
                    <option value="">Select a student</option>
                    {filteredStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} - Class {student.class} (Roll: {student.rollNo})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="billing-form-row">
                <label>
                  Amount (Rs)
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="billing-input"
                  />
                </label>
                <label>
                  Payment Method
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="billing-select"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="online">Online Payment</option>
                  </select>
                </label>
              </div>

              <div className="billing-actions">
                <button
                  onClick={collectPayment}
                  className="billing-btn-primary"
                  disabled={isLoading || !selectedStudent || !amount}
                >
                  {isLoading ? 'Processing...' : 'Collect Payment'}
                </button>
              </div>
            </div>

            {selectedStudent && (
              <div className="billing-student-summary">
                <h4>Student Details</h4>
                {(() => {
                  const student = students.find(s => s.id === selectedStudent)
                  return student ? (
                    <div className="billing-summary-info">
                      <div className="billing-summary-item">
                        <span className="billing-summary-label">Name:</span>
                        <span className="billing-summary-value">{student.name}</span>
                      </div>
                      <div className="billing-summary-item">
                        <span className="billing-summary-label">Class:</span>
                        <span className="billing-summary-value">{student.class}</span>
                      </div>
                      <div className="billing-summary-item">
                        <span className="billing-summary-label">Roll No:</span>
                        <span className="billing-summary-value">{student.rollNo}</span>
                      </div>
                      <div className="billing-summary-item">
                        <span className="billing-summary-label">Total Fee:</span>
                        <span className="billing-summary-value">Rs {student.total.toLocaleString()}</span>
                      </div>
                      <div className="billing-summary-item">
                        <span className="billing-summary-label">Paid:</span>
                        <span className="billing-summary-value">Rs {student.paid.toLocaleString()}</span>
                      </div>
                      <div className="billing-summary-item">
                        <span className="billing-summary-label">Due:</span>
                        <span className="billing-summary-value billing-summary-due">Rs {student.due.toLocaleString()}</span>
                      </div>
                    </div>
                  ) : null
                })()}
              </div>
            )}
          </div>

          {/* Recent Receipts */}
          <div className="billing-card">
            <h2 className="billing-section-title">Recent Receipts</h2>
            
            {/* Filters */}
            <div className="billing-filters">
              <input
                type="text"
                placeholder="Search receipts..."
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
            </div>

            <div className="billing-receipt-list">
              {filteredReceipts.map(receipt => (
                <div key={receipt.id} className="billing-receipt-item">
                  <div className="billing-receipt-info">
                    <div className="billing-receipt-header">
                      <strong>{receipt.studentName}</strong>
                      <span className="billing-receipt-number">{receipt.receiptNumber}</span>
                    </div>
                    <div className="billing-receipt-details">
                      <div>Class {receipt.studentClass} • Roll {receipt.rollNumber}</div>
                      <div>{receipt.date}</div>
                    </div>
                  </div>
                  <div className="billing-receipt-amount">
                    Rs {receipt.amount.toLocaleString()}
                  </div>
                  <div className="billing-receipt-status">
                    <span className={`billing-status-${receipt.status}`}>
                      {receipt.status === 'paid' ? 'Paid' : receipt.status === 'pending' ? 'Pending' : 'Failed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="billing-success-message">
            <i className="fas fa-check-circle"></i>
            Payment collected successfully!
          </div>
        )}
      </main>
    </div>
  </>)
} 
