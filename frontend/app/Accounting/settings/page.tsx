"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/app/Accounting/components/Layout';
import { Shield, Bell, User, Database } from "lucide-react";
import './setting.css';

interface AccountantAccount {
  _id: string;
  username: string;
  role: string;
  schoolId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string | null;
}

interface NotificationSettings {
  emailAlerts: boolean;
  tdsReminders: boolean;
  voucherAlerts: boolean;
}

const SettingsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [accountant, setAccountant] = useState<AccountantAccount | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailAlerts: true,
    tdsReminders: true,
    voucherAlerts: false
  });

  // Token expiry check function
  const isTokenExpired = () => {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');

    if (!token) return true;

    // If no expiry stored, assume 24 hours from now (default)
    if (!tokenExpiry) {
      const expiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      localStorage.setItem('tokenExpiry', expiry.toString());
      return false;
    }

    // Parse tokenExpiry and validate it's a valid number
    const expiryTime = parseInt(tokenExpiry, 10);
    if (isNaN(expiryTime)) {
      // If invalid, set a new expiry
      const expiry = Date.now() + (24 * 60 * 60 * 1000);
      localStorage.setItem('tokenExpiry', expiry.toString());
      return false;
    }

    return Date.now() > expiryTime;
  };

  const handleAuthError = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user');
    router.push('/login');
  }, [router]);


  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Data Management State
  const [fiscalYear, setFiscalYear] = useState('2024-2025');
  const [exportLoading, setExportLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchAccountant = useCallback(async () => {
    try {
      if (isTokenExpired()) {
        handleAuthError();
        return;
      }

      const token = localStorage.getItem('token');

      if (!token) {
        showMessage('error', 'You are not logged in');
        return;
      }

      // Get user data from localStorage to extract schoolId
      const userData = localStorage.getItem('user');
      if (!userData) {
        showMessage('error', 'User data not found');
        return;
      }

      const user = JSON.parse(userData);
      if (!user.schoolId) {
        showMessage('error', 'School ID not found in user credentials');
        return;
      }

      // Fetch accountant data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/users/accountant`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 401 || response.status === 403) {
          handleAuthError();
        } else {
          showMessage('error', data.message || 'Failed to load accountant account');
        }
        return;
      }

      setAccountant(data.data);
    } catch (error) {
      console.error('Error loading accountant account:', error);
      showMessage('error', 'Failed to load accountant account');
    }
  }, [handleAuthError]);

  const fetchNotificationSettings = useCallback(async () => {
    try {
      if (isTokenExpired()) {
        handleAuthError();
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/settings/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotificationSettings(data.data);
        }
      } else if (response.status === 401 || response.status === 403) {
        handleAuthError();
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }, [handleAuthError]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchAccountant();
      await fetchNotificationSettings();
    };
    fetchData();
  }, [fetchAccountant, fetchNotificationSettings]);

  const handleChangePassword = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        showMessage('error', 'Fill all password fields');
        return;
      }

      if (newPassword !== confirmPassword) {
        showMessage('error', 'New password and confirm password do not match');
        return;
      }

      if (newPassword.length < 6) {
        showMessage('error', 'Password must be at least 6 characters');
        return;
      }

      if (isTokenExpired()) {
        handleAuthError();
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('error', 'You are not logged in');
        return;
      }

      setPasswordLoading(true);

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
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 401 || response.status === 403) {
          handleAuthError();
        } else {
          showMessage('error', data.message || 'Failed to update password');
        }
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('success', 'Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      showMessage('error', 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleNotificationChange = async (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);

    try {
      if (isTokenExpired()) {
        handleAuthError();
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/settings/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showMessage('success', 'Notification preferences updated');
        }
      } else if (response.status === 401 || response.status === 403) {
        handleAuthError();
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      showMessage('error', 'Failed to update notification preferences');
    }
  };

  const handleExportData = async () => {
    try {
      if (isTokenExpired()) {
        handleAuthError();
        return;
      }

      setExportLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('error', 'You are not logged in');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/settings/export-data`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleAuthError();
        } else {
          showMessage('error', 'Failed to export data');
        }
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `accounting_data_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showMessage('success', 'Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      showMessage('error', 'Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      if (isTokenExpired()) {
        handleAuthError();
        return;
      }

      setBackupLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('error', 'You are not logged in');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/settings/backup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleAuthError();
        } else {
          showMessage('error', 'Failed to create backup');
        }
        return;
      }

      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Backup created successfully');
      } else {
        showMessage('error', data.message || 'Failed to create backup');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      showMessage('error', 'Failed to create backup');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleFiscalYearChange = (value: string) => {
    setFiscalYear(value);
    showMessage('success', `Fiscal year changed to ${value}`);
  };

  const sidebarItems = [
    { id: "profile", label: "Profile Settings", icon: <User size={20} /> },
    { id: "security", label: "Security", icon: <Shield size={20} /> },
    { id: "notifications", label: "Notification Preferences", icon: <Bell size={20} /> },
    { id: "data", label: "Data Management", icon: <Database size={20} /> }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="acd-settings-content">
            {message && (
              <div className={`acd-message ${message.type === 'success' ? 'acd-message-success' : 'acd-message-error'}`}>
                {message.text}
              </div>
            )}
            
            {accountant && (
              <div className="acd-chart-card">
                <h2 className="acd-chart-title">Account Details</h2>
                <div className="acd-account-info">
                  <div className="acd-account-detail">
                    <strong>Username:</strong> {accountant.username}
                  </div>
                  <div className="acd-account-detail">
                    <strong>Status:</strong>
                    <span className={`acd-status ${accountant.isActive ? 'acd-status-active' : 'acd-status-inactive'}`}>
                      {accountant.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="acd-account-detail">
                    <strong>Created:</strong> {new Date(accountant.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "security":
        return (
          <div className="acd-settings-content">
            {message && (
              <div className={`acd-message ${message.type === 'success' ? 'acd-message-success' : 'acd-message-error'}`}>
                {message.text}
              </div>
            )}
            
            <div className="acd-chart-card">
              <h2 className="acd-chart-title">Change Password</h2>
              <p className="acd-td-muted">Update your account password for security.</p>
              
              <div className="acd-form">
                <div className="acd-form-row">
                  <label>
                    Current Password
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="acd-input"
                    />
                  </label>
                </div>
                <div className="acd-form-row">
                  <label>
                    New Password
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="acd-input"
                    />
                  </label>
                  <label>
                    Confirm New Password
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="acd-input"
                    />
                  </label>
                </div>
                <div className="acd-form-actions">
                  <button
                    className="acd-btn primary"
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="acd-settings-content">
            {message && (
              <div className={`acd-message ${message.type === 'success' ? 'acd-message-success' : 'acd-message-error'}`}>
                {message.text}
              </div>
            )}
            
            <div className="acd-chart-card">
              <h2 className="acd-chart-title">Notification Preferences</h2>
              <p className="acd-td-muted">Control which alerts and emails you receive for financial activities.</p>
              
              <div className="acd-notification-settings">
                <div className="acd-notification-item">
                  <div className="acd-notification-info">
                    <h3>Email Alerts</h3>
                    <p>Receive email notifications for important accounting events</p>
                  </div>
                  <label className="acd-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailAlerts}
                      onChange={(e) => handleNotificationChange('emailAlerts', e.target.checked)}
                    />
                    <span className="acd-slider"></span>
                  </label>
                </div>
                
                <div className="acd-notification-item">
                  <div className="acd-notification-info">
                    <h3>TDS Reminders</h3>
                    <p>Get reminded about TDS filing deadlines and requirements</p>
                  </div>
                  <label className="acd-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.tdsReminders}
                      onChange={(e) => handleNotificationChange('tdsReminders', e.target.checked)}
                    />
                    <span className="acd-slider"></span>
                  </label>
                </div>
                
                <div className="acd-notification-item">
                  <div className="acd-notification-info">
                    <h3>Voucher Notifications</h3>
                    <p>Receive alerts when new vouchers are created or updated</p>
                  </div>
                  <label className="acd-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.voucherAlerts}
                      onChange={(e) => handleNotificationChange('voucherAlerts', e.target.checked)}
                    />
                    <span className="acd-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case "data":
        return (
          <div className="acd-settings-content">
            {message && (
              <div className={`acd-message ${message.type === 'success' ? 'acd-message-success' : 'acd-message-error'}`}>
                {message.text}
              </div>
            )}
            
            <div className="acd-chart-card">
              <h2 className="acd-chart-title">Data Management</h2>
              <p className="acd-td-muted">Export system logs, trigger backups, and manage fiscal year settings.</p>
              
              <div className="acd-data-actions">
                <div className="acd-data-item">
                  <h3>Export Data</h3>
                  <p>Download all accounting data in CSV format</p>
                  <button 
                    className="acd-btn-outline" 
                    onClick={handleExportData}
                    disabled={exportLoading}
                  >
                    {exportLoading ? 'Exporting...' : 'Export Data'}
                  </button>
                </div>
                
                <div className="acd-data-item">
                  <h3>Backup System</h3>
                  <p>Create a complete backup of your accounting data</p>
                  <button 
                    className="acd-btn-outline" 
                    onClick={handleCreateBackup}
                    disabled={backupLoading}
                  >
                    {backupLoading ? 'Creating Backup...' : 'Create Backup'}
                  </button>
                </div>
                
                <div className="acd-data-item">
                  <h3>Fiscal Year</h3>
                  <p>Set your current fiscal year for reporting</p>
                  <select 
                    className="acd-select"
                    value={fiscalYear}
                    onChange={(e) => handleFiscalYearChange(e.target.value)}
                  >
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
    <Layout>
      
      <div className="acd-settings-layout">
        <div className="acd-settings-sidebar">
          <h2 className="acd-settings-title">Settings</h2>
          <nav className="acd-settings-nav">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                className={`acd-settings-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="acd-settings-nav-icon">{item.icon}</span>
                <span className="acd-settings-nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="acd-settings-main">
          {renderContent()}
        </div>
      </div>
    </Layout>
    </>
  );
};

export default SettingsPage;
