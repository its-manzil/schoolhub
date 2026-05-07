// AttachmentsPanel Component
// Handles file upload and attachment management

'use client';

import React, { useState, useCallback } from 'react';
import { Paperclip, X } from 'lucide-react';

interface AttachmentsPanelProps {
  attachments: File[];
  onAttachmentsChange: (attachments: File[]) => void;
  disabled?: boolean;
}

export const AttachmentsPanel: React.FC<AttachmentsPanelProps> = React.memo(({
  attachments,
  onAttachmentsChange,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      onAttachmentsChange([...attachments, ...newFiles]);
    }
  }, [attachments, onAttachmentsChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files) {
      const newFiles = Array.from(files);
      onAttachmentsChange([...attachments, ...newFiles]);
    }
  }, [attachments, onAttachmentsChange, disabled]);

  const handleRemoveAttachment = useCallback((index: number) => {
    onAttachmentsChange(attachments.filter((_, i) => i !== index));
  }, [attachments, onAttachmentsChange]);

  return (
    <div className="ve-field-group">
      <label>Attachments</label>
      <div 
        className={`ve-file-upload ${isDragging ? 've-dragging' : ''}`}
        onClick={() => !disabled && document.getElementById('ve-file')?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}
      >
        <Paperclip size={18} />
        <p>Click to upload or drag files</p>
        <input 
          type="file" 
          style={{ display: 'none' }} 
          id="ve-file" 
          multiple
          onChange={handleFileSelect}
          disabled={disabled}
        />
      </div>
      {attachments.length > 0 && (
        <div className="ve-attachments-list">
          {attachments.map((file, index) => (
            <div key={index} className="ve-attachment-item">
              <Paperclip size={14} />
              <span>{file.name}</span>
              {!disabled && (
                <button 
                  className="ve-attachment-remove"
                  onClick={() => handleRemoveAttachment(index)}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

AttachmentsPanel.displayName = 'AttachmentsPanel';

export default AttachmentsPanel;
