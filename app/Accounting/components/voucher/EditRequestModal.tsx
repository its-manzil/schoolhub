// EditRequestModal Component
// Modal for submitting edit requests for posted vouchers

'use client';

import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { RecentVoucher } from '../../services/voucher.service';

interface EditRequestModalProps {
  isOpen: boolean;
  voucher: RecentVoucher | null;
  onClose: () => void;
  onSubmit: (voucherId: string, message: string) => Promise<void>;
}

export const EditRequestModal: React.FC<EditRequestModalProps> = React.memo(({
  isOpen,
  voucher,
  onClose,
  onSubmit
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!message.trim()) {
      setError('Please provide a reason for the edit request');
      return;
    }

    if (!voucher) {
      setError('No voucher selected');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(voucher.id, message);
      setMessage('');
      onClose();
    } catch {
      setError('Failed to submit edit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [message, voucher, onSubmit, onClose]);

  const handleClose = useCallback(() => {
    setMessage('');
    setError(null);
    onClose();
  }, [onClose]);

  if (!isOpen || !voucher) return null;

  return (
    <div className="ve-modal-overlay">
      <div className="ve-modal ve-edit-request-modal">
        <div className="ve-modal-header">
          <h3>Request Voucher Edit</h3>
          <button 
            className="ve-modal-close" 
            onClick={handleClose}
          >
            <X size={20} />
          </button>
        </div>
        <div className="ve-modal-body">
          <div className="ve-field-group">
            <label>Voucher Number</label>
            <input
              type="text"
              className="ve-input"
              value={voucher.voucherNumber}
              readOnly
            />
          </div>
          <div className="ve-field-group">
            <label>Voucher Type</label>
            <input
              type="text"
              className="ve-input"
              value={voucher.voucherType}
              readOnly
            />
          </div>
          <div className="ve-field-group">
            <label>Message / Description *</label>
            <textarea
              className="ve-textarea"
              placeholder="Explain the mistake and why modification is required..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (error) setError(null);
              }}
              rows={4}
            />
            {error && <span className="ve-field-error" style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>}
          </div>
        </div>
        <div className="ve-modal-footer">
          <button 
            className="ve-btn ve-btn-secondary" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            className="ve-btn ve-btn-primary" 
            onClick={handleSubmit}
            disabled={isSubmitting || !message.trim()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
});

EditRequestModal.displayName = 'EditRequestModal';

export default EditRequestModal;
