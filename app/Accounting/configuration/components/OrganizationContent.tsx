"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { fetchSchoolData, fetchAdminContacts, saveSchoolAccounting } from '../services/api';
import Input from './ui/Input';
import Button from './ui/Button';
import styles from '../styles/ConfigurationLayout.module.css';

type TabType = 'details' | 'setup';

interface SchoolData {
  _id?: string;
  schoolId: number;
  name: string;
  address: string;
  logo?: string;
  establishedYear?: string;
  status?: string;
  principalName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  totalStudents?: number;
  totalTeachers?: number;
  panVat?: string;
  pan?: string;
  vat?: string;
  // Accounting specific fields (stored in schools table)
  'acct-phone'?: string;
  'acct-mail'?: string;
  'pan-number'?: string;
  'vat-number'?: string;
  subscription?: {
    years: number;
    amount: number;
    subscribedDate: string;
    expiryDate: string;
    isActive: boolean;
    remainingDays: number;
  };
}

interface AdminContact {
  _id?: string;
  schoolId: number;
  adminPhone: string;
  adminEmail: string;
  createdAt: string;
}

interface AccountingFormData {
  phone: string;
  email: string;
  pan: string;
  vat: string;
}

const OrganizationContent = () => {
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [adminContact, setAdminContact] = useState<AdminContact | null>(null);
  const [accountingForm, setAccountingForm] = useState<AccountingFormData>({
    phone: '',
    email: '',
    pan: '',
    vat: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const getSchoolId = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    try {
      const user = JSON.parse(userData);
      return user.schoolId;
    } catch {
      return null;
    }
  }, []);

  const loadOrganization = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const schoolId = getSchoolId();
      if (!schoolId) {
        setError('School ID not found. Please login again.');
        setIsLoading(false);
        return;
      }

      // Fetch school data and admin contacts in parallel (following Administrative page pattern)
      const [schoolResult, contactsResult] = await Promise.all([
        fetchSchoolData(schoolId),
        fetchAdminContacts(schoolId).catch(() => ({ success: false, data: null }))
      ]);

      if (schoolResult.success) {
        setSchoolData(schoolResult.data);
        // Initialize accounting form with accounting-specific fields from schools table
        setAccountingForm({
          phone: schoolResult.data['acct-phone'] || '',
          email: schoolResult.data['acct-mail'] || '',
          pan: schoolResult.data['pan-number'] || '',
          vat: schoolResult.data['vat-number'] || '',
        });
      }

      if (contactsResult.success && contactsResult.data) {
        setAdminContact(contactsResult.data);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load organization data');
      }
    } finally {
      setIsLoading(false);
    }
  }, [getSchoolId]);

  useEffect(() => {
    loadOrganization();
  }, [loadOrganization]);

  const handleAccountingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountingForm({ ...accountingForm, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateAccounting = () => {
    const newErrors: { [key: string]: string } = {};

    if (accountingForm.email && !/\S+@\S+\.\S+/.test(accountingForm.email)) {
      newErrors.email = 'Email address is invalid.';
    }

    if (accountingForm.pan && !/^\d{9}$/.test(accountingForm.pan)) {
      newErrors.pan = 'PAN must be exactly 9 digits.';
    }

    if (accountingForm.phone) {
      const phoneStr = accountingForm.phone.replace(/\D/g, '');
      if (phoneStr.length !== 10) {
        newErrors.phone = 'Phone number must be exactly 10 digits.';
      } else if (!phoneStr.startsWith('97') && !phoneStr.startsWith('98')) {
        newErrors.phone = 'Phone number must start with 97 or 98.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAccountingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAccounting()) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const schoolId = getSchoolId();
      if (!schoolId) {
        setError('School ID not found. Please login again.');
        setIsSaving(false);
        return;
      }

      await saveSchoolAccounting(schoolId, accountingForm);
      setSuccessMessage('Accounting information updated successfully!');
      // Refresh data
      await loadOrganization();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save accounting info', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to save accounting information. Please try again.');
      } else {
        setError('Failed to save accounting information. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const formatValue = (value: string | undefined) => {
    return value && value.trim() !== '' ? value : 'Not Set';
  };

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const renderDetailsTab = () => {
    if (!schoolData) return null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* School Info Card */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '0.5rem', 
          padding: '1.5rem', 
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: 600, 
            color: '#111827', 
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            School Information
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            {schoolData.logo ? (
              <img 
                src={`data:image/jpeg;base64,${schoolData.logo}`}
                alt={schoolData.name || 'School logo'} 
                width={80}
                height={80}
                style={{ borderRadius: '0.5rem', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '0.5rem', 
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '2rem',
                fontWeight: 600
              }}>
                {getInitials(schoolData.name)}
              </div>
            )}
            <div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>
                {schoolData.name}
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                ID: {schoolData.schoolId}
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 500 }}>Address</p>
              <p style={{ fontSize: '0.875rem', color: '#374151' }}>{formatValue(schoolData.address)}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 500 }}>Established Year</p>
              <p style={{ fontSize: '0.875rem', color: '#374151' }}>{schoolData.establishedYear || 'Not Set'}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 500 }}>Status</p>
              <p style={{ fontSize: '0.875rem', color: '#374151' }}>
                <span style={{ 
                  display: 'inline-flex',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  backgroundColor: schoolData.status === 'active' ? '#dcfce7' : '#fee2e2',
                  color: schoolData.status === 'active' ? '#166534' : '#991b1b'
                }}>
                  {schoolData.status || 'Unknown'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Administration Card */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '0.5rem', 
          padding: '1.5rem', 
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: 600, 
            color: '#111827', 
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            Administration
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 500 }}>Principal Name</p>
              <p style={{ fontSize: '0.875rem', color: '#374151' }}>{formatValue(schoolData.principalName)}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 500 }}>Admin Email</p>
              <p style={{ fontSize: '0.875rem', color: '#374151' }}>{formatValue(adminContact?.adminEmail)}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 500 }}>Admin Phone</p>
              <p style={{ fontSize: '0.875rem', color: '#374151' }}>{formatValue(adminContact?.adminPhone)}</p>
            </div>
          </div>
        </div>

        {/* Contact Card */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '0.5rem', 
          padding: '1.5rem', 
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: 600, 
            color: '#111827', 
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            Contact Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 500 }}>Contact Email</p>
              <p style={{ fontSize: '0.875rem', color: '#374151' }}>{formatValue(schoolData.contactEmail)}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 500 }}>Contact Phone</p>
              <p style={{ fontSize: '0.875rem', color: '#374151' }}>{formatValue(schoolData.contactPhone)}</p>
            </div>
          </div>
        </div>

        {/* Accounting Info Card */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '0.5rem', 
          padding: '1.5rem', 
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: 600, 
            color: '#111827', 
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            Accounting Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 500 }}>Accounting Phone</p>
              <p style={{ fontSize: '0.875rem', color: '#374151' }}>{formatValue(schoolData?.['acct-phone'])}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 500 }}>Accounting Email</p>
              <p style={{ fontSize: '0.875rem', color: '#374151' }}>{formatValue(schoolData?.['acct-mail'])}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 500 }}>PAN Number</p>
              <p style={{ fontSize: '0.875rem', color: '#374151' }}>{formatValue(schoolData?.['pan-number'])}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 500 }}>VAT Number</p>
              <p style={{ fontSize: '0.875rem', color: '#374151' }}>{formatValue(schoolData?.['vat-number'])}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSetupTab = () => {
    return (
      <div style={{ 
        backgroundColor: '#ffffff', 
        borderRadius: '0.5rem', 
        padding: '1.5rem', 
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          fontSize: '1rem', 
          fontWeight: 600, 
          color: '#111827', 
          marginBottom: '1rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          Accounting Setup
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
          Configure accounting-specific contact information and tax details for your school.
        </p>
        
        <form onSubmit={handleAccountingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Accounting Phone"
              name="phone"
              value={accountingForm.phone}
              onChange={handleAccountingChange}
              placeholder="+977-XXXXXXXXXX"
              error={errors.phone}
            />
            <Input
              label="Accounting Email"
              name="email"
              type="email"
              value={accountingForm.email}
              onChange={handleAccountingChange}
              placeholder="accounting@school.edu.np"
              error={errors.email}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="PAN Number"
              name="pan"
              value={accountingForm.pan}
              onChange={handleAccountingChange}
              placeholder="Enter 9-digit PAN"
              error={errors.pan}
            />
            <Input
              label="VAT Number"
              name="vat"
              value={accountingForm.vat}
              onChange={handleAccountingChange}
              placeholder="Enter VAT number"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className={styles.section}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Organization</h1>
        <p className={styles.pageSubtitle}>View and configure your school&apos;s organization details.</p>
      </div>

      {/* Mini Navbar */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1.5rem',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '0.5rem'
      }}>
        <button
          onClick={() => setActiveTab('details')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'details' ? '#3b82f6' : '#f3f4f6',
            color: activeTab === 'details' ? '#ffffff' : '#374151',
            transition: 'all 0.2s'
          }}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab('setup')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'setup' ? '#3b82f6' : '#f3f4f6',
            color: activeTab === 'setup' ? '#ffffff' : '#374151',
            transition: 'all 0.2s'
          }}
        >
          Setup
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          color: '#b91c1c', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1.5rem', 
          fontSize: '0.875rem', 
          border: '1px solid #fecaca' 
        }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div style={{ 
          backgroundColor: '#dcfce7', 
          color: '#166534', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1.5rem', 
          fontSize: '0.875rem', 
          border: '1px solid #bbf7d0' 
        }}>
          {successMessage}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <p>Loading organization data...</p>
        </div>
      ) : !schoolData ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          backgroundColor: '#f9fafb', 
          borderRadius: '0.5rem', 
          border: '1px solid #e5e7eb' 
        }}>
          <h3 style={{ color: '#6b7280', marginBottom: '1rem' }}>No Organization Data Available</h3>
          <p style={{ color: '#9ca3af' }}>Unable to load school information. Please try again later.</p>
        </div>
      ) : (
        activeTab === 'details' ? renderDetailsTab() : renderSetupTab()
      )}
    </div>
  );
};

export default OrganizationContent;
