'use client';

import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, Trash2, Tag } from 'lucide-react';
import './InventorySelector.css';

import { useToast } from '../../../context/ToastContext';

interface InventoryItem {
  _id: string;
  name: string;
  variants: Array<{
    _id: string;
    label: string;
    price: number;
    stock: number;
  }>;
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
  const { showToast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:2056/api/inventory?schoolId=${schoolId}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'x-school-id': schoolId.toString() }
        });
        const result = await response.json();
        if (result.success) setItems(result.data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [schoolId]);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = () => {
    if (!selectedItem || !selectedVariantId) return;

    const variant = selectedItem.variants.find(v => v._id === selectedVariantId);
    if (!variant) return;

    const id = `${selectedItem._id}-${variant._id}`;
    
    // Check if item already in bill
    if (billItems.some(item => item.id === id)) {
      showToast('Item already added to bill. Adjust quantity if needed.', 'error');
      return;
    }

    onAddItem({
      id,
      inventoryId: selectedItem._id,
      name: selectedItem.name,
      variant: variant._id,
      variantLabel: variant.label,
      qty,
      rate: variant.price,
      amount: variant.price * qty
    });

    // Reset local state
    setSelectedItem(null);
    setSelectedVariantId('');
    setQty(1);
    setSearchTerm('');
  };

  return (
    <div className="billing-card inventory-selector-v2">
      <div className="card-header-alt">
        <div className="header-info">
          <Package size={18} className="text-primary" />
          <h3 className="card-title-sm">Add Inventory Items</h3>
        </div>
      </div>

      <div className="inventory-add-controls">
        <div className="item-search-container">
          <div className="search-box-compact no-margin">
            <Search size={14} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search item..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {searchTerm && !selectedItem && (
            <div className="search-dropdown">
              {filteredItems.map(item => (
                <div key={item._id} className="dropdown-item" onClick={() => {
                  setSelectedItem(item);
                  setSearchTerm(item.name);
                  if (item.variants.length === 1) setSelectedVariantId(item.variants[0]._id);
                }}>
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedItem && (
          <div className="variant-qty-row">
            <div className="variant-select">
              <label>Variant</label>
              <select value={selectedVariantId} onChange={(e) => setSelectedVariantId(e.target.value)}>
                <option value="">Select Variant</option>
                {selectedItem.variants.map(v => (
                  <option key={v._id} value={v._id}>
                    {v.label} (Rs {v.price}) - Stock: {v.stock}
                  </option>
                ))}
              </select>
            </div>
            <div className="qty-input-group">
              <label>Qty</label>
              <input type="number" value={qty} min="1" onChange={(e) => setQty(parseInt(e.target.value) || 1)} />
            </div>
            <button className="btn-add-item" onClick={handleAddItem} disabled={!selectedVariantId}>
              <Plus size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="selected-items-list">
        {billItems.length === 0 ? (
          <div className="list-empty-state">
            <Tag size={32} className="text-muted" />
            <p>No items added to bill yet.</p>
          </div>
        ) : (
          <div className="items-grid-v2">
            {billItems.map(item => (
              <div key={item.id} className="bill-item-card">
                <div className="item-details">
                  <span className="item-name-v2">{item.name}</span>
                  <span className="item-variant-v2">{item.variantLabel}</span>
                  <div className="item-pricing-v2">
                    <span className="qty-badge">{item.qty} x Rs {item.rate}</span>
                    <span className="item-total-v2">Rs {item.amount}</span>
                  </div>
                </div>
                <button className="btn-remove-v2" onClick={() => onRemoveItem(item.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
