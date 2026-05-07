'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faTimes, 
  faEye, 
  faEyeSlash,
  faUserShield,
  faInfoCircle,
  faSchool,
  faCheckCircle,
  faCopy
} from '@fortawesome/free-solid-svg-icons';
import { SchoolFormData, AdminCredentials } from '../types';
import { generatePassword } from '../lib/utils';
import '../styles/modal.css';

interface AddSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SchoolFormData) => Promise<{ success: boolean; adminAccount?: AdminCredentials }>;
  isSubmitting: boolean;
}

const initialFormData: SchoolFormData = {
  name: '',
  address: '',
  contactEmail: '',
  contactPhone: '',
  subscriptionYears: 1,
  adminPassword: ''
};

interface PricingConfig {
  yearly: number;
}

export default function AddSchoolModal({ isOpen, onClose, onSubmit, isSubmitting }: AddSchoolModalProps) {
  const [formData, setFormData] = useState<SchoolFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<AdminCredentials | null>(null);
  const [pricing, setPricing] = useState<PricingConfig>({
    yearly: 20000
  });
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);

  // Fetch pricing on mount
  useEffect(() => {
    if (isOpen) {
      fetchPricing();
    }
  }, [isOpen]);

  const fetchPricing = async () => {
    setIsLoadingPricing(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/schools/pricing/public`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.rates) {
          setPricing({ yearly: data.data.rates.yearly || 20000 });
        }
      }
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
      // Use default pricing on error
    } finally {
      setIsLoadingPricing(false);
    }
  };

  // Calculate amount using dynamic pricing
  const calculateAmount = useCallback((years: number): number => {
    return years * pricing.yearly;
  }, [pricing]);

  const handleChange = useCallback((field: keyof SchoolFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleGeneratePassword = useCallback(() => {
    const password = generatePassword(formData.name);
    setFormData(prev => ({ ...prev, adminPassword: password }));
  }, [formData.name]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setFormData(initialFormData);
      setShowCredentials(false);
      setCredentials(null);
      onClose();
    }
  }, [isSubmitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onSubmit(formData);
    if (result.success && result.adminAccount) {
      setCredentials(result.adminAccount);
      setShowCredentials(true);
    }
  };

  const handleCredentialsClose = () => {
    setShowCredentials(false);
    setCredentials(null);
    setFormData(initialFormData);
    onClose();
  };

  if (!isOpen) return null;

  // Show credentials view after successful creation
  if (showCredentials && credentials) {
    return (
      <div className="modal-overlay" onClick={handleCredentialsClose}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div className="modal-title-section">
              <div className="modal-icon success">
                <FontAwesomeIcon icon={faSchool} />
              </div>
              <div>
                <h2 className="modal-title">School Created!</h2>
                <p className="modal-subtitle">Save these credentials securely</p>
              </div>
            </div>
          </div>

          <div className="modal-body">
            <div className="credentials-container">
              <div className="credential-item">
                <div className="credential-label">Admin Username</div>
                <div className="credential-value-row">
                  <span className="credential-value">{credentials.username}</span>
                  <CopyButton text={credentials.username} />
                </div>
              </div>

              <div className="credential-item">
                <div className="credential-label">Password</div>
                <div className="credential-value-row">
                  <span className="credential-value">{credentials.password}</span>
                  <CopyButton text={credentials.password} />
                </div>
              </div>

              <div className="credential-item">
                <div className="credential-label">Email</div>
                <div className="credential-value-row">
                  <span className="credential-value">{credentials.email}</span>
                  <CopyButton text={credentials.email} />
                </div>
              </div>
            </div>

            <div className="credentials-warning">
              <FontAwesomeIcon icon={faInfoCircle} />
              <span>These credentials will not be shown again. Please save them securely.</span>
            </div>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-primary"
              onClick={handleCredentialsClose}
            >
              I&apos;ve Saved the Credentials
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-section">
            <div className="modal-icon primary">
              <FontAwesomeIcon icon={faPlus} />
            </div>
            <div>
              <h2 className="modal-title">Add New School</h2>
              <p className="modal-subtitle">Create a new school with admin account</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">
                School Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter school name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Address <span className="required">*</span>
              </label>
              <textarea
                className="form-textarea"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Enter complete address"
                rows={3}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Contact Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  placeholder="Enter contact email"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Contact Phone <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  placeholder="Enter contact phone"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Subscription Period <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={formData.subscriptionYears}
                onChange={(e) => handleChange('subscriptionYears', parseInt(e.target.value))}
                required
                disabled={isLoadingPricing}
              >
                <option value={1}>1 Year (Rs. {pricing.yearly.toLocaleString()})</option>
                <option value={2}>2 Years (Rs. {(pricing.yearly * 2).toLocaleString()})</option>
                <option value={3}>3 Years (Rs. {(pricing.yearly * 3).toLocaleString()})</option>
              </select>
              <div className="amount-display">
                Total Amount: Rs.{calculateAmount(formData.subscriptionYears).toLocaleString()}
                {isLoadingPricing && <span className="loading-text"> (Loading pricing...)</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={formData.adminPassword}
                  onChange={(e) => handleChange('adminPassword', e.target.value)}
                  placeholder="Leave empty for auto-generated password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              <div className="password-actions">
                <button
                  type="button"
                  className="generate-password-btn"
                  onClick={handleGeneratePassword}
                >
                  Generate Strong Password
                </button>
                <span className="password-note">
                  {formData.adminPassword ? 'Using custom password' : 'Will auto-generate: [schoolname]####'}
                </span>
              </div>
            </div>

            <div className="admin-note">
              <FontAwesomeIcon icon={faUserShield} />
              <span>Admin username will be automatically set to: [schoolId]_admin</span>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create School'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Helper component for copy button
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button 
      type="button"
      className={`copy-btn ${copied ? 'copied' : ''}`}
      onClick={handleCopy}
    >
      <FontAwesomeIcon icon={copied ? faCheckCircle : faCopy} />
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
