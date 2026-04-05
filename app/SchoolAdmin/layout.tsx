"use client";

import React from "react";
import SchoolAdminNavbar from "./Components/SchoolAdminNavbar";

export default function SchoolAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SchoolAdminNavbar />
      {children}
    </>
  );
}
