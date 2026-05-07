// ERP-Grade Ledger Search Hook
// Provides debounced backend-driven ledger search functionality

import { useState, useCallback, useRef, useEffect } from 'react';
import { ledgerService, Ledger, VoucherType, getFilteredLedgersByType, groupLedgersByType } from '../services/ledger.service';

interface UseLedgerSearchOptions {
  voucherType: VoucherType;
  isDebit: boolean;
  schoolId?: string;
  debounceMs?: number;
}

interface UseLedgerSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Ledger[];
  groupedResults: Record<string, Ledger[]>;
  isLoading: boolean;
  error: string | null;
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
  clearSearch: () => void;
  searchActive: boolean;
  setSearchActive: (active: boolean) => void;
}

// Simple cache for recent searches
const searchCache = new Map<string, { data: Ledger[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useLedgerSearch = ({
  voucherType,
  isDebit,
  schoolId,
  debounceMs = 400
}: UseLedgerSearchOptions): UseLedgerSearchReturn => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Ledger[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [searchActive, setSearchActive] = useState(false);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate cache key based on search parameters
  const getCacheKey = useCallback((query: string) => {
    return `${schoolId || 'default'}_${voucherType}_${isDebit}_${query.toLowerCase()}`;
  }, [schoolId, voucherType, isDebit]);

  // Perform the actual search
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Check cache first
    const cacheKey = getCacheKey(query);
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setSearchResults(cached.data);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await ledgerService.searchLedgers(
        query,
        voucherType,
        isDebit,
        schoolId
      );

      if (response.success) {
        // Client-side filtering as additional safety
        const filtered = getFilteredLedgersByType(response.data, voucherType, isDebit);
        setSearchResults(filtered);
        
        // Cache the results
        searchCache.set(cacheKey, {
          data: filtered,
          timestamp: Date.now()
        });
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [getCacheKey, schoolId, voucherType, isDebit]);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHighlightedIndex(0);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, debounceMs, performSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Group results by ledger group
  const groupedResults = groupLedgersByType(searchResults);

  // Clear search function
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setHighlightedIndex(0);
    setSearchActive(false);
    setError(null);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    groupedResults,
    isLoading,
    error,
    highlightedIndex,
    setHighlightedIndex,
    clearSearch,
    searchActive,
    setSearchActive
  };
};

export default useLedgerSearch;
