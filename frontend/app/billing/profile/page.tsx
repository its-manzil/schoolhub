'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import BillingNavbar from '../components/BillingNavbar'
import '../billingMain.css'
import './profile.css'

import { useToast } from '../../context/ToastContext'

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
        <div className="billing-profile-container">
          {isSchoolAdminContext ? (
            <SchoolAdminBillingAccountSection />
          ) : (
            <BillingSelfPasswordSection />
          )}
        </div>
      </main>
    </div>
  )
}

function BillingSelfPasswordSection() {
  const { showToast } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<{ username: string; role: string; email?: string } | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUserProfile(JSON.parse(userData))
    }
  }, [])

  const handleChangePassword = async () => {
    try {
      const token = localStorage.getItem('token')

      if (!token || !userProfile) {
        showToast('You are not logged in', 'error')
        return
      }

      if (userProfile.role !== 'billing') {
        showToast('Only billing account can change password here', 'error')
        return
      }

      if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Fill all password fields', 'error')
        return
      }

      if (newPassword !== confirmPassword) {
        showToast('New password and confirm password do not match', 'error')
        return
      }

      if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error')
        return
      }

      setLoading(true)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/users/change-password`, {
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
        showToast(data.message || 'Failed to update password', 'error')
        return
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showToast('Password updated successfully', 'success')
    } catch (error) {
      console.error('Error updating password for billing account:', error)
      showToast('Failed to update password', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="billing-section-header">
        <h1 className="billing-section-title">Billing Profile Settings</h1>
      </div>
      
      <div className="billing-card profile-info-card">
        <div className="profile-header-flex">
          <div className="profile-avatar">
            {userProfile?.username?.charAt(0).toUpperCase() || 'B'}
          </div>
          <div className="profile-details">
            <h2 className="profile-name">
              {userProfile?.username || 'Billing Account'}
            </h2>
            <p className="profile-meta">
              Role: <span className="role-tag">{userProfile?.role || 'Billing'}</span>
              {userProfile?.email && <span className="email-meta"> • {userProfile.email}</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="billing-card password-card">
        <div className="card-header">
          <h2 className="card-title">Change Password</h2>
          <p className="card-description">
            Provide your current and new password to update security credentials.
          </p>
        </div>

        <div className="billing-form">
          <div className="billing-form-row">
            <label>
              Current password
              <div className="billing-password-input-wrapper">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="billing-input"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  className="billing-password-toggle"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </label>
            <label>
              New password
              <div className="billing-password-input-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="billing-input"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="billing-password-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </label>
          </div>
          <div className="billing-form-row">
            <label>
              Confirm new password
              <div className="billing-password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="billing-input"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="billing-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </label>
          </div>
          <div className="billing-form-actions">
            <button 
              className="billing-btn-primary" 
              onClick={handleChangePassword}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function SchoolAdminBillingAccountSection() {
  const { showToast } = useToast()
  const [account, setAccount] = useState<BillingAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [createUsername, setCreateUsername] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createConfirmPassword, setCreateConfirmPassword] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [showCreatePassword, setShowCreatePassword] = useState(false)
  const [showCreateConfirmPassword, setShowCreateConfirmPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')

        if (!token) {
          showToast('You are not logged in', 'error')
          return
        }

        const userData = localStorage.getItem('user')
        if (!userData) {
          showToast('User data not found', 'error')
          return
        }

        const user = JSON.parse(userData)
        if (!user.schoolId) {
          showToast('School ID not found in user credentials', 'error')
          return
        }

        const username = `bill_${user.schoolId}`
        setCreateUsername(username)

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/users/billing`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          // If 404, account doesn't exist, which is fine
          if (response.status !== 404) {
            showToast(data.message || 'Failed to load billing account', 'error')
          }
          return
        }

        setAccount(data.data)
      } catch (error) {
        console.error('Error loading billing account:', error)
        showToast('Failed to load billing account', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchAccount()
  }, [])

  const handleCreateAccount = async () => {
    try {
      if (!createPassword || !createConfirmPassword) {
        showToast('Password fields are required', 'error')
        return
      }

      if (createPassword !== createConfirmPassword) {
        showToast('Password and confirm password do not match', 'error')
        return
      }

      if (createPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error')
        return
      }

      const token = localStorage.getItem('token')

      if (!token) {
        showToast('You are not logged in', 'error')
        return
      }

      setCreateLoading(true)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/users/create-billing`, {
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
        showToast(data.message || 'Failed to create billing account', 'error')
        return
      }

      setAccount(data.data)
      setCreatePassword('')
      setCreateConfirmPassword('')
      showToast('Billing account created successfully', 'success')
    } catch (error) {
      console.error('Error creating billing account:', error)
      showToast('Failed to create billing account', 'error')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    try {
      if (!newPassword || !confirmNewPassword) {
        showToast('Fill both password fields', 'error')
        return
      }

      if (newPassword !== confirmNewPassword) {
        showToast('Password and confirm password do not match', 'error')
        return
      }

      if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error')
        return
      }

      const token = localStorage.getItem('token')

      if (!token) {
        showToast('You are not logged in', 'error')
        return
      }

      setPasswordLoading(true)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/users/change-billing-password`, {
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
        showToast(data.message || 'Failed to update billing password', 'error')
        return
      }

      setNewPassword('')
      setConfirmNewPassword('')
      showToast('Billing password updated successfully', 'success')
    } catch (error) {
      console.error('Error updating billing password:', error)
      showToast('Failed to update billing password', 'error')
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
        showToast('You are not logged in', 'error')
        return
      }

      setDeleteLoading(true)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/users/delete-billing`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        showToast(data.message || 'Failed to delete billing account', 'error')
        return
      }

      setAccount(null)
      showToast('Billing account deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting billing account:', error)
      showToast('Failed to delete billing account', 'error')
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
      <div className="billing-section-header">
        <h1 className="billing-section-title">Billing Account Settings</h1>
      </div>
      <p className="section-description">
        Manage the billing account for this school.
      </p>

      {account ? (
        <div className="billing-content-grid">
          <div className="billing-card account-summary-card">
            <div className="account-card-header">
              <div className="account-info-main">
                <div className="account-username">{account.username}</div>
                <div className="account-meta-grid">
                  <div className="meta-item">
                    <span className="meta-label">School ID</span>
                    <span className="meta-value">{account.schoolId}</span>
                  </div>
                  {account.email && (
                    <div className="meta-item">
                      <span className="meta-label">Email</span>
                      <span className="meta-value">{account.email}</span>
                    </div>
                  )}
                  {account.phone && (
                    <div className="meta-item">
                      <span className="meta-label">Phone</span>
                      <span className="meta-value">{account.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className={`status-badge ${account.isActive ? 'active' : 'inactive'}`}>
                {account.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            
            <div className="account-stats-grid">
              <div className="stat-item">
                <span className="stat-label">Created</span>
                <span className="stat-value">
                  {account.createdAt ? new Date(account.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Last updated</span>
                <span className="stat-value">
                  {account.updatedAt ? new Date(account.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Last login</span>
                <span className="stat-value">
                  {account.lastLogin ? new Date(account.lastLogin).toLocaleString() : 'Never'}
                </span>
              </div>
            </div>

            <div className="card-actions-footer">
              <button
                type="button"
                className="billing-btn-danger"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete billing account'}
              </button>
            </div>
          </div>

          <div className="billing-card reset-password-card">
            <div className="card-header">
              <h2 className="card-title">Reset Billing Password</h2>
              <p className="card-description">
                Set a new password for the billing account without needing the current password.
              </p>
            </div>
            <div className="billing-form">
              <div className="billing-form-row">
                <label>
                  New password
                  <div className="billing-password-input-wrapper">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="billing-input"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="billing-password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </label>
                <label>
                  Confirm new password
                  <div className="billing-password-input-wrapper">
                    <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      className="billing-input"
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="billing-password-toggle"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    >
                      {showConfirmNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </label>
              </div>
              <div className="billing-form-actions">
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
        <div className="billing-card create-account-card">
          <div className="card-header">
            <h2 className="card-title">Create Billing Account</h2>
            <p className="card-description">
              No billing account exists for this school yet. Create one to allow billing access.
            </p>
          </div>
          <div className="billing-form">
            <div className="billing-form-row">
              <div className="username-display-box">
                <span className="box-label">Username:</span>
                <span className="box-value">{createUsername}</span>
              </div>
            </div>
            <div className="billing-form-row">
              <label>
                Password
                <div className="billing-password-input-wrapper">
                  <input
                    type={showCreatePassword ? "text" : "password"}
                    className="billing-input"
                    value={createPassword}
                    onChange={e => setCreatePassword(e.target.value)}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    className="billing-password-toggle"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                  >
                    {showCreatePassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </label>
              <label>
                Confirm password
                <div className="billing-password-input-wrapper">
                  <input
                    type={showCreateConfirmPassword ? "text" : "password"}
                    className="billing-input"
                    value={createConfirmPassword}
                    onChange={e => setCreateConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    className="billing-password-toggle"
                    onClick={() => setShowCreateConfirmPassword(!showCreateConfirmPassword)}
                  >
                    {showCreateConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </label>
            </div>
            <div className="billing-form-actions">
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
