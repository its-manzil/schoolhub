// LedgerSearchDropdown Component
// Backend-driven ledger search with debounced input

'use client';

import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Ledger, VoucherType, getLedgerTypeColor } from '../../services/ledger.service';

interface LedgerSearchDropdownProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (ledger: Ledger) => void;
  _voucherType: VoucherType;
  _isDebit: boolean;
  disabled?: boolean;
  placeholder?: string;
  searchResults: Ledger[];
  isLoading: boolean;
  error: string | null;
  highlightedIndex: number;
  onHighlightedIndexChange: (index: number) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClear: () => void;
}

export const LedgerSearchDropdown: React.FC<LedgerSearchDropdownProps> = React.memo(({
  value,
  onChange,
  onSelect,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _voucherType,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _isDebit,
  disabled = false,
  placeholder = 'Search ledger...',
  searchResults,
  isLoading,
  error,
  highlightedIndex,
  onHighlightedIndexChange,
  isOpen,
  onOpenChange,
  onClear
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Group results by ledger group
  const groupedResults = useMemo(() => {
    return searchResults.reduce((groups, ledger) => {
      if (!groups[ledger.group]) {
        groups[ledger.group] = [];
      }
      groups[ledger.group].push(ledger);
      return groups;
    }, {} as Record<string, Ledger[]>);
  }, [searchResults]);

  // Flatten all ledgers for keyboard navigation
  const allLedgers = useMemo(() => {
    return Object.values(groupedResults).flat();
  }, [groupedResults]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        onHighlightedIndexChange(Math.min(highlightedIndex + 1, allLedgers.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onHighlightedIndexChange(Math.max(highlightedIndex - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selectedLedger = allLedgers[highlightedIndex];
        if (selectedLedger) {
          onSelect(selectedLedger);
          onOpenChange(false);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
        onClear();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, allLedgers, onSelect, onOpenChange, onClear, onHighlightedIndexChange]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onOpenChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    onOpenChange(true);
    onHighlightedIndexChange(0);
  }, [onChange, onOpenChange, onHighlightedIndexChange]);

  const handleLedgerClick = useCallback((ledger: Ledger) => {
    onSelect(ledger);
    onOpenChange(false);
  }, [onSelect, onOpenChange]);

  const handleInputFocus = useCallback(() => {
    onOpenChange(true);
  }, [onOpenChange]);

  return (
    <div ref={containerRef} className="ve-ledger-dropdown-wrapper">
      <div className="ve-ledger-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="ve-input ve-ledger-search-input"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          disabled={disabled}
          autoComplete="off"
        />
        {isLoading ? (
          <Loader2 size={16} className="ve-search-icon ve-spin" />
        ) : (
          <Search size={16} className="ve-search-icon" />
        )}
      </div>

      {isOpen && (
        <div className="ve-ledger-dropdown">
          {error && (
            <div className="ve-dropdown-error">{error}</div>
          )}

          {!error && searchResults.length === 0 && value.trim() && !isLoading && (
            <div className="ve-dropdown-empty">
              No ledgers found for &quot;{value}&quot;
              <div className="ve-dropdown-hint">
                Try a different search term or add a new ledger
              </div>
            </div>
          )}

          {!value.trim() && !isLoading && (
            <div className="ve-dropdown-hint">
              Type to search for ledgers...
            </div>
          )}

          {Object.entries(groupedResults).map(([group, ledgers]) => (
            <div key={group} className="ve-dropdown-group">
              <div className="ve-dropdown-group-header">{group}</div>
              {ledgers.map((ledger) => {
                const globalIndex = allLedgers.findIndex(l => l.id === ledger.id);
                const isHighlighted = globalIndex === highlightedIndex;

                return (
                  <div
                    key={ledger.id}
                    className={`ve-dropdown-item ${isHighlighted ? 'highlighted' : ''}`}
                    onClick={() => handleLedgerClick(ledger)}
                    onMouseEnter={() => onHighlightedIndexChange(globalIndex)}
                  >
                    <span className="ve-dropdown-item-name">{ledger.name}</span>
                    <span
                      className="ve-dropdown-item-type"
                      style={{ backgroundColor: getLedgerTypeColor(ledger.type) }}
                    >
                      {ledger.type}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

LedgerSearchDropdown.displayName = 'LedgerSearchDropdown';

export default LedgerSearchDropdown;
