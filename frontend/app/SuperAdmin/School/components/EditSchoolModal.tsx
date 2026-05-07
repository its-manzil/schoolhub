'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTimes, 
  faUserShield,
  faInfoCircle,
  faSave
} from '@fortawesome/free-solid-svg-icons';
import { School, SchoolFormData } from '../types';
import '../styles/modal.css';

interface PricingConfig {
  yearly: number;
}

interface EditSchoolModalProps {
  school: School | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (schoolId: string, data: SchoolFormData) => Promise<boolean>;
  isSubmitting: boolean;
}

export default function EditSchoolModal({ 
  school, 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting 
}: EditSchoolModalProps) {
  const [formData, setFormData] = useState<SchoolFormData>({
    name: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    subscriptionYears: 1,
    adminPassword: ''
  });
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
    } finally {
      setIsLoadingPricing(false);
    }
  };

  // Calculate amount using dynamic pricing
  const calculateAmount = useCallback((years: number): number => {
    return years * pricing.yearly;
  }, [pricing]);

  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name,
        address: school.address,
        contactEmail: school.contactEmail,
        contactPhone: school.contactPhone,
        subscriptionYears: school.subscription.years,
        adminPassword: ''
      });
    }
  }, [school]);

  const handleChange = useCallback((field: keyof SchoolFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;
    
    const success = await onSubmit(school._id, formData);
    if (success) {
      onClose();
    }
  };

  if (!isOpen || !school) return null;

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
            <div className="modal-icon warning">
              <FontAwesomeIcon icon={faEdit} />
            </div>
            <div>
              <h2 className="modal-title">Edit School</h2>
              <p className="modal-subtitle">School ID: {school.schoolId}</p>
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
                Update Subscription Period <span className="required">*</span>
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
              <div className="subscription-note">
                <FontAwesomeIcon icon={faInfoCircle} />
                <span>Updating subscription will reset the start date to today and extend the expiry date accordingly.</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Reset Admin Password (Optional)
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.adminPassword}
                onChange={(e) => handleChange('adminPassword', e.target.value)}
                placeholder="Leave empty to keep current password"
              />
            </div>

            <div className="admin-note">
              <FontAwesomeIcon icon={faUserShield} />
              <span>Admin username: {school.schoolId}_admin (cannot be changed)</span>
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
              <FontAwesomeIcon icon={faSave} />
              {isSubmitting ? 'Updating...' : 'Update School'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
