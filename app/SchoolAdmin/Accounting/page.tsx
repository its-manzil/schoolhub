'use client'

import SchoolAdminAccountingLayout from "./components/SchoolAdminAccountingLayout";
import DashboardContent from "../../Accounting/page";
import SchoolAdminNavbar from "../Components/SchoolAdminNavbar";

export default function SchoolAdminAccountingPage() {
  return (
    <>
      <SchoolAdminNavbar />
      <SchoolAdminAccountingLayout>
        <DashboardContent />
      </SchoolAdminAccountingLayout>
    </>
  );
}