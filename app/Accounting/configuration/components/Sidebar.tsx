import React from 'react';
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

  const navItems = [
    { label: 'Organization Setup', href: '/Accounting/configuration/organization', icon: Building2 },
    { label: 'Fiscal Year Management', href: '/Accounting/configuration/fiscal-year', icon: CalendarRange },
    { label: 'Chart of Accounts', href: '/Accounting/configuration/coa', icon: BookOpen },
    { label: 'Bank & Cash Accounts', href: '/Accounting/configuration/bank-cash', icon: Wallet },
    { label: 'Customers & Vendors', href: '/Accounting/configuration/contacts', icon: Users },
    { label: 'Tax & TDS Settings', href: '/Accounting/configuration/tax', icon: Receipt },
  ];

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>CONFIGURATION</h2>
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
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
