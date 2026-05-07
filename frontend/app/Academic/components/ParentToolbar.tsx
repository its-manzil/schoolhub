'use client'

import './ParentToolbar.css'

type FilterType = 'all' | 'single-child' | 'multi-child'

interface ParentToolbarProps {
  search: string
  setSearch: (value: string) => void
  filter: FilterType
  setFilter: (value: FilterType) => void
  selectedClass: string | null
  setSelectedClass: (value: string | null) => void
}

export default function ParentToolbar({ 
  search, 
  setSearch, 
  filter, 
  setFilter,
  selectedClass,
  setSelectedClass 
}: ParentToolbarProps) {
  const filterOptions = [
    { value: 'all', label: 'All Parents' },
    { value: 'single-child', label: 'Single Child' },
    { value: 'multi-child', label: 'Multi-child' }
  ]

  return (
    <div className="parent-toolbar">
      {/* Search */}
      <div className="parent-toolbar__search-wrapper">
        <svg 
          className="parent-toolbar__search-icon"
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#9CA3AF" 
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          className="parent-toolbar__search-input"
          placeholder="Search parent name, phone, email, child name or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filter Pills */}
      <div className="parent-toolbar__filters">
        {filterOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value as FilterType)}
            className={`parent-toolbar__filter-btn ${filter === option.value ? 'parent-toolbar__filter-btn--active' : ''}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Clear Class Filter */}
      {selectedClass && (
        <button
          onClick={() => setSelectedClass(null)}
          className="parent-toolbar__clear-btn"
        >
          Class: {selectedClass}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  )
}
