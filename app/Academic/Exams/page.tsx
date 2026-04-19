'use client'

import AcademicNavbar from '../components/AcademicNavbar'
import './exam.css'

export default function AcademicExamsPage() {
  return (
    <div className="academic-layout">
      <AcademicNavbar />
      <main className="academic-main">
        <header className="academic-header">
          <div className="academic-header-left">
            <h1 className="academic-page-title">Exams</h1>
            <p className="academic-page-subtitle">
              Manage exams, create new ones, and enter student marks.
            </p>
          </div>
        </header>

        <div className="academic-grid">
          <div className="academic-left-column">
            <section className="academic-card">
              <h2>Exam Management</h2>
              <p>Select an option from the sidebar to manage exams.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
