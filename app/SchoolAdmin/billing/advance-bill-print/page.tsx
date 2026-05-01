import AdvanceBillPrint from "../../../billing/advance-bill-print/page";
import BillGeneratePage from "../../../billing/advance-bill-print/page";
import SchoolAdminNavbar from "../../Components/SchoolAdminNavbar";

export default function SchoolAdminBillGenerate() {
  return (
    <>
      <SchoolAdminNavbar />
      <AdvanceBillPrint />
    </>
  );
}
