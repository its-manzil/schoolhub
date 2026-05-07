'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCopy, faExclamationTriangle, faSchool, faEnvelope, faUser, faKey } from '@fortawesome/free-solid-svg-icons';
import { AdminCredentials } from '../../../types';
import '../../../styles/superadmin/school/success-view.css';

interface SuccessCredentialsViewProps {
  credentials: AdminCredentials;
  schoolName: string;
  onClose: () => void;
}

export default function SuccessCredentialsView({ credentials, schoolName, onClose }: SuccessCredentialsViewProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  return (
    <div className="success-view-container">
      {/* Success Animation */}
      <div className="success-view-animation">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="success-view-checkmark"
        >
          <FontAwesomeIcon icon={faCheck} />
        </motion.div>
        <h2 className="success-view-title">School Created Successfully!</h2>
        <p className="success-view-subtitle">
          The school has been added to the system with {credentials.note?.includes('trial') ? 'trial access' : 'active subscription'}.
        </p>
      </div>

      {/* Warning Banner */}
      <div className="success-view-warning">
        <FontAwesomeIcon icon={faExclamationTriangle} className="success-view-warning-icon" />
        <p className="success-view-warning-text">
          <strong>Important:</strong> These credentials will only be shown once.
          Please copy and save them securely before closing this dialog.
        </p>
      </div>

      {/* School Summary */}
      <div className="success-view-school-summary">
        <h4 className="success-view-school-summary-title">School Details</h4>
        <p className="success-view-school-detail">
          <FontAwesomeIcon icon={faSchool} />
          {schoolName}
        </p>
        <p className="success-view-school-detail">
          <FontAwesomeIcon icon={faEnvelope} />
          {credentials.email}
        </p>
      </div>

      {/* Credentials Card */}
      <div className="success-view-credentials-card">
        <h4 className="success-view-credentials-title">Admin Login Credentials</h4>

        {/* Username */}
        <div className="success-view-credential-item">
          <div className="success-view-credential-info">
            <p className="success-view-credential-label">
              <FontAwesomeIcon icon={faUser} style={{ marginRight: '6px' }} />
              Username
            </p>
            <p className="success-view-credential-value">{credentials.username}</p>
          </div>
          <button
            className={`success-view-copy-btn ${copiedField === 'username' ? 'copied' : ''}`}
            onClick={() => handleCopy(credentials.username, 'username')}
          >
            <FontAwesomeIcon icon={copiedField === 'username' ? faCheck : faCopy} />
            {copiedField === 'username' ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Password */}
        <div className="success-view-credential-item password">
          <div className="success-view-credential-info">
            <p className="success-view-credential-label">
              <FontAwesomeIcon icon={faKey} style={{ marginRight: '6px' }} />
              Password
            </p>
            <p className="success-view-credential-value">{credentials.password}</p>
          </div>
          <button
            className={`success-view-copy-btn ${copiedField === 'password' ? 'copied' : ''}`}
            onClick={() => handleCopy(credentials.password, 'password')}
          >
            <FontAwesomeIcon icon={copiedField === 'password' ? faCheck : faCopy} />
            {copiedField === 'password' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="success-view-footer">
        <button className="success-view-btn success-view-btn-primary" onClick={onClose}>
          <FontAwesomeIcon icon={faCheck} />
          Done - I&apos;ve Saved the Credentials
        </button>
      </div>
    </div>
  );
}
