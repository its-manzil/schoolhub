"use client";

import React, { useState, useEffect } from 'react';
import AdmLayout from "../components/AdmLayout";
import { Plus } from "lucide-react";
import TemplateList from "./components/TemplateList";
import TemplateModal from "./components/TemplateModal";
import { Template } from "./types";
import "./Templates.css";

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch templates from API
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setTemplates(data.data);
      } else {
        setError(data.message || 'Failed to fetch templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to fetch templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Create or update template
  const handleSubmit = async (templateData: Omit<Template, '_id'> & { file?: File }) => {
    try {
      setIsSubmitting(true);
      
      const url = editingTemplate 
        ? `/api/templates/${editingTemplate._id}`
        : '/api/templates';
      
      const method = editingTemplate ? 'PUT' : 'POST';

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', templateData.name);
      formData.append('category', templateData.category);
      formData.append('type', templateData.type);
      
      if (templateData.file) {
        formData.append('file', templateData.file);
      }

      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh the templates list
        await fetchTemplates();
        
        // Close modal and reset editing state
        setIsModalOpen(false);
        setEditingTemplate(undefined);
      } else {
        setError(data.message || `Failed to ${editingTemplate ? 'update' : 'create'} template`);
      }
    } catch (error) {
      console.error('Error submitting template:', error);
      setError(`Failed to ${editingTemplate ? 'update' : 'create'} template. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete template
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Remove from local state
        setTemplates(prev => prev.filter(t => t._id !== id));
      } else {
        setError(data.message || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      setError('Failed to delete template. Please try again.');
    }
  };

  // Edit template
  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  // View template - just download the file since we can't preview binary files
  const handleView = (template: Template) => {
    // Download the template file directly
    const link = document.createElement('a');
    link.href = `/api/templates/${template._id}/download`;
    link.download = template.fileName || 'template';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create new template
  const handleCreate = () => {
    setEditingTemplate(undefined);
    setIsModalOpen(true);
  };

  // Design template
  const handleDesign = (template: Template) => {
    // Navigate to design editor
    window.location.href = `/Administrative/templates/${template._id}/design`;
  };

  // Close form modal
  const closeFormModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(undefined);
  };

  return (
    <AdmLayout>
      <div className="templates-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Template Library</h1>
              <p>Manage your school document templates</p>
            </div>
            <button className="btn-primary" onClick={handleCreate}>
              <Plus size={20} />
              Create Template
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="close-error">×</button>
          </div>
        )}

        {/* Templates List */}
        <div className="templates-content">
          <TemplateList
            templates={templates}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onDesign={handleDesign}
            isLoading={loading}
          />
        </div>

        {/* Create/Edit Modal */}
        <TemplateModal
          isOpen={isModalOpen}
          onClose={closeFormModal}
          template={editingTemplate}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>
    </AdmLayout>
  );
}
