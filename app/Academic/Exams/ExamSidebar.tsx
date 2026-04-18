'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart2, 
  Settings, 
  Calendar, 
  CreditCard, 
  Map, 
  Edit3, 
  FileText 
} from 'lucide-react';
import styles from './ExamSidebar.module.css';

const ExamSidebar = () => {
  const pathname = usePathname();

  // Helper to determine base path
  const getBasePath = () => {
    if (pathname.startsWith('/SchoolAdmin/Academics/Exams')) {
      return '/SchoolAdmin/Academics/Exams';
    }
    return '/Academic/Exams';
  };

  const basePath = getBasePath();

  const navItems = [
    { label: 'Analytics', href: `${basePath}/analytics`, icon: BarChart2 },
    { label: 'Configuration', href: `${basePath}/configuration`, icon: Settings },
    { label: 'Routine', href: `${basePath}/routine`, icon: Calendar },
    { label: 'Admit card', href: `${basePath}/admit-card`, icon: CreditCard },
    { label: 'Subject map', href: `${basePath}/subject-map`, icon: Map },
    { label: 'Marks entry', href: `${basePath}/marks-entry`, icon: Edit3 },
    { label: 'Result', href: `${basePath}/result`, icon: FileText },
  ];

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>CONFIGURATION</h2>
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
            >
              <item.icon className={styles.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default ExamSidebar;
