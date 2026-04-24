'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import './inventory-rate-setup.css';
import BillingNavbar from '../components/BillingNavbar';

// Types matching Accounting Inventory API
interface InventoryVariant {
  name: string;
  cp: number;
  sp: number;
  stock: number;
  sold: number;
  damaged: number;
}

interface InventoryItem {
  _id: string;
  schoolId: string;
  academicYear: string;
  name: string;
  category: string;
  unit: string;
  hasVariants: boolean;
  variants: InventoryVariant[];
  totalStock: number;
  totalSold: number;
  totalDamaged: number;
  reorderLevel: number;
  supplier: string;
  purchasePrice: number;
  sellingPrice: number;
  createdAt?: string;
  updatedAt?: string;
}

// Flattened variant row for display
interface VariantRow {
  itemId: string;
  itemName: string;
  category: string;
  variantName: string;
  stock: number;
  sp: number;
  cp: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

export default function InventoryOverviewPage() {
  const router = useRouter();

  // Auth & User State
  const [schoolId, setSchoolId] = useState<string>('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data State
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockStatus, setStockStatus] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');

  // View Mode
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Auth Check
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
          router.push('/login');
          return;
        }

        const user = JSON.parse(userData);
        const allowedRoles = ['schooladmin', 'billing'];

        if (!allowedRoles.includes(user.role)) {
          router.push('/login');
          return;
        }

        setSchoolId(user.schoolId || '');
        setIsAuthorized(true);
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch Inventory from Accounting API
  const fetchInventory = useCallback(async () => {
    if (!schoolId) return;

    try {
      setError(null);
      const token = localStorage.getItem('token') || '';
      
      // Fetch inventory with user's schoolId
      const response = await fetch(`/api/accounting/inventory?schoolId=${schoolId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }

      const data: InventoryItem[] = await response.json();
      setInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    }
  }, [schoolId]);

  useEffect(() => {
    if (schoolId) {
      fetchInventory();
    }
  }, [schoolId, fetchInventory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(inventory.map(item => item.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [inventory]);

  // Get stock status for a variant
  const getVariantStatus = (stock: number, reorderLevel: number): VariantRow['status'] => {
    if (stock === 0) return 'out-of-stock';
    if (stock <= reorderLevel) return 'low-stock';
    return 'in-stock';
  };

  // Filter inventory at product level (search checks item name, category, and variant names)
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      // Search filter - check item name, category, and variant names
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchLower) ||
        (item.category || '').toLowerCase().includes(searchLower) ||
        (item.hasVariants && item.variants?.some(v => v.name.toLowerCase().includes(searchLower)));

      // Category filter
      const matchesCategory = !selectedCategory || item.category === selectedCategory;

      // Stock status filter - check if any variant matches the status
      const matchesStatus = stockStatus === 'all' || 
        (item.hasVariants && item.variants?.some(v => {
          const status = getVariantStatus(v.stock || 0, item.reorderLevel || 10);
          return status === stockStatus;
        })) ||
        (!item.hasVariants && getVariantStatus(item.totalStock || 0, item.reorderLevel || 10) === stockStatus);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [inventory, searchQuery, selectedCategory, stockStatus]);

  const formatPrice = (price: number) => {
    return `Rs ${price.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <>
        <BillingNavbar />
        <div className="inv-loading">
          <div className="inv-spinner"></div>
          <p>Loading inventory...</p>
        </div>
      </>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <BillingNavbar />
      <div className="inventory-overview-page">
        {/* Header */}
        <div className="inv-header">
          <div className="inv-header-content">
            <div>
              <h1>Inventory Overview</h1>
              <p>View available inventory for billing</p>
            </div>
            <div className="inv-view-toggle">
              <button
                className={`inv-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button
                className={`inv-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="inv-filters">
          <div className="inv-filter-group">
            <div className="inv-search">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Search items, variants, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="inv-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              className="inv-select"
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value as 'all' | 'in-stock' | 'low-stock' | 'out-of-stock')}
            >
              <option value="all">All Stock Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          <div className="inv-results-count">
            Showing {filteredInventory.length} of {inventory.length} products
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="inv-error">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        {/* Content */}
        {filteredInventory.length === 0 ? (
          <div className="inv-empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
            <p>No inventory found</p>
            <span>Try adjusting your filters or search query</span>
          </div>
        ) : viewMode === 'table' ? (
          <div className="inv-table-container">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Variants</th>
                  <th>Total Stock</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item._id} className="inv-product-row">
                    <td className="inv-cell-name">{item.name}</td>
                    <td className="inv-cell-category">{item.category || 'Uncategorized'}</td>
                    <td className="inv-cell-variants">
                      {item.hasVariants && item.variants?.length > 0 ? (
                        <table className="inv-nested-table">
                          <tbody>
                            {item.variants.map((variant) => (
                              <tr key={variant.name}>
                                <td>{variant.name}</td>
                                <td>{variant.stock || 0}</td>
                                <td>{formatPrice(variant.sp || 0)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="inv-no-variants">
                          <span>Stock: <strong>{item.totalStock || 0}</strong></span>
                          <span>Price: <strong>{formatPrice(item.sellingPrice || 0)}</strong></span>
                        </div>
                      )}
                    </td>
                    <td className="inv-cell-stock">{item.totalStock || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="inv-grid">
            {filteredInventory.map((item) => (
              <div key={item._id} className="inv-card">
                <div className="inv-card-header">
                  <h3>{item.name}</h3>
                  <span className="inv-category">{item.category || 'Uncategorized'}</span>
                </div>
                <div className="inv-card-body">
                  {item.hasVariants && item.variants?.length > 0 ? (
                    <table className="inv-variants-table">
                      <thead>
                        <tr>
                          <th>Variant</th>
                          <th>Stock</th>
                          <th>Selling Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.variants.map((variant) => {
                          const status = getVariantStatus(variant.stock || 0, item.reorderLevel || 10);
                          return (
                            <tr key={variant.name}>
                              <td>{variant.name}</td>
                              <td className={status === 'out-of-stock' ? 'inv-text-danger' : status === 'low-stock' ? 'inv-text-warning' : ''}>
                                {variant.stock || 0}
                              </td>
                              <td className="inv-price">{formatPrice(variant.sp || 0)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="inv-simple-item">
                      <div className="inv-simple-row">
                        <span>Stock:</span>
                        <span className={getVariantStatus(item.totalStock || 0, item.reorderLevel || 10) === 'out-of-stock' ? 'inv-text-danger' : ''}>
                          {item.totalStock || 0}
                        </span>
                      </div>
                      <div className="inv-simple-row">
                        <span>Price:</span>
                        <span className="inv-price">{formatPrice(item.sellingPrice || 0)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
