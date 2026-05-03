import React from 'react';
import { FileText, Plus, Settings, FolderOpen, CreditCard } from "lucide-react";
import './TemplatesSidebar.css';

interface TemplatesNavbarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function TemplatesNavbar({ activeSection, onSectionChange }: TemplatesNavbarProps) {
  const menuItems = [
    {
      id: 'templates',
      label: 'Templates',
      icon: <FileText size={18} />,
      description: 'Manage all templates'
    },
    {
      id: 'create',
      label: 'Create Template',
      icon: <Plus size={18} />,
      description: 'Design visual template'
    },
    {
      id: 'defaults',
      label: 'Defaults',
      icon: <Settings size={18} />,
      description: 'Default settings'
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: <FolderOpen size={18} />,
      description: 'Template categories'
    }
  ];

  return (
    <div className="templates-navbar">
      <div className="navbar-brand">
        <CreditCard size={20} />
        <span>Templates Management</span>
      </div>
      
      <nav className="navbar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`navbar-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onSectionChange(item.id)}
            title={item.description}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="navbar-stats">
        <div className="stat-item">
          <span className="stat-value">12</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">3</span>
          <span className="stat-label">Default</span>
        </div>
      </div>
    </div>
  );
}
