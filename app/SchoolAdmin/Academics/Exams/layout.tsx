'use client';

import React from 'react';
import SchoolAdminNavbar from '../../Components/SchoolAdminNavbar';
import AcademicNavbar from '../../../Academic/components/AcademicNavbar';
import '../../../Academic/Exams/layout.css';
import '../../../Academic/Exams/exam.css';

export default function SchoolAdminExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SchoolAdminNavbar />
      <div className="academic-layout">
        <AcademicNavbar />
        <main className="academic-main">
          {children}
        </main>
      </div>
    </>
  );
}
