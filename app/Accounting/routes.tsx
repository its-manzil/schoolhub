import { createBrowserRouter } from "react-router-dom";
import AccountingDashboard from "./page";
import Configuration from "./Configuration";
import VoucherEntry from "./VoucherEntry";
import TDS from "./TDS";
import FixedAssets from "./FixedAssets";
import Reports from "./Reports";

export const router = createBrowserRouter([
  {
    path: "/accounting",
    element: <AccountingDashboard />,
  },
  {
    path: "/accounting/configuration",
    element: <Configuration />,
  },
  {
    path: "/accounting/voucher",
    element: <VoucherEntry />,
  },
  {
    path: "/accounting/tds",
    element: <TDS />,
  },
  {
    path: "/accounting/assets",
    element: <FixedAssets />,
  },
  {
    path: "/accounting/reports",
    element: <Reports />,
  },
]);