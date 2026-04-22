'use client';

import React, { useState, useEffect } from 'react';
import './ComponentSelector.css';

export interface SelectedComponent {
  id: string;
  name: string;
  qty: number;
  rate: number;
  amount: number;
}

interface FeeComponent {
  id: string;
  name: string;
  category?: string;
  amount: number;
  isActive: boolean;
}

interface ComponentSelectorProps {
  selectedComponents: SelectedComponent[];
  onChange: (components: SelectedComponent[]) => void;
  schoolId: number;
  academicYear: string;
  className: string;
}

export default function ComponentSelector({
  selectedComponents,
  onChange,
  schoolId,
  academicYear,
  className
}: ComponentSelectorProps) {
  const [availableComponents, setAvailableComponents] = useState<FeeComponent[]>([]);
  const [classFees, setClassFees] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleToggleComponent = (component: FeeComponent) => {
    const existingIndex = selectedComponents.findIndex(c => c.id === component.id);

    if (existingIndex >= 0) {
      // Remove component
      const updated = selectedComponents.filter(c => c.id !== component.id);
      onChange(updated);
    } else {
      // Add component with default qty 1 and amount from class_fees
      const amount = getComponentAmount(component.id);
      const newComponent: SelectedComponent = {
        id: component.id,
        name: component.name,
        qty: 1,
        rate: amount,
        amount: amount
      };
      onChange([...selectedComponents, newComponent]);
    }
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

            return (
              <div
                key={component.id}
                className={`component-row ${selected ? 'selected' : ''}`}
              >
                <div className="component-checkbox-col">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => handleToggleComponent(component)}
                  />
                </div>
                <div className="component-info-col">
                  <div className="component-name">{component.name}</div>
                  {component.category && (
                    <div className="component-category">{component.category}</div>
                  )}
                </div>
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
