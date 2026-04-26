'use client';

import Link from 'next/link';
import './quick-actions.css';

interface QuickActionsPanelProps {
  basePath: string;
  overdueCount: number;
}

export default function QuickActionsPanel({ basePath, overdueCount }: QuickActionsPanelProps) {
  const actions = [
    {
      title: 'Generate Academic Bill',
      description: 'Create fee invoices',
      icon: 'fa-plus',
      href: `${basePath}/academic-billing`,
      variant: 'primary'
    },
    {
      title: 'Generate Inventory Bill',
      description: 'Create item invoices',
      icon: 'fa-box',
      href: `${basePath}/inventory-billing`,
      variant: 'success'
    },
    {
      title: 'View Pending Dues',
      description: 'Track unpaid bills',
      icon: 'fa-list-alt',
      href: `${basePath}/academic-bill-receipt`,
      variant: 'info'
    },
    {
      title: 'View Reports',
      description: 'Analytics & insights',
      icon: 'fa-chart-bar',
      href: `${basePath}/academic-bill-receipt`,
      variant: 'warning'
    }
  ];

  if (overdueCount > 0) {
    actions.push({
      title: 'View Overdue Students',
      description: `${overdueCount} overdue bill${overdueCount > 1 ? 's' : ''}`,
      icon: 'fa-user-slash',
      href: `${basePath}/academic-bill-receipt`,
      variant: 'danger'
    });
  }

  return (
    <div className="quick-actions-container">
      <h3 className="quick-actions-title">Quick Actions</h3>
      <div className="quick-actions-grid">
        {actions.map((action, index) => (
          <Link key={index} href={action.href} className={`quick-action-card quick-action-${action.variant}`}>
            <div className={`quick-action-icon quick-action-icon-${action.variant}`}>
              <i className={`fas ${action.icon}`}></i>
            </div>
            <div className="quick-action-content">
              <h4 className="quick-action-title">{action.title}</h4>
              <p className="quick-action-description">{action.description}</p>
            </div>
            <div className="quick-action-arrow">
              <i className="fas fa-chevron-right"></i>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
