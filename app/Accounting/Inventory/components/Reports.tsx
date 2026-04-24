'use client';

import { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Package, Filter } from 'lucide-react';
import { InventoryItem } from '../types';
import '../styles/reports.css';

const API_BASE = '/api/accounting';

// Safe schoolId getter from localStorage
const getSchoolId = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      return parsed.schoolId || null;
    }
  } catch {
    // Silent fail for invalid JSON
  }
  return null;
};

interface BillItem {
  inventoryId: string;
  name: string;
  rate: number;
  qty: number;
  variant?: string;
  cp: number;
  revenue: number;
  cost: number;
  profit: number;
}

interface Bill {
  _id: string;
  invoiceId: string;
  schoolId: string | number;
  studentName: string;
  className: string;
  paymentStatus: 'paid' | 'pending';
  createdAt: string;
  items: BillItem[];
  billRevenue: number;
  billCost: number;
  billProfit: number;
}

interface ReportSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalItems: number;
  totalBills: number;
  paidBills: number;
  pendingBills: number;
}

interface ReportsProps {
  items: InventoryItem[];
}

const currentYear = new Date().getFullYear().toString();
const academicYears = [currentYear, (parseInt(currentYear) - 1).toString(), (parseInt(currentYear) - 2).toString()];

export default function Reports({ items }: ReportsProps) {
  const [yearFilter, setYearFilter] = useState(currentYear);
  const [showPending, setShowPending] = useState(true);
  const [bills, setBills] = useState<Bill[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalItems: 0,
    totalBills: 0,
    paidBills: 0,
    pendingBills: 0,
  });
  const [loading, setLoading] = useState(false);

  // Fetch report data from API
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const schoolId = getSchoolId();
        if (!schoolId) {
          console.warn('Reports: schoolId not found');
          return;
        }

        const query = `?schoolId=${String(schoolId)}&year=${yearFilter}`;
        const response = await fetch(`${API_BASE}/inventory/reports${query}`);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setBills(data.data.bills || []);
            setSummary(data.data.summary || {
              totalRevenue: 0,
              totalCost: 0,
              totalProfit: 0,
              totalItems: 0,
              totalBills: 0,
              paidBills: 0,
              pendingBills: 0,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching inventory report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [yearFilter]);

  // Calculate stats from API summary data
  const stats = useMemo(() => {
    const totalRevenue = summary.totalRevenue;
    const totalCost = summary.totalCost;
    const profit = summary.totalProfit;

    // Calculate pending stats from bills
    const pendingBills = bills.filter((b) => b.paymentStatus !== 'paid');
    const pendingRevenue = pendingBills.reduce((sum, b) => sum + b.billRevenue, 0);
    const pendingCost = pendingBills.reduce((sum, b) => sum + b.billCost, 0);
    const pendingProfit = pendingRevenue - pendingCost;
    const pendingSales = pendingBills.reduce((sum, b) => sum + b.items.reduce((itemSum, item) => itemSum + item.qty, 0), 0);

    // Total items sold (paid only)
    const paidBills = bills.filter((b) => b.paymentStatus === 'paid');
    const totalSales = paidBills.reduce((sum, b) => sum + b.items.reduce((itemSum, item) => itemSum + item.qty, 0), 0);

    return {
      totalSales,
      totalRevenue,
      totalCost,
      profit,
      profitMargin: totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0,
      pendingSales,
      pendingRevenue,
      pendingProfit,
      purchaseCost: 0, // Not tracked in bills, would need separate purchase data
      damageLoss: 0,   // Not tracked in bills, would need separate damage data
      totalDamaged: 0, // Not tracked in bills
    };
  }, [summary, bills]);

  // Calculate top selling items from bills data
  const topSellingItems = useMemo(() => {
    const itemSales: Record<string, { name: string; sold: number; revenue: number; profit: number }> = {};

    bills
      .filter((b) => b.paymentStatus === 'paid')
      .forEach((bill) => {
        bill.items.forEach((item) => {
          if (!itemSales[item.inventoryId]) {
            itemSales[item.inventoryId] = {
              name: item.name || 'Unknown',
              sold: 0,
              revenue: 0,
              profit: 0,
            };
          }
          itemSales[item.inventoryId].sold += item.qty;
          itemSales[item.inventoryId].revenue += item.revenue;
          itemSales[item.inventoryId].profit += item.profit;
        });
      });

    return Object.values(itemSales)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [bills]);

  const lowStockItems = useMemo(() => {
    return items.filter((item) => {
      const available = item.totalStock - item.totalSold - item.totalDamaged;
      return available <= item.reorderLevel;
    });
  }, [items]);

  return (
    <div className="reports-container">
      <div className="section-header">
        <h2><BarChart3 size={20} /> Reports & Profit Analysis</h2>
        <p>View sales performance, profit margins, and inventory insights</p>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <Filter size={16} />
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
            {academicYears.map((year) => (
              <option key={year} value={year}>Academic Year {year}</option>
            ))}
          </select>
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showPending}
            onChange={(e) => setShowPending(e.target.checked)}
          />
          Show Pending Sales
        </label>
      </div>

      {loading && <div className="loading-overlay">Loading report data...</div>}

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Total Profit</span>
            <span className="stat-value">रू{stats.profit.toFixed(2)}</span>
            <span className="stat-subtitle">{stats.profitMargin}% margin</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><DollarSign size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">रू{stats.totalRevenue.toFixed(2)}</span>
            <span className="stat-subtitle">{stats.totalSales} items sold</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><Package size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Purchase Cost</span>
            <span className="stat-value">रू{stats.purchaseCost.toFixed(2)}</span>
            <span className="stat-subtitle">Stock purchases</span>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon"><TrendingDown size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Damage Loss</span>
            <span className="stat-value">रू{stats.damageLoss.toFixed(2)}</span>
            <span className="stat-subtitle">{stats.totalDamaged} items</span>
          </div>
        </div>
      </div>

      {showPending && (
        <div className="pending-section">
          <h3>Pending Sales</h3>
          <div className="pending-stats">
            <div className="pending-item">
              <span>Items</span>
              <strong>{stats.pendingSales}</strong>
            </div>
            <div className="pending-item">
              <span>Expected Revenue</span>
              <strong>रू{stats.pendingRevenue.toFixed(2)}</strong>
            </div>
            <div className="pending-item">
              <span>Expected Profit</span>
              <strong>रू{stats.pendingProfit.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      )}

      <div className="reports-grid">
        <div className="report-card">
          <h3>Top Selling Items</h3>
          {topSellingItems.length === 0 ? (
            <p className="empty-text">No sales data available</p>
          ) : (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Sold</th>
                  <th>Revenue</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                {topSellingItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.sold}</td>
                    <td>रू{item.revenue.toFixed(2)}</td>
                    <td className={item.profit >= 0 ? 'positive' : 'negative'}>
                      रू{item.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="report-card">
          <h3>Low Stock Alert</h3>
          {lowStockItems.length === 0 ? (
            <p className="empty-text">All items have sufficient stock</p>
          ) : (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Available</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => {
                  const available = item.totalStock - item.totalSold - item.totalDamaged;
                  return (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{available} {item.unit}</td>
                      <td>{item.reorderLevel} {item.unit}</td>
                      <td className="text-danger">Restock Needed</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="inventory-summary">
        <h3>Inventory Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span>Total Items</span>
            <strong>{items.length}</strong>
          </div>
          <div className="summary-item">
            <span>Total Stock Value</span>
            <strong>
              रु{items.reduce((sum, item) => sum + item.purchasePrice * item.totalStock, 0).toFixed(2)}
            </strong>
          </div>
          <div className="summary-item">
            <span>Items with Variants</span>
            <strong>{items.filter((i) => i.hasVariants).length}</strong>
          </div>
          <div className="summary-item">
            <span>Low Stock Items</span>
            <strong className={lowStockItems.length > 0 ? 'text-danger' : ''}>
              {lowStockItems.length}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
