'use client';

import { useState } from 'react';
import { Plus, X, Check, Package } from 'lucide-react';
import { InventoryItem, InventoryVariant } from '../types';
import '../styles/form.css';
import '../styles/modal.css';

const API_BASE = '/api/accounting';

const categories = ['Uniform', 'Stationery', 'Accessories', 'Books', 'Sports', 'Other'];
const units = ['pcs', 'dozen', 'box', 'pack', 'kg', 'meter'];

interface AddItemProps {
  onItemAdded: (item: InventoryItem) => void;
}

export default function AddItem({ onItemAdded }: AddItemProps) {
  const [showModal, setShowModal] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<InventoryVariant[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'pcs',
    purchasePrice: 0,
    sellingPrice: 0,
    initialStock: 0,
    supplier: '',
    reorderLevel: 10,
  });

  const handleAddVariant = () => {
    setVariants([...variants, { name: '', cp: 0, sp: 0, stock: 0, sold: 0, damaged: 0 }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof InventoryVariant, value: string | number) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const calculateTotals = () => {
    if (hasVariants && variants.length > 0) {
      const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
      const avgCp = variants.reduce((sum, v) => sum + v.cp * v.stock, 0) / totalStock || 0;
      const avgSp = variants.reduce((sum, v) => sum + v.sp * v.stock, 0) / totalStock || 0;
      return { totalStock, purchasePrice: avgCp, sellingPrice: avgSp };
    }
    return {
      totalStock: formData.initialStock,
      purchasePrice: formData.purchasePrice,
      sellingPrice: formData.sellingPrice,
    };
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category) return;

    setLoading(true);
    const totals = calculateTotals();

    const payload: Omit<InventoryItem, '_id'> = {
      schoolId: 'default-school',
      academicYear: new Date().getFullYear().toString(),
      name: formData.name,
      category: formData.category,
      unit: formData.unit,
      hasVariants,
      variants: hasVariants ? variants : [],
      totalStock: totals.totalStock,
      totalSold: 0,
      totalDamaged: 0,
      reorderLevel: formData.reorderLevel,
      supplier: formData.supplier,
      purchasePrice: totals.purchasePrice,
      sellingPrice: totals.sellingPrice,
    };

    try {
      const response = await fetch(`${API_BASE}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const savedItem = await response.json();
        onItemAdded(savedItem);
        resetForm();
        setShowModal(false);
      }
    } catch (err) {
      console.error('Error saving item:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      unit: 'pcs',
      purchasePrice: 0,
      sellingPrice: 0,
      initialStock: 0,
      supplier: '',
      reorderLevel: 10,
    });
    setVariants([]);
    setHasVariants(false);
  };

  const profitMargin = formData.sellingPrice > 0 && formData.purchasePrice > 0
    ? ((formData.sellingPrice - formData.purchasePrice) / formData.purchasePrice * 100).toFixed(1)
    : 0;

  return (
    <div className="add-item-container">
      <div className="section-header">
        <h2><Package size={20} /> Add New Inventory Item</h2>
        <p>Create a new inventory item with complete details</p>
      </div>

      <div className="form-card">
        <div className="form-grid">
          <div className="form-group">
            <label>Item Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., School Uniform Shirt"
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Unit</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            >
              {units.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Initial Stock *</label>
            <input
              type="number"
              min={0}
              value={formData.initialStock}
              onChange={(e) => setFormData({ ...formData, initialStock: parseInt(e.target.value) || 0 })}
              disabled={hasVariants}
            />
          </div>

          <div className="form-group">
            <label>Purchase Price (CP) *</label>
            <input
              type="number"
              min={0}
              value={formData.purchasePrice}
              onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
              disabled={hasVariants}
            />
          </div>

          <div className="form-group">
            <label>Selling Price (SP) *</label>
            <input
              type="number"
              min={0}
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
              disabled={hasVariants}
            />
          </div>

          <div className="form-group">
            <label>Profit Margin</label>
            <div className="profit-display">
              {!hasVariants && <span className={Number(profitMargin) > 0 ? 'positive' : 'negative'}>{profitMargin}%</span>}
              {hasVariants && <span className="muted">Calculated from variants</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Reorder Level</label>
            <input
              type="number"
              min={0}
              value={formData.reorderLevel}
              onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="form-group full-width">
            <label>Supplier</label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="Supplier name"
            />
          </div>
        </div>

        <div className="variant-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(e) => setHasVariants(e.target.checked)}
            />
            <span>Has Variants (Size, Color, etc.)</span>
          </label>

          {hasVariants && (
            <div className="variants-list">
              {variants.map((variant, index) => (
                <div key={index} className="variant-row">
                  <input
                    type="text"
                    placeholder="Variant name (e.g., Small, Red)"
                    value={variant.name}
                    onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="CP"
                    value={variant.cp || ''}
                    onChange={(e) => handleVariantChange(index, 'cp', parseFloat(e.target.value) || 0)}
                  />
                  <input
                    type="number"
                    placeholder="SP"
                    value={variant.sp || ''}
                    onChange={(e) => handleVariantChange(index, 'sp', parseFloat(e.target.value) || 0)}
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={variant.stock || ''}
                    onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                  />
                  <button className="btn-icon" onClick={() => handleRemoveVariant(index)}>
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button className="btn-add-variant" onClick={handleAddVariant}>
                <Plus size={16} /> Add Variant
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button className="btn-secondary" onClick={resetForm}>Reset</button>
          <button
            className="btn-primary"
            onClick={() => setShowModal(true)}
            disabled={!formData.name || !formData.category || (!hasVariants && formData.initialStock <= 0)}
          >
            <Check size={16} /> Save Item
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Save</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to add this inventory item?</p>
              <div className="confirmation-details">
                <div><strong>Name:</strong> {formData.name}</div>
                <div><strong>Category:</strong> {formData.category}</div>
                <div><strong>Stock:</strong> {calculateTotals().totalStock} {formData.unit}</div>
                {hasVariants && <div><strong>Variants:</strong> {variants.length}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving...' : 'Confirm Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
