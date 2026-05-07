import React, { useState } from 'react';
import { Eye, Edit, Copy, Trash2, Star, Calendar, Folder } from "lucide-react";
import './TemplateCard.css';
import { Template } from '../types';

interface TemplateCardProps {
  template: Template;
  onPreview: (template: Template) => void;
  onEdit: (template: Template) => void;
  onClone: (template: Template) => void;
  onDelete: (templateId: string) => void;
  onToggleDefault: (templateId: string) => void;
}

export default function TemplateCard({
  template,
  onPreview,
  onEdit,
  onClone,
  onDelete,
  onToggleDefault
}: TemplateCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'id_card':
        return 'ID Card';
      case 'letterpad':
        return 'Letterpad';
      case 'bill':
        return 'Bill';
      case 'certificate':
        return 'Certificate';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'id_card':
        return 'blue';
      case 'letterpad':
        return 'green';
      case 'bill':
        return 'orange';
      case 'certificate':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(template.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div className="template-card">
      <div className="template-card-header">
        <div className="template-title-section">
          <h3 className="template-name">{template.name}</h3>
          <div className="template-meta">
            <span className={`template-type template-type--${getTypeColor(template.type)}`}>
              {getTypeLabel(template.type)}
            </span>
            {template.isDefault && (
              <span className="template-default">
                <Star size={12} />
                Default
              </span>
            )}
          </div>
        </div>
        <button
          className={`default-toggle ${template.isDefault ? 'active' : ''}`}
          onClick={() => onToggleDefault(template.id)}
          title={template.isDefault ? 'Remove as default' : 'Set as default'}
        >
          <Star size={16} fill={template.isDefault ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="template-card-body">
        <p className="template-description">{template.description || `${template.type} template with ${template.fields.length} fields`}</p>

        <div className="template-info">
          <div className="info-item">
            <Folder size={14} />
            <span>{template.category || 'General'}</span>
          </div>
          <div className="info-item">
            <Calendar size={14} />
            <span>Updated {template.updatedAt.toLocaleDateString()}</span>
          </div>
        </div>

        <div className="template-usage">
          <span className="usage-label">Used for:</span>
          <span className="usage-value">{template.usedFor || template.type}</span>
        </div>
      </div>

      <div className="template-card-actions">
        <button
          className="action-btn action-btn--preview"
          onClick={() => onPreview(template)}
          title="Preview template"
        >
          <Eye size={16} />
          <span>Preview</span>
        </button>
        
        <button
          className="action-btn action-btn--edit"
          onClick={() => onEdit(template)}
          title="Edit template"
        >
          <Edit size={16} />
          <span>Edit</span>
        </button>
        
        <button
          className="action-btn action-btn--clone"
          onClick={() => onClone(template)}
          title="Clone template"
        >
          <Copy size={16} />
          <span>Clone</span>
        </button>
        
        <button
          className={`action-btn action-btn--delete ${showDeleteConfirm ? 'confirm' : ''}`}
          onClick={handleDelete}
          title={showDeleteConfirm ? 'Click to confirm delete' : 'Delete template'}
        >
          <Trash2 size={16} />
          <span>{showDeleteConfirm ? 'Confirm?' : 'Delete'}</span>
        </button>
      </div>
    </div>
  );
}
