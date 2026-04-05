"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from '../components/Layout';
import { 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  X, 
  FileText, 
  DollarSign, 
  ArrowLeftRight, 
  BookOpen,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronDown
} from "lucide-react";
import './VoucherEntry.css';

/* ── Types ── */
type VoucherType = 'JV' | 'RCT' | 'PR' | 'CN';

interface VoucherEntryRow {
  id: string;
  ledgerId: string;
  ledgerName: string;
  debit: number;
  credit: number;
  description: string;
}

interface Ledger {
  id: string;
  name: string;
  type: 'Cash' | 'Bank' | 'Income' | 'Expense' | 'Asset' | 'Liability' | 'Equity';
}

/* ── Mock Data ── */
const MOCK_LEDGERS: Ledger[] = [
  { id: '1', name: 'Cash in Hand', type: 'Cash' },
  { id: '2', name: 'Global IME Bank', type: 'Bank' },
  { id: '3', name: 'Tuition Fee Income', type: 'Income' },
  { id: '4', name: 'Bus Fee Income', type: 'Income' },
  { id: '5', name: 'Electricity Expense', type: 'Expense' },
  { id: '6', name: 'Salary Expense', type: 'Expense' },
  { id: '7', name: 'Office Supplies', type: 'Expense' },
  { id: '8', name: 'Computer Equipment', type: 'Asset' },
  { id: '9', name: 'Accounts Payable', type: 'Liability' },
  { id: '10', name: 'School Building', type: 'Asset' },
  { id: '11', name: 'Rent Expense', type: 'Expense' },
  { id: '12', name: 'Exam Fee Income', type: 'Income' },
];

const VOUCHER_TYPES: { type: VoucherType; title: string; icon: any; desc: string; prefix: string }[] = [
  { type: 'JV', title: 'Journal Voucher', icon: BookOpen, desc: 'Non-cash adjustments', prefix: 'JV' },
  { type: 'RCT', title: 'Receipt Voucher', icon: DollarSign, desc: 'Income / Inflows', prefix: 'RCT' },
  { type: 'PR', title: 'Payment Voucher', icon: FileText, desc: 'Expense / Outflows', prefix: 'PR' },
  { type: 'CN', title: 'Contra Voucher', icon: ArrowLeftRight, desc: 'Cash-Bank transfers', prefix: 'CN' },
];

const VoucherEntry = () => {
  /* ── State ── */
  const [selectedType, setSelectedType] = useState<VoucherType>('JV');
  const [voucherNo, setVoucherNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [refNo, setRefNo] = useState('');
  const [narration, setNarration] = useState('');
  const [rows, setRows] = useState<VoucherEntryRow[]>([
    { id: '1', ledgerId: '', ledgerName: '', debit: 0, credit: 0, description: '' },
    { id: '2', ledgerId: '', ledgerName: '', debit: 0, credit: 0, description: '' },
  ]);
  const [searchQuery, setSearchQuery] = useState<{ index: number; query: string } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

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

  const updateRow = (index: number, field: keyof VoucherEntryRow, value: any) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    
    // Logic: Debit and Credit are mutually exclusive in the same row
    if (field === 'debit' && value > 0) newRows[index].credit = 0;
    if (field === 'credit' && value > 0) newRows[index].debit = 0;
    
    setRows(newRows);
  };

  /* ── Voucher Behavior Rules ── */
  const handleLedgerSelect = (index: number, ledger: Ledger) => {
    // 1. Contra Rule: Only Cash/Bank
    if (selectedType === 'CN' && ledger.type !== 'Cash' && ledger.type !== 'Bank') {
      alert("Contra vouchers only allow Cash and Bank accounts.");
      return;
    }

    // 2. Receipt Rule: Debit must be Cash/Bank (if debit row)
    // For simplicity, we just set the values. In a real system, we might validate on Post.
    
    updateRow(index, 'ledgerId', ledger.id);
    updateRow(index, 'ledgerName', ledger.name);
    setSearchQuery(null);
  };

  /* ── Searchable Filter ── */
  const filteredLedgers = useMemo(() => {
    if (!searchQuery) return [];
    return MOCK_LEDGERS.filter(l => 
      l.name.toLowerCase().includes(searchQuery.query.toLowerCase())
    );
  }, [searchQuery]);

  /* ── Actions ── */
  const handlePost = () => {
    if (!isBalanced) return;
    alert(`Voucher ${voucherNo} posted successfully!`);
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
                <div className="ve-type-icon"><Icon size={20} /></div>
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
              <label>Date (BS Placeholder)</label>
              <input 
                type="date" 
                className="ve-input" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
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
                            className="ve-input" 
                            placeholder="Type to search account..."
                            value={row.ledgerName}
                            onChange={(e) => {
                              updateRow(index, 'ledgerName', e.target.value);
                              setSearchQuery({ index, query: e.target.value });
                            }}
                            onFocus={() => {
                              setSearchQuery({ index, query: row.ledgerName });
                            }}
                          />
                          {searchQuery?.index === index && filteredLedgers.length > 0 && (
                            <div className="ve-ledger-results">
                              {filteredLedgers.map(l => (
                                <div 
                                  key={l.id} 
                                  className="ve-ledger-option"
                                  onClick={() => handleLedgerSelect(index, l)}
                                >
                                  <span>{l.name}</span>
                                  <span className="ve-ledger-type">{l.type}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="ve-input ve-input-amount" 
                          placeholder="0.00"
                          value={row.debit || ''} 
                          onChange={(e) => updateRow(index, 'debit', parseFloat(e.target.value))}
                          onBlur={(e) => !e.target.value && updateRow(index, 'debit', 0)}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="ve-input ve-input-amount" 
                          placeholder="0.00"
                          value={row.credit || ''} 
                          onChange={(e) => updateRow(index, 'credit', parseFloat(e.target.value))}
                          onBlur={(e) => !e.target.value && updateRow(index, 'credit', 0)}
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="ve-input" 
                          placeholder="Line description..." 
                          value={row.description}
                          onChange={(e) => updateRow(index, 'description', e.target.value)}
                        />
                      </td>
                      <td>
                        <button className="ve-btn-delete" title="Remove Row" onClick={() => removeRow(row.id)}>
                          <Trash2 size={16} />
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
              <button className="ve-btn ve-btn-outline">
                <Save size={16} /> Save as Draft
              </button>
              <button 
                className="ve-btn ve-btn-primary" 
                disabled={!isBalanced}
                onClick={handlePost}
              >
                <Send size={16} /> Post Voucher
              </button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default VoucherEntry;
