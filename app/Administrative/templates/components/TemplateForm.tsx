"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Upload, X, File } from 'lucide-react';
import { Template } from '../types';

// Fixed categories and their types
const CATEGORIES = {
  'Academic': ['Report Card', 'Lesson Plan', 'Progress Report'],
  'Administrative': ['ID Card', 'Certificate', 'Letterhead'],
  'Finance': ['Receipt', 'Salary Slip'],
  'General': ['Certificate', 'Newsletter']
};

interface TemplateFormProps {
  template?: Template;
  onSubmit: (template: Omit<Template, '_id'> & { file?: File }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TemplateForm({ template, onSubmit, onCancel, isLoading }: TemplateFormProps) {
  const [formData, setFormData] = useState<Template>({
    name: template?.name || '',
    category: template?.category || 'Academic',
    type: template?.type || '',
    fileName: template?.fileName || '',
    fileType: template?.fileType || '',
    fileSize: template?.fileSize || 0
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update available types when category changes
  const availableTypes = useMemo(() => {
    return CATEGORIES[formData.category as keyof typeof CATEGORIES] || [];
  }, [formData.category]);

  // Reset type when category changes if current type is not valid for new category
  useEffect(() => {
    if (!availableTypes.includes(formData.type)) {
      setFormData(prev => ({ ...prev, type: '' }));
    }
  }, [formData.category, availableTypes, formData.type]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    if (!template && !selectedFile) {
      newErrors.file = 'Template file is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({ ...formData, file: selectedFile || undefined });
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];

      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, file: 'Invalid file type. Only PDF, DOC, DOCX, and image files are allowed.' }));
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'File size must be less than 10MB.' }));
        return;
      }

      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      }));

      // Clear file error
      if (errors.file) {
        setErrors(prev => ({ ...prev, file: '' }));
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFormData(prev => ({
      ...prev,
      fileName: '',
      fileType: '',
      fileSize: 0
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="template-form">
      <div className="form-header">
        <h2>{template ? 'Edit Template' : 'Create New Template'}</h2>
        <button type="button" onClick={onCancel} className="close-btn">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Template Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter template name..."
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={errors.category ? 'error' : ''}
            >
              {Object.keys(CATEGORIES).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className={errors.type ? 'error' : ''}
              disabled={!formData.category}
            >
              <option value="">Select type...</option>
              {availableTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.type && <span className="error-message">{errors.type}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Template File *</label>
          <div className="file-upload">
            {(selectedFile || template?.fileName) ? (
              <div className="file-preview">
                <div className="file-info">
                  <File size={24} className="file-icon" />
                  <div className="file-details">
                    <p className="file-name">{selectedFile?.name || template?.fileName}</p>
                    <p className="file-meta">
                      {selectedFile?.type || template?.fileType} 
                      {' '} 
                      ({selectedFile ? formatFileSize(selectedFile.size) : formatFileSize(template?.fileSize || 0)})
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={removeFile}
                  className="remove-file"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="upload-area">
                <input
                  type="file"
                  id="templateFile"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="templateFile" className="upload-label">
                  <Upload size={24} />
                  <span>Upload Template File</span>
                  <small>PDF, DOC, DOCX, JPG, PNG, GIF up to 10MB</small>
                </label>
              </div>
            )}
            {errors.file && <span className="error-message">{errors.file}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="btn-cancel"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                {template ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <FileText size={16} />
                {template ? 'Update Template' : 'Create Template'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
