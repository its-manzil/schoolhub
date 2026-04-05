"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountingRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the proper SchoolAdmin Accounting page
    router.replace('/SchoolAdmin/Accounting');
  }, [router]);

  // Show loading state while redirecting
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px',
      color: '#666'
    }}>
      Redirecting to Accounting...
    </div>
  );
}
