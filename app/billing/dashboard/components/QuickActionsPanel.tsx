'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Package, Receipt, BarChart3, ChevronRight } from 'lucide-react';
import './quick-actions.css';

export default function QuickActionsPanel() {
  const [basePath, setBasePath] = useState('/billing');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role === 'schooladmin') {
        setBasePath('/SchoolAdmin/billing');
      }
    }
  }, []);

  const actions = [
    {
      title: 'Academic Billing',
      desc: 'Generate fee invoices',
      icon: <PlusCircle size={20} />,
      href: `${basePath}/academic-billing`,
      color: 'emerald'
    },
    {
      title: 'Inventory Billing',
      desc: 'Sell inventory items',
      icon: <Package size={20} />,
      href: `${basePath}/inventory-billing`,
      color: 'blue'
    },
    {
      title: 'View Receipts',
      desc: 'Track collections',
      icon: <Receipt size={20} />,
      href: `${basePath}/academic-bill-receipt`,
      color: 'indigo'
    },
    {
      title: 'Reports',
      desc: 'Financial insights',
      icon: <BarChart3 size={20} />,
      href: `${basePath}/academic-bill-receipt`,
      color: 'amber'
    }
  ];

  return (
    <div className="billing-quick-actions-card">
      <div className="actions-header">
        <h3 className="actions-title">Quick Actions</h3>
        <p className="actions-subtitle">Frequently used tools</p>
      </div>
      <div className="actions-list">
        {actions.map((action, index) => (
          <Link key={index} href={action.href} className="action-item">
            <div className={`action-icon-wrapper ${action.color}`}>
              {action.icon}
            </div>
            <div className="action-info">
              <span className="action-item-title">{action.title}</span>
              <span className="action-item-desc">{action.desc}</span>
            </div>
            <div className="action-arrow">
              <ChevronRight size={16} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
