import Layout from "@/components/Layout";
import { Building2, Plus, ArrowRight } from "lucide-react";
import "./FixedAssets.css";

export default function FixedAssets() {
  const features = [
    {
      title: "Asset Management",
      description: "Record and track purchase details (date, cost, location)",
      icon: "📦",
    },
    {
      title: "Depreciation Calculator",
      description: "Calculate depreciation using Diminishing Balance method",
      icon: "📉",
    },
    {
      title: "Post Depreciation",
      description: "Post year-end depreciation entries automatically",
      icon: "✅",
    },
  ];

  return (
    <Layout>
      <div className="fa-page">

        {/* Header */}
        <div className="fa-header">
          <div>
            <h1 className="fa-title">Fixed Asset Register</h1>
            <p className="fa-subtitle">
              Track and manage school assets with depreciation calculations
            </p>
          </div>
          <button className="fa-add-btn">
            <Plus className="fa-add-icon" />
            Add Asset
          </button>
        </div>

        {/* Feature Cards */}
        <div className="fa-cards-grid">
          {features.map((item, idx) => (
            <div key={idx} className="fa-card">
              <div className="fa-card-icon">{item.icon}</div>
              <h3 className="fa-card-title">{item.title}</h3>
              <p className="fa-card-desc">{item.description}</p>
              <button className="fa-card-btn">
                Manage <ArrowRight className="fa-btn-icon" />
              </button>
            </div>
          ))}
        </div>

        {/* Asset List Empty State */}
        <div className="fa-list-card">
          <h2 className="fa-list-title">Asset List</h2>
          <div className="fa-empty-state">
            <Building2 className="fa-empty-icon" />
            <p className="fa-empty-primary">No assets registered yet</p>
            <p className="fa-empty-secondary">Add your first asset to get started</p>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="fa-coming-soon">
          <Building2 className="fa-coming-icon" />
          <h3 className="fa-coming-title">Coming Soon</h3>
          <p className="fa-coming-text">
            Continue building this section to add asset list, depreciation calculator,
            and year-end posting features. Ask me to continue.
          </p>
        </div>

      </div>
    </Layout>
  );
}
