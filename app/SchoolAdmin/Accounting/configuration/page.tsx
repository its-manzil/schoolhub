"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ConfigurationPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the actual configuration page
    router.push("/Accounting/configuration");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Configuration...</p>
      </div>
    </div>
  );
};

export default ConfigurationPage;
