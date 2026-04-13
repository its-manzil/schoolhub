"use client";

import SchoolAdminAccountingLayout from "./components/SchoolAdminAccountingLayout";
import { DollarSign, Banknote, TrendingDown, AlertCircle, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import "./accounting.css";
import SchoolAdminNavbar from "../Components/SchoolAdminNavbar";

const Accounting = () => {
  const monthlyData = [
    { month: "Baisakh", income: 45000, expense: 38000 },
    { month: "Jestha", income: 52000, expense: 42000 },
    { month: "Ashadh", income: 48000, expense: 39000 },
    { month: "Bhadra", income: 55000, expense: 41000 },
    { month: "Kartik", income: 58000, expense: 43000 },
    { month: "Mangsir", income: 49000, expense: 37000 },
    { month: "Poush", income: 51000, expense: 40000 },
    { month: "Magh", income: 53000, expense: 41000 },
    { month: "Falgun", income: 56000, expense: 42000 },
    { month: "Chaitra", income: 54000, expense: 39000 },
  ];

  const recentTransactions = [
    { id: 1, date: "2081-04-15", description: "School Fees Collection", category: "Income", amount: 45000, status: "Completed" },
    { id: 2, date: "2081-04-14", description: "Teacher Salary Payment", category: "Expense", amount: -12000, status: "Completed" },
    { id: 3, date: "2081-04-13", description: "Stationery Purchase", category: "Expense", amount: -3500, status: "Completed" },
    { id: 4, date: "2081-04-12", description: "Exam Fees Collection", category: "Income", amount: 8000, status: "Completed" },
    { id: 5, date: "2081-04-11", description: "Maintenance", category: "Expense", amount: -2000, status: "Completed" },
  ];

  const expenseCategories = [
    { name: "Salaries", value: 35000, color: "#3b82f6" },
    { name: "Operations", value: 25000, color: "#10b981" },
    { name: "Maintenance", value: 15000, color: "#f59e0b" },
    { name: "Supplies", value: 12000, color: "#8b5cf6" },
    { name: "Utilities", value: 8000, color: "#ef4444" },
  ];

  const incomeCategories = [
    { name: "School Fees", value: 45000, color: "#10b981" },
    { name: "Exam Fees", value: 8000, color: "#3b82f6" },
    { name: "Donations", value: 5000, color: "#8b5cf6" },
    { name: "Other Income", value: 2000, color: "#f59e0b" },
  ];

  return (
    <>
    <SchoolAdminNavbar />
    <SchoolAdminAccountingLayout>
      <div className="accounting-dashboard">
        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card income-card">
            <div className="summary-icon">
              <DollarSign size={24} />
            </div>
            <div className="summary-content">
              <h3>Total Income</h3>
              <p className="summary-amount">रू 4,50,000</p>
              <span className="summary-change positive">+12.5%</span>
            </div>
          </div>

          <div className="summary-card expense-card">
            <div className="summary-icon">
              <Banknote size={24} />
            </div>
            <div className="summary-content">
              <h3>Total Expenses</h3>
              <p className="summary-amount">रू 3,80,000</p>
              <span className="summary-change negative">+8.5%</span>
            </div>
          </div>

          <div className="summary-card balance-card">
            <div className="summary-icon">
              <TrendingDown size={24} />
            </div>
            <div className="summary-content">
              <h3>Net Balance</h3>
              <p className="summary-amount">रू 70,000</p>
              <span className="summary-change positive">+15.2%</span>
            </div>
          </div>

          <div className="summary-card alert-card">
            <div className="summary-icon">
              <AlertCircle size={24} />
            </div>
            <div className="summary-content">
              <h3>Pending Bills</h3>
              <p className="summary-amount">रू 5</p>
              <span className="summary-change">2 overdue</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-container">
            <h2>Monthly Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#10b981" />
                <Bar dataKey="expense" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-row">
            <div className="chart-container">
              <h3>Expense Categories</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3>Income Sources</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={incomeCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                  >
                    {incomeCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="transactions-section">
          <div className="section-header">
            <h2>Recent Transactions</h2>
            <button className="export-btn">
              <Download size={16} />
              Export
            </button>
          </div>
          <div className="transactions-list">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className={`transaction-item ${transaction.status.toLowerCase()}`}>
                <div className="transaction-info">
                  <div className="transaction-date">{transaction.date}</div>
                  <div className="transaction-description">{transaction.description}</div>
                  <div className="transaction-category">{transaction.category}</div>
                </div>
                <div className="transaction-amount">
                  <span className={transaction.amount > 0 ? "positive" : "negative"}>
                    {transaction.amount > 0 ? "+" : ""}रू {Math.abs(transaction.amount).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SchoolAdminAccountingLayout>
    </>
  );
};

export default Accounting;