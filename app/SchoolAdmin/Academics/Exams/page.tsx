'use client'

import { useState } from 'react';
import SchoolAdminExamSubNav, { ExamTab } from "./components/SchoolAdminExamSubNav";
import Analytics from "../../../Academic/Exams/Analytics/page";
import Configuration from "../../../Academic/Exams/Configuration/page";
import Routine from "../../../Academic/Exams/Routine/page";
import AdmitCard from "../../../Academic/Exams/AdmitCard/page";
import SubjectMap from "../../../Academic/Exams/SubjectMap/page";
import MarksEntry from "../../../Academic/Exams/MarksEntry/page";
import Result from "../../../Academic/Exams/Result/page";

export default function SchoolAdminAcademicExamsPage() {
  const [activeTab, setActiveTab] = useState<ExamTab>('Analytics');

  const renderContent = () => {
    switch (activeTab) {
      case 'Analytics':
        return <Analytics />;
      case 'Configuration':
        return <Configuration />;
      case 'Routine':
        return <Routine />;
      case 'AdmitCard':
        return <AdmitCard />;
      case 'SubjectMap':
        return <SubjectMap />;
      case 'MarksEntry':
        return <MarksEntry />;
      case 'Result':
        return <Result />;
      default:
        return <Analytics />;
    }
  };

  return (
    <SchoolAdminExamSubNav activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </SchoolAdminExamSubNav>
  );
}
