"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import styles from '../styles/ConfigurationLayout.module.css';
import { Plus, Trash2, Percent, Receipt, X } from 'lucide-react';
import { fetchTaxSettings, saveTaxSettings } from '../services/api';
import { TaxRule, TaxSlab, TaxRuleType } from '../services/types';

const TaxTDSPage = () => {
  const [vatRate, setVatRate] = useState(0);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  // New tax rule form state
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState<Partial<TaxRule>>({
    name: '',
    category: '',
    type: 'FIXED',
    rate: 0,
    slabs: [],
    threshold: {},
    revenueCode: '',
    description: ''
  });

  // Get schoolId from localStorage or user context
  useEffect(() => {
    // Try to get schoolId from localStorage first
    const storedSchoolId = localStorage.getItem('schoolId');
    if (storedSchoolId) {
      setSchoolId(storedSchoolId);
    } else {
      // Fallback: try to get from token (you might need to decode JWT)
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Basic JWT decode (you might want to use a proper library)
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.schoolId) {
            setSchoolId(payload.schoolId);
          }
        } catch (error) {
          console.error('Failed to decode token:', error);
        }
      }
    }
  }, []);

  const handleSave = async () => {
    if (!schoolId) {
      console.error('No schoolId found');
      return;
    }

    setIsSaving(true);
    try {
      const dataToSend = { vatRate, taxRules };
      console.log('Sending tax settings data:', dataToSend);
      
      await saveTaxSettings(dataToSend);
      alert('Tax settings saved successfully!');
    } catch (error) {
      console.error('Failed to save tax settings', error);
      alert(`Failed to save tax settings: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const loadTaxSettings = useCallback(async () => {
    if (!schoolId) return;
    
    try {
      console.log('Loading tax settings for schoolId:', schoolId);
      const response = await fetchTaxSettings();
      console.log('Received tax settings response:', response);
      
      if (response && response.success && response.data) {
        setVatRate(response.data.vatRate || 0);
        setTaxRules(response.data.taxRules || []);
        console.log('Tax settings loaded successfully');
      } else {
        console.warn('Invalid response structure:', response);
      }
    } catch (error) {
      console.error('Failed to fetch tax settings', error);
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    if (schoolId) {
      loadTaxSettings();
    }
  }, [schoolId, loadTaxSettings]);

  const addSlab = () => {
    const slabs = newRule.slabs || [];
    slabs.push({ from: 0, rate: 0 });
    setNewRule({ ...newRule, slabs });
  };

  const removeSlab = (index: number) => {
    const slabs = newRule.slabs || [];
    slabs.splice(index, 1);
    setNewRule({ ...newRule, slabs });
  };

  const updateSlab = (index: number, field: keyof TaxSlab, value: number) => {
    const slabs = newRule.slabs || [];
    slabs[index] = { ...slabs[index], [field]: value };
    setNewRule({ ...newRule, slabs });
  };

  const addTaxRule = () => {
    // Validate required fields
    if (!newRule.name?.trim()) {
      alert('Please enter a rule name');
      return;
    }

    if (!newRule.category?.trim()) {
      alert('Please select a category');
      return;
    }

    if (!newRule.revenueCode?.trim()) {
      alert('Please enter a revenue code');
      return;
    }

    // Check for duplicate names
    if (taxRules.some(rule => rule.name.toLowerCase() === newRule.name!.trim().toLowerCase())) {
      alert('Rule name already exists');
      return;
    }

    // Type-specific validation
    if (newRule.type === 'FIXED' || newRule.type === 'FINAL') {
      if (!newRule.rate || newRule.rate < 0 || newRule.rate > 100) {
        alert('Please enter a valid rate between 0 and 100');
        return;
      }
    }

    if (newRule.type === 'SLAB') {
      if (!newRule.slabs || newRule.slabs.length === 0) {
        alert('Please add at least one slab');
        return;
      }

      // Validate slabs
      for (const slab of newRule.slabs) {
        if (slab.from < 0 || slab.rate < 0 || slab.rate > 100) {
          alert('Please check slab values (from >= 0, rate 0-100)');
          return;
        }
      }
    }

    // Create new rule
    const rule: TaxRule = {
      id: crypto.randomUUID(),
      name: newRule.name.trim(),
      category: newRule.category.trim(),
      type: newRule.type as TaxRuleType,
      rate: newRule.rate,
      slabs: newRule.slabs,
      threshold: newRule.threshold,
      revenueCode: newRule.revenueCode.trim(),
      description: newRule.description?.trim()
    };

    setTaxRules([...taxRules, rule]);
    
    // Reset form
    setNewRule({
      name: '',
      category: '',
      type: 'FIXED',
      rate: 0,
      slabs: [],
      threshold: {},
      revenueCode: '',
      description: ''
    });
    setShowAddRule(false);
  };

  const removeTaxRule = (id: string) => {
    setTaxRules(taxRules.filter(rule => rule.id !== id));
  };

  const getRuleSummary = (rule: TaxRule) => {
    if (rule.type === 'FIXED') {
      return `${rule.rate}% (Fixed)`;
    } else if (rule.type === 'FINAL') {
      return `${rule.rate}% (Final)`;
    } else if (rule.type === 'SLAB' && rule.slabs) {
      const minRate = Math.min(...rule.slabs.map(s => s.rate));
      const maxRate = Math.max(...rule.slabs.map(s => s.rate));
      return `Slab: ${minRate}% → ${maxRate}%`;
    }
    return '';
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category' },
    { key: 'type', header: 'Type' },
    { key: 'summary', header: 'Rate/Slab', render: (row: TaxRule) => getRuleSummary(row) },
    { key: 'revenueCode', header: 'Revenue Code' },
    {
      key: 'actions',
      header: '',
      render: (row: TaxRule) => (
        <button 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} 
          onClick={() => removeTaxRule(row.id)}
        >
          <Trash2 size={16} />
        </button>
      )
    }
  ];

  const categories = [
    'Salary', 'Rent', 'Services', 'Consultancy', 'Contract', 
    'Commission', 'Interest', 'Dividend', 'Royalty', 'Other'
  ];

  return (
    <div className={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 className={styles.pageTitle}>Tax & TDS Settings</h1>
          <p className={styles.pageSubtitle}>Configure VAT rates and structured tax rules.</p>
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
              onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
              placeholder="e.g. 13"
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem' }}>
              This rate will be applied by default to all taxable invoices and purchases.
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <Button 
                style={{ width: '100%' }} 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Update VAT Rate'}
              </Button>
            </div>
          </div>

          {/* Tax Rules Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Receipt size={20} color="#4f46e5" />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>Tax Rules</h2>
            </div>
            
            <Button 
              onClick={() => setShowAddRule(true)}
              style={{ marginBottom: '1rem', width: '100%' }}
            >
              <Plus size={18} style={{ marginRight: '0.5rem' }} />
              Add Tax Rule
            </Button>

            {/* Add Rule Form */}
            {showAddRule && (
              <div style={{ 
                backgroundColor: '#f9fafb', 
                padding: '1.5rem', 
                borderRadius: '0.5rem', 
                border: '1px solid #e5e7eb',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>New Tax Rule</h3>
                  <button 
                    onClick={() => setShowAddRule(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  <Input 
                    label="Rule Name" 
                    value={newRule.name || ''}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    placeholder="e.g. Salary - SST"
                  />

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                      Category
                    </label>
                    <select 
                      value={newRule.category || ''}
                      onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value="">Select category...</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                      Type
                    </label>
                    <select 
                      value={newRule.type || 'FIXED'}
                      onChange={(e) => setNewRule({ ...newRule, type: e.target.value as TaxRuleType })}
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value="FIXED">Fixed Rate</option>
                      <option value="SLAB">Slab Rate</option>
                      <option value="FINAL">Final Rate</option>
                    </select>
                  </div>

                  {(newRule.type === 'FIXED' || newRule.type === 'FINAL') && (
                    <Input 
                      label="Rate (%)" 
                      type="number" 
                      value={newRule.rate || ''}
                      onChange={(e) => setNewRule({ ...newRule, rate: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g. 10"
                    />
                  )}

                  {newRule.type === 'SLAB' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                        Slabs
                      </label>
                      {(newRule.slabs || []).map((slab, index) => (
                        <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Input 
                            placeholder="From" 
                            type="number"
                            value={slab.from}
                            onChange={(e) => updateSlab(index, 'from', parseFloat(e.target.value) || 0)}
                            style={{ flex: 1 }}
                          />
                          <Input 
                            placeholder="To" 
                            type="number"
                            value={slab.to || ''}
                            onChange={(e) => updateSlab(index, 'to', e.target.value ? parseFloat(e.target.value) : 0)}
                            style={{ flex: 1 }}
                          />
                          <Input 
                            placeholder="Rate %" 
                            type="number"
                            value={slab.rate}
                            onChange={(e) => updateSlab(index, 'rate', parseFloat(e.target.value) || 0)}
                            style={{ flex: 1 }}
                          />
                          <button 
                            onClick={() => removeSlab(index)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              cursor: 'pointer', 
                              color: '#ef4444',
                              padding: '0.5rem'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <Button 
                        variant="secondary" 
                        onClick={addSlab}
                        style={{ width: '100%' }}
                      >
                        <Plus size={16} style={{ marginRight: '0.5rem' }} />
                        Add Slab
                      </Button>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input 
                      label="Individual Threshold" 
                      type="number"
                      value={newRule.threshold?.individual || ''}
                      onChange={(e) => setNewRule({ 
                        ...newRule, 
                        threshold: { 
                          ...newRule.threshold, 
                          individual: e.target.value ? parseFloat(e.target.value) : undefined 
                        }
                      })}
                      placeholder="e.g. 500000"
                    />
                    <Input 
                      label="Couple Threshold" 
                      type="number"
                      value={newRule.threshold?.couple || ''}
                      onChange={(e) => setNewRule({ 
                        ...newRule, 
                        threshold: { 
                          ...newRule.threshold, 
                          couple: e.target.value ? parseFloat(e.target.value) : undefined 
                        }
                      })}
                      placeholder="e.g. 600000"
                    />
                  </div>

                  <Input 
                    label="Revenue Code" 
                    value={newRule.revenueCode || ''}
                    onChange={(e) => setNewRule({ ...newRule, revenueCode: e.target.value })}
                    placeholder="e.g. 11211"
                  />

                  <Input 
                    label="Description (Optional)" 
                    value={newRule.description || ''}
                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                    placeholder="Additional details..."
                  />

                  <Button onClick={addTaxRule} style={{ width: '100%' }}>
                    Add Rule
                  </Button>
                </div>
              </div>
            )}

            <Table columns={columns} data={taxRules} />
            {taxRules.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <Button 
                  style={{ width: '100%' }} 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save All Settings'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxTDSPage;
