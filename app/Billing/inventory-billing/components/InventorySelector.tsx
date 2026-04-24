'use client';

import React, { useState, useEffect, useMemo } from 'react';
import './InventorySelector.css';

// Accounting Inventory Variant Structure
interface InventoryVariant {
  name: string;
  cp: number;
  sp: number;
  stock: number;
  sold: number;
  damaged: number;
}

// Accounting Inventory Item Structure
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
}

interface BillItem {
  id: string;
  inventoryId: string;
  name: string;
  variant?: string;
  variantLabel?: string;
  qty: number;
  rate: number;
  amount: number;
}

interface InventorySelectorProps {
  schoolId: number;
  academicYear: string;
  billItems: BillItem[];
  onAddItem: (item: BillItem) => void;
  onRemoveItem: (id: string) => void;
}

export default function InventorySelector({
  schoolId,
  academicYear,
  billItems,
  onAddItem,
  onRemoveItem
}: InventorySelectorProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);

  // Form state for adding items
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [selectedVariantName, setSelectedVariantName] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Fetch inventory from Accounting module
  useEffect(() => {
    const fetchInventory = async () => {
      if (!schoolId) return;

      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        // Fetch from Accounting API with schoolId
        const response = await fetch(
          `/api/accounting/inventory?schoolId=${schoolId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch inventory');
        }

        const data: InventoryItem[] = await response.json();

        setInventory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setError('Failed to load inventory from Accounting module');
        setInventory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [schoolId]);

  // Reset variant when inventory changes
  useEffect(() => {
    setSelectedVariantName('');
    setQuantity(1);
    setStockError(null);
  }, [selectedInventoryId]);

  const selectedInventory = inventory.find(inv => inv._id === selectedInventoryId);

  // Get selected variant details
  const selectedVariant = useMemo(() => {
    if (!selectedInventory || !selectedVariantName) return null;
    return selectedInventory.variants?.find(v => v.name === selectedVariantName) || null;
  }, [selectedInventory, selectedVariantName]);

  // Available stock display
  const availableStock = useMemo(() => {
    if (!selectedInventory) return 0;
    if (selectedInventory.hasVariants && selectedVariant) {
      return selectedVariant.stock || 0;
    }
    return selectedInventory.totalStock || 0;
  }, [selectedInventory, selectedVariant]);

  const handleAddItem = () => {
    if (!selectedInventory) return;

    // Validate stock
    if (selectedInventory.hasVariants) {
      if (!selectedVariant) {
        setStockError('Please select a variant');
        return;
      }
      if (quantity > selectedVariant.stock) {
        setStockError(`Insufficient stock. Available: ${selectedVariant.stock} pcs`);
        return;
      }
    } else {
      if (quantity > selectedInventory.totalStock) {
        setStockError(`Insufficient stock. Available: ${selectedInventory.totalStock} pcs`);
        return;
      }
    }

    setStockError(null);

    let rate: number;
    let variantName: string | undefined;

    if (selectedInventory.hasVariants) {
      if (!selectedVariant) return;
      rate = selectedVariant.sp;
      variantName = selectedVariant.name;
    } else {
      rate = selectedInventory.sellingPrice || 0;
    }

    const newItem: BillItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      inventoryId: selectedInventory._id,
      name: selectedInventory.name,
      variant: variantName || undefined,
      variantLabel: variantName,
      qty: quantity,
      rate,
      amount: rate * quantity
    };

    onAddItem(newItem);

    // Reset form
    setSelectedInventoryId('');
    setSelectedVariantName('');
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="inventory-selector">
        <div className="inventory-loading">
          <div className="spinner-small"></div>
          <span>Loading inventories...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inventory-selector">
        <div className="inventory-error">{error}</div>
      </div>
    );
  }

  if (inventory.length === 0) {
    return (
      <div className="inventory-selector">
        <div className="inventory-empty">
          <p>No inventory found</p>
          <p className="inventory-empty-hint">
            Please add inventory items in the Accounting module first
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-selector">
      <h3 className="section-title">Select Inventory Items</h3>

      <div className="inventory-form">
        {/* Inventory Selection */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Inventory Item</label>
            <select
              className="form-select"
              value={selectedInventoryId}
              onChange={(e) => setSelectedInventoryId(e.target.value)}
            >
              <option value="">Select Item</option>
              {inventory.map((item) => (
                <option 
                  key={item._id} 
                  value={item._id}
                  disabled={item.hasVariants ? 
                    (!item.variants || item.variants.length === 0) : 
                    item.totalStock === 0
                  }
                >
                  {item.name} 
                  {item.hasVariants ? 
                    (item.variants && item.variants.length > 0 ? ' (Variants available)' : ' (No variants)') : 
                    (item.totalStock === 0 ? ' - Out of Stock' : ` - Rs ${item.sellingPrice?.toFixed(0)}`)
                  }
                </option>
              ))}
            </select>
          </div>

          {/* Variant Selection (if applicable) */}
          {selectedInventory?.hasVariants && (
            <div className="form-group">
              <label className="form-label">
                Variant / Size
                {selectedVariant && (
                  <span className="stock-badge">
                    Available: {selectedVariant.stock} pcs
                  </span>
                )}
              </label>
              <select
                className="form-select"
                value={selectedVariantName}
                onChange={(e) => {
                  setSelectedVariantName(e.target.value);
                  setStockError(null);
                }}
              >
                <option value="">Select Variant</option>
                {selectedInventory.variants?.map((variant) => (
                  <option 
                    key={variant.name} 
                    value={variant.name}
                    disabled={variant.stock === 0}
                  >
                    {variant.name} - Rs {variant.sp.toFixed(2)} 
                    {variant.stock === 0 ? '(Out of Stock)' : `(${variant.stock} pcs)`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity */}
          <div className="form-group quantity-group">
            <label className="form-label">
              Quantity
              {selectedInventory && !selectedInventory.hasVariants && (
                <span className="stock-badge">
                  Available: {selectedInventory.totalStock} pcs
                </span>
              )}
            </label>
            <input
              type="number"
              className={`form-input ${stockError ? 'error' : ''}`}
              min="1"
              max={selectedInventory?.hasVariants ? selectedVariant?.stock : selectedInventory?.totalStock}
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setQuantity(Math.max(1, val));
                setStockError(null);
              }}
            />
            {stockError && <span className="stock-error">{stockError}</span>}
          </div>

          {/* Add Button */}
          <div className="form-group button-group">
            <label className="form-label">&nbsp;</label>
            <button
              className="btn-add-item"
              onClick={handleAddItem}
              disabled={!selectedInventoryId || (selectedInventory?.hasVariants && !selectedVariant)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Item
            </button>
          </div>
        </div>

        {/* Price Preview */}
        {selectedInventory && (
          <div className="price-preview">
            {selectedInventory.hasVariants ? (
              selectedVariant ? (
                <span>
                  Rate: <strong>Rs {selectedVariant.sp.toFixed(2)}</strong>
                  {' '}× {quantity} = <strong>Rs {(selectedVariant.sp * quantity).toFixed(2)}</strong>
                </span>
              ) : (
                <span className="price-hint">Please select a variant</span>
              )
            ) : (
              <span>
                Rate: <strong>Rs {selectedInventory.sellingPrice?.toFixed(2)}</strong>
                {' '}× {quantity} = <strong>Rs {((selectedInventory.sellingPrice || 0) * quantity).toFixed(2)}</strong>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
