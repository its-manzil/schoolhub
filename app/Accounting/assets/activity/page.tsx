"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import { ChevronLeft, Clock, Package, BarChart3, Edit, Trash2 } from "lucide-react";
import '../FixedAssets.css';

const RECENT_ACTIVITY = [
  { id: 1, text: 'New Computer (Dell Inspiron) added to IT assets',     category: 'Computers & IT',        time: '2 hrs ago',    type: 'add'         },
  { id: 2, text: 'Annual depreciation calculated for Vehicles',          category: 'Vehicles',               time: '1 day ago',    type: 'depreciation' },
  { id: 3, text: 'Furniture inventory updated — 4 new chairs added',    category: 'Furniture & Fixtures',   time: '2 days ago',   type: 'add'         },
  { id: 4, text: 'Lab microscope (Olympus CX23) maintenance logged',    category: 'Lab Equipment',          time: '3 days ago',   type: 'update'      },
  { id: 5, text: 'Library books audit completed — 72 items verified',   category: 'Library Books',          time: '5 days ago',   type: 'update'      },
  { id: 6, text: 'Old projector disposed — written off from IT assets', category: 'Computers & IT',        time: '1 week ago',   type: 'dispose'     },
];

const ACTIVITY_TYPE_CONFIG = {
  add:          { label: 'Added',       cls: 'act-badge-green', icon: <Package size={16} /> },
  depreciation: { label: 'Depreciation',cls: 'act-badge-red',   icon: <BarChart3 size={16} /> },
  update:       { label: 'Updated',     cls: 'act-badge-blue',  icon: <Edit size={16} /> },
  dispose:      { label: 'Disposed',    cls: 'act-badge-gray',  icon: <Trash2 size={16} /> },
};

const ActivityPage = () => {
  const router = useRouter();

  return (
    <Layout>
      <div className="fa-page">
        <div className="fa-header">
          <div className="fa-header-text">
            <button className="fa-btn fa-btn-outline" onClick={() => router.back()} style={{ marginBottom: '1rem' }}>
              <ChevronLeft size={16} /> Back
            </button>
            <h1 className="fa-title">Asset Activity Log</h1>
            <p className="fa-subtitle">A detailed history of all fixed asset changes and updates.</p>
          </div>
        </div>

        <div className="fa-activity-card" style={{ padding: '1.5rem' }}>
          <div className="fa-activity-list">
            {RECENT_ACTIVITY.map((item, idx) => {
              const cfg = ACTIVITY_TYPE_CONFIG[item.type as keyof typeof ACTIVITY_TYPE_CONFIG];
              return (
                <div key={item.id} className={`fa-activity-item ${idx < RECENT_ACTIVITY.length - 1 ? 'fa-activity-divider' : ''}`} style={{ padding: '1.25rem 0' }}>
                  <div className="fa-activity-body">
                    <p className="fa-activity-text" style={{ fontSize: '1rem', fontWeight: 600 }}>{item.text}</p>
                    <p className="fa-activity-category">{item.category}</p>
                  </div>
                  <div className="fa-activity-right" style={{ gap: '1rem' }}>
                    <span className={`fa-act-badge ${cfg.cls}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <span className="fa-activity-time" style={{ fontSize: '0.9rem' }}>
                      <Clock size={14} /> {item.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ActivityPage;
