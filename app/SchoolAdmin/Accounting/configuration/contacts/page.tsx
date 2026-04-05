"use client";

import React, { useState } from 'react';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import styles from '../styles/ConfigurationLayout.module.css';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { fetchContacts, saveContact, deleteContact } from '../services/api';

interface Contact {
  id: string;
  name: string;
  type: string;
  phone: string;
  pan?: string;
  openingBalance: number;
}

const ContactsPage = () => {
  const [activeTab, setActiveTab] = useState<'Customer' | 'Vendor'>('Customer');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<Partial<Contact>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const loadContacts = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchContacts(activeTab);
      setContacts(data || []);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  React.useEffect(() => {
    loadContacts();
  }, [activeTab, loadContacts]);

  const handleSave = async () => {
    try {
      await saveContact({ ...currentContact, type: activeTab });
      setIsModalOpen(false);
      await loadContacts(); // Refresh the list
    } catch (error) {
      console.error('Failed to save contact:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete this ${activeTab}?`)) {
      try {
        await deleteContact(id);
        await loadContacts(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete contact:', error);
      }
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'pan', header: 'PAN Number', render: (row: Contact) => row.pan || 'N/A' },
    { 
      key: 'openingBalance', 
      header: 'Balance',
      render: (row: Contact) => `Rs. ${row.openingBalance.toLocaleString()}`
    },
    {
      key: 'actions',
      header: '',
      render: (row: Contact) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }} onClick={() => { setCurrentContact(row); setIsModalOpen(true); }}>
            <Edit2 size={16} />
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} onClick={() => handleDelete(row.id)}>
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const tabStyle = (tab: string) => ({
    padding: '0.75rem 1.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: activeTab === tab ? '#2563eb' : '#6b7280',
    borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
    transition: 'all 0.2s'
  });

  return (
    <div className={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className={styles.pageTitle}>Customers & Vendors</h1>
          <p className={styles.pageSubtitle}>Manage your financial relationships and opening balances.</p>
        </div>
        <Button onClick={() => { setCurrentContact({ type: activeTab }); setIsModalOpen(true); }}>
          <Plus size={18} /> Add {activeTab}
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
        <div style={tabStyle('Customer')} onClick={() => setActiveTab('Customer')}>Customers</div>
        <div style={tabStyle('Vendor')} onClick={() => setActiveTab('Vendor')}>Vendors</div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <Input placeholder={`Search ${activeTab}s...`} name="search" style={{ paddingLeft: '2.5rem' }} />
      </div>

      {isLoading ? (
        <p>Loading contacts...</p>
      ) : (
        <Table 
          columns={columns} 
          data={contacts}
          searchable={true}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          pagination={{
            currentPage: currentPage,
            totalPages: Math.ceil(contacts.length / 10),
            onPageChange: setCurrentPage
          }}
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentContact.id ? `Edit ${activeTab}` : `Add New ${activeTab}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save {activeTab}</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input 
            label={`${activeTab} Name`} 
            value={currentContact.name || ''} 
            onChange={(e) => setCurrentContact({...currentContact, name: e.target.value})}
            placeholder="Enter name" 
          />
          <Input 
            label="Phone Number" 
            value={currentContact.phone || ''} 
            onChange={(e) => setCurrentContact({...currentContact, phone: e.target.value})}
            placeholder="Enter phone number" 
          />
          <Input 
            label="PAN Number (Optional)" 
            value={currentContact.pan || ''} 
            onChange={(e) => setCurrentContact({...currentContact, pan: e.target.value})}
            placeholder="9-digit PAN" 
          />
          <Input 
            label="Opening Balance (Rs.)" 
            type="number"
            value={currentContact.openingBalance || ''} 
            onChange={(e) => setCurrentContact({...currentContact, openingBalance: parseFloat(e.target.value)})}
            placeholder="0.00" 
          />
        </div>
      </Modal>
    </div>
  );
};

export default ContactsPage;
