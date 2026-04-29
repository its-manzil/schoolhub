'use client';

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import '../styles/modals.css';

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  variant?: 'danger' | 'warning' | 'success';
}

export default function ConfirmationModal({
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  onClose,
  onConfirm,
  variant = 'warning',
}: ConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonClass = () => {
    switch (variant) {
      case 'danger':
        return 'btn-danger';
      case 'success':
        return 'btn-success';
      default:
        return 'btn-primary';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          <AlertTriangle className="confirmation-icon" />
          <h3 className="confirmation-title">{title}</h3>
          <p className="confirmation-message">{message}</p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </button>
          <button className={`btn ${getButtonClass()}`} onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
