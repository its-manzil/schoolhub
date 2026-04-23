'use client'

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Package, Plus, Search, Edit2, ArrowDownCircle, ArrowUpCircle,
  X, AlertCircle, Check, History, Download, Receipt
} from 'lucide-react';
import './Inventory.css';

interface InventoryItem {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  totalStock: number;
  remainingStock: number;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  reorderLevel: number;
  lastRestocked?: string;
  supplier: string;
  schoolId?: string;
  academicYear?: string;
  hasVariants?: boolean;
  variants?: Array<{
    name: string;
    cp: number;
    sp: number;
    stock: number;
    sold: number;
    damaged: number;
  }>;
  totalSold?: number;
  totalDamaged?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface StockTransaction {
  id: string;
  date: string;
  type: 'in' | 'out';
  quantity: number;
  person?: string;
  purpose?: string;
  voucherRef?: string;
  notes?: string;
}

const initialInventory: InventoryItem[] = [
  { id: '1', name: 'School Tie', category: 'Uniform', totalStock: 150, remainingStock: 85, unit: 'pcs', purchasePrice: 250, sellingPrice: 350, reorderLevel: 20, lastRestocked: '2081-03-15', supplier: 'Nepal Uniforms', },
  { id: '2', name: 'Belt (Black)', category: 'Uniform', totalStock: 100, remainingStock: 45, unit: 'pcs', purchasePrice: 180, sellingPrice: 280, reorderLevel: 15, lastRestocked: '2081-03-10', supplier: 'Nepal Uniforms', },
  { id: '3', name: 'Math Notebook', category: 'Stationery', totalStock: 500, remainingStock: 320, unit: 'pcs', purchasePrice: 45, sellingPrice: 60, reorderLevel: 50, lastRestocked: '2081-04-01', supplier: 'Pashupati Stationery', },
  { id: '4', name: 'English Notebook', category: 'Stationery', totalStock: 500, remainingStock: 280, unit: 'pcs', purchasePrice: 45, sellingPrice: 60, reorderLevel: 50, lastRestocked: '2081-04-01', supplier: 'Pashupati Stationery', },
  { id: '5', name: 'School Diary', category: 'Stationery', totalStock: 200, remainingStock: 95, unit: 'pcs', purchasePrice: 120, sellingPrice: 180, reorderLevel: 25, lastRestocked: '2081-02-20', supplier: 'Prakash Publishers', },
  { id: '6', name: 'Pen (Blue)', category: 'Stationery', totalStock: 1000, remainingStock: 650, unit: 'pcs', purchasePrice: 15, sellingPrice: 25, reorderLevel: 100, lastRestocked: '2081-03-25', supplier: 'XYZ Supplies', },
  { id: '7', name: 'Pencil (HB)', category: 'Stationery', totalStock: 800, remainingStock: 420, unit: 'pcs', purchasePrice: 10, sellingPrice: 15, reorderLevel: 80, lastRestocked: '2081-03-25', supplier: 'XYZ Supplies', },
  { id: '8', name: 'School Bag', category: 'Accessories', totalStock: 75, remainingStock: 30, unit: 'pcs', purchasePrice: 850, sellingPrice: 1200, reorderLevel: 10, lastRestocked: '2081-01-15', supplier: 'Bag House', },
];

const initialTransactions: Record<string, StockTransaction[]> = {
  '1': [
    { id: 't1', date: '2081-04-18', type: 'out', quantity: 5, person: 'Class 5 Student', purpose: 'New Admission', voucherRef: 'VCH-2081-045' },
    { id: 't2', date: '2081-04-15', type: 'out', quantity: 3, person: 'Class 3 Student', purpose: 'Replacement', voucherRef: 'VCH-2081-042' },
    { id: 't3', date: '2081-04-10', type: 'out', quantity: 7, person: 'Class 8 Student', purpose: 'New Admission', voucherRef: 'VCH-2081-038' },
    { id: 't4', date: '2081-03-15', type: 'in', quantity: 50, purpose: 'Bulk Purchase', voucherRef: 'GRN-2081-012' },
  ],
  '2': [
    { id: 't5', date: '2081-04-17', type: 'out', quantity: 2, person: 'Class 6 Student', purpose: 'New Admission', voucherRef: 'VCH-2081-044' },
    { id: 't6', date: '2081-03-10', type: 'in', quantity: 30, purpose: 'Bulk Purchase', voucherRef: 'GRN-2081-010' },
  ],
};

// Helper to get item ID (handles both _id from MongoDB and id from dummy data)
const getItemId = (item: InventoryItem): string => item._id || item.id || '';

// API base URL
const API_BASE = '/api/accounting';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [transactions, setTransactions] = useState<Record<string, StockTransaction[]>>(initialTransactions);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOutModal, setShowOutModal] = useState(false);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch inventory data on mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // Fetch transactions when selected item changes
  useEffect(() => {
    if (selectedItem) {
      fetchTransactions(getItemId(selectedItem));
    }
  }, [selectedItem]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/inventory?schoolId=default-school`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setInventory(data);
          // Initialize transactions object for each item
          const txMap: Record<string, StockTransaction[]> = {};
          data.forEach((item: InventoryItem) => {
            txMap[getItemId(item)] = [];
          });
          setTransactions(txMap);
        }
        // If API returns empty, keep dummy data as fallback
      } else {
        console.error('Failed to fetch inventory');
      }
    } catch (err: unknown) {
      console.error('Error fetching inventory:', err);
      setError('Failed to fetch inventory. Using local data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (inventoryId: string) => {
    try {
      const response = await fetch(`${API_BASE}/inventory/transactions?inventoryId=${inventoryId}`);
      if (response.ok) {
        const data = await response.json();
        // Transform API transactions to UI format
        const uiTransactions: StockTransaction[] = data.map((tx: {
          _id: string;
          type: string;
          qty: number;
          createdAt: string;
          person?: string;
          purpose?: string;
          referenceId?: string;
        }) => ({
          id: tx._id,
          date: new Date(tx.createdAt).toLocaleDateString('en-NP'),
          type: tx.type === 'purchase' ? 'in' : 'out',
          quantity: tx.qty,
          person: tx.person,
          purpose: tx.purpose,
          voucherRef: tx.referenceId,
        }));
        setTransactions(prev => ({ ...prev, [inventoryId]: uiTransactions }));
      }
    } catch (err: unknown) {
      console.error('Error fetching transactions:', err);
    }
  };

  const [newItemForm, setNewItemForm] = useState<Partial<InventoryItem>>({
    name: '',
    category: '',
    totalStock: 0,
    remainingStock: 0,
    unit: 'pcs',
    purchasePrice: 0,
    sellingPrice: 0,
    reorderLevel: 10,
    supplier: '',
  });

  const [outForm, setOutForm] = useState({
    quantity: 0,
    person: '',
    purpose: '',
  });

  const [stockInForm, setStockInForm] = useState({
    quantity: 0,
    purchasePrice: 0,
    supplier: '',
    notes: '',
  });

  const categories = ['All', 'Uniform', 'Stationery', 'Accessories'];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = async () => {
    if (newItemForm.name && newItemForm.category) {
      try {
        const payload = {
          schoolId: 'default-school',
          academicYear: new Date().getFullYear().toString(),
          name: newItemForm.name,
          category: newItemForm.category,
          totalStock: newItemForm.totalStock || 0,
          unit: newItemForm.unit || 'pcs',
          purchasePrice: newItemForm.purchasePrice || 0,
          sellingPrice: newItemForm.sellingPrice || 0,
          reorderLevel: newItemForm.reorderLevel || 10,
          supplier: newItemForm.supplier || '',
          hasVariants: false,
          variants: [],
        };

        const response = await fetch(`${API_BASE}/inventory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const savedItem = await response.json();
          // Use _id from MongoDB as the id
          const itemWithId = { ...savedItem, id: savedItem._id };
          setInventory([...inventory, itemWithId]);
          setTransactions({ ...transactions, [savedItem._id]: [] });
          setShowAddModal(false);
          setNewItemForm({
            name: '', category: '', totalStock: 0, remainingStock: 0, unit: 'pcs',
            purchasePrice: 0, sellingPrice: 0, reorderLevel: 10, supplier: '',
          });
        } else {
          console.error('Failed to save item');
          // Fallback: add to local state only
          const item: InventoryItem = {
            id: Date.now().toString(),
            name: newItemForm.name || '',
            category: newItemForm.category || '',
            totalStock: newItemForm.totalStock || 0,
            remainingStock: newItemForm.remainingStock || 0,
            unit: newItemForm.unit || 'pcs',
            purchasePrice: newItemForm.purchasePrice || 0,
            sellingPrice: newItemForm.sellingPrice || 0,
            reorderLevel: newItemForm.reorderLevel || 10,
            lastRestocked: new Date().toLocaleDateString('en-NP'),
            supplier: newItemForm.supplier || '',
          };
          setInventory([...inventory, item]);
          setTransactions({ ...transactions, [item.id]: [] });
          setShowAddModal(false);
          setNewItemForm({
            name: '', category: '', totalStock: 0, remainingStock: 0, unit: 'pcs',
            purchasePrice: 0, sellingPrice: 0, reorderLevel: 10, supplier: '',
          });
        }
      } catch (err: unknown) {
        console.error('Error adding item:', err);
      }
    }
  };

  const handleEditItem = async () => {
    if (selectedItem) {
      try {
        const itemId = getItemId(selectedItem);
        const updateData = {
          _id: itemId,
          name: newItemForm.name,
          category: newItemForm.category,
          purchasePrice: newItemForm.purchasePrice,
          sellingPrice: newItemForm.sellingPrice,
          reorderLevel: newItemForm.reorderLevel,
          supplier: newItemForm.supplier,
        };

        const response = await fetch(`${API_BASE}/inventory`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        if (response.ok) {
          const updated = inventory.map(item =>
            getItemId(item) === itemId ? { ...item, ...newItemForm } : item
          );
          setInventory(updated);
          setSelectedItem({ ...selectedItem, ...newItemForm });
          setShowEditModal(false);
        } else {
          console.error('Failed to update item');
          // Fallback: update local state only
          const updated = inventory.map(item =>
            getItemId(item) === itemId ? { ...item, ...newItemForm } : item
          );
          setInventory(updated);
          setSelectedItem({ ...selectedItem, ...newItemForm });
          setShowEditModal(false);
        }
      } catch (err: unknown) {
        console.error('Error updating item:', err);
      }
    }
  };

  const handleStockOut = async () => {
    if (selectedItem && outForm.quantity > 0) {
      const itemId = getItemId(selectedItem);
      const purpose = outForm.purpose;

      try {
        let transactionType: 'sale' | 'damage' | 'adjustment';
        let shouldReduceStock = true;
        let paymentStatus: string | null = null;

        // Determine transaction type based on purpose
        if (purpose === 'Sale') {
          transactionType = 'sale';
          paymentStatus = 'pending'; // Will be updated when billing confirms payment
          // For Sale: Do NOT reduce stock immediately - wait for billing confirmation
          shouldReduceStock = false;
        } else if (purpose === 'Damaged' || purpose === 'Damaged/Lost') {
          transactionType = 'damage';
          shouldReduceStock = true;
        } else {
          transactionType = 'adjustment';
          shouldReduceStock = true;
        }

        // Call API to record transaction
        const response = await fetch(`${API_BASE}/inventory/stock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inventoryId: itemId,
            schoolId: selectedItem.schoolId || 'default-school',
            type: transactionType,
            qty: outForm.quantity,
            cp: selectedItem.purchasePrice,
            sp: selectedItem.sellingPrice,
            paymentStatus,
            person: outForm.person,
            purpose: outForm.purpose,
          }),
        });

        if (response.ok) {
          const savedTransaction = await response.json();

          // Update local state for stock reduction (if applicable)
          if (shouldReduceStock) {
            const newRemainingStock = selectedItem.remainingStock - outForm.quantity;
            const updated = inventory.map(item =>
              getItemId(item) === itemId
                ? { ...item, remainingStock: newRemainingStock }
                : item
            );
            setInventory(updated);
            setSelectedItem({
              ...selectedItem,
              remainingStock: newRemainingStock,
            });
          }

          // Add transaction to local state
          const newTransaction: StockTransaction = {
            id: savedTransaction._id || Date.now().toString(),
            date: new Date().toLocaleDateString('en-NP'),
            type: 'out',
            quantity: outForm.quantity,
            person: outForm.person,
            purpose: outForm.purpose,
            voucherRef: `VCH-${Date.now()}`,
          };

          setTransactions({
            ...transactions,
            [itemId]: [...(transactions[itemId] || []), newTransaction],
          });

          setShowOutModal(false);
          setOutForm({ quantity: 0, person: '', purpose: '' });
        } else {
          console.error('Failed to record stock out transaction');
        }
      } catch (err: unknown) {
        console.error('Error processing stock out:', err);
      }
    }
  };

  const handleStockIn = async () => {
    if (selectedItem && stockInForm.quantity > 0) {
      const itemId = getItemId(selectedItem);

      try {
        // Call API to record purchase transaction
        const response = await fetch(`${API_BASE}/inventory/stock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inventoryId: itemId,
            schoolId: selectedItem.schoolId || 'default-school',
            type: 'purchase',
            qty: stockInForm.quantity,
            cp: stockInForm.purchasePrice || selectedItem.purchasePrice,
            person: stockInForm.supplier,
            purpose: 'Stock In',
            notes: stockInForm.notes,
          }),
        });

        if (response.ok) {
          const savedTransaction = await response.json();

          // Update local state - increase stock
          const newTotalStock = selectedItem.totalStock + stockInForm.quantity;
          const newRemainingStock = selectedItem.remainingStock + stockInForm.quantity;
          const updated = inventory.map(item =>
            getItemId(item) === itemId
              ? {
                  ...item,
                  totalStock: newTotalStock,
                  remainingStock: newRemainingStock,
                  supplier: stockInForm.supplier || item.supplier,
                }
              : item
          );
          setInventory(updated);
          setSelectedItem({
            ...selectedItem,
            totalStock: newTotalStock,
            remainingStock: newRemainingStock,
            supplier: stockInForm.supplier || selectedItem.supplier,
          });

          // Add transaction to local state
          const newTransaction: StockTransaction = {
            id: savedTransaction._id || Date.now().toString(),
            date: new Date().toLocaleDateString('en-NP'),
            type: 'in',
            quantity: stockInForm.quantity,
            person: stockInForm.supplier,
            purpose: 'Stock In',
            voucherRef: `GRN-${Date.now()}`,
          };

          setTransactions({
            ...transactions,
            [itemId]: [...(transactions[itemId] || []), newTransaction],
          });

          setShowStockInModal(false);
          setStockInForm({ quantity: 0, purchasePrice: 0, supplier: '', notes: '' });
        } else {
          console.error('Failed to record stock in transaction');
        }
      } catch (err: unknown) {
        console.error('Error processing stock in:', err);
      }
    }
  };

  const openEditModal = () => {
    if (selectedItem) {
      setNewItemForm(selectedItem);
      setShowEditModal(true);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Category', 'Stock', 'Purchase Price', 'Selling Price', 'Supplier'];
    const rows = inventory.map(item => [
      item.name,
      item.category,
      item.totalStock,
      item.purchasePrice,
      item.sellingPrice,
      item.supplier,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
    <div className="inventory-page">
      <div className="inventory-header">
        {/* <div className="inventory-header-left">
          <h1 className="inventory-title">Inventory Management</h1>
          <p className="inventory-subtitle">Track and manage school inventory items</p>
        </div> */}
        <div className="inventory-header-actions">
          {loading && <span className="loading-indicator">Loading...</span>}
          {error && <span className="error-indicator">{error}</span>}
          <button className="inventory-action-btn secondary" onClick={handleExportCSV}>
            <Download size={16} />
            Export
          </button>
          <button className="inventory-action-btn primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            Add Item
          </button>
        </div>
      </div>

      <div className="inventory-filters">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-buttons">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="inventory-content">
        <div className="inventory-grid">
          {filteredInventory.map(item => (
            <div
              key={item.id}
              className={`inventory-card ${selectedItem?.id === item.id ? 'selected' : ''} ${item.remainingStock <= item.reorderLevel ? 'low-stock' : ''}`}
              onClick={() => setSelectedItem(item)}
            >
              <div className="card-header">
                <div className="card-icon">
                  <Package size={24} />
                </div>
                <span className="card-category">{item.category}</span>
              </div>
              <h3 className="card-name">{item.name}</h3>
              <div className="card-stock">
                <div className="stock-info">
                  <span className="stock-label">In Stock</span>
                  <span className="stock-value">{item.remainingStock} {item.unit}</span>
                </div>
                {item.remainingStock <= item.reorderLevel && (
                  <div className="low-stock-warning">
                    <AlertCircle size={14} />
                    Low Stock
                  </div>
                )}
              </div>
              <div className="card-footer">
                <div className="stock-progress">
                  <div
                    className="stock-progress-bar"
                    style={{ width: `${(item.remainingStock / item.totalStock) * 100}%` }}
                  />
                </div>
                <span className="stock-total">of {item.totalStock} {item.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {selectedItem && (
          <div className="inventory-details">
            <div className="details-header">
              <div>
                <h2 className="details-title">{selectedItem.name}</h2>
                <span className="details-category">{selectedItem.category}</span>
              </div>
              <button className="close-btn" onClick={() => setSelectedItem(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Current Stock</span>
                <span className="detail-value">{selectedItem.remainingStock} {selectedItem.unit}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total Stock</span>
                <span className="detail-value">{selectedItem.totalStock} {selectedItem.unit}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Purchase Price</span>
                <span className="detail-value">रू {selectedItem.purchasePrice}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Selling Price</span>
                <span className="detail-value">रू {selectedItem.sellingPrice}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Reorder Level</span>
                <span className="detail-value">{selectedItem.reorderLevel} {selectedItem.unit}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Restocked</span>
                <span className="detail-value">{selectedItem.lastRestocked}</span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Supplier</span>
                <span className="detail-value">{selectedItem.supplier}</span>
              </div>
            </div>

            <div className="details-actions">
              <button className="action-btn edit" onClick={openEditModal}>
                <Edit2 size={16} />
                Edit Item
              </button>
              <button className="action-btn stock-in" onClick={() => setShowStockInModal(true)}>
                <ArrowUpCircle size={16} />
                Stock In
              </button>
              <button className="action-btn stock-out" onClick={() => setShowOutModal(true)}>
                <ArrowDownCircle size={16} />
                Stock Out
              </button>
              <button className="action-btn voucher">
                <Receipt size={16} />
                Create Voucher
              </button>
            </div>

            <div className="transaction-history">
              <h3 className="history-title">
                <History size={18} />
                Transaction History
              </h3>
              {(transactions[getItemId(selectedItem)] || []).length > 0 ? (
                <div className="transaction-list">
                  {(transactions[getItemId(selectedItem)] || []).map((tx: StockTransaction) => (
                    <div key={tx.id} className={`transaction-item ${tx.type}`}>
                      <div className="tx-icon">
                        {tx.type === 'in' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                      </div>
                      <div className="tx-details">
                        <div className="tx-header">
                          <span className="tx-type">{tx.type === 'in' ? 'Stock In' : 'Stock Out'}</span>
                          <span className="tx-qty">{tx.type === 'in' ? '+' : '-'}{tx.quantity} {selectedItem.unit}</span>
                        </div>
                        <div className="tx-meta">
                          <span className="tx-date">{tx.date}</span>
                          {tx.person && <span className="tx-person">{tx.person}</span>}
                          {tx.purpose && <span className="tx-purpose">{tx.purpose}</span>}
                        </div>
                        {tx.voucherRef && (
                          <span className="tx-voucher">Ref: {tx.voucherRef}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-transactions">No transactions recorded yet</div>
              )}
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Inventory Item</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Item Name</label>
                  <input
                    type="text"
                    value={newItemForm.name}
                    onChange={e => setNewItemForm({ ...newItemForm, name: e.target.value })}
                    placeholder="e.g., School Tie"
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newItemForm.category}
                    onChange={e => setNewItemForm({ ...newItemForm, category: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    <option value="Uniform">Uniform</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Total Stock</label>
                  <input
                    type="number"
                    value={newItemForm.totalStock}
                    onChange={e => setNewItemForm({ ...newItemForm, totalStock: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Current Stock</label>
                  <input
                    type="number"
                    value={newItemForm.remainingStock}
                    onChange={e => setNewItemForm({ ...newItemForm, remainingStock: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <select
                    value={newItemForm.unit}
                    onChange={e => setNewItemForm({ ...newItemForm, unit: e.target.value })}
                  >
                    <option value="pcs">Pieces</option>
                    <option value="dozen">Dozen</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Purchase Price (रू)</label>
                  <input
                    type="number"
                    value={newItemForm.purchasePrice}
                    onChange={e => setNewItemForm({ ...newItemForm, purchasePrice: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Selling Price (रू)</label>
                  <input
                    type="number"
                    value={newItemForm.sellingPrice}
                    onChange={e => setNewItemForm({ ...newItemForm, sellingPrice: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Reorder Level</label>
                  <input
                    type="number"
                    value={newItemForm.reorderLevel}
                    onChange={e => setNewItemForm({ ...newItemForm, reorderLevel: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Supplier</label>
                  <input
                    type="text"
                    value={newItemForm.supplier}
                    onChange={e => setNewItemForm({ ...newItemForm, supplier: e.target.value })}
                    placeholder="Supplier name"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddItem}>
                <Plus size={16} />
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Inventory Item</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Item Name</label>
                  <input
                    type="text"
                    value={newItemForm.name}
                    onChange={e => setNewItemForm({ ...newItemForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newItemForm.category}
                    onChange={e => setNewItemForm({ ...newItemForm, category: e.target.value })}
                  >
                    <option value="Uniform">Uniform</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Purchase Price (रू)</label>
                  <input
                    type="number"
                    value={newItemForm.purchasePrice}
                    onChange={e => setNewItemForm({ ...newItemForm, purchasePrice: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Selling Price (रू)</label>
                  <input
                    type="number"
                    value={newItemForm.sellingPrice}
                    onChange={e => setNewItemForm({ ...newItemForm, sellingPrice: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Reorder Level</label>
                  <input
                    type="number"
                    value={newItemForm.reorderLevel}
                    onChange={e => setNewItemForm({ ...newItemForm, reorderLevel: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Supplier</label>
                  <input
                    type="text"
                    value={newItemForm.supplier}
                    onChange={e => setNewItemForm({ ...newItemForm, supplier: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleEditItem}>
                <Check size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showOutModal && (
        <div className="modal-overlay" onClick={() => setShowOutModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Stock Out - {selectedItem?.name}</h2>
              <button className="close-btn" onClick={() => setShowOutModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="current-stock-display">
                <span className="stock-label">Available Stock:</span>
                <span className="stock-value">{selectedItem?.remainingStock} {selectedItem?.unit}</span>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    max={selectedItem?.remainingStock}
                    value={outForm.quantity}
                    onChange={e => setOutForm({ ...outForm, quantity: Number(e.target.value) })}
                    placeholder="Enter quantity"
                  />
                </div>
                <div className="form-group">
                  <label>Person / Student</label>
                  <input
                    type="text"
                    value={outForm.person}
                    onChange={e => setOutForm({ ...outForm, person: e.target.value })}
                    placeholder="Student name or ID"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Purpose</label>
                  <select
                    value={outForm.purpose}
                    onChange={e => setOutForm({ ...outForm, purpose: e.target.value })}
                  >
                    <option value="">Select Purpose</option>
                    <option value="New Admission">New Admission</option>
                    <option value="Replacement">Replacement</option>
                    <option value="Sale">Sale</option>
                    <option value="Damaged">Damaged/Lost</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowOutModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleStockOut}>
                <ArrowDownCircle size={16} />
                Confirm Stock Out
              </button>
            </div>
          </div>
        </div>
      )}

      {showStockInModal && (
        <div className="modal-overlay" onClick={() => setShowStockInModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Stock In - {selectedItem?.name}</h2>
              <button className="close-btn" onClick={() => setShowStockInModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="current-stock-display">
                <span className="stock-label">Current Stock:</span>
                <span className="stock-value">{selectedItem?.remainingStock} {selectedItem?.unit}</span>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Quantity to Add</label>
                  <input
                    type="number"
                    min={1}
                    value={stockInForm.quantity}
                    onChange={e => setStockInForm({ ...stockInForm, quantity: Number(e.target.value) })}
                    placeholder="Enter quantity"
                  />
                </div>
                <div className="form-group">
                  <label>Purchase Price (रू)</label>
                  <input
                    type="number"
                    value={stockInForm.purchasePrice}
                    onChange={e => setStockInForm({ ...stockInForm, purchasePrice: Number(e.target.value) })}
                    placeholder={selectedItem?.purchasePrice?.toString()}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Supplier</label>
                  <input
                    type="text"
                    value={stockInForm.supplier}
                    onChange={e => setStockInForm({ ...stockInForm, supplier: e.target.value })}
                    placeholder={selectedItem?.supplier || 'Supplier name'}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Notes</label>
                  <input
                    type="text"
                    value={stockInForm.notes}
                    onChange={e => setStockInForm({ ...stockInForm, notes: e.target.value })}
                    placeholder="Optional notes"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowStockInModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleStockIn}>
                <ArrowUpCircle size={16} />
                Confirm Stock In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}