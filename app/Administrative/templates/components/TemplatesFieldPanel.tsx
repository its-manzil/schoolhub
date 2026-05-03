import React, { useState } from 'react';
import { Upload, Trash2, Type, Image, QrCode, Plus, Settings } from "lucide-react";
/* eslint-disable jsx-a11y/alt-text */
import './TemplatesFieldPanel.css';
import { TemplateField } from '../types';

interface TemplateFieldPanelProps {
  selectedField?: TemplateField | null;
  onFieldAdd: (field: TemplateField) => void;
  onFieldUpdate?: (fieldId: string, updates: Partial<TemplateField>) => void;
  onFieldDelete?: (fieldKey: string) => void;
  onBackgroundChange?: (imageUrl: string) => void;
  canvasSize?: { width: number; height: number };
}

export default function TemplateFieldPanel({
  selectedField = null,
  onFieldAdd,
  onFieldUpdate,
  onFieldDelete,
  onBackgroundChange,
  canvasSize = { width: 600, height: 400 }
}: TemplateFieldPanelProps) {
  const [activeTab, setActiveTab] = useState<'fields' | 'properties'>('fields');

  const availableFields = [
    { key: 'student.name', label: 'Student Name', type: 'text' },
    { key: 'student.class', label: 'Class', type: 'text' },
    { key: 'student.roll', label: 'Roll Number', type: 'text' },
    { key: 'student.section', label: 'Section', type: 'text' },
    { key: 'student.photo', label: 'Student Photo', type: 'image' },
    { key: 'school.name', label: 'School Name', type: 'text' },
    { key: 'school.address', label: 'School Address', type: 'text' },
    { key: 'school.phone', label: 'School Phone', type: 'text' },
    { key: 'fee.amount', label: 'Fee Amount', type: 'text' },
    { key: 'fee.month', label: 'Fee Month', type: 'text' },
    { key: 'certificate.title', label: 'Certificate Title', type: 'text' },
    { key: 'qrcode', label: 'QR Code', type: 'qrcode' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onBackgroundChange) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onBackgroundChange(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderFieldsTab = () => (
    <div className="fields-tab">
      <div className="field-categories">
        <div className="category-section">
          <h4>Student Information</h4>
          <div className="field-list">
            {availableFields
              .filter(field => field.key.startsWith('student'))
              .map(field => (
                <button
                  key={field.key}
                  className="field-item"
                  onClick={() => onFieldAdd({
                    key: field.key,
                    x: Math.round(canvasSize.width / 2),
                    y: Math.round(canvasSize.height / 2),
                    fontSize: 14,
                    color: '#000000',
                    bold: false,
                    align: 'left',
                    fieldType: field.type as 'text' | 'image' | 'qrcode'
                  })}
                >
                  {field.type === 'text' && <Type size={14} aria-hidden="true" role="img" />}
                  {field.type === 'image' && <Image size={14} aria-hidden="true" role="img" />}
                  {field.type === 'qrcode' && <QrCode size={14} aria-hidden="true" role="img" />}
                  <span>{field.label}</span>
                  <Plus size={12} aria-hidden="true" role="img" />
                </button>
              ))}
          </div>
        </div>

        <div className="category-section">
          <h4>School Information</h4>
          <div className="field-list">
            {availableFields
              .filter(field => field.key.startsWith('school'))
              .map(field => (
                <button
                  key={field.key}
                  className="field-item"
                  onClick={() => onFieldAdd({
                    key: field.key,
                    x: Math.round(canvasSize.width / 2),
                    y: Math.round(canvasSize.height / 2),
                    fontSize: 14,
                    color: '#000000',
                    bold: false,
                    align: 'left',
                    fieldType: field.type as 'text' | 'image' | 'qrcode'
                  })}
                >
                  {field.type === 'text' && <Type size={14} aria-hidden="true" role="img" />}
                  {field.type === 'image' && <Image size={14} aria-hidden="true" role="img" />}
                  {field.type === 'qrcode' && <QrCode size={14} aria-hidden="true" role="img" />}
                  <span>{field.label}</span>
                  <Plus size={12} aria-hidden="true" role="img" />
                </button>
              ))}
          </div>
        </div>

        <div className="category-section">
          <h4>Other Fields</h4>
          <div className="field-list">
            {availableFields
              .filter(field => !field.key.startsWith('student') && !field.key.startsWith('school'))
              .map(field => (
                <button
                  key={field.key}
                  className="field-item"
                  onClick={() => onFieldAdd({
                    key: field.key,
                    x: Math.round(canvasSize.width / 2),
                    y: Math.round(canvasSize.height / 2),
                    fontSize: 14,
                    color: '#000000',
                    bold: false,
                    align: 'left',
                    fieldType: field.type as 'text' | 'image' | 'qrcode'
                  })}
                >
                  {field.type === 'text' && <Type size={14} aria-hidden="true" role="img" />}
                  {field.type === 'image' && <Image size={14} aria-hidden="true" role="img" />}
                  {field.type === 'qrcode' && <QrCode size={14} aria-hidden="true" role="img" />}
                  <span>{field.label}</span>
                  <Plus size={12} aria-hidden="true" role="img" />
                </button>
              ))}
          </div>
        </div>
      </div>

      <div className="background-section">
        <h4>Background Image</h4>
        <div className="image-upload-area">
          <input
            type="file"
            id="bg-upload"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <label htmlFor="bg-upload" className="upload-label">
            <Upload size={16} />
            <span>Change Background</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPropertiesTab = () => {
    if (!selectedField) {
      return (
        <div className="no-selection">
          <Settings size={24} />
          <p>Select a field to edit its properties</p>
        </div>
      );
    }

    return (
      <div className="properties-tab">
        <div className="property-header">
          <h4>{selectedField.key}</h4>
          <button
            className="delete-field-btn"
            onClick={() => onFieldDelete?.(selectedField.key)}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>

        <div className="property-group">
          <label>Position X</label>
          <input
            type="number"
            value={selectedField.x}
            onChange={(e) => onFieldUpdate?.(selectedField.key, { x: parseInt(e.target.value) || 0 })}
            className="property-input"
          />
        </div>

        <div className="property-group">
          <label>Position Y</label>
          <input
            type="number"
            value={selectedField.y}
            onChange={(e) => onFieldUpdate?.(selectedField.key, { y: parseInt(e.target.value) || 0 })}
            className="property-input"
          />
        </div>

        {selectedField.fieldType === 'text' && (
          <>
            <div className="property-group">
              <label>Font Size</label>
              <input
                type="number"
                value={selectedField.fontSize || 14}
                onChange={(e) => onFieldUpdate?.(selectedField.key, { fontSize: parseInt(e.target.value) || 14 })}
                className="property-input"
                min="8"
                max="72"
              />
            </div>

            <div className="property-group">
              <label>Color</label>
              <input
                type="color"
                value={selectedField.color || '#000000'}
                onChange={(e) => onFieldUpdate?.(selectedField.key, { color: e.target.value })}
                className="color-input"
              />
            </div>

            <div className="property-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedField.bold || false}
                  onChange={(e) => onFieldUpdate?.(selectedField.key, { bold: e.target.checked })}
                />
                <span>Bold</span>
              </label>
            </div>
          </>
        )}

        {(selectedField.fieldType === 'image' || selectedField.fieldType === 'qrcode') && (
          <>
            <div className="property-group">
              <label>Width</label>
              <input
                type="number"
                value={selectedField.width || 80}
                onChange={(e) => onFieldUpdate?.(selectedField.key, { width: parseInt(e.target.value) || 80 })}
                className="property-input"
                min="20"
                max="300"
              />
            </div>

            <div className="property-group">
              <label>Height</label>
              <input
                type="number"
                value={selectedField.height || 100}
                onChange={(e) => onFieldUpdate?.(selectedField.key, { height: parseInt(e.target.value) || 100 })}
                className="property-input"
                min="20"
                max="300"
              />
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="template-field-panel">
      <div className="panel-tabs">
        <button
          className={`tab-btn ${activeTab === 'fields' ? 'active' : ''}`}
          onClick={() => setActiveTab('fields')}
        >
          <Plus size={14} />
          Fields
        </button>
        <button
          className={`tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          <Settings size={14} />
          Properties
        </button>
      </div>

      <div className="panel-content">
        {activeTab === 'fields' && renderFieldsTab()}
        {activeTab === 'properties' && renderPropertiesTab()}
      </div>
    </div>
  );
}
