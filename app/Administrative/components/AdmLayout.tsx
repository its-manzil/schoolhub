"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "./Layout.css";
import { Bell, Info, AlertTriangle, CheckCircle, Menu, LogOut, Shield } from "lucide-react";


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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const notificationRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

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

  useEffect(() => {
    // Check user role and permissions
    const checkUserRole = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!token || !userData) {
          router.push('/login');
          return;
        }

        const user = JSON.parse(userData);
        const role = user.role?.toLowerCase();
        
        // Only allow superadmin and administrative roles
        if (role !== 'superadmin' && role !== 'administrative') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        
        setUserRole(role);
        setLoading(false);
      } catch (error) {
        console.error('Error checking user role:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
    };

    checkUserRole();
  }, [router]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
    { label: "Organization Setup", href: "/Administrative" },
    { label: "Templates", href: "/Administrative/templates" },
    { label: "Notice Board", href: "/Administrative/notice-board" },
    { label: "Staffs", href: "/Administrative/staff" },
    { label: "Attendance Teacher", href: "/Administrative/timetable/attendance" },
    { label: "Teacher App", href: "/Administrative/teacherapp" },
    { label: "Student App", href: "/Administrative/studentapp" },
    { label: "Parent App", href: "/Administrative/parentapp" },
    { label: "Settings", href: "/Administrative/timetable/settings" },
  ];

  // Helper to get page title based on pathname
  const getPageTitle = () => {
    const item = adminMenuItems.find((m) => m.href === pathname);
    return item ? item.label : "Administrative";
  };

  return (
    <>
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
                  <Shield size={16} />
                </div>
                <span className="admin-role-text">
                  {userRole === 'superadmin' ? 'Super Admin' : 'Administrative'}
                </span>
              </div>
              
              <button 
                className="admin-logout-btn"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
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
