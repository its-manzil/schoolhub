"use client";

import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Modal from './ui/Modal';
import styles from '../styles/ConfigurationLayout.module.css';
import { Plus, ChevronRight, ChevronDown, Edit2, Trash2, Folder, FileText } from 'lucide-react';
import { fetchAccounts, saveAccount, deleteAccount } from '../services/api';

interface Account {
  _id: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Income' | 'Expense';
  parentId: string | null;
  children?: Account[];
}

const COAContent = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Partial<Account>>({});
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await fetchAccounts();
        setAccounts(data);
        setExpandedIds(new Set(data.map((acc: Account) => acc._id)));
      } catch (error) {
        console.error('Failed to fetch accounts', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAccounts();
  }, []);

  const handleSave = async () => {
    try {
      const accountData = {
        ...currentAccount,
        parentId: currentAccount.parentId || undefined
      };
      await saveAccount(accountData);
      setIsModalOpen(false);
      const data = await fetchAccounts();
      setAccounts(data);
      setExpandedIds(new Set(data.map((acc: Account) => acc._id)));
    } catch (error) {
      console.error('Failed to save account', error);
    }
  };

  const handleDelete = async (_id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteAccount(_id);
        const data = await fetchAccounts();
        setAccounts(data);
        setExpandedIds(new Set(data.map((acc: Account) => acc._id)));
      } catch (error) {
        console.error('Failed to delete account', error);
      }
    }
  };

  const toggleExpand = (_id: string) => {
    const next = new Set(expandedIds);
    if (next.has(_id)) next.delete(_id);
    else next.add(_id);
    setExpandedIds(next);
  };

  const renderAccount = (account: Account, level = 0) => {
    const hasChildren = account.children && account.children.length > 0;
    const isExpanded = expandedIds.has(account._id);

    return (
      <div key={account._id}>
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '0.75rem 1rem', 
            marginLeft: (level * 2) + 'rem',
            borderBottom: '1px solid #f3f4f6',
            borderRadius: '0.375rem',
            backgroundColor: level === 0 ? '#f9fafb' : 'transparent',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onClick={() => toggleExpand(account._id)}
        >
          <div style={{ width: '2rem', display: 'flex', alignItems: 'center' }}>
            {hasChildren ? (
              isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            ) : null}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            {hasChildren ? <Folder size={18} color="#4f46e5" /> : <FileText size={18} color="#6b7280" />}
            <span style={{ fontWeight: level === 0 ? 600 : 400, fontSize: '0.875rem' }}>{account.name}</span>
            <span style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280', 
              backgroundColor: '#f3f4f6', 
              padding: '0.125rem 0.5rem', 
              borderRadius: '1rem',
              marginLeft: '0.5rem'
            }}>
              {account.type}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }} onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); setCurrentAccount({ parentId: account._id }); }}>
              <Plus size={16} />
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }} onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); setCurrentAccount(account); }}>
              <Edit2 size={16} />
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} onClick={(e) => { e.stopPropagation(); handleDelete(account._id); }}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {account.children!.map(child => renderAccount(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 className={styles.pageTitle}>Chart of Accounts</h1>
          <p className={styles.pageSubtitle}>Organize your financial accounts into a hierarchical structure.</p>
        </div>
        <Button onClick={() => { setCurrentAccount({}); setIsModalOpen(true); }}>
          <Plus size={18} /> Add Root Account
        </Button>
      </div>

      {isLoading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading accounts...</p>
      ) : (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', fontWeight: 600, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>
            <div style={{ width: '2rem' }}></div>
            <div style={{ flex: 1 }}>Account Name & Type</div>
            <div>Actions</div>
          </div>
          {accounts.length > 0 ? (
            accounts.map(account => renderAccount(account))
          ) : (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No accounts found. Add a root account to get started.</p>
          )}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentAccount._id ? 'Edit Account' : 'Add New Account'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Account</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input 
            label="Account Name" 
            value={currentAccount.name || ''} 
            onChange={(e) => setCurrentAccount({...currentAccount, name: e.target.value})}
            placeholder="e.g. Salary Expense" 
          />
          <Select 
            label="Account Type"
            value={currentAccount.type || 'Expense'}
            onChange={(e) => setCurrentAccount({...currentAccount, type: e.target.value as Account['type']})}
            options={[
              { value: 'Asset', label: 'Asset' },
              { value: 'Liability', label: 'Liability' },
              { value: 'Income', label: 'Income' },
              { value: 'Expense', label: 'Expense' },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default COAContent;
