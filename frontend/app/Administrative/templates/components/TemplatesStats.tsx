import React from 'react';
import { FileText, Settings, FolderOpen, Clock } from "lucide-react";
import './TemplatesStats.css';

interface TemplatesStatsProps {
  totalTemplates: number;
  activeDefaults: number;
  categoriesCount: number;
  recentlyUpdated: string;
}

export default function TemplatesStats({ 
  totalTemplates, 
  activeDefaults, 
  categoriesCount, 
  recentlyUpdated 
}: TemplatesStatsProps) {
  const stats = [
    {
      label: 'Total Templates',
      value: totalTemplates,
      icon: <FileText size={20} />,
      color: 'primary',
      description: 'All templates'
    },
    {
      label: 'Active Defaults',
      value: activeDefaults,
      icon: <Settings size={20} />,
      color: 'success',
      description: 'Default templates'
    },
    {
      label: 'Categories',
      value: categoriesCount,
      icon: <FolderOpen size={20} />,
      color: 'info',
      description: 'Template categories'
    },
    {
      label: 'Recently Updated',
      value: recentlyUpdated,
      icon: <Clock size={20} />,
      color: 'warning',
      description: 'Last activity'
    }
  ];

  return (
    <div className="templates-stats">
      {stats.map((stat, index) => (
        <div key={index} className={`stat-card stat-card--${stat.color}`}>
          <div className="stat-icon">
            {stat.icon}
          </div>
          <div className="stat-content">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-description">{stat.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
