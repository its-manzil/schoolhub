'use client';

import Link from 'next/link';
import { 
  Plus, 
  Package, 
  ListTodo, 
  PieChart, 
  UserMinus,
  ChevronRight
} from 'lucide-react';
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
      icon: Plus,
      href: `${basePath}/academic-billing`,
      variant: 'primary'
    },
    {
      title: 'Generate Inventory Bill',
      description: 'Create item invoices',
      icon: Package,
      href: `${basePath}/inventory-billing`,
      variant: 'success'
    },
    {
      title: 'View Pending Dues',
      description: 'Track unpaid bills',
      icon: ListTodo,
      href: `${basePath}/academic-bill-receipt`,
      variant: 'info'
    },
    {
      title: 'View Reports',
      description: 'Analytics & insights',
      icon: PieChart,
      href: `${basePath}/academic-bill-receipt`,
      variant: 'warning'
    }
  ];

  if (overdueCount > 0) {
    actions.push({
      title: 'View Overdue Students',
      description: `${overdueCount} overdue bill${overdueCount > 1 ? 's' : ''}`,
      icon: UserMinus,
      href: `${basePath}/academic-bill-receipt`,
      variant: 'danger'
    });
  }

  return (
    <div className="quick-actions-container">
      <h3 className="quick-actions-title">Quick Actions</h3>
      <div className="quick-actions-grid">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={index} href={action.href} className="quick-action-card">
              <div className={`quick-action-icon quick-action-icon-${action.variant}`}>
                <Icon size={18} />
              </div>
              <div className="quick-action-content">
                <h4 className="quick-action-title">{action.title}</h4>
                <p className="quick-action-description">{action.description}</p>
              </div>
              <div className="quick-action-arrow">
                <ChevronRight size={14} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
