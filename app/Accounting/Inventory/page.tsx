'use client';

import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import InventoryNavbar from './components/InventoryNavbar';
import AddItem from './components/AddItem';
import InventoryList from './components/InventoryList';
import StockManager from './components/StockManager';
import Reports from './components/Reports';
import { InventoryItem, StockTransaction, TabType } from './types';
import './Inventory.css';

const API_BASE = '/api/accounting';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/inventory?schoolId=default-school`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        setError('Failed to fetch inventory');
      }
    } catch (err: unknown) {
      console.error('Error fetching inventory:', err);
      setError('Error fetching inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/inventory/transactions?schoolId=default-school`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (err: unknown) {
      console.error('Error fetching transactions:', err);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
    fetchTransactions();
  }, [fetchInventory, fetchTransactions]);

  const handleItemAdded = (item: InventoryItem) => {
    setItems((prev) => [...prev, item]);
    setActiveTab('list');
  };

  const handleEdit = (item: InventoryItem) => {
    // TODO: Implement edit modal
    console.log('Edit item:', item);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/inventory`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id }),
      });

      if (response.ok) {
        setItems((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err: unknown) {
      console.error('Error deleting item:', err);
    }
  };

  const handleSelect = (item: InventoryItem) => {
    // TODO: Show item details modal
    console.log('Selected item:', item);
  };

  const handleStockUpdated = () => {
    fetchInventory();
    fetchTransactions();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'add':
        return <AddItem onItemAdded={handleItemAdded} />;
      case 'list':
        return (
          <InventoryList
            items={items}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSelect={handleSelect}
          />
        );
      case 'stock':
        return <StockManager items={items} onStockUpdated={handleStockUpdated} />;
      case 'reports':
        return <Reports items={items} transactions={transactions} />;
      default:
        return <InventoryList items={items} onEdit={handleEdit} onDelete={handleDelete} onSelect={handleSelect} />;
    }
  };

  return (
    <Layout>
      <div className="inventory-page-container">
        <InventoryNavbar activeTab={activeTab} onTabChange={setActiveTab} />
        
        {loading && <div className="loading-overlay">Loading...</div>}
        {error && <div className="error-banner">{error}</div>}
        
        <div className="inventory-content">
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
}
