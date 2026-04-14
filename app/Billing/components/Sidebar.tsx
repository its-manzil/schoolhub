import React, { useState } from 'react';
import styles from './Sidebar.module.css';
import { SectionType } from '../../../types/billing';

interface SidebarProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Internal Helper: Sidebar Item
  const MenuItem = ({ 
    icon, 
    label, 
    id, 
    hasChevron = false 
  }: { 
    icon: string; 
    label: string; 
    id: SectionType; 
    hasChevron?: boolean 
  }) => {
    const isActive = activeSection === id;
    return (
      <div 
        className={`${styles.menuItem} ${isActive ? styles.active : ''}`} 
        onClick={() => onSectionChange(id)}
      >
        <span><i className={icon}></i> {label}</span>
        {hasChevron && <i className={`fas fa-chevron-${isActive ? 'down' : 'right'}`}></i>}
      </div>
    );
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarFiscalInfo}>
        <div style={{ fontSize: '20px' }}>Billing Section</div>
      </div>
      
      <div className={styles.sidebarMenu}>
        <MenuItem icon="" label="Dashboard" id="dashboard" />
        <MenuItem icon="" label="Billing Setup" id="billing-setup" />
        <MenuItem icon="" label="Receipt Collection" id="receipt-collection" />
        <MenuItem icon="" label="Bill Generate" id="bill-generate" />
        <MenuItem icon="" label="Bill/Receipt Edit" id="bill-edit" />
        <MenuItem icon="" label="Advance Bill Print" id="advance-bill-print" />
        <MenuItem icon="" label="Settings" id="settings" />

        {/* Collection Report Section */}
        <div 
          className={`${styles.menuItem} ${isReportOpen ? styles.active : ''}`}
          onClick={() => setIsReportOpen(!isReportOpen)}
        >
          <span><i className=""></i> Collection Report</span>
          <i className={`fas fa-chevron-${isReportOpen ? 'down' : 'right'}`}></i>
        </div>
        
        <div className={`${styles.submenu} ${isReportOpen ? styles.show : ''}`}>
          <div 
            className={`${styles.submenuItem} ${activeSection === 'collection-summary' ? styles.active : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSectionChange('collection-summary');
            }}
          >
            Collection Summary
          </div>
        </div>
      </div>
    </aside>
  );
};
