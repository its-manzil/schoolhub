import Layout from "@/components/Layout";
import { FileText, ArrowRight } from "lucide-react";
import "./VoucherEntry.css";

export default function VoucherEntry() {
  const voucherTypes = [
    { title: "Journal Voucher",  code: "JV",  icon: "📝" },
    { title: "Payment Voucher",  code: "PV",  icon: "💳" },
    { title: "Receipt Voucher",  code: "RV",  icon: "📥" },
    { title: "Contra Voucher",   code: "CV",  icon: "🔄" },
  ];

  return (
    <Layout>
      <div className="ve-page">

        {/* Header */}
        <div className="ve-header">
          <h1 className="ve-title">Voucher Entry</h1>
          <p className="ve-subtitle">
            Create and manage financial transactions with our unified voucher generator
          </p>
        </div>

        {/* Voucher Type Cards */}
        <div className="ve-cards-grid">
          {voucherTypes.map((item, idx) => (
            <div key={idx} className="ve-card">
              <div className="ve-card-icon">{item.icon}</div>
              <h3 className="ve-card-title">{item.title}</h3>
              <p className="ve-card-code">Code: {item.code}</p>
              <button className="ve-card-btn">
                Create <ArrowRight className="ve-btn-icon" />
              </button>
            </div>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="ve-coming-soon">
          <FileText className="ve-coming-icon" />
          <h3 className="ve-coming-title">Coming Soon</h3>
          <p className="ve-coming-text">
            Continue building this section to create the unified Voucher Generator with dynamic row addition,
            date picker (BS), auto-generated voucher numbers, and attachment uploads. Ask me to continue.
          </p>
        </div>

      </div>
    </Layout>
  );
}
