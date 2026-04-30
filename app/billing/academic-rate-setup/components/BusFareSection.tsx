'use client'

import { useState, useEffect, useCallback } from 'react'
import './BusFareSection.css'

interface User {
  role: string
  schoolId?: string
}

interface BusFareRate {
  _id: string
  schoolId: number
  academicYear: number
  address: string
  displayAddress: string
  rate: number
  createdAt: string
  updatedAt: string
}

interface BusFareSectionProps {
  user: User | null
}

export default function BusFareSection({ user }: BusFareSectionProps) {
  const [academicYear, setAcademicYear] = useState('')
  const [mode, setMode] = useState<'select' | 'manual'>('select')
  const [addresses, setAddresses] = useState<string[]>([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [manualAddress, setManualAddress] = useState('')
  const [rate, setRate] = useState('')
  const [busFareRates, setBusFareRates] = useState<BusFareRate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingRate, setEditingRate] = useState<BusFareRate | null>(null)
  const [editRateValue, setEditRateValue] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const canEdit = user?.role === 'schooladmin' || user?.role === 'billing' || user?.role === 'superadmin'

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
    setTimeout(() => setMessage(null), 3000)
  }, [])

  // Fetch addresses when academic year changes
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!academicYear || mode !== 'select') return
      
      setIsLoading(true)
      try {
        const response = await fetch(`/api/accounting/bus-fare/addresses?academicYear=${academicYear}`, {
          headers: getAuthHeaders()
        })
        const result = await response.json()
        if (result.success) {
          setAddresses(result.data)
        } else {
          showMessage('error', result.error || 'Failed to fetch addresses')
        }
      } catch {
        showMessage('error', 'Failed to fetch addresses')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAddresses()
  }, [academicYear, mode, getAuthHeaders, showMessage])

  // Fetch bus fare rates when academic year changes
  useEffect(() => {
    const fetchRates = async () => {
      if (!academicYear) return
      
      try {
        const response = await fetch(`/api/accounting/bus-fare/rates?academicYear=${academicYear}`, {
          headers: getAuthHeaders()
        })
        const result = await response.json()
        if (result.success) {
          setBusFareRates(result.data)
        }
      } catch {
        showMessage('error', 'Failed to fetch bus fare rates')
      }
    }

    fetchRates()
  }, [academicYear, getAuthHeaders, showMessage])

  const handleSave = async () => {
    if (!canEdit || !academicYear) return

    const addressToSave = mode === 'select' ? selectedAddress : manualAddress
    
    if (!addressToSave.trim()) {
      showMessage('error', 'Please select or enter an address')
      return
    }

    if (!rate || Number(rate) <= 0) {
      showMessage('error', 'Please enter a valid rate')
      return
    }

    try {
      setIsSaving(true)
      
      const response = await fetch('/api/accounting/bus-fare/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          academicYear: Number(academicYear),
          address: addressToSave.trim(),
          rate: Number(rate)
        })
      })

      const result = await response.json()
      if (result.success) {
        setBusFareRates(prev => [...prev, result.data])
        setSelectedAddress('')
        setManualAddress('')
        setRate('')
        showMessage('success', 'Bus fare rate saved successfully!')
        
        // Refresh addresses to remove the used one
        if (mode === 'select') {
          const addrResponse = await fetch(`/api/accounting/bus-fare/addresses?academicYear=${academicYear}`, {
            headers: getAuthHeaders()
          })
          const addrResult = await addrResponse.json()
          if (addrResult.success) {
            setAddresses(addrResult.data)
          }
        }
      } else {
        showMessage('error', result.error || 'Failed to save bus fare rate')
      }
    } catch {
      showMessage('error', 'Failed to save bus fare rate')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (rate: BusFareRate) => {
    setEditingRate(rate)
    setEditRateValue(rate.rate.toString())
  }

  const handleUpdate = async () => {
    if (!editingRate || !editRateValue) return

    try {
      const response = await fetch(`/api/accounting/bus-fare/update/${editingRate._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          rate: Number(editRateValue)
        })
      })

      const result = await response.json()
      if (result.success) {
        setBusFareRates(prev => prev.map(r => 
          r._id === editingRate._id 
            ? { ...r, rate: Number(editRateValue), updatedAt: new Date().toISOString() }
            : r
        ))
        setEditingRate(null)
        setEditRateValue('')
        showMessage('success', 'Bus fare rate updated successfully!')
      } else {
        showMessage('error', result.error || 'Failed to update bus fare rate')
      }
    } catch {
      showMessage('error', 'Failed to update bus fare rate')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bus fare rate?')) return

    try {
      const response = await fetch(`/api/accounting/bus-fare/delete/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      const result = await response.json()
      if (result.success) {
        setBusFareRates(prev => prev.filter(r => r._id !== id))
        showMessage('success', 'Bus fare rate deleted successfully!')
        
        // Refresh addresses
        if (academicYear && mode === 'select') {
          const addrResponse = await fetch(`/api/accounting/bus-fare/addresses?academicYear=${academicYear}`, {
            headers: getAuthHeaders()
          })
          const addrResult = await addrResponse.json()
          if (addrResult.success) {
            setAddresses(addrResult.data)
          }
        }
      } else {
        showMessage('error', result.error || 'Failed to delete bus fare rate')
      }
    } catch {
      showMessage('error', 'Failed to delete bus fare rate')
    }
  }

  return (
    <div className="bus-fare-section">
      <div className="bus-fare-form">
        {/* Academic Year Input */}
        <div className="bus-fare-row">
          <div className="bus-fare-field">
            <label>Academic Year</label>
            <input
              type="number"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="Enter Academic Year (e.g. 2081)"
              className="bus-fare-input"
            />
          </div>
        </div>

        {/* Mode Toggle */}
        {academicYear && (
          <div className="bus-fare-row">
            <div className="bus-fare-field">
              <label>Address Mode</label>
              <div className="bus-fare-mode-toggle">
                <button
                  type="button"
                  className={`bus-fare-mode-btn ${mode === 'select' ? 'active' : ''}`}
                  onClick={() => setMode('select')}
                >
                  Select from Students
                </button>
                <button
                  type="button"
                  className={`bus-fare-mode-btn ${mode === 'manual' ? 'active' : ''}`}
                  onClick={() => setMode('manual')}
                >
                  Enter Manually
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Address Selection */}
        {academicYear && canEdit && (
          <div className="bus-fare-row">
            <div className="bus-fare-field">
              <label>Address</label>
              {mode === 'select' ? (
                <select
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="bus-fare-select"
                  disabled={isLoading}
                >
                  <option value="">{isLoading ? 'Loading...' : 'Select an address'}</option>
                  {addresses.map((addr) => (
                    <option key={addr} value={addr}>{addr}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Enter address manually"
                  className="bus-fare-input"
                />
              )}
            </div>
          </div>
        )}

        {/* Rate Input */}
        {academicYear && canEdit && (mode === 'manual' ? manualAddress : selectedAddress) && (
          <div className="bus-fare-row">
            <div className="bus-fare-field">
              <label>Rate (Rs.)</label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="Enter bus fare rate"
                className="bus-fare-input"
                min="0"
              />
            </div>
          </div>
        )}

        {/* Save Button */}
        {canEdit && academicYear && (mode === 'manual' ? manualAddress : selectedAddress) && rate && (
          <div className="bus-fare-actions">
            <button
              onClick={handleSave}
              className="bus-fare-btn-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Bus Fare Rate'}
            </button>
          </div>
        )}

        {/* Configured Rates List */}
        {busFareRates.length > 0 && (
          <div className="bus-fare-list">
            <label>Configured Bus Fare Rates</label>
            <div className="bus-fare-items">
              {busFareRates.map((rate) => (
                <div key={rate._id} className="bus-fare-item">
                  <div className="bus-fare-item-info">
                    <span className="bus-fare-address">{rate.displayAddress}</span>
                    <span className="bus-fare-year">Year: {rate.academicYear}</span>
                  </div>
                  <div className="bus-fare-item-actions">
                    {editingRate?._id === rate._id ? (
                      <>
                        <input
                          type="number"
                          value={editRateValue}
                          onChange={(e) => setEditRateValue(e.target.value)}
                          className="bus-fare-edit-input"
                          min="0"
                        />
                        <button
                          onClick={handleUpdate}
                          className="bus-fare-btn-save"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingRate(null)
                            setEditRateValue('')
                          }}
                          className="bus-fare-btn-cancel"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="bus-fare-rate">Rs. {rate.rate.toLocaleString()}</span>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => handleEdit(rate)}
                              className="bus-fare-btn-edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(rate._id)}
                              className="bus-fare-btn-delete"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {busFareRates.length === 0 && academicYear && (
          <div className="bus-fare-empty">
            No bus fare rates configured for academic year {academicYear}.
            {canEdit && ' Add some rates above.'}
          </div>
        )}

        {message && (
          <div className={`bus-fare-message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}
