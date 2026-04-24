'use client';

import { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Package, Filter } from 'lucide-react';
import { InventoryItem, StockTransaction } from '../types';
import '../styles/reports.css';

interface ReportsProps {
  items: InventoryItem[];
  transactions: StockTransaction[];
}

const currentYear = new Date().getFullYear().toString();
const academicYears = [currentYear, (parseInt(currentYear) - 1).toString(), (parseInt(currentYear) - 2).toString()];

export default function Reports({ items, transactions }: ReportsProps) {
  const [yearFilter, setYearFilter] = useState(currentYear);
  const [showPending, setShowPending] = useState(true);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txYear = tx.createdAt ? new Date(tx.createdAt).getFullYear().toString() : currentYear;
      return txYear === yearFilter;
    });
  }, [transactions, yearFilter]);

  const stats = useMemo(() => {
    const sales = filteredTransactions.filter((tx) => tx.type === 'sale');
    const purchases = filteredTransactions.filter((tx) => tx.type === 'purchase');
    const damages = filteredTransactions.filter((tx) => tx.type === 'damage');

    const paidSales = sales.filter((tx) => tx.paymentStatus === 'paid');
    const pendingSales = sales.filter((tx) => tx.paymentStatus === 'pending');

    const totalRevenue = paidSales.reduce((sum, tx) => sum + tx.sp * tx.qty, 0);
    const totalCost = paidSales.reduce((sum, tx) => sum + tx.cp * tx.qty, 0);
    const profit = totalRevenue - totalCost;

    const pendingRevenue = pendingSales.reduce((sum, tx) => sum + tx.sp * tx.qty, 0);
    const pendingCost = pendingSales.reduce((sum, tx) => sum + tx.cp * tx.qty, 0);
    const pendingProfit = pendingRevenue - pendingCost;

    const purchaseCost = purchases.reduce((sum, tx) => sum + tx.cp * tx.qty, 0);
    const damageLoss = damages.reduce((sum, tx) => sum + tx.cp * tx.qty, 0);

    return {
      totalSales: paidSales.reduce((sum, tx) => sum + tx.qty, 0),
      totalRevenue,
      totalCost,
      profit,
      profitMargin: totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0,
      pendingSales: pendingSales.reduce((sum, tx) => sum + tx.qty, 0),
      pendingRevenue,
      pendingProfit,
      purchaseCost,
      damageLoss,
      totalDamaged: damages.reduce((sum, tx) => sum + tx.qty, 0),
    };
  }, [filteredTransactions]);

  const topSellingItems = useMemo(() => {
    const itemSales: Record<string, { name: string; sold: number; revenue: number; profit: number }> = {};

    filteredTransactions
      .filter((tx) => tx.type === 'sale' && tx.paymentStatus === 'paid')
      .forEach((tx) => {
        if (!itemSales[tx.inventoryId]) {
          const item = items.find((i) => i._id === tx.inventoryId);
          itemSales[tx.inventoryId] = { name: item?.name || 'Unknown', sold: 0, revenue: 0, profit: 0 };
        }
        itemSales[tx.inventoryId].sold += tx.qty;
        itemSales[tx.inventoryId].revenue += tx.sp * tx.qty;
        itemSales[tx.inventoryId].profit += tx.profit;
      });

    return Object.values(itemSales)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [filteredTransactions, items]);

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
