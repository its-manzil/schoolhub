// VoucherTable Component
// Main voucher entry table with ledger search integration

'use client';

import React, { useCallback } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { VoucherEntryRow } from '../../hooks/useVoucher';
import { Ledger, VoucherType } from '../../services/ledger.service';
import LedgerSearchDropdown from './LedgerSearchDropdown';

interface VoucherTableProps {
  rows: VoucherEntryRow[];
  onUpdateRow: (index: number, field: keyof VoucherEntryRow, value: string | number) => void;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
  voucherType: VoucherType;
  isPosted: boolean;
  searchQueries: Map<number, { query: string; isOpen: boolean; highlightedIndex: number; results: Ledger[]; isLoading: boolean; error: string | null }>;
  onSearchQueryChange: (rowIndex: number, query: string) => void;
  onSearchOpenChange: (rowIndex: number, isOpen: boolean) => void;
  onSearchHighlightedIndexChange: (rowIndex: number, index: number) => void;
  onLedgerSelect: (rowIndex: number, ledger: Ledger) => void;
  onSearchClear: (rowIndex: number) => void;
}

export const VoucherTable: React.FC<VoucherTableProps> = React.memo(({
  rows,
  onUpdateRow,
  onAddRow,
  onRemoveRow,
  voucherType,
  isPosted,
  searchQueries,
  onSearchQueryChange,
  onSearchOpenChange,
  onSearchHighlightedIndexChange,
  onLedgerSelect,
  onSearchClear
}) => {
  // Determine if a row should use debit or credit filter for ledger search
  const getIsDebitForRow = useCallback((row: VoucherEntryRow): boolean => {
    return row.debit > 0 || (row.debit === 0 && row.credit === 0);
  }, []);

  // Get search state for a specific row
  const getRowSearchState = useCallback((rowIndex: number) => {
    return searchQueries.get(rowIndex) || {
      query: '',
      isOpen: false,
      highlightedIndex: 0,
      results: [],
      isLoading: false,
      error: null
    };
  }, [searchQueries]);

  const handleLedgerInputChange = useCallback((index: number, value: string) => {
    onUpdateRow(index, 'ledgerName', value);
    onUpdateRow(index, 'ledgerId', value);
    onSearchQueryChange(index, value);
  }, [onUpdateRow, onSearchQueryChange]);

  const handleLedgerSelect = useCallback((index: number, ledger: Ledger) => {
    onLedgerSelect(index, ledger);
    onUpdateRow(index, 'ledgerId', ledger.id);
    onUpdateRow(index, 'ledgerName', ledger.name);
    onSearchClear(index);
  }, [onLedgerSelect, onUpdateRow, onSearchClear]);

  return (
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
            {rows.map((row, index) => {
              const searchState = getRowSearchState(index);
              const isDebit = getIsDebitForRow(row);

              return (
                <tr key={row.id} className={row.hasError ? 've-row-error' : ''}>
                  <td>
                    <LedgerSearchDropdown
                      value={row.ledgerName}
                      onChange={(value) => handleLedgerInputChange(index, value)}
                      onSelect={(ledger) => handleLedgerSelect(index, ledger)}
                      _voucherType={voucherType}
                      _isDebit={isDebit}
                      disabled={isPosted}
                      placeholder="Enter ledger account name..."
                      searchResults={searchState.results}
                      isLoading={searchState.isLoading}
                      error={searchState.error}
                      highlightedIndex={searchState.highlightedIndex}
                      onHighlightedIndexChange={(idx) => onSearchHighlightedIndexChange(index, idx)}
                      isOpen={searchState.isOpen}
                      onOpenChange={(open) => onSearchOpenChange(index, open)}
                      onClear={() => onSearchClear(index)}
                    />
                    {row.errorMessage && (
                      <span className="ve-row-error-message">{row.errorMessage}</span>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      className="ve-input ve-input-amount"
                      placeholder="0.00"
                      value={row.debit || ''}
                      onChange={(e) => onUpdateRow(index, 'debit', parseFloat(e.target.value) || 0)}
                      onBlur={(e) => !e.target.value && onUpdateRow(index, 'debit', 0)}
                      disabled={isPosted}
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="ve-input ve-input-amount"
                      placeholder="0.00"
                      value={row.credit || ''}
                      onChange={(e) => onUpdateRow(index, 'credit', parseFloat(e.target.value) || 0)}
                      onBlur={(e) => !e.target.value && onUpdateRow(index, 'credit', 0)}
                      disabled={isPosted}
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="ve-input"
                      placeholder="Line description..."
                      value={row.description}
                      onChange={(e) => onUpdateRow(index, 'description', e.target.value)}
                      disabled={isPosted}
                    />
                  </td>
                  <td>
                    <button
                      className="ve-btn-delete"
                      title="Remove Row"
                      onClick={() => onRemoveRow(row.id)}
                      disabled={rows.length <= 2 || isPosted}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="ve-add-row-container">
        <button className="ve-btn-add" onClick={onAddRow} disabled={isPosted}>
          <Plus size={16} /> Add New Row
        </button>
      </div>
    </div>
  );
});

VoucherTable.displayName = 'VoucherTable';

export default VoucherTable;
