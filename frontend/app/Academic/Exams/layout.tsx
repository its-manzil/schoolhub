'use client';

import React from 'react';
import AcademicNavbar from '../components/AcademicNavbar';
import ExamsPage from './components/ExamsPage';
import './layout.css';
import './exam.css';

export default function ExamLayout() {
  return (
    <div className="academic-layout">
      <AcademicNavbar />
      <main className="academic-main">
        <ExamsPage />
      </main>
    </div>
  );
}
