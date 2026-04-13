'use client'


import { useState, useEffect } from 'react'
import SchoolAdminNavbar from '../../SchoolAdmin/Components/SchoolAdminNavbar'
import BillingNavbar from '../components/BillingNavbar'
import '../billingMain.css'

interface FeeHead {
  id: string
  name: string
  category: string
  amount: number
  isActive: boolean
  isTaxable: boolean
  taxRate: number
}

interface Student {
  id: string
  name: string
  class: string
  rollNo: string
  total: number
  paid: number
  due: number
  status: 'active' | 'inactive' | 'graduated' | 'transferred'
}

interface BillItem {
  id: string
  feeHeadId: string
  feeHeadName: string
  amount: number
  originalAmount: number
  overrideAmount: number
  isOverride: boolean
  taxRate: number
  taxAmount: number
  total: number
}

interface StudentBill {
  id: string
  studentId: string
  studentName: string
  rollNumber: string
  studentClass: string
  status: 'active' | 'inactive' | 'graduated' | 'transferred'
  items: BillItem[]
  subtotal: number
  fineAmount: number
  taxAmount: number
  tdsAmount: number
  totalAmount: number
  billingMonth: string
  billingYear: string
  issueDate: string
  dueDate: string
  isPosted: boolean
  isPreview: boolean
}

export default function BillGenerate() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [feeHeads, setFeeHeads] = useState<FeeHead[]>([])
  const [bills, setBills] = useState<StudentBill[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const [filters, setFilters] = useState({
    searchTerm: '',
    class: 'all',
  })

  const [formData, setFormData] = useState({
    billingMonth: '',
    billingYear: '',
    issueDate: '',
    dueDate: '',
    fineAmount: 0,
  })

  useEffect(() => {
    const mockStudents: Student[] = [
      { id: '1', name: 'Ram Bahadur', class: '10', rollNo: '001', total: 15000, paid: 8000, due: 7000, status: 'active' },
      { id: '2', name: 'Sita Kumari', class: '10', rollNo: '002', total: 15000, paid: 15000, due: 0, status: 'active' },
      { id: '3', name: 'Hari Sharma', class: '9', rollNo: '001', total: 12000, paid: 6000, due: 6000, status: 'active' },
    ]
    const mockFeeHeads: FeeHead[] = [
      { id: '1', name: 'Tuition Fee', category: 'Academic', amount: 10000, isActive: true, isTaxable: false, taxRate: 0 },
      { id: '2', name: 'Library Fee', category: 'Academic', amount: 500, isActive: true, isTaxable: false, taxRate: 0 },
      { id: '3', name: 'Lab Fee', category: 'Academic', amount: 1500, isActive: true, isTaxable: false, taxRate: 0 },
      { id: '4', name: 'Transport Fee', category: 'Service', amount: 2000, isActive: true, isTaxable: false, taxRate: 0 },
    ]
    setStudents(mockStudents)
    setFilteredStudents(mockStudents)
    setFeeHeads(mockFeeHeads)
  }, [])

  const handleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const filteredStudentsList = filteredStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
    const matchesClass = filters.class === 'all' || student.class === filters.class
    return matchesSearch && matchesClass
  })

  const selectAllStudents = () => {
    if (selectedStudents.length === filteredStudentsList.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudentsList.map(s => s.id))
    }
  }

  const generateBills = () => {
    if (selectedStudents.length === 0) return

    const generatedBills: StudentBill[] = selectedStudents.map(studentId => {
      const student = students.find(s => s.id === studentId)!
      const items: BillItem[] = feeHeads.filter(fh => fh.isActive).map(fh => ({
        id: Math.random().toString(),
        feeHeadId: fh.id,
        feeHeadName: fh.name,
        amount: fh.amount,
        originalAmount: fh.amount,
        overrideAmount: fh.amount,
        isOverride: false,
        taxRate: fh.taxRate,
        taxAmount: 0,
        total: fh.amount,
      }))
      const subtotal = items.reduce((sum, item) => sum + item.total, 0)
      return {
        id: Math.random().toString(),
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNo,
        studentClass: student.class,
        status: 'active',
        items,
        subtotal,
        fineAmount: formData.fineAmount,
        taxAmount: 0,
        tdsAmount: 0,
        totalAmount: subtotal + formData.fineAmount,
        billingMonth: formData.billingMonth || '01',
        billingYear: formData.billingYear || '2084',
        issueDate: formData.issueDate || new Date().toISOString().split('T')[0],
        dueDate: formData.dueDate || new Date().toISOString().split('T')[0],
        isPosted: false,
        isPreview: true,
      }
    })

    setBills(generatedBills)
    setShowPreview(true)
  }

  const postBills = () => {
    setBills(prev => prev.map(bill => ({ ...bill, isPosted: true, isPreview: false })))
    setShowPreview(false)
    alert('Bills posted successfully!')
  }

  return (
    <>
      <SchoolAdminNavbar />

      <div className="billing-layout">
        <BillingNavbar />
        <main className="billing-main-content">
          {/* Header */}
          <div className="billing-header">
            <div>
              <h1 className="billing-title">Generate Bills</h1>
              <p className="billing-subtitle">Create and manage student bills efficiently</p>
            </div>
            <div className="billing-header-actions">
              <div className="billing-role-badge">
                <div className="billing-role-icon">B</div>
                <span className="billing-role-text">Billing</span>
              </div>
            </div>
          </div>

          {/* Student Selection */}
          <div className="billing-section">
            <div className="billing-section-header">
              <h2 className="billing-section-title">Student Selection</h2>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--billing-primary)' }}>
                {selectedStudents.length} students selected
              </span>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search students..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="billing-input"
                style={{ flex: 1, minWidth: '200px' }}
              />
              <select
                value={filters.class}
                onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
                className="billing-select"
                style={{ minWidth: '150px' }}
              >
                <option value="all">All Classes</option>
                <option value="10">Class 10</option>
                <option value="9">Class 9</option>
                <option value="8">Class 8</option>
              </select>
            </div>

            {/* Student List */}
            <div style={{
              background: 'var(--billing-surface-alt)',
              borderRadius: 'var(--billing-radius)',
              padding: '16px',
              maxHeight: '400px',
              overflowY: 'auto',
            }}>
              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--billing-border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === filteredStudentsList.length && filteredStudentsList.length > 0}
                    onChange={selectAllStudents}
                    style={{ cursor: 'pointer' }}
                  />
                  Select All ({selectedStudents.length}/{filteredStudentsList.length})
                </label>
              </div>

              {filteredStudentsList.map(student => (
                <div key={student.id} style={{
                  padding: '12px',
                  background: 'var(--billing-surface)',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  border: selectedStudents.includes(student.id)
                    ? '2px solid var(--billing-primary)'
                    : '1px solid var(--billing-border)',
                  transition: 'border 0.15s ease',
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleStudentSelection(student.id)}
                      style={{ cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{student.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--billing-text-muted)', marginBottom: '4px' }}>
                        Class {student.class} &bull; Roll No: {student.rollNo}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--billing-text-light)' }}>
                        Total: Rs {student.total.toLocaleString()} &bull; Due: Rs {student.due.toLocaleString()}
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Bill Configuration */}
          <div className="billing-section">
            <div className="billing-section-header">
              <h2 className="billing-section-title">Bill Configuration</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Billing Month
                </label>
                <input
                  type="month"
                  value={formData.billingMonth}
                  onChange={(e) => setFormData(prev => ({ ...prev, billingMonth: e.target.value }))}
                  className="billing-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Issue Date
                </label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                  className="billing-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="billing-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Fine Amount
                </label>
                <input
                  type="number"
                  value={formData.fineAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, fineAmount: Number(e.target.value) }))}
                  className="billing-input"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button
                onClick={generateBills}
                disabled={selectedStudents.length === 0}
                className="billing-btn-primary"
                style={{ opacity: selectedStudents.length === 0 ? 0.6 : 1, cursor: selectedStudents.length === 0 ? 'not-allowed' : 'pointer' }}
              >
                Generate Bills ({selectedStudents.length})
              </button>
            </div>
          </div>

          {/* Preview Modal */}
          {showPreview && (
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}>
              <div style={{
                background: 'var(--billing-surface)',
                borderRadius: 'var(--billing-radius-lg)',
                padding: '32px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: 'var(--billing-shadow-lg)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Bill Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="billing-btn-close"
                  >
                    ×
                  </button>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  {bills.map(bill => (
                    <div key={bill.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      background: 'var(--billing-surface-alt)',
                      borderRadius: '8px',
                      marginBottom: '12px',
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{bill.studentName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--billing-text-muted)' }}>
                          Class {bill.studentClass} &bull; Roll {bill.rollNumber}
                        </div>
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--billing-primary)' }}>
                        Rs {bill.totalAmount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowPreview(false)} className="billing-btn-secondary">
                    Back to Edit
                  </button>
                  <button onClick={postBills} className="billing-btn-primary">
                    Post Bills ({bills.length})
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