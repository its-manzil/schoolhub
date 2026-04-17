import AcademicNavbar from '../../components/AcademicNavbar'
import ExamSubNav from '../components/ExamSubNav'

export default function ExamMarksEntryPage() {
  return (
    <div className="academic-layout">
      <AcademicNavbar />
      <main className="academic-main">
        <ExamSubNav>
          <div className="exam-section">
            <h2>Welcome to Marks Entry</h2>
            <p>Enter student marks, manage grades, and calculate examination results.</p>
          </div>
        </ExamSubNav>
      </main>
    </div>
  );
}
