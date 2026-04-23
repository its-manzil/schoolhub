'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import BillingNavbar from '../components/BillingNavbar'
import '../billingMain.css'
import './profile.css'

interface BillingAccount {
  _id: string
  username: string
  email: string | null
  phone: string | null
  role: string
  schoolId: number
  isActive: boolean
  createdAt: string
  updatedAt?: string
  lastLogin?: string | null
}

export default function BillingProfilePage() {
  const pathname = usePathname()
  const isSchoolAdminContext = pathname?.startsWith('/SchoolAdmin')

  return (
    <div className="billing-layout">
      <BillingNavbar />
      <main className="billing-main-content">
        {isSchoolAdminContext ? (
          <SchoolAdminBillingAccountSection />
        ) : (
          <BillingSelfPasswordSection />
        )}
      </main>
    </div>
  )
}

function BillingSelfPasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  const handleChangePassword = async () => {
    try {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')

      if (!token || !userData) {
        showMessage('error', 'You are not logged in')
        return
      }

      const user = JSON.parse(userData)

      if (user.role !== 'billing') {
        showMessage('error', 'Only billing account can change password here')
        return
      }

      if (!currentPassword || !newPassword || !confirmPassword) {
        showMessage('error', 'Fill all password fields')
        return
      }

      if (newPassword !== confirmPassword) {
        showMessage('error', 'New password and confirm password do not match')
        return
      }

      if (newPassword.length < 6) {
        showMessage('error', 'Password must be at least 6 characters')
        return
      }

      setLoading(true)

      const response = await fetch('http://localhost:2056/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        showMessage('error', data.message || 'Failed to update password')
        return
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showMessage('success', 'Password updated successfully')
    } catch (error) {
      console.error('Error updating password for billing account:', error)
      showMessage('error', 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="billing-section-header" style={{ marginBottom: '24px' }}>
        <h1 className="billing-section-title">Billing Profile Settings</h1>
      </div>
      <p style={{ color: 'var(--billing-text-muted)', marginBottom: '24px' }}>
        Manage your billing account settings and security.
      </p>

      <div className="billing-card">
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--billing-text)', marginBottom: '8px' }}>
            Change Password
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--billing-text-muted)' }}>
            Billing account must provide current and new password to update.
          </p>
        </div>

        <div className="billing-form">
          <div className="billing-form-row">
            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--billing-text)' }}>
              Current password
              <input
                type="password"
                className="billing-input"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--billing-text)' }}>
              New password
              <input
                type="password"
                className="billing-input"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </label>
          </div>
          <div className="billing-form-row">
            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--billing-text)' }}>
              Confirm new password
              <input
                type="password"
                className="billing-input"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </label>
          </div>
          <div className="billing-form-actions" style={{ marginTop: '24px' }}>
            <button 
              className="billing-btn-primary" 
              onClick={handleChangePassword}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </div>
          {message && (
            <div
              className={`billing-success-message ${
                message.type === 'error' ? 'billing-error-message' : ''
              }`}
              style={{ 
                position: 'static', 
                marginTop: '16px',
                background: message.type === 'success' ? 'var(--billing-emerald)' : 'var(--billing-rose)'
              }}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function SchoolAdminBillingAccountSection() {
  const [account, setAccount] = useState<BillingAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [createUsername, setCreateUsername] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createConfirmPassword, setCreateConfirmPassword] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')

        if (!token) {
          showMessage('error', 'You are not logged in')
          return
        }

        const userData = localStorage.getItem('user')
        if (!userData) {
          showMessage('error', 'User data not found')
          return
        }

        const user = JSON.parse(userData)
        if (!user.schoolId) {
          showMessage('error', 'School ID not found in user credentials')
          return
        }

        const username = `bill_${user.schoolId}`
        setCreateUsername(username)

        const response = await fetch('http://localhost:2056/api/users/billing', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          showMessage('error', data.message || 'Failed to load billing account')
          return
        }

        setAccount(data.data)
      } catch (error) {
        console.error('Error loading billing account:', error)
        showMessage('error', 'Failed to load billing account')
      } finally {
        setLoading(false)
      }
    }

    fetchAccount()
  }, [])

  const handleCreateAccount = async () => {
    try {
      if (!createPassword || !createConfirmPassword) {
        showMessage('error', 'Password fields are required')
        return
      }

      if (createPassword !== createConfirmPassword) {
        showMessage('error', 'Password and confirm password do not match')
        return
      }

      if (createPassword.length < 6) {
        showMessage('error', 'Password must be at least 6 characters')
        return
      }

      const token = localStorage.getItem('token')

      if (!token) {
        showMessage('error', 'You are not logged in')
        return
      }

      setCreateLoading(true)

      const response = await fetch('http://localhost:2056/api/users/create-billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          password: createPassword
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        showMessage('error', data.message || 'Failed to create billing account')
        return
      }

      setAccount(data.data)
      setCreatePassword('')
      setCreateConfirmPassword('')
      showMessage('success', 'Billing account created successfully')
    } catch (error) {
      console.error('Error creating billing account:', error)
      showMessage('error', 'Failed to create billing account')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    try {
      if (!newPassword || !confirmNewPassword) {
        showMessage('error', 'Fill both password fields')
        return
      }

      if (newPassword !== confirmNewPassword) {
        showMessage('error', 'Password and confirm password do not match')
        return
      }

      if (newPassword.length < 6) {
        showMessage('error', 'Password must be at least 6 characters')
        return
      }

      const token = localStorage.getItem('token')

      if (!token) {
        showMessage('error', 'You are not logged in')
        return
      }

      setPasswordLoading(true)

      const response = await fetch('http://localhost:2056/api/users/change-billing-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          newPassword
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        showMessage('error', data.message || 'Failed to update billing password')
        return
      }

      setNewPassword('')
      setConfirmNewPassword('')
      showMessage('success', 'Billing password updated successfully')
    } catch (error) {
      console.error('Error updating billing password:', error)
      showMessage('error', 'Failed to update billing password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      if (!window.confirm('Are you sure you want to delete the billing account?')) {
        return
      }

      const token = localStorage.getItem('token')

      if (!token) {
        showMessage('error', 'You are not logged in')
        return
      }

      setDeleteLoading(true)

      const response = await fetch('http://localhost:2056/api/users/delete-billing', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        showMessage('error', data.message || 'Failed to delete billing account')
        return
      }

      setAccount(null)
      showMessage('success', 'Billing account deleted successfully')
    } catch (error) {
      console.error('Error deleting billing account:', error)
      showMessage('error', 'Failed to delete billing account')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="billing-loading-wrapper">
        <div className="billing-loading-spinner"></div>
        <p>Loading billing account...</p>
      </div>
    )
  }

  return (
    <>
      <div className="billing-section-header" style={{ marginBottom: '24px' }}>
        <h1 className="billing-section-title">Billing Account Settings</h1>
      </div>
      <p style={{ color: 'var(--billing-text-muted)', marginBottom: '24px' }}>
        Manage the billing account for this school.
      </p>

      {message && (
        <div
          className="billing-success-message"
          style={{ 
            position: 'static', 
            marginBottom: '20px',
            background: message.type === 'success' ? 'var(--billing-emerald)' : 'var(--billing-rose)'
          }}
        >
          {message.text}
        </div>
      )}

      {account ? (
        <div className="billing-content-grid">
          <div className="billing-card">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--billing-border-light)'
            }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--billing-text)', marginBottom: '8px' }}>
                  {account.username}
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: 'var(--billing-text-muted)' }}>
                  <span>
                    School ID: <strong style={{ color: 'var(--billing-text)' }}>{account.schoolId}</strong>
                  </span>
                  {account.email && (
                    <span>
                      Email: <strong style={{ color: 'var(--billing-text)' }}>{account.email}</strong>
                    </span>
                  )}
                  {account.phone && (
                    <span>
                      Phone: <strong style={{ color: 'var(--billing-text)' }}>{account.phone}</strong>
                    </span>
                  )}
                </div>
              </div>
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  background: account.isActive ? 'var(--billing-emerald)' : 'var(--billing-rose)',
                  color: 'white'
                }}
              >
                {account.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--billing-text-muted)', marginBottom: '4px' }}>Created</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--billing-text)' }}>
                  {account.createdAt ? new Date(account.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--billing-text-muted)', marginBottom: '4px' }}>Last updated</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--billing-text)' }}>
                  {account.updatedAt ? new Date(account.updatedAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--billing-text-muted)', marginBottom: '4px' }}>Last login</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--billing-text)' }}>
                  {account.lastLogin ? new Date(account.lastLogin).toLocaleString() : 'Never'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="billing-btn-primary"
                style={{ background: 'var(--billing-rose)' }}
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete billing account'}
              </button>
            </div>
          </div>

          <div className="billing-card">
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--billing-text)', marginBottom: '8px' }}>
                Reset Billing Password
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--billing-text-muted)' }}>
                Set a new password for the billing account without needing the current password.
              </p>
            </div>
            <div className="billing-form">
              <div className="billing-form-row">
                <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--billing-text)' }}>
                  New password
                  <input
                    type="password"
                    className="billing-input"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--billing-text)' }}>
                  Confirm new password
                  <input
                    type="password"
                    className="billing-input"
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </label>
              </div>
              <div className="billing-form-actions" style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  className="billing-btn-primary"
                  onClick={handleUpdatePassword}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Updating...' : 'Update password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="billing-card">
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--billing-text)', marginBottom: '8px' }}>
              Create Billing Account
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--billing-text-muted)' }}>
              No billing account exists for this school yet. Create one to allow billing access.
            </p>
          </div>
          <div className="billing-form">
            <div className="billing-form-row">
              <div style={{ 
                padding: '12px 16px', 
                background: 'var(--billing-surface-alt)', 
                borderRadius: '8px',
                fontSize: '14px'
              }}>
                <strong>Username:</strong> {createUsername}
              </div>
            </div>
            <div className="billing-form-row">
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--billing-text)' }}>
                Password
                <input
                  type="password"
                  className="billing-input"
                  value={createPassword}
                  onChange={e => setCreatePassword(e.target.value)}
                  placeholder="Enter password"
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--billing-text)' }}>
                Confirm password
                <input
                  type="password"
                  className="billing-input"
                  value={createConfirmPassword}
                  onChange={e => setCreateConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                />
              </label>
            </div>
            <div className="billing-form-actions" style={{ marginTop: '24px' }}>
              <button
                type="button"
                className="billing-btn-primary"
                onClick={handleCreateAccount}
                disabled={createLoading}
              >
                {createLoading ? 'Creating...' : 'Create billing account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
