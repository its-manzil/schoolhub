"use client";

import React, { useState, useEffect } from 'react';
import { fetchBankCashAccounts, saveBankCashAccount, deleteBankCashAccount } from '../services/api';
import Table from './ui/Table';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Select from './ui/Select';
import styles from '../styles/ConfigurationLayout.module.css';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface BankAccount {
  _id: string;
  name: string;
  type: 'Bank' | 'Cash';
  accountNumber?: string;
  balance: number;
}

const BankCashContent = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Partial<BankAccount>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await fetchBankCashAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to fetch accounts', error);
    }
    setIsLoading(false);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!currentAccount.name?.trim()) {
      newErrors.name = 'Account name is required.';
    }
    
    if (!currentAccount.type) {
      newErrors.type = 'Account type is required.';
    }
    
    if (currentAccount.balance === undefined || currentAccount.balance === null) {
      newErrors.balance = 'Opening balance is required.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      await saveBankCashAccount(currentAccount);
      fetchAccounts();
      setIsModalOpen(false);
      setCurrentAccount({});
      setErrors({});
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteBankCashAccount(id);
        fetchAccounts();
      } catch (error) {
        console.error('Failed to delete account', error);
      }
    }
  };

  const columns = [
    { key: 'name', header: 'Account Name' },
    { key: 'type', header: 'Type' },
    { key: 'accountNumber', header: 'Account Number', render: (row: BankAccount) => row.accountNumber || 'N/A' },
    { 
      key: 'balance', 
      header: 'Balance',
      render: (row: BankAccount) => `Rs. ${row.balance.toLocaleString()}`
    },
    {
      key: 'actions',
      header: '',
      render: (row: BankAccount) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }} onClick={() => { setCurrentAccount(row); setIsModalOpen(true); }}>
            <Edit2 size={16} />
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} onClick={() => handleDelete(row._id)}>
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 className={styles.pageTitle}>Bank & Cash Accounts</h1>
          <p className={styles.pageSubtitle}>Manage your bank accounts and physical cash registers.</p>
        </div>
        <Button onClick={() => { setCurrentAccount({ type: 'Bank' }); setIsModalOpen(true); }}>
          <Plus size={18} /> Add Account
        </Button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Table 
          columns={columns} 
          data={accounts}
          searchable={true}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          pagination={{
            currentPage: currentPage,
            totalPages: Math.ceil(accounts.length / 10),
            onPageChange: setCurrentPage
          }}
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentAccount._id ? 'Edit Account' : 'Add New Account'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Account'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input 
            label="Account Name" 
            value={currentAccount.name || ''} 
            onChange={(e) => setCurrentAccount({...currentAccount, name: e.target.value})}
            placeholder="e.g. NIC Asia Bank" 
            error={errors.name}
          />
          <Select 
            label="Account Type"
            value={currentAccount.type || 'Bank'}
            onChange={(e) => setCurrentAccount({...currentAccount, type: e.target.value as 'Bank' | 'Cash'})}
            options={[
              { value: 'Bank', label: 'Bank' },
              { value: 'Cash', label: 'Cash' },
            ]}
          />
          {currentAccount.type === 'Bank' && (
            <Input 
              label="Account Number" 
              value={currentAccount.accountNumber || ''} 
              onChange={(e) => setCurrentAccount({...currentAccount, accountNumber: e.target.value})}
              placeholder="Enter account number" 
            />
          )}
          <Input 
            label="Balance (Rs.)" 
            type="number"
            value={currentAccount.balance || ''} 
            onChange={(e) => setCurrentAccount({...currentAccount, balance: parseFloat(e.target.value)})}
            placeholder="0.00" 
            error={errors.balance}
          />
        </div>
      </Modal>
    </div>
  );
};

export default BankCashContent;
