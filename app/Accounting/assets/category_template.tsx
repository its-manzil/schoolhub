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
  id: string;
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
  { id: 'land',      label: 'Land & Buildings',  icon: <Building2 size={18}/>, route: '/Accounting/assets/land' },
  { id: 'furniture', label: 'Furniture & Fixtures', icon: <Armchair size={18}/>,  route: '/Accounting/assets/furniture' },
  { id: 'it',        label: 'Computers & IT',    icon: <Monitor size={18}/>,   route: '/Accounting/assets/it' },
  { id: 'vehicles',  label: 'School Vehicles',   icon: <Bus size={18}/>,       route: '/Accounting/assets/vehicles' },
  { id: 'library',   label: 'Library Resources', icon: <BookOpen size={18}/>,  route: '/Accounting/assets/library' },
  { id: 'lab',       label: 'Lab Equipment',     icon: <FlaskConical size={18}/>, route: '/Accounting/assets/lab' },
];

const CategoryAssetsPage = ({ categoryName, categoryTitle, assets }: CategoryPageProps) => {
  const router = useRouter();
  const [showDisposalModal, setShowDisposalModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const handleDispose = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowDisposalModal(true);
  };

  const activeId = categoryName.toLowerCase();

  return (
    <Layout>
      <div className="fa-shell">
        {/* ── Subpage Sidebar ── */}
        <aside className="fa-sidenav">
          <div className="fa-sidenav-header">
            <button className="fa-back-link" onClick={() => router.push('/Accounting/assets')}>
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
                <button className="btn-outline">
                  <Printer size={16} /> Print
                </button>
                <button className="btn-outline">
                  <Download size={16} /> Export
                </button>
                <button className="btn-primary" onClick={() => router.push('/Accounting/assets/add')}>
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
                  {assets.map((asset) => (
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
                          <button className="icon-btn view" title="View Details"><Eye size={16} /></button>
                          <button className="icon-btn edit" title="Edit Asset"><Edit2 size={16} /></button>
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
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default CategoryAssetsPage;
