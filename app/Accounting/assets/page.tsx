"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import {
  Plus, BarChart3, ArrowRight, Info,
  Building2, Armchair, Monitor, Bus, BookOpen, FlaskConical,
  TrendingDown, TrendingUp, Package, Clock, ChevronRight
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
    route: '/accounting/fixed-assets/land',
    count: 4,
    value: 'NPR 82L',
    color: '#4f46e5',
  },
  {
    title: 'Furniture',
    desc: 'Manage classroom desks, office furniture, and laboratory equipment.',
    icon: <Armchair size={28} />,
    route: '/accounting/fixed-assets/furniture',
    count: 86,
    value: 'NPR 14.2L',
    color: '#0891b2',
  },
  {
    title: 'IT',
    desc: 'Track laptops, servers, networking gear, and software licenses.',
    icon: <Monitor size={28} />,
    route: '/accounting/fixed-assets/it',
    count: 52,
    value: 'NPR 28.5L',
    color: '#7c3aed',
  },
  {
    title: 'Vehicles',
    desc: 'Manage school buses, vans, and other official transport vehicles.',
    icon: <Bus size={28} />,
    route: '/accounting/fixed-assets/vehicles',
    count: 8,
    value: 'NPR 64L',
    color: '#ea580c',
  },
  {
    title: 'Library',
    desc: 'Track collection of books, periodicals, and digital resources.',
    icon: <BookOpen size={28} />,
    route: '/accounting/fixed-assets/library',
    count: 72,
    value: 'NPR 4.8L',
    color: '#16a34a',
  },
  {
    title: 'Lab',
    desc: 'Manage science lab tools, chemicals, and specialized apparatus.',
    icon: <FlaskConical size={28} />,
    route: '/accounting/fixed-assets/lab',
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

        {/* ── Header ── */}
        <div className="fa-header">
          <div className="fa-header-text">
            <h1 className="fa-title">Fixed Assets</h1>
            <p className="fa-subtitle">Manage assets, depreciation, and lifecycle tracking</p>
          </div>
          <div className="fa-header-actions">
            <button
              className="fa-btn fa-btn-outline"
              onClick={() => router.push('/accounting/fixed-assets/depreciation')}
            >
              <BarChart3 size={16} />
              Depreciation
            </button>
            <button
              className="fa-btn fa-btn-primary"
              onClick={() => router.push('/accounting/fixed-assets/add')}
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
              <button className="fa-view-all-btn" onClick={() => router.push('/accounting/fixed-assets/activity')}>
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