"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import {
  Plus, BarChart3, ArrowRight, Info, Search, Download, Edit2, Trash2, Check,
  Building2, Armchair, Monitor, Bus, BookOpen, FlaskConical,
  TrendingDown, TrendingUp, Package, Clock, ChevronRight,
  DollarSign, AlertCircle, Settings
} from "lucide-react";
import './FixedAssets.css';

/* ─────────────── Types ─────────────── */
interface AssetCategory {
  title: string;
  desc: string;
  icon: React.ReactNode;
  route: string;
  count: number;
  value: string;
  color: string;
}

interface ActivityItem {
  id: number;
  text: string;
  category: string;
  time: string;
  type: 'add' | 'depreciation' | 'update' | 'dispose';
}

interface Asset {
  _id?: string;
  schoolId: string;
  name: string;
  category: string;
  quantity: number;
  type: 'fixed' | 'appreciating' | 'depreciating';
  rate?: number;
  method: 'SLM' | 'WDV' | 'DDB';
  purchaseDate: string;
  purchaseValue: number;
  currentValue: number;
  status: 'active' | 'sold' | 'destroyed';
  description?: string;
  createdAt?: string;
  salePrice?: number;
  saleDate?: string;
  buyer?: string;
  destructionDate?: string;
  destructionReason?: string;
}

interface AssetFormData {
  name: string;
  category: string;
  quantity?: number;
  type: 'fixed' | 'appreciating' | 'depreciating';
  rate?: number;
  method: 'SLM' | 'WDV' | 'DDB';
  purchaseDate: string;
  purchaseValue?: number;
  currentValue: number;
  description: string;
}

type TabType = 'add' | 'list' | 'manage';

/* ─────────────── Data ─────────────── */
const KPI_CARDS = [
  {
    label: 'Total Assets',
    value: '248',
    unit: 'items',
    icon: <Package size={20} />,
    trend: '+12 this year',
    trendUp: true,
    color: '#4f46e5',
    bg: '#ede9fe',
  },
  {
    label: 'Net Book Value',
    value: 'NPR 1.24 Cr',
    unit: '',
    icon: <TrendingUp size={20} />,
    trend: 'After depreciation',
    trendUp: true,
    color: '#16a34a',
    bg: '#dcfce7',
  },
  {
    label: 'Depreciation (FY)',
    value: 'NPR 18.6L',
    unit: '',
    icon: <TrendingDown size={20} />,
    trend: 'FY 2081-82',
    trendUp: false,
    color: '#dc2626',
    bg: '#fee2e2',
  },
  {
    label: 'Assets Added',
    value: '14',
    unit: 'this year',
    icon: <Plus size={20} />,
    trend: '+3 last month',
    trendUp: true,
    color: '#d97706',
    bg: '#fef3c7',
  },
];

const ASSET_CATEGORIES: AssetCategory[] = [
  {
    title: 'Land & Buildings',
    desc: 'Track school property, campuses, and permanent structures.',
    icon: <Building2 size={28} />,
    route: './land',
    count: 4,
    value: 'NPR 82L',
    color: '#4f46e5',
  },
  {
    title: 'Furniture & Fixtures',
    desc: 'Manage classroom desks, office furniture, and laboratory equipment.',
    icon: <Armchair size={28} />,
    route: './furniture',
    count: 86,
    value: 'NPR 14.2L',
    color: '#0891b2',
  },
  {
    title: 'Computers & IT',
    desc: 'Track laptops, servers, networking gear, and software licenses.',
    icon: <Monitor size={28} />,
    route: './it',
    count: 52,
    value: 'NPR 28.5L',
    color: '#7c3aed',
  },
  {
    title: 'Vehicles',
    desc: 'Manage school buses, vans, and other official transport vehicles.',
    icon: <Bus size={28} />,
    route: './vehicles',
    count: 8,
    value: 'NPR 64L',
    color: '#ea580c',
  },
  {
    title: 'Library Books',
    desc: 'Track collection of books, periodicals, and digital resources.',
    icon: <BookOpen size={28} />,
    route: './library',
    count: 72,
    value: 'NPR 4.8L',
    color: '#16a34a',
  },
  {
    title: 'Lab Equipment',
    desc: 'Manage science lab tools, chemicals, and specialized apparatus.',
    icon: <FlaskConical size={28} />,
    route: './lab',
    count: 26,
    value: 'NPR 11.2L',
    color: '#dc2626',
  },
];

const RECENT_ACTIVITY: ActivityItem[] = [
  { id: 1, text: 'New Computer (Dell Inspiron) added to IT assets',     category: 'Computers & IT',      time: '2 hrs ago',   type: 'add'          },
  { id: 2, text: 'Annual depreciation calculated for Vehicles',          category: 'Vehicles',             time: '1 day ago',   type: 'depreciation' },
  { id: 3, text: 'Furniture inventory updated — 4 new chairs added',    category: 'Furniture & Fixtures', time: '2 days ago',  type: 'add'          },
  { id: 4, text: 'Lab microscope (Olympus CX23) maintenance logged',    category: 'Lab Equipment',        time: '3 days ago',  type: 'update'       },
  { id: 5, text: 'Library books audit completed — 72 items verified',   category: 'Library Books',        time: '5 days ago',  type: 'update'       },
  { id: 6, text: 'Old projector disposed — written off from IT assets', category: 'Computers & IT',      time: '1 week ago',  type: 'dispose'      },
];

const ACTIVITY_TYPE_CONFIG: Record<ActivityItem['type'], { label: string; cls: string }> = {
  add:          { label: 'Added',        cls: 'act-badge-green' },
  depreciation: { label: 'Depreciation', cls: 'act-badge-red'   },
  update:       { label: 'Updated',      cls: 'act-badge-blue'  },
  dispose:      { label: 'Disposed',     cls: 'act-badge-gray'  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056';

/* ─────────────── Component ─────────────── */
const FixedAssets = () => {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('add');
  
  // Assets data
  const [assets, setAssets] = useState<Asset[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<Partial<AssetFormData>>({
    name: '',
    category: '',
    quantity: undefined,
    type: 'fixed',
    rate: undefined,
    method: 'SLM',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseValue: undefined,
    currentValue: 0,
    description: ''
  });
  
  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showDestroyModal, setShowDestroyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  // Sell form
  const [sellForm, setSellForm] = useState({ salePrice: 0, saleDate: new Date().toISOString().split('T')[0], buyer: '' });
  
  // Destroy form
  const [destroyForm, setDestroyForm] = useState({ destructionDate: new Date().toISOString().split('T')[0], reason: '' });
  
  // Filters for asset list
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch assets
  useEffect(() => {
    fetchAssets();
  }, []);
  
  const fetchAssets = async () => {
    try {
      const schoolId = localStorage.getItem('schoolId') || '';
      const response = await fetch(`${API_BASE}/api/accounting/assets?schoolId=${schoolId}`);
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    }
  };
  
  // Calculate current value based on purchase date, value, method, rate, and type
  const calculateCurrentValue = (
    purchaseValue: number,
    purchaseDate: string,
    method: 'SLM' | 'WDV' | 'DDB',
    rate: number,
    type: 'fixed' | 'appreciating' | 'depreciating'
  ): number => {
    if (!purchaseValue || !purchaseDate || type === 'fixed') return purchaseValue || 0;
    
    const purchase = new Date(purchaseDate);
    const now = new Date();
    const years = (now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (years <= 0) return purchaseValue;
    
    const rateDecimal = rate / 100;
    let currentValue = purchaseValue;
    
    if (method === 'SLM') {
      // Straight Line Method: Linear depreciation/appreciation
      const change = purchaseValue * rateDecimal * years;
      currentValue = type === 'depreciating' ? purchaseValue - change : purchaseValue + change;
    } else if (method === 'WDV') {
      // Written Down Value: Compounding depreciation/appreciation
      const factor = type === 'depreciating' ? (1 - rateDecimal) : (1 + rateDecimal);
      currentValue = purchaseValue * Math.pow(factor, years);
    } else if (method === 'DDB') {
      // Double Declining Balance
      const factor = type === 'depreciating' ? (1 - 2 * rateDecimal) : (1 + 2 * rateDecimal);
      currentValue = purchaseValue * Math.pow(factor, years);
    }
    
    return Math.max(0, Math.round(currentValue * 100) / 100);
  };
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const numValue = name === 'quantity' || name === 'rate' || name === 'purchaseValue' || name === 'currentValue';
      const updated = {
        ...prev,
        [name]: numValue ? (value === '' ? undefined : parseFloat(value)) : value
      };
      
      // Auto-calculate current value when relevant fields change
      if (['purchaseDate', 'purchaseValue', 'method', 'rate', 'type'].includes(name)) {
        const pValue = updated.purchaseValue ?? 0;
        const pDate = updated.purchaseDate ?? '';
        const pMethod = updated.method ?? 'SLM';
        const pRate = updated.rate ?? 0;
        const pType = updated.type ?? 'fixed';
        
        updated.currentValue = calculateCurrentValue(pValue, pDate, pMethod, pRate, pType);
      }
      
      return updated;
    });
  };
  
  // Submit asset
  const handleSubmit = async () => {
    try {
      const schoolId = localStorage.getItem('schoolId') || '';
      const response = await fetch(`${API_BASE}/api/accounting/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-school-id': schoolId },
        body: JSON.stringify({ ...formData, schoolId, status: 'active' })
      });
      
      if (response.ok) {
        setShowConfirmModal(false);
        setFormData({
          name: '', category: '', quantity: undefined, type: 'fixed', rate: undefined, method: 'SLM',
          purchaseDate: new Date().toISOString().split('T')[0], purchaseValue: undefined, currentValue: 0, description: ''
        });
        fetchAssets();
        setActiveTab('list');
      }
    } catch (error) {
      console.error('Failed to create asset:', error);
    }
  };
  
  // Sell asset
  const handleSell = async () => {
    if (!selectedAsset?._id) return;
    try {
      const response = await fetch(`${API_BASE}/api/accounting/assets/${selectedAsset._id}/sell`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sellForm)
      });
      
      if (response.ok) {
        setShowSellModal(false);
        setSelectedAsset(null);
        fetchAssets();
      }
    } catch (error) {
      console.error('Failed to sell asset:', error);
    }
  };
  
  // Destroy asset
  const handleDestroy = async () => {
    if (!selectedAsset?._id) return;
    try {
      const response = await fetch(`${API_BASE}/api/accounting/assets/${selectedAsset._id}/destroy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(destroyForm)
      });
      
      if (response.ok) {
        setShowDestroyModal(false);
        setSelectedAsset(null);
        fetchAssets();
      }
    } catch (error) {
      console.error('Failed to destroy asset:', error);
    }
  };
  
  // Update asset
  const handleUpdate = async () => {
    if (!selectedAsset?._id) return;
    try {
      const response = await fetch(`${API_BASE}/api/accounting/assets/${selectedAsset._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedAsset)
      });
      
      if (response.ok) {
        setShowEditModal(false);
        setSelectedAsset(null);
        fetchAssets();
      }
    } catch (error) {
      console.error('Failed to update asset:', error);
    }
  };
  
  // Export CSV
  const exportCSV = () => {
    const headers = ['Name', 'Category', 'Type', 'Quantity', 'Method', 'Purchase Date', 'Purchase Value', 'Current Value', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredAssets.map(a => [
        a.name, a.category, a.type, a.quantity, a.method, a.purchaseDate,
        a.purchaseValue, a.currentValue, a.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assets_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };
  
  // Filtered assets
  const filteredAssets = assets.filter(asset => {
    const matchesCategory = !categoryFilter || asset.category === categoryFilter;
    const matchesType = !typeFilter || asset.type === typeFilter;
    const matchesMethod = !methodFilter || asset.method === methodFilter;
    const matchesSearch = !searchQuery || asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesType && matchesMethod && matchesSearch;
  });
  
  // Unique categories for filter
  const categories = [...new Set(assets.map(a => a.category))];

  return (
    <Layout>
      <div className="fa-page">

        {/* ── Tab Navigation ── */}
        <div className="fa-tabs-container">
          <div className="fa-tabs">
            <button
              className={`fa-tab ${activeTab === 'add' ? 'active' : ''}`}
              onClick={() => setActiveTab('add')}
            >
              <Plus size={16} />
              Add Asset
            </button>
            <button
              className={`fa-tab ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              <Package size={16} />
              Asset List
            </button>
            <button
              className={`fa-tab ${activeTab === 'manage' ? 'active' : ''}`}
              onClick={() => setActiveTab('manage')}
            >
              <Settings size={16} />
              Manage Assets
            </button>
          </div>
        </div>

        {/* ── ADD ASSET TAB ── */}
        {activeTab === 'add' && (
          <div className="fa-form-section">
            <div className="fa-section-header">
              <h2 className="fa-section-title">Add New Asset</h2>
            </div>
            <div className="fa-form-card">
              <div className="fa-form-grid">
                <div className="fa-form-group">
                  <label className="fa-form-label">Asset Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter asset name"
                    className="fa-form-input"
                  />
                </div>
                <div className="fa-form-group">
                  <label className="fa-form-label">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="fa-form-select"
                  >
                    <option value="">Select Category</option>
                    <option value="Land & Buildings">Land & Buildings</option>
                    <option value="Furniture & Fixtures">Furniture & Fixtures</option>
                    <option value="Computers & IT">Computers & IT</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Library Books">Library Books</option>
                    <option value="Lab Equipment">Lab Equipment</option>
                  </select>
                </div>
                <div className="fa-form-group">
                  <label className="fa-form-label">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Enter quantity"
                    className="fa-form-input"
                  />
                </div>
                <div className="fa-form-group">
                  <label className="fa-form-label">Asset Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="fa-form-select"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="appreciating">Appreciating</option>
                    <option value="depreciating">Depreciating</option>
                  </select>
                </div>
                <div className="fa-form-group">
                  <label className="fa-form-label">Rate (%)</label>
                  <input
                    type="number"
                    name="rate"
                    value={formData.rate}
                    onChange={handleInputChange}
                    placeholder="Enter rate"
                    className="fa-form-input"
                  />
                </div>
                <div className="fa-form-group">
                  <label className="fa-form-label">Method</label>
                  <select
                    name="method"
                    value={formData.method}
                    onChange={handleInputChange}
                    className="fa-form-select"
                  >
                    <option value="SLM">SLM - Straight Line</option>
                    <option value="WDV">WDV - Written Down Value</option>
                    <option value="DDB">DDB - Double Declining</option>
                  </select>
                </div>
                <div className="fa-form-group">
                  <label className="fa-form-label">Purchase Date</label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    className="fa-form-input"
                  />
                </div>
                <div className="fa-form-group">
                  <label className="fa-form-label">Purchase Value (NPR)</label>
                  <input
                    type="number"
                    name="purchaseValue"
                    value={formData.purchaseValue}
                    onChange={handleInputChange}
                    placeholder="Enter purchase value"
                    className="fa-form-input"
                  />
                </div>
                <div className="fa-form-group">
                  <label className="fa-form-label">Current Value (NPR) <span className="fa-auto-badge">Auto</span></label>
                  <input
                    type="number"
                    name="currentValue"
                    value={formData.currentValue}
                    readOnly
                    className="fa-form-input fa-input-readonly"
                    title="Calculated automatically based on purchase date, value, method, and rate"
                  />
                </div>
                <div className="fa-form-group full-width">
                  <label className="fa-form-label">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter asset description"
                    rows={3}
                    className="fa-form-textarea"
                  />
                </div>
              </div>
              <div className="fa-form-actions">
                <button
                  className="fa-btn fa-btn-outline"
                  onClick={() => setActiveTab('list')}
                >
                  Cancel
                </button>
                <button
                  className="fa-btn fa-btn-primary"
                  onClick={() => setShowConfirmModal(true)}
                >
                  <Plus size={16} />
                  Add Asset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ASSET LIST TAB ── */}
        {activeTab === 'list' && (
          <div className="fa-list-section">
            <div className="fa-section-header">
              <h2 className="fa-section-title">Asset List</h2>
              <button className="fa-btn fa-btn-outline" onClick={exportCSV}>
                <Download size={16} />
                Export CSV
              </button>
            </div>
            
            {/* Filters */}
            <div className="fa-filters">
              <div className="fa-search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="fa-search-input"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="fa-filter-select"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="fa-filter-select"
              >
                <option value="">All Types</option>
                <option value="fixed">Fixed</option>
                <option value="appreciating">Appreciating</option>
                <option value="depreciating">Depreciating</option>
              </select>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="fa-filter-select"
              >
                <option value="">All Methods</option>
                <option value="SLM">SLM</option>
                <option value="WDV">WDV</option>
                <option value="DDB">DDB</option>
              </select>
            </div>

            {/* Assets Table */}
            <div className="fa-table-card">
              <table className="fa-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Method</th>
                    <th>Purchase Date</th>
                    <th>Purchase Value</th>
                    <th>Current Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="fa-empty-state">
                        No assets found. Add your first asset to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((asset) => (
                      <tr key={asset._id}>
                        <td>{asset.name}</td>
                        <td>{asset.category}</td>
                        <td>
                          <span className={`fa-badge fa-badge-${asset.type}`}>
                            {asset.type}
                          </span>
                        </td>
                        <td>{asset.quantity}</td>
                        <td>{asset.method}</td>
                        <td>{new Date(asset.purchaseDate).toLocaleDateString()}</td>
                        <td>NPR {asset.purchaseValue.toLocaleString()}</td>
                        <td>NPR {asset.currentValue.toLocaleString()}</td>
                        <td>
                          <span className={`fa-status fa-status-${asset.status}`}>
                            {asset.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── MANAGE ASSETS TAB ── */}
        {activeTab === 'manage' && (
          <div className="fa-manage-section">
            <div className="fa-section-header">
              <h2 className="fa-section-title">Manage Assets</h2>
            </div>
            
            {/* Manage Table */}
            <div className="fa-table-card">
              <table className="fa-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Current Value</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="fa-empty-state">
                        No assets available for management.
                      </td>
                    </tr>
                  ) : (
                    assets.map((asset) => (
                      <tr key={asset._id}>
                        <td>{asset.name}</td>
                        <td>{asset.category}</td>
                        <td>NPR {asset.currentValue.toLocaleString()}</td>
                        <td>
                          <span className={`fa-status fa-status-${asset.status}`}>
                            {asset.status}
                          </span>
                        </td>
                        <td>
                          <div className="fa-action-buttons">
                            {asset.status === 'active' && (
                              <>
                                <button
                                  className="fa-action-btn fa-action-edit"
                                  onClick={() => { setSelectedAsset(asset); setShowEditModal(true); }}
                                  title="Edit"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  className="fa-action-btn fa-action-sell"
                                  onClick={() => { setSelectedAsset(asset); setShowSellModal(true); }}
                                  title="Sell"
                                >
                                  <DollarSign size={14} />
                                </button>
                                <button
                                  className="fa-action-btn fa-action-destroy"
                                  onClick={() => { setSelectedAsset(asset); setShowDestroyModal(true); }}
                                  title="Mark as Destroyed"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                            {asset.status !== 'active' && (
                              <span className="fa-no-actions">No actions available</span>
                            )}
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

        {/* ── Confirm Add Modal ── */}
        {showConfirmModal && (
          <div className="fa-modal-overlay">
            <div className="fa-modal">
              <h3 className="fa-modal-title">Confirm Add Asset</h3>
              <p className="fa-modal-text">
                Are you sure you want to add <strong>{formData.name}</strong> to the asset registry?
              </p>
              <div className="fa-modal-actions">
                <button className="fa-btn fa-btn-outline" onClick={() => setShowConfirmModal(false)}>
                  Cancel
                </button>
                <button className="fa-btn fa-btn-primary" onClick={handleSubmit}>
                  <Check size={16} />
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Edit Modal ── */}
        {showEditModal && selectedAsset && (
          <div className="fa-modal-overlay">
            <div className="fa-modal fa-modal-large">
              <h3 className="fa-modal-title">Edit Asset</h3>
              <div className="fa-form-grid">
                <div className="fa-form-group">
                  <label className="fa-form-label">Asset Name</label>
                  <input
                    type="text"
                    value={selectedAsset.name}
                    onChange={(e) => setSelectedAsset({...selectedAsset, name: e.target.value})}
                    className="fa-form-input"
                  />
                </div>
                <div className="fa-form-group">
                  <label className="fa-form-label">Category</label>
                  <select
                    value={selectedAsset.category}
                    onChange={(e) => setSelectedAsset({...selectedAsset, category: e.target.value})}
                    className="fa-form-select"
                  >
                    <option value="Land & Buildings">Land & Buildings</option>
                    <option value="Furniture & Fixtures">Furniture & Fixtures</option>
                    <option value="Computers & IT">Computers & IT</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Library Books">Library Books</option>
                    <option value="Lab Equipment">Lab Equipment</option>
                  </select>
                </div>
                <div className="fa-form-group">
                  <label className="fa-form-label">Quantity</label>
                  <input
                    type="number"
                    value={selectedAsset.quantity}
                    onChange={(e) => setSelectedAsset({...selectedAsset, quantity: parseInt(e.target.value) || 0})}
                    className="fa-form-input"
                  />
                </div>
                <div className="fa-form-group">
                  <label className="fa-form-label">Current Value (NPR)</label>
                  <input
                    type="number"
                    value={selectedAsset.currentValue}
                    onChange={(e) => setSelectedAsset({...selectedAsset, currentValue: parseFloat(e.target.value) || 0})}
                    className="fa-form-input"
                  />
                </div>
              </div>
              <div className="fa-modal-actions">
                <button className="fa-btn fa-btn-outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button className="fa-btn fa-btn-primary" onClick={handleUpdate}>
                  <Check size={16} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Sell Modal ── */}
        {showSellModal && selectedAsset && (
          <div className="fa-modal-overlay">
            <div className="fa-modal">
              <h3 className="fa-modal-title">Sell Asset</h3>
              <p className="fa-modal-text">
                You are about to sell <strong>{selectedAsset.name}</strong>
              </p>
              <div className="fa-form-grid">
                <div className="fa-form-group">
                  <label className="fa-form-label">Sale Price (NPR)</label>
                  <input
                    type="number"
                    value={sellForm.salePrice}
                    onChange={(e) => setSellForm({...sellForm, salePrice: parseFloat(e.target.value) || 0})}
                    placeholder="Enter sale price"
                    className="fa-form-input"
                  />
                </div>
                <div className="fa-form-group">
                  <label className="fa-form-label">Sale Date</label>
                  <input
                    type="date"
                    value={sellForm.saleDate}
                    onChange={(e) => setSellForm({...sellForm, saleDate: e.target.value})}
                    className="fa-form-input"
                  />
                </div>
                <div className="fa-form-group full-width">
                  <label className="fa-form-label">Buyer</label>
                  <input
                    type="text"
                    value={sellForm.buyer}
                    onChange={(e) => setSellForm({...sellForm, buyer: e.target.value})}
                    placeholder="Enter buyer name"
                    className="fa-form-input"
                  />
                </div>
              </div>
              <div className="fa-modal-actions">
                <button className="fa-btn fa-btn-outline" onClick={() => setShowSellModal(false)}>
                  Cancel
                </button>
                <button className="fa-btn fa-btn-primary" onClick={handleSell}>
                  <Check size={16} />
                  Confirm Sale
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Destroy Modal ── */}
        {showDestroyModal && selectedAsset && (
          <div className="fa-modal-overlay">
            <div className="fa-modal">
              <h3 className="fa-modal-title">Mark as Destroyed</h3>
              <p className="fa-modal-text">
                You are about to mark <strong>{selectedAsset.name}</strong> as destroyed.
                This action cannot be undone.
              </p>
              <div className="fa-form-grid">
                <div className="fa-form-group">
                  <label className="fa-form-label">Destruction Date</label>
                  <input
                    type="date"
                    value={destroyForm.destructionDate}
                    onChange={(e) => setDestroyForm({...destroyForm, destructionDate: e.target.value})}
                    className="fa-form-input"
                  />
                </div>
                <div className="fa-form-group full-width">
                  <label className="fa-form-label">Reason</label>
                  <textarea
                    value={destroyForm.reason}
                    onChange={(e) => setDestroyForm({...destroyForm, reason: e.target.value})}
                    placeholder="Enter reason for destruction"
                    rows={3}
                    className="fa-form-textarea"
                  />
                </div>
              </div>
              <div className="fa-modal-actions">
                <button className="fa-btn fa-btn-outline" onClick={() => setShowDestroyModal(false)}>
                  Cancel
                </button>
                <button className="fa-btn fa-btn-danger" onClick={handleDestroy}>
                  <AlertCircle size={16} />
                  Confirm Destruction
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default FixedAssets;