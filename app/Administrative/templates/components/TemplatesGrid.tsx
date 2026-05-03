import React from 'react';
import TemplateCard from './TemplateCard';
import './TemplatesGrid.css';
import { Template } from '../types';

interface TemplatesGridProps {
  templates: Template[];
  onPreview: (template: Template) => void;
  onEdit: (template: Template) => void;
  onClone: (template: Template) => void;
  onDelete: (templateId: string) => void;
  onToggleDefault: (templateId: string) => void;
}

export default function TemplatesGrid({
  templates,
  onPreview,
  onEdit,
  onClone,
  onDelete,
  onToggleDefault
}: TemplatesGridProps) {
  if (templates.length === 0) {
    return (
      <div className="templates-grid-empty">
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3 className="empty-title">No templates found</h3>
          <p className="empty-description">
            Create your first template to get started with document management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="templates-grid">
      {templates.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          onPreview={onPreview}
          onEdit={onEdit}
          onClone={onClone}
          onDelete={onDelete}
          onToggleDefault={onToggleDefault}
        />
      ))}
    </div>
  );
}
