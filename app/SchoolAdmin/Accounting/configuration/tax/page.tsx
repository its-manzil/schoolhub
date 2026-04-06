"use client";
import Tax from "../../../../Accounting/configuration/tax/page";
export default function Page() { return <Tax />; }

import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import styles from '../styles/ConfigurationLayout.module.css';
import { Plus, Trash2, Percent, Receipt } from 'lucide-react';
import { fetchTaxSettings, saveTaxSettings } from '../services/api';
import { TDSRule } from '../services/types';

const TaxTDSPage = () => {
  const [vatRate, setVatRate] = useState(0);
  const [tdsRules, setTdsRules] = useState<TDSRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleSave = async () => {
    try {
      await saveTaxSettings({ vatRate, tdsRules });
      // Add success notification
    } catch (error) {
      console.error('Failed to save tax settings', error);
    }
  };

  const loadTaxSettings = async () => {
    try {
      const data = await fetchTaxSettings();
      if (data) {
        setVatRate(data.vatRate);
        setTdsRules(data.tdsRules as TDSRule[]);
      }
    } catch (error) {
      console.error('Failed to fetch tax settings', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadTaxSettings();
  }, []);

  const columns = [
    { key: 'category', header: 'Category' },
    { key: 'rate', header: 'Rate (%)', render: (row: TDSRule) => `${row.rate}%` },
    {
      key: 'actions',
      header: '',
      render: (row: TDSRule) => (
        <button 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} 
          onClick={() => setTdsRules(tdsRules.filter(r => r.id !== row.id))}
        >
          <Trash2 size={16} />
        </button>
      )
    }
  ];

  return (
    <div className={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 className={styles.pageTitle}>Tax & TDS Settings</h1>
          <p className={styles.pageSubtitle}>Configure VAT rates and withholding tax (TDS) rules.</p>
        </div>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
          {/* VAT Section */}
          <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Percent size={20} color="#4f46e5" />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>VAT Configuration</h2>
            </div>
            <Input 
              label="Standard VAT Rate (%)" 
              type="number" 
              value={vatRate} 
              onChange={(e) => setVatRate(parseFloat(e.target.value))}
              placeholder="e.g. 13"
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem' }}>
              This rate will be applied by default to all taxable invoices and purchases.
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <Button style={{ width: '100%' }} onClick={handleSave}>Update VAT Rate</Button>
            </div>
          </div>

          {/* TDS Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Receipt size={20} color="#4f46e5" />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>TDS Rules</h2>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <Input placeholder="New category..." />
              <Input placeholder="Rate..." type="number" style={{ width: '100px' }} />
              <Button variant="secondary"><Plus size={18} /></Button>
            </div>
            <Table columns={columns} data={tdsRules} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxTDSPage;
