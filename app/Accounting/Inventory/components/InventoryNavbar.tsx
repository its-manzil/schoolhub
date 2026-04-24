'use client';

import { Package, Plus, List, ArrowLeftRight, BarChart3 } from 'lucide-react';
import { TabType } from '../types';
import '../styles/navbar.css';

interface InventoryNavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function InventoryNavbar({ activeTab, onTabChange }: InventoryNavbarProps) {
  const tabs = [
    { id: 'add' as TabType, label: 'Add Inventory', icon: Plus },
    { id: 'list' as TabType, label: 'Inventory List', icon: List },
    { id: 'stock' as TabType, label: 'Stock Management', icon: ArrowLeftRight },
    { id: 'reports' as TabType, label: 'Reports & Profit', icon: BarChart3 },
  ];

  return (
    <div className="inventory-navbar">
      <div className="navbar-header">
        <Package size={24} />
        <h1>Inventory Management</h1>
      </div>
      <nav className="navbar-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`navbar-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
