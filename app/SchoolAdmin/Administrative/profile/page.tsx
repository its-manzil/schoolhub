"use client";

import React, { useState, useEffect, useCallback } from 'react';
import SchoolAdminAccountingLayout from '@/app/SchoolAdmin/Accounting/components/SchoolAdminAccountingLayout';
import { Shield, Bell, User, Database, Eye, EyeOff } from "lucide-react";
import './profile.css';
import SchoolAdminNavbar from '../../Components/SchoolAdminNavbar';

interface AdministrativeAccount {
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

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [administrative, setAdministrative] = useState<AdministrativeAccount | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailAlerts: true,
    tdsReminders: true,
    voucherAlerts: false
  });

  // Profile Settings State
  const [generatedUsername, setGeneratedUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createConfirmPassword, setCreateConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchAdministrative = useCallback(async () => {
    try {
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

      // Generate username from schoolId in correct format
      const username = `adm_${user.schoolId}`;
      setGeneratedUsername(username);

      // Now fetch administrative data
      const response = await fetch('http://localhost:2056/api/users/administrative', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showMessage('error', data.message || 'Failed to load administrative account');
        return;
      }

      setAdministrative(data.data);
    } catch (error) {
      console.error('Error loading administrative account:', error);
      showMessage('error', 'Failed to load administrative account');
    }
  }, []);

  const fetchNotificationSettings = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:2056/api/settings/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotificationSettings(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchAdministrative();
      await fetchNotificationSettings();
    };
    fetchData();
  }, [fetchAdministrative, fetchNotificationSettings]);

  const handleCreateAdministrative = async () => {
    try {
      if (!generatedUsername || !createPassword || !createConfirmPassword) {
        showMessage('error', 'Password fields are required');
        return;
      }

      if (createPassword !== createConfirmPassword) {
        showMessage('error', 'Password and confirm password do not match');
        return;
      }

      if (createPassword.length < 6) {
        showMessage('error', 'Password must be at least 6 characters');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('error', 'You are not logged in');
        return;
      }

      setCreateLoading(true);

      const response = await fetch('http://localhost:2056/api/users/create-administrative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          password: createPassword
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showMessage('error', data.message || 'Failed to create administrative account');
        return;
      }

      setAdministrative(data.data);
      setCreatePassword('');
      setCreateConfirmPassword('');
      showMessage('success', 'Administrative account created successfully');
    } catch (error) {
      console.error('Error creating administrative account:', error);
      showMessage('error', 'Failed to create administrative account');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteAdministrative = async () => {
    try {
      if (!deletePassword) {
        showMessage('error', 'School admin password is required to delete administrative account');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('error', 'You are not logged in');
        return;
      }

      setDeleteLoading(true);

      const response = await fetch('http://localhost:2056/api/users/delete-administrative', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          adminPassword: deletePassword
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showMessage('error', data.message || 'Failed to delete administrative account');
        return;
      }

      setAdministrative(null);
      setDeletePassword('');
      setShowDeleteModal(false);
      showMessage('success', 'Administrative account deleted successfully');
    } catch (error) {
      console.error('Error deleting administrative account:', error);
      showMessage('error', 'Failed to delete administrative account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleChangeAdministrativePassword = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('error', 'You are not logged in');
        return;
      }

      setPasswordLoading(true);

      const response = await fetch('http://localhost:2056/api/users/change-administrative-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showMessage('error', data.message || 'Failed to update administrative password');
        return;
      }

      setNewPassword('');
      setConfirmPassword('');
      showMessage('success', 'Administrative password updated successfully');
    } catch (error) {
      console.error('Error updating administrative password:', error);
      showMessage('error', 'Failed to update administrative password');
    } finally {
      setPasswordLoading(false);
    }
  };

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

      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('error', 'You are not logged in');
        return;
      }

      setPasswordLoading(true);

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
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showMessage('error', data.message || 'Failed to update password');
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
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:2056/api/settings/notifications', {
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
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      showMessage('error', 'Failed to update notification preferences');
    }
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
            
            {administrative ? (
              <div className="acd-chart-card">
                <h2 className="acd-chart-title">Account Details</h2>
                <div className="acd-account-info">
                  <div className="acd-account-detail">
                    <strong>Username:</strong> {administrative.username}
                  </div>
                  <div className="acd-account-detail">
                    <strong>Status:</strong> 
                    <span className={`acd-status ${administrative.isActive ? 'acd-status-active' : 'acd-status-inactive'}`}>
                      {administrative.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="acd-account-detail">
                    <strong>Created:</strong> {new Date(administrative.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="acd-account-actions">
                  <h3>Change Administrative Password</h3>
                  <div className="acd-form">
                    <div className="acd-form-row">
                      <label>
                        New Password
                        <div className="acd-password-input-wrapper">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="acd-input"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            className="acd-password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </label>
                      <label>
                        Confirm New Password
                        <div className="acd-password-input-wrapper">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="acd-input"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            className="acd-password-toggle"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </label>
                    </div>
                    <div className="acd-form-actions">
                      <button
                        className="acd-btn primary"
                        onClick={() => {
                          // Handle password change for accountant (without current password)
                          if (!newPassword || !confirmPassword) {
                            showMessage('error', 'Please fill both password fields');
                            return;
                          }
                          if (newPassword !== confirmPassword) {
                            showMessage('error', 'Passwords do not match');
                            return;
                          }
                          if (newPassword.length < 6) {
                            showMessage('error', 'Password must be at least 6 characters');
                            return;
                          }
                          // Call API to change administrative password
                          handleChangeAdministrativePassword();
                        }}
                        disabled={passwordLoading}
                      >
                        {passwordLoading ? 'Updating...' : 'Change Password'}
                      </button>
                      <button
                        className="acd-btn danger"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="acd-chart-card">
                <h2 className="acd-chart-title">Create Administrative Account</h2>
                <p className="acd-td-muted">Create a new administrative account for your school.</p>
                
                <div className="acd-form">
                  <div className="acd-form-row">
                    <div className="acd-username-display">
                      <strong>Username:</strong> {generatedUsername}
                    </div>
                  </div>
                  <div className="acd-form-row">
                    <label>
                      Password
                      <div className="acd-password-input-wrapper">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={createPassword}
                          onChange={e => setCreatePassword(e.target.value)}
                          className="acd-input"
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          className="acd-password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </label>
                    <label>
                      Confirm Password
                      <div className="acd-password-input-wrapper">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={createConfirmPassword}
                          onChange={e => setCreateConfirmPassword(e.target.value)}
                          className="acd-input"
                          placeholder="Confirm password"
                        />
                        <button
                          type="button"
                          className="acd-password-toggle"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </label>
                  </div>
                  <div className="acd-form-actions">
                    <button
                      className="acd-btn primary"
                      onClick={handleCreateAdministrative}
                      disabled={createLoading}
                    >
                      {createLoading ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteModal && (
              <div className="acd-modal-overlay">
                <div className="acd-modal">
                  <h3>Delete Administrative Account</h3>
                  <p>This action cannot be undone. Please enter your school admin password to confirm.</p>
                  
                  <div className="acd-form">
                    <label>
                      School Admin Password
                      <div className="acd-password-input-wrapper">
                        <input
                          type="password"
                          value={deletePassword}
                          onChange={e => setDeletePassword(e.target.value)}
                          className="acd-input"
                          placeholder="Enter your admin password"
                        />
                      </div>
                    </label>
                    
                    <div className="acd-form-actions">
                      <button
                        className="acd-btn danger"
                        onClick={handleDeleteAdministrative}
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? 'Deleting...' : 'Delete Account'}
                      </button>
                      <button
                        className="acd-btn-outline"
                        onClick={() => {
                          setShowDeleteModal(false);
                          setDeletePassword('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
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
            <div className="acd-chart-card">
              <h2 className="acd-chart-title">Data Management</h2>
              <p className="acd-td-muted">Export system logs, trigger backups, and manage fiscal year settings.</p>
              
              <div className="acd-data-actions">
                <div className="acd-data-item">
                  <h3>Export Data</h3>
                  <p>Download all accounting data in CSV format</p>
                  <button className="acd-btn-outline">Export Data</button>
                </div>
                
                <div className="acd-data-item">
                  <h3>Backup System</h3>
                  <p>Create a complete backup of your accounting data</p>
                  <button className="acd-btn-outline">Create Backup</button>
                </div>
                
                <div className="acd-data-item">
                  <h3>Fiscal Year</h3>
                  <p>Set your current fiscal year for reporting</p>
                  <select className="acd-select">
                    <option>2024-2025</option>
                    <option>2025-2026</option>
                    <option>2026-2027</option>
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
    <SchoolAdminNavbar />
    <SchoolAdminAccountingLayout>
      
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
    </SchoolAdminAccountingLayout>
    </>
  );
};

export default ProfilePage;
