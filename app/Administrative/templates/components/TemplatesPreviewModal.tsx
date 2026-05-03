import React from 'react';
import { X, Printer, Download, FileText } from "lucide-react";
import './TemplatesPreviewModal.css';
import { Template, TemplateField } from '../types';

interface TemplatesPreviewModalProps {
  template: Template;
  onClose: () => void;
  sampleData?: { [key: string]: string };
}

export default function TemplatesPreviewModal({
  template,
  onClose,
  sampleData = {}
}: TemplatesPreviewModalProps) {
  const getFieldValue = (key: string): string => {
    // First check if sample data is provided
    if (sampleData[key]) {
      return sampleData[key];
    }

    // Default sample data
    const defaultValues: { [key: string]: string } = {
      'student.name': 'John Doe',
      'student.class': 'Grade 10',
      'student.roll': '12345',
      'student.section': 'A',
      'school.name': 'Sample School',
      'school.address': '123 Education Street, Kathmandu',
      'school.phone': '+977-1234567890',
      'school.logo': 'Logo',
      'fee.amount': 'Rs. 5,000',
      'fee.month': 'January 2024',
      'certificate.title': 'Academic Excellence',
      'letter.content': 'This is to certify that the above-named student has successfully completed all requirements.',
      'custom.text': 'Custom Text Content',
      'qrcode': 'QR'
    };

    return defaultValues[key] || `[${key}]`;
  };

  const getFieldStyle = (field: TemplateField): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${field.x}px`,
      top: `${field.y}px`,
      fontSize: `${field.fontSize}px`,
      color: field.color,
      fontWeight: field.bold ? 'bold' : 'normal',
      fontFamily: 'var(--font-family-istok)',
      textAlign: field.align,
    };

    if (field.fieldType === 'text') {
      return {
        ...baseStyle,
        padding: '4px 8px',
        backgroundColor: 'transparent',
        whiteSpace: 'nowrap',
      };
    } else if (field.fieldType === 'image') {
      return {
        ...baseStyle,
        width: `${field.width || 80}px`,
        height: `${field.height || 100}px`,
        border: '2px solid #3B82F6',
        borderRadius: '4px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#3B82F6',
        fontSize: '12px',
        fontWeight: '600',
      };
    } else if (field.fieldType === 'qrcode') {
      return {
        ...baseStyle,
        width: `${field.width || 80}px`,
        height: `${field.height || 80}px`,
        border: '2px solid #8B5CF6',
        borderRadius: '4px',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8B5CF6',
        fontSize: '12px',
        fontWeight: '600',
      };
    }

    return baseStyle;
  };

  const getTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      'id_card': 'ID Card',
      'letterpad': 'Letterpad',
      'bill': 'Bill',
      'certificate': 'Certificate'
    };
    return labels[type] || type;
  };

  return (
    <div className="templates-preview-modal-overlay" onClick={onClose}>
      <div className="templates-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preview-modal-header">
          <div className="preview-header-left">
            <FileText size={20} aria-hidden="true" role="img" />
            <div className="preview-title">
              <h3>{template.name}</h3>
              <span className="preview-type">{getTypeLabel(template.type)}</span>
            </div>
          </div>
          <button className="preview-close-btn" onClick={onClose}>
            <X size={20} aria-hidden="true" role="img" />
          </button>
        </div>

        <div className="preview-modal-content">
          <div className="preview-canvas-wrapper">
            <div
              className="preview-canvas"
              style={{
                width: template.canvasSize.width,
                height: template.canvasSize.height,
                backgroundImage: `url(${template.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {template.fields.map((field) => (
                <div
                  key={field.key}
                  className={`preview-field preview-field--${field.fieldType}`}
                  style={getFieldStyle(field)}
                >
                  {field.fieldType === 'text' ? (
                    getFieldValue(field.key)
                  ) : field.fieldType === 'image' ? (
                    <div className="preview-placeholder">
                      <span>{getFieldValue(field.key)}</span>
                    </div>
                  ) : (
                    <div className="preview-placeholder">
                      <span>{getFieldValue(field.key)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="preview-info-panel">
            <div className="preview-info-section">
              <h4>Template Details</h4>
              <div className="info-item">
                <label>Name:</label>
                <span>{template.name}</span>
              </div>
              <div className="info-item">
                <label>Type:</label>
                <span>{getTypeLabel(template.type)}</span>
              </div>
              <div className="info-item">
                <label>Canvas Size:</label>
                <span>{template.canvasSize.width} × {template.canvasSize.height}px</span>
              </div>
              <div className="info-item">
                <label>Fields:</label>
                <span>{template.fields.length} fields</span>
              </div>
            </div>

            <div className="preview-info-section">
              <h4>Sample Data</h4>
              <p className="sample-data-note">
                This preview uses sample data. In actual use, real student/school data will be populated.
              </p>
            </div>
          </div>
        </div>

        <div className="preview-modal-footer">
          <button className="preview-action-btn preview-action-btn--secondary">
            <Download size={16} aria-hidden="true" role="img" />
            <span>Download PDF</span>
          </button>
          <button className="preview-action-btn preview-action-btn--primary">
            <Printer size={16} aria-hidden="true" role="img" />
            <span>Print Template</span>
          </button>
        </div>
      </div>
    </div>
  );
}
