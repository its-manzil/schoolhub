import ExamsPage from "@/app/Academic/Exams/components/ExamsPage";
import SchoolAdminNavbar from "../../Components/SchoolAdminNavbar";
import '@/app/Academic/Exams/layout.css';
import '@/app/Academic/Exams/exam.css';
import AcademicNavbar from "@/app/Academic/components/AcademicNavbar";

export default function Page() {
  return (
    <div className="academic-layout">
      <SchoolAdminNavbar />
      <AcademicNavbar/>
      <main className="academic-main">
        <ExamsPage />
      </main>
    </div>
  );
}
