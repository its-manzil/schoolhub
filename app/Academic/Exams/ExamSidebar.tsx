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
    { label: 'Analytics', path: 'Analytics', icon: BarChart2 },
    { label: 'Configuration', path: 'Configuration', icon: Settings },
    { label: 'Routine', path: 'Routine', icon: Calendar },
    { label: 'Admit card', path: 'AdmitCard', icon: CreditCard },
    { label: 'Subject map', path: 'SubjectMap', icon: Map },
    { label: 'Marks entry', path: 'MarksEntry', icon: Edit3 },
    { label: 'Result', path: 'Result', icon: FileText },
  ];

  const getHref = (path: string) => {
    if (pathname.startsWith('/SchoolAdmin/Academics/Exams')) {
      // Map capitalized paths to lowercase/hyphenated paths for SchoolAdmin
      const mapping: Record<string, string> = {
        'AdmitCard': 'admit-card',
        'MarksEntry': 'marks-entry',
        'SubjectMap': 'subject-map'
      };
      const segment = mapping[path] || path.toLowerCase();
      return `/SchoolAdmin/Academics/Exams/${segment}`;
    }
    return `/Academic/Exams/${path}`;
  };

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>Exam Management</h2>
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const href = getHref(item.path);
          const isActive = pathname === href;
          return (
            <Link
              key={item.path}
              href={href}
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
