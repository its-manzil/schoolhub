import AcademicNavbar from '../../components/AcademicNavbar'
import ExamSubNav from '../components/ExamSubNav'

export default function ExamSubjectMapPage() {
  return (
    <div className="academic-layout">
      <AcademicNavbar />
      <main className="academic-main">
        <ExamSubNav>
          <div className="exam-section">
            <h2>Welcome to Subject Map</h2>
            <p>Map subjects to classes, manage subject combinations, and organize curriculum structure.</p>
          </div>
        </ExamSubNav>
      </main>
    </div>
  );
}
