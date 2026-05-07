'use client'

import { useState } from 'react';
import Analytics from "../Analytics/page";
import Configuration from "../Configuration/page";
import Routine from "../Routine/page";
import AdmitCard from "../AdmitCard/page";
import SubjectMap from "../SubjectMap/page";
import MarksEntry from "../MarksEntry/page";
import Result from "../Result/page";
import "./ExamLayout.css";

export default function ExamsPage() {
  const [activeTab, setActiveTab] = useState('Analytics');

  // Sub-navigation items for exam sections
  const subNavItems = [
    { label: 'Analytics', id: 'Analytics' },
    { label: 'Configuration', id: 'Configuration' },
    { label: 'Routine', id: 'Routine' },
    { label: 'Admit Card', id: 'AdmitCard' },
    { label: 'Subject Map', id: 'SubjectMap' },
    { label: 'Marks Entry', id: 'MarksEntry' },
    { label: 'Result', id: 'Result' },
  ];

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
    <div className="exam-subnav-layout">
      <aside className="exam-subnav-sidebar">
        <h2 className="exam-subnav-title">EXAMS</h2>
        <nav className="exam-subnav-nav">
          {subNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`exam-subnav-link ${isActive ? "exam-subnav-link-active" : ""}`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="exam-subnav-main-content">
        {renderContent()}
      </main>
    </div>
  );
}
