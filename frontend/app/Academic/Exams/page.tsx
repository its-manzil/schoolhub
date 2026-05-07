import ExamsPage from "./components/ExamsPage";
import AcademicNavbar from "../components/AcademicNavbar";
import './layout.css';
import './exam.css';

export default function SchoolExamPage() {
  return (
    <div className="academic-layout">
      <AcademicNavbar />
      <main className="academic-main">
        <ExamsPage />
      </main>
    </div>
  );
}
