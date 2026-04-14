import React, { useState } from 'react';
import styles from './Sidebar.module.css';
import { SidebarItem } from './SidebarItem';
import { SectionType } from '../../../types/billing';

interface SidebarSectionProps {
  icon: string;
  label: string;
  isOpen?: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({ 
  icon, 
  label, 
  isOpen = false, 
  onToggle, 
  children 
}) => {
  return (
    <div>
      <SidebarItem 
        icon={icon} 
        label={label} 
        active={isOpen} 
        onClick={onToggle} 
      />
      <div className={`${styles.submenu} ${isOpen ? styles.show : ''}`}>
        {children}
      </div>
    </div>
  );
};
