import AcademicNavbar from '../../components/AcademicNavbar'
import ExamSubNav from '../components/ExamSubNav'

export default function ExamAnalyticsPage() {
  return (
    <div className="academic-layout">
      <AcademicNavbar />
      <main className="academic-main">
        <ExamSubNav>
          <div className="exam-section">
            <h2>Welcome to Analytics</h2>
            <p>View comprehensive exam analytics, performance metrics, and statistical reports.</p>
          </div>
        </ExamSubNav>
      </main>
    </div>
  );
}
