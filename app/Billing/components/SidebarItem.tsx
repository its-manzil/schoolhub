import React from 'react';
import styles from './Sidebar.module.css';
import { SectionType } from '../../../types/billing';

interface SidebarItemProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
  hasChevron?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  label, 
  active, 
  onClick, 
  hasChevron = true 
}) => {
  return (
    <div 
      className={`${styles.menuItem} ${active ? styles.active : ''}`} 
      onClick={onClick}
    >
      <span><i className={icon}></i> {label}</span>
      {hasChevron && <i className={`fas fa-chevron-${active ? 'down' : 'right'}`}></i>}
    </div>
  );
};
