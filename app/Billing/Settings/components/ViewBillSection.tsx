'use client'

import { useState, useCallback, useEffect } from 'react'
import './ViewBillSection.css'

interface FeeComponent {
  id: string
  name: string
}

interface ClassFee {
  className: string
  fees: Record<string, number>
  total: number
}

interface BillPreview {
  schoolName: string
  schoolPhone: string
  schoolEmail: string
  academicYear: string
  generatedAt: string
  classes: ClassFee[]
  grandTotal: number
}

interface ViewBillSectionProps {
  academicYears: string[]
}

const CLASSES = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)

export default function ViewBillSection({
  academicYears
}: ViewBillSectionProps) {
  const [selectedYear, setSelectedYear] = useState(academicYears[0] || '')
  const [selectedClass, setSelectedClass] = useState('all')
  const [selectedComponent, setSelectedComponent] = useState('all')
  const [feeComponents, setFeeComponents] = useState<FeeComponent[]>([])
  const [billPreview, setBillPreview] = useState<BillPreview | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    const parsedUser = userData ? JSON.parse(userData) : null
    return {
      'Authorization': `Bearer ${token}`,
      'x-school-id': parsedUser?.schoolId || ''
    }
  }, [])

  const showMessage = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }, [])

  // Fetch fee components when selectedYear changes
  useEffect(() => {
    const fetchComponents = async () => {
      if (!selectedYear) return
      try {
        const response = await fetch(`/api/accounting/fee-management/components?academicYear=${selectedYear}`, {
          headers: getAuthHeaders()
        })
        const result = await response.json()
        if (result.success) {
          setFeeComponents(result.data)
        }
      } catch {
        showMessage('error', 'Failed to fetch fee components')
      }
    }

    fetchComponents()
  }, [selectedYear, getAuthHeaders, showMessage])

  const handleGenerate = async () => {
    try {
      setIsLoading(true)
      setBillPreview(null)

      const params = new URLSearchParams({
        academicYear: selectedYear,
        ...(selectedClass !== 'all' && { className: selectedClass }),
        ...(selectedComponent !== 'all' && { component: selectedComponent })
      })

      const response = await fetch(`/api/accounting/fee-management/bill-preview?${params}`, {
        headers: getAuthHeaders()
      })

      const result = await response.json()
      if (result.success) {
        setBillPreview(result.data)
      } else {
        showMessage('error', result.error || 'Failed to generate bill preview')
      }
    } catch {
      showMessage('error', 'Failed to generate bill preview')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="view-bill-section">
      <div className="view-bill-form">
        <div className="view-bill-filters">
          <div className="view-bill-field">
            <label>Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="view-bill-select"
            >
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="view-bill-field">
            <label>Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="view-bill-select"
            >
              <option value="all">All Classes</option>
              {CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="view-bill-field">
            <label>Fee Component</label>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="view-bill-select"
            >
              <option value="all">All Components</option>
              {feeComponents.map(component => (
                <option key={component.id} value={component.name}>{component.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="view-bill-actions">
          <button
            onClick={handleGenerate}
            className="view-bill-btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Bill'}
          </button>
        </div>

        {isLoading && (
          <div className="view-bill-loading">
            <div className="view-bill-spinner"></div>
            <span>Generating bill preview...</span>
          </div>
        )}

        {billPreview && !isLoading && (
          <div className="view-bill-preview">
            <div className="view-bill-preview-header">
              <h3>{billPreview.schoolName}</h3>
              <p className="view-bill-preview-subtitle">Fee Structure - {billPreview.academicYear}</p>
              {billPreview.schoolPhone && <p>Phone: {billPreview.schoolPhone}</p>}
              {billPreview.schoolEmail && <p>Email: {billPreview.schoolEmail}</p>}
            </div>

            <div className="view-bill-preview-content">
              {billPreview.classes.length === 0 ? (
                <div className="view-bill-preview-empty">
                  No fee data available for the selected filters.
                </div>
              ) : (
                <>
                  <div className="view-bill-preview-classes">
                    {billPreview.classes.map(cls => (
                      <div key={cls.className} className="view-bill-preview-class">
                        <h4>{cls.className}</h4>
                        <div className="view-bill-preview-fees">
                          {Object.entries(cls.fees).map(([componentId, amount]) => {
                            const componentName = feeComponents.find(c => c.id === componentId)?.name || componentId
                            return (
                              <div key={componentId} className="view-bill-preview-fee-row">
                                <span>{componentName}</span>
                                <span className="view-bill-preview-amount">Rs. {amount.toLocaleString()}</span>
                              </div>
                            )
                          })}
                        </div>
                        <div className="view-bill-preview-class-total">
                          <span>Class Total:</span>
                          <span>Rs. {(cls.total || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="view-bill-preview-grand-total">
                    <span>Grand Total:</span>
                    <span>Rs. {billPreview.grandTotal.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>

            <div className="view-bill-preview-footer">
              <span>Generated on: {new Date(billPreview.generatedAt).toLocaleString()}</span>
            </div>
          </div>
        )}

        {message && (
          <div className={`view-bill-message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}
