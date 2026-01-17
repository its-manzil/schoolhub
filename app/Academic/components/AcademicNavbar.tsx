"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";

const allowedRoles = ["schooladmin", "academic"];

export default function AcademicNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);

    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
          router.push("/Login");
          return;
        }

        const user = JSON.parse(userData);
        if (!allowedRoles.includes(user.role)) {
          router.push("/Login");
          return;
        }

        setUserRole(user.role);
        setIsAuthorized(true);
      } catch {
        router.push("/Login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("http://localhost:2056/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggingOut(false);
      router.push("/Login");
    }
  };

  if (!isClient || isLoading) {
    return (
      <div className="academic-nav-loading">
        <div className="academic-spinner" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const isSchoolAdmin = userRole === "schooladmin";
  const showLogout = !isSchoolAdmin;

  const basePath = isSchoolAdmin ? "/SchoolAdmin/Academics" : "/Academic";

  const links = [
    { href: basePath, label: "Overview" },
    { href: `${basePath}/Students`, label: "Students" },
    { href: `${basePath}/Parents`, label: "Parents" },
    { href: `${basePath}/Exams`, label: "Exams" },
    { href: `${basePath}/Subjects`, label: "Subjects" },
  ];

  return (
    <aside className="academic-sidebar">
      <div className="academic-sidebar-header">
        <span className="academic-sidebar-title">Academic Panel</span>
      </div>
      <nav className="academic-sidebar-nav">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`academic-nav-link ${
              pathname === link.href ? "academic-nav-link-active" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      {showLogout && (
        <div className="academic-sidebar-footer">
          <button
            type="button"
            className="academic-logout-button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <FaSignOutAlt size={14} />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      )}
    </aside>
  );
}
