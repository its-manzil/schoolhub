'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield, faEye, faEyeSlash, faMagic, faUser } from '@fortawesome/free-solid-svg-icons';
import { SchoolFormData } from '../../../types';
import '../../../styles/superadmin/school/admin-credentials.css';

interface AdminCredentialsSectionProps {
  formData: SchoolFormData;
  onChange: (field: keyof SchoolFormData, value: string) => void;
  onGeneratePassword: () => void;
  schoolName: string;
}

export default function AdminCredentialsSection({
  formData,
  onChange,
  onGeneratePassword,
  schoolName
}: AdminCredentialsSectionProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="admin-credentials-container">
      <div className="admin-credentials-header">
        <div className="admin-credentials-icon">
          <FontAwesomeIcon icon={faUserShield} />
        </div>
        <h4 className="admin-credentials-title">Admin Account Setup</h4>
      </div>

      <p className="admin-credentials-note">
        <strong>Note:</strong> An admin account will be created for this school.
        The username will be auto-generated based on the school ID.
      </p>

      {/* Password Field */}
      <div className="admin-credentials-field">
        <label className="admin-credentials-label">
          Admin Password <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div className="admin-credentials-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            className="admin-credentials-input"
            value={formData.adminPassword}
            onChange={(e) => onChange('adminPassword', e.target.value)}
            placeholder="Enter or generate password"
          />
          <button
            type="button"
            className="admin-credentials-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
          <button
            type="button"
            className="admin-credentials-generate-btn"
            onClick={onGeneratePassword}
            disabled={!schoolName}
          >
            <FontAwesomeIcon icon={faMagic} />
            Generate
          </button>
        </div>
      </div>

      {/* Username Preview */}
      <div className="admin-credentials-username">
        <span className="admin-credentials-username-label">
          <FontAwesomeIcon icon={faUser} style={{ marginRight: '6px' }} />
          Username Preview:
        </span>
        <span className="admin-credentials-username-value">
          {schoolName ? '[SchoolID]_admin' : 'Enter school name first'}
        </span>
      </div>
    </div>
  );
}

import { useState } from 'react';
