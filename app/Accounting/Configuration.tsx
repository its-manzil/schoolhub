import Layout from "@/components/Layout";
import { Settings, ArrowRight } from "lucide-react";
import "./Configuration.css";

export default function Configuration() {
  const items = [
    {
      title: "Fiscal Year Manager",
      description: "Switch between current and previous Nepali fiscal years",
      icon: "📅",
    },
    {
      title: "Chart of Accounts",
      description: "Manage your account hierarchy and structure",
      icon: "📊",
    },
    {
      title: "Bank/Cash Account Setup",
      description: "Link specific ledgers to bank accounts",
      icon: "🏦",
    },
  ];

  return (
    <Layout>
      <div className="cfg-page">

        {/* Header */}
        <div className="cfg-header">
          <h1 className="cfg-title">Configuration &amp; Setup</h1>
          <p className="cfg-subtitle">
            Configure your accounting system including fiscal years, chart of accounts, and bank linking
          </p>
        </div>

        {/* Cards */}
        <div className="cfg-cards-grid">
          {items.map((item, idx) => (
            <div key={idx} className="cfg-card">
              <div className="cfg-card-icon">{item.icon}</div>
              <h3 className="cfg-card-title">{item.title}</h3>
              <p className="cfg-card-desc">{item.description}</p>
              <button className="cfg-card-btn">
                Configure <ArrowRight className="cfg-btn-icon" />
              </button>
            </div>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="cfg-coming-soon">
          <Settings className="cfg-coming-icon" />
          <h3 className="cfg-coming-title">Coming Soon</h3>
          <p className="cfg-coming-text">
            Continue building this section to set up your accounting configuration. Ask me to continue
            implementing Configuration &amp; Setup features.
          </p>
        </div>

      </div>
    </Layout>
  );
}
