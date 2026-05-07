import React from 'react';
import { Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Type } from "lucide-react";
import './FieldPropertiesPanel.css';
import { TemplateField } from '../types';

interface FieldPropertiesPanelProps {
  field: TemplateField | null;
  onUpdate: (updates: Partial<TemplateField>) => void;
  onDelete: () => void;
}

export default function FieldPropertiesPanel({
  field,
  onUpdate,
  onDelete
}: FieldPropertiesPanelProps) {
  if (!field) {
    return (
      <div className="field-properties-panel">
        <div className="no-selection">
          <Type size={24} aria-hidden="true" role="img" />
          <h4>No Field Selected</h4>
          <p>Click on a field in the canvas to edit its properties</p>
        </div>
      </div>
    );
  }

  const getFieldLabel = (_key: string): string => {
    const labels: { [key: string]: string } = {
      'student.name': 'Student Name',
      'student.class': 'Class',
      'student.roll': 'Roll Number',
      'student.section': 'Section',
      'student.photo': 'Student Photo',
      'school.name': 'School Name',
      'school.address': 'School Address',
      'school.phone': 'School Phone',
      'school.logo': 'School Logo',
      'fee.amount': 'Fee Amount',
      'fee.month': 'Fee Month',
      'certificate.title': 'Certificate Title',
      'letter.content': 'Letter Content',
      'custom.text': 'Custom Text',
      'qrcode': 'QR Code'
    };
    return labels[_key] || _key;
  };

  return (
    <div className="field-properties-panel">
      <div className="panel-header">
        <h4>Field Properties</h4>
        <span className="field-type-badge">{field.fieldType}</span>
      </div>

      <div className="field-info">
        <div className="info-row">
          <label>Field Name:</label>
          <span>{getFieldLabel(field.key)}</span>
        </div>
        <div className="info-row">
          <label>Field Key:</label>
          <code>{field.key}</code>
        </div>
      </div>

      <div className="property-section">
        <h5>Position</h5>
        <div className="property-row">
          <div className="property-group">
            <label>X Position</label>
            <input
              type="number"
              value={field.x}
              onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
              className="property-input"
              min="0"
            />
          </div>
          <div className="property-group">
            <label>Y Position</label>
            <input
              type="number"
              value={field.y}
              onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
              className="property-input"
              min="0"
            />
          </div>
        </div>
      </div>

      {field.fieldType === 'text' && (
        <>
          <div className="property-section">
            <h5>Text Style</h5>
            <div className="property-group">
              <label>Font Size</label>
              <input
                type="range"
                value={field.fontSize}
                onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
                className="property-slider"
                min="8"
                max="72"
              />
              <span className="slider-value">{field.fontSize}px</span>
            </div>

            <div className="property-group">
              <label>Text Color</label>
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  value={field.color}
                  onChange={(e) => onUpdate({ color: e.target.value })}
                  className="color-input"
                />
                <span className="color-value">{field.color}</span>
              </div>
            </div>

            <div className="property-group">
              <label>Text Alignment</label>
              <div className="alignment-buttons">
                <button
                  className={`align-btn ${field.align === 'left' ? 'active' : ''}`}
                  onClick={() => onUpdate({ align: 'left' })}
                  title="Align Left"
                >
                  <AlignLeft size={16} aria-hidden="true" role="img" />
                </button>
                <button
                  className={`align-btn ${field.align === 'center' ? 'active' : ''}`}
                  onClick={() => onUpdate({ align: 'center' })}
                  title="Align Center"
                >
                  <AlignCenter size={16} aria-hidden="true" role="img" />
                </button>
                <button
                  className={`align-btn ${field.align === 'right' ? 'active' : ''}`}
                  onClick={() => onUpdate({ align: 'right' })}
                  title="Align Right"
                >
                  <AlignRight size={16} aria-hidden="true" role="img" />
                </button>
              </div>
            </div>

            <div className="property-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={field.bold}
                  onChange={(e) => onUpdate({ bold: e.target.checked })}
                />
                <Bold size={14} aria-hidden="true" role="img" />
                <span>Bold Text</span>
              </label>
            </div>
          </div>
        </>
      )}

      {(field.fieldType === 'image' || field.fieldType === 'qrcode') && (
        <div className="property-section">
          <h5>Dimensions</h5>
          <div className="property-row">
            <div className="property-group">
              <label>Width</label>
              <input
                type="number"
                value={field.width || 80}
                onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 80 })}
                className="property-input"
                min="20"
                max="300"
              />
            </div>
            <div className="property-group">
              <label>Height</label>
              <input
                type="number"
                value={field.height || 100}
                onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 100 })}
                className="property-input"
                min="20"
                max="300"
              />
            </div>
          </div>
        </div>
      )}

      <div className="panel-footer">
        <button className="delete-field-btn" onClick={onDelete}>
          <Trash2 size={16} aria-hidden="true" role="img" />
          <span>Delete Field</span>
        </button>
      </div>
    </div>
  );
}
