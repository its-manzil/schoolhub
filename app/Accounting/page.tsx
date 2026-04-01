"use client";

import Layout from "./components/Layout";
import {
  DollarSign,
  Banknote,
  TrendingDown,
  AlertCircle,
  Download,
  Plus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./accounting.css";

const AccountingDashboard = () => {
  const monthlyData = [
    { month: "Baisakh", income: 45000, expense: 38000 },
    { month: "Jestha",  income: 52000, expense: 42000 },
    { month: "Ashadh",  income: 48000, expense: 41000 },
    { month: "Shrawan", income: 61000, expense: 55000 },
    { month: "Bhadra",  income: 55000, expense: 49000 },
    { month: "Ashwin",  income: 67000, expense: 62000 },
    { month: "Kartik",  income: 72000, expense: 68000 },
    { month: "Mangsir", income: 68000, expense: 65000 },
    { month: "Poush",   income: 74000, expense: 71000 },
    { month: "Magh",    income: 79000, expense: 75000 },
    { month: "Falgun",  income: 85000, expense: 80000 },
    { month: "Chaitra", income: 90000, expense: 85000 },
  ];

  const tdsData = [
    { name: "Deducted",  value: 45, fill: "#10b981" },
    { name: "Deposited", value: 35, fill: "#3b82f6" },
    { name: "Pending",   value: 20, fill: "#f59e0b" },
  ];

  const kpiCards = [
    {
      label:     "Cash-in-Hand",
      value:     "NPR 2,45,000",
      icon:      DollarSign,
      cardClass: "acd-kpi-card acd-kpi-blue",
    },
    {
      label:     "Bank Balances",
      value:     "NPR 8,75,000",
      icon:      Banknote,
      cardClass: "acd-kpi-card acd-kpi-green",
    },
    {
      label:     "Monthly Expenses",
      value:     "NPR 3,56,000",
      icon:      TrendingDown,
      cardClass: "acd-kpi-card acd-kpi-yellow",
    },
    {
      label:     "Pending TDS",
      value:     "NPR 89,000",
      icon:      AlertCircle,
      cardClass: "acd-kpi-card acd-kpi-pink",
    },
  ];

  const recentVouchers = [
    { id: "JV/082/001",  date: "2082/12/15", account: "Salary Expense", amount: "50,000",  status: "Posted" },
    { id: "PR/082/015",  date: "2082/12/14", account: "Bank A/C",       amount: "75,000",  status: "Posted" },
    { id: "RCT/082/008", date: "2082/12/13", account: "Fees Income",    amount: "120,000", status: "Draft"  },
  ];

  const headerActions = (
    <>
      <button className="acd-btn-outline">
        <Download className="acd-btn-icon" />
        Export
      </button>
      <button className="acd-btn-primary">
        <Plus className="acd-btn-icon" />
        New Voucher
      </button>
    </>
  );

  return (
    <Layout actions={headerActions}>
      <div className="acd-page">

        {/* ── KPI Cards ── */}
        <div className="acd-kpi-grid">
          {kpiCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className={card.cardClass}>
                <div className="acd-kpi-body">
                  <div>
                    <p className="acd-kpi-label">{card.label}</p>
                    <p className="acd-kpi-value">{card.value}</p>
                  </div>
                  <div className="acd-kpi-icon-wrap">
                    <Icon className="acd-kpi-icon" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Alert Banner ── */}
        <div className="acd-alert">
          <AlertCircle className="acd-alert-icon" />
          <div>
            <h3 className="acd-alert-title">Fiscal Year Closing in 45 Days</h3>
            <p className="acd-alert-text">
              You have 3 unposted vouchers and 2 draft vouchers. Please review before FY closing.
            </p>
          </div>
        </div>

        {/* ── Charts ── */}
        <div className="acd-charts-grid">

          {/* Bar Chart — spans 2 cols on large screens */}
          <div className="acd-chart-card acd-chart-wide">
            <h2 className="acd-chart-title">Income vs Expenses (Nepali Fiscal Year)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="income"  fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut Chart */}
          <div className="acd-chart-card">
            <h2 className="acd-chart-title">TDS Status</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={tdsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {tdsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="acd-tds-legend">
              {tdsData.map((item, index) => (
                <div key={index} className="acd-tds-legend-item">
                  <span
                    className="acd-tds-legend-dot"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="acd-tds-legend-label">{item.name}</span>
                  <span className="acd-tds-legend-val">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Recent Vouchers Table ── */}
        <div className="acd-table-card">
          <h2 className="acd-chart-title">Recent Vouchers</h2>
          <div className="acd-table-scroll">
            <table className="acd-table">
              <thead>
                <tr>
                  <th>Voucher #</th>
                  <th>Date</th>
                  <th>Account</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentVouchers.map((row, idx) => (
                  <tr key={idx} className="acd-table-row">
                    <td className="acd-td-primary">{row.id}</td>
                    <td className="acd-td-muted">{row.date}</td>
                    <td className="acd-td-muted">{row.account}</td>
                    <td className="acd-td-bold">NPR {row.amount}</td>
                    <td>
                      <span
                        className={`acd-status-pill ${
                          row.status === "Posted"
                            ? "acd-status-posted"
                            : "acd-status-draft"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default AccountingDashboard;
