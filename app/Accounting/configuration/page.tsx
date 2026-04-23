"use client";

import { useState } from 'react';
import Layout from '../components/Layout';
import OrganizationContent from './components/OrganizationContent';
import COAContent from './components/COAContent';
import BankCashContent from './components/BankCashContent';
import FiscalYearContent from './components/FiscalYearContent';
import ContactsContent from './components/ContactsContent';
import './styles/config-tabs.css';

type TabType = 'organization' | 'coa' | 'bank-cash' | 'fiscal-year' | 'contacts';

const ConfigurationPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('organization');

  const tabs = [
    { id: 'organization' as TabType, label: 'Organization' },
    { id: 'coa' as TabType, label: 'Chart of Accounts' },
    { id: 'bank-cash' as TabType, label: 'Bank & Cash' },
    { id: 'fiscal-year' as TabType, label: 'Fiscal Year' },
    { id: 'contacts' as TabType, label: 'Contacts' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'organization':
        return <OrganizationContent />;
      case 'coa':
        return <COAContent />;
      case 'bank-cash':
        return <BankCashContent />;
      case 'fiscal-year':
        return <FiscalYearContent />;
      case 'contacts':
        return <ContactsContent />;
      default:
        return <OrganizationContent />;
    }
  };

  return (
    <Layout>
      <div className="config-tabs-container">
        <nav className="config-tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`config-tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="config-tab-content">
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
};

export default ConfigurationPage;