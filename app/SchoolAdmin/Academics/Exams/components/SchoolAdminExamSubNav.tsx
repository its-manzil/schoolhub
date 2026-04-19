'use client'

import { ReactNode } from "react";
import "./SchoolAdminExamSubNav.css";

export type ExamTab = 'Analytics' | 'Configuration' | 'Routine' | 'AdmitCard' | 'SubjectMap' | 'MarksEntry' | 'Result';

interface SchoolAdminExamSubNavProps {
  children: ReactNode;
  activeTab: ExamTab;
  onTabChange: (tab: ExamTab) => void;
}

export default function SchoolAdminExamSubNav({ children, activeTab, onTabChange }: SchoolAdminExamSubNavProps) {
  // Sub-navigation items for exam sections
  const subNavItems: { label: string; id: ExamTab }[] = [
    { label: 'Analytics', id: 'Analytics' },
    { label: 'Configuration', id: 'Configuration' },
    { label: 'Routine', id: 'Routine' },
    { label: 'Admit Card', id: 'AdmitCard' },
    { label: 'Subject Map', id: 'SubjectMap' },
    { label: 'Marks Entry', id: 'MarksEntry' },
    { label: 'Result', id: 'Result' },
  ];

  return (
    <div className="exam-subnav-layout">
      <aside className="exam-subnav-sidebar">
        <h2 className="exam-subnav-title">EXAMS</h2>
        <nav className="exam-subnav-nav">
          {subNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`exam-subnav-link ${isActive ? "exam-subnav-link-active" : ""}`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="exam-subnav-main-content">
        {children}
      </main>
    </div>
  );
}
