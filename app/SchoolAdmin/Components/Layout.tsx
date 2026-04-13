"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./Layout.css";
import { Bell, Info, AlertTriangle, CheckCircle, Menu } from "lucide-react";
import SchoolAdminNavbar from "./SchoolAdminNavbar";

interface LayoutProps {
  children: ReactNode;
  actions?: ReactNode;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
}

export default function Layout({ children, actions }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Mock notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "New Staff Member",
      message: "A new teacher 'Ram Prasad' has been added to the system.",
      time: "2 mins ago",
      type: 'success',
      read: false
    },
    {
      id: 2,
      title: "Notice Published",
      message: "The Spring Break notice has been published to all students.",
      time: "1 hour ago",
      type: 'info',
      read: false
    },
    {
      id: 3,
      title: "Low Attendance Alert",
      message: "Class 10-A has recorded lower than average attendance today.",
      time: "3 hours ago",
      type: 'warning',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'success': return <CheckCircle size={16} className="text-emerald-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  const adminMenuItems = [
    { label: "Organization Setup", href: "/SchoolAdmin" },
    { label: "Templates", href: "/SchoolAdmin/templates" },
    { label: "Notice Board", href: "/SchoolAdmin/notice-board" },
    { label: "Staff / Teachers", href: "/SchoolAdmin/staff" },
    { label: "Attendance Teacher", href: "/SchoolAdmin/timetable/attendance" },
    { label: "Teacher App", href: "/SchoolAdmin/teacherapp" },
    { label: "Student App", href: "/SchoolAdmin/studentapp" },
    { label: "Parent App", href: "/SchoolAdmin/parentapp" },
    { label: "Settings", href: "/SchoolAdmin/timetable/settings" },
  ];

  // Helper to get page title based on pathname
  const getPageTitle = () => {
    const item = adminMenuItems.find((m) => m.href === pathname);
    return item ? item.label : "Administrative";
  };

  return (
    <>
      <SchoolAdminNavbar />
      <div className="admin-layout">
        {/* Sidebar - Matching Accounting Sidebar style */}
        <aside className={`admin-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
          <div className="admin-sidebar-header">
            <span className="admin-sidebar-title">Admin Panel</span>
          </div>
          <nav className="admin-sidebar-nav">
            {adminMenuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-link ${isActive ? "admin-nav-link-active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className={`admin-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
          {/* Top Header - Matching Accounting style */}
          <div className="admin-header">
            <div className="admin-header-left">
              <div className="admin-header-title-row">
                <button 
                  className="mobile-sidebar-toggle" 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu size={24} />
                </button>
                <h1 className="admin-page-title">{getPageTitle()}</h1>
              </div>
              <p className="admin-page-subtitle">Manage school administration and records.</p>
            </div>
            <div className="admin-header-right">
              {actions && <div className="admin-header-actions">{actions}</div>}
              
              <div className="notification-wrapper" ref={notificationRef}>
                <button 
                  className={`admin-icon-btn ${notificationsOpen ? 'active' : ''}`} 
                  title="Notifications"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </button>

                {notificationsOpen && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h3>Notifications</h3>
                      <button onClick={markAllAsRead} className="mark-read-btn">Mark all as read</button>
                    </div>
                    <div className="notification-list">
                      {notifications.length > 0 ? (
                        notifications.map(notif => (
                          <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
                            <div className="notif-icon-box">
                              {getIcon(notif.type)}
                            </div>
                            <div className="notif-content">
                              <p className="notif-title">{notif.title}</p>
                              <p className="notif-message">{notif.message}</p>
                              <span className="notif-time">{notif.time}</span>
                            </div>
                            {!notif.read && <div className="unread-dot"></div>}
                          </div>
                        ))
                      ) : (
                        <div className="no-notifications">
                          <Bell size={32} className="text-gray-300 mb-2" />
                          <p>No notifications yet</p>
                        </div>
                      )}
                    </div>
                    <div className="notification-footer">
                      <Link href="/SchoolAdmin/notifications" onClick={() => setNotificationsOpen(false)}>
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="admin-role-badge">
                <div className="admin-role-icon">
                  <span>A</span>
                </div>
                <span className="admin-role-text">Administrator</span>
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

          <div className="admin-content-inner">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
