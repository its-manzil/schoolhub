import AcademicNavbar from '../../components/AcademicNavbar'
import ExamSubNav from '../components/ExamSubNav'

export default function ExamRoutinePage() {
  return (
    <div className="academic-layout">
      <AcademicNavbar />
      <main className="academic-main">
        <ExamSubNav>
          <div className="exam-section">
            <h2>Welcome to Routine</h2>
            <p>Manage exam schedules, create timetables, and organize examination routines.</p>
          </div>
        </ExamSubNav>
      </main>
    </div>
  );
}
