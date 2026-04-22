import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "./Layout.css";
import {
  Bell, Menu, LogOut,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  actions?: ReactNode;
}

const getAccountingBasePath = (role: string) => {
  const rolePathMap: Record<string, string> = {
    accountant: "/Accounting",
    schooladmin: "/SchoolAdmin/Accounting",
    teacher: "/Teacher/Accounting",
  };

  return rolePathMap[role] || "/Accounting";
};

export default function Layout({ children, actions }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState("accountant");
  const [accPath, setAccPath] = useState("/Accounting");
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Initialize role and path after mount (client-side only)
  useEffect(() => {
    setIsMounted(true);
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const userRole = user?.role || "accountant";
        setRole(userRole);
        setAccPath(getAccountingBasePath(userRole));
      }
    } catch {
      // Keep defaults
    }
  }, []);

  // Route protection - redirect if on wrong path
  useEffect(() => {
    if (!isMounted) return;
    if (!pathname.startsWith(accPath)) {
      router.replace(accPath);
    }
  }, [pathname, accPath, router, isMounted]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const accountingMenuItems = [
    {
      label: "Dashboard",
      href: `${accPath}`,
    },
    {
      label: "Configuration",
      href: `${accPath}/configuration`,
    },
    {
      label: "Voucher Entry",
      href: `${accPath}/Voucher`,
    },
    {
      label: "TDS Management",
      href: `${accPath}/tds`,
    },
    {
      label: "Inventory",
      href: `${accPath}/Inventory`,
    },
    {
      label: "Fixed Assets",
      href: `${accPath}/assets`,
    },
    {
      label: "Reports",
      href: `${accPath}/reports`,
    },
    {
      label: "Notifications",
      href: `${accPath}/notifications`,
    },
    {
      label: "Settings",
      href: `${accPath}/settings`,
    },
  ];

  // Helper to get page title based on pathname
  const getPageTitle = () => {
    const item = accountingMenuItems.find(m => m.href === pathname);
    return item ? item.label : "Accounting";
  };

  return (
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
            <button 
              className="accounting-logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
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
                <span className="accounting-role-text">{role === "schooladmin" ? "School Admin" : role === "teacher" ? "Teacher" : "Accountant"}</span>
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
  );
}
