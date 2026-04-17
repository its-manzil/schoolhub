import AcademicNavbar from '../../components/AcademicNavbar'
import ExamSubNav from '../components/ExamSubNav'

export default function ExamResultPage() {
  return (
    <div className="academic-layout">
      <AcademicNavbar />
      <main className="academic-main">
        <ExamSubNav>
          <div className="exam-section">
            <h2>Welcome to Result</h2>
            <p>View examination results, generate report cards, and analyze student performance.</p>
          </div>
        </ExamSubNav>
      </main>
    </div>
  );
}
