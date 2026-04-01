"use client";

import React from 'react';
import Layout from '../components/Layout';
import { Plus, Info, ArrowRight, Package } from "lucide-react";
import '../FixedAssets.css';

const FixedAssets = () => {
  const assetCategories = [
    {
      title: "Land & Buildings",
      desc: "Track school property, campuses, and permanent structures.",
      icon: "🏢",
    },
    {
      title: "Furniture & Fixtures",
      desc: "Manage classroom desks, office furniture, and laboratory equipment.",
      icon: "🪑",
    },
    {
      title: "Computers & IT",
      desc: "Track laptops, servers, networking gear, and software licenses.",
      icon: "💻",
    },
    {
      title: "Vehicles",
      desc: "Manage school buses, vans, and other official transport vehicles.",
      icon: "🚌",
    },
    {
      title: "Library Books",
      desc: "Track collection of books, periodicals, and digital resources.",
      icon: "📚",
    },
    {
      title: "Lab Equipment",
      desc: "Manage science lab tools, chemicals, and specialized apparatus.",
      icon: "🧪",
    },
  ];

  return (
    <Layout>
      <div className="fa-page">
        {/* Feature Cards */}
        <div className="fa-cards-grid">
          {assetCategories.map((category, idx) => (
            <div key={idx} className="fa-card">
              <div className="fa-card-icon">{category.icon}</div>
              <h2 className="fa-card-title">{category.title}</h2>
              <p className="fa-card-desc">{category.desc}</p>
              <button className="fa-card-btn">
                View Details <ArrowRight className="fa-btn-icon" />
              </button>
            </div>
          ))}
        </div>

        {/* Asset List Section */}
        <div className="fa-list-card">
          <h2 className="fa-list-title">Recent Asset Updates</h2>
          <div className="fa-empty-state">
            <Package className="fa-empty-icon" />
            <p className="fa-empty-primary">No recent asset updates</p>
            <p className="fa-empty-secondary">Newly added assets and maintenance logs will appear here.</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="fa-coming-soon">
          <Info className="fa-coming-icon" />
          <h3 className="fa-coming-title">Depreciation Calculations</h3>
          <p className="fa-coming-text">
            The system automatically calculates annual depreciation based on the straight-line method. You can customize depreciation rates in the System Configuration section.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default FixedAssets;
