import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from './FineCalculation.module.css';

interface FineRule {
  id: string;
  name: string;
  description: string;
  dueDate: {
    type: 'fixed' | 'dynamic';
    dayOfMonth?: number;
    daysAfterDue?: number;
  };
  gracePeriod: {
    enabled: boolean;
    days: number;
    type: 'calendar' | 'business';
  };
  fineType: {
    type: 'fixed' | 'percentage' | 'compound';
    amount?: number;
    percentage?: number;
    frequency: 'daily' | 'weekly' | 'monthly';
  };
  maximumLimit: {
    enabled: boolean;
    amount?: number;
    percentage?: number;
    type: 'absolute' | 'percentage_of_fee';
  };
  compounding: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    method: 'simple' | 'compound';
  };
  holidayExclusion: {
    enabled: boolean;
    includeWeekends: boolean;
    customHolidays: string[];
    nepaliHolidays: boolean;
  };
  application: {
    type: 'cumulative' | 'one_time';
    resetFrequency?: 'monthly' | 'quarterly' | 'yearly';
  };
  isActive: boolean;
  createdAt: string;
}

export const FineCalculation: React.FC = () => {
  const router = useRouter();
  const [fineRules, setFineRules] = useState<FineRule[]>([
    {
      id: '1',
      name: 'Standard Late Payment Fine',
      description: 'Default fine for all late payments',
      dueDate: {
        type: 'fixed',
        dayOfMonth: 5
      },
      gracePeriod: {
        enabled: true,
        days: 3,
        type: 'calendar'
      },
      fineType: {
        type: 'percentage',
        percentage: 2,
        frequency: 'monthly'
      },
      maximumLimit: {
        enabled: true,
        percentage: 10,
        type: 'percentage_of_fee'
      },
      compounding: {
        enabled: false,
        frequency: 'monthly',
        method: 'simple'
      },
      holidayExclusion: {
        enabled: true,
        includeWeekends: false,
        customHolidays: [],
        nepaliHolidays: true
      },
      application: {
        type: 'cumulative',
        resetFrequency: 'monthly'
      },
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Exam Fee Penalty',
      description: 'Special fine for exam fee payments',
      dueDate: {
        type: 'fixed',
        dayOfMonth: 15
      },
      gracePeriod: {
        enabled: true,
        days: 7,
        type: 'business'
      },
      fineType: {
        type: 'fixed',
        amount: 100,
        frequency: 'daily'
      },
      maximumLimit: {
        enabled: true,
        amount: 500,
        type: 'absolute'
      },
      compounding: {
        enabled: true,
        frequency: 'daily',
        method: 'compound'
      },
      holidayExclusion: {
        enabled: true,
        includeWeekends: true,
        customHolidays: ['2024-01-01', '2024-10-24'],
        nepaliHolidays: true
      },
      application: {
        type: 'one_time'
      },
      isActive: true,
      createdAt: '2024-01-01'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRule, setEditingRule] = useState<FineRule | null>(null);
  const [formData, setFormData] = useState<Partial<FineRule>>({
    name: '',
    description: '',
    dueDate: {
      type: 'fixed',
      dayOfMonth: 1
    },
    gracePeriod: {
      enabled: true,
      days: 0,
      type: 'calendar'
    },
    fineType: {
      type: 'fixed',
      amount: 0,
      frequency: 'daily'
    },
    maximumLimit: {
      enabled: false,
      amount: 0,
      type: 'absolute'
    },
    compounding: {
      enabled: false,
      frequency: 'daily',
      method: 'simple'
    },
    holidayExclusion: {
      enabled: false,
      includeWeekends: false,
      customHolidays: [],
      nepaliHolidays: false
    },
    application: {
      type: 'cumulative',
      resetFrequency: 'monthly'
    },
    isActive: true
  });

  const handleAddNew = () => {
    setShowAddForm(true);
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      dueDate: {
        type: 'fixed',
        dayOfMonth: 1
      },
      gracePeriod: {
        enabled: true,
        days: 0,
        type: 'calendar'
      },
      fineType: {
        type: 'fixed',
        amount: 0,
        frequency: 'daily'
      },
      maximumLimit: {
        enabled: false,
        amount: 0,
        type: 'absolute'
      },
      compounding: {
        enabled: false,
        frequency: 'daily',
        method: 'simple'
      },
      holidayExclusion: {
        enabled: false,
        includeWeekends: false,
        customHolidays: [],
        nepaliHolidays: false
      },
      application: {
        type: 'cumulative',
        resetFrequency: 'monthly'
      },
      isActive: true
    });
  };

  const handleEdit = (rule: FineRule) => {
    setEditingRule(rule);
    setFormData(rule);
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (editingRule) {
      setFineRules(prev => prev.map(r => r.id === editingRule.id ? { ...formData, id: editingRule.id } as FineRule : r));
    } else {
      const newRule: FineRule = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0]
      } as FineRule;
      setFineRules(prev => [...prev, newRule]);
    }
    setShowAddForm(false);
    setEditingRule(null);
  };

  const handleDelete = (id: string) => {
    setFineRules(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setFineRules(prev => prev.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const handleBack = () => {
    router.push('/billing#billing-setup');
  };

  const handleAddHoliday = () => {
    const date = prompt('Enter holiday date (YYYY-MM-DD):');
    if (date && formData.holidayExclusion) {
      setFormData({
        ...formData,
        holidayExclusion: {
          ...formData.holidayExclusion,
          customHolidays: [...(formData.holidayExclusion.customHolidays || []), date]
        }
      });
    }
  };

  const handleRemoveHoliday = (index: number) => {
    if (formData.holidayExclusion) {
      setFormData({
        ...formData,
        holidayExclusion: {
          ...formData.holidayExclusion,
          customHolidays: (formData.holidayExclusion.customHolidays || []).filter((_, i) => i !== index)
        }
      });
    }
  };

  return (
    <div id="fine-calculation" className="content-section active">
      <div className={styles.header}>
        <h2>Fine Calculation Rules</h2>
        <p>Configure comprehensive fine calculation rules with due dates, grace periods, and holiday exclusions</p>
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
          <i className="fas fa-plus"></i> Add New Fine Rule
        </button>
      </div>

      {showAddForm && (
        <div className={styles.formCard}>
          <h3>{editingRule ? 'Edit Fine Rule' : 'Add New Fine Rule'}</h3>
          
          <div className={styles.formGrid}>
            <div className={styles.formSection}>
              <h4>Basic Information</h4>
              
              <div className={styles.formGroup}>
                <label>Rule Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Standard Late Payment Fine"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe when this rule applies"
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <h4>Due Date Configuration</h4>
              
              <div className={styles.formGroup}>
                <label>Due Date Type *</label>
                <select
                  value={formData.dueDate?.type}
                  onChange={(e) => setFormData({
                    ...formData,
                    dueDate: {
                      ...formData.dueDate!,
                      type: e.target.value as 'fixed' | 'dynamic'
                    }
                  })}
                  required
                >
                  <option value="fixed">Fixed Day of Month</option>
                  <option value="dynamic">Days After Invoice Date</option>
                </select>
              </div>

              {formData.dueDate?.type === 'fixed' && (
                <div className={styles.formGroup}>
                  <label>Day of Month *</label>
                  <input
                    type="number"
                    value={formData.dueDate.dayOfMonth}
                    onChange={(e) => setFormData({
                      ...formData,
                      dueDate: {
                        ...formData.dueDate!,
                        dayOfMonth: parseInt(e.target.value) || 1
                      }
                    })}
                    placeholder="1-31"
                    min="1"
                    max="31"
                    required
                  />
                </div>
              )}

              {formData.dueDate?.type === 'dynamic' && (
                <div className={styles.formGroup}>
                  <label>Days After Invoice *</label>
                  <input
                    type="number"
                    value={formData.dueDate.daysAfterDue}
                    onChange={(e) => setFormData({
                      ...formData,
                      dueDate: {
                        ...formData.dueDate!,
                        daysAfterDue: parseInt(e.target.value) || 0
                      }
                    })}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              )}
            </div>

            <div className={styles.formSection}>
              <h4>Grace Period</h4>
              
              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.gracePeriod?.enabled}
                    onChange={(e) => setFormData({
                      ...formData,
                      gracePeriod: {
                        ...formData.gracePeriod!,
                        enabled: e.target.checked
                      }
                    })}
                  />
                  <span>Enable Grace Period</span>
                </label>
              </div>

              {formData.gracePeriod?.enabled && (
                <>
                  <div className={styles.formGroup}>
                    <label>Grace Days *</label>
                    <input
                      type="number"
                      value={formData.gracePeriod.days}
                      onChange={(e) => setFormData({
                        ...formData,
                        gracePeriod: {
                          ...formData.gracePeriod!,
                          days: parseInt(e.target.value) || 0
                        }
                      })}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Day Count Type *</label>
                    <select
                      value={formData.gracePeriod.type}
                      onChange={(e) => setFormData({
                        ...formData,
                        gracePeriod: {
                          ...formData.gracePeriod!,
                          type: e.target.value as 'calendar' | 'business'
                        }
                      })}
                      required
                    >
                      <option value="calendar">Calendar Days</option>
                      <option value="business">Business Days Only</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className={styles.formSection}>
              <h4>Fine Type & Details</h4>
              
              <div className={styles.formGroup}>
                <label>Fine Type *</label>
                <select
                  value={formData.fineType?.type}
                  onChange={(e) => setFormData({
                    ...formData,
                    fineType: {
                      ...formData.fineType!,
                      type: e.target.value as 'fixed' | 'percentage' | 'compound'
                    }
                  })}
                  required
                >
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">Percentage of Fee</option>
                  <option value="compound">Compound Interest</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Frequency *</label>
                <select
                  value={formData.fineType?.frequency}
                  onChange={(e) => setFormData({
                    ...formData,
                    fineType: {
                      ...formData.fineType!,
                      frequency: e.target.value as 'daily' | 'weekly' | 'monthly'
                    }
                  })}
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {formData.fineType?.type === 'fixed' && (
                <div className={styles.formGroup}>
                  <label>Fine Amount *</label>
                  <input
                    type="number"
                    value={formData.fineType.amount}
                    onChange={(e) => setFormData({
                      ...formData,
                      fineType: {
                        ...formData.fineType!,
                        amount: parseFloat(e.target.value) || 0
                      }
                    })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              )}

              {(formData.fineType?.type === 'percentage' || formData.fineType?.type === 'compound') && (
                <div className={styles.formGroup}>
                  <label>Percentage Rate *</label>
                  <input
                    type="number"
                    value={formData.fineType.percentage}
                    onChange={(e) => setFormData({
                      ...formData,
                      fineType: {
                        ...formData.fineType!,
                        percentage: parseFloat(e.target.value) || 0
                      }
                    })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                  />
                </div>
              )}
            </div>

            <div className={styles.formSection}>
              <h4>Maximum Fine Limit</h4>
              
              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.maximumLimit?.enabled}
                    onChange={(e) => setFormData({
                      ...formData,
                      maximumLimit: {
                        ...formData.maximumLimit!,
                        enabled: e.target.checked
                      }
                    })}
                  />
                  <span>Enable Maximum Limit</span>
                </label>
              </div>

              {formData.maximumLimit?.enabled && (
                <>
                  <div className={styles.formGroup}>
                    <label>Limit Type *</label>
                    <select
                      value={formData.maximumLimit.type}
                      onChange={(e) => setFormData({
                        ...formData,
                        maximumLimit: {
                          ...formData.maximumLimit!,
                          type: e.target.value as 'absolute' | 'percentage_of_fee'
                        }
                      })}
                      required
                    >
                      <option value="absolute">Absolute Amount</option>
                      <option value="percentage_of_fee">Percentage of Original Fee</option>
                    </select>
                  </div>

                  {formData.maximumLimit.type === 'absolute' && (
                    <div className={styles.formGroup}>
                      <label>Maximum Amount *</label>
                      <input
                        type="number"
                        value={formData.maximumLimit.amount}
                        onChange={(e) => setFormData({
                          ...formData,
                          maximumLimit: {
                            ...formData.maximumLimit!,
                            amount: parseFloat(e.target.value) || 0
                          }
                        })}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  )}

                  {formData.maximumLimit.type === 'percentage_of_fee' && (
                    <div className={styles.formGroup}>
                      <label>Maximum Percentage *</label>
                      <input
                        type="number"
                        value={formData.maximumLimit.percentage}
                        onChange={(e) => setFormData({
                          ...formData,
                          maximumLimit: {
                            ...formData.maximumLimit!,
                            percentage: parseFloat(e.target.value) || 0
                          }
                        })}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className={styles.formSection}>
              <h4>Compounding</h4>
              
              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.compounding?.enabled}
                    onChange={(e) => setFormData({
                      ...formData,
                      compounding: {
                        ...formData.compounding!,
                        enabled: e.target.checked
                      }
                    })}
                  />
                  <span>Enable Compounding</span>
                </label>
              </div>

              {formData.compounding?.enabled && (
                <>
                  <div className={styles.formGroup}>
                    <label>Compounding Frequency *</label>
                    <select
                      value={formData.compounding.frequency}
                      onChange={(e) => setFormData({
                        ...formData,
                        compounding: {
                          ...formData.compounding!,
                          frequency: e.target.value as 'daily' | 'weekly' | 'monthly'
                        }
                      })}
                      required
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Compounding Method *</label>
                    <select
                      value={formData.compounding.method}
                      onChange={(e) => setFormData({
                        ...formData,
                        compounding: {
                          ...formData.compounding!,
                          method: e.target.value as 'simple' | 'compound'
                        }
                      })}
                      required
                    >
                      <option value="simple">Simple Interest</option>
                      <option value="compound">Compound Interest</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className={styles.formSection}>
              <h4>Holiday Exclusion</h4>
              
              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.holidayExclusion?.enabled}
                    onChange={(e) => setFormData({
                      ...formData,
                      holidayExclusion: {
                        ...formData.holidayExclusion!,
                        enabled: e.target.checked
                      }
                    })}
                  />
                  <span>Enable Holiday Exclusion</span>
                </label>
              </div>

              {formData.holidayExclusion?.enabled && (
                <>
                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={formData.holidayExclusion.includeWeekends}
                        onChange={(e) => setFormData({
                          ...formData,
                          holidayExclusion: {
                            ...formData.holidayExclusion!,
                            includeWeekends: e.target.checked
                          }
                        })}
                      />
                      <span>Exclude Weekends</span>
                    </label>
                    
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={formData.holidayExclusion.nepaliHolidays}
                        onChange={(e) => setFormData({
                          ...formData,
                          holidayExclusion: {
                            ...formData.holidayExclusion!,
                            nepaliHolidays: e.target.checked
                          }
                        })}
                      />
                      <span>Include Nepali Holidays</span>
                    </label>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Custom Holidays</label>
                    <div className={styles.holidayList}>
                      {formData.holidayExclusion.customHolidays?.map((holiday, index) => (
                        <div key={index} className={styles.holidayItem}>
                          <input
                            type="date"
                            value={holiday}
                            onChange={(e) => {
                              const newHolidays = [...(formData.holidayExclusion?.customHolidays || [])];
                              newHolidays[index] = e.target.value;
                              setFormData({
                                ...formData,
                                holidayExclusion: {
                                  ...formData.holidayExclusion!,
                                  customHolidays: newHolidays
                                }
                              });
                            }}
                          />
                          <button
                            type="button"
                            className={styles.btnRemove}
                            onClick={() => handleRemoveHoliday(index)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnOutline}`}
                        onClick={handleAddHoliday}
                      >
                        <i className="fas fa-plus"></i> Add Holiday
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className={styles.formSection}>
              <h4>Application Method</h4>
              
              <div className={styles.formGroup}>
                <label>Application Type *</label>
                <select
                  value={formData.application?.type}
                  onChange={(e) => setFormData({
                    ...formData,
                    application: {
                      ...formData.application!,
                      type: e.target.value as 'cumulative' | 'one_time'
                    }
                  })}
                  required
                >
                  <option value="cumulative">Cumulative (Accumulating)</option>
                  <option value="one_time">One-time (Fixed)</option>
                </select>
              </div>

              {formData.application?.type === 'cumulative' && (
                <div className={styles.formGroup}>
                  <label>Reset Frequency *</label>
                  <select
                    value={formData.application.resetFrequency}
                    onChange={(e) => setFormData({
                      ...formData,
                      application: {
                        ...formData.application!,
                        resetFrequency: e.target.value as 'monthly' | 'quarterly' | 'yearly'
                      }
                    })}
                    required
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
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
        {fineRules.map((rule) => (
          <div key={rule.id} className={styles.ruleCard}>
            <div className={styles.cardHeader}>
              <div className={styles.headerInfo}>
                <h3>{rule.name}</h3>
                <span className={`${styles.badge} ${rule.isActive ? styles.active : styles.inactive}`}>
                  {rule.isActive ? 'Active' : 'Inactive'}
                </span>
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
                <h5>Due & Grace</h5>
                <div className={styles.detailRow}>
                  <span>Due Date:</span>
                  <span>
                    {rule.dueDate.type === 'fixed' 
                      ? `Day ${rule.dueDate.dayOfMonth} of month`
                      : `${rule.dueDate.daysAfterDue} days after invoice`
                    }
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span>Grace Period:</span>
                  <span>
                    {rule.gracePeriod.enabled 
                      ? `${rule.gracePeriod.days} ${rule.gracePeriod.type} days`
                      : 'No grace period'
                    }
                  </span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h5>Fine Details</h5>
                <div className={styles.detailRow}>
                  <span>Type:</span>
                  <span>{rule.fineType.type.charAt(0).toUpperCase() + rule.fineType.type.slice(1)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Amount:</span>
                  <span>
                    {rule.fineType.type === 'fixed' 
                      ? `₹${rule.fineType.amount}`
                      : `${rule.fineType.percentage}%`
                    }
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span>Frequency:</span>
                  <span>{rule.fineType.frequency.charAt(0).toUpperCase() + rule.fineType.frequency.slice(1)}</span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h5>Limits & Compounding</h5>
                <div className={styles.detailRow}>
                  <span>Max Limit:</span>
                  <span>
                    {rule.maximumLimit.enabled 
                      ? rule.maximumLimit.type === 'absolute'
                        ? `₹${rule.maximumLimit.amount}`
                        : `${rule.maximumLimit.percentage}% of fee`
                      : 'No limit'
                    }
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span>Compounding:</span>
                  <span>
                    {rule.compounding.enabled 
                      ? `${rule.compounding.method} (${rule.compounding.frequency})`
                      : 'Disabled'
                    }
                  </span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h5>Holiday & Application</h5>
                <div className={styles.detailRow}>
                  <span>Holiday Exclusion:</span>
                  <span>
                    {rule.holidayExclusion.enabled 
                      ? `${rule.holidayExclusion.includeWeekends ? 'Weekends + ' : ''}Holidays`
                      : 'Disabled'
                    }
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span>Application:</span>
                  <span>
                    {rule.application.type === 'cumulative'
                      ? `Cumulative (resets ${rule.application.resetFrequency})`
                      : 'One-time'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
