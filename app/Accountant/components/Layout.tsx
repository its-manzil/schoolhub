import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
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
  const location = useLocation();

  const navigationItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: BarChart3,
      section: "Dashboard",
    },
    {
      label: "Academic",
      href: "/academic",
      icon: Building2,
      section: "Academic",
    },
    {
      label: "Administrative",
      href: "/administrative",
      icon: Settings,
      section: "Administrative",
    },
    {
      label: "Accountant",
      href: "/accounting",
      icon: DollarSign,
      section: "Accountant",
    },
  ];

  const accountingMenuItems = [
    {
      label: "Dashboard",
      href: "/accounting",
      icon: BarChart3,
    },
    {
      label: "Configuration",
      href: "/accounting/configuration",
      icon: Settings,
    },
    {
      label: "Voucher Entry",
      href: "/accounting/voucher",
      icon: FileText,
    },
    {
      label: "TDS Management",
      href: "/accounting/tds",
      icon: DollarSign,
    },
    {
      label: "Fixed Assets",
      href: "/accounting/assets",
      icon: Building2,
    },
    {
      label: "Reports",
      href: "/accounting/reports",
      icon: TrendingUp,
    },
  ];

  const isAccountingPath = location.pathname.startsWith("/accounting");
  const relevantMenuItems = isAccountingPath
    ? accountingMenuItems
    : navigationItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">SH</span>
              </div>
              <span className="font-bold text-lg text-gray-800 hidden sm:inline">
                SchoolHub
              </span>
            </Link>
          </div>

          {/* Main Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "px-4 py-2 rounded-t-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white text-primary border-b-2 border-primary"
                      : "text-gray-600 hover:text-gray-800"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button className="text-gray-600 hover:text-gray-800 font-medium text-sm">
              Sign In
            </button>
            <button className="text-gray-600 hover:text-gray-800 font-medium text-sm">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 overflow-y-auto transition-transform lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            "lg:translate-x-0"
          )}
          style={{ top: "var(--header-height, 64px)" }}
        >
          <nav className="p-4">
            <div className="space-y-1">
              {isAccountingPath && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Accounting
                  </p>
                </div>
              )}

              {relevantMenuItems.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-50 text-primary border-l-4 border-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 lg:hidden z-20"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
