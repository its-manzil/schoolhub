'use client';

import React, { useState } from 'react';
import AcademicNavbar from '../components/AcademicNavbar';
import SchoolAdminExamSubNav, { ExamTab } from '../../SchoolAdmin/Academics/Exams/components/SchoolAdminExamSubNav';
import { usePathname, useRouter } from 'next/navigation';
import './layout.css';
import './exam.css';

export default function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Determine active tab based on pathname
  const getActiveTab = (): ExamTab => {
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    return (lastSegment as ExamTab) || 'Analytics';
  };

  const handleTabChange = (tab: ExamTab) => {
    router.push(`/Academic/Exams/${tab}`);
  };

  return (
    <div className="academic-layout">
      <AcademicNavbar />
      <main className="academic-main">
        <SchoolAdminExamSubNav 
          activeTab={getActiveTab()} 
          onTabChange={handleTabChange}
        >
          {children}
        </SchoolAdminExamSubNav>
      </main>
    </div>
  );
}
