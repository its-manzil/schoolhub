"use client";

import React, { useState, useEffect } from 'react';
import SchoolAdminAccountingLayout from '../components/SchoolAdminAccountingLayout';
import { Shield, Bell, Database, Eye } from 'lucide-react';
import './setting.css';
import SchoolAdminNavbar from '../../Components/SchoolAdminNavbar';

interface NotificationSettings {
  emailAlerts: boolean;
  tdsReminders: boolean;
  voucherAlerts: boolean;
}

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("security");
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailAlerts: true,
    tdsReminders: true,
    voucherAlerts: true
  });

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Check if user has accountant role
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'accountant' && userRole !== 'schooladmin') {
      setMessage({ type: 'error', text: 'Access denied. Accountant role required.' });
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  }, []);

  const handleCreateAccountant = async () => {
    if (!newPassword.trim()) {
      setMessage({ type: 'error', text: 'Password is required' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setCreateLoading(true);
    setMessage({ type: 'success', text: 'Accountant account created successfully' });
    setTimeout(() => setMessage(null), 3000);
    setNewPassword('');
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      setMessage({ type: 'error', text: 'Both passwords are required' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    // Simulate API call
    setCreateLoading(true);
    setMessage({ type: 'success', text: 'Password updated successfully' });
    setTimeout(() => setMessage(null), 3000);
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleDeleteAccountant = async () => {
    if (deletePassword !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please type DELETE to confirm' });
      return;
    }
    setDeleteLoading(true);
    setMessage({ type: 'success', text: 'Accountant account deleted successfully' });
    setTimeout(() => {
      setMessage(null);
      setShowDeleteModal(false);
      setDeletePassword('');
    }, 3000);
  };

  const handleNotificationToggle = (setting: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    setMessage({ type: 'success', text: `${String(setting)} notifications ${!notificationSettings[setting] ? 'enabled' : 'disabled'}` });
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <SchoolAdminAccountingLayout>
      <SchoolAdminNavbar />
      <div className="settings-container">
        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={20} />
            Security
          </button>
          
          <button
            className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={20} />
            Notifications
          </button>
          
          <button
            className={`tab-button ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <Database size={20} />
            Data Management
          </button>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="tab-content">
            <h2 className="tab-title">Accountant Account Management</h2>
            
            <div className="form-section">
              <h3 className="section-title">Create New Accountant</h3>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Enter password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                />
                <button 
                  onClick={handleCreateAccountant}
                  disabled={createLoading}
                  className="form-button primary"
                >
                  {createLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Update Password</h3>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="form-input"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                />
                <button 
                  onClick={handleUpdatePassword}
                  disabled={createLoading}
                  className="form-button primary"
                >
                  {createLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Delete Accountant</h3>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Type DELETE to confirm"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="form-input"
                />
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  disabled={deleteLoading}
                  className="form-button danger"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="tab-content">
            <h2 className="tab-title">Notification Settings</h2>
            
            <div className="setting-group">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={notificationSettings.emailAlerts}
                  onChange={() => handleNotificationToggle('emailAlerts')}
                  className="setting-checkbox"
                />
                Email Alerts
              </label>
              
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={notificationSettings.tdsReminders}
                  onChange={() => handleNotificationToggle('tdsReminders')}
                  className="setting-checkbox"
                />
                TDS Reminders
              </label>
              
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={notificationSettings.voucherAlerts}
                  onChange={() => handleNotificationToggle('voucherAlerts')}
                  className="setting-checkbox"
                />
                Voucher Alerts
              </label>
            </div>
          </div>
        )}

        {/* Data Management Tab */}
        {activeTab === 'data' && (
          <div className="tab-content">
            <h2 className="tab-title">Data Management</h2>
            
            <div className="data-management-grid">
              <div className="data-card">
                <h3>Database Backup</h3>
                <p>Create and restore database backups</p>
                <button className="data-button">
                  <Database size={20} />
                  Manage Backups
                </button>
              </div>
              
              <div className="data-card">
                <h3>Data Export</h3>
                <p>Export accounting data in various formats</p>
                <button className="data-button">
                  <Eye size={20} />
                  Export Data
                </button>
              </div>
              
              <div className="data-card">
                <h3>Data Import</h3>
                <p>Import data from external sources</p>
                <button className="data-button">
                  <Database size={20} />
                  Import Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirm Account Deletion</h3>
              <p>This action cannot be undone. Are you sure you want to delete this accountant account?</p>
              <div className="modal-buttons">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="modal-button cancel"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAccountant}
                  disabled={deleteLoading}
                  className="modal-button danger"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SchoolAdminAccountingLayout>
  );
};

export default SettingsPage;
