'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import '../styles/modals.css';

interface PermissionsModalProps {
  admin: {
    _id: string;
    username: string;
    email: string;
    permissions: string[];
  };
  onClose: () => void;
  onConfirm: (permissions: string[]) => Promise<void>;
}

const AVAILABLE_PERMISSIONS = [
  {
    key: 'manage_teachers',
    name: 'Manage Teachers',
    description: 'Add, edit, and remove teachers',
  },
  {
    key: 'manage_students',
    name: 'Manage Students',
    description: 'Add, edit, and remove students',
  },
  {
    key: 'manage_classes',
    name: 'Manage Classes',
    description: 'Create and manage classes and sections',
  },
  {
    key: 'view_reports',
    name: 'View Reports',
    description: 'Access and view all school reports',
  },
  {
    key: 'manage_school_settings',
    name: 'Manage School Settings',
    description: 'Modify school configuration and settings',
  },
];

export default function PermissionsModal({ admin, onClose, onConfirm }: PermissionsModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(admin.permissions || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);
    try {
      await onConfirm(selectedPermissions);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Manage Permissions</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="admin-info">
            <div className="admin-avatar">{getInitials(admin.username)}</div>
            <div className="admin-details">
              <h4>{admin.username}</h4>
              <p>{admin.email}</p>
            </div>
          </div>

          <div className="permissions-list">
            {AVAILABLE_PERMISSIONS.map((permission) => (
              <div
                key={permission.key}
                className="permission-item"
                onClick={() => togglePermission(permission.key)}
              >
                <div
                  className={`permission-checkbox ${
                    selectedPermissions.includes(permission.key) ? 'checked' : ''
                  }`}
                >
                  {selectedPermissions.includes(permission.key) && <Check size={12} />}
                </div>
                <div className="permission-info">
                  <div className="permission-name">{permission.name}</div>
                  <div className="permission-description">{permission.description}</div>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="form-error" style={{ marginTop: '16px' }}>
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Permissions'}
          </button>
        </div>
      </div>
    </div>
  );
}
