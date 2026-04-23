'use client';

import React, { useState, useEffect } from 'react';
import './InventorySelector.css';

interface Variant {
  label: string;
  price: number;
}

interface Inventory {
  _id: string;
  schoolId: number;
  academicYear: string;
  name: string;
  hasVariants: boolean;
  price?: number;
  variants?: Variant[];
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
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for adding items
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Fetch inventories
  useEffect(() => {
    const fetchInventories = async () => {
      if (!schoolId || !academicYear) return;

      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        const response = await fetch(
          `/api/billing/inventory-rate-setup?schoolId=${schoolId}&academicYear=${academicYear}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-school-id': schoolId.toString()
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch inventories');
        }

        const data = await response.json();

        if (data.success && data.data) {
          setInventories(data.data);
        } else {
          setInventories([]);
        }
      } catch (err) {
        console.error('Error fetching inventories:', err);
        setError('Failed to load inventories');
        setInventories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventories();
  }, [schoolId, academicYear]);

  // Reset variant when inventory changes
  useEffect(() => {
    setSelectedVariant('');
    setQuantity(1);
  }, [selectedInventoryId]);

  const selectedInventory = inventories.find(inv => inv._id === selectedInventoryId);

  const handleAddItem = () => {
    if (!selectedInventory) return;

    let rate: number;
    let variantLabel: string | undefined;

    if (selectedInventory.hasVariants) {
      if (!selectedVariant) return;
      const variant = selectedInventory.variants?.find(v => v.label === selectedVariant);
      if (!variant) return;
      rate = variant.price;
      variantLabel = variant.label;
    } else {
      rate = selectedInventory.price || 0;
    }

    const newItem: BillItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      inventoryId: selectedInventory._id,
      name: selectedInventory.name,
      variant: selectedVariant || undefined,
      variantLabel,
      qty: quantity,
      rate,
      amount: rate * quantity
    };

    onAddItem(newItem);

    // Reset form
    setSelectedInventoryId('');
    setSelectedVariant('');
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

  if (inventories.length === 0) {
    return (
      <div className="inventory-selector">
        <div className="inventory-empty">
          <p>No inventories found for {academicYear}</p>
          <p className="inventory-empty-hint">
            Please set up inventory rates first in Inventory Rate Setup
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
              <option value="">Select Inventory</option>
              {inventories.map((inventory) => (
                <option key={inventory._id} value={inventory._id}>
                  {inventory.name} {inventory.hasVariants ? '(Variants available)' : `- Rs ${inventory.price}`}
                </option>
              ))}
            </select>
          </div>

          {/* Variant Selection (if applicable) */}
          {selectedInventory?.hasVariants && (
            <div className="form-group">
              <label className="form-label">Variant / Size</label>
              <select
                className="form-select"
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
              >
                <option value="">Select Variant</option>
                {selectedInventory.variants?.map((variant) => (
                  <option key={variant.label} value={variant.label}>
                    {variant.label} - Rs {variant.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity */}
          <div className="form-group quantity-group">
            <label className="form-label">Quantity</label>
            <input
              type="number"
              className="form-input"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            />
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
                  Rate: <strong>Rs {selectedInventory.variants?.find(v => v.label === selectedVariant)?.price.toFixed(2)}</strong>
                  {' '}× {quantity} = <strong>Rs {((selectedInventory.variants?.find(v => v.label === selectedVariant)?.price || 0) * quantity).toFixed(2)}</strong>
                </span>
              ) : (
                <span className="price-hint">Please select a variant</span>
              )
            ) : (
              <span>
                Rate: <strong>Rs {selectedInventory.price?.toFixed(2)}</strong>
                {' '}× {quantity} = <strong>Rs {((selectedInventory.price || 0) * quantity).toFixed(2)}</strong>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
