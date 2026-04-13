import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from './FeeHeadConfiguration.module.css';

interface FeeHead {
  id: string;
  name: string;
  category: 'tuition' | 'exam' | 'bus' | 'library' | 'laboratory' | 'sports' | 'other';
  ledgerAccount: string;
  financialAttributes: {
    taxable: boolean;
    taxRate?: number;
    isRefundable: boolean;
    isAdjustable: boolean;
    requiresApproval: boolean;
  };
  calculation: {
    type: 'fixed' | 'percentage' | 'slab';
    amount?: number;
    percentage?: number;
    slabs?: Array<{ min: number; max: number; rate: number }>;
  };
  scheduling: {
    frequency: 'monthly' | 'quarterly' | 'semester' | 'yearly' | 'one-time';
    dueDay?: number;
    installments?: number;
  };
  display: {
    order: number;
    printName: string;
    showOnBill: boolean;
    showOnDashboard: boolean;
  };
  isActive: boolean;
  createdAt: string;
}

export const FeeHeadConfiguration: React.FC = () => {
  const router = useRouter();
  const [feeHeads, setFeeHeads] = useState<FeeHead[]>([
    {
      id: '1',
      name: 'Tuition Fee',
      category: 'tuition',
      ledgerAccount: 'Tuition Income Account',
      financialAttributes: {
        taxable: true,
        taxRate: 13,
        isRefundable: true,
        isAdjustable: true,
        requiresApproval: false
      },
      calculation: {
        type: 'slab',
        slabs: [
          { min: 0, max: 50000, rate: 15000 },
          { min: 50001, max: 100000, rate: 20000 },
          { min: 100001, max: 999999, rate: 25000 }
        ]
      },
      scheduling: {
        frequency: 'monthly',
        dueDay: 5,
        installments: 12
      },
      display: {
        order: 1,
        printName: 'Annual Tuition Fee',
        showOnBill: true,
        showOnDashboard: true
      },
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Examination Fee',
      category: 'exam',
      ledgerAccount: 'Exam Income Account',
      financialAttributes: {
        taxable: false,
        isRefundable: false,
        isAdjustable: false,
        requiresApproval: true
      },
      calculation: {
        type: 'fixed',
        amount: 2000
      },
      scheduling: {
        frequency: 'semester',
        installments: 2
      },
      display: {
        order: 2,
        printName: 'Semester Examination Fee',
        showOnBill: true,
        showOnDashboard: true
      },
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: '3',
      name: 'Transportation Fee',
      category: 'bus',
      ledgerAccount: 'Transport Income Account',
      financialAttributes: {
        taxable: true,
        taxRate: 13,
        isRefundable: true,
        isAdjustable: false,
        requiresApproval: false
      },
      calculation: {
        type: 'percentage',
        percentage: 5
      },
      scheduling: {
        frequency: 'monthly',
        dueDay: 10,
        installments: 12
      },
      display: {
        order: 3,
        printName: 'Monthly Transportation',
        showOnBill: true,
        showOnDashboard: true
      },
      isActive: true,
      createdAt: '2024-01-01'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHead, setEditingHead] = useState<FeeHead | null>(null);
  const [formData, setFormData] = useState<Partial<FeeHead>>({
    name: '',
    category: 'tuition',
    ledgerAccount: '',
    financialAttributes: {
      taxable: false,
      isRefundable: true,
      isAdjustable: false,
      requiresApproval: false
    },
    calculation: {
      type: 'fixed'
    },
    scheduling: {
      frequency: 'monthly',
      dueDay: 1
    },
    display: {
      order: 1,
      printName: '',
      showOnBill: true,
      showOnDashboard: true
    },
    isActive: true
  });

  const [filterCategory, setFilterCategory] = useState<string>('all');

  const handleAddNew = () => {
    setShowAddForm(true);
    setEditingHead(null);
    setFormData({
      name: '',
      category: 'tuition',
      ledgerAccount: '',
      financialAttributes: {
        taxable: false,
        isRefundable: true,
        isAdjustable: false,
        requiresApproval: false
      },
      calculation: {
        type: 'fixed'
      },
      scheduling: {
        frequency: 'monthly',
        dueDay: 1
      },
      display: {
        order: 1,
        printName: '',
        showOnBill: true,
        showOnDashboard: true
      },
      isActive: true
    });
  };

  const handleEdit = (head: FeeHead) => {
    setEditingHead(head);
    setFormData(head);
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (editingHead) {
      setFeeHeads(prev => prev.map(h => h.id === editingHead.id ? { ...formData, id: editingHead.id } as FeeHead : h));
    } else {
      const newHead: FeeHead = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0]
      } as FeeHead;
      setFeeHeads(prev => [...prev, newHead]);
    }
    setShowAddForm(false);
    setEditingHead(null);
  };

  const handleDelete = (id: string) => {
    setFeeHeads(prev => prev.filter(h => h.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setFeeHeads(prev => prev.map(h => 
      h.id === id ? { ...h, isActive: !h.isActive } : h
    ));
  };

  const handleBack = () => {
    router.push('/billing#billing-setup');
  };

  const filteredFeeHeads = filterCategory === 'all' 
    ? feeHeads 
    : feeHeads.filter(h => h.category === filterCategory);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'tuition', label: 'Tuition' },
    { value: 'exam', label: 'Examination' },
    { value: 'bus', label: 'Transportation' },
    { value: 'library', label: 'Library' },
    { value: 'laboratory', label: 'Laboratory' },
    { value: 'sports', label: 'Sports' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div id="fee-head-configuration" className="content-section active">
      <div className={styles.header}>
        <h2>Fee Head Configuration</h2>
        <p>Configure fee categories, calculation methods, and display settings</p>
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
          <i className="fas fa-plus"></i> Add New Fee Head
        </button>
      </div>

      {showAddForm && (
        <div className={styles.formCard}>
          <h3>{editingHead ? 'Edit Fee Head' : 'Add New Fee Head'}</h3>
          
          <div className={styles.formGrid}>
            <div className={styles.formSection}>
              <h4>Basic Information</h4>
              
              <div className={styles.formGroup}>
                <label>Fee Head Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Tuition Fee"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as FeeHead['category'] })}
                  required
                >
                  <option value="tuition">Tuition</option>
                  <option value="exam">Examination</option>
                  <option value="bus">Transportation</option>
                  <option value="library">Library</option>
                  <option value="laboratory">Laboratory</option>
                  <option value="sports">Sports</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Ledger Account *</label>
                <select
                  value={formData.ledgerAccount}
                  onChange={(e) => setFormData({ ...formData, ledgerAccount: e.target.value })}
                  required
                >
                  <option value="">Select Ledger Account</option>
                  <option value="Tuition Income Account">Tuition Income Account</option>
                  <option value="Exam Income Account">Exam Income Account</option>
                  <option value="Transport Income Account">Transport Income Account</option>
                  <option value="Library Income Account">Library Income Account</option>
                  <option value="Other Income Account">Other Income Account</option>
                </select>
              </div>
            </div>

            <div className={styles.formSection}>
              <h4>Financial Attributes</h4>
              
              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.financialAttributes?.taxable}
                    onChange={(e) => setFormData({
                      ...formData,
                      financialAttributes: {
                        ...formData.financialAttributes!,
                        taxable: e.target.checked
                      }
                    })}
                  />
                  <span>Taxable</span>
                </label>
                
                {formData.financialAttributes?.taxable && (
                  <div className={styles.formGroup}>
                    <label>Tax Rate (%)</label>
                    <input
                      type="number"
                      value={formData.financialAttributes.taxRate || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        financialAttributes: {
                          ...formData.financialAttributes!,
                          taxRate: parseFloat(e.target.value) || 0
                        }
                      })}
                      placeholder="13.00"
                      step="0.01"
                    />
                  </div>
                )}
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.financialAttributes?.isRefundable}
                    onChange={(e) => setFormData({
                      ...formData,
                      financialAttributes: {
                        ...formData.financialAttributes!,
                        isRefundable: e.target.checked
                      }
                    })}
                  />
                  <span>Refundable</span>
                </label>
                
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.financialAttributes?.isAdjustable}
                    onChange={(e) => setFormData({
                      ...formData,
                      financialAttributes: {
                        ...formData.financialAttributes!,
                        isAdjustable: e.target.checked
                      }
                    })}
                  />
                  <span>Adjustable</span>
                </label>
                
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.financialAttributes?.requiresApproval}
                    onChange={(e) => setFormData({
                      ...formData,
                      financialAttributes: {
                        ...formData.financialAttributes!,
                        requiresApproval: e.target.checked
                      }
                    })}
                  />
                  <span>Requires Approval</span>
                </label>
              </div>
            </div>

            <div className={styles.formSection}>
              <h4>Calculation Method</h4>
              
              <div className={styles.formGroup}>
                <label>Calculation Type *</label>
                <select
                  value={formData.calculation?.type}
                  onChange={(e) => setFormData({
                    ...formData,
                    calculation: {
                      ...formData.calculation!,
                      type: e.target.value as FeeHead['calculation']['type']
                    }
                  })}
                  required
                >
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">Percentage</option>
                  <option value="slab">Slab Based</option>
                </select>
              </div>

              {formData.calculation?.type === 'fixed' && (
                <div className={styles.formGroup}>
                  <label>Amount *</label>
                  <input
                    type="number"
                    value={formData.calculation.amount || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      calculation: {
                        ...formData.calculation!,
                        amount: parseFloat(e.target.value) || 0
                      }
                    })}
                    placeholder="0.00"
                    required
                  />
                </div>
              )}

              {formData.calculation?.type === 'percentage' && (
                <div className={styles.formGroup}>
                  <label>Percentage (%) *</label>
                  <input
                    type="number"
                    value={formData.calculation.percentage || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      calculation: {
                        ...formData.calculation!,
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
              <h4>Scheduling</h4>
              
              <div className={styles.formGroup}>
                <label>Frequency *</label>
                <select
                  value={formData.scheduling?.frequency}
                  onChange={(e) => setFormData({
                    ...formData,
                    scheduling: {
                      ...formData.scheduling!,
                      frequency: e.target.value as FeeHead['scheduling']['frequency']
                    }
                  })}
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semester">Semester</option>
                  <option value="yearly">Yearly</option>
                  <option value="one-time">One Time</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Due Day</label>
                <input
                  type="number"
                  value={formData.scheduling?.dueDay || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    scheduling: {
                      ...formData.scheduling!,
                      dueDay: parseInt(e.target.value) || 1
                    }
                  })}
                  placeholder="1-31"
                  min="1"
                  max="31"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Installments</label>
                <input
                  type="number"
                  value={formData.scheduling?.installments || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    scheduling: {
                      ...formData.scheduling!,
                      installments: parseInt(e.target.value) || 1
                    }
                  })}
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <h4>Display Settings</h4>
              
              <div className={styles.formGroup}>
                <label>Display Order</label>
                <input
                  type="number"
                  value={formData.display?.order || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    display: {
                      ...formData.display!,
                      order: parseInt(e.target.value) || 1
                    }
                  })}
                  placeholder="1"
                  min="1"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Print Name</label>
                <input
                  type="text"
                  value={formData.display?.printName || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    display: {
                      ...formData.display!,
                      printName: e.target.value
                    }
                  })}
                  placeholder="Name to appear on printed bills"
                />
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.display?.showOnBill}
                    onChange={(e) => setFormData({
                      ...formData,
                      display: {
                        ...formData.display!,
                        showOnBill: e.target.checked
                      }
                    })}
                  />
                  <span>Show on Bill</span>
                </label>
                
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.display?.showOnDashboard}
                    onChange={(e) => setFormData({
                      ...formData,
                      display: {
                        ...formData.display!,
                        showOnDashboard: e.target.checked
                      }
                    })}
                  />
                  <span>Show on Dashboard</span>
                </label>
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave}>
              {editingHead ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      )}

      <div className={styles.feeHeadsGrid}>
        {filteredFeeHeads.map((head) => (
          <div key={head.id} className={styles.feeHeadCard}>
            <div className={styles.cardHeader}>
              <div className={styles.headerInfo}>
                <h3>{head.name}</h3>
                <span className={`${styles.badge} ${styles[head.category]}`}>
                  {head.category.charAt(0).toUpperCase() + head.category.slice(1)}
                </span>
              </div>
              <div className={styles.cardActions}>
                <button
                  className={`${styles.btn} ${styles.btnOutline}`}
                  onClick={() => handleEdit(head)}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  className={`${styles.btn} ${head.isActive ? styles.btnWarning : styles.btnSuccess}`}
                  onClick={() => handleToggleActive(head.id)}
                >
                  <i className={`fas fa-${head.isActive ? 'pause' : 'play'}`}></i>
                </button>
                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => handleDelete(head.id)}
                  disabled={head.isActive}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <div className={styles.cardDetails}>
              <div className={styles.detailSection}>
                <h5>Financial</h5>
                <div className={styles.detailRow}>
                  <span>Ledger:</span>
                  <span>{head.ledgerAccount}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Taxable:</span>
                  <span>{head.financialAttributes.taxable ? `${head.financialAttributes.taxRate}%` : 'No'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Refundable:</span>
                  <span>{head.financialAttributes.isRefundable ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h5>Calculation</h5>
                <div className={styles.detailRow}>
                  <span>Type:</span>
                  <span>{head.calculation.type.charAt(0).toUpperCase() + head.calculation.type.slice(1)}</span>
                </div>
                {head.calculation.type === 'fixed' && (
                  <div className={styles.detailRow}>
                    <span>Amount:</span>
                    <span>₹{head.calculation.amount?.toLocaleString()}</span>
                  </div>
                )}
                {head.calculation.type === 'percentage' && (
                  <div className={styles.detailRow}>
                    <span>Percentage:</span>
                    <span>{head.calculation.percentage}%</span>
                  </div>
                )}
              </div>

              <div className={styles.detailSection}>
                <h5>Scheduling</h5>
                <div className={styles.detailRow}>
                  <span>Frequency:</span>
                  <span>{head.scheduling.frequency.charAt(0).toUpperCase() + head.scheduling.frequency.slice(1)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Due Day:</span>
                  <span>{head.scheduling.dueDay || 'N/A'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Installments:</span>
                  <span>{head.scheduling.installments || 'N/A'}</span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h5>Display</h5>
                <div className={styles.detailRow}>
                  <span>Order:</span>
                  <span>{head.display.order}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Print Name:</span>
                  <span>{head.display.printName || head.name}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Show on Bill:</span>
                  <span>{head.display.showOnBill ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
