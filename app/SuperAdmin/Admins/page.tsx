'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Lock, UserCheck, UserX, Shield, MoreHorizontal } from 'lucide-react';
import './styles/admins.css';
import Toast, { ToastMessage } from './components/Toast';
import ChangePasswordModal from './components/ChangePasswordModal';
import PermissionsModal from './components/PermissionsModal';
import ConfirmationModal from './components/ConfirmationModal';
import SuperAdminNavbar from '../components/SuperAdminNavbar';

interface SchoolAdmin {
  _id: string;
  username: string;
  email: string;
  role: string;
  schoolId: number;
  schoolName: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056';

export default function AdminsPage() {
  const [admins, setAdmins] = useState<SchoolAdmin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<SchoolAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modal states
  const [passwordModalAdmin, setPasswordModalAdmin] = useState<SchoolAdmin | null>(null);
  const [permissionsModalAdmin, setPermissionsModalAdmin] = useState<SchoolAdmin | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => Promise<void>;
    variant: 'danger' | 'warning' | 'success';
  } | null>(null);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchAdmins = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/api/superadmin/admins`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        }
        throw new Error('Failed to fetch school admins');
      }

      const result = await response.json();
      if (result.success) {
        setAdmins(result.data);
        setFilteredAdmins(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch school admins');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      addToast('error', err instanceof Error ? err.message : 'Failed to fetch admins');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Filter and search
  useEffect(() => {
    let filtered = [...admins];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (admin) =>
          admin.username.toLowerCase().includes(query) ||
          admin.email.toLowerCase().includes(query) ||
          admin.schoolName.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((admin) =>
        statusFilter === 'active' ? admin.isActive : !admin.isActive
      );
    }

    setFilteredAdmins(filtered);
  }, [admins, searchQuery, statusFilter]);

  const handleChangePassword = async (newPassword: string) => {
    if (!passwordModalAdmin) return;

    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');

    const response = await fetch(
      `${API_URL}/api/superadmin/admins/${passwordModalAdmin._id}/password`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      }
    );

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || 'Failed to change password');
    }

    addToast('success', 'Password updated successfully');
  };

  const handleToggleStatus = async (admin: SchoolAdmin) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');

    const newStatus = !admin.isActive;
    const response = await fetch(
      `${API_URL}/api/superadmin/admins/${admin._id}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      }
    );

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || 'Failed to update status');
    }

    // Update local state
    setAdmins((prev) =>
      prev.map((a) =>
        a._id === admin._id ? { ...a, isActive: newStatus, updatedAt: new Date().toISOString() } : a
      )
    );

    addToast('success', `Admin ${newStatus ? 'activated' : 'deactivated'} successfully`);
  };

  const handleUpdatePermissions = async (permissions: string[]) => {
    if (!permissionsModalAdmin) return;

    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');

    const response = await fetch(
      `${API_URL}/api/superadmin/admins/${permissionsModalAdmin._id}/permissions`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permissions }),
      }
    );

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || 'Failed to update permissions');
    }

    // Update local state
    setAdmins((prev) =>
      prev.map((a) =>
        a._id === permissionsModalAdmin._id
          ? { ...a, permissions, updatedAt: new Date().toISOString() }
          : a
      )
    );

    addToast('success', 'Permissions updated successfully');
  };

  const showDeactivateConfirm = (admin: SchoolAdmin) => {
    const isDeactivating = admin.isActive;
    setConfirmModal({
      isOpen: true,
      title: isDeactivating ? 'Deactivate Admin?' : 'Activate Admin?',
      message: `Are you sure you want to ${isDeactivating ? 'deactivate' : 'activate'} admin "${admin.username}"?`,
      confirmText: isDeactivating ? 'Deactivate' : 'Activate',
      onConfirm: () => handleToggleStatus(admin),
      variant: isDeactivating ? 'danger' : 'success',
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="admins-page">
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading school admins...</p>
        </div>
      </div>
    );
  }

  if (error && admins.length === 0) {
    return (
      <div className="admins-page">
        <div className="error-container">
          <h3 className="error-title">Error Loading Data</h3>
          <p className="error-description">{error}</p>
          <button className="btn btn-primary" onClick={fetchAdmins}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <SuperAdminNavbar />
    <div className="admins-page">
      
      <Toast toasts={toasts} onRemove={removeToast} />

      <div className="page-header">
        <div>
          <h1 className="page-title">School Admin Management</h1>
          <p className="page-subtitle">Manage all school administrators and their permissions</p>
        </div>
      </div>

      <div className="search-filter-section">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by username, email, or school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="filter-dropdown"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="table-container">
        {filteredAdmins.length === 0 ? (
          <div className="empty-state">
            <MoreHorizontal className="empty-icon" />
            <h3 className="empty-title">No admins found</h3>
            <p className="empty-description">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'There are no school admins in the system yet'}
            </p>
          </div>
        ) : (
          <table className="admins-table">
            <thead>
              <tr>
                <th>Admin</th>
                <th>School</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((admin) => (
                <tr key={admin._id}>
                  <td>
                    <div className="user-info">
                      <span className="username">{admin.username}</span>
                      <span className="email">{admin.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="school-info">
                      <span className="school-name">{admin.schoolName}</span>
                      <span className="school-id">ID: {admin.schoolId}</span>
                    </div>
                  </td>
                  <td>
                    <span className="role-badge">{admin.role}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${admin.isActive ? 'active' : 'inactive'}`}>
                      <span className="status-dot" />
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span className={`last-login ${!admin.lastLogin ? 'never' : ''}`}>
                      {formatDate(admin.lastLogin)}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setPasswordModalAdmin(admin)}
                        title="Change Password"
                      >
                        <Lock size={14} />
                        Password
                      </button>
                      <button
                        className={`btn btn-sm ${admin.isActive ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => showDeactivateConfirm(admin)}
                        title={admin.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {admin.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        {admin.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setPermissionsModalAdmin(admin)}
                        title="Manage Permissions"
                      >
                        <Shield size={14} />
                        Permissions
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {passwordModalAdmin && (
        <ChangePasswordModal
          admin={{
            _id: passwordModalAdmin._id,
            username: passwordModalAdmin.username,
            email: passwordModalAdmin.email,
          }}
          onClose={() => setPasswordModalAdmin(null)}
          onConfirm={handleChangePassword}
        />
      )}

      {permissionsModalAdmin && (
        <PermissionsModal
          admin={{
            _id: permissionsModalAdmin._id,
            username: permissionsModalAdmin.username,
            email: permissionsModalAdmin.email,
            permissions: permissionsModalAdmin.permissions,
          }}
          onClose={() => setPermissionsModalAdmin(null)}
          onConfirm={handleUpdatePermissions}
        />
      )}

      {confirmModal?.isOpen && (
        <ConfirmationModal
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.onConfirm}
          variant={confirmModal.variant}
        />
      )}
    </div>
    </>
  );
}
