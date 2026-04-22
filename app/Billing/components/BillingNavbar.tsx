"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import "./billingNavbar.css";

const allowedRoles = ["schooladmin", "billing"];

export default function BillingNavbar() {
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

        console.log("BillingNavbar - token:", token ? "exists" : "missing");
        console.log("BillingNavbar - userData:", userData);

        if (!token || !userData) {
          console.log("BillingNavbar - Missing token or userData, redirecting to login");
          router.push("/login");
          return;
        }

        const user = JSON.parse(userData);
        console.log("BillingNavbar - parsed user:", user);
        console.log("BillingNavbar - user.role:", user.role);
        console.log("BillingNavbar - allowedRoles:", allowedRoles);

        if (!allowedRoles.includes(user.role)) {
          console.log("BillingNavbar - Role not allowed, redirecting to login");
          router.push("/login");
          return;
        }

        setUserRole(user.role);
        setIsAuthorized(true);
      } catch (error) {
        console.error("BillingNavbar - Auth check error:", error);
        router.push("/login");
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
      router.push("/login");
    }
  };

  if (!isClient || isLoading) {
    return (
      <div className="billing-nav-loading">
        <div className="billing-spinner" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const isSchoolAdmin = userRole === "schooladmin";
  const showLogout = !isSchoolAdmin;

  const basePath = isSchoolAdmin ? "/SchoolAdmin/billing" : "/billing";

   const links = [
    { href: `${basePath}/dashboard`, label: "Dashboard" },
    { href: `${basePath}/bill-generate`, label: "Generate Bill" },
    { href: `${basePath}/receipt-collection`, label: "Collection" },
    { href: `${basePath}/advance-bill-print`, label: "Print Bills" },
    { href: `${basePath}/collection-report`, label: "Reports" },
    { href: `${basePath}/settings`, label: "Settings" },
    { href: `${basePath}/profile`, label: "Profile" },
  ];
    

  return (
    <aside className="billing-sidebar">
      <div className="billing-sidebar-header">
        <span className="billing-sidebar-title">Billing Panel</span>
      </div>
      <nav className="billing-sidebar-nav">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`billing-nav-link ${
              pathname === link.href ? "billing-nav-link-active" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      {showLogout && (
        <div className="billing-sidebar-footer">
          <button
            type="button"
            className="billing-logout-button"
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
