'use client'

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./ExamLayout.css";

interface ExamSubNavProps {
  children: ReactNode;
}

export default function ExamSubNav({ children }: ExamSubNavProps) {
  const pathname = usePathname();

  // Sub-navigation items for exam sections
  const subNavItems = [
    { label: 'Analytics', href: '/Academic/Exams/Analytics' },
    { label: 'Configuration', href: '/Academic/Exams/Configuration' },
    { label: 'Routine', href: '/Academic/Exams/Routine' },
    { label: 'Admit Card', href: '/Academic/Exams/AdmitCard' },
    { label: 'Subject Map', href: '/Academic/Exams/SubjectMap' },
    { label: 'Marks Entry', href: '/Academic/Exams/MarksEntry' },
    { label: 'Result', href: '/Academic/Exams/Result' },
  ];

  return (
    <div className="exam-subnav-layout">
      <aside className="exam-subnav-sidebar">
        <h2 className="exam-subnav-title">EXAMS</h2>
        <nav className="exam-subnav-nav">
          {subNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`exam-subnav-link ${isActive ? "exam-subnav-link-active" : ""}`}
              >
                {item.label}
              </Link>
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
