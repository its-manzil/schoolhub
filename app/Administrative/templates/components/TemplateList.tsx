"use client";

import React, { useState } from 'react';
import { FileText, Eye, Edit, Trash2, Download, Grid, List, Search, Palette } from 'lucide-react';
import { Template } from '../types';

interface TemplateListProps {
  templates: Template[];
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
  onView: (template: Template) => void;
  onDesign?: (template: Template) => void;
  isLoading?: boolean;
}

export default function TemplateList({ templates, onEdit, onDelete, onView, onDesign, isLoading }: TemplateListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get unique categories from templates
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (template.fileName && template.fileName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = (template: Template) => {
    // Download the template file from server
    const link = document.createElement('a');
    link.href = `/api/templates/${template._id}/download`;
    link.download = template.fileName || 'template';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="template-list-loading">
        <div className="loading-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-header"></div>
              <div className="skeleton-title"></div>
              <div className="skeleton-meta"></div>
              <div className="skeleton-actions"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (filteredTemplates.length === 0) {
    return (
      <div className="empty-state">
        <FileText size={48} className="empty-icon" />
        <h3>No templates found</h3>
        <p>
          {searchTerm || selectedCategory !== 'all' 
            ? 'Try adjusting your filters or search terms' 
            : 'Create your first template to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="template-list">
      {/* Filters and Controls */}
      <div className="list-controls">
        <div className="search-filters">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="view-controls">
          <button
            onClick={() => setViewMode('grid')}
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="templates-grid">
          {filteredTemplates.map((template) => (
            <div key={template._id} className="template-card">
              <div className="card-header">
                <div className="card-thumbnail-placeholder">
                  <FileText size={32} />
                </div>
                <span className="category-badge">{template.category}</span>
              </div>
              
              <div className="card-content">
                <h3 className="card-title">{template.name}</h3>
                <p className="card-type">{template.type}</p>
                <p className="card-file">{template.fileName || 'No file'}</p>
                <div className="card-meta">
                  <span>Updated {formatDate(template.updatedAt)}</span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  onClick={() => onView(template)}
                  className="btn-action btn-view"
                  title="View template"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleDownload(template)}
                  className="btn-action btn-download"
                  title="Download template"
                >
                  <Download size={16} />
                </button>
                {onDesign && (
                  <button
                    onClick={() => onDesign(template)}
                    className="btn-action btn-design"
                    title="Design template"
                  >
                    <Palette size={16} />
                  </button>
                )}
                <button
                  onClick={() => onEdit(template)}
                  className="btn-action btn-edit"
                  title="Edit template"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(template._id!)}
                  className="btn-action btn-delete"
                  title="Delete template"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="templates-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>File</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.map((template) => (
                <tr key={template._id}>
                  <td className="table-name">
                    <div className="name-cell">
                      <FileText size={20} className="table-file-icon" />
                      <span>{template.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge small">{template.category}</span>
                  </td>
                  <td>{template.type}</td>
                  <td className="table-file-name">{template.fileName || 'No file'}</td>
                  <td>{formatDate(template.updatedAt)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        onClick={() => onView(template)}
                        className="btn-action btn-view"
                        title="View template"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleDownload(template)}
                        className="btn-action btn-download"
                        title="Download template"
                      >
                        <Download size={14} />
                      </button>
                      {onDesign && (
                        <button
                          onClick={() => onDesign(template)}
                          className="btn-action btn-design"
                          title="Design template"
                        >
                          <Palette size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(template)}
                        className="btn-action btn-edit"
                        title="Edit template"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(template._id!)}
                        className="btn-action btn-delete"
                        title="Delete template"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
