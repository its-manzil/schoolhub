'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faSyncAlt,
  faCalendarAlt,
  faRupeeSign,
  faInfoCircle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { School } from '../types';
import { calculateAmount, formatDate } from '../lib/utils';
import '../styles/modal.css';

interface ExtendSubscriptionModalProps {
  school: School | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (schoolId: string, years: number) => Promise<boolean>;
  isSubmitting: boolean;
}

export default function ExtendSubscriptionModal({ 
  school, 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting 
}: ExtendSubscriptionModalProps) {
  const [selectedYears, setSelectedYears] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  const currentExpiry = useMemo(() => {
    if (!school) return new Date();
    return new Date(school.subscription.expiryDate);
  }, [school]);

  const previewData = useMemo(() => {
    if (!school) return null;
    
    const newExpiryDate = new Date(currentExpiry);
    newExpiryDate.setFullYear(newExpiryDate.getFullYear() + selectedYears);
    
    const additionalAmount = calculateAmount(selectedYears);
    const newTotalAmount = school.subscription.amount + additionalAmount;
    
    return {
      newExpiryDate,
      additionalAmount,
      newTotalAmount,
      additionalDays: selectedYears * 365
    };
  }, [school, currentExpiry, selectedYears]);

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedYears(1);
      setShowPreview(false);
      onClose();
    }
  };

  const handleContinue = () => {
    setShowPreview(true);
  };

  const handleBack = () => {
    setShowPreview(false);
  };

  const handleConfirm = async () => {
    if (!school) return;
    const success = await onSubmit(school._id, selectedYears);
    if (success) {
      handleClose();
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
            <div className="modal-icon success">
              <FontAwesomeIcon icon={faSyncAlt} />
            </div>
            <div>
              <h2 className="modal-title">
                {showPreview ? 'Confirm Extension' : 'Extend Subscription'}
              </h2>
              <p className="modal-subtitle">{school.name}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-body">
          {!showPreview ? (
            <>
              <div className="form-group">
                <label className="form-label">
                  <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px' }} />
                  Select Extension Period
                </label>
                <select
                  className="form-select"
                  value={selectedYears}
                  onChange={(e) => setSelectedYears(parseInt(e.target.value))}
                >
                  <option value={1}>1 Year (Rs. 30,000)</option>
                  <option value={2}>2 Years (Rs. 60,000)</option>
                  <option value={3}>3 Years (Rs. 90,000)</option>
                </select>
              </div>

              <div className="amount-display">
                <FontAwesomeIcon icon={faRupeeSign} style={{ marginRight: '8px' }} />
                Additional Amount: Rs.{calculateAmount(selectedYears).toLocaleString()}
              </div>

              <div className="subscription-note">
                <FontAwesomeIcon icon={faInfoCircle} />
                <span>
                  Current expiry: {formatDate(school.subscription.expiryDate)}. 
                  The subscription will be extended by {selectedYears} year{selectedYears > 1 ? 's' : ''} from the current expiry date.
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="subscription-note" style={{ background: '#eff6ff', color: 'var(--primary)' }}>
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>Please review the extension details before confirming.</span>
              </div>

              <div className="amount-preview">
                <div className="amount-preview-row">
                  <span>School</span>
                  <span>{school.name}</span>
                </div>
                <div className="amount-preview-row">
                  <span>Current Expiry</span>
                  <span>{formatDate(school.subscription.expiryDate)}</span>
                </div>
                <div className="amount-preview-row">
                  <span>Extension Period</span>
                  <span>{selectedYears} Year{selectedYears > 1 ? 's' : ''}</span>
                </div>
                <div className="amount-preview-row">
                  <span>New Expiry Date</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                    {previewData && formatDate(previewData.newExpiryDate.toISOString())}
                  </span>
                </div>
                <div className="amount-preview-row">
                  <span>Days Added</span>
                  <span style={{ color: 'var(--success)' }}>+{previewData?.additionalDays} days</span>
                </div>
                <div className="amount-preview-row">
                  <span>Additional Amount</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    <FontAwesomeIcon icon={faRupeeSign} style={{ marginRight: '4px' }} />
                    {previewData?.additionalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="amount-preview-row total">
                  <span>New Total Revenue</span>
                  <span>
                    <FontAwesomeIcon icon={faRupeeSign} style={{ marginRight: '4px' }} />
                    {previewData?.newTotalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          {!showPreview ? (
            <>
              <button
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleContinue}
                disabled={isSubmitting}
              >
                Continue
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-secondary"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                className="btn btn-success"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                <FontAwesomeIcon icon={faCheckCircle} />
                {isSubmitting ? 'Processing...' : 'Confirm Extension'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
