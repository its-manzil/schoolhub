'use client'

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "./ExamLayout.css";
import {
  Bell, Menu, LogOut,
} from "lucide-react";
import { useState } from "react";

interface ExamLayoutProps {
  children: ReactNode;
  actions?: ReactNode;
}

export default function ExamLayout({ children, actions }: ExamLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const examMenuItems = [
    {
      label: "Dashboard",
      href: "/Academic/Exams",
    },
    {
      label: "Analytics",
      href: "/Academic/Exams/Analytics",
    },
    {
      label: "Configuration",
      href: "/Academic/Exams/Configuration",
    },
    {
      label: "Routine",
      href: "/Academic/Exams/Routine",
    },
    {
      label: "Admit Card",
      href: "/Academic/Exams/AdmitCard",
    },
    {
      label: "Subject Map",
      href: "/Academic/Exams/SubjectMap",
    },
    {
      label: "Marks Entry",
      href: "/Academic/Exams/MarksEntry",
    },
    {
      label: "Result",
      href: "/Academic/Exams/Result",
    },
  ];

  // Helper to get page title based on pathname
  const getPageTitle = () => {
    const item = examMenuItems.find(m => m.href === pathname);
    return item ? item.label : "Exams";
  };

  // Sub-navigation items for exam sections - always show the main exam sections
  const subNavItems = [
    { label: 'Analytics', href: '/Academic/Exams/Analytics' },
    { label: 'Configuration', href: '/Academic/Exams/Configuration' },
    { label: 'Routine', href: '/Academic/Exams/Routine' },
    { label: 'Admit Card', href: '/Academic/Exams/AdmitCard' },
    { label: 'Subject Map', href: '/Academic/Exams/SubjectMap' },
    { label: 'Marks Entry', href: '/Academic/Exams/MarksEntry' },
    { label: 'Result', href: '/Academic/Exams/Result' },
  ];

  const showSubNav = true; // Always show sub-sidebar

  return (
    <div className="exam-layout">
        {/* Sidebar - Matching Academic Sidebar style */}
        <aside className={`exam-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
          <div className="exam-sidebar-header">
            <span className="exam-sidebar-title">Exam Panel</span>
          </div>
          <nav className="exam-sidebar-nav">
            {examMenuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`exam-nav-link ${isActive ? "exam-nav-link-active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <button 
              className="exam-logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className={`exam-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
          {/* Top Header - Matching Academic style */}
          <div className="exam-header">
            <div className="exam-header-left">
              <div className="exam-header-title-row">
                <button 
                  className="mobile-sidebar-toggle" 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu size={24} />
                </button>
                <h1 className="exam-page-title">{getPageTitle()}</h1>
              </div>
              <p className="exam-page-subtitle">Manage examinations, schedules, and student assessments.</p>
            </div>
            <div className="exam-header-right">
              {actions && <div className="exam-header-actions">{actions}</div>}
              <button className="exam-icon-btn">
                <Bell size={20} />
              </button>
              <div className="exam-role-badge">
                <div className="exam-role-icon">
                  <span>📝</span>
                </div>
                <span className="exam-role-text">Exam Manager</span>
              </div>
            </div>
          </div>

          {/* Content Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="overlay"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className="exam-content-inner">
            {showSubNav && (
              <div className="exam-subnav-layout">
                <aside className="exam-subnav-sidebar">
                  <h2 className="exam-subnav-title">EXAMS</h2>
                  <nav className="exam-subnav-nav">
                    {subNavItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`exam-subnav-link ${isActive ? "exam-subnav-link-active" : ""}`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                </aside>
                <main className="exam-subnav-main-content">
                  {children}
                </main>
              </div>
            )}
            {!showSubNav && children}
          </div>
        </main>
      </div>
  );
}
