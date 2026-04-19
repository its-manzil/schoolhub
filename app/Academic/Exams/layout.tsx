'use client';

import React from 'react';
import AcademicNavbar from '../components/AcademicNavbar';
import ExamSidebar from './ExamSidebar';
import './layout.css';
import './exam.css'; // Include existing styles for consistency

export default function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="academic-layout">
      <AcademicNavbar />
      <main className="academic-main">
        <div className="exam-layout-container">
          <ExamSidebar />
          <div className="exam-main-content">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
