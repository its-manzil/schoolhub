'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './FiscalYearManagement.module.css';

interface FiscalYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isLocked: boolean;
  balanceForwarded: boolean;
  bikramSambatStart: string;
  bikramSambatEnd: string;
}

export const FiscalYearManagement: React.FC = () => {
  const router = useRouter();
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([
    {
      id: '1',
      name: 'FY 2082/83',
      startDate: '2082-04-01',
      endDate: '2083-03-31',
      isActive: true,
      isLocked: false,
      balanceForwarded: false,
      bikramSambatStart: '2082-01-01',
      bikramSambatEnd: '2082-12-30'
    },
    {
      id: '2',
      name: 'FY 2081/82',
      startDate: '2081-04-01',
      endDate: '2082-03-31',
      isActive: false,
      isLocked: true,
      balanceForwarded: true,
      bikramSambatStart: '2081-01-01',
      bikramSambatEnd: '2081-12-30'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingYear, setEditingYear] = useState<FiscalYear | null>(null);
  const [formData, setFormData] = useState<Partial<FiscalYear>>({
    name: '',
    startDate: '',
    endDate: '',
    isActive: false,
    isLocked: false,
    balanceForwarded: false,
    bikramSambatStart: '',
    bikramSambatEnd: ''
  });

  const handleAddNew = () => {
    setShowAddForm(true);
    setEditingYear(null);
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      isActive: false,
      isLocked: false,
      balanceForwarded: false,
      bikramSambatStart: '',
      bikramSambatEnd: ''
    });
  };

  const handleEdit = (year: FiscalYear) => {
    setEditingYear(year);
    setFormData(year);
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (editingYear) {
      setFiscalYears(prev => prev.map(y => y.id === editingYear.id ? { ...formData, id: editingYear.id } as FiscalYear : y));
    } else {
      const newYear: FiscalYear = {
        ...formData,
        id: Date.now().toString()
      } as FiscalYear;
      setFiscalYears(prev => [...prev, newYear]);
    }
    setShowAddForm(false);
    setEditingYear(null);
  };

  const handleDelete = (id: string) => {
    setFiscalYears(prev => prev.filter(y => y.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setFiscalYears(prev => prev.map(y => {
      if (y.id === id) {
        return { ...y, isActive: !y.isActive };
      }
      if (y.isActive && y.id !== id) {
        return { ...y, isActive: false };
      }
      return y;
    }));
  };

  const handleLockYear = (id: string) => {
    setFiscalYears(prev => prev.map(y => 
      y.id === id ? { ...y, isLocked: !y.isLocked } : y
    ));
  };

  const handleBalanceForward = (id: string) => {
    setFiscalYears(prev => prev.map(y => 
      y.id === id ? { ...y, balanceForwarded: !y.balanceForwarded } : y
    ));
  };

  const handleBack = () => {
    router.push('/billing#billing-setup');
  };

  return (
    <div id="fiscal-year-management" className="content-section active">
      <div className={styles.header}>
        <h2>Fiscal Year Management</h2>
        <p>Configure and manage school fiscal years with Bikram Sambat calendar support</p>
      </div>

      <div className={styles.actions}>
        <button 
          className={`${styles.btn} ${styles.btnPrimary}`} 
          onClick={handleBack}
          aria-label="Back to Billing Setup"
          title="Back to Billing Setup"
        >
          <i className="fas fa-arrow-left"></i> Back to Billing Setup
        </button>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleAddNew}>
          <i className="fas fa-plus"></i> Add New Fiscal Year
        </button>
      </div>

      {showAddForm && (
        <div className={styles.formCard}>
          <h3>{editingYear ? 'Edit Fiscal Year' : 'Add New Fiscal Year'}</h3>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Fiscal Year Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., FY 2083/84"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Start Date (BS)</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>End Date (BS)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Bikram Sambat Start</label>
              <input
                type="date"
                value={formData.bikramSambatStart}
                onChange={(e) => setFormData({ ...formData, bikramSambatStart: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Bikram Sambat End</label>
              <input
                type="date"
                value={formData.bikramSambatEnd}
                onChange={(e) => setFormData({ ...formData, bikramSambatEnd: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Status</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active Year</span>
                </label>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.isLocked}
                    onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                  />
                  <span>Locked</span>
                </label>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.balanceForwarded}
                    onChange={(e) => setFormData({ ...formData, balanceForwarded: e.target.checked })}
                  />
                  <span>Balance Forwarded</span>
                </label>
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave}>
              {editingYear ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      )}

      <div className={styles.yearsGrid}>
        {fiscalYears.map((year) => (
          <div key={year.id} className={styles.yearCard}>
            <div className={styles.yearHeader}>
              <h3>{year.name}</h3>
              <div className={styles.yearStatus}>
                {year.isActive && <span className={`${styles.badge} ${styles.active}`}>Active</span>}
                {year.isLocked && <span className={`${styles.badge} ${styles.locked}`}>Locked</span>}
                {year.balanceForwarded && <span className={`${styles.badge} ${styles.forwarded}`}>Forwarded</span>}
              </div>
            </div>

            <div className={styles.yearDetails}>
              <div className={styles.detailRow}>
                <span className={styles.label}>Period:</span>
                <span className={styles.value}>{year.startDate} - {year.endDate}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Bikram Sambat:</span>
                <span className={styles.value}>{year.bikramSambatStart} - {year.bikramSambatEnd}</span>
              </div>
            </div>

            <div className={styles.yearActions}>
              <button
                className={`${styles.btn} ${styles.btnOutline}`}
                onClick={() => handleEdit(year)}
              >
                <i className="fas fa-edit"></i> Edit
              </button>
              
              <button
                className={`${styles.btn} ${styles.btnOutline}`}
                onClick={() => handleToggleActive(year.id)}
                disabled={year.isLocked}
              >
                <i className={`fas fa-${year.isActive ? 'pause' : 'play'}`}></i> 
                {year.isActive ? 'Deactivate' : 'Activate'}
              </button>

              {!year.isLocked && (
                <button
                  className={`${styles.btn} ${styles.btnWarning}`}
                  onClick={() => handleLockYear(year.id)}
                >
                  <i className="fas fa-lock"></i> Lock Year
                </button>
              )}

              {year.isLocked && !year.balanceForwarded && (
                <button
                  className={`${styles.btn} ${styles.btnInfo}`}
                  onClick={() => handleBalanceForward(year.id)}
                >
                  <i className="fas fa-arrow-right"></i> Forward Balance
                </button>
              )}

              <button
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={() => handleDelete(year.id)}
                disabled={year.isActive}
              >
                <i className="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
