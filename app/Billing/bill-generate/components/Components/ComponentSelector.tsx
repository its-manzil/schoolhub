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
}

interface FeeComponent {
  id: string;
  name: string;
  category?: string;
  amount: number;
  isActive: boolean;
  frequency?: 'monthly' | 'yearly' | 'weekly' | 'one-time';
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
    const existingIndex = selectedComponents.findIndex(c => c.id === component.id);

    if (existingIndex >= 0) {
      // Remove component
      const updated = selectedComponents.filter(c => c.id !== component.id);
      onChange(updated);
    } else {
      // Add component with default qty 1 and amount from class_fees
      const amount = getComponentAmount(component.id);
      const paidData = paidComponents[component.id];
      
      // For monthly components, calculate default month range
      let monthRange: MonthRange | undefined;
      let qty = 1;
      
      if (component.frequency === 'monthly' && paidData) {
        const paidMonths = paidData.paidMonths || [];
        // Find first available month (not paid)
        let startMonth = 1;
        while (paidMonths.includes(startMonth) && startMonth <= 12) {
          startMonth++;
        }
        if (startMonth <= 12) {
          monthRange = { fromMonth: startMonth, toMonth: startMonth };
          qty = 1;
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
    if (component.frequency !== 'one-time') return false;
    const paidData = paidComponents[component.id];
    return paidData ? paidData.paidCount > 0 : false;
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
          {availableComponents.map((component) => {
            const selected = isSelected(component.id);
            const selectedData = getSelectedComponent(component.id);
            const isFullyPaid = isComponentFullyPaid(component);
            
            // Hide one-time components that are already paid
            if (isFullyPaid && !selected) {
              return null;
            }

            return (
              <div
                key={component.id}
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
                
                {selected && selectedData && (
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
