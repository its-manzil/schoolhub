import React from 'react';
import { FolderOpen, Plus, Edit, Trash2 } from "lucide-react";
import './TemplateCategories.css';

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  templateCount: number;
  color: string;
}

interface TemplateCategoriesProps {
  categories: Category[];
  onEditCategory?: (category: Category) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onCreateCategory?: () => void;
}

export default function TemplateCategories({ 
  categories, 
  onEditCategory, 
  onDeleteCategory, 
  onCreateCategory 
}: TemplateCategoriesProps) {
  const handleCategoryClick = (category: Category) => {
    // Could implement navigation to filtered templates view
    console.log('Category clicked:', category.name);
  };

  const getCategoryStats = () => {
    const totalTemplates = categories.reduce((sum, cat) => sum + cat.templateCount, 0);
    const totalCategories = categories.length;
    return { totalTemplates, totalCategories };
  };

  const stats = getCategoryStats();

  return (
    <div className="template-categories">
      <div className="categories-header">
        <div className="header-content">
          <FolderOpen size={24} />
          <div>
            <h2>Template Categories</h2>
            <p>Organize your templates by categories for better management</p>
          </div>
        </div>
        <button className="create-category-btn" onClick={onCreateCategory}>
          <Plus size={16} />
          <span>New Category</span>
        </button>
      </div>

      <div className="categories-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.totalCategories}</div>
          <div className="stat-label">Total Categories</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalTemplates}</div>
          <div className="stat-label">Total Templates</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {Math.round(stats.totalTemplates / stats.totalCategories)}
          </div>
          <div className="stat-label">Avg Templates</div>
        </div>
      </div>

      <div className="categories-grid">
        {categories.map(category => (
          <div 
            key={category.id} 
            className="category-card"
            onClick={() => handleCategoryClick(category)}
          >
            <div className="category-header">
              <div className={`category-icon category-icon--${category.color}`}>
                <span>{category.icon}</span>
              </div>
              <div className="category-actions">
                {onEditCategory && (
                  <button 
                    className="action-btn action-btn--edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCategory(category);
                    }}
                    title="Edit category"
                  >
                    <Edit size={14} />
                  </button>
                )}
                {onDeleteCategory && (
                  <button 
                    className="action-btn action-btn--delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete "${category.name}" category?`)) {
                        onDeleteCategory(category.id);
                      }
                    }}
                    title="Delete category"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="category-content">
              <h3 className="category-name">{category.name}</h3>
              <p className="category-description">{category.description}</p>
              
              <div className="category-stats">
                <div className="template-count">
                  <span className="count-number">{category.templateCount}</span>
                  <span className="count-label">Templates</span>
                </div>
              </div>
            </div>

            <div className="category-footer">
              <div className="category-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${Math.min((category.templateCount / 10) * 100, 100)}%` 
                    }}
                  />
                </div>
                <span className="progress-text">
                  {category.templateCount > 0 ? 'Active' : 'Empty'}
                </span>
              </div>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="empty-categories">
            <div className="empty-icon">📁</div>
            <h3>No Categories Yet</h3>
            <p>Create your first category to start organizing templates</p>
            <button className="create-first-btn" onClick={onCreateCategory}>
              <Plus size={16} />
              Create Category
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
