"use client";
<<<<<<< HEAD
import Configuration from "../../../Accounting/configuration/page";
export default function Page() { return <Configuration />; }
=======

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ConfigurationPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to the first configuration section
    router.replace('/SchoolAdmin/Accounting/configuration/organization');
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading configuration...</p>
    </div>
  );
};

export default ConfigurationPage;
>>>>>>> 5a68459 (refactor: migrate accounting configuration module to SchoolAdmin directory)
