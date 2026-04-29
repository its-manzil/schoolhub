'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faTimes, 
  faChevronDown,
  faFilter,
  faSort
} from '@fortawesome/free-solid-svg-icons';
import { FilterState, FilterStatus, SortOption } from '../types';
import '../styles/filters.css';

interface SchoolFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  resultsCount: number;
  totalCount: number;
}

const statusOptions: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'expiring-soon', label: 'Expiring Soon' }
];

const yearsOptions = [
  { value: null, label: 'All Years' },
  { value: 1, label: '1 Year' },
  { value: 2, label: '2 Years' },
  { value: 3, label: '3 Years' }
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'expiry', label: 'Expiry Date' },
  { value: 'name', label: 'School Name' },
  { value: 'revenue', label: 'Revenue' }
];

export default function SchoolFilters({ 
  filters, 
  onFilterChange, 
  resultsCount, 
  totalCount 
}: SchoolFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, searchQuery: value });
  };

  const handleStatusChange = (value: FilterStatus) => {
    onFilterChange({ ...filters, statusFilter: value });
  };

  const handleYearsChange = (value: number | null) => {
    onFilterChange({ ...filters, subscriptionYears: value });
  };

  const handleSortChange = (value: SortOption) => {
    onFilterChange({ ...filters, sortBy: value });
  };

  const clearFilters = () => {
    onFilterChange({
      searchQuery: '',
      statusFilter: 'all',
      subscriptionYears: null,
      sortBy: 'newest'
    });
  };

  const hasActiveFilters = 
    filters.searchQuery || 
    filters.statusFilter !== 'all' || 
    filters.subscriptionYears !== null;

  return (
    <div className="filters-section">
      <div className="filters-row">
        <div className="search-wrapper">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search schools by name or ID..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="search-input"
          />
          {filters.searchQuery && (
            <button 
              className="search-clear"
              onClick={() => handleSearchChange('')}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>

        <div className="filter-dropdown">
          <FontAwesomeIcon icon={faFilter} className="filter-dropdown-icon" style={{ left: '12px', right: 'auto' }} />
          <select
            value={filters.statusFilter}
            onChange={(e) => handleStatusChange(e.target.value as FilterStatus)}
            className="filter-select"
            style={{ paddingLeft: '36px' }}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-dropdown">
          <FontAwesomeIcon icon={faChevronDown} className="filter-dropdown-icon" />
          <select
            value={filters.subscriptionYears ?? ''}
            onChange={(e) => handleYearsChange(e.target.value ? parseInt(e.target.value) : null)}
            className="filter-select"
          >
            {yearsOptions.map(option => (
              <option key={option.value ?? 'all'} value={option.value ?? ''}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sort-dropdown">
          <FontAwesomeIcon icon={faSort} className="filter-dropdown-icon" style={{ left: '12px', right: 'auto' }} />
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="sort-select"
            style={{ paddingLeft: '36px' }}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <span className="results-count">
          Showing <strong>{resultsCount}</strong> of <strong>{totalCount}</strong> schools
        </span>
      </div>

      {hasActiveFilters && (
        <div className="active-filters">
          <span className="active-filters-label">Active filters:</span>
          {filters.searchQuery && (
            <span className="filter-chip">
              Search: &quot;{filters.searchQuery}&quot;
              <button onClick={() => handleSearchChange('')}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </span>
          )}
          {filters.statusFilter !== 'all' && (
            <span className="filter-chip">
              {statusOptions.find(o => o.value === filters.statusFilter)?.label}
              <button onClick={() => handleStatusChange('all')}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </span>
          )}
          {filters.subscriptionYears !== null && (
            <span className="filter-chip">
              {filters.subscriptionYears} Year{filters.subscriptionYears > 1 ? 's' : ''}
              <button onClick={() => handleYearsChange(null)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </span>
          )}
          <button className="clear-all-filters" onClick={clearFilters}>
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
