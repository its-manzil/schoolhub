"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../../Components/skeleton';

const ConfigurationPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to the first configuration section
    router.replace('/Accounting/configuration/organization');
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <Skeleton showHeader={true} className="skeleton-full-page" />
    </div>
  );
};

export default ConfigurationPage;
