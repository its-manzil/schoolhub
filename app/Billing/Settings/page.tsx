'use client'

import { useState } from 'react'

import BillingNavbar from '../components/BillingNavbar'
import '../billingMain.css'
import './Settings.css'

interface BillingSettings {
  schoolName: string
  address: string
  phone: string
  email: string
  taxId: string
  registrationNumber: string
  lateFee: number
  lateFeePercentage: number
  currency: string
  dateFormat: string
  emailNotifications: boolean
  smsNotifications: boolean
  receiptTemplate: string
}

export default function BillingSettings() {
  const [settings, setSettings] = useState<BillingSettings>({
    schoolName: 'Nepsof Academy',
    address: 'Kathmandu, Nepal',
    phone: '+977-1234567',
    email: 'billing@nepsof.edu.np',
    taxId: '123456789',
    registrationNumber: 'REG-2024-001',
    lateFee: 100,
    lateFeePercentage: 5,
    currency: 'NPR',
    dateFormat: 'BS',
    emailNotifications: true,
    smsNotifications: false,
    receiptTemplate: 'classic'
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSave = () => {
    setIsLoading(true)
    
    // Mock save logic
    setTimeout(() => {
      setIsLoading(false)
      setShowSuccess(true)
      
      setTimeout(() => setShowSuccess(false), 3000)
    }, 1500)
  }

  const handleReset = () => {
    setSettings({
      schoolName: 'Nepsof Academy',
      address: 'Kathmandu, Nepal',
      phone: '+977-1234567',
      email: 'billing@nepsof.edu.np',
      taxId: '123456789',
      registrationNumber: 'REG-2024-001',
      lateFee: 100,
      lateFeePercentage: 5,
      currency: 'NPR',
      dateFormat: 'BS',
      emailNotifications: true,
      smsNotifications: false,
      receiptTemplate: 'classic'
    })
  }

  return (
    <>
      {/* Main Navigation */}
      
      <div className="billing-layout">
        {/* Sidebar Navigation */}
        <BillingNavbar />
        
        {/* Main Content */}
        <main className="billing-main-content">
        <div className="billing-settings-grid">
          {/* School Information */}
          <div className="billing-card">
            <h2 className="billing-section-title">School Information</h2>
            
            <div className="billing-form">
              <div className="billing-form-row">
                <label>
                  School Name
                  <input
                    type="text"
                    value={settings.schoolName}
                    onChange={(e) => setSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                    className="billing-input"
                  />
                </label>
                <label>
                  Address
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                    className="billing-input"
                  />
                </label>
              </div>

              <div className="billing-form-row">
                <label>
                  Phone Number
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                    className="billing-input"
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                    className="billing-input"
                  />
                </label>
              </div>

              <div className="billing-form-row">
                <label>
                  Tax ID
                  <input
                    type="text"
                    value={settings.taxId}
                    onChange={(e) => setSettings(prev => ({ ...prev, taxId: e.target.value }))}
                    className="billing-input"
                  />
                </label>
                <label>
                  Registration Number
                  <input
                    type="text"
                    value={settings.registrationNumber}
                    onChange={(e) => setSettings(prev => ({ ...prev, registrationNumber: e.target.value }))}
                    className="billing-input"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Billing Configuration */}
          <div className="billing-card">
            <h2 className="billing-section-title">Billing Configuration</h2>
            
            <div className="billing-form">
              <div className="billing-form-row">
                <label>
                  Late Fee Amount (Rs)
                  <input
                    type="number"
                    value={settings.lateFee}
                    onChange={(e) => setSettings(prev => ({ ...prev, lateFee: Number(e.target.value) }))}
                    className="billing-input"
                  />
                </label>
                <label>
                  Late Fee Percentage (%)
                  <input
                    type="number"
                    value={settings.lateFeePercentage}
                    onChange={(e) => setSettings(prev => ({ ...prev, lateFeePercentage: Number(e.target.value) }))}
                    className="billing-input"
                  />
                </label>
              </div>

              <div className="billing-form-row">
                <label>
                  Currency
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                    className="billing-select"
                  >
                    <option value="NPR">NPR - Nepali Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </label>
                <label>
                  Date Format
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => setSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                    className="billing-select"
                  >
                    <option value="BS">B.S. - Bikram Sambat</option>
                    <option value="AD">A.D. - Gregorian</option>
                  </select>
                </label>
              </div>

              <div className="billing-form-row">
                <label>
                  Receipt Template
                  <select
                    value={settings.receiptTemplate}
                    onChange={(e) => setSettings(prev => ({ ...prev, receiptTemplate: e.target.value }))}
                    className="billing-select"
                  >
                    <option value="classic">Classic</option>
                    <option value="modern">Modern</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="billing-card">
            <h2 className="billing-section-title">Notification Settings</h2>
            
            <div className="billing-form">
              <div className="billing-checkbox-group">
                <label className="billing-checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    className="billing-checkbox"
                  />
                  Send email notifications for payment receipts
                </label>
              </div>

              <div className="billing-checkbox-group">
                <label className="billing-checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                    className="billing-checkbox"
                  />
                  Send SMS notifications for payment reminders
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="billing-settings-actions">
          <button
            onClick={handleReset}
            className="billing-btn-secondary"
          >
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            className="billing-btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="billing-success-message">
            <i className="fas fa-check-circle"></i>
            Settings saved successfully!
          </div>
        )}
        </main>
      </div>
    </>
  )
}
