'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import AcademicNavbar from '../components/AcademicNavbar'
import './setting.css'

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

interface UserData {
  _id: string
  username: string
  email: string | null
  phone: string | null
  role: string
  schoolId: number
  createdAt?: string
  lastLogin?: string | null
}

type TabType = 'overview' | 'security' | 'account' | 'system' | 'activity'

export default function AcademicSettingPage() {
  const pathname = usePathname()
  const isSchoolAdminContext = pathname?.startsWith('/SchoolAdmin/Academics')
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    const userDataStr = localStorage.getItem('user')
    if (userDataStr) {
      try {
        const parsed = JSON.parse(userDataStr)
        setUserData(parsed)
      } catch {
        setUserData(null)
      }
    }
  }, [])

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'security', label: 'Security' },
    { id: 'account', label: 'Account' },
    { id: 'system', label: 'System Info' },
    { id: 'activity', label: 'Activity' }
  ]

  return (
    <div className="academic-layout">
      <AcademicNavbar />
      <main className="academic-main">
        <div className="setting-container">
          <header className="setting-header">
            <h1 className="setting-title">Academic Settings</h1>
            <p className="setting-subtitle">
              Manage your academic account, security and system information
            </p>
          </header>

          <nav className="setting-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`setting-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="setting-content">
            {activeTab === 'overview' && <OverviewSection userData={userData} />}
            {activeTab === 'security' && (
              isSchoolAdminContext ? (
                <SchoolAdminSecuritySection />
              ) : (
                <AcademicSelfPasswordSection />
              )
            )}
            {activeTab === 'account' && <AccountSection userData={userData} />}
            {activeTab === 'system' && <SystemInfoSection userData={userData} />}
            {activeTab === 'activity' && <ActivitySection userData={userData} />}
          </div>

          {isSchoolAdminContext && (
            <div className="setting-admin-section">
              <h2 className="setting-section-title">Academic Account Management</h2>
              <SchoolAdminAcademicAccountSection />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// SECTION 1: OVERVIEW
function OverviewSection({ userData }: { userData: UserData | null }) {
  const [account, setAccount] = useState<AcademicAccount | null>(null)

  useEffect(() => {
    const fetchAccountStatus = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch('http://localhost:2056/api/academic-account', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) {
          setAccount(data.data)
        }
      } catch {
        setAccount(null)
      }
    }
    fetchAccountStatus()
  }, [])

  const cards = [
    {
      title: 'Account Status',
      value: account?.isActive ? 'Active' : 'Inactive',
      icon: 'status',
      status: account?.isActive ? 'success' : 'warning'
    },
    {
      title: 'Role',
      value: userData?.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : 'Academic',
      icon: 'role',
      status: 'info'
    },
    {
      title: 'School ID',
      value: userData?.schoolId?.toString() || 'N/A',
      icon: 'school',
      status: 'info'
    },
    {
      title: 'Last Login',
      value: account?.lastLogin
        ? new Date(account.lastLogin).toLocaleDateString()
        : userData?.lastLogin
          ? new Date(userData.lastLogin).toLocaleDateString()
          : 'Never',
      icon: 'time',
      status: 'info'
    }
  ]

  return (
    <section className="setting-section">
      <h2 className="setting-section-title">Dashboard Overview</h2>
      <div className="setting-grid">
        {cards.map((card, index) => (
          <div key={index} className="setting-card">
            <div className="setting-card-header">
              <span className={`setting-card-icon ${card.icon}`}></span>
              <span className={`setting-badge ${card.status}`}>{card.status}</span>
            </div>
            <div className="setting-card-body">
              <h3 className="setting-card-title">{card.title}</h3>
              <p className="setting-card-value">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// SECTION 2: SECURITY - Academic Self
function AcademicSelfPasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [lastPasswordChange, setLastPasswordChange] = useState<string | null>(null)

  useEffect(() => {
    const userDataStr = localStorage.getItem('user')
    if (userDataStr) {
      try {
        const user = JSON.parse(userDataStr)
        if (user.updatedAt) {
          setLastPasswordChange(new Date(user.updatedAt).toLocaleDateString())
        }
      } catch {
        setLastPasswordChange(null)
      }
    }
  }, [])

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

      if (newPassword.length < 6) {
        showMessage('error', 'Password must be at least 6 characters')
        return
      }

      const response = await fetch('http://localhost:2056/api/academic-account/password/self', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        showMessage('error', data.message || 'Failed to update password')
        return
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setLastPasswordChange(new Date().toLocaleDateString())
      showMessage('success', 'Password updated successfully')
    } catch (error) {
      console.error('Error updating password for academic account:', error)
      showMessage('error', 'Failed to update password')
    }
  }

  return (
    <section className="setting-section">
      <h2 className="setting-section-title">Security Settings</h2>

      <div className="setting-card setting-security-card">
        <h3>Change Password</h3>
        <p className="setting-hint">
          Academic account must provide current and new password to update.
        </p>

        <div className="setting-form">
          <div className="setting-form-row">
            <label>
              Current password
              <input
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </label>
            <label>
              New password
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </label>
          </div>
          <div className="setting-form-row">
            <label>
              Confirm new password
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </label>
          </div>

          <div className="setting-password-hint">
            <span className="setting-hint-icon">i</span>
            <span>Password must be at least 6 characters long</span>
          </div>

          <div className="setting-form-actions">
            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={e => setShowPasswords(e.target.checked)}
              />
              <span>Show passwords</span>
            </label>
            <button className="setting-btn primary" onClick={handleChangePassword}>
              Update password
            </button>
          </div>

          {lastPasswordChange && (
            <p className="setting-last-change">
              Last password change: {lastPasswordChange}
            </p>
          )}

          {message && (
            <div className={`setting-message ${message.type}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// SECTION 2: SECURITY - School Admin
function SchoolAdminSecuritySection() {
  return (
    <section className="setting-section">
      <h2 className="setting-section-title">Security Settings</h2>
      <div className="setting-card">
        <p className="setting-text-muted">
          Security settings for school admin are managed through the Account Management section below.
        </p>
      </div>
    </section>
  )
}

// SECTION 3: ACCOUNT (READ-ONLY)
function AccountSection({ userData }: { userData: UserData | null }) {
  const [account, setAccount] = useState<AcademicAccount | null>(null)

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch('http://localhost:2056/api/academic-account', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) {
          setAccount(data.data)
        }
      } catch {
        setAccount(null)
      }
    }
    fetchAccount()
  }, [])

  const displayData = account || userData

  const fields = [
    { label: 'Username', value: displayData?.username || 'N/A', icon: 'user' },
    { label: 'Email', value: displayData?.email || 'Not provided', icon: 'email' },
    { label: 'Phone', value: displayData?.phone || 'Not provided', icon: 'phone' },
    {
      label: 'Account Created',
      value: displayData?.createdAt
        ? new Date(displayData.createdAt).toLocaleDateString()
        : 'N/A',
      icon: 'calendar'
    }
  ]

  return (
    <section className="setting-section">
      <h2 className="setting-section-title">Account Information</h2>
      <p className="setting-section-subtitle">View your account details (read-only)</p>

      <div className="setting-card setting-account-card">
        <div className="setting-account-list">
          {fields.map((field, index) => (
            <div key={index} className="setting-account-item">
              <span className={`setting-account-icon ${field.icon}`}></span>
              <div className="setting-account-details">
                <span className="setting-account-label-text">{field.label}</span>
                <span className="setting-account-value-text">{field.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// SECTION 4: SYSTEM INFO
function SystemInfoSection({ userData }: { userData: UserData | null }) {
  const systemInfo = [
    { label: 'School ID', value: userData?.schoolId?.toString() || 'N/A', type: 'text' },
    { label: 'Role', value: userData?.role || 'academic', type: 'badge' },
    { label: 'Environment', value: 'Development', type: 'badge' },
    { label: 'API Status', value: 'Active', type: 'status' },
    { label: 'Version', value: 'v1.0.0', type: 'text' }
  ]

  return (
    <section className="setting-section">
      <h2 className="setting-section-title">System Information</h2>

      <div className="setting-card setting-system-card">
        <div className="setting-system-grid">
          {systemInfo.map((info, index) => (
            <div key={index} className="setting-system-item">
              <span className="setting-system-label">{info.label}</span>
              {info.type === 'status' ? (
                <span className="setting-badge active">{info.value}</span>
              ) : info.type === 'badge' ? (
                <span className="setting-badge info">{info.value}</span>
              ) : (
                <span className="setting-system-value">{info.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// SECTION 5: ACTIVITY
function ActivitySection({ userData }: { userData: UserData | null }) {
  const [account, setAccount] = useState<AcademicAccount | null>(null)

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch('http://localhost:2056/api/academic-account', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) {
          setAccount(data.data)
        }
      } catch {
        setAccount(null)
      }
    }
    fetchAccount()
  }, [])

  const activities = [
    {
      event: 'Account Created',
      date: account?.createdAt
        ? new Date(account.createdAt).toLocaleString()
        : userData?.createdAt
          ? new Date(userData.createdAt).toLocaleString()
          : 'N/A',
      icon: 'create',
      type: 'success'
    },
    {
      event: 'Last Login',
      date: account?.lastLogin
        ? new Date(account.lastLogin).toLocaleString()
        : userData?.lastLogin
          ? new Date(userData.lastLogin).toLocaleString()
          : 'Never',
      icon: 'login',
      type: 'info'
    },
    {
      event: 'Password Updated',
      date: account?.updatedAt
        ? new Date(account.updatedAt).toLocaleString()
        : 'Not recorded',
      icon: 'password',
      type: 'warning'
    }
  ]

  return (
    <section className="setting-section">
      <h2 className="setting-section-title">Activity Log</h2>

      <div className="setting-card setting-activity-card">
        <div className="setting-activity-list">
          {activities.map((activity, index) => (
            <div key={index} className="setting-activity-item">
              <div className={`setting-activity-icon ${activity.type}`}>
                <span>{activity.icon.charAt(0).toUpperCase()}</span>
              </div>
              <div className="setting-activity-details">
                <span className="setting-activity-event">{activity.event}</span>
                <span className="setting-activity-date">{activity.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ADMIN: School Admin Academic Account Management
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

        const username = `acad_${user.schoolId}`
        setCreateUsername(username)

        const response = await fetch('http://localhost:2056/api/academic-account', {
          headers: { Authorization: `Bearer ${token}` }
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
        showMessage('error', 'Username and password fields are required')
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
        body: JSON.stringify({ password: createPassword })
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
        body: JSON.stringify({ newPassword })
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
        headers: { Authorization: `Bearer ${token}` }
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
      <div className="setting-loading-container">
        <div>Loading academic account...</div>
      </div>
    )
  }

  return (
    <div className="setting-admin-content">
      {message && (
        <div className={`setting-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {account ? (
        <div className="setting-admin-grid">
          <section className="setting-card setting-admin-card">
            <div className="setting-admin-card-header">
              <div>
                <div className="setting-admin-username">{account.username}</div>
                <div className="setting-admin-meta">
                  <span>School ID: <strong>{account.schoolId}</strong></span>
                  {account.email && <span>Email: <strong>{account.email}</strong></span>}
                  {account.phone && <span>Phone: <strong>{account.phone}</strong></span>}
                </div>
              </div>
              <span className={`setting-badge ${account.isActive ? 'active' : 'inactive'}`}>
                {account.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="setting-admin-dates">
              <div>
                <span className="setting-admin-date-label">Created</span>
                <span>{account.createdAt ? new Date(account.createdAt).toLocaleString() : 'N/A'}</span>
              </div>
              <div>
                <span className="setting-admin-date-label">Last updated</span>
                <span>{account.updatedAt ? new Date(account.updatedAt).toLocaleString() : 'N/A'}</span>
              </div>
              <div>
                <span className="setting-admin-date-label">Last login</span>
                <span>{account.lastLogin ? new Date(account.lastLogin).toLocaleString() : 'Never'}</span>
              </div>
            </div>
          </section>

          <section className="setting-card">
            <h3>Reset Academic Password</h3>
            <p className="setting-hint">Set a new password for the academic account without needing the current password.</p>
            <div className="setting-form">
              <div className="setting-form-row">
                <label>
                  New password
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </label>
                <label>
                  Confirm new password
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </label>
              </div>
              <div className="setting-form-actions">
                <button
                  className="setting-btn primary"
                  onClick={handleUpdatePassword}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Updating...' : 'Update password'}
                </button>
              </div>
            </div>
          </section>

          <section className="setting-card setting-danger-zone">
            <h3>Danger Zone</h3>
            <p className="setting-danger-text">
              Once you delete the academic account, there is no going back. Please be certain.
            </p>
            <div className="setting-form-actions">
              <button
                className="setting-btn danger"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete academic account'}
              </button>
            </div>
          </section>
        </div>
      ) : (
        <section className="setting-card">
          <h3>Create Academic Account</h3>
          <p className="setting-hint">
            No academic account exists for this school yet. Create one to allow academic access.
          </p>
          <div className="setting-form">
            <div className="setting-form-row">
              <div className="setting-username-display">
                <strong>Username:</strong> {createUsername}
              </div>
            </div>
            <div className="setting-form-row">
              <label>
                Password
                <input
                  type="password"
                  value={createPassword}
                  onChange={e => setCreatePassword(e.target.value)}
                  placeholder="Enter password"
                />
              </label>
              <label>
                Confirm password
                <input
                  type="password"
                  value={createConfirmPassword}
                  onChange={e => setCreateConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                />
              </label>
            </div>
            <div className="setting-form-actions">
              <button
                className="setting-btn primary"
                onClick={handleCreateAccount}
                disabled={createLoading}
              >
                {createLoading ? 'Creating...' : 'Create academic account'}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
