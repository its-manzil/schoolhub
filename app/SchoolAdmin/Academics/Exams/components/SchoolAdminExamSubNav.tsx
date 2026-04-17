'use client'

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./SchoolAdminExamSubNav.css";

interface SchoolAdminExamSubNavProps {
  children: ReactNode;
}

export default function SchoolAdminExamSubNav({ children }: SchoolAdminExamSubNavProps) {
  const pathname = usePathname();

  // Sub-navigation items for exam sections - use SchoolAdmin paths
  const subNavItems = [
    { label: 'Analytics', href: '/SchoolAdmin/Academics/Exams/Analytics' },
    { label: 'Configuration', href: '/SchoolAdmin/Academics/Exams/Configuration' },
    { label: 'Routine', href: '/SchoolAdmin/Academics/Exams/Routine' },
    { label: 'Admit Card', href: '/SchoolAdmin/Academics/Exams/AdmitCard' },
    { label: 'Subject Map', href: '/SchoolAdmin/Academics/Exams/SubjectMap' },
    { label: 'Marks Entry', href: '/SchoolAdmin/Academics/Exams/MarksEntry' },
    { label: 'Result', href: '/SchoolAdmin/Academics/Exams/Result' },
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
