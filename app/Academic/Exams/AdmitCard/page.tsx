import AcademicNavbar from '../../components/AcademicNavbar'
import ExamSubNav from '../components/ExamSubNav'

export default function ExamAdmitCardPage() {
  return (
    <div className="academic-layout">
      <AcademicNavbar />
      <main className="academic-main">
        <ExamSubNav>
          <div className="exam-section">
            <h2>Welcome to Admit Card</h2>
            <p>Generate and manage student admit cards for examinations.</p>
          </div>
        </ExamSubNav>
      </main>
    </div>
  );
}
