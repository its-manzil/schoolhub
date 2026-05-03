import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Save, X, Download, Check, Loader2 } from "lucide-react";
import TemplatesFieldPanel from './TemplatesFieldPanel';
import TemplateCanvas from './TemplateCanvas';
import FieldPropertiesPanel from './FieldPropertiesPanel';
import ImageUploader from './ImageUploader';
import './VisualTemplateEditor.css';
import { Template, TemplateField } from '../types';

interface VisualTemplateEditorProps {
  template?: Template | null;
  onSave: (template: Partial<Template>) => void;
  onCancel: () => void;
  isNew?: boolean;
}

export default function VisualTemplateEditor({ 
  template, 
  onSave, 
  onCancel, 
  isNew = false 
}: VisualTemplateEditorProps) {
  const [templateData, setTemplateData] = useState<Partial<Template>>({
    name: template?.name || '',
    type: template?.type || 'id_card',
    backgroundImage: template?.backgroundImage || '',
    canvasSize: template?.canvasSize || { width: 600, height: 400 },
    fields: template?.fields || []
  });

  const [selectedField, setSelectedField] = useState<TemplateField | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Auto-save feedback state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Auto-save effect when template data changes
  useEffect(() => {
    if (!templateData.backgroundImage || !templateData.name) return;
    
    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Show saving state
    setSaveStatus('saving');
    
    // Simulate auto-save after 1 second of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saved');
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 1000);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [templateData]);

  const handleFieldAdd = useCallback((field: TemplateField) => {
    setTemplateData(prev => ({
      ...prev,
      fields: [...(prev.fields || []), field]
    }));
    setSelectedField(field);
  }, []);

  const handleFieldUpdate = useCallback((fieldKey: string, updates: Partial<TemplateField>) => {
    setTemplateData(prev => ({
      ...prev,
      fields: (prev.fields || []).map(field =>
        field.key === fieldKey ? { ...field, ...updates } : field
      )
    }));
    
    // Update selected field if it's the one being updated
    if (selectedField?.key === fieldKey) {
      setSelectedField(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedField]);

  const handleFieldDelete = useCallback(() => {
    if (selectedField) {
      setTemplateData(prev => ({
        ...prev,
        fields: (prev.fields || []).filter(field => field.key !== selectedField.key)
      }));
      setSelectedField(null);
    }
  }, [selectedField]);

  const handleBackgroundUpload = useCallback((imageUrl: string) => {
    setTemplateData(prev => ({
      ...prev,
      backgroundImage: imageUrl
    }));
  }, []);

  const handleSave = useCallback(() => {
    if (!templateData.name?.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (!templateData.backgroundImage) {
      alert('Please upload a background image for the template');
      return;
    }

    onSave({
      ...templateData,
      schoolId: template?.schoolId || 1
    });
  }, [templateData, template?.schoolId, onSave]);

  // Export canvas as PNG
  const handleExport = useCallback(() => {
    // This will be implemented with html2canvas
    console.log('Export template:', templateData);
  }, [templateData]);

  return (
    <div className="visual-template-editor">
      <div className="editor-header">
        <div className="header-left">
          <h2>{isNew ? 'Create Visual Template' : 'Edit Visual Template'}</h2>
          <div className="template-info">
            <input
              type="text"
              className="template-name-input"
              placeholder="Template Name"
              value={templateData.name}
              onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
            />
            <select
              className="template-type-select"
              value={templateData.type}
              onChange={(e) => setTemplateData(prev => ({
                ...prev,
                type: e.target.value as Template['type']
              }))}
            >
              <option value="id_card">ID Card</option>
              <option value="letterpad">Letterpad</option>
              <option value="bill">Bill</option>
              <option value="certificate">Certificate</option>
            </select>
          </div>
        </div>

        <div className="header-right">
          {/* Auto-save status indicator */}
          <div className="save-status">
            {saveStatus === 'saving' && (
              <span className="save-status-saving">
                <Loader2 size={14} className="spin" />
                Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="save-status-saved">
                <Check size={14} />
                Saved
              </span>
            )}
          </div>
          
          <div className="action-buttons">
            <button className="action-btn action-btn--export" onClick={handleExport}>
              <Download size={16} />
              <span>Export</span>
            </button>
            <button className="action-btn action-btn--save" onClick={handleSave}>
              <Save size={16} />
              <span>Save</span>
            </button>
            <button className="action-btn action-btn--cancel" onClick={onCancel}>
              <X size={16} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>

      <div className="editor-content">
        <div className="editor-left-panel">
          <TemplatesFieldPanel
            onFieldAdd={handleFieldAdd}
            canvasSize={templateData.canvasSize || { width: 600, height: 400 }}
          />
        </div>

        <div className="editor-canvas-area" ref={canvasRef}>
          {templateData.backgroundImage ? (
            <TemplateCanvas
              backgroundImage={templateData.backgroundImage}
              canvasSize={templateData.canvasSize || { width: 600, height: 400 }}
              fields={templateData.fields || []}
              selectedField={selectedField}
              onFieldUpdate={handleFieldUpdate}
              onFieldSelect={setSelectedField}
              onFieldDelete={handleFieldDelete}
              onExport={handleExport}
            />
          ) : (
            <ImageUploader
              onUpload={handleBackgroundUpload}
            />
          )}
        </div>

        <div className="editor-right-panel">
          <FieldPropertiesPanel
            field={selectedField}
            onUpdate={(updates) => {
              if (selectedField) {
                handleFieldUpdate(selectedField.key, updates);
              }
            }}
            onDelete={handleFieldDelete}
          />
        </div>
      </div>
    </div>
  );
}
