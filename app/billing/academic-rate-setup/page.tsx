'use client'

import { useState, useEffect, useCallback } from 'react'
import BillingNavbar from '../components/BillingNavbar'
import '../billingMain.css'
import './AcademicRate.css'
import {
  ConfigureComponentsSection,
  ManageFeeSection,
  ViewBillSection
} from './components'

interface User {
  role: string
  schoolId?: string
  schoolName?: string
}

type TabType = 'components' | 'manage-fee' | 'view-bill'

export default function AcademicRateSetup() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('components')
  const [academicYears, setAcademicYears] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState('')

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    const parsedUser = userData ? JSON.parse(userData) : null
    return {
      'Authorization': `Bearer ${token}`,
      'x-school-id': parsedUser?.schoolId || ''
    }
  }, [])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const response = await fetch('/api/accounting/fee-management/academic-years', {
          headers: getAuthHeaders()
        })
        const result = await response.json()
        if (result.success) {
          setAcademicYears(result.data)
          if (result.data.length > 0 && !selectedYear) {
            setSelectedYear(result.data[0])
          }
        }
      } catch (error) {
        console.error('Failed to fetch academic years:', error)
      }
    }

    if (user) {
      fetchAcademicYears()
    }
  }, [user, selectedYear, getAuthHeaders])

  const tabs = [
    { id: 'components' as TabType, label: 'Configure Components' },
    { id: 'manage-fee' as TabType, label: 'Manage Fee' },
    { id: 'view-bill' as TabType, label: 'View Bill' }
  ]

  return (
    <div className="billing-layout">
      <BillingNavbar />

      <main className="billing-main-content">
        {/* Header */}
        <div className="billing-settings-header">
          <div className="billing-settings-header-content">
            <h1 className="billing-settings-title">Billing Settings</h1>
            <div className="billing-settings-school-info">
              <span className="billing-settings-school-name">{user?.schoolName || 'School'}</span>
              <span className="billing-settings-school-id">ID: {user?.schoolId || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="billing-settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`billing-settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="billing-settings-content">
          {activeTab === 'components' && (
            <div className="billing-settings-panel">
              <h2 className="billing-settings-panel-title">Configure Components</h2>
              <ConfigureComponentsSection
                user={user}
                academicYears={academicYears}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
              />
            </div>
          )}

          {activeTab === 'manage-fee' && (
            <div className="billing-settings-panel">
              <h2 className="billing-settings-panel-title">Manage Fee</h2>
              <ManageFeeSection
                user={user}
                academicYears={academicYears}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
              />
            </div>
          )}

          {activeTab === 'view-bill' && (
            <div className="billing-settings-panel">
              <h2 className="billing-settings-panel-title">View Bill</h2>
              <ViewBillSection
                academicYears={academicYears}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}