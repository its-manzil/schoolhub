"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../components/Layout";
import { 
  ChevronLeft, Plus, Search, Filter, 
  Eye, Edit2, Trash2, Download, Printer,
  Calendar, MapPin, X, Building2, Armchair, Monitor, Bus, BookOpen, FlaskConical
} from "lucide-react";
import "./category.css";
import "./FixedAssets.css";

interface Asset {
  id: number;
  code: string;
  name: string;
  brand: string;
  location: string;
  cost: number;
  date: string;
  status: string;
}

interface CategoryPageProps {
  categoryName: string;
  categoryTitle: string;
  assets: Asset[];
}

const NAV_ITEMS = [
  { id: 'land',      label: 'Land & Buildings',  icon: <Building2 size={18}/>, route: '../assets/land' },
  { id: 'furniture', label: 'Furniture & Fixtures', icon: <Armchair size={18}/>,  route: '../assets/furniture' },
  { id: 'it',        label: 'Computers & IT',    icon: <Monitor size={18}/>,   route: '../assets/it' },
  { id: 'vehicles',  label: 'School Vehicles',   icon: <Bus size={18}/>,       route: '../assets/vehicles' },
  { id: 'library',   label: 'Library Resources', icon: <BookOpen size={18}/>,  route: '../assets/library' },
  { id: 'lab',       label: 'Lab Equipment',     icon: <FlaskConical size={18}/>, route: '../assets/lab' },
];

const CategoryAssetsPage = ({ categoryName, categoryTitle, assets }: CategoryPageProps) => {
  const router = useRouter();
  const [localAssets, setLocalAssets] = useState<Asset[]>(assets);
  const [showDisposalModal, setShowDisposalModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [editedAsset, setEditedAsset] = useState<Asset | null>(null);

  const handleDispose = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowDisposalModal(true);
  };

  const handlePreview = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowPreviewModal(true);
  };

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setEditedAsset({ ...asset });
    setShowEditModal(true);
  };

  const handleEditChange = (field: keyof Asset, value: string | number) => {
    if (editedAsset) {
      setEditedAsset({ ...editedAsset, [field]: value });
    }
  };

  const handleSaveEdit = () => {
    if (editedAsset) {
      setLocalAssets(localAssets.map(asset => asset.id === editedAsset.id ? editedAsset : asset));
      setSelectedAsset(editedAsset);
      setShowEditModal(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const csvContent = [
      ['Code', 'Name', 'Brand', 'Location', 'Cost', 'Purchase Date', 'Status'],
      ...localAssets.map(asset => [
        asset.code,
        asset.name,
        asset.brand,
        asset.location,
        asset.cost.toString(),
        asset.date,
        asset.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${categoryName}_assets_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeId = categoryName.toLowerCase();

  return (
    <Layout>
      <div className="fa-shell">
        {/* ── Subpage Sidebar ── */}
        <aside className="fa-sidenav">
          <div className="fa-sidenav-header">
            <button className="fa-back-link" onClick={() => router.push('../assets')}>
              <ChevronLeft size={16}/> Back to Dashboard
            </button>
          </div>
          <nav className="fa-sidenav-nav">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`fa-sidenav-item ${activeId === item.id ? 'active' : ''}`}
                onClick={() => router.push(item.route)}
              >
                <span className="fa-sidenav-icon">{item.icon}</span>
                <span className="fa-sidenav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main Content ── */}
        <main className="fa-main-content">
          <div className="category-assets-container">
            {/* Header */}
            <div className="cat-header">
              <div className="cat-header-left">
                <div className="header-title">
                  <h1>{categoryTitle} Assets</h1>
                  <p>Manage and track all {categoryName} records.</p>
                </div>
              </div>
              <div className="cat-header-right">
                <button className="btn-outline" onClick={handlePrint}>
                  <Printer size={16} /> Print
                </button>
                <button className="btn-outline" onClick={handleExport}>
                  <Download size={16} /> Export
                </button>
                <button className="btn-primary" onClick={() => router.push('../assets/add')}>
                  <Plus size={16} /> Add Asset
                </button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="cat-controls">
              <div className="search-wrap">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Search assets by name or code..." />
              </div>
              <div className="filter-wrap">
                <div className="filter-item">
                  <Filter size={16} />
                  <select>
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Disposed</option>
                  </select>
                </div>
                <div className="filter-item">
                  <Calendar size={16} />
                  <select>
                    <option>Purchase Year</option>
                    <option>2081</option>
                    <option>2080</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="cat-table-card">
              <table className="cat-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Asset Name</th>
                    <th>Location</th>
                    <th className="text-right">Cost (NPR)</th>
                    <th>Purchase Date</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {localAssets.map((asset) => (
                    <tr key={asset.id}>
                      <td className="font-bold text-slate-500">{asset.code}</td>
                      <td>
                        <div className="asset-info">
                          <span className="asset-name">{asset.name}</span>
                          <span className="asset-subtext">{asset.brand}</span>
                        </div>
                      </td>
                      <td>
                        <div className="location-info">
                          <MapPin size={12} /> {asset.location}
                        </div>
                      </td>
                      <td className="text-right font-mono font-semibold">{asset.cost.toLocaleString()}</td>
                      <td>{asset.date}</td>
                      <td>
                        <span className={`status-badge ${asset.status.toLowerCase()}`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="action-btns">
                          <button className="icon-btn view" title="View Details" onClick={() => handlePreview(asset)}><Eye size={16} /></button>
                          <button className="icon-btn edit" title="Edit Asset" onClick={() => handleEdit(asset)}><Edit2 size={16} /></button>
                          <button className="icon-btn dispose" title="Dispose Asset" onClick={() => handleDispose(asset)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Disposal Modal */}
            {showDisposalModal && (
              <div className="modal-overlay">
                <div className="modal-card">
                  <div className="modal-header">
                    <h3>Dispose Asset: {selectedAsset?.name}</h3>
                    <button className="close-btn" onClick={() => setShowDisposalModal(false)}><X size={20} /></button>
                  </div>
                  <div className="modal-body">
                    <div className="disposal-form">
                      <div className="form-group">
                        <label>Disposal Date (BS)</label>
                        <input type="text" placeholder="2081-01-01" />
                      </div>
                      <div className="form-group">
                        <label>Selling Price (NPR)</label>
                        <input type="number" placeholder="0.00" />
                      </div>
                      <div className="form-group full">
                        <label>Reason for Disposal</label>
                        <textarea placeholder="Reason for selling/scrapping..."></textarea>
                      </div>
                    </div>

                    <div className="disposal-calc">
                      <div className="calc-row">
                        <span>Book Value:</span>
                        <span className="font-mono font-bold">NPR {selectedAsset?.cost.toLocaleString()}</span>
                      </div>
                      <div className="calc-row">
                        <span>Selling Price:</span>
                        <span className="font-mono font-bold text-green-600">NPR 0</span>
                      </div>
                      <div className="calc-row divider">
                        <span>Estimated Profit/Loss:</span>
                        <span className="font-mono font-bold text-red-600">-NPR {selectedAsset?.cost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn-cancel" onClick={() => setShowDisposalModal(false)}>Cancel</button>
                    <button className="btn-danger">Confirm Disposal</button>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Modal */}
            {showPreviewModal && (
              <div className="modal-overlay">
                <div className="modal-card modal-large">
                  <div className="modal-header">
                    <h3>Asset Details</h3>
                    <button className="close-btn" onClick={() => setShowPreviewModal(false)}><X size={20} /></button>
                  </div>
                  <div className="modal-body">
                    <div className="preview-details">
                      <div className="preview-section">
                        <h4>Basic Information</h4>
                        <div className="preview-grid">
                          <div className="preview-item">
                            <span className="preview-label">Asset Code:</span>
                            <span className="preview-value">{selectedAsset?.code}</span>
                          </div>
                          <div className="preview-item">
                            <span className="preview-label">Asset Name:</span>
                            <span className="preview-value">{selectedAsset?.name}</span>
                          </div>
                          <div className="preview-item">
                            <span className="preview-label">Brand:</span>
                            <span className="preview-value">{selectedAsset?.brand}</span>
                          </div>
                          <div className="preview-item">
                            <span className="preview-label">Status:</span>
                            <span className={`preview-value status-${selectedAsset?.status.toLowerCase()}`}>{selectedAsset?.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="preview-section">
                        <h4>Financial Information</h4>
                        <div className="preview-grid">
                          <div className="preview-item">
                            <span className="preview-label">Purchase Cost:</span>
                            <span className="preview-value font-mono">NPR {selectedAsset?.cost.toLocaleString()}</span>
                          </div>
                          <div className="preview-item">
                            <span className="preview-label">Purchase Date:</span>
                            <span className="preview-value">{selectedAsset?.date}</span>
                          </div>
                          <div className="preview-item">
                            <span className="preview-label">Location:</span>
                            <span className="preview-value flex items-center gap-1">
                              <MapPin size={14} /> {selectedAsset?.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn-cancel" onClick={() => setShowPreviewModal(false)}>Close</button>
                    <button className="btn-primary" onClick={() => setShowPreviewModal(false)}>Edit Asset</button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
              <div className="modal-overlay">
                <div className="modal-card modal-large">
                  <div className="modal-header">
                    <h3>Edit Asset: {editedAsset?.name}</h3>
                    <button className="close-btn" onClick={() => setShowEditModal(false)}><X size={20} /></button>
                  </div>
                  <div className="modal-body">
                    <div className="edit-form">
                      <div className="edit-grid">
                        <div className="form-group">
                          <label>Asset Code</label>
                          <input
                            type="text"
                            value={editedAsset?.code || ''}
                            onChange={(e) => handleEditChange('code', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Asset Name</label>
                          <input
                            type="text"
                            value={editedAsset?.name || ''}
                            onChange={(e) => handleEditChange('name', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Brand</label>
                          <input
                            type="text"
                            value={editedAsset?.brand || ''}
                            onChange={(e) => handleEditChange('brand', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Status</label>
                          <select
                            value={editedAsset?.status || ''}
                            onChange={(e) => handleEditChange('status', e.target.value)}
                          >
                            <option value="Active">Active</option>
                            <option value="Disposed">Disposed</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Purchase Cost (NPR)</label>
                          <input
                            type="number"
                            value={editedAsset?.cost || ''}
                            onChange={(e) => handleEditChange('cost', Number(e.target.value))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Purchase Date (BS)</label>
                          <input
                            type="text"
                            value={editedAsset?.date || ''}
                            onChange={(e) => handleEditChange('date', e.target.value)}
                          />
                        </div>
                        <div className="form-group full">
                          <label>Location</label>
                          <input
                            type="text"
                            value={editedAsset?.location || ''}
                            onChange={(e) => handleEditChange('location', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSaveEdit}>Save Changes</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default CategoryAssetsPage;
