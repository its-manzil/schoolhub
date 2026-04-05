"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Layout from '../../../Accounting/components/Layout';
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
import { voucherAPI, convertToBackendFormat } from '../apiService.js';
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

const VOUCHER_TYPES: { type: VoucherType; title: string; icon: React.ComponentType<{ size?: number }>; desc: string; prefix: string }[] = [
  { type: 'JV', title: 'Journal Voucher', icon: BookOpen, desc: 'Non-cash adjustments', prefix: 'JV' },
  { type: 'RCT', title: 'Receipt Voucher', icon: DollarSign, desc: 'Income / Inflows', prefix: 'RCT' },
  { type: 'PR', title: 'Payment Voucher', icon: FileText, desc: 'Expense / Outflows', prefix: 'PR' },
  { type: 'CN', title: 'Contra Voucher', icon: ArrowLeftRight, desc: 'Cash-Bank transfers', prefix: 'CN' },
];

const Voucher = () => {
  /* ── State ── */
  const [selectedType, setSelectedType] = useState<VoucherType>('JV');
  const [voucherStatus, setVoucherStatus] = useState<VoucherStatus>('Draft');
  const [voucherNo, setVoucherNo] = useState('');
  const [date, setDate] = useState(''); // Start with empty BS date
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
  const [focusedFieldIndex, setFocusedFieldIndex] = useState<number>(0); // 0: ledger, 1: debit, 2: credit, 3: description
  const [highlightedLedgerIndex, setHighlightedLedgerIndex] = useState(0);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [showAddLedgerModal, setShowAddLedgerModal] = useState(false);
  const [newLedger, setNewLedger] = useState<Partial<Ledger>>({
    name: '',
    type: 'Cash',
    group: 'Assets'
  });
  
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Keyboard Navigation ── */
  const handleTabNavigation = useCallback((shiftKey: boolean) => {
    if (shiftKey) {
      // Shift+Tab - move backwards
      if (focusedFieldIndex > 0) {
        setFocusedFieldIndex(focusedFieldIndex - 1);
      } else if (focusedRowIndex && focusedRowIndex > 0) {
        setFocusedRowIndex(focusedRowIndex - 1);
        setFocusedFieldIndex(3); // Move to last field of previous row
      }
    } else {
      // Tab - move forwards
      if (focusedFieldIndex < 3) {
        setFocusedFieldIndex(focusedFieldIndex + 1);
      } else if (focusedRowIndex === null || focusedRowIndex < rows.length - 1) {
        const nextRow = focusedRowIndex === null ? 0 : focusedRowIndex + 1;
        setFocusedRowIndex(nextRow);
        setFocusedFieldIndex(0);
      }
    }
  }, [focusedFieldIndex, focusedRowIndex, rows]);

  const handleEnterNavigation = useCallback(() => {
    // Enter key - move to next row
    if (focusedRowIndex !== null && focusedRowIndex < rows.length - 1) {
      setFocusedRowIndex(focusedRowIndex + 1);
      setFocusedFieldIndex(0);
    }
  }, [focusedRowIndex, rows]);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSearchQuery(null);
        setHighlightedLedgerIndex(0);
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

  /* ── Ledger Management ── */
  const addNewLedger = () => {
    if (!newLedger.name?.trim()) {
      addToast('Ledger name is required', 'error');
      return;
    }
    
    const ledger: Ledger = {
      id: Math.random().toString(36).substr(2, 9),
      name: newLedger.name.trim(),
      type: newLedger.type as Ledger['type'],
      group: newLedger.group as Ledger['group']
    };
    
    setLedgers(prev => [...prev, ledger]);
    setNewLedger({ name: '', type: 'Cash', group: 'Assets' });
    setShowAddLedgerModal(false);
    addToast('Ledger added successfully', 'success');
  };
  
  const deleteLedger = (id: string) => {
    setLedgers(prev => prev.filter(ledger => ledger.id !== id));
    addToast('Ledger deleted successfully', 'success');
  };

  /* ── Utility Functions ── */
  const formatBSDate = (value: string): string => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Handle different input lengths
    if (digits.length <= 4) {
      return digits; // Year only
    } else if (digits.length <= 6) {
      // Year-month
      return `${digits.slice(0, 4)}-${digits.slice(4, 6)}`;
    } else {
      // Year-month-day
      return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    }
  };

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastMessage = { id, type, message, duration: 3000 };
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration);
  }, []);

  const validateVoucher = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Check required fields first
    if (!selectedType) {
      errors.push({
        field: 'type',
        message: 'Please select Voucher Type'
      });
    }
    
    if (!date) {
      errors.push({
        field: 'date',
        message: 'Please fill Date'
      });
    }
    
    // Check if there are any entries with data
    const hasValidEntries = rows.some(row => 
      row.ledgerName && (row.debit > 0 || row.credit > 0)
    );
    
    if (!hasValidEntries) {
      errors.push({
        field: 'entries',
        message: 'Please add at least one entry with ledger and amount'
      });
    }
    
    // Check for empty ledgers in rows that have amounts
    rows.forEach((row, index) => {
      if (!row.ledgerName && (row.debit > 0 || row.credit > 0)) {
        errors.push({
          field: 'ledger',
          message: 'Ledger is required',
          rowIndex: index
        });
      }
      
      if (row.ledgerName && row.debit === 0 && row.credit === 0) {
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

  const getFilteredLedgers = useCallback((rowIndex: number, isDebit: boolean): Ledger[] => {
    if (selectedType === 'CN') {
      // Contra: Only Cash/Bank
      return ledgers.filter(ledger => ledger.type === 'Cash' || ledger.type === 'Bank');
    }
    
    if (selectedType === 'RCT') {
      // Receipt: Debit -> Cash/Bank, Credit -> Income/Receivable
      if (isDebit) {
        return ledgers.filter(ledger => ledger.type === 'Cash' || ledger.type === 'Bank');
      } else {
        return ledgers.filter(ledger => ledger.type === 'Income' || ledger.type === 'Asset');
      }
    }
    
    if (selectedType === 'PR') {
      // Payment: Debit -> Expense, Credit -> Cash/Bank
      if (isDebit) {
        return ledgers.filter(ledger => ledger.type === 'Expense');
      } else {
        return ledgers.filter(ledger => ledger.type === 'Cash' || ledger.type === 'Bank');
      }
    }
    
    // Journal: No restrictions
    return ledgers;
  }, [selectedType, ledgers]);

  const getLedgerGroups = useCallback((ledgers: Ledger[]): Record<string, Ledger[]> => {
    return ledgers.reduce((groups, ledger) => {
      if (!groups[ledger.group]) {
        groups[ledger.group] = [];
      }
      groups[ledger.group].push(ledger);
      return groups;
    }, {} as Record<string, Ledger[]>);
  }, []);

  const getLedgerTypeColor = (type: string): string => {
    const colors = {
      'Cash': '#10b981',
      'Bank': '#3b82f6', 
      'Income': '#22c55e',
      'Expense': '#ef4444',
      'Asset': '#f59e0b',
      'Liability': '#8b5cf6',
      'Equity': '#06b6d4'
    };
    return colors[type as keyof typeof colors] || '#6b7280';
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

  const updateRow = useCallback((index: number, field: keyof VoucherEntryRow, value: string | number) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value, hasError: false, errorMessage: undefined };
    
    // Enforce debit/credit exclusivity per row
    if (field === 'debit' && Number(value) > 0) {
      newRows[index].credit = 0;
    }
    if (field === 'credit' && Number(value) > 0) {
      newRows[index].debit = 0;
    }
    
    setRows(newRows);
  }, [rows]);


  /* ── Voucher Behavior Rules ── */
  const handleLedgerSelect = useCallback((index: number, ledger: Ledger) => {
    // Check if ledger is valid for this voucher type and position
    const isDebit = rows[index].debit > 0 || (rows[index].debit === 0 && rows[index].credit === 0);
    const filteredLedgers = getFilteredLedgers(index, isDebit);
    const isValidLedger = filteredLedgers.find(l => l.id === ledger.id);
    
    if (!isValidLedger) {
      addToast(`Invalid ledger for ${selectedType} voucher`, 'error');
      return;
    }
    
    updateRow(index, 'ledgerId', ledger.id);
    updateRow(index, 'ledgerName', ledger.name);
    setSearchQuery(null);
  }, [rows, getFilteredLedgers, selectedType, addToast, updateRow]);

  /* ── Keyboard Navigation with proper dependencies ── */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (searchQuery) {
        // Handle dropdown navigation
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          // Navigate down in dropdown
          setHighlightedLedgerIndex(prev => {
            const isDebit = rows[searchQuery.index].debit > 0 || (rows[searchQuery.index].debit === 0 && rows[searchQuery.index].credit === 0);
            const filteredLedgers = getFilteredLedgers(searchQuery.index, isDebit);
            const groupedLedgers = getLedgerGroups(filteredLedgers);
            const allLedgers = Object.values(groupedLedgers).flat();
            return Math.min(prev + 1, allLedgers.length - 1);
          });
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          // Navigate up in dropdown
          setHighlightedLedgerIndex(prev => Math.max(prev - 1, 0));
        } else if (event.key === 'Enter') {
          event.preventDefault();
          // Select highlighted option
          const isDebit = rows[searchQuery.index].debit > 0 || (rows[searchQuery.index].debit === 0 && rows[searchQuery.index].credit === 0);
          const filteredLedgers = getFilteredLedgers(searchQuery.index, isDebit);
          const groupedLedgers = getLedgerGroups(filteredLedgers);
          const allLedgers = Object.values(groupedLedgers).flat();
          
          if (allLedgers[highlightedLedgerIndex]) {
            handleLedgerSelect(searchQuery.index, allLedgers[highlightedLedgerIndex]);
          }
        } else if (event.key === 'Escape') {
          event.preventDefault();
          setSearchQuery(null);
          setHighlightedLedgerIndex(0);
        }
        return;
      }

      // Handle table navigation
      if (event.key === 'Tab') {
        event.preventDefault();
        handleTabNavigation(event.shiftKey);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        handleEnterNavigation();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, handleTabNavigation, handleEnterNavigation, highlightedLedgerIndex, rows, getFilteredLedgers, getLedgerGroups, handleLedgerSelect]);

  const handlePostVoucher = async () => {
    if (voucherStatus === 'Posted') {
      addToast('Voucher is already posted', 'warning');
      return;
    }
    
    const errors = validateVoucher();
    if (errors.length > 0) {
      setValidationErrors(errors);
      
      // Show the first error as a toast for better UX
      const firstError = errors[0];
      addToast(firstError.message, 'error');
      
      // Focus on the first field with error
      if (firstError.field === 'type') {
        // Focus on voucher type selection
        document.querySelector('.ve-type-card')?.scrollIntoView({ behavior: 'smooth' });
      } else if (firstError.field === 'date') {
        // Focus on date field
        document.getElementById('date-field')?.scrollIntoView({ behavior: 'smooth' });
      } else if (firstError.field === 'entries' && firstError.rowIndex !== undefined) {
        // Focus on specific row
        const fieldId = `field-${firstError.rowIndex}-ledger`;
        document.getElementById(fieldId)?.scrollIntoView({ behavior: 'smooth' });
      }
      
      return;
    }
    
    setIsPosting(true);
    setValidationErrors([]);
    
    try {
      // Convert frontend format to backend format
      const backendVoucher = convertToBackendFormat({
        selectedType,
        date,
        fiscalYear: '2082/83',
        refNo,
        narration,
        rows
      });

      console.log('Sending voucher data:', backendVoucher); // Debug log

      // Call API to post voucher
      const response = await voucherAPI.createDraft(backendVoucher);
      
      console.log('API response:', response); // Debug log
      
      if (response.success) {
        // Then post the created voucher
        const postResponse = await voucherAPI.postVoucher(response.data._id);
        
        if (postResponse.success) {
          setVoucherStatus('Posted');
          setVoucherNo(postResponse.data.voucherNo);
          addToast('Voucher posted successfully!', 'success');
        } else {
          throw new Error(postResponse.message || 'Failed to post voucher');
        }
      } else {
        throw new Error(response.message || 'Failed to create voucher');
      }
    } catch (error) {
      console.error('Post voucher error:', error);
      addToast((error as Error).message || 'Failed to post voucher', 'error');
    } finally {
      setIsPosting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (voucherStatus === 'Posted') {
      addToast('Cannot save draft of posted voucher', 'warning');
      return;
    }
    
    try {
      // Convert frontend format to backend format
      const backendVoucher = convertToBackendFormat({
        selectedType,
        date,
        fiscalYear: '2082/83',
        refNo,
        narration,
        rows
      });

      // Call API to save draft
      const response = await voucherAPI.createDraft(backendVoucher);
      
      if (response.success) {
        setVoucherNo(response.data.voucherNo);
        addToast('Draft saved successfully', 'success');
      } else {
        throw new Error(response.message || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Save draft error:', error);
      addToast((error as Error).message || 'Failed to save draft', 'error');
    }
  };

  /* ── Keyboard Navigation with proper dependencies ── */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (searchQuery) {
        // Handle dropdown navigation
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          // Navigate down in dropdown
          setHighlightedLedgerIndex(prev => {
            const isDebit = rows[searchQuery.index].debit > 0 || (rows[searchQuery.index].debit === 0 && rows[searchQuery.index].credit === 0);
            const filteredLedgers = getFilteredLedgers(searchQuery.index, isDebit);
            const groupedLedgers = getLedgerGroups(filteredLedgers);
            const allLedgers = Object.values(groupedLedgers).flat();
            return Math.min(prev + 1, allLedgers.length - 1);
          });
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          // Navigate up in dropdown
          setHighlightedLedgerIndex(prev => Math.max(prev - 1, 0));
        } else if (event.key === 'Enter') {
          event.preventDefault();
          // Select highlighted option
          const isDebit = rows[searchQuery.index].debit > 0 || (rows[searchQuery.index].debit === 0 && rows[searchQuery.index].credit === 0);
          const filteredLedgers = getFilteredLedgers(searchQuery.index, isDebit);
          const groupedLedgers = getLedgerGroups(filteredLedgers);
          const allLedgers = Object.values(groupedLedgers).flat();
          
          if (allLedgers[highlightedLedgerIndex]) {
            handleLedgerSelect(searchQuery.index, allLedgers[highlightedLedgerIndex]);
          }
        } else if (event.key === 'Escape') {
          event.preventDefault();
          setSearchQuery(null);
          setHighlightedLedgerIndex(0);
        }
        return;
      }

      // Handle table navigation
      if (event.key === 'Tab') {
        event.preventDefault();
        handleTabNavigation(event.shiftKey);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        handleEnterNavigation();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, handleTabNavigation, handleEnterNavigation, highlightedLedgerIndex, rows, getFilteredLedgers, getLedgerGroups, handleLedgerSelect]);

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

        {/* ── Ledger Management ── */}
        <div className="ve-ledger-management">
          <div className="ve-ledger-header">
            <h3>Manage Ledgers</h3>
            <button className="ve-btn ve-btn-primary" onClick={() => setShowAddLedgerModal(true)}>
              <Plus size={16} /> Add New Ledger
            </button>
          </div>
          
          {ledgers.length === 0 ? (
            <div className="ve-empty-ledgers">
              <p>No ledgers available. Add your first ledger to get started.</p>
            </div>
          ) : (
            <div className="ve-ledger-list">
              {ledgers.map((ledger) => (
                <div key={ledger.id} className="ve-ledger-item">
                  <div className="ve-ledger-info">
                    <span className="ve-ledger-name">{ledger.name}</span>
                    <span className="ve-ledger-type" style={{ backgroundColor: getLedgerTypeColor(ledger.type) }}>
                      {ledger.type}
                    </span>
                    <span className="ve-ledger-group">{ledger.group}</span>
                  </div>
                  <button className="ve-btn-delete" onClick={() => deleteLedger(ledger.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
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
              <label>Date (BS) *</label>
              <input 
                id="date-field"
                type="text" 
                className={`ve-input ${!date && validationErrors.some(e => e.field === 'date') ? 've-input-error' : ''}`}
                placeholder="YYYY-MM-DD"
                value={date} 
                onChange={(e) => {
                  const formattedDate = formatBSDate(e.target.value);
                  setDate(formattedDate);
                }} 
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
                            id={`field-${index}-ledger`}
                            type="text" 
                            className="ve-input" 
                            placeholder="Enter ledger account name..."
                            value={row.ledgerName}
                            onChange={(e) => {
                              // Allow any text entry - no need to pre-add ledgers
                              const value = e.target.value;
                              console.log('Input value:', value); // Debug log
                              
                              // Update the row directly with any text
                              const newRows = [...rows];
                              newRows[index] = { ...newRows[index], ledgerName: value, ledgerId: value };
                              setRows(newRows);
                            }}
                            onFocus={() => {
                              console.log('Input focused'); // Debug log
                              setFocusedRowIndex(index);
                              setFocusedFieldIndex(0);
                            }}
                            readOnly={voucherStatus === 'Posted'}
                          />
                        </div>
                      </td>
                      <td>
                        <input 
                          id={`field-${index}-debit`}
                          type="number" 
                          className="ve-input ve-input-amount" 
                          placeholder="0.00"
                          value={row.debit || ''} 
                          onChange={(e) => updateRow(index, 'debit', parseFloat(e.target.value) || 0)}
                          onBlur={(e) => !e.target.value && updateRow(index, 'debit', 0)}
                          onFocus={() => {
                            setFocusedRowIndex(index);
                            setFocusedFieldIndex(1);
                          }}
                          disabled={voucherStatus === 'Posted'}
                        />
                      </td>
                      <td>
                        <input 
                          id={`field-${index}-credit`}
                          type="number" 
                          className="ve-input ve-input-amount" 
                          placeholder="0.00"
                          value={row.credit || ''} 
                          onChange={(e) => updateRow(index, 'credit', parseFloat(e.target.value) || 0)}
                          onBlur={(e) => !e.target.value && updateRow(index, 'credit', 0)}
                          onFocus={() => {
                            setFocusedRowIndex(index);
                            setFocusedFieldIndex(2);
                          }}
                          disabled={voucherStatus === 'Posted'}
                        />
                      </td>
                      <td>
                        <input 
                          id={`field-${index}-description`}
                          type="text" 
                          className="ve-input" 
                          placeholder="Line description..." 
                          value={row.description}
                          onChange={(e) => updateRow(index, 'description', e.target.value)}
                          onFocus={() => {
                            setFocusedRowIndex(index);
                            setFocusedFieldIndex(3);
                          }}
                          disabled={voucherStatus === 'Posted'}
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
              {difference !== 0 && (
                <div className="ve-summary-item ve-auto-balance-hint">
                  <span className="ve-summary-label">Auto-Balance</span>
                  <span className="ve-summary-hint">
                    Last empty row will be filled automatically
                  </span>
                </div>
              )}
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
                    <Send size={16} /> Post Voucher
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

        {/* Add Ledger Modal */}
        {showAddLedgerModal && (
          <div className="ve-modal-overlay">
            <div className="ve-modal">
              <div className="ve-modal-header">
                <h3>Add New Ledger</h3>
                <button className="ve-modal-close" onClick={() => setShowAddLedgerModal(false)}>
                  ×
                </button>
              </div>
              <div className="ve-modal-body">
                <div className="ve-field-group">
                  <label>Ledger Name *</label>
                  <input
                    type="text"
                    className="ve-input"
                    value={newLedger.name || ''}
                    onChange={(e) => setNewLedger(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter ledger name"
                  />
                </div>
                <div className="ve-field-group">
                  <label>Ledger Type</label>
                  <select
                    className="ve-input"
                    value={newLedger.type || 'Cash'}
                    onChange={(e) => setNewLedger(prev => ({ ...prev, type: e.target.value as Ledger['type'] }))}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                    <option value="Equity">Equity</option>
                  </select>
                </div>
                <div className="ve-field-group">
                  <label>Ledger Group</label>
                  <select
                    className="ve-input"
                    value={newLedger.group || 'Assets'}
                    onChange={(e) => setNewLedger(prev => ({ ...prev, group: e.target.value as Ledger['group'] }))}
                  >
                    <option value="Assets">Assets</option>
                    <option value="Liabilities">Liabilities</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
              </div>
              <div className="ve-modal-footer">
                <button className="ve-btn ve-btn-secondary" onClick={() => setShowAddLedgerModal(false)}>
                  Cancel
                </button>
                <button className="ve-btn ve-btn-primary" onClick={addNewLedger}>
                  Add Ledger
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Voucher;
