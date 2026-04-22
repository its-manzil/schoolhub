'use client';

import React from 'react';
import './BillTable.css';
import { SelectedComponent } from '../Components/ComponentSelector';
import { formatNumber } from '../../utils/invoiceUtils';

interface BillTableProps {
  components: SelectedComponent[];
  vatRate: number;
  subTotal: number;
  vatAmount: number;
  totalAmount: number;
  onComponentsChange?: (components: SelectedComponent[]) => void;
  readOnly?: boolean;
}

export default function BillTable({
  components,
  vatRate,
  subTotal,
  vatAmount,
  totalAmount,
  onComponentsChange,
  readOnly = false
}: BillTableProps) {
  const handleQtyChange = (id: string, newQty: number) => {
    if (readOnly || !onComponentsChange) return;
    
    const updated = components.map(c => {
      if (c.id === id) {
        return { ...c, qty: newQty, amount: newQty * c.rate };
      }
      return c;
    });
    onComponentsChange(updated);
  };

  const handleRateChange = (id: string, newRate: number) => {
    if (readOnly || !onComponentsChange) return;
    
    const updated = components.map(c => {
      if (c.id === id) {
        return { ...c, rate: newRate, amount: c.qty * newRate };
      }
      return c;
    });
    onComponentsChange(updated);
  };

  if (components.length === 0) {
    return (
      <div className="bill-table-empty">
        No components selected. Please select fee components first.
      </div>
    );
  }

  return (
    <div className="bill-table-container">
      <table className="bill-table">
        <thead>
          <tr>
            <th className="col-sn">S.N.</th>
            <th className="col-desc">Fee Component (Description)</th>
            <th className="col-qty">Qty</th>
            <th className="col-rate">Rate (Rs)</th>
            <th className="col-amount">Amount (Rs)</th>
          </tr>
        </thead>
        <tbody>
          {components.map((component, index) => (
            <tr key={component.id}>
              <td className="col-sn">{index + 1}</td>
              <td className="col-desc">{component.name}</td>
              <td className="col-qty">
                {readOnly ? (
                  component.qty
                ) : (
                  <input
                    type="number"
                    min="1"
                    value={component.qty}
                    onChange={(e) => handleQtyChange(component.id, parseInt(e.target.value) || 1)}
                    className="table-input"
                  />
                )}
              </td>
              <td className="col-rate">
                {readOnly ? (
                  formatNumber(component.rate)
                ) : (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={component.rate}
                    onChange={(e) => handleRateChange(component.id, parseFloat(e.target.value) || 0)}
                    className="table-input"
                  />
                )}
              </td>
              <td className="col-amount">{formatNumber(component.amount)}</td>
            </tr>
          ))}
          {/* Empty rows for visual consistency (up to 10 rows) */}
          {Array.from({ length: Math.max(0, 10 - components.length) }).map((_, index) => (
            <tr key={`empty-${index}`} className="empty-row">
              <td className="col-sn">{components.length + index + 1}</td>
              <td className="col-desc">&nbsp;</td>
              <td className="col-qty">&nbsp;</td>
              <td className="col-rate">&nbsp;</td>
              <td className="col-amount">&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bill-summary">
        <div className="summary-row">
          <span className="summary-label">Sub Total:</span>
          <span className="summary-value">Rs {formatNumber(subTotal)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">VAT ({vatRate}%):</span>
          <span className="summary-value">Rs {formatNumber(vatAmount)}</span>
        </div>
        <div className="summary-row total">
          <span className="summary-label">TOTAL AMOUNT:</span>
          <span className="summary-value total">Rs {formatNumber(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
