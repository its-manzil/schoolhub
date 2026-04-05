import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./Layout.css";
import {
  Bell, Menu,
} from "lucide-react";
import { useState } from "react";
import SchoolAdminNavbar from "../../SchoolAdmin/Components/SchoolAdminNavbar";

interface LayoutProps {
  children: ReactNode;
  actions?: ReactNode;
}

export default function Layout({ children, actions }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const accountingMenuItems = [
    {
      label: "Dashboard",
      href: "/Accounting",
    },
    {
      label: "Configuration",
      href: "/Accounting/configuration",
    },
    {
      label: "Voucher Entry",
      href: "/Accounting/voucher",
    },
    {
      label: "TDS Management",
      href: "/Accounting/tds",
    },
    {
      label: "Fixed Assets",
      href: "/Accounting/assets",
    },
    {
      label: "Reports",
      href: "/Accounting/reports",
    },
    {
      label: "Notifications",
      href: "/Accounting/notifications",
    },
    {
      label: "Settings",
      href: "/Accounting/settings",
    },
  ];

  // Helper to get page title based on pathname
  const getPageTitle = () => {
    const item = accountingMenuItems.find(m => m.href === pathname);
    return item ? item.label : "Accounting";
  };

  return (
    <>
      <SchoolAdminNavbar />
      <div className="accounting-layout">
        {/* Sidebar - Matching Academic Sidebar style */}
        <aside className={`accounting-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
          <div className="accounting-sidebar-header">
            <span className="accounting-sidebar-title">Accounting Panel</span>
          </div>
          <nav className="accounting-sidebar-nav">
            {accountingMenuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`accounting-nav-link ${isActive ? "accounting-nav-link-active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className={`accounting-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
          {/* Top Header - Matching Academic style */}
          <div className="accounting-header">
            <div className="accounting-header-left">
              <div className="accounting-header-title-row">
                <button 
                  className="mobile-sidebar-toggle" 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu size={24} />
                </button>
                <h1 className="accounting-page-title">{getPageTitle()}</h1>
              </div>
              <p className="accounting-page-subtitle">Manage school finances and accounting records.</p>
            </div>
            <div className="accounting-header-right">
              {actions && <div className="accounting-header-actions">{actions}</div>}
              <button className="accounting-icon-btn">
                <Bell size={20} />
              </button>
              <div className="accounting-role-badge">
                <div className="accounting-role-icon">
                  <span>$</span>
                </div>
                <span className="accounting-role-text">Accountant</span>
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

          <div className="accounting-content-inner">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
