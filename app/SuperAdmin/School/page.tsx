'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import SuperAdminNavbar from '../components/SuperAdminNavbar';

// Components
import SchoolHeader from './components/SchoolHeader';
import SchoolStats from './components/SchoolStats';
import SchoolFilters from './components/SchoolFilters';
import SchoolCard from './components/SchoolCard';
import AddSchoolModal from './components/superadmin/school/AddSchoolModal';
import EditSchoolModal from './components/EditSchoolModal';
import ViewDetailsModal from './components/ViewDetailsModal';
import ExtendSubscriptionModal from './components/ExtendSubscriptionModal';
import ImportSection from './components/ImportSection';
import ToastContainer, { Toast } from './components/Toast';

// Types & Utils
import { School, SchoolFormData, FilterState, AdminCredentials } from './types';
import { filterSchools, sortSchools, calculateAmount } from './lib/utils';

// Styles
import './styles/page.css';

const ITEMS_PER_PAGE = 12;

export default function SchoolsPage() {
  // Data State
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showImportSection, setShowImportSection] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    statusFilter: 'all',
    subscriptionYears: null,
    sortBy: 'newest'
  });

  // Bulk Selection State
  const [selectedSchools, setSelectedSchools] = useState<Set<string>>(new Set());

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast Helpers - defined early to be used by other callbacks
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success', title?: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type, title }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch Schools
  const fetchSchools = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await fetch('http://localhost:2056/api/schools', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          showToast('Session expired. Please login again.', 'error');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setSchools(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch schools');
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      showToast('Failed to load schools. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  // Filtered and Sorted Schools
  const filteredSchools = useMemo(() => {
    const filtered = filterSchools(
      schools, 
      filters.searchQuery, 
      filters.statusFilter, 
      filters.subscriptionYears
    );
    return sortSchools(filtered, filters.sortBy);
  }, [schools, filters]);

  // Paginated Schools
  const paginatedSchools = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSchools.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSchools, currentPage]);

  const totalPages = Math.ceil(filteredSchools.length / ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Bulk Selection Handlers
  const handleSelectSchool = useCallback((id: string) => {
    setSelectedSchools(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedSchools.size === paginatedSchools.length) {
      setSelectedSchools(new Set());
    } else {
      setSelectedSchools(new Set(paginatedSchools.map(s => s._id)));
    }
  }, [paginatedSchools, selectedSchools.size]);

  // CRUD Operations
  const handleAddSchool = async (formData: SchoolFormData): Promise<{ success: boolean; adminAccount?: AdminCredentials }> => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:2056/api/schools', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add school');
      }

      if (data.success) {
        showToast('School added successfully!', 'success');
        fetchSchools();
        return { success: true, adminAccount: data.data?.adminAccount };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add school';
      showToast(message, 'error');
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSchool = async (schoolId: string, formData: SchoolFormData): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:2056/api/schools/${schoolId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update school');
      }

      if (data.success) {
        showToast('School updated successfully!', 'success');
        fetchSchools();
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update school';
      showToast(message, 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSchool = async (school: School) => {
    if (!confirm(`Are you sure you want to delete "${school.name}"? This will also remove the associated admin account. This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:2056/api/schools/${school._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete school');
      }

      if (data.success) {
        showToast('School deleted successfully!', 'success');
        setSchools(prev => prev.filter(s => s._id !== school._id));
        setSelectedSchools(prev => {
          const newSet = new Set(prev);
          newSet.delete(school._id);
          return newSet;
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete school';
      showToast(message, 'error');
    }
  };

  const handleResetPassword = async (schoolId: string): Promise<string | null> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:2056/api/schools/${schoolId}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        return data.data?.password || null;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset password';
      showToast(message, 'error');
      return null;
    }
  };

  const handleExtendSubscription = async (schoolId: string, years: number): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // First get current school data
      const school = schools.find(s => s._id === schoolId);
      if (!school) throw new Error('School not found');

      // Calculate new expiry date by adding years to current expiry
      const currentExpiry = new Date(school.subscription.expiryDate);
      const newExpiryDate = new Date(currentExpiry);
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + years);

      const response = await fetch(`http://localhost:2056/api/schools/${schoolId}/extend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          years,
          amount: calculateAmount(years),
          expiryDate: newExpiryDate.toISOString()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to extend subscription');
      }

      if (data.success) {
        showToast(`Subscription extended by ${years} year${years > 1 ? 's' : ''}!`, 'success');
        fetchSchools();
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to extend subscription';
      showToast(message, 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    const count = selectedSchools.size;
    if (!confirm(`Are you sure you want to delete ${count} schools? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const promises = Array.from(selectedSchools).map(id => 
        fetch(`http://localhost:2056/api/schools/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      );

      await Promise.all(promises);
      showToast(`${count} schools deleted successfully!`, 'success');
      setSelectedSchools(new Set());
      fetchSchools();
    } catch {
      showToast('Some schools could not be deleted', 'error');
    }
  };

  const handleBulkExtend = async () => {
    const years = parseInt(prompt('Enter number of years to extend for all selected schools:', '1') || '0');
    if (!years || years <= 0) return;

    try {
      const token = localStorage.getItem('token');
      const promises = Array.from(selectedSchools).map(id => 
        fetch(`http://localhost:2056/api/schools/${id}/extend`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ years, amount: calculateAmount(years) })
        })
      );

      await Promise.all(promises);
      showToast(`Extended subscription for ${selectedSchools.size} schools!`, 'success');
      setSelectedSchools(new Set());
      fetchSchools();
    } catch {
      showToast('Some subscriptions could not be extended', 'error');
    }
  };

  // Modal Open Handlers
  const openEditModal = (school: School) => {
    setSelectedSchool(school);
    setShowEditModal(true);
  };

  const openViewModal = (school: School) => {
    setSelectedSchool(school);
    setShowViewModal(true);
  };

  const openExtendModal = (school: School) => {
    setSelectedSchool(school);
    setShowExtendModal(true);
  };

  // Loading State
  if (isLoading) {
    return (
      <>
        <SuperAdminNavbar />
        <div className="schools-page-container">
          <div className="schools-content">
            <div className="schools-loading">
              <div className="loading-spinner" />
              <p>Loading schools...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SuperAdminNavbar />
      <div className="schools-page-container">
        <div className="schools-content">
          {/* Toast Notifications */}
          <ToastContainer toasts={toasts} onDismiss={dismissToast} />

          {/* Header */}
          <SchoolHeader 
            onAddClick={() => setShowAddModal(true)}
            onImportClick={() => setShowImportSection(!showImportSection)}
            isImportOpen={showImportSection}
          />

          {/* Main Content */}
          {showImportSection ? (
            <ImportSection 
              onClose={() => setShowImportSection(false)}
              schools={schools}
              onShowToast={showToast}
            />
          ) : (
            <>
              {/* Stats */}
              <SchoolStats schools={schools} />

              {/* Filters */}
              <SchoolFilters 
                filters={filters}
                onFilterChange={setFilters}
                resultsCount={filteredSchools.length}
                totalCount={schools.length}
              />

              {/* Bulk Actions */}
              {selectedSchools.size > 0 && (
                <div className="bulk-actions-bar">
                  <div className="bulk-actions-left">
                    <input 
                      type="checkbox" 
                      checked={selectedSchools.size === paginatedSchools.length && paginatedSchools.length > 0}
                      onChange={handleSelectAll}
                    />
                    <span className="selection-info">
                      {selectedSchools.size} school{selectedSchools.size > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="bulk-actions-right">
                    <button className="bulk-btn primary" onClick={handleBulkExtend}>
                      Extend Subscription
                    </button>
                    <button className="bulk-btn danger" onClick={handleBulkDelete}>
                      Delete Selected
                    </button>
                  </div>
                </div>
              )}

              {/* Schools Grid */}
              {filteredSchools.length === 0 ? (
                <div className="empty-state">
                  <p>No schools found matching your filters.</p>
                  <button 
                    className="empty-action-btn"
                    onClick={() => setFilters({ ...filters, searchQuery: '', statusFilter: 'all', subscriptionYears: null })}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="schools-grid">
                    <AnimatePresence mode="popLayout">
                      {paginatedSchools.map((school) => (
                        <SchoolCard 
                          key={school._id}
                          school={school}
                          isSelected={selectedSchools.has(school._id)}
                          onSelect={handleSelectSchool}
                          onView={openViewModal}
                          onEdit={openEditModal}
                          onExtend={openExtendModal}
                          onDelete={handleDeleteSchool}
                          onShowToast={showToast}
                        />
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pagination-container">
                      <button 
                        className="pagination-btn"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        ←
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button 
                          key={page}
                          className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button 
                        className="pagination-btn"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        →
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Modals */}
          <AddSchoolModal 
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddSchool}
            isSubmitting={isSubmitting}
          />

          <EditSchoolModal 
            school={selectedSchool}
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedSchool(null);
            }}
            onSubmit={handleUpdateSchool}
            isSubmitting={isSubmitting}
          />

          <ViewDetailsModal 
            school={selectedSchool}
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedSchool(null);
            }}
            onResetPassword={handleResetPassword}
            onShowToast={showToast}
          />

          <ExtendSubscriptionModal 
            school={selectedSchool}
            isOpen={showExtendModal}
            onClose={() => {
              setShowExtendModal(false);
              setSelectedSchool(null);
            }}
            onSubmit={handleExtendSubscription}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </>
  );
}
