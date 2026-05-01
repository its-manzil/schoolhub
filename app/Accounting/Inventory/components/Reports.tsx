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

interface Transaction {
  _id: string;
  inventoryId: string;
  schoolId: string;
  type: 'sale' | 'damage';
  qty: number;
  beforeStock: number;
  afterStock: number;
  cp: number;
  sp: number;
  profit: number;
  referenceId: string;
  paymentStatus: 'paid' | 'pending';
  purpose: string;
  variantName?: string;
  bsDate: string;
  createdAt: string;
}

interface ReportSummary {
  totalSales: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  totalItemsSold: number;
  totalDamaged: number;
}

interface ReportsProps {
  items: InventoryItem[];
}

// BS years for filtering (approximate conversion: AD + 57)
const currentADYear = new Date().getFullYear();
const currentBSYear = currentADYear + 57;
const bsYears = [
  currentBSYear.toString(),
  (currentBSYear - 1).toString(),
  (currentBSYear - 2).toString()
];

export default function Reports({ items }: ReportsProps) {
  const [yearFilter, setYearFilter] = useState(currentBSYear.toString());
  const [monthFilter, setMonthFilter] = useState('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    totalSales: 0,
    totalProfit: 0,
    totalLoss: 0,
    netProfit: 0,
    totalItemsSold: 0,
    totalDamaged: 0,
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

        let query = `?schoolId=${String(schoolId)}&year=${yearFilter}`;
        if (monthFilter !== 'all') {
          query += `&month=${monthFilter}`;
        }
        const response = await fetch(`${API_BASE}/inventory/reports${query}`);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setTransactions(data.data.transactions || []);
            setSummary(data.data.summary || {
              totalSales: 0,
              totalProfit: 0,
              totalLoss: 0,
              netProfit: 0,
              totalItemsSold: 0,
              totalDamaged: 0,
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
  }, [yearFilter, monthFilter]);

  // Calculate stats from API summary data
  const stats = useMemo(() => {
    const totalSales = summary.totalSales;
    const totalProfit = summary.totalProfit;
    const totalLoss = summary.totalLoss || 0;
    const netProfit = summary.netProfit || 0;
    const totalItemsSold = summary.totalItemsSold;
    const totalDamaged = summary.totalDamaged || 0;

    return {
      totalSales,
      totalProfit,
      totalLoss,
      netProfit,
      totalItemsSold,
      totalDamaged,
      profitMargin: totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0,
    };
  }, [summary]);

  // Calculate top selling items from transactions data
  const topSellingItems = useMemo(() => {
    const itemSales: Record<string, { name: string; sold: number; revenue: number; profit: number }> = {};

    // Map inventory items for name lookup
    const inventoryMap = new Map(items.map(item => [item._id, item]));

    transactions.forEach((transaction) => {
      const inventoryItem = inventoryMap.get(transaction.inventoryId);
      const itemName = inventoryItem?.name || 'Unknown Item';
      const revenue = transaction.sp * transaction.qty;

      if (!itemSales[transaction.inventoryId]) {
        itemSales[transaction.inventoryId] = {
          name: itemName,
          sold: 0,
          revenue: 0,
          profit: 0,
        };
      }
      itemSales[transaction.inventoryId].sold += transaction.qty;
      itemSales[transaction.inventoryId].revenue += revenue;
      itemSales[transaction.inventoryId].profit += transaction.profit;
    });

    return Object.values(itemSales)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [transactions, items]);

  const lowStockItems = useMemo(() => {
    return items.filter((item) => {
      const available = item.totalStock - item.totalSold - item.totalDamaged;
      return available <= item.reorderLevel;
    });
  }, [items]);

  return (
    <div className="reports-container">
      <div className="section-header">
        <h2><BarChart3 size={20} /> Reports</h2>
        <p>View sales performance, profit margins, and inventory insights</p>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <Filter size={16} />
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
            {bsYears.map((year) => (
              <option key={year} value={year}>BS Year {year}</option>
            ))}
          </select>
          <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
            <option value="all">All Months</option>
            <option value="1">Baishakh</option>
            <option value="2">Jestha</option>
            <option value="3">Ashadh</option>
            <option value="4">Shrawan</option>
            <option value="5">Bhadra</option>
            <option value="6">Ashwin</option>
            <option value="7">Kartik</option>
            <option value="8">Mangsir</option>
            <option value="9">Poush</option>
            <option value="10">Magh</option>
            <option value="11">Falgun</option>
            <option value="12">Chaitra</option>
          </select>
        </div>
      </div>

      {loading && <div className="loading-overlay">Loading report data...</div>}

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Net Profit</span>
            <span className="stat-value">रू{stats.netProfit.toFixed(2)}</span>
            <span className="stat-subtitle">After loss deduction</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><DollarSign size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Total Sales</span>
            <span className="stat-value">रू{stats.totalSales.toFixed(2)}</span>
            <span className="stat-subtitle">{stats.totalItemsSold} items sold</span>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon"><TrendingDown size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Total Loss</span>
            <span className="stat-value">रू{stats.totalLoss.toFixed(2)}</span>
            <span className="stat-subtitle">{stats.totalDamaged} items damaged</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><Package size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Gross Profit</span>
            <span className="stat-value">रू{stats.totalProfit.toFixed(2)}</span>
            <span className="stat-subtitle">{stats.profitMargin}% margin</span>
          </div>
        </div>
      </div>

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
