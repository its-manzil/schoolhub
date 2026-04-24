'use client';

import { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, AlertCircle, ArrowLeftRight, Check, X } from 'lucide-react';
import { InventoryItem } from '../types';
import '../styles/form.css';
import '../styles/modal.css';

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

interface StockManagerProps {
  items: InventoryItem[];
  onStockUpdated: () => void;
}

type StockOperation = 'in' | 'out' | 'damage';

export default function StockManager({ items, onStockUpdated }: StockManagerProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [operation, setOperation] = useState<StockOperation>('in');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    quantity: 0,
    purchasePrice: 0,
    sellingPrice: 0,
    person: '',
    purpose: '',
    notes: '',
    paymentStatus: 'pending' as 'paid' | 'pending',
    variantName: '',
  });

  const getItemId = (item: InventoryItem): string => item._id || '';

  const handleItemSelect = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      ...formData,
      purchasePrice: item.purchasePrice,
      sellingPrice: item.sellingPrice,
    });
  };

  const handleSubmit = async () => {
    if (!selectedItem || formData.quantity <= 0) return;

    setLoading(true);
    const itemId = getItemId(selectedItem);

    let transactionType: 'purchase' | 'sale' | 'damage';

    if (operation === 'in') {
      transactionType = 'purchase';
    } else if (operation === 'damage') {
      transactionType = 'damage';
    } else {
      transactionType = 'sale';
    }

    const schoolId = getSchoolId();

    const payload = {
      inventoryId: itemId,
      schoolId: String(schoolId || selectedItem.schoolId || ''),
      type: transactionType,
      qty: formData.quantity,
      cp: formData.purchasePrice || selectedItem.purchasePrice,
      sp: formData.sellingPrice || selectedItem.sellingPrice,
      paymentStatus: operation === 'out' ? formData.paymentStatus : null,
      person: formData.person,
      purpose: formData.purpose || (operation === 'in' ? 'Stock In' : operation === 'damage' ? 'Damage/Loss' : 'Sale'),
      notes: formData.notes,
      variantName: formData.variantName || null,
    };

    try {
      const response = await fetch(`${API_BASE}/inventory/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        resetForm();
        setShowModal(false);
        onStockUpdated();
      }
    } catch (err) {
      console.error('Error processing stock operation:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      quantity: 0,
      purchasePrice: 0,
      sellingPrice: 0,
      person: '',
      purpose: '',
      notes: '',
      paymentStatus: 'pending',
      variantName: '',
    });
    setSelectedItem(null);
  };

  const availableStock = selectedItem
    ? selectedItem.totalStock - selectedItem.totalSold - selectedItem.totalDamaged
    : 0;

  return (
    <div className="stock-manager-container">
      <div className="section-header">
        <h2><ArrowLeftRight size={20} /> Stock Management</h2>
        <p>Manage stock IN, OUT, and damage/loss records</p>
      </div>

      <div className="operation-selector">
        <button
          className={`op-btn ${operation === 'in' ? 'active' : ''}`}
          onClick={() => setOperation('in')}
        >
          <ArrowUpCircle size={20} />
          <span>Stock In</span>
          <small>Purchase / Restock</small>
        </button>
        <button
          className={`op-btn ${operation === 'out' ? 'active' : ''}`}
          onClick={() => setOperation('out')}
        >
          <ArrowDownCircle size={20} />
          <span>Stock Out</span>
          <small>Sale / Distribution</small>
        </button>
        <button
          className={`op-btn ${operation === 'damage' ? 'active' : ''}`}
          onClick={() => setOperation('damage')}
        >
          <AlertCircle size={20} />
          <span>Damage/Loss</span>
          <small>Write-off Stock</small>
        </button>
      </div>

      <div className="stock-form-card">
        <div className="item-selector">
          <label>Select Inventory Item *</label>
          <select
            value={selectedItem?._id || ''}
            onChange={(e) => {
              const item = items.find((i) => i._id === e.target.value);
              if (item) handleItemSelect(item);
            }}
          >
            <option value="">Choose an item...</option>
            {items.map((item) => {
              const available = item.totalStock - item.totalSold - item.totalDamaged;
              return (
                <option key={item._id} value={item._id}>
                  {item.name} ({available} {item.unit} available)
                </option>
              );
            })}
          </select>
        </div>

        {selectedItem && (
          <div className="selected-item-info">
            <div className="info-row">
              <span>Category: <strong>{selectedItem.category}</strong></span>
              <span>Unit: <strong>{selectedItem.unit}</strong></span>
            </div>
            <div className="info-row">
              <span>Available: <strong>{availableStock} {selectedItem.unit}</strong></span>
              <span>CP: <strong>रू{selectedItem.purchasePrice}</strong></span>
              <span>SP: <strong>रू{selectedItem.sellingPrice}</strong></span>
            </div>
            {selectedItem.hasVariants && (
              <div className="variant-selector">
                <label>Variant (Optional)</label>
                <select
                  value={formData.variantName}
                  onChange={(e) => setFormData({ ...formData, variantName: e.target.value })}
                >
                  <option value="">All Variants</option>
                  {selectedItem.variants.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} (Stock: {v.stock})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label>Quantity *</label>
            <input
              type="number"
              min={1}
              max={operation === 'out' || operation === 'damage' ? availableStock : undefined}
              value={formData.quantity || ''}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            />
            {operation !== 'in' && (
              <small className="hint">Max: {availableStock} {selectedItem?.unit}</small>
            )}
          </div>

          {operation === 'in' && (
            <div className="form-group">
              <label>Purchase Price (रू)</label>
              <input
                type="number"
                value={formData.purchasePrice || ''}
                onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                placeholder={selectedItem?.purchasePrice?.toString()}
              />
            </div>
          )}

          {operation === 'out' && (
            <>
              <div className="form-group">
                <label>Selling Price (रू)</label>
                <input
                  type="number"
                  value={formData.sellingPrice || ''}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                  placeholder={selectedItem?.sellingPrice?.toString()}
                />
              </div>
              <div className="form-group">
                <label>Payment Status</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as 'paid' | 'pending' })}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
                <small className="hint">
                  {formData.paymentStatus === 'paid' 
                    ? 'Stock will be deducted immediately' 
                    : 'Stock will NOT be deducted until payment is received'}
                </small>
              </div>
            </>
          )}

          <div className="form-group">
            <label>{operation === 'in' ? 'Supplier' : 'Person/Student'}</label>
            <input
              type="text"
              value={formData.person}
              onChange={(e) => setFormData({ ...formData, person: e.target.value })}
              placeholder={operation === 'in' ? 'Supplier name' : 'Person name or ID'}
            />
          </div>

          <div className="form-group full-width">
            <label>Purpose/Notes</label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder={operation === 'in' ? 'e.g., Restock' : operation === 'damage' ? 'e.g., Damaged in storage' : 'e.g., Sale to student'}
            />
          </div>
        </div>

        {operation === 'out' && formData.paymentStatus === 'paid' && formData.sellingPrice > 0 && formData.purchasePrice > 0 && (
          <div className="profit-preview">
            <span>Profit per unit: </span>
            <strong className={formData.sellingPrice - formData.purchasePrice >= 0 ? 'positive' : 'negative'}>
              रू{(formData.sellingPrice - formData.purchasePrice).toFixed(2)}
            </strong>
            <span> | Total profit: </span>
            <strong className={formData.sellingPrice - formData.purchasePrice >= 0 ? 'positive' : 'negative'}>
              रू{((formData.sellingPrice - formData.purchasePrice) * formData.quantity).toFixed(2)}
            </strong>
          </div>
        )}

        <div className="form-actions">
          <button className="btn-secondary" onClick={resetForm}>Reset</button>
          <button
            className="btn-primary"
            onClick={() => setShowModal(true)}
            disabled={!selectedItem || formData.quantity <= 0 || (operation !== 'in' && formData.quantity > availableStock)}
          >
            <Check size={16} /> Process {operation === 'in' ? 'Stock In' : operation === 'damage' ? 'Damage Record' : 'Stock Out'}
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Stock Operation</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="confirmation-details">
                <div><strong>Operation:</strong> {operation === 'in' ? 'Stock In (Purchase)' : operation === 'damage' ? 'Damage/Loss' : 'Stock Out (Sale)'}</div>
                <div><strong>Item:</strong> {selectedItem?.name}</div>
                <div><strong>Quantity:</strong> {formData.quantity} {selectedItem?.unit}</div>
                {operation === 'in' && <div><strong>Purchase Price:</strong> रू{formData.purchasePrice || selectedItem?.purchasePrice}</div>}
                {operation === 'out' && (
                  <>
                    <div><strong>Selling Price:</strong> रू{formData.sellingPrice || selectedItem?.sellingPrice}</div>
                    <div><strong>Payment:</strong> {formData.paymentStatus === 'paid' ? 'PAID (Stock will be deducted)' : 'PENDING (Stock reserved)'}</div>
                  </>
                )}
                {formData.person && <div><strong>{operation === 'in' ? 'Supplier' : 'Person'}:</strong> {formData.person}</div>}
                {formData.purpose && <div><strong>Purpose:</strong> {formData.purpose}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
