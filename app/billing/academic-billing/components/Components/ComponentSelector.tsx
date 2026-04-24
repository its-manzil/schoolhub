'use client';

import React, { useState, useEffect } from 'react';
import './ComponentSelector.css';

export interface MonthRange {
  fromMonth: number;
  toMonth: number;
}

export interface SelectedComponent {
  id: string;
  name: string;
  qty: number;
  rate: number;
  amount: number;
  frequency?: string;
  monthRange?: MonthRange;
  reason?: string;
  tag?: string;
  instanceId?: string;
}

interface FeeComponent {
  id: string;
  name: string;
  category?: string;
  amount: number;
  isActive: boolean;
  frequency?: 'monthly' | 'yearly' | 'weekly' | 'one-time' | 'extra';
}

// Nepali months (Baishakh = 1, Chaitra = 12)
const NEPALI_MONTHS = [
  { value: 1, label: 'Baishakh' },
  { value: 2, label: 'Jestha' },
  { value: 3, label: 'Ashadh' },
  { value: 4, label: 'Shrawan' },
  { value: 5, label: 'Bhadra' },
  { value: 6, label: 'Ashwin' },
  { value: 7, label: 'Kartik' },
  { value: 8, label: 'Mangsir' },
  { value: 9, label: 'Poush' },
  { value: 10, label: 'Magh' },
  { value: 11, label: 'Falgun' },
  { value: 12, label: 'Chaitra' }
];

// Extra fee tag options
const EXTRA_FEE_TAGS = [
  { value: '', label: 'No Tag' },
  { value: 'EXAM', label: 'EXAM' },
  { value: 'FINE', label: 'FINE' },
  { value: 'PENALTY', label: 'PENALTY' },
  { value: 'RETEST', label: 'RETEST' },
  { value: 'OTHER', label: 'OTHER' }
];

interface ComponentSelectorProps {
  selectedComponents: SelectedComponent[];
  onChange: (components: SelectedComponent[]) => void;
  schoolId: number;
  academicYear: string;
  className: string;
  selectedStudentId?: string;
}

export default function ComponentSelector({
  selectedComponents,
  onChange,
  schoolId,
  academicYear,
  className,
  selectedStudentId
}: ComponentSelectorProps) {
  const [availableComponents, setAvailableComponents] = useState<FeeComponent[]>([]);
  const [classFees, setClassFees] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paidComponents, setPaidComponents] = useState<Record<string, { paidMonths: number[]; paidCount: number }>>({});

  useEffect(() => {
    const fetchComponentsAndFees = async () => {
      if (!schoolId || !academicYear) {
        setAvailableComponents([]);
        setClassFees({});
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        // Fetch components
        const componentsResponse = await fetch(
          `http://localhost:2056/api/accounting/fee-management/components?academicYear=${encodeURIComponent(academicYear)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-school-id': schoolId.toString()
            }
          }
        );

        if (!componentsResponse.ok) {
          throw new Error('Failed to fetch fee components');
        }

        const componentsData = await componentsResponse.json();

        if (componentsData.success && componentsData.data) {
          setAvailableComponents(componentsData.data);
        } else {
          setAvailableComponents([]);
        }

        // Fetch class fees for amounts
        if (className) {
          const classNumber = className.replace('Class ', '');
          const feesResponse = await fetch(
            `http://localhost:2056/api/accounting/fee-management/class-fees?academicYear=${encodeURIComponent(academicYear)}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'x-school-id': schoolId.toString()
              }
            }
          );

          if (feesResponse.ok) {
            const feesData = await feesResponse.json();
            if (feesData.success && feesData.data && feesData.data.length > 0) {
              // Find fees for selected class
              const classFeeData = feesData.data.find((item: { className: string }) => 
                item.className === classNumber || item.className === className
              );
              if (classFeeData && classFeeData.fees) {
                setClassFees(classFeeData.fees);
              } else {
                setClassFees({});
              }
            } else {
              setClassFees({});
            }
          } else {
            setClassFees({});
          }
        }
      } catch (err) {
        console.error('Error fetching components:', err);
        setError('Failed to load fee components');
        setAvailableComponents([]);
        setClassFees({});
      } finally {
        setLoading(false);
      }
    };

    fetchComponentsAndFees();
  }, [schoolId, academicYear, className]);

  const getComponentAmount = (componentId: string): number => {
    // Look up amount from class_fees by component ID (not name)
    return classFees[componentId] || 0;
  };

  // Fetch paid months for student from ledger
  useEffect(() => {
    const fetchPaidMonths = async () => {
      if (!schoolId || !selectedStudentId || !academicYear) {
        setPaidComponents({});
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:2056/api/billing/ledger/${selectedStudentId}?academicYear=${encodeURIComponent(academicYear)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-school-id': schoolId.toString()
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.paidComponents) {
            setPaidComponents(data.data.paidComponents);
          }
        }
      } catch (err) {
        console.error('Error fetching paid months:', err);
      }
    };

    fetchPaidMonths();
  }, [schoolId, selectedStudentId, academicYear]);

  const handleToggleComponent = (component: FeeComponent) => {
    // For extra fees, always create a new instance (allow duplicates)
    if (component.frequency === 'extra') {
      const amount = getComponentAmount(component.id);
      const instanceId = `extra-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newComponent: SelectedComponent = {
        id: component.id,
        instanceId,
        name: component.name,
        qty: 1,
        rate: amount,
        amount: amount,
        frequency: component.frequency,
        reason: '',
        tag: ''
      };
      onChange([...selectedComponents, newComponent]);
      return;
    }

    const existingIndex = selectedComponents.findIndex(c => c.id === component.id);

    if (existingIndex >= 0) {
      // Remove component
      const updated = selectedComponents.filter(c => c.id !== component.id);
      onChange(updated);
    } else {
      // Add component with default qty 1 and amount from class_fees
      const amount = getComponentAmount(component.id);
      
      // For monthly components, calculate default month range
      let monthRange: MonthRange | undefined;
      let qty = 1;
      
      if (component.frequency === 'monthly') {
        const firstUnpaid = getFirstUnpaidMonth(component.id);
        const validToMonth = getValidToMonth(component.id, firstUnpaid);
        if (firstUnpaid <= 12) {
          monthRange = { fromMonth: firstUnpaid, toMonth: validToMonth };
          qty = validToMonth - firstUnpaid + 1;
        }
      } else if (component.frequency === 'yearly') {
        qty = 1;
      }
      
      const newComponent: SelectedComponent = {
        id: component.id,
        name: component.name,
        qty: qty,
        rate: amount,
        amount: amount * qty,
        frequency: component.frequency,
        monthRange
      };
      onChange([...selectedComponents, newComponent]);
    }
  };

  const handleMonthRangeChange = (componentId: string, fromMonth: number, toMonth: number) => {
    const updated = selectedComponents.map(c => {
      if (c.id === componentId) {
        const months = Math.max(1, toMonth - fromMonth + 1);
        return {
          ...c,
          monthRange: { fromMonth, toMonth },
          qty: months,
          amount: months * c.rate
        };
      }
      return c;
    });
    onChange(updated);
  };

  const isMonthPaid = (componentId: string, month: number): boolean => {
    const paidData = paidComponents[componentId];
    return paidData ? paidData.paidMonths.includes(month) : false;
  };

  const isComponentFullyPaid = (component: FeeComponent): boolean => {
    // Extra fees can be repeated, never hide them
    if (component.frequency === 'extra') return false;
    
    const paidData = paidComponents[component.id];
    if (!paidData) return false;
    
    // One-time and yearly: hide if paid once
    if (component.frequency === 'one-time' || component.frequency === 'yearly') {
      return paidData.paidCount > 0;
    }
    
    // Monthly: hide if all 12 months are paid
    if (component.frequency === 'monthly') {
      const paidMonths = paidData.paidMonths || [];
      return paidMonths.length >= 12;
    }
    
    // Weekly: hide if all 52 weeks are paid (assuming 52 weeks in a year)
    if (component.frequency === 'weekly') {
      const paidMonths = paidData.paidMonths || []; // Using paidMonths to store paid weeks
      return paidMonths.length >= 52;
    }
    
    return false;
  };
  
  // Check if component should be shown (for filtering before render)
  const shouldShowComponent = (component: FeeComponent): boolean => {
    // Extra fees always show
    if (component.frequency === 'extra') return true;
    
    // Check if already selected (always show selected components)
    if (isSelected(component.id)) return true;
    
    // Check if fully paid
    return !isComponentFullyPaid(component);
  };
  
  // Get the first unpaid month for monthly fees
  const getFirstUnpaidMonth = (componentId: string): number => {
    const paidData = paidComponents[componentId];
    const paidMonths = paidData?.paidMonths || [];
    
    for (let month = 1; month <= 12; month++) {
      if (!paidMonths.includes(month)) {
        return month;
      }
    }
    return 1; // Fallback to month 1 if all paid (shouldn't happen if filtering works)
  };
  
  // Get the last valid "to" month based on paid months
  const getValidToMonth = (componentId: string, fromMonth: number): number => {
    const paidData = paidComponents[componentId];
    const paidMonths = paidData?.paidMonths || [];
    
    // Find the first paid month after fromMonth
    for (let month = fromMonth + 1; month <= 12; month++) {
      if (paidMonths.includes(month)) {
        return month - 1; // Stop at the month before the paid one
      }
    }
    return 12; // Can go to end of year if no paid months ahead
  };

  const handleQtyChange = (componentId: string, qty: number) => {
    if (qty < 1) qty = 1;

    const updated = selectedComponents.map(c => {
      if (c.id === componentId) {
        return {
          ...c,
          qty,
          amount: qty * c.rate
        };
      }
      return c;
    });

    onChange(updated);
  };

  const isSelected = (componentId: string) => {
    return selectedComponents.some(c => c.id === componentId);
  };

  const getSelectedComponent = (componentId: string) => {
    return selectedComponents.find(c => c.id === componentId);
  };

  // Get all selected instances of an extra fee component
  const getSelectedExtraFeeInstances = (componentId: string) => {
    return selectedComponents.filter(c => c.id === componentId && c.frequency === 'extra');
  };

  // Handle reason change for extra fee instance
  const handleExtraFeeReasonChange = (instanceId: string, reason: string) => {
    const updated = selectedComponents.map(c => {
      if (c.instanceId === instanceId) {
        return { ...c, reason };
      }
      return c;
    });
    onChange(updated);
  };

  // Handle tag change for extra fee instance
  const handleExtraFeeTagChange = (instanceId: string, tag: string) => {
    const updated = selectedComponents.map(c => {
      if (c.instanceId === instanceId) {
        return { ...c, tag };
      }
      return c;
    });
    onChange(updated);
  };

  // Handle rate change for extra fee instance
  const handleExtraFeeRateChange = (instanceId: string, rate: number) => {
    const updated = selectedComponents.map(c => {
      if (c.instanceId === instanceId) {
        return { ...c, rate, amount: rate * c.qty };
      }
      return c;
    });
    onChange(updated);
  };

  // Remove extra fee instance by instanceId
  const handleRemoveExtraFeeInstance = (instanceId: string) => {
    const updated = selectedComponents.filter(c => c.instanceId !== instanceId);
    onChange(updated);
  };

  if (!academicYear || !className) {
    return (
      <div className="component-selector">
        <div className="component-selector-empty">
          {!academicYear 
            ? "Please select an academic year first to view fee components"
            : "Please select a class to view fee amounts"}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="component-selector">
        <div className="component-selector-loading">
          <div className="spinner"></div>
          <span>Loading fee components...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="component-selector">
      <div className="component-selector-header">
        <h3 className="component-selector-title">
          Select Fee Components
          <span className="component-count">({selectedComponents.length} selected)</span>
        </h3>
      </div>

      {error && (
        <div className="component-selector-error">{error}</div>
      )}

      {availableComponents.length === 0 ? (
        <div className="component-selector-empty">
          No fee components found for {academicYear}. 
          <br />
          Please configure fee components in Billing Settings.
        </div>
      ) : (
        <div className="component-list">
          {availableComponents.filter(shouldShowComponent).map((component) => {
            const selected = isSelected(component.id);
            const selectedData = getSelectedComponent(component.id);
            const isFullyPaid = isComponentFullyPaid(component);
            const extraFeeInstances = getSelectedExtraFeeInstances(component.id);
            const isExtraFee = component.frequency === 'extra';

            return (
              <div key={component.id} className="component-wrapper">
                <div
                  className={`component-row ${selected ? 'selected' : ''} ${isFullyPaid ? 'fully-paid' : ''}`}
                >
                  <div className="component-checkbox-col">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => handleToggleComponent(component)}
                      disabled={isFullyPaid}
                    />
                  </div>
                  <div className="component-info-col">
                    <div className="component-name">{component.name}</div>
                    <div className="component-meta">
                      {component.category && (
                        <span className="component-category">{component.category}</span>
                      )}
                      {component.frequency && (
                        <span className={`component-frequency ${component.frequency}`}>
                          {component.frequency}
                        </span>
                      )}
                      {isFullyPaid && (
                        <span className="component-paid-badge">Paid</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Month Range Selector for Monthly Components */}
                  {selected && selectedData && selectedData.frequency === 'monthly' && (
                    <div className="component-months-col">
                      <div className="month-range-selector">
                        <label>From</label>
                        <select
                          value={selectedData.monthRange?.fromMonth || 1}
                          onChange={(e) => {
                            const fromMonth = parseInt(e.target.value);
                            const toMonth = selectedData.monthRange?.toMonth || fromMonth;
                            handleMonthRangeChange(component.id, fromMonth, Math.max(fromMonth, toMonth));
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {NEPALI_MONTHS.map((month) => (
                            <option 
                              key={month.value} 
                              value={month.value}
                              disabled={isMonthPaid(component.id, month.value)}
                            >
                              {month.label} {isMonthPaid(component.id, month.value) ? '(Paid)' : ''}
                            </option>
                          ))}
                        </select>
                        <label>To</label>
                        <select
                          value={selectedData.monthRange?.toMonth || selectedData.monthRange?.fromMonth || 1}
                          onChange={(e) => {
                            const toMonth = parseInt(e.target.value);
                            const fromMonth = selectedData.monthRange?.fromMonth || 1;
                            handleMonthRangeChange(component.id, fromMonth, toMonth);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {NEPALI_MONTHS.map((month) => (
                            <option 
                              key={month.value} 
                              value={month.value}
                              disabled={month.value < (selectedData.monthRange?.fromMonth || 1) || isMonthPaid(component.id, month.value)}
                            >
                              {month.label} {isMonthPaid(component.id, month.value) ? '(Paid)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      {selectedData.monthRange && (
                        <div className="month-range-display">
                          {NEPALI_MONTHS.find(m => m.value === selectedData.monthRange?.fromMonth)?.label}
                          {' → '}
                          {NEPALI_MONTHS.find(m => m.value === selectedData.monthRange?.toMonth)?.label}
                          {' ('}
                          {selectedData.monthRange.toMonth - selectedData.monthRange.fromMonth + 1} months{')'}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selected && selectedData && selectedData.frequency === 'yearly' && (
                    <div className="component-yearly-info">
                      <span className="yearly-badge">Academic Year: {academicYear}</span>
                    </div>
                  )}
                  
                  {/* Regular components (non-extra fee) */}
                  {selected && selectedData && !isExtraFee && (
                    <>
                      <div className="component-qty-col">
                        <label>Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={selectedData.qty || 1}
                          onChange={(e) => handleQtyChange(component.id, parseInt(e.target.value) || 1)}
                          onClick={(e) => e.stopPropagation()}
                          disabled={selectedData.frequency === 'monthly'}
                          title={selectedData.frequency === 'monthly' ? 'Use month range to change quantity' : ''}
                        />
                      </div>
                      <div className="component-rate-col">
                        <label>Rate (Rs)</label>
                        <span className="rate-value">{(selectedData.rate || 0).toFixed(2)}</span>
                      </div>
                      <div className="component-amount-col">
                        <label>Amount (Rs)</label>
                        <span className="amount-value">{(selectedData.amount || 0).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  
                  {!selected && (
                    <div className="component-default-rate">
                      Rate: Rs {(getComponentAmount(component.id) || 0).toFixed(2)}
                      {isFullyPaid && <span className="paid-text"> (Already Paid)</span>}
                    </div>
                  )}
                </div>
                
                {/* Extra Fee Instances */}
                {isExtraFee && extraFeeInstances.length > 0 && (
                  <div className="extra-fee-instances">
                    {extraFeeInstances.map((instance, index) => (
                      <div key={instance.instanceId} className="extra-fee-instance">
                        <div className="extra-fee-instance-header">
                          <span className="extra-fee-instance-number">Extra Fee #{index + 1}</span>
                          <button
                            className="extra-fee-remove-btn"
                            onClick={() => handleRemoveExtraFeeInstance(instance.instanceId!)}
                            title="Remove this extra fee instance"
                          >
                            ×
                          </button>
                        </div>
                        <div className="extra-fee-fields">
                          <div className="extra-fee-field">
                            <label>Reason for Extra Fee *</label>
                            <input
                              type="text"
                              value={instance.reason || ''}
                              onChange={(e) => handleExtraFeeReasonChange(instance.instanceId!, e.target.value)}
                              placeholder="e.g., First term exam fee, Late submission penalty"
                              className="extra-fee-reason-input"
                            />
                          </div>
                          <div className="extra-fee-field">
                            <label>Tag (Optional)</label>
                            <select
                              value={instance.tag || ''}
                              onChange={(e) => handleExtraFeeTagChange(instance.instanceId!, e.target.value)}
                              className="extra-fee-tag-select"
                            >
                              {EXTRA_FEE_TAGS.map(tag => (
                                <option key={tag.value} value={tag.value}>{tag.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="extra-fee-field">
                            <label>Rate (Rs)</label>
                            <input
                              type="number"
                              min="0"
                              value={instance.rate || 0}
                              onChange={(e) => handleExtraFeeRateChange(instance.instanceId!, parseFloat(e.target.value) || 0)}
                              className="extra-fee-rate-input"
                            />
                          </div>
                          <div className="extra-fee-field">
                            <label>Amount (Rs)</label>
                            <span className="extra-fee-amount">{(instance.amount || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedComponents.length > 0 && (
        <div className="component-summary">
          <div className="summary-row">
            <span>Sub Total:</span>
            <span className="summary-amount">
              Rs {selectedComponents.reduce((sum, c) => sum + (c.amount || 0), 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
