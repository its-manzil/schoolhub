"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const ConfigurationPage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const role = user?.role?.toLowerCase();

      const rolePathMap: Record<string, string> = {
        accountant: "/Accounting",
        schooladmin: "/SchoolAdmin/Accounting",
        teacher: "/Teacher/Accounting",
      };

      const accPath = rolePathMap[role];

      if (!accPath) return;

      router.replace(`${accPath}/configuration/organization`);
    } catch (err) {
      console.error("Redirect error:", err);
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
        Loading configuration...
      </p>
    </div>
  );
};

export default ConfigurationPage;