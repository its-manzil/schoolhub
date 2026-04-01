"use client";

import Link from "next/link";
import Logo from "@/app/Components/Logo";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { RxDashboard } from "react-icons/rx";
import { MdOutlineSchool, MdSubscriptions } from "react-icons/md";
import { FaUserShield } from "react-icons/fa";
import "./SchoolAdminNavbar.css";

export default function SchoolAdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isSchoolAdmin, setIsSchoolAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const desktopNavLinks = [
    { href: "/SchoolAdmin/Dashboard", label: "Dashboard" },
    { href: "/SchoolAdmin/Academics", label: "Academic" },
    { href: "/SchoolAdmin", label: "Administrative" },
    { href: "/Accounting", label: "Accounting" },
  ];

  const mobileNavLinks = [
    { href: "/SchoolAdmin/Dashboard", label: "Dashboard", icon: <RxDashboard size={20} /> },
    { href: "/SchoolAdmin/Academics", label: "Academic", icon: <MdOutlineSchool size={20} /> },
    { href: "/SchoolAdmin", label: "Administrative", icon: <FaUserShield size={20} /> },
    { href: "/Accounting", label: "Accountant", icon: <MdSubscriptions size={20} /> },
  ];

  // Prevent hydration by returning minimal content on server
  if (!isClient) {
    return (
      <>
        {/* Desktop Header - Server Render */}
        <header className="superadmin-navbar desktop-header server-render">
          <div className="navbar-content">
            <Logo />
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
          <Logo />
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
          <Logo />
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
          <Logo />
          <div className="mobile-header-title">
            <span>SchoolHub Admin</span>
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