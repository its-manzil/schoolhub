import AcademicNavbar from '../../components/AcademicNavbar'
import ExamSubNav from '../components/ExamSubNav'

export default function ExamConfigurationPage() {
  return (
    <div className="academic-layout">
      <AcademicNavbar />
      <main className="academic-main">
        <ExamSubNav>
          <div className="exam-section">
            <h2>Welcome to Configuration</h2>
            <p>Configure exam settings, grading systems, and examination policies.</p>
          </div>
        </ExamSubNav>
      </main>
    </div>
  );
}
