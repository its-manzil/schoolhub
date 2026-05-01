'use client';

import React, { useState, useEffect } from 'react';
import { ListChecks, Plus, Trash2, Bus, AlertCircle } from 'lucide-react';
import './ComponentSelector.css';

export interface SelectedComponent {
  id: string;
  name: string;
  rate: number;
  qty: number;
  amount: number;
  type: 'fee' | 'inventory' | 'extra' | 'bus';
  reason?: string;
  instanceId?: string;
  monthRange?: { fromMonth: string; toMonth: string };
}

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
  const [availableFees, setAvailableFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFees = async () => {
      if (!academicYear || !className) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:2056/api/billing/fees?schoolId=${schoolId}&academicYear=${academicYear}&className=${className}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
          setAvailableFees(result.data);
        }
      } catch (error) {
        console.error('Error fetching fees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, [academicYear, className, schoolId]);

  const toggleFee = (fee: any) => {
    const existing = selectedComponents.find(c => c.id === fee.id && c.type === 'fee');
    if (existing) {
      onChange(selectedComponents.filter(c => !(c.id === fee.id && c.type === 'fee')));
    } else {
      onChange([...selectedComponents, {
        id: fee.id,
        name: fee.name,
        rate: fee.rate,
        qty: 1,
        amount: fee.rate,
        type: 'fee'
      }]);
    }
  };

  const updateQty = (instanceId: string, qty: number) => {
    onChange(selectedComponents.map(c => {
      if ((c.instanceId || c.id) === instanceId) {
        const newQty = Math.max(1, qty);
        return { ...c, qty: newQty, amount: c.rate * newQty };
      }
      return c;
    }));
  };

  const removeComponent = (instanceId: string) => {
    onChange(selectedComponents.filter(c => (c.instanceId || c.id) !== instanceId));
  };

  const addExtraFee = () => {
    const instanceId = `extra-${Date.now()}`;
    onChange([...selectedComponents, {
      id: 'extra',
      instanceId,
      name: 'Extra Fee',
      rate: 0,
      qty: 1,
      amount: 0,
      type: 'extra',
      reason: ''
    }]);
  };

  const updateExtraFee = (instanceId: string, field: string, value: any) => {
    onChange(selectedComponents.map(c => {
      if (c.instanceId === instanceId) {
        const updated = { ...c, [field]: value };
        if (field === 'rate' || field === 'qty') {
          updated.amount = updated.rate * updated.qty;
        }
        return updated;
      }
      return c;
    }));
  };

  return (
    <div className="billing-card component-selector-container">
      <div className="card-header-alt">
        <div className="header-info">
          <ListChecks size={18} className="text-primary" />
          <h3 className="card-title-sm">Fee Components</h3>
          <span className="count-badge">{selectedComponents.length} items</span>
        </div>
        <button className="btn-text-icon" onClick={addExtraFee}>
          <Plus size={14} /> Add Extra
        </button>
      </div>

      <div className="available-fees-strip">
        {loading ? (
          <div className="strip-loading">Loading...</div>
        ) : availableFees.length > 0 ? (
          <div className="fees-flex">
            {availableFees.map(fee => {
              const isSelected = selectedComponents.some(c => c.id === fee.id && c.type === 'fee');
              return (
                <button 
                  key={fee.id} 
                  className={`fee-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleFee(fee)}
                >
                  {fee.name} (Rs {fee.rate})
                </button>
              );
            })}
          </div>
        ) : (
          <div className="strip-empty">No fees configured for this class.</div>
        )}
      </div>

      <div className="selected-components-table-container">
        {selectedComponents.length > 0 ? (
          <table className="components-table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Rate</th>
                <th className="text-right">Amount</th>
                <th className="text-center"></th>
              </tr>
            </thead>
            <tbody>
              {selectedComponents.map((comp) => (
                <tr key={comp.instanceId || comp.id} className={`comp-row ${comp.type}`}>
                  <td>
                    <div className="comp-name-cell">
                      {comp.type === 'extra' ? (
                        <input 
                          type="text" 
                          className="inline-input" 
                          value={comp.name}
                          onChange={(e) => updateExtraFee(comp.instanceId!, 'name', e.target.value)}
                          placeholder="Fee name..."
                        />
                      ) : (
                        <span>{comp.name}</span>
                      )}
                      {comp.type === 'extra' && (
                        <input 
                          type="text" 
                          className="reason-input" 
                          value={comp.reason}
                          onChange={(e) => updateExtraFee(comp.instanceId!, 'reason', e.target.value)}
                          placeholder="Reason (optional)"
                        />
                      )}
                    </div>
                  </td>
                  <td className="text-center">
                    <input 
                      type="number" 
                      className="qty-input" 
                      value={comp.qty}
                      onChange={(e) => updateQty(comp.instanceId || comp.id, parseInt(e.target.value) || 0)}
                    />
                  </td>
                  <td className="text-right">
                    {comp.type === 'extra' ? (
                      <input 
                        type="number" 
                        className="rate-input" 
                        value={comp.rate}
                        onChange={(e) => updateExtraFee(comp.instanceId!, 'rate', parseFloat(e.target.value) || 0)}
                      />
                    ) : (
                      <span>{comp.rate.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="text-right font-bold">
                    {comp.amount.toLocaleString()}
                  </td>
                  <td className="text-center">
                    <button className="btn-remove" onClick={() => removeComponent(comp.instanceId || comp.id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="table-empty">
            <AlertCircle size={24} className="text-muted" />
            <p>No components selected. Click on fee chips above or add extra fees.</p>
          </div>
        )}
      </div>
    </div>
  );
}
