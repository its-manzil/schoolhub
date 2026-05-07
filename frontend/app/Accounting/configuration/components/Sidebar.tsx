import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  CalendarRange,
  BookOpen,
  Wallet,
  Users,
  Receipt
} from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const pathname = usePathname();
  const [accPath, setAccPath] = useState("/Accounting");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const role = user?.role?.toLowerCase();

        const rolePathMap: Record<string, string> = {
          accountant: "/Accounting",
          schooladmin: "/SchoolAdmin/Accounting",
          teacher: "/Teacher/Accounting",
        };

        const basePath = rolePathMap[role];
        if (basePath) {
          setAccPath(basePath);
        }
      }
    } catch {
      // Keep default
    }
  }, []);

  const navItems = [
    { label: 'Organization Setup', href: `${accPath}/configuration/organization`, icon: Building2 },
    { label: 'Fiscal Year Management', href: `${accPath}/configuration/fiscal-year`, icon: CalendarRange },
    { label: 'Chart of Accounts', href: `${accPath}/configuration/coa`, icon: BookOpen },
    { label: 'Bank & Cash Accounts', href: `${accPath}/configuration/bank-cash`, icon: Wallet },
    { label: 'Customers & Vendors', href: `${accPath}/configuration/contacts`, icon: Users },
    { label: 'Tax & TDS Settings', href: `${accPath}/configuration/tax`, icon: Receipt },
  ];

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>CONFIGURATION</h2>
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = mounted ? pathname.startsWith(item.href) : false;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
            >
              <item.icon className={styles.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
