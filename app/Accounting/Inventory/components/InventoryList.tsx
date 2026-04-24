'use client';

import { useState, useMemo } from 'react';
import { Search, Download, Package, AlertCircle, Edit2, Trash2, Filter } from 'lucide-react';
import { InventoryItem } from '../types';
import '../styles/list.css';

interface InventoryListProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onSelect: (item: InventoryItem) => void;
}

const categories = ['All', 'Uniform', 'Stationery', 'Accessories', 'Books', 'Sports', 'Other'];
const stockStatuses = ['All', 'Low Stock', 'Normal'];

export default function InventoryList({ items, onEdit, onDelete, onSelect }: InventoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      
      const isLowStock = item.totalStock <= item.reorderLevel;
      const matchesStock = stockFilter === 'All' || 
        (stockFilter === 'Low Stock' && isLowStock) ||
        (stockFilter === 'Normal' && !isLowStock);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [items, searchTerm, categoryFilter, stockFilter]);

  const handleExportCSV = () => {
    const headers = ['Name', 'Category', 'Total Stock', 'Sold', 'Damaged', 'Available', 'CP', 'SP', 'Supplier', 'Profit %'];
    const rows = filteredItems.map((item) => {
      const available = item.totalStock - item.totalSold - item.totalDamaged;
      const profitPct = item.purchasePrice > 0 
        ? ((item.sellingPrice - item.purchasePrice) / item.purchasePrice * 100).toFixed(1)
        : 0;
      return [
        item.name,
        item.category,
        item.totalStock,
        item.totalSold,
        item.totalDamaged,
        available,
        item.purchasePrice,
        item.sellingPrice,
        item.supplier,
        `${profitPct}%`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getItemId = (item: InventoryItem): string => item._id || '';

  return (
    <div className="inventory-list-container">
      <div className="list-header">
        <h2><Package size={20} /> Inventory Items ({filteredItems.length})</h2>
        <button className="btn-export" onClick={handleExportCSV}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={16} />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
            {stockStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="view-toggle">
          <button className={viewMode === 'card' ? 'active' : ''} onClick={() => setViewMode('card')}>
            Cards
          </button>
          <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}>
            Table
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <Package size={48} />
          <p>No inventory items found</p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="inventory-cards">
          {filteredItems.map((item) => {
            const availableStock = item.totalStock - item.totalSold - item.totalDamaged;
            const isLowStock = availableStock <= item.reorderLevel;
            const profitMargin = item.purchasePrice > 0
              ? ((item.sellingPrice - item.purchasePrice) / item.purchasePrice * 100).toFixed(1)
              : 0;

            return (
              <div
                key={getItemId(item)}
                className={`inventory-card ${isLowStock ? 'low-stock' : ''}`}
                onClick={() => onSelect(item)}
              >
                <div className="card-header">
                  <span className="category-badge">{item.category}</span>
                  {isLowStock && (
                    <span className="low-stock-badge">
                      <AlertCircle size={14} /> Low Stock
                    </span>
                  )}
                </div>

                <h3 className="item-name">{item.name}</h3>

                <div className="stock-display">
                  <div className="stock-main">
                    <span className="stock-value">{availableStock}</span>
                    <span className="stock-unit">{item.unit}</span>
                  </div>
                  <div className="stock-details">
                    <span>Total: {item.totalStock}</span>
                    <span>Sold: {item.totalSold}</span>
                    {item.totalDamaged > 0 && <span className="damaged">Damaged: {item.totalDamaged}</span>}
                  </div>
                </div>

                <div className="pricing-info">
                  <div className="price-row">
                    <span>CP: रू{item.purchasePrice.toFixed(2)}</span>
                    <span>SP: रू{item.sellingPrice.toFixed(2)}</span>
                  </div>
                  <div className={`profit-margin ${Number(profitMargin) >= 0 ? 'positive' : 'negative'}`}>
                    Margin: {profitMargin}%
                  </div>
                </div>

                {item.hasVariants && (
                  <div className="variant-badge">{item.variants.length} Variants</div>
                )}

                <div className="card-footer">
                  <span className="supplier">{item.supplier || 'No supplier'}</span>
                  <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-icon" onClick={() => onEdit(item)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon delete" onClick={() => onDelete(getItemId(item))}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>CP</th>
                <th>SP</th>
                <th>Margin</th>
                <th>Supplier</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const availableStock = item.totalStock - item.totalSold - item.totalDamaged;
                const profitMargin = item.purchasePrice > 0
                  ? ((item.sellingPrice - item.purchasePrice) / item.purchasePrice * 100).toFixed(1)
                  : 0;
                const isLowStock = availableStock <= item.reorderLevel;

                return (
                  <tr key={getItemId(item)} className={isLowStock ? 'low-stock' : ''}>
                    <td>
                      <div className="item-cell">
                        <span className="item-name">{item.name}</span>
                        {item.hasVariants && <span className="variant-tag">Variants</span>}
                      </div>
                    </td>
                    <td>{item.category}</td>
                    <td>
                      <div className="stock-cell">
                        <span className={isLowStock ? 'text-danger' : ''}>
                          {availableStock} / {item.totalStock}
                        </span>
                        {item.totalDamaged > 0 && (
                          <span className="damaged-badge">-{item.totalDamaged}</span>
                        )}
                      </div>
                    </td>
                    <td>रू{item.purchasePrice.toFixed(2)}</td>
                    <td>रू{item.sellingPrice.toFixed(2)}</td>
                    <td className={Number(profitMargin) >= 0 ? 'text-success' : 'text-danger'}>
                      {profitMargin}%
                    </td>
                    <td>{item.supplier || '-'}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn-icon" onClick={() => onEdit(item)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon delete" onClick={() => onDelete(getItemId(item))}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
