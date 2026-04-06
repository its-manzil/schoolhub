"use client";

import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
  Plus, BarChart3, ArrowRight, Info,
  Building2, Armchair, Monitor, Bus, BookOpen, FlaskConical,
  TrendingDown, TrendingUp, Package, Clock, ChevronRight,
  ChevronLeft, ArrowLeft, MoreVertical, Download, Filter,
  Trash2, Edit, Save, X, Search
import {
  Plus, BarChart3, ArrowRight, Info,
  Building2, Armchair, Monitor, Bus, BookOpen, FlaskConical,
  TrendingDown, TrendingUp, Package, Clock, ChevronRight
} from "lucide-react";
import './FixedAssets.css';

/* ── Types ── */
type View = 'dashboard' | 'add' | 'depreciation' | 'category';

interface AssetCategory {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  count: number;
  value: string;
  color: string;
}

interface ActivityItem {
  id: number;
  text: string;
  category: string;
  time: string;
  type: 'added' | 'depreciation' | 'transfer' | 'disposal';
}

interface Asset {
  id: string;
  name: string;
  category: string;
  purchaseDate: string;
  cost: string;
  bookValue: string;
  status: 'active' | 'depreciated' | 'disposed';
}

/* ── Mock Data ── */
const KPI_DATA = [
  { label: "Total Assets", value: "482", unit: "Items", trend: "+12", isUp: true, color: "#4f46e5" },
  { label: "Net Book Value", value: "24.5", unit: "M", trend: "-2.4", isUp: false, color: "#10b981" },
  { label: "Depreciation (FY)", value: "1.2", unit: "M", trend: "+5.1", isUp: true, color: "#f59e0b" },
  { label: "Added this Year", value: "34", unit: "Items", trend: "+8", isUp: true, color: "#ef4444" },
];

const CATEGORIES: AssetCategory[] = [
  { id: 'land', title: "Land & Buildings", desc: "Permanent structures, campuses and grounds.", icon: <Building2 />, count: 12, value: "12.4M", color: "#4f46e5" },
  { id: 'furniture', title: "Furniture & Fixtures", desc: "Desks, chairs, and office equipment.", icon: <Armchair />, count: 156, value: "2.1M", color: "#10b981" },
  { id: 'it', title: "IT & Computers", desc: "Laptops, servers and networking gear.", icon: <Monitor />, count: 84, value: "4.5M", color: "#3b82f6" },
  { id: 'vehicles', title: "Vehicles", desc: "School buses, vans and official cars.", icon: <Bus />, count: 8, value: "3.2M", color: "#f59e0b" },
  { id: 'library', title: "Library Books", desc: "Physical books and digital resources.", icon: <BookOpen />, count: 210, value: "1.2M", color: "#ef4444" },
  { id: 'lab', title: "Lab Equipment", desc: "Science lab tools and specialized gear.", icon: <FlaskConical />, count: 12, value: "1.1M", color: "#8b5cf6" },
];

const ACTIVITIES: ActivityItem[] = [
  { id: 1, text: "New Server Rack added to IT Lab", category: "IT & Computers", time: "2 hrs ago", type: 'added' },
  { id: 2, text: "Annual Depreciation calculated for Vehicles", category: "Vehicles", time: "5 hrs ago", type: 'depreciation' },
  { id: 3, text: "50 New Library Books registered", category: "Library", time: "1 day ago", type: 'added' },
  { id: 4, text: "Old furniture disposed from Block A", category: "Furniture", time: "2 days ago", type: 'disposal' },
  { id: 5, text: "IT Equipment transfer to Secondary Wing", category: "IT & Computers", time: "3 days ago", type: 'transfer' },
];

const ASSETS_MOCK: Asset[] = [
  { id: "AST-001", name: "Main Building - Block A", category: "Land & Buildings", purchaseDate: "2018-05-12", cost: "8,500,000", bookValue: "7,200,000", status: "active" },
  { id: "AST-002", name: "Dell PowerEdge Server", category: "IT & Computers", purchaseDate: "2021-09-20", cost: "450,000", bookValue: "320,000", status: "active" },
  { id: "AST-003", name: "School Bus - Tata Marcopolo", category: "Vehicles", purchaseDate: "2019-11-15", cost: "3,200,000", bookValue: "2,100,000", status: "active" },
  { id: "AST-004", name: "Office Desk Set (10)", category: "Furniture", purchaseDate: "2022-01-10", cost: "120,000", bookValue: "105,000", status: "active" },
  { id: "AST-005", name: "Lab Microscope (Zeiss)", category: "Lab Equipment", purchaseDate: "2020-03-05", cost: "85,000", bookValue: "42,000", status: "depreciated" },
];

const FixedAssets = () => {
  const [view, setView] = useState<View>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);

  /* ── Components for Sub-views ── */

  const Dashboard = () => (
    <>
      {/* Header */}
      <div className="fa-header">
        <div className="fa-header-actions">
          <button className="fa-btn fa-btn-outline" onClick={() => setView('depreciation')}>
            <BarChart3 size={18} /> Depreciation
          </button>
          <button className="fa-btn fa-btn-primary" onClick={() => setView('add')}>
            <Plus size={18} /> Add Asset
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="fa-kpi-grid">
        {KPI_DATA.map((kpi, i) => (
          <div key={i} className="fa-kpi-card">
            <div className="fa-kpi-top">
              <span className="fa-kpi-label">{kpi.label}</span>
              <div className="fa-kpi-icon-wrap" style={{ background: `${kpi.color}15`, color: kpi.color }}>
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="fa-kpi-value">
              {kpi.value}
              <span className="fa-kpi-unit">{kpi.unit}</span>
            </div>
            <div className={`fa-kpi-trend ${kpi.isUp ? 'trend-up' : 'trend-down'}`}>
              {kpi.isUp ? '+' : ''}{kpi.trend}% from last FY
            </div>
          </div>
        ))}
      </div>

      {/* Category Section */}
      <div className="fa-section">
        <div className="fa-section-header">
          <h2 className="fa-section-title">Asset Categories</h2>
        </div>
        <div className="fa-cards-grid">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="fa-card" onClick={() => { setSelectedCategory(cat); setView('category'); }}>
              <div className="fa-card-top">
                <div className="fa-card-icon-wrap" style={{ background: `${cat.color}15`, color: cat.color }}>
                  {cat.icon}
                </div>
                <div className="fa-card-meta">
                  <span className="fa-card-count">{cat.count} Items</span>
                  <span className="fa-card-value">NPR {cat.value}</span>
                </div>
              </div>
              <h3 className="fa-card-title">{cat.title}</h3>
              <p className="fa-card-desc">{cat.desc}</p>
              <div className="fa-card-footer">
                <span className="fa-card-link" style={{ color: cat.color }}>
                  View Registry <ChevronRight size={16} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="fa-bottom-grid">
        {/* Recent Activity */}
        <div className="fa-activity-card">
          <div className="fa-activity-header">
            <h2 className="fa-section-title">Recent Activity</h2>
            <button className="fa-view-all-btn">View All <ChevronRight size={14} /></button>
          </div>
          <div className="fa-activity-list">
            {ACTIVITIES.map((act, i) => (
              <div key={act.id} className={`fa-activity-item ${i !== ACTIVITIES.length - 1 ? 'fa-activity-divider' : ''}`}>
                <div className="fa-activity-body">
                  <p className="fa-activity-text">{act.text}</p>
                  <p className="fa-activity-category">{act.category}</p>
                </div>
                <div className="fa-activity-right">
                  <span className={`fa-act-badge ${
                    act.type === 'added' ? 'act-badge-green' : 
                    act.type === 'depreciation' ? 'act-badge-blue' :
                    act.type === 'disposal' ? 'act-badge-red' : 'act-badge-gray'
                  }`}>
                    {act.type}
                  </span>
                  <span className="fa-activity-time"><Clock size={12} /> {act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Depreciation Stats */}
        <div className="fa-quick-stats">
          <h2 className="fa-qs-title">Depreciation Schedule</h2>
          <div className="fa-qs-row">
            <span className="fa-qs-label">Land & Buildings</span>
            <span className="fa-qs-val">WDV — 5%/yr</span>
          </div>
          <div className="fa-qs-row">
            <span className="fa-qs-label">Vehicles</span>
            <span className="fa-qs-val">WDV — 20%/yr</span>
          </div>
          <div className="fa-qs-row">
            <span className="fa-qs-label">IT & Computers</span>
            <span className="fa-qs-val">WDV — 25%/yr</span>
          </div>
          <div className="fa-qs-row">
            <span className="fa-qs-label">Furniture</span>
            <span className="fa-qs-val">SLM — 10%/yr</span>
          </div>
          <div className="fa-qs-row">
            <span className="fa-qs-label">Lab Equipment</span>
            <span className="fa-qs-val">SLM — 15%/yr</span>
          </div>
        </div>
      </div>
    </>
  );

  const AddAsset = () => (
    <div className="fa-subview-card">
      <div className="fa-header" style={{ marginBottom: '2rem' }}>
        <div className="fa-title-section">
          <button className="fa-back-btn" onClick={() => setView('dashboard')}><ArrowLeft size={20} /></button>
          <div>
            <h1 className="fa-title">Register New Asset</h1>
            <p className="fa-subtitle">Add a physical or digital asset to the school registry.</p>
          </div>
        </div>
      </div>
      
      <form className="fa-form-grid">
        <div className="fa-form-group">
          <label>Asset Name</label>
          <input type="text" className="fa-input" placeholder="e.g. Dell Latitude 5420" />
        </div>
        <div className="fa-form-group">
          <label>Category</label>
          <select className="fa-input">
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div className="fa-form-group">
          <label>Purchase Date</label>
          <input type="date" className="fa-input" />
        </div>
        <div className="fa-form-group">
          <label>Original Cost (NPR)</label>
          <input type="number" className="fa-input" placeholder="0.00" />
        </div>
        <div className="fa-form-group">
          <label>Serial / Tag Number</label>
          <input type="text" className="fa-input" placeholder="e.g. SN-99210-X" />
        </div>
        <div className="fa-form-group">
          <label>Location</label>
          <input type="text" className="fa-input" placeholder="e.g. Main Admin Office" />
        </div>
      </form>
      
      <div className="fa-form-actions">
        <button className="fa-btn fa-btn-outline" onClick={() => setView('dashboard')}>Cancel</button>
        <button className="fa-btn fa-btn-primary"><Save size={18} /> Save Asset</button>
      </div>
    </div>
  );

  const Depreciation = () => (
    <div className="fa-subview-card">
      <div className="fa-header" style={{ marginBottom: '2rem' }}>
        <div className="fa-title-section">
          <button className="fa-back-btn" onClick={() => setView('dashboard')}><ArrowLeft size={20} /></button>
          <div>
            <h1 className="fa-title">Depreciation Manager</h1>
            <p className="fa-subtitle">Calculate and post annual asset depreciation.</p>
          </div>
        </div>
        <button className="fa-btn fa-btn-primary"><TrendingDown size={18} /> Run All Depreciation</button>
      </div>

      <div className="fa-table-container">
        <table className="fa-table">
          <thead>
            <tr>
              <th>Asset Name</th>
              <th>Category</th>
              <th>Purchase Date</th>
              <th>Original Cost</th>
              <th>Depreciation</th>
              <th>Current Book Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ASSETS_MOCK.map(asset => (
              <tr key={asset.id}>
                <td style={{ fontWeight: 600 }}>{asset.name}</td>
                <td>{asset.category}</td>
                <td>{asset.purchaseDate}</td>
                <td>{asset.cost}</td>
                <td style={{ color: '#dc2626' }}>-(15,000)</td>
                <td style={{ fontWeight: 700 }}>{asset.bookValue}</td>
                <td>
                  <button className="fa-back-btn" style={{ padding: '0.25rem' }}><Edit size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CategoryView = () => (
    <div className="fa-subview-card">
      <div className="fa-header" style={{ marginBottom: '2rem' }}>
        <div className="fa-title-section">
          <button className="fa-back-btn" onClick={() => setView('dashboard')}><ArrowLeft size={20} /></button>
          <div className="fa-card-icon-wrap" style={{ background: `${selectedCategory?.color}15`, color: selectedCategory?.color, width: 42, height: 42 }}>
            {selectedCategory?.icon}
          </div>
          <div>
            <h1 className="fa-title">{selectedCategory?.title} Registry</h1>
            <p className="fa-subtitle">Detailed listing of all assets in this category.</p>
          </div>
        </div>
        <div className="fa-header-actions">
          <button className="fa-btn fa-btn-outline"><Download size={18} /> Export List</button>
          <button className="fa-btn fa-btn-primary" onClick={() => setView('add')}><Plus size={18} /> Add New</button>
        </div>
      </div>

      <div className="fa-table-container">
        <table className="fa-table">
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Asset Name</th>
              <th>Purchase Date</th>
              <th>Original Cost</th>
              <th>Book Value</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ASSETS_MOCK.filter(a => a.category === selectedCategory?.title || selectedCategory?.id === 'all').map(asset => (
              <tr key={asset.id}>
                <td style={{ color: '#6b7280', fontFamily: 'monospace' }}>{asset.id}</td>
                <td style={{ fontWeight: 600 }}>{asset.name}</td>
                <td>{asset.purchaseDate}</td>
                <td>NPR {asset.cost}</td>
                <td style={{ fontWeight: 700 }}>NPR {asset.bookValue}</td>
                <td>
                  <span className={`fa-badge ${
                    asset.status === 'active' ? 'fa-badge-active' : 
                    asset.status === 'depreciated' ? 'fa-badge-depreciated' : 'fa-badge-disposed'
                  }`}>
                    {asset.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="fa-back-btn" style={{ padding: '0.25rem' }}><Edit size={14} /></button>
                    <button className="fa-back-btn" style={{ padding: '0.25rem', color: '#dc2626' }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  type: 'add' | 'depreciation' | 'update' | 'dispose';
}

} from "lucide-react";
import './FixedAssets.css';

/* ── Types ── */
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

/* ── Data ── */
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
    label: 'Net Value',
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
    title: 'Land',
    desc: 'Track school property, campuses, and permanent structures.',
    icon: <Building2 size={28} />,
    route: '/Accounting/assets/land',
    count: 4,
    value: 'NPR 82L',
    color: '#4f46e5',
  },
  {
    title: 'Furniture',
    desc: 'Manage classroom desks, office furniture, and laboratory equipment.',
    icon: <Armchair size={28} />,
    route: '/Accounting/assets/furniture',
    count: 86,
    value: 'NPR 14.2L',
    color: '#0891b2',
  },
  {
    title: 'IT',
    desc: 'Track laptops, servers, networking gear, and software licenses.',
    icon: <Monitor size={28} />,
    route: '/Accounting/assets/it',
    count: 52,
    value: 'NPR 28.5L',
    color: '#7c3aed',
  },
  {
    title: 'Vehicles',
    desc: 'Manage school buses, vans, and other official transport vehicles.',
    icon: <Bus size={28} />,
    route: '/Accounting/assets/vehicles',
    count: 8,
    value: 'NPR 64L',
    color: '#ea580c',
  },
  {
    title: 'Library',
    desc: 'Track collection of books, periodicals, and digital resources.',
    icon: <BookOpen size={28} />,
    route: '/Accounting/assets/library',
    count: 72,
    value: 'NPR 4.8L',
    color: '#16a34a',
  },
  {
    title: 'Lab',
    desc: 'Manage science lab tools, chemicals, and specialized apparatus.',
    icon: <FlaskConical size={28} />,
    route: '/Accounting/assets/lab',
    count: 26,
    value: 'NPR 11.2L',
    color: '#dc2626',
  },
];

const RECENT_ACTIVITY: ActivityItem[] = [
  { id: 1, text: 'New Computer (Dell Inspiron) added to IT assets',     category: 'Computers & IT',        time: '2 hrs ago',    type: 'add'         },
  { id: 2, text: 'Annual depreciation calculated for Vehicles',          category: 'Vehicles',               time: '1 day ago',    type: 'depreciation' },
  { id: 3, text: 'Furniture inventory updated — 4 new chairs added',    category: 'Furniture & Fixtures',   time: '2 days ago',   type: 'add'         },
  { id: 4, text: 'Lab microscope (Olympus CX23) maintenance logged',    category: 'Lab Equipment',          time: '3 days ago',   type: 'update'      },
  { id: 5, text: 'Library books audit completed — 72 items verified',   category: 'Library Books',          time: '5 days ago',   type: 'update'      },
  { id: 6, text: 'Old projector disposed — written off from IT assets', category: 'Computers & IT',        time: '1 week ago',   type: 'dispose'     },
];

const ACTIVITY_TYPE_CONFIG = {
  add:          { label: 'Added',       cls: 'act-badge-green'  },
  depreciation: { label: 'Depreciation',cls: 'act-badge-red'    },
  update:       { label: 'Updated',     cls: 'act-badge-blue'   },
  dispose:      { label: 'Disposed',    cls: 'act-badge-gray'   },
};

/* ── Component ── */
const FixedAssets = () => {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <Layout>
      <div className="fa-page">
        {view === 'dashboard' && <Dashboard />}
        {view === 'add' && <AddAsset />}
        {view === 'depreciation' && <Depreciation />}
        {view === 'category' && <CategoryView />}

        {/* ── Header ── */}
        <div className="fa-header">
          <div className="fa-header-actions">
            <button
              className="fa-btn fa-btn-outline"
              onClick={() => router.push('/Accounting/assets/depreciation')}
            >
              <BarChart3 size={16} />
              Depreciation
            </button>
            <button
              className="fa-btn fa-btn-primary"
              onClick={() => router.push('/Accounting/assets/add')}
            >
              <Plus size={16} />
              Add Asset
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="fa-kpi-grid">
          {KPI_CARDS.map((kpi, idx) => (
            <div key={idx} className="fa-kpi-card">
              <div className="fa-kpi-top">
                <div className="fa-kpi-icon-wrap" style={{ background: kpi.bg, color: kpi.color }}>
                  {kpi.icon}
                </div>
                <span className="fa-kpi-label">{kpi.label}</span>
              </div>
              <div className="fa-kpi-value">
                {kpi.value}
                {kpi.unit && <span className="fa-kpi-unit"> {kpi.unit}</span>}
              </div>
              <div className={`fa-kpi-trend ${kpi.trendUp ? 'trend-up' : 'trend-down'}`}>
                {kpi.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {kpi.trend}
              </div>
            </div>
          ))}
        </div>

        {/* ── Category Cards ── */}
        <div className="fa-section">
          <div className="fa-section-header">
            <h2 className="fa-section-title">Asset Categories</h2>
          </div>
          <div className="fa-cards-grid">
            {ASSET_CATEGORIES.map((cat, idx) => (
              <div
                key={idx}
                className={`fa-card ${hoveredCard === idx ? 'fa-card-hovered' : ''}`}
                onClick={() => router.push(cat.route)}
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="fa-card-top">
                  <div className="fa-card-icon-wrap" style={{ color: cat.color, background: `${cat.color}14` }}>
                    {cat.icon}
                  </div>
                  <div className="fa-card-meta">
                    <span className="fa-card-count">{cat.count} items</span>
                    <span className="fa-card-value">{cat.value}</span>
                  </div>
                </div>
                <h3 className="fa-card-title">{cat.title}</h3>
                <p className="fa-card-desc">{cat.desc}</p>
                <div className="fa-card-footer">
                  <span className="fa-card-link" style={{ color: cat.color }}>
                    View Details <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent Activity + Info Banner ── */}
        <div className="fa-bottom-grid">

          {/* Activity */}
          <div className="fa-activity-card">
            <div className="fa-activity-header">
              <h2 className="fa-section-title" style={{ margin: 0 }}>Recent Asset Updates</h2>
              <button className="fa-view-all-btn" onClick={() => router.push('/Accounting/assets/activity')}>
                View All <ArrowRight size={13} />
              </button>
            </div>
            <div className="fa-activity-list">
              {RECENT_ACTIVITY.map((item, idx) => {
                const cfg = ACTIVITY_TYPE_CONFIG[item.type];
                return (
                  <div key={item.id} className={`fa-activity-item ${idx < RECENT_ACTIVITY.length - 1 ? 'fa-activity-divider' : ''}`}>
                    <div className="fa-activity-body">
                      <p className="fa-activity-text">{item.text}</p>
                      <p className="fa-activity-category">{item.category}</p>
                    </div>
                    <div className="fa-activity-right">
                      <span className={`fa-act-badge ${cfg.cls}`}>{cfg.label}</span>
                      <span className="fa-activity-time">
                        <Clock size={11} /> {item.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Banner */}
          <div className="fa-info-col">
            <div className="fa-coming-soon">
              <Info className="fa-coming-icon" />
              <h3 className="fa-coming-title">Depreciation Calculations</h3>
              <p className="fa-coming-text">
                The system automatically calculates annual depreciation based on the straight-line method (SLM) and Written Down Value (WDV). Customize depreciation rates per asset category in System Configuration.
              </p>
            </div>

            <div className="fa-quick-stats">
              <h3 className="fa-qs-title">Depreciation Methods</h3>
              <div className="fa-qs-row">
                <span className="fa-qs-label">Buildings</span>
                <span className="fa-qs-val">SLM — 5%/yr</span>
              </div>
              <div className="fa-qs-row">
                <span className="fa-qs-label">Vehicles</span>
                <span className="fa-qs-val">WDV — 20%/yr</span>
              </div>
              <div className="fa-qs-row">
                <span className="fa-qs-label">Computers</span>
                <span className="fa-qs-val">WDV — 25%/yr</span>
              </div>
              <div className="fa-qs-row">
                <span className="fa-qs-label">Furniture</span>
                <span className="fa-qs-val">SLM — 10%/yr</span>
              </div>
              <div className="fa-qs-row">
                <span className="fa-qs-label">Lab Equipment</span>
                <span className="fa-qs-val">SLM — 15%/yr</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </Layout>
  );
};

export default FixedAssets;