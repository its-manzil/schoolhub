"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from '../../Accounting/components/Layout';
import { 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  FileText, 
  DollarSign, 
  ArrowLeftRight, 
  BookOpen,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Edit
} from "lucide-react";
import './VoucherEntry.css';

/* ── Types ── */
type VoucherType = 'JV' | 'RCT' | 'PR' | 'CN';
type VoucherStatus = 'Draft' | 'Posted';

interface VoucherEntryRow {
  id: string;
  ledgerId: string;
  ledgerName: string;
  debit: number;
  credit: number;
  description: string;
  hasError?: boolean;
  errorMessage?: string;
}

interface Ledger {
  id: string;
  name: string;
  type: 'Cash' | 'Bank' | 'Income' | 'Expense' | 'Asset' | 'Liability' | 'Equity';
  group: 'Assets' | 'Liabilities' | 'Income' | 'Expense';
}

interface ValidationError {
  field: string;
  message: string;
  rowIndex?: number;
}

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

/* ── Mock Data ── */
const VOUCHER_TYPES: { type: VoucherType; title: string; icon: React.ComponentType; desc: string; prefix: string }[] = [
  { type: 'JV', title: 'Journal Voucher', icon: BookOpen, desc: 'Non-cash adjustments', prefix: 'JV' },
  { type: 'RCT', title: 'Receipt Voucher', icon: DollarSign, desc: 'Income / Inflows', prefix: 'RCT' },
  { type: 'PR', title: 'Payment Voucher', icon: FileText, desc: 'Expense / Outflows', prefix: 'PR' },
  { type: 'CN', title: 'Contra Voucher', icon: ArrowLeftRight, desc: 'Cash-Bank transfers', prefix: 'CN' },
];

const VoucherEntry = () => {
  /* ── State ── */
  const [selectedType, setSelectedType] = useState<VoucherType>('JV');
  const [voucherStatus, setVoucherStatus] = useState<VoucherStatus>('Draft');
  const [voucherNo, setVoucherNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [refNo, setRefNo] = useState('');
  const [narration, setNarration] = useState('');
  const [rows, setRows] = useState<VoucherEntryRow[]>([
    { id: '1', ledgerId: '', ledgerName: '', debit: 0, credit: 0, description: '' },
    { id: '2', ledgerId: '', ledgerName: '', debit: 0, credit: 0, description: '' },
  ]);
  const [searchQuery, setSearchQuery] = useState<{ index: number; query: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const [focusedFieldIndex, setFocusedFieldIndex] = useState<number>(0);
  
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Keyboard Navigation ── */
  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, fieldIndex: number) => {
    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          // Shift+Tab - go to previous field
          if (fieldIndex > 0) {
            setFocusedFieldIndex(fieldIndex - 1);
          } else if (rowIndex > 0) {
            setFocusedRowIndex(rowIndex - 1);
            setFocusedFieldIndex(3); // Last field in previous row
          }
        } else {
          // Tab - go to next field
          if (fieldIndex < 3) {
            setFocusedFieldIndex(fieldIndex + 1);
          } else if (rowIndex < rows.length - 1) {
            setFocusedRowIndex(rowIndex + 1);
            setFocusedFieldIndex(0); // First field in next row
          }
        }
        break;
        
      case 'Enter':
        e.preventDefault();
        if (fieldIndex < 3) {
          setFocusedFieldIndex(fieldIndex + 1);
        } else if (rowIndex < rows.length - 1) {
          setFocusedRowIndex(rowIndex + 1);
          setFocusedFieldIndex(0);
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (rowIndex > 0) {
          setFocusedRowIndex(rowIndex - 1);
        }
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        if (rowIndex < rows.length - 1) {
          setFocusedRowIndex(rowIndex + 1);
        }
        break;
        
      case 'Escape':
        setSearchQuery(null);
        setFocusedFieldIndex(0);
        break;
    }
  };

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSearchQuery(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── Auto-generate Voucher Number ── */
  useEffect(() => {
    const fiscalYear = "2082"; // Hardcoded for demo
    const sequence = "0001"; // Mocked sequence
    setVoucherNo(`${selectedType}-${fiscalYear}-${sequence}`);
  }, [selectedType]);

  /* ── Calculations ── */
  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => ({
        debit: acc.debit + (Number(row.debit) || 0),
        credit: acc.credit + (Number(row.credit) || 0),
      }),
      { debit: 0, credit: 0 }
    );
  }, [rows]);

  const difference = Math.abs(totals.debit - totals.credit);
  const isBalanced = totals.debit > 0 && totals.debit === totals.credit;

  /* ── Utility Functions ── */
  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastMessage = { id, type, message, duration: 3000 };
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration);
  };

  const validateVoucher = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Check for empty ledgers
    rows.forEach((row, index) => {
      if (!row.ledgerId && (row.debit > 0 || row.credit > 0)) {
        errors.push({
          field: 'ledger',
          message: 'Ledger is required',
          rowIndex: index
        });
      }
      
      if (row.ledgerId && row.debit === 0 && row.credit === 0) {
        errors.push({
          field: 'amount',
          message: 'Amount is required',
          rowIndex: index
        });
      }
    });
    
    // Check balance
    if (!isBalanced && totals.debit > 0) {
      errors.push({
        field: 'balance',
        message: 'Debit and Credit must be equal'
      });
    }
    
    return errors;
  };



  const getLedgerTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'Cash': '#10b981',
      'Bank': '#3b82f6', 
      'Income': '#22c55e',
      'Expense': '#ef4444',
      'Asset': '#f59e0b',
      'Liability': '#8b5cf6',
      'Equity': '#06b6d4'
    };
    return colors[type] || '#6b7280';
  };

  const autoBalanceLastRow = () => {
    if (rows.length === 0) return;
    
    const lastRow = rows[rows.length - 1];
    if (!lastRow.ledgerId && !lastRow.ledgerName) {
      const diff = totals.debit - totals.credit;
      if (diff > 0) {
        updateRow(rows.length - 1, 'credit', diff);
      } else if (diff < 0) {
        updateRow(rows.length - 1, 'debit', Math.abs(diff));
      }
    }
  };

  /* ── Row Management ── */
  const addRow = () => {
    setRows([...rows, { 
      id: Math.random().toString(36).substr(2, 9), 
      ledgerId: '', 
      ledgerName: '', 
      debit: 0, 
      credit: 0, 
      description: '' 
    }]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 2) {
      setRows(rows.filter(row => row.id !== id));
    }
  };

  const updateRow = (index: number, field: keyof VoucherEntryRow, value: string | number) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value, hasError: false, errorMessage: undefined };
    
    // Logic: Debit and Credit are mutually exclusive in the same row
    if (field === 'debit' && typeof value === 'number' && value > 0) newRows[index].credit = 0;
    if (field === 'credit' && typeof value === 'number' && value > 0) newRows[index].debit = 0;
    
    setRows(newRows);
    
    // Auto-balance if this is the last row and it's empty
    setTimeout(() => autoBalanceLastRow(), 100);
  };

  /* ── Voucher Behavior Rules ── */
  const handleLedgerSelect = (index: number, ledger: Ledger) => {
    // For manual entry, just set the ledger name
    updateRow(index, 'ledgerId', ledger.id);
    updateRow(index, 'ledgerName', ledger.name);
    setSearchQuery(null);
  };

  const handlePostVoucher = async () => {
    if (voucherStatus === 'Posted') {
      addToast('Voucher is already posted', 'warning');
      return;
    }
    
    const errors = validateVoucher();
    if (errors.length > 0) {
      setValidationErrors(errors);
      addToast('Please fix validation errors', 'error');
      return;
    }
    
    setIsPosting(true);
    setValidationErrors([]);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setVoucherStatus('Posted');
      addToast('Voucher posted successfully!', 'success');
    } catch {
      addToast('Failed to post voucher', 'error');
    } finally {
      setIsPosting(false);
    }
  };

  const handleSaveDraft = () => {
    if (voucherStatus === 'Posted') {
      addToast('Cannot save draft of posted voucher', 'warning');
      return;
    }
    
    addToast('Draft saved successfully', 'success');
  };

  return (
    <Layout>
      <div className="ve-container" ref={containerRef}>
        
        {/* ── Voucher Type Selector ── */}
        <div className="ve-type-selector">
          {VOUCHER_TYPES.map((v) => {
            const Icon = v.icon;
            return (
              <div 
                key={v.type} 
                className={`ve-type-card ${selectedType === v.type ? 'active' : ''}`}
                onClick={() => setSelectedType(v.type)}
              >
                <div className="ve-type-icon"><Icon /></div>
                <div className="ve-type-info">
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Voucher Form ── */}
        <div className="ve-form-card">
          
          {/* Header Section */}
          <div className="ve-form-header">
            <div className="ve-field-group">
              <label>Voucher Type</label>
              <input type="text" className="ve-input" value={selectedType} disabled />
            </div>
            <div className="ve-field-group">
              <label>Voucher Number</label>
              <input type="text" className="ve-input" value={voucherNo} disabled />
            </div>
            <div className="ve-field-group">
              <label>Status</label>
              <div className={`ve-status-badge ve-status-${voucherStatus.toLowerCase()}`}>
                {voucherStatus === 'Draft' ? <Edit size={16} /> : <CheckCircle2 size={16} />}
                {voucherStatus}
              </div>
            </div>
            <div className="ve-field-group">
              <label>Date (BS Placeholder)</label>
              <input 
                type="date" 
                className="ve-input" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                disabled={voucherStatus === 'Posted'}
              />
            </div>
            <div className="ve-field-group">
              <label>Fiscal Year</label>
              <input type="text" className="ve-input" value="2082/83" disabled />
            </div>
            <div className="ve-field-group">
              <label>Reference Number</label>
              <input 
                type="text" 
                className="ve-input" 
                placeholder="Optional Ref..." 
                value={refNo} 
                onChange={(e) => setRefNo(e.target.value)} 
                disabled={voucherStatus === 'Posted'}
              />
            </div>
          </div>

          {/* Entry Table Section */}
          <div className="ve-table-section">
            <div className="ve-table-container">
              <table className="ve-table">
                <thead>
                  <tr>
                    <th style={{ width: '35%' }}>Ledger Account</th>
                    <th style={{ width: '15%' }}>Debit Amount</th>
                    <th style={{ width: '15%' }}>Credit Amount</th>
                    <th>Description</th>
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id}>
                      <td>
                        <div className="ve-ledger-select-wrapper">
                          <input 
                            type="text" 
                            className={`ve-input ${focusedRowIndex === index && focusedFieldIndex === 0 ? 'focused' : ''}`}
                            placeholder="Type to search account..."
                            value={row.ledgerName}
                            onChange={(e) => {
                              updateRow(index, 'ledgerName', e.target.value);
                              setSearchQuery({ index, query: e.target.value });
                            }}
                            onFocus={() => {
                              setFocusedRowIndex(index);
                              setFocusedFieldIndex(0);
                              setSearchQuery({ index, query: row.ledgerName });
                            }}
                            onKeyDown={(e) => handleKeyDown(e, index, 0)}
                            disabled={voucherStatus === 'Posted'}
                          />
                          {searchQuery?.index === index && searchQuery.query && (
                            <div className="ve-ledger-results">
                              <div className="ve-ledger-option" onClick={() => {
                                // Create a new ledger entry
                                const newLedger: Ledger = {
                                  id: `custom-${Date.now()}`,
                                  name: searchQuery.query,
                                  type: 'Asset', // Default type
                                  group: 'Assets'
                                };
                                handleLedgerSelect(index, newLedger);
                              }}>
                                <span>Create &quot;{searchQuery.query}&quot;</span>
                                <span className="ve-ledger-type" style={{ backgroundColor: getLedgerTypeColor('Asset') }}>
                                  New
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <input 
                            type="number" 
                            className={`ve-input ve-input-amount ${focusedRowIndex === index && focusedFieldIndex === 1 ? 'focused' : ''}`}
                            placeholder="0.00"
                            value={row.debit || ''} 
                            onChange={(e) => updateRow(index, 'debit', parseFloat(e.target.value))}
                            onBlur={(e) => !e.target.value && updateRow(index, 'debit', 0)}
                            onFocus={() => {
                              setFocusedRowIndex(index);
                              setFocusedFieldIndex(1);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, index, 1)}
                            disabled={voucherStatus === 'Posted'}
                          />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className={`ve-input ve-input-amount ${focusedRowIndex === index && focusedFieldIndex === 2 ? 'focused' : ''}`}
                          placeholder="0.00"
                          value={row.credit || ''} 
                          onChange={(e) => updateRow(index, 'credit', parseFloat(e.target.value))}
                          onBlur={(e) => !e.target.value && updateRow(index, 'credit', 0)}
                          onFocus={() => {
                            setFocusedRowIndex(index);
                            setFocusedFieldIndex(2);
                          }}
                          onKeyDown={(e) => handleKeyDown(e, index, 2)}
                          disabled={voucherStatus === 'Posted'}
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className={`ve-input ${focusedRowIndex === index && focusedFieldIndex === 3 ? 'focused' : ''}`}
                          placeholder="Line description..." 
                          value={row.description}
                          onChange={(e) => updateRow(index, 'description', e.target.value)}
                          onFocus={() => {
                            setFocusedRowIndex(index);
                            setFocusedFieldIndex(3);
                          }}
                          onKeyDown={(e) => handleKeyDown(e, index, 3)}
                          disabled={voucherStatus === 'Posted'}
                        />
                      </td>
                      <td>
                        <button className="ve-btn-delete" title="Remove Row" onClick={() => removeRow(row.id)}>
                            <Trash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="ve-add-row-container">
            <button className="ve-btn-add" onClick={addRow}>
              <Plus size={16} /> Add New Row
            </button>
          </div>

          {/* Details Section */}
          <div className="ve-form-details">
            <div className="ve-field-group">
              <label>Narration</label>
              <textarea 
                className="ve-textarea" 
                placeholder="Write voucher narration here..."
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
              ></textarea>
            </div>
            <div className="ve-field-group">
              <label>Attachments</label>
              <div className="ve-file-upload">
                <Paperclip size={18} />
                <p>Click to upload or drag files</p>
                <input type="file" style={{ display: 'none' }} id="ve-file" />
              </div>
            </div>
          </div>

          {/* Footer Area with Summary & Actions */}
          <div className="ve-form-footer">
            <div className="ve-summary-grid">
              <div className="ve-summary-item">
                <span className="ve-summary-label">Total Debit</span>
                <span className="ve-summary-value">NPR {totals.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ve-summary-item">
                <span className="ve-summary-label">Total Credit</span>
                <span className="ve-summary-value">NPR {totals.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="ve-summary-item">
                <span className="ve-summary-label">Difference</span>
                <span className={`ve-summary-value ${difference !== 0 ? 'error' : ''}`}>
                  NPR {difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="ve-summary-item">
                <span className="ve-summary-label">Balance Status</span>
                <div className={`ve-summary-status ${isBalanced ? 'status-balanced' : 'status-unbalanced'}`}>
                  {isBalanced ? (
                    <><CheckCircle2 size={16} /> Balanced</>
                  ) : (
                    <><AlertCircle size={16} /> Unbalanced</>
                  )}
                </div>
              </div>
            </div>

            <div className="ve-actions">
              <button className="ve-btn ve-btn-secondary">Cancel</button>
              <button 
                className="ve-btn ve-btn-outline"
                onClick={handleSaveDraft}
                disabled={voucherStatus === 'Posted' || isPosting}
              >
                <Save size={16} /> Save as Draft
              </button>
              <button 
                className="ve-btn ve-btn-primary" 
                disabled={!isBalanced || voucherStatus === 'Posted' || isPosting}
                onClick={handlePostVoucher}
              >
                {isPosting ? (
                  <>
                    <div className="ve-spinner"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <Send /> Post Voucher
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Toast Messages */}
        <div className="ve-toast-container">
          {toasts.map(toast => (
            <div 
              key={toast.id} 
              className={`ve-toast ve-toast-${toast.type}`}
            >
              {toast.type === 'success' && <CheckCircle2 size={16} />}
              {toast.type === 'error' && <AlertCircle size={16} />}
              {toast.type === 'warning' && <AlertCircle size={16} />}
              {toast.type === 'info' && <AlertCircle size={16} />}
              <span>{toast.message}</span>
            </div>
          ))}
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="ve-validation-errors">
            <h4>Please fix the following errors:</h4>
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>
                  {error.rowIndex !== undefined && `Row ${error.rowIndex + 1}: `}
                  {error.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VoucherEntry;
