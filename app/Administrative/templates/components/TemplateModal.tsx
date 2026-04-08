"use client";

import React from 'react';
import TemplateForm from './TemplateForm';
import { Template } from '../types';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: Template;
  onSubmit: (template: Omit<Template, '_id'> & { file?: File }) => Promise<void>;
  isLoading?: boolean;
}

export default function TemplateModal({ 
  isOpen, 
  onClose, 
  template, 
  onSubmit, 
  isLoading 
}: TemplateModalProps) {
  if (!isOpen) return null;

  const handleSubmit = async (templateData: Omit<Template, '_id'> & { file?: File }) => {
    await onSubmit(templateData);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className="modal-content">
          <TemplateForm
            template={template}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
