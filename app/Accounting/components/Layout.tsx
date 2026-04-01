import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./Layout.css";
import {
  BarChart3,
  Settings,
  FileText,
  DollarSign,
  TrendingUp,
  Building2,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: BarChart3,
      section: "Dashboard",
    },
    {
      label: "Academic",
      href: "/Academic",
      icon: Building2,
      section: "Academic",
    },
    {
      label: "Administrative",
      href: "/SchoolAdmin",
      icon: Settings,
      section: "Administrative",
    },
    {
      label: "Accountant",
      href: "/Accounting",
      icon: DollarSign,
      section: "Accountant",
    },
  ];

  const accountingMenuItems = [
    {
      label: "Dashboard",
      href: "/Accounting",
      icon: BarChart3,
    },
    {
      label: "Configuration",
      href: "/Accounting/configuration",
      icon: Settings,
    },
    {
      label: "Voucher Entry",
      href: "/Accounting/voucher",
      icon: FileText,
    },
    {
      label: "TDS Management",
      href: "/Accounting/tds",
      icon: DollarSign,
    },
    {
      label: "Fixed Assets",
      href: "/Accounting/assets",
      icon: Building2,
    },
    {
      label: "Reports",
      href: "/Accounting/reports",
      icon: TrendingUp,
    },
  ];

  const isAccountingPath = pathname?.startsWith("/Accounting") || pathname?.startsWith("/accounting");
  const relevantMenuItems = isAccountingPath
    ? accountingMenuItems
    : navigationItems;

  return (
    <div className="layout-container">
      {/* Top Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mobile-menu-btn"
            >
              {sidebarOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="logo-link">
              <div className="logo-icon">
                <span>SH</span>
              </div>
              <span className="logo-text">
                SchoolHub
              </span>
            </Link>
          </div>

          {/* Main Navigation Tabs */}
          <nav className="nav-tabs">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-tab ${isActive ? "nav-tab-active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="header-right">
            <button className="header-btn">
              Sign In
            </button>
            <button className="header-btn">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="main-wrapper">
        {/* Sidebar */}
        <aside
          className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}
        >
          <nav className="sidebar-nav">
            <div className="sidebar-links">
              {isAccountingPath && (
                <div className="sidebar-section">
                  <p className="sidebar-section-title">
                    Accounting
                  </p>
                </div>
              )}

              {relevantMenuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon size={20} />
                    <span className="sidebar-link-text">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="sidebar-footer">
            <button className="logout-btn">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="content-area">
          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="overlay"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
