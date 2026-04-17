import AcademicNavbar from '../components/AcademicNavbar'
import ExamSubNav from './components/ExamSubNav'
import './exam.css'

export default function AcademicExamsPage() {
  return (
    <div className="academic-layout">
      <AcademicNavbar />
      <main className="academic-main">
        <ExamSubNav>
          <div className="exam-section">
            <h2>Welcome to Exams</h2>
            <p>Manage examinations, schedules, and student assessments. Use the sidebar to navigate to specific exam functionalities.</p>
          </div>
        </ExamSubNav>
      </main>
    </div>
  )
}
