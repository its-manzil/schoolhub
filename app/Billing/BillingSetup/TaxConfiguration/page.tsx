import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from './TaxConfiguration.module.css';

interface TaxRule {
  id: string;
  taxCode: string;
  taxName: string;
  taxType: 'vat' | 'tds' | 'pan' | 'service_charge' | 'custom';
  taxRate: number;
  effectiveDate: string;
  educationServiceFee: {
    enabled: boolean;
    rate: number;
    applicableTo: 'all' | 'specific' | 'exempted';
    applicableServices: string[];
  };
  tdsManagement: {
    enabled: boolean;
    threshold: number;
    rate: number;
    deductFrom: 'source' | 'payment';
    certificateRequired: boolean;
  };
  accountingIntegration: {
    enabled: boolean;
    ledgerAccount: string;
    autoPosting: boolean;
    reconciliationFrequency: 'daily' | 'weekly' | 'monthly';
    exportFormat: 'excel' | 'pdf' | 'csv';
  };
  irdCompliance: {
    enabled: boolean;
    panNumber: string;
    filingFrequency: 'monthly' | 'quarterly' | 'yearly';
    returnFiling: boolean;
    auditTrail: boolean;
    electronicFiling: boolean;
  };
  importance: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  createdAt: string;
}

export const TaxConfiguration: React.FC = () => {
  const router = useRouter();
  const [taxRules, setTaxRules] = useState<TaxRule[]>([
    {
      id: '1',
      taxCode: 'VAT001',
      taxName: 'Standard VAT',
      taxType: 'vat',
      taxRate: 13,
      effectiveDate: '2024-01-01',
      educationServiceFee: {
        enabled: true,
        rate: 1,
        applicableTo: 'all',
        applicableServices: ['tuition', 'exam', 'transport']
      },
      tdsManagement: {
        enabled: false,
        threshold: 100000,
        rate: 1,
        deductFrom: 'payment',
        certificateRequired: true
      },
      accountingIntegration: {
        enabled: true,
        ledgerAccount: 'VAT Payable Account',
        autoPosting: true,
        reconciliationFrequency: 'monthly',
        exportFormat: 'excel'
      },
      irdCompliance: {
        enabled: true,
        panNumber: '123456789',
        filingFrequency: 'monthly',
        returnFiling: true,
        auditTrail: true,
        electronicFiling: true
      },
      importance: 'high',
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      taxCode: 'TDS001',
      taxName: 'Tax Deducted at Source',
      taxType: 'tds',
      taxRate: 1,
      effectiveDate: '2024-01-01',
      educationServiceFee: {
        enabled: false,
        rate: 0,
        applicableTo: 'exempted',
        applicableServices: []
      },
      tdsManagement: {
        enabled: true,
        threshold: 50000,
        rate: 2,
        deductFrom: 'source',
        certificateRequired: true
      },
      accountingIntegration: {
        enabled: true,
        ledgerAccount: 'TDS Payable Account',
        autoPosting: true,
        reconciliationFrequency: 'monthly',
        exportFormat: 'pdf'
      },
      irdCompliance: {
        enabled: true,
        panNumber: '123456789',
        filingFrequency: 'quarterly',
        returnFiling: true,
        auditTrail: true,
        electronicFiling: true
      },
      importance: 'medium',
      isActive: true,
      createdAt: '2024-01-01'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRule, setEditingRule] = useState<TaxRule | null>(null);
  const [formData, setFormData] = useState<Partial<TaxRule>>({
    taxCode: '',
    taxName: '',
    taxType: 'vat',
    taxRate: 0,
    effectiveDate: '',
    educationServiceFee: {
      enabled: false,
      rate: 0,
      applicableTo: 'all',
      applicableServices: []
    },
    tdsManagement: {
      enabled: false,
      threshold: 0,
      rate: 0,
      deductFrom: 'payment',
      certificateRequired: false
    },
    accountingIntegration: {
      enabled: false,
      ledgerAccount: '',
      autoPosting: false,
      reconciliationFrequency: 'monthly',
      exportFormat: 'excel'
    },
    irdCompliance: {
      enabled: false,
      panNumber: '',
      filingFrequency: 'monthly',
      returnFiling: false,
      auditTrail: false,
      electronicFiling: false
    },
    importance: 'medium',
    isActive: true
  });

  const handleAddNew = () => {
    setShowAddForm(true);
    setEditingRule(null);
    setFormData({
      taxCode: '',
      taxName: '',
      taxType: 'vat',
      taxRate: 0,
      effectiveDate: '',
      educationServiceFee: {
        enabled: false,
        rate: 0,
        applicableTo: 'all',
        applicableServices: []
      },
      tdsManagement: {
        enabled: false,
        threshold: 0,
        rate: 0,
        deductFrom: 'payment',
        certificateRequired: false
      },
      accountingIntegration: {
        enabled: false,
        ledgerAccount: '',
        autoPosting: false,
        reconciliationFrequency: 'monthly',
        exportFormat: 'excel'
      },
      irdCompliance: {
        enabled: false,
        panNumber: '',
        filingFrequency: 'monthly',
        returnFiling: false,
        auditTrail: false,
        electronicFiling: false
      },
      importance: 'medium',
      isActive: true
    });
  };

  const handleEdit = (rule: TaxRule) => {
    setEditingRule(rule);
    setFormData(rule);
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (editingRule) {
      setTaxRules(prev => prev.map(r => r.id === editingRule.id ? { ...formData, id: editingRule.id } as TaxRule : r));
    } else {
      const newRule: TaxRule = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0]
      } as TaxRule;
      setTaxRules(prev => [...prev, newRule]);
    }
    setShowAddForm(false);
    setEditingRule(null);
  };

  const handleDelete = (id: string) => {
    setTaxRules(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setTaxRules(prev => prev.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const handleBack = () => {
    router.push('/billing#billing-setup');
  };

  const handleServiceToggle = (service: string) => {
    const services = formData.educationServiceFee?.applicableServices || [];
    if (services.includes(service)) {
      setFormData({
        ...formData,
        educationServiceFee: {
          ...formData.educationServiceFee!,
          applicableServices: services.filter(s => s !== service)
        }
      });
    } else {
      setFormData({
        ...formData,
        educationServiceFee: {
          ...formData.educationServiceFee!,
          applicableServices: [...services, service]
        }
      });
    }
  };

  return (
    <div id="tax-configuration" className="content-section active">
      <div className={styles.header}>
        <h2>Tax Configuration</h2>
        <p>Manage VAT, TDS, PAN rules with IRD compliance and accounting integration</p>
      </div>

      <div className={styles.actions}>
        <button 
          className={`${styles.btn} ${styles.btnPrimary}`} 
          onClick={handleBack}
          aria-label="Back to Billing Setup"
          title="Back to Billing Setup"
        >
          <i className="fas fa-arrow-left"></i> Back to Billing Setup
        </button>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleAddNew}>
          <i className="fas fa-plus"></i> Add New Tax Rule
        </button>
      </div>

      {showAddForm && (
        <div className={styles.formCard}>
          <h3>{editingRule ? 'Edit Tax Rule' : 'Add New Tax Rule'}</h3>
          
          <div className={styles.formGrid}>
            <div className={styles.formSection}>
              <h4>Basic Tax Information</h4>
              
              <div className={styles.formGroup}>
                <label>Tax Code *</label>
                <input
                  type="text"
                  value={formData.taxCode}
                  onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                  placeholder="e.g., VAT001"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Tax Name *</label>
                <input
                  type="text"
                  value={formData.taxName}
                  onChange={(e) => setFormData({ ...formData, taxName: e.target.value })}
                  placeholder="e.g., Standard VAT"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Tax Type *</label>
                <select
                  value={formData.taxType}
                  onChange={(e) => setFormData({ ...formData, taxType: e.target.value as TaxRule['taxType'] })}
                  required
                >
                  <option value="vat">VAT (Value Added Tax)</option>
                  <option value="tds">TDS (Tax Deducted at Source)</option>
                  <option value="pan">PAN (Permanent Account Number)</option>
                  <option value="service_charge">Service Charge</option>
                  <option value="custom">Custom Tax</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Tax Rate (%) *</label>
                <input
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Effective Date *</label>
                <input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Importance Level</label>
                <select
                  value={formData.importance}
                  onChange={(e) => setFormData({ ...formData, importance: e.target.value as TaxRule['importance'] })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className={styles.formSection}>
              <h4>Education Service Fee</h4>
              
              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.educationServiceFee?.enabled}
                    onChange={(e) => setFormData({
                      ...formData,
                      educationServiceFee: {
                        ...formData.educationServiceFee!,
                        enabled: e.target.checked
                      }
                    })}
                  />
                  <span>Enable Education Service Fee</span>
                </label>
              </div>

              {formData.educationServiceFee?.enabled && (
                <>
                  <div className={styles.formGroup}>
                    <label>Service Fee Rate (%)</label>
                    <input
                      type="number"
                      value={formData.educationServiceFee.rate}
                      onChange={(e) => setFormData({
                        ...formData,
                        educationServiceFee: {
                          ...formData.educationServiceFee!,
                          rate: parseFloat(e.target.value) || 0
                        }
                      })}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Applicability</label>
                    <select
                      value={formData.educationServiceFee.applicableTo}
                      onChange={(e) => setFormData({
                        ...formData,
                        educationServiceFee: {
                          ...formData.educationServiceFee!,
                          applicableTo: e.target.value as 'all' | 'specific' | 'exempted'
                        }
                      })}
                    >
                      <option value="all">All Services</option>
                      <option value="specific">Specific Services</option>
                      <option value="exempted">Exempted Services</option>
                    </select>
                  </div>

                  {formData.educationServiceFee?.applicableTo === 'specific' && (
                    <div className={styles.formGroup}>
                      <label>Applicable Services</label>
                      <div className={styles.serviceCheckboxes}>
                        {['tuition', 'exam', 'transport', 'library', 'lab', 'sports'].map(service => (
                          <label key={service} className={styles.checkbox}>
                            <input
                              type="checkbox"
                              checked={formData.educationServiceFee?.applicableServices?.includes(service)}
                              onChange={() => handleServiceToggle(service)}
                            />
                            <span>{service.charAt(0).toUpperCase() + service.slice(1)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className={styles.formSection}>
              <h4>TDS Management</h4>
              
              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.tdsManagement?.enabled}
                    onChange={(e) => setFormData({
                      ...formData,
                      tdsManagement: {
                        ...formData.tdsManagement!,
                        enabled: e.target.checked
                      }
                    })}
                  />
                  <span>Enable TDS Management</span>
                </label>
              </div>

              {formData.tdsManagement?.enabled && (
                <>
                  <div className={styles.formGroup}>
                    <label>Threshold Amount</label>
                    <input
                      type="number"
                      value={formData.tdsManagement.threshold}
                      onChange={(e) => setFormData({
                        ...formData,
                        tdsManagement: {
                          ...formData.tdsManagement!,
                          threshold: parseFloat(e.target.value) || 0
                        }
                      })}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>TDS Rate (%)</label>
                    <input
                      type="number"
                      value={formData.tdsManagement.rate}
                      onChange={(e) => setFormData({
                        ...formData,
                        tdsManagement: {
                          ...formData.tdsManagement!,
                          rate: parseFloat(e.target.value) || 0
                        }
                      })}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Deduct From</label>
                    <select
                      value={formData.tdsManagement.deductFrom}
                      onChange={(e) => setFormData({
                        ...formData,
                        tdsManagement: {
                          ...formData.tdsManagement!,
                          deductFrom: e.target.value as 'source' | 'payment'
                        }
                      })}
                    >
                      <option value="source">At Source</option>
                      <option value="payment">At Payment</option>
                    </select>
                  </div>

                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={formData.tdsManagement.certificateRequired}
                        onChange={(e) => setFormData({
                          ...formData,
                          tdsManagement: {
                            ...formData.tdsManagement!,
                            certificateRequired: e.target.checked
                          }
                        })}
                      />
                      <span>Certificate Required</span>
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className={styles.formSection}>
              <h4>Accounting Integration</h4>
              
              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.accountingIntegration?.enabled}
                    onChange={(e) => setFormData({
                      ...formData,
                      accountingIntegration: {
                        ...formData.accountingIntegration!,
                        enabled: e.target.checked
                      }
                    })}
                  />
                  <span>Enable Accounting Integration</span>
                </label>
              </div>

              {formData.accountingIntegration?.enabled && (
                <>
                  <div className={styles.formGroup}>
                    <label>Ledger Account</label>
                    <select
                      value={formData.accountingIntegration.ledgerAccount}
                      onChange={(e) => setFormData({
                        ...formData,
                        accountingIntegration: {
                          ...formData.accountingIntegration!,
                          ledgerAccount: e.target.value
                        }
                      })}
                    >
                      <option value="">Select Ledger Account</option>
                      <option value="VAT Payable Account">VAT Payable Account</option>
                      <option value="TDS Payable Account">TDS Payable Account</option>
                      <option value="Service Tax Payable">Service Tax Payable</option>
                      <option value="Tax Receivable Account">Tax Receivable Account</option>
                    </select>
                  </div>

                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={formData.accountingIntegration.autoPosting}
                        onChange={(e) => setFormData({
                          ...formData,
                          accountingIntegration: {
                            ...formData.accountingIntegration!,
                            autoPosting: e.target.checked
                          }
                        })}
                      />
                      <span>Auto Posting</span>
                    </label>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Reconciliation Frequency</label>
                    <select
                      value={formData.accountingIntegration.reconciliationFrequency}
                      onChange={(e) => setFormData({
                        ...formData,
                        accountingIntegration: {
                          ...formData.accountingIntegration!,
                          reconciliationFrequency: e.target.value as 'daily' | 'weekly' | 'monthly'
                        }
                      })}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Export Format</label>
                    <select
                      value={formData.accountingIntegration.exportFormat}
                      onChange={(e) => setFormData({
                        ...formData,
                        accountingIntegration: {
                          ...formData.accountingIntegration!,
                          exportFormat: e.target.value as 'excel' | 'pdf' | 'csv'
                        }
                      })}
                    >
                      <option value="excel">Excel</option>
                      <option value="pdf">PDF</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className={styles.formSection}>
              <h4>IRD Compliance</h4>
              
              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.irdCompliance?.enabled}
                    onChange={(e) => setFormData({
                      ...formData,
                      irdCompliance: {
                        ...formData.irdCompliance!,
                        enabled: e.target.checked
                      }
                    })}
                  />
                  <span>Enable IRD Compliance</span>
                </label>
              </div>

              {formData.irdCompliance?.enabled && (
                <>
                  <div className={styles.formGroup}>
                    <label>PAN Number</label>
                    <input
                      type="text"
                      value={formData.irdCompliance.panNumber}
                      onChange={(e) => setFormData({
                        ...formData,
                        irdCompliance: {
                          ...formData.irdCompliance!,
                          panNumber: e.target.value
                        }
                      })}
                      placeholder="Enter PAN Number"
                      maxLength={9}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Filing Frequency</label>
                    <select
                      value={formData.irdCompliance.filingFrequency}
                      onChange={(e) => setFormData({
                        ...formData,
                        irdCompliance: {
                          ...formData.irdCompliance!,
                          filingFrequency: e.target.value as 'monthly' | 'quarterly' | 'yearly'
                        }
                      })}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={formData.irdCompliance.returnFiling}
                        onChange={(e) => setFormData({
                          ...formData,
                          irdCompliance: {
                            ...formData.irdCompliance!,
                            returnFiling: e.target.checked
                          }
                        })}
                      />
                      <span>Return Filing</span>
                    </label>
                    
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={formData.irdCompliance.auditTrail}
                        onChange={(e) => setFormData({
                          ...formData,
                          irdCompliance: {
                            ...formData.irdCompliance!,
                            auditTrail: e.target.checked
                          }
                        })}
                      />
                      <span>Audit Trail</span>
                    </label>
                    
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={formData.irdCompliance.electronicFiling}
                        onChange={(e) => setFormData({
                          ...formData,
                          irdCompliance: {
                            ...formData.irdCompliance!,
                            electronicFiling: e.target.checked
                          }
                        })}
                      />
                      <span>Electronic Filing</span>
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className={styles.formActions}>
            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave}>
              {editingRule ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      )}

      <div className={styles.rulesGrid}>
        {taxRules.map((rule) => (
          <div key={rule.id} className={styles.ruleCard}>
            <div className={styles.cardHeader}>
              <div className={styles.headerInfo}>
                <h3>{rule.taxName}</h3>
                <div className={styles.badgeContainer}>
                  <span className={`${styles.badge} ${styles[rule.taxType]}`}>
                    {rule.taxType.toUpperCase()}
                  </span>
                  <span className={`${styles.importanceBadge} ${styles[rule.importance]}`}>
                    {rule.importance.charAt(0).toUpperCase() + rule.importance.slice(1)}
                  </span>
                  <span className={`${styles.badge} ${rule.isActive ? styles.active : styles.inactive}`}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className={styles.cardActions}>
                <button
                  className={`${styles.btn} ${styles.btnOutline}`}
                  onClick={() => handleEdit(rule)}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  className={`${styles.btn} ${rule.isActive ? styles.btnWarning : styles.btnSuccess}`}
                  onClick={() => handleToggleActive(rule.id)}
                >
                  <i className={`fas fa-${rule.isActive ? 'pause' : 'play'}`}></i>
                </button>
                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => handleDelete(rule.id)}
                  disabled={rule.isActive}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <div className={styles.cardDetails}>
              <div className={styles.detailSection}>
                <h5>Basic Info</h5>
                <div className={styles.detailRow}>
                  <span>Tax Code:</span>
                  <span>{rule.taxCode}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Tax Rate:</span>
                  <span>{rule.taxRate}%</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Effective Date:</span>
                  <span>{rule.effectiveDate}</span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h5>Education Fee</h5>
                <div className={styles.detailRow}>
                  <span>Enabled:</span>
                  <span>{rule.educationServiceFee.enabled ? 'Yes' : 'No'}</span>
                </div>
                {rule.educationServiceFee.enabled && (
                  <>
                    <div className={styles.detailRow}>
                      <span>Rate:</span>
                      <span>{rule.educationServiceFee.rate}%</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Applicable To:</span>
                      <span>{rule.educationServiceFee.applicableTo}</span>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.detailSection}>
                <h5>TDS Management</h5>
                <div className={styles.detailRow}>
                  <span>Enabled:</span>
                  <span>{rule.tdsManagement.enabled ? 'Yes' : 'No'}</span>
                </div>
                {rule.tdsManagement.enabled && (
                  <>
                    <div className={styles.detailRow}>
                      <span>Threshold:</span>
                      <span>₹{rule.tdsManagement.threshold.toLocaleString()}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Rate:</span>
                      <span>{rule.tdsManagement.rate}%</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Deduct From:</span>
                      <span>{rule.tdsManagement.deductFrom}</span>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.detailSection}>
                <h5>Accounting</h5>
                <div className={styles.detailRow}>
                  <span>Integration:</span>
                  <span>{rule.accountingIntegration.enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                {rule.accountingIntegration.enabled && (
                  <>
                    <div className={styles.detailRow}>
                      <span>Ledger:</span>
                      <span>{rule.accountingIntegration.ledgerAccount}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Auto Posting:</span>
                      <span>{rule.accountingIntegration.autoPosting ? 'Yes' : 'No'}</span>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.detailSection}>
                <h5>IRD Compliance</h5>
                <div className={styles.detailRow}>
                  <span>Enabled:</span>
                  <span>{rule.irdCompliance.enabled ? 'Yes' : 'No'}</span>
                </div>
                {rule.irdCompliance.enabled && (
                  <>
                    <div className={styles.detailRow}>
                      <span>PAN Number:</span>
                      <span>{rule.irdCompliance.panNumber}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Filing:</span>
                      <span>{rule.irdCompliance.filingFrequency}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Electronic Filing:</span>
                      <span>{rule.irdCompliance.electronicFiling ? 'Yes' : 'No'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
