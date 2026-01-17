'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import AcademicNavbar from './components/AcademicNavbar'
import '../SchoolAdmin/SchoolProfile/schoolProfile.css'
import './academic.css'

interface AcademicAccount {
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

export default function AcademicOverviewPage() {
  const pathname = usePathname()
  const isSchoolAdminContext = pathname?.startsWith('/SchoolAdmin/Academics')

  return (
    <div className="academic-layout">
      <AcademicNavbar />
      <main className="academic-main">
        {isSchoolAdminContext ? (
          <SchoolAdminAcademicAccountSection />
        ) : (
          <AcademicSelfPasswordSection />
        )}
      </main>
    </div>
  )
}

function AcademicSelfPasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

      if (user.role !== 'academic') {
        showMessage('error', 'Only academic account can change password here')
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

      const response = await fetch('http://localhost:2056/api/academic-account/password/self', {
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
      console.error('Error updating password for academic account:', error)
      showMessage('error', 'Failed to update password')
    }
  }

  return (
    <>
      <h1 className="academic-page-title">Academic Overview</h1>
      <p className="academic-page-subtitle">
        Use the left navigation to manage students, parents, exams and subjects.
      </p>

      <section className="academic-card">
        <h2>Change Password (Academic)</h2>
        <p>Academic account must provide current and new password to update.</p>

        <div className="academic-form">
          <div className="academic-form-row">
            <label>
              Current password
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
            </label>
            <label>
              New password
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </label>
          </div>
          <div className="academic-form-row">
            <label>
              Confirm new password
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </label>
          </div>
          <div className="academic-form-actions">
            <button className="academic-btn primary" onClick={handleChangePassword}>
              Update password
            </button>
          </div>
          {message && (
            <div
              className={`academic-message ${
                message.type === 'success' ? 'success' : 'error'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function SchoolAdminAcademicAccountSection() {
  const [account, setAccount] = useState<AcademicAccount | null>(null)
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

        const response = await fetch('http://localhost:2056/api/academic-account', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          showMessage('error', data.message || 'Failed to load academic account')
          return
        }

        setAccount(data.data)
      } catch (error) {
        console.error('Error loading academic account:', error)
        showMessage('error', 'Failed to load academic account')
      } finally {
        setLoading(false)
      }
    }

    fetchAccount()
  }, [])

  const handleCreateAccount = async () => {
    try {
      if (!createUsername || !createPassword || !createConfirmPassword) {
        showMessage('error', 'Fill all fields to create account')
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

      const response = await fetch('http://localhost:2056/api/academic-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: createUsername,
          password: createPassword
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        showMessage('error', data.message || 'Failed to create academic account')
        return
      }

      setAccount(data.data)
      setCreateUsername('')
      setCreatePassword('')
      setCreateConfirmPassword('')
      showMessage('success', 'Academic account created successfully')
    } catch (error) {
      console.error('Error creating academic account:', error)
      showMessage('error', 'Failed to create academic account')
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

      const response = await fetch('http://localhost:2056/api/academic-account/password/admin', {
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
        showMessage('error', data.message || 'Failed to update academic password')
        return
      }

      setNewPassword('')
      setConfirmNewPassword('')
      showMessage('success', 'Academic password updated successfully')
    } catch (error) {
      console.error('Error updating academic password:', error)
      showMessage('error', 'Failed to update academic password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      if (!window.confirm('Are you sure you want to delete the academic account?')) {
        return
      }

      const token = localStorage.getItem('token')

      if (!token) {
        showMessage('error', 'You are not logged in')
        return
      }

      setDeleteLoading(true)

      const response = await fetch('http://localhost:2056/api/academic-account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        showMessage('error', data.message || 'Failed to delete academic account')
        return
      }

      setAccount(null)
      showMessage('success', 'Academic account deleted successfully')
    } catch (error) {
      console.error('Error deleting academic account:', error)
      showMessage('error', 'Failed to delete academic account')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="academic-loading-container">
        <div>Loading academic account...</div>
      </div>
    )
  }

  return (
    <>
      <h1 className="academic-page-title">Academic Account</h1>
      <p className="academic-page-subtitle">
        Manage the academic account for this school.
      </p>

      {message && (
        <div
          className={`academic-message ${
            message.type === 'success'
              ? 'academic-message-success'
              : 'academic-message-error'
          }`}
        >
          {message.text}
        </div>
      )}

      {account ? (
        <div className="academic-grid academic-account-grid">
          <section className="academic-card academic-account-card">
            <div className="academic-account-card-header">
              <div>
                <div className="academic-account-username">{account.username}</div>
                <div className="academic-account-meta">
                  <span>
                    School ID: <span className="academic-account-value">{account.schoolId}</span>
                  </span>
                  {account.email && (
                    <span>
                      Email: <span className="academic-account-value">{account.email}</span>
                    </span>
                  )}
                  {account.phone && (
                    <span>
                      Phone: <span className="academic-account-value">{account.phone}</span>
                    </span>
                  )}
                </div>
              </div>
              <div
                className={`academic-account-status ${
                  account.isActive ? 'academic-account-status-active' : 'academic-account-status-inactive'
                }`}
              >
                {account.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div className="academic-account-dates">
              <div>
                <span className="academic-account-label">Created</span>
                <span className="academic-account-value">
                  {account.createdAt ? new Date(account.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="academic-account-label">Last updated</span>
                <span className="academic-account-value">
                  {account.updatedAt ? new Date(account.updatedAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="academic-account-label">Last login</span>
                <span className="academic-account-value">
                  {account.lastLogin ? new Date(account.lastLogin).toLocaleString() : 'Never'}
                </span>
              </div>
            </div>
            <div className="academic-account-actions">
              <button
                type="button"
                className="academic-btn danger"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete academic account'}
              </button>
            </div>
          </section>

          <section className="academic-card academic-account-password-card">
            <h2>Reset academic password</h2>
            <p>Set a new password for the academic account without needing the current password.</p>
            <div className="academic-form">
              <div className="academic-form-row">
                <label>
                  New password
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </label>
                <label>
                  Confirm new password
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                  />
                </label>
              </div>
              <div className="academic-form-actions">
                <button
                  type="button"
                  className="academic-btn primary"
                  onClick={handleUpdatePassword}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Updating...' : 'Update password'}
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <section className="academic-card academic-account-create-card">
          <h2>Create academic account</h2>
          <p>
            No academic account exists for this school yet. Create one to allow academic access.
          </p>
          <div className="academic-form">
            <div className="academic-form-row">
              <label>
                Username
                <input
                  type="text"
                  value={createUsername}
                  onChange={e => setCreateUsername(e.target.value)}
                />
              </label>
            </div>
            <div className="academic-form-row">
              <label>
                Password
                <input
                  type="password"
                  value={createPassword}
                  onChange={e => setCreatePassword(e.target.value)}
                />
              </label>
              <label>
                Confirm password
                <input
                  type="password"
                  value={createConfirmPassword}
                  onChange={e => setCreateConfirmPassword(e.target.value)}
                />
              </label>
            </div>
            <div className="academic-form-actions">
              <button
                type="button"
                className="academic-btn primary"
                onClick={handleCreateAccount}
                disabled={createLoading}
              >
                {createLoading ? 'Creating...' : 'Create academic account'}
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
