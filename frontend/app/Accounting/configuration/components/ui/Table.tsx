import React from 'react';
import styles from './Table.module.css';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  searchable?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const Table = <T extends { _id?: string; id?: string }>({ 
  columns, 
  data, 
  searchable = false,
  pagination,
  searchQuery = '',
  onSearchChange
}: TableProps<T>) => {
  // Filter data based on search query
  const filteredData = searchQuery 
    ? data.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : data;

  // Paginate data
  const itemsPerPage = 10;
  const currentPageNum = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;
  const startIndex = currentPageNum - 1;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (onSearchChange) {
      onSearchChange(query);
    }
  };

  const handlePageChange = (page: number) => {
    if (pagination?.onPageChange) {
      pagination.onPageChange(page);
    }
  };

  return (
    <div className={styles.tableContainer}>
      {/* Search Bar */}
      {searchable && (
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
        </div>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={styles.th}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.td} style={{ textAlign: 'center', padding: '2rem' }}>
                No data found
              </td>
            </tr>
          ) : (
            paginatedData.map((row, idx) => (
              <tr key={row._id || row.id || idx} className={styles.tr}>
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={styles.td}>
                    {col.render ? col.render(row) : (row[col.key as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1rem', gap: '0.5rem' }}>
          <button
            onClick={() => handlePageChange(Math.max(1, currentPageNum - 1))}
            disabled={currentPageNum <= 1}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              backgroundColor: '#f9fafb',
              cursor: 'pointer'
            }}
          >
            Previous
          </button>
          
          <span style={{ padding: '0 1rem', fontSize: '0.875rem', color: '#6b7280' }}>
            Page {currentPageNum} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPageNum + 1))}
            disabled={currentPageNum >= totalPages}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              backgroundColor: '#f9fafb',
              cursor: 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;
