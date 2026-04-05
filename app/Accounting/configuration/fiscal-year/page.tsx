"use client";

import React, { useState, useEffect } from 'react';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Toggle from '../components/ui/Toggle';
import NepaliDatePicker from '@/app/Components/ui/NepaliDatePicker';
import styles from '../styles/ConfigurationLayout.module.css';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { saveFiscalYear, activateFiscalYear, fetchFiscalYears, deleteFiscalYear } from '../services/api';

interface FiscalYear {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  startDateBS?: string;
  endDateBS?: string;
  isActive: boolean;
}

const FiscalYearPage = () => {
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState<Partial<FiscalYear>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!currentYear.name?.trim()) {
      newErrors.name = 'Fiscal year name is required.';
    }
    
    if (!currentYear.startDateBS) {
      newErrors.startDateBS = 'Start date is required.';
    }
    
    if (!currentYear.endDateBS) {
      newErrors.endDateBS = 'End date is required.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const loadFiscalYears = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchFiscalYears();
        // Handle empty data properly
        if (Array.isArray(data)) {
          setFiscalYears(data);
        } else {
          setFiscalYears([]);
        }
      } catch (error) {
        console.error('Failed to fetch fiscal years', error);
        setError('Failed to load fiscal years');
        setFiscalYears([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadFiscalYears();
  }, []);

  const columns = [
    { key: 'name', header: 'Fiscal Year' },
    { key: 'startDate', header: 'Start Date', render: (row: FiscalYear) => row.startDateBS || new Date(row.startDate).toLocaleDateString() },
    { key: 'endDate', header: 'End Date', render: (row: FiscalYear) => row.endDateBS || new Date(row.endDate).toLocaleDateString() },
    { 
      key: 'isActive', 
      header: 'Status',
      render: (row: FiscalYear) => (
        <Toggle 
          active={row.isActive} 
          onChange={() => handleToggleActive(row._id)} 
          label={row.isActive ? 'Active' : 'Inactive'}
        />
      )
    },
    {
      key: 'actions',
      header: '',
      render: (row: FiscalYear) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }} onClick={() => handleEdit(row)}>
            <Edit2 size={16} />
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} onClick={() => handleDelete(row._id)}>
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const loadFiscalYears = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchFiscalYears();
      if (Array.isArray(data)) {
        setFiscalYears(data);
      } else {
        setFiscalYears([]);
      }
    } catch (error) {
      console.error('Failed to refresh fiscal years', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      // Prepare data with BS dates (backend will handle conversion)
      const dataToSave = {
        ...currentYear,
        // Include BS dates for frontend display
        startDateBS: currentYear.startDateBS,
        endDateBS: currentYear.endDateBS,
        // Clear any existing AD dates to let backend handle conversion
        startDate: undefined,
        endDate: undefined
      };
      
      await saveFiscalYear(dataToSave);
      
      // Refresh the data
      await loadFiscalYears();
      
      setIsModalOpen(false);
      setCurrentYear({});
      setErrors({});
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await activateFiscalYear(id);
      // Refresh the data
      const loadFiscalYears = async () => {
        try {
          const data = await fetchFiscalYears();
          if (Array.isArray(data)) {
            setFiscalYears(data);
          } else {
            setFiscalYears([]);
          }
        } catch (error) {
          console.error('Failed to refresh fiscal years', error);
        }
      };
      await loadFiscalYears();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleEdit = (fy: FiscalYear) => {
    setCurrentYear(fy);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this fiscal year?')) {
      try {
        await deleteFiscalYear(id);
        // Refresh the data
        const loadFiscalYears = async () => {
          setIsLoading(true);
          try {
            const data = await fetchFiscalYears();
            if (Array.isArray(data)) {
              setFiscalYears(data);
            } else {
              setFiscalYears([]);
            }
          } catch (error) {
            console.error('Failed to refresh fiscal years', error);
          } finally {
            setIsLoading(false);
          }
        };
        await loadFiscalYears();
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      }
    }
  };

  return (
    <div className={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 className={styles.pageTitle}>Fiscal Year Management</h1>
          <p className={styles.pageSubtitle}>Maintain accounting periods and active financial cycles.</p>
        </div>
        <Button onClick={() => { setCurrentYear({}); setIsModalOpen(true); }}>
          <Plus size={18} /> Add Fiscal Year
        </Button>
      </div>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

      {isLoading ? (
        <p>Loading fiscal years...</p>
      ) : fiscalYears.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>No Fiscal Years Found</h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Start by adding your first fiscal year to manage your accounting periods.
          </p>
          <Button onClick={() => { setCurrentYear({}); setIsModalOpen(true); }}>
            <Plus size={18} /> Add Your First Fiscal Year
          </Button>
        </div>
      ) : (
        <Table 
          columns={columns} 
          data={fiscalYears}
          searchable={true}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          pagination={{
            currentPage: currentPage,
            totalPages: Math.ceil(fiscalYears.length / 10),
            onPageChange: setCurrentPage
          }}
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentYear._id ? 'Edit Fiscal Year' : 'Add New Fiscal Year'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Fiscal Year'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input 
            label="Fiscal Year Name" 
            value={currentYear.name || ''} 
            onChange={(e) => setCurrentYear({...currentYear, name: e.target.value})}
            placeholder="e.g. 2081/82" 
            error={errors.name}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <NepaliDatePicker 
              label="Start Date" 
              value={currentYear.startDateBS || ''}
              onChange={(value) => setCurrentYear({...currentYear, startDateBS: value})}
              error={errors.startDateBS}
            />
            <NepaliDatePicker 
              label="End Date" 
              value={currentYear.endDateBS || ''}
              onChange={(value) => setCurrentYear({...currentYear, endDateBS: value})}
              error={errors.endDateBS}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FiscalYearPage;
