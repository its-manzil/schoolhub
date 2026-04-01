import Layout from "@/components/Layout";
import { DollarSign, ArrowRight } from "lucide-react";
import "./TDS.css";

export default function TDS() {
  const tdsRates = [
    { rate: "1%",   description: "Commission & Contractor fees" },
    { rate: "1.5%", description: "Service charges" },
    { rate: "5%",   description: "Rental and interest" },
    { rate: "15%",  description: "Dividends and other income" },
  ];

  return (
    <Layout>
      <div className="tds-page">

        {/* Header */}
        <div className="tds-header">
          <h1 className="tds-title">TDS &amp; Tax Management</h1>
          <p className="tds-subtitle">
            Manage Tax Deducted at Source (TDS) and stay compliant with IRD requirements
          </p>
        </div>

        {/* Top 3-column grid */}
        <div className="tds-top-grid">

          {/* TDS Rates */}
          <div className="tds-card">
            <h2 className="tds-card-title">TDS Rates</h2>
            <div className="tds-rates-list">
              {tdsRates.map((item, idx) => (
                <div key={idx} className="tds-rate-item">
                  <p className="tds-rate-val">{item.rate}</p>
                  <p className="tds-rate-desc">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="tds-card">
            <h2 className="tds-card-title">Quick Stats</h2>
            <div className="tds-stats-list">
              <div className="tds-stat">
                <p className="tds-stat-label">Total TDS Deducted</p>
                <p className="tds-stat-val">NPR 2,45,000</p>
              </div>
              <div className="tds-stat">
                <p className="tds-stat-label">TDS Deposited</p>
                <p className="tds-stat-val tds-stat-green">NPR 2,10,000</p>
              </div>
              <div className="tds-stat">
                <p className="tds-stat-label">Pending Deposit</p>
                <p className="tds-stat-val tds-stat-red">NPR 35,000</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="tds-card">
            <h2 className="tds-card-title">Actions</h2>
            <div className="tds-actions-list">
              <button className="tds-action-btn tds-action-primary">
                Setup TDS <ArrowRight className="tds-action-icon" />
              </button>
              <button className="tds-action-btn tds-action-secondary">
                View TDS Ledger <ArrowRight className="tds-action-icon" />
              </button>
            </div>
          </div>

        </div>

        {/* Coming Soon */}
        <div className="tds-coming-soon">
          <DollarSign className="tds-coming-icon" />
          <h3 className="tds-coming-title">Coming Soon</h3>
          <p className="tds-coming-text">
            Continue building this section to add TDS ledger tables showing Vendor/Staff Name, Amount Paid,
            TDS Deducted, and Status. Ask me to continue implementing TDS features.
          </p>
        </div>

      </div>
    </Layout>
  );
}
