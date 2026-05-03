import React from 'react';
import { Plus, Search, Filter } from "lucide-react";
import './TemplatesHeader.css';

interface TemplatesHeaderProps {
  onCreateTemplate: () => void;
  onSearch: (query: string) => void;
}

export default function TemplatesHeader({ onCreateTemplate, onSearch }: TemplatesHeaderProps) {
  return (
    <div className="templates-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">Templates Management</h1>
          <p className="header-subtitle">Design and manage document templates for your school</p>
        </div>
        
        <div className="header-right">
          <div className="header-actions">
            <div className="search-container">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search templates..."
                className="search-input"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
            
            <button className="filter-btn">
              <Filter size={18} />
              <span>Filter</span>
            </button>
            
            <button className="create-btn" onClick={onCreateTemplate}>
              <Plus size={18} />
              <span>Create Template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
