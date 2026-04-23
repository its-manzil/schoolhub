'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './inventory-rate-setup.css';
import BillingNavbar from '../components/BillingNavbar';
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
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  academicYear: string;
  name: string;
  hasVariants: boolean;
  price: string;
  variants: Variant[];
}

const ACADEMIC_YEARS = [
  '2080-2081',
  '2081-2082',
  '2082-2083',
  '2083-2084',
  '2084-2085'
];

export default function InventoryRateSetupPage() {
  const router = useRouter();

  // Auth & User State
  const [schoolId, setSchoolId] = useState<number>(0);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState<FormData>({
    academicYear: '',
    name: '',
    hasVariants: false,
    price: '',
    variants: [{ label: '', price: 0 }]
  });

  // Edit Mode State
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingUpdateData, setPendingUpdateData] = useState<FormData | null>(null);

  // Inventories List State
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [filterYear, setFilterYear] = useState('');

  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'configure' | 'view'>('configure');

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

        setSchoolId(user.schoolId || 1);
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

  // Fetch Inventories
  const fetchInventories = React.useCallback(async () => {
    if (!schoolId) return;

    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      queryParams.append('schoolId', schoolId.toString());
      if (filterYear) {
        queryParams.append('academicYear', filterYear);
      }

      const response = await fetch(
        `/api/billing/inventory-rate-setup?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-school-id': schoolId.toString()
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setInventories(data.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching inventories:', err);
    }
  }, [schoolId, filterYear]);

  useEffect(() => {
    if (schoolId) {
      fetchInventories();
    }
  }, [schoolId, filterYear, fetchInventories]);

  // Form Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleVariants = (hasVariants: boolean) => {
    setFormData(prev => ({
      ...prev,
      hasVariants,
      price: hasVariants ? '' : prev.price,
      variants: hasVariants ? [{ label: '', price: 0 }] : []
    }));
  };

  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { label: '', price: 0 }]
    }));
  };

  const handleRemoveVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleVariantChange = (index: number, field: keyof Variant, value: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index
          ? { ...v, [field]: field === 'price' ? parseFloat(value) || 0 : value }
          : v
      )
    }));
  };

  const resetForm = () => {
    setFormData({
      academicYear: '',
      name: '',
      hasVariants: false,
      price: '',
      variants: [{ label: '', price: 0 }]
    });
    setEditMode(false);
    setEditId(null);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Save Handler
  const handleSave = async () => {
    // Validation
    if (!formData.academicYear || !formData.name) {
      showMessage('error', 'Academic year and inventory name are required');
      return;
    }

    if (!formData.hasVariants && !formData.price) {
      showMessage('error', 'Price is required for non-variant inventories');
      return;
    }

    if (formData.hasVariants) {
      const validVariants = formData.variants.filter(v => v.label && v.price > 0);
      if (validVariants.length === 0) {
        showMessage('error', 'At least one valid variant is required');
        return;
      }
    }

    // If in edit mode, show password modal
    if (editMode && editId) {
      setPendingUpdateData(formData);
      setShowPasswordModal(true);
      return;
    }

    // Create new inventory
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const requestBody = {
        schoolId,
        academicYear: formData.academicYear,
        name: formData.name,
        hasVariants: formData.hasVariants,
        price: formData.hasVariants ? undefined : parseFloat(formData.price),
        variants: formData.hasVariants
          ? formData.variants.filter(v => v.label && v.price > 0)
          : undefined
      };

      const response = await fetch('/api/billing/inventory-rate-setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-school-id': schoolId.toString(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create inventory');
      }

      showMessage('success', `Inventory "${formData.name}" created successfully`);
      resetForm();
      fetchInventories();
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to create inventory');
    } finally {
      setIsSaving(false);
    }
  };

  // Edit Handler
  const handleEdit = (inventory: Inventory) => {
    setFormData({
      academicYear: inventory.academicYear,
      name: inventory.name,
      hasVariants: inventory.hasVariants,
      price: inventory.price?.toString() || '',
      variants: inventory.hasVariants && inventory.variants?.length
        ? inventory.variants
        : [{ label: '', price: 0 }]
    });
    setEditMode(true);
    setEditId(inventory._id);
    setActiveTab('configure');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Password Confirm Handler
  const handlePasswordConfirm = async () => {
    if (!password || !editId || !pendingUpdateData) {
      showMessage('error', 'Password is required');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const requestBody = {
        id: editId,
        schoolId,
        password,
        academicYear: pendingUpdateData.academicYear,
        name: pendingUpdateData.name,
        hasVariants: pendingUpdateData.hasVariants,
        price: pendingUpdateData.hasVariants ? undefined : parseFloat(pendingUpdateData.price),
        variants: pendingUpdateData.hasVariants
          ? pendingUpdateData.variants.filter(v => v.label && v.price > 0)
          : undefined
      };

      const response = await fetch('/api/billing/inventory-rate-setup', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-school-id': schoolId.toString(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update inventory');
      }

      showMessage('success', `Inventory "${pendingUpdateData.name}" updated successfully`);
      setShowPasswordModal(false);
      setPassword('');
      setPendingUpdateData(null);
      resetForm();
      fetchInventories();
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to update inventory');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
    setPassword('');
    setPendingUpdateData(null);
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inventory?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/billing/inventory-rate-setup?id=${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-school-id': schoolId.toString()
          }
        }
      );

      if (response.ok) {
        showMessage('success', 'Inventory deleted successfully');
        fetchInventories();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete inventory');
      }
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to delete inventory');
    }
  };

  // Format price display
  const formatPrice = (price: number) => {
    return `Rs ${price.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="irs-loading">
        <div className="irs-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
    <BillingNavbar />
    <div className="inventory-rate-setup-page">
      {/* Header */}
      <div className="irs-header">
        <h1>Inventory Rate Setup</h1>
        <p>Configure and manage inventory pricing for your school</p>
      </div>

      {/* Tab Navigation */}
      <div className="irs-tabs">
        <button
          className={`irs-tab ${activeTab === 'configure' ? 'active' : ''}`}
          onClick={() => setActiveTab('configure')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Configure Inventories
        </button>
        <button
          className={`irs-tab ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          View & Edit Inventories
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`irs-message ${message.type}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {message.type === 'success' ? (
              <>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </>
            ) : (
              <>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </>
            )}
          </svg>
          {message.text}
        </div>
      )}

      {/* Section 1: Configure Inventories */}
      {activeTab === 'configure' && (
        <div className="irs-section">
        <div className="irs-section-header">
          <h2 className="irs-section-title">
            {editMode ? 'Edit Inventory' : 'Configure Inventories'}
          </h2>
        </div>

        <div className="irs-form">
          <div className="irs-form-row">
            <div className="irs-form-group">
              <label htmlFor="academicYear">Academic Year *</label>
              <select
                id="academicYear"
                name="academicYear"
                className="irs-select"
                value={formData.academicYear}
                onChange={handleInputChange}
              >
                <option value="">Select Academic Year</option>
                {ACADEMIC_YEARS.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="irs-form-group">
              <label htmlFor="name">Inventory Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="irs-input"
                placeholder="Enter inventory name (e.g., Uniform, Books)"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="irs-form-row">
            <div className="irs-form-group">
              <label>Has Variants? (e.g., Sizes)</label>
              <div className="irs-toggle-container">
                <div className="irs-toggle">
                  <button
                    type="button"
                    className={`irs-toggle-btn ${!formData.hasVariants ? 'active' : ''}`}
                    onClick={() => handleToggleVariants(false)}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    className={`irs-toggle-btn ${formData.hasVariants ? 'active' : ''}`}
                    onClick={() => handleToggleVariants(true)}
                  >
                    Yes
                  </button>
                </div>
                <span className="irs-toggle-label">
                  {formData.hasVariants ? 'Multiple sizes/variants' : 'Single price'}
                </span>
              </div>
            </div>
          </div>

          {/* Price Input (No Variants) */}
          {!formData.hasVariants && (
            <div className="irs-form-row">
              <div className="irs-form-group">
                <label htmlFor="price">Price (Rs) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  className="irs-input"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          )}

          {/* Variants Table (Has Variants) */}
          {formData.hasVariants && (
            <div className="irs-variants-section">
              <div className="irs-variants-header">
                <h4>Variant Details</h4>
              </div>
              <table className="irs-variants-table">
                <thead>
                  <tr>
                    <th>Variant/Size</th>
                    <th>Price (Rs)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.variants.map((variant, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          className="irs-variant-input"
                          placeholder="e.g., Small, Medium, Large"
                          value={variant.label}
                          onChange={(e) => handleVariantChange(index, 'label', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="irs-variant-input"
                          placeholder="0.00"
                          value={variant.price || ''}
                          onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="irs-btn-remove"
                          onClick={() => handleRemoveVariant(index)}
                          disabled={formData.variants.length === 1}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                className="irs-btn-add"
                onClick={handleAddVariant}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Variant
              </button>
            </div>
          )}

          <div className="irs-form-actions">
            {editMode && (
              <button
                type="button"
                className="irs-btn-secondary"
                onClick={resetForm}
                disabled={isSaving}
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              className="irs-btn-primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="irs-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  {editMode ? 'Update Inventory' : 'Save Inventory'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Section 2: View & Edit Inventories */}
      {activeTab === 'view' && (
        <div className="irs-section">
        <div className="irs-section-header">
          <h2 className="irs-section-title">View & Edit Inventories</h2>
        </div>

        {/* Filter */}
        <div className="irs-filters">
          <div className="irs-filter-group">
            <label htmlFor="filterYear">Filter by Academic Year</label>
            <select
              id="filterYear"
              className="irs-select"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="">All Years</option>
              {ACADEMIC_YEARS.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="irs-table-container">
          <table className="irs-table">
            <thead>
              <tr>
                <th>Inventory Name</th>
                <th>Academic Year</th>
                <th>Type</th>
                <th>Price / Variants</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="irs-table-empty">
                    <p>No inventories found. Create one above.</p>
                  </td>
                </tr>
              ) : (
                inventories.map((inventory) => (
                  <tr key={inventory._id}>
                    <td className="irs-inventory-name">{inventory.name}</td>
                    <td>{inventory.academicYear}</td>
                    <td>
                      <span className={`irs-type-badge ${inventory.hasVariants ? 'irs-type-variant' : 'irs-type-simple'}`}>
                        {inventory.hasVariants ? 'Variant' : 'Simple'}
                      </span>
                    </td>
                    <td>
                      {inventory.hasVariants ? (
                        <div className="irs-variants-summary">
                          <ul>
                            {inventory.variants?.map((v, i) => (
                              <li key={i}>{v.label}: {formatPrice(v.price)}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <span className="irs-price">{formatPrice(inventory.price || 0)}</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="irs-btn-edit"
                          onClick={() => handleEdit(inventory)}
                        >
                          Edit
                        </button>
                        <button
                          className="irs-btn-remove"
                          onClick={() => handleDelete(inventory._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="irs-modal-overlay">
          <div className="irs-modal">
            <div className="irs-modal-header">
              <div className="irs-modal-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3>Confirm Changes</h3>
            </div>
            <p>Please enter your password to confirm the changes to this inventory.</p>
            <div className="irs-modal-form">
              <div className="irs-form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  className="irs-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="irs-modal-actions">
              <button
                type="button"
                className="irs-btn-secondary"
                onClick={handlePasswordCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="irs-btn-primary"
                onClick={handlePasswordConfirm}
                disabled={isSaving || !password}
              >
                {isSaving ? (
                  <>
                    <div className="irs-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                    Confirming...
                  </>
                ) : (
                  'Confirm Update'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
