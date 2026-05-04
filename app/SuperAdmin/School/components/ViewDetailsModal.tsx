'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faSchool,
  faMapMarkerAlt,
  faEnvelope,
  faPhone,
  faUserShield,
  faCalendarAlt,
  faRupeeSign,
  faClock,
  faKey,
  faCheckCircle,
  faCopy,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { School } from '../types';
import { formatDate, formatDateTime, getStatusColor, getStatusText, copyToClipboard } from '../lib/utils';
import '../styles/modal.css';

interface ViewDetailsModalProps {
  school: School | null;
  isOpen: boolean;
  onClose: () => void;
  onResetPassword: (schoolId: string) => Promise<string | null>;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export default function ViewDetailsModal({ 
  school, 
  isOpen, 
  onClose, 
  onResetPassword,
  onShowToast 
}: ViewDetailsModalProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen || !school) return null;

  const statusColor = getStatusColor(
    school.subscription.remainingDays, 
    school.subscription.isActive, 
    school.status
  );
  const statusText = getStatusText(
    school.status || 'active',
    school.subscription.remainingDays,
    school.gracePeriodDays
  );
  const adminUsername = `${school.schoolId}_admin`;

  const handleResetPassword = async () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }

    setIsResetting(true);
    const password = await onResetPassword(school._id);
    setIsResetting(false);
    
    if (password) {
      setNewPassword(password);
      onShowToast('Password reset successfully!', 'success');
    } else {
      onShowToast('Failed to reset password', 'error');
    }
  };

  const handleCopyPassword = async () => {
    if (newPassword) {
      const success = await copyToClipboard(newPassword);
      if (success) {
        onShowToast('Password copied to clipboard!', 'success');
      }
    }
  };

  const handleCopyUsername = async () => {
    const success = await copyToClipboard(adminUsername);
    if (success) {
      onShowToast('Username copied to clipboard!', 'success');
    }
  };

  const handleClose = () => {
    setShowResetConfirm(false);
    setNewPassword(null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="modal-container large"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-section">
            <div className="modal-icon primary">
              <FontAwesomeIcon icon={faSchool} />
            </div>
            <div>
              <h2 className="modal-title">School Details</h2>
              <p className="modal-subtitle">ID: {school.schoolId}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-body">
          {/* School Information */}
          <div className="details-section">
            <h3 className="details-section-title">
              <FontAwesomeIcon icon={faSchool} />
              School Information
            </h3>
            <div className="details-grid">
              <div className="details-item full-width">
                <span className="details-label">School Name</span>
                <span className="details-value highlight">{school.name}</span>
              </div>
              <div className="details-item full-width">
                <span className="details-label">Address</span>
                <span className="details-value">
                  <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '8px', color: 'var(--gray-400)' }} />
                  {school.address}
                </span>
              </div>
              <div className="details-item">
                <span className="details-label">Contact Email</span>
                <span className="details-value">
                  <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '8px', color: 'var(--gray-400)' }} />
                  {school.contactEmail}
                </span>
              </div>
              <div className="details-item">
                <span className="details-label">Contact Phone</span>
                <span className="details-value">
                  <FontAwesomeIcon icon={faPhone} style={{ marginRight: '8px', color: 'var(--gray-400)' }} />
                  {school.contactPhone}
                </span>
              </div>
              <div className="details-item">
                <span className="details-label">Created At</span>
                <span className="details-value">{formatDate(school.createdAt)}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Last Updated</span>
                <span className="details-value">{formatDate(school.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Subscription Information */}
          <div className="details-section">
            <h3 className="details-section-title">
              <FontAwesomeIcon icon={faCalendarAlt} />
              Subscription Details
            </h3>
            <div className="details-grid">
              <div className="details-item">
                <span className="details-label">Subscription Period</span>
                <span className="details-value">{school.subscription.years} Year(s)</span>
              </div>
              <div className="details-item">
                <span className="details-label">Amount Paid</span>
                <span className="details-value highlight">
                  <FontAwesomeIcon icon={faRupeeSign} style={{ marginRight: '4px' }} />
                  {school.subscription.amount.toLocaleString()}
                </span>
              </div>
              <div className="details-item">
                <span className="details-label">Subscribed Date</span>
                <span className="details-value">{formatDate(school.subscription.subscribedDate)}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Expiry Date</span>
                <span className="details-value">{formatDate(school.subscription.expiryDate)}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Subscription Status</span>
                <span className={`details-value ${statusColor}`} style={{ fontWeight: 600 }}>
                  {statusText}
                </span>
              </div>
              {school.status === 'pending' && school.pendingUntil && (
                <div className="details-item">
                  <span className="details-label">
                    <FontAwesomeIcon icon={faClock} style={{ marginRight: '4px' }} />
                    Grace Period Ends
                  </span>
                  <span className={`details-value ${statusColor}`}>
                    {formatDate(school.pendingUntil)}
                  </span>
                </div>
              )}
              {school.status === 'active' && (
                <div className="details-item">
                  <span className="details-label">
                    <FontAwesomeIcon icon={faClock} style={{ marginRight: '4px' }} />
                    Remaining Days
                  </span>
                  <span className={`details-value ${statusColor}`}>
                    {school.subscription.remainingDays > 0 
                      ? `${school.subscription.remainingDays} days` 
                      : 'Expired'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Admin Information */}
          <div className="details-section">
            <h3 className="details-section-title">
              <FontAwesomeIcon icon={faUserShield} />
              Admin Account
            </h3>
            <div className="admin-section">
              <div className="admin-header">
                <h4 className="admin-title">Admin Credentials</h4>
                {!newPassword && (
                  <button 
                    className="reset-password-btn"
                    onClick={handleResetPassword}
                    disabled={isResetting}
                  >
                    <FontAwesomeIcon icon={faKey} />
                    {showResetConfirm ? 'Confirm Reset' : 'Reset Password'}
                  </button>
                )}
              </div>

              {showResetConfirm && !newPassword && (
                <div className="subscription-note" style={{ marginBottom: '16px' }}>
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <span>Are you sure? This will generate a new password for the admin account.</span>
                </div>
              )}

              <div className="credentials-container" style={{ marginTop: '16px' }}>
                <div className="credential-item">
                  <div className="credential-label">Username</div>
                  <div className="credential-value-row">
                    <span className="credential-value">{adminUsername}</span>
                    <button 
                      className="copy-btn"
                      onClick={handleCopyUsername}
                    >
                      <FontAwesomeIcon icon={faCopy} />
                      Copy
                    </button>
                  </div>
                </div>

                {newPassword ? (
                  <div className="credential-item" style={{ background: 'var(--success-bg)', borderColor: 'var(--success)' }}>
                    <div className="credential-label" style={{ color: 'var(--success)' }}>
                      <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '8px' }} />
                      New Password (Copy now - won&apos;t be shown again)
                    </div>
                    <div className="credential-value-row">
                      <span className="credential-value">{newPassword}</span>
                      <button 
                        className="copy-btn"
                        onClick={handleCopyPassword}
                      >
                        <FontAwesomeIcon icon={faCopy} />
                        Copy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="credential-item">
                    <div className="credential-label">Password</div>
                    <div className="credential-value-row">
                      <span className="credential-value" style={{ color: 'var(--gray-400)' }}>
                        •••••••• (Hidden for security)
                      </span>
                    </div>
                  </div>
                )}

                <div className="credential-item">
                  <div className="credential-label">Email</div>
                  <div className="credential-value-row">
                    <span className="credential-value">{school.contactEmail}</span>
                  </div>
                </div>

                {school.adminInfo?.lastLogin && (
                  <div className="credential-item">
                    <div className="credential-label">Last Login</div>
                    <div className="credential-value-row">
                      <span className="credential-value">{formatDateTime(school.adminInfo.lastLogin)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
