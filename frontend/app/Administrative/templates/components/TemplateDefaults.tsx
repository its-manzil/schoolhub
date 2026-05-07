import React from 'react';
import { CreditCard, FileText, FolderOpen, Award, Settings } from "lucide-react";
import './TemplateDefaults.css';

interface Template {
  id: string;
  name: string;
  type: 'id_card' | 'letterpad' | 'bill' | 'certificate';
}

interface TemplateDefaultsProps {
  templates: Template[];
  defaultTemplates: {
    idCard: string;
    letterpad: string;
    bill: string;
    certificate: string;
  };
  onDefaultChange: (type: keyof { idCard: string; letterpad: string; bill: string; certificate: string; }, templateId: string) => void;
}

export default function TemplateDefaults({ 
  templates, 
  defaultTemplates, 
  onDefaultChange 
}: TemplateDefaultsProps) {
  const defaultTypes = [
    {
      key: 'idCard',
      label: 'Default ID Card Template',
      description: 'Used for student identification cards',
      icon: <CreditCard size={24} />,
      color: 'blue'
    },
    {
      key: 'letterpad',
      label: 'Default Letterpad Template',
      description: 'Used for official school letters',
      icon: <FileText size={24} />,
      color: 'green'
    },
    {
      key: 'bill',
      label: 'Default Bill Template',
      description: 'Used for fee bills and invoices',
      icon: <FolderOpen size={24} />,
      color: 'orange'
    },
    {
      key: 'certificate',
      label: 'Default Certificate Template',
      description: 'Used for achievement certificates',
      icon: <Award size={24} />,
      color: 'purple'
    }
  ];

  const getTemplatesByType = (type: string) => {
    return templates.filter(template => template.type === type);
  };

  const getCurrentDefault = (typeKey: string) => {
    const templateId = defaultTemplates[typeKey as keyof typeof defaultTemplates];
    return templates.find(t => t.id === templateId);
  };

  return (
    <div className="template-defaults">
      <div className="defaults-header">
        <div className="header-content">
          <Settings size={24} />
          <div>
            <h2>Default Template Settings</h2>
            <p>Configure default templates for different document types</p>
          </div>
        </div>
      </div>

      <div className="defaults-content">
        {defaultTypes.map(type => {
          const typeTemplates = getTemplatesByType(type.key);
          const currentDefault = getCurrentDefault(type.key);

          return (
            <div key={type.key} className={`default-item default-item--${type.color}`}>
              <div className="default-item-header">
                <div className="default-icon">
                  {type.icon}
                </div>
                <div className="default-info">
                  <h3>{type.label}</h3>
                  <p>{type.description}</p>
                </div>
              </div>

              <div className="default-selection">
                <div className="current-default">
                  <span className="current-label">Currently Selected:</span>
                  {currentDefault ? (
                    <span className="current-value">{currentDefault.name}</span>
                  ) : (
                    <span className="current-value none">No default set</span>
                  )}
                </div>

                <div className="default-dropdown">
                  <label>Select Default Template:</label>
                  <select
                    value={defaultTemplates[type.key as keyof typeof defaultTemplates] || ''}
                    onChange={(e) => onDefaultChange(type.key as keyof typeof defaultTemplates, e.target.value)}
                    className="default-select"
                  >
                    <option value="">-- Select Template --</option>
                    {typeTemplates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                {typeTemplates.length === 0 && (
                  <div className="no-templates">
                    <p>No templates available for this type. Create a template first.</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="defaults-note">
          <div className="note-icon">ℹ️</div>
          <div className="note-content">
            <h4>Note</h4>
            <p>
              Default templates are automatically used when generating documents of each type. 
              Only one template can be set as default for each document type. 
              You can change defaults at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
