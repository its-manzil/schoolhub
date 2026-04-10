"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { RxDashboard } from "react-icons/rx";
import { MdOutlineSchool, MdSubscriptions } from "react-icons/md";
import { FaUserShield } from "react-icons/fa";
import "../../SchoolAdmin/Components/SchoolAdminNavbar.css";
import { getCurrentBSDate, formatBSDate } from "../../utils/dateConverter";

export default function SchoolAdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isSchoolAdmin, setIsSchoolAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [schoolName, setSchoolName] = useState("");
  const [currentBSDate, setCurrentBSDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setIsClient(true);
    
    // Authentication check function moved inside useEffect
    const checkAuthentication = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!token || !userData) {
          router.push('/login');
          return;
        }

        const user = JSON.parse(userData);
        if (user.role !== 'schooladmin') {
          router.push('/login');
          return;
        }

        setIsSchoolAdmin(true);
        setSchoolName(user.schoolName || "SchoolHub Admin");
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [router]);

  // Update current date and time in BS
  useEffect(() => {
    const updateDateTime = () => {
      try {
        // Use the same BS date conversion as NepaliDatePicker
        const currentBSDate = getCurrentBSDate();
        
        if (currentBSDate) {
          const formattedDate = formatBSDate(currentBSDate);
          setCurrentBSDate(formattedDate);
        }
        
        // Format current time
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit',
          hour12: false 
        });
        
        setCurrentTime(timeStr);
      } catch (error) {
        console.error('Date conversion error:', error);
        // Fallback to English date
        const now = new Date();
        const fallbackDate = formatBSDate({
          year: now.getFullYear() + 57,
          month: now.getMonth() + 1,
          day: now.getDate()
        });
        setCurrentBSDate(fallbackDate);
        setCurrentTime(now.toLocaleTimeString());
      }
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const desktopNavLinks = [
    { href: "/SchoolAdmin/Dashboard", label: "Dashboard" },
    { href: "/SchoolAdmin/Academics", label: "Academic" },
    { href: "/SchoolAdmin", label: "Administrative" },
    { href: "/SchoolAdmin/Accounting", label: "Accounting" },
  ];

  const mobileNavLinks = [
    { href: "/SchoolAdmin/Dashboard", label: "Dashboard", icon: <RxDashboard size={20} /> },
    { href: "/SchoolAdmin/Academics", label: "Academic", icon: <MdOutlineSchool size={20} /> },
    { href: "/SchoolAdmin", label: "Administrative", icon: <FaUserShield size={20} /> },
    { href: "/SchoolAdmin/Accounting", label: "Accountant", icon: <MdSubscriptions size={20} /> },
  ];

  // Prevent hydration by returning minimal content on server
  if (!isClient) {
    return (
      <>
        {/* Desktop Header - Server Render */}
        <header className="superadmin-navbar desktop-header server-render">
          <div className="navbar-content">
            <div className="search-placeholder"></div>
            <nav className="desktop-nav">
              {desktopNavLinks.map((link) => (
                <div key={link.href} className="nav-link server-nav-link">
                  {link.label}
                </div>
              ))}
            </nav>
          </div>
        </header>

        {/* Mobile Header - Server Render */}
        <header className="superadmin-navbar mobile-header server-render">
          <span style={{ color: '#374151', fontSize: '1.25rem', fontWeight: 'bold' }}>LOGO</span>
          <div className="mobile-search-placeholder"></div>
        </header>

        {/* Mobile Bottom Navigation - Server Render */}
        <div className="mobile-bottom-nav server-render">
          <div className="bottom-nav-container">
            {mobileNavLinks.map((link) => (
              <div key={link.href} className="mobile-nav-item server-mobile-nav-item">
                <div className="nav-icon-placeholder"></div>
                <span className="nav-label">{link.label}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Show loading state or redirect if not schooladmin
  if (isLoading) {
    return (
      <div className="navbar-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!isSchoolAdmin) {
    return null; // Will redirect to login page
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="superadmin-navbar desktop-header">
        <div className="navbar-content">
          <div className="nav-left-section">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: 'var(--primary-green)',
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--primary-green)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                S
              </div>
              SchoolHub
            </div>
            <div className="school-info">
              <h3 className="school-name">{schoolName}</h3>
              <div className="datetime-display">
                <span className="bs-date">{currentBSDate}</span>
                <span className="time">{currentTime}</span>
              </div>
            </div>
          </div>
          <div className="nav-center-section">
            <nav className="desktop-nav">
              {desktopNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${pathname === link.href ? 'nav-link-active' : 'nav-link-inactive'}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="nav-right-section">
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="superadmin-navbar mobile-header">
        <div className="mobile-nav-content">
          <div className="mobile-header-left">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: 'var(--primary-green)',
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                backgroundColor: 'var(--primary-green)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.875rem'
              }}>
                S
              </div>
              SchoolHub
            </div>
            <div className="mobile-school-info">
              <span className="mobile-school-name">{schoolName}</span>
              <div className="mobile-datetime">
                <span className="mobile-bs-date">{currentBSDate}</span>
                <span className="mobile-time">{currentTime}</span>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="mobile-logout-button">
            Logout
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <div className="bottom-nav-container">
          {mobileNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`mobile-nav-item ${pathname === link.href ? 'mobile-nav-item-active' : 'mobile-nav-item-inactive'}`}
            >
              <div className="nav-icon">{link.icon}</div>
              <span className="nav-label">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}