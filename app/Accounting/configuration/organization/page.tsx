"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchOrganization, saveOrganization } from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import styles from '../styles/ConfigurationLayout.module.css';
import Sidebar from '../components/Sidebar';
import Layout from '../../components/Layout';

const OrganizationSetup = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    panVat: '',
    address: '',
    phone: '',
    email: '',
    principalName: '',
    establishedYear: '',
    totalStudents: '',
    totalTeachers: '',
    status: '',
    schoolId: '',
    logo: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showForm, setShowForm] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    const loadOrganization = async () => {
      setIsLoading(true);
      try {
        const data = await fetchOrganization();
        if (data) {
          setFormData({
            companyName: data.companyName || '',
            panVat: data.panVat || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            principalName: data.principalName || '',
            establishedYear: data.establishedYear?.toString() || '',
            totalStudents: data.totalStudents?.toString() || '',
            totalTeachers: data.totalTeachers?.toString() || '',
            status: data.status || '',
            schoolId: data.schoolId || '',
            logo: data.logo || '',
          });
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadOrganization();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // Company Name - Required and must start with capital letter
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company Name is required.';
    } else if (!/^[A-Z]/.test(formData.companyName)) {
      newErrors.companyName = 'Company Name must start with a capital letter.';
    }

    // Address - Required and must start with capital letter
    if (!formData.address.trim()) {
      newErrors.address = 'Office Address is required.';
    } else if (!/^[A-Z]/.test(formData.address)) {
      newErrors.address = 'Office Address must start with a capital letter.';
    }

    // Principal Name - Required and must start with capital letter
    if (!formData.principalName.trim()) {
      newErrors.principalName = 'Principal Name is required.';
    } else if (!/^[A-Z]/.test(formData.principalName)) {
      newErrors.principalName = 'Principal Name must start with a capital letter.';
    }

    // Email - Format validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid.';
    }

    // PAN/VAT - Must be exactly 9 digits (numbers only)
    if (formData.panVat && !/^\d{9}$/.test(formData.panVat)) {
      newErrors.panVat = 'PAN/VAT must be exactly 9 digits.';
    }

    // Phone - Must be 10 digits and start with 97 or 98
    if (formData.phone) {
      const phoneStr = formData.phone.replace(/\D/g, ''); // Remove non-digits
      if (phoneStr.length !== 10) {
        newErrors.phone = 'Phone number must be exactly 10 digits.';
      } else if (!phoneStr.startsWith('97') && !phoneStr.startsWith('98')) {
        newErrors.phone = 'Phone number must start with 97 or 98.';
      }
    }

    // Total Students - Numbers only
    if (formData.totalStudents && !/^\d+$/.test(formData.totalStudents)) {
      newErrors.totalStudents = 'Total Students must be numbers only.';
    }

    // Established Year - Numbers only
    if (formData.establishedYear && !/^\d+$/.test(formData.establishedYear)) {
      newErrors.establishedYear = 'Established Year must be numbers only.';
    }

    // Total Teachers - Numbers only
    if (formData.totalTeachers && !/^\d+$/.test(formData.totalTeachers)) {
      newErrors.totalTeachers = 'Total Teachers must be numbers only.';
    }

    // School ID and School Status - No validation required

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setIsLoading(true);
    try {
      await saveOrganization(formData);
      setError(null);
      // Add success notification here
    } catch (err) {
      console.error('Failed to save organization', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to save organization. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Layout/>
    <Sidebar/>

    <div className={styles.section}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Organization Setup</h1>
        <p className={styles.pageSubtitle}>Configure your school&apos;s official business details and branding.</p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <p>Loading organization data...</p>
      ) : !formData.companyName && !error && !showForm ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ color: '#6b7280', marginBottom: '1rem' }}>No Organization Data Available</h3>
          <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>Configure your school&apos;s organization details to get started with the accounting system.</p>
          <Button type="button" onClick={() => setShowForm(true)}>
            Add Organization Details
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <Input
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. Nepal Secondary School"
              required
              error={errors.companyName}
            />
            <Input
              label="PAN/VAT Number"
              name="panVat"
              value={formData.panVat}
              onChange={handleChange}
              placeholder="Enter 9-digit PAN/VAT"
              error={errors.panVat}
            />
            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+977-XXXXXXXXXX"
              error={errors.phone}
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@school.edu.np"
              error={errors.email}
            />
          </div>
          
          <Input
            label="Office Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street, City, District"
            error={errors.address}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Principal Name"
              name="principalName"
              value={formData.principalName || ''}
              onChange={handleChange}
              placeholder="Principal's full name"
              error={errors.principalName}
            />
            <Input
              label="Established Year"
              name="establishedYear"
              value={formData.establishedYear || ''}
              onChange={handleChange}
              placeholder="2024"
              error={errors.establishedYear}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Total Students"
              name="totalStudents"
              value={formData.totalStudents?.toString() || ''}
              onChange={handleChange}
              placeholder="0"
              error={errors.totalStudents}
            />
            <Input
              label="Total Teachers"
              name="totalTeachers"
              value={formData.totalTeachers?.toString() || ''}
              onChange={handleChange}
              placeholder="0"
              error={errors.totalTeachers}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="School Status"
              name="status"
              value={formData.status || ''}
              onChange={handleChange}
              placeholder="active"
              disabled
            />
            <Input
              label="School ID"
              name="schoolId"
              value={formData.schoolId || ''}
              onChange={handleChange}
              placeholder="School ID"
              disabled
            />
          </div>

          <div style={{ border: '2px dashed #e5e7eb', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>School Logo</p>
            {formData.logo ? (
              <div style={{ marginBottom: '1rem' }}>
                <Image 
                  src={formData.logo} 
                  alt="School Logo" 
                  width={150}
                  height={150}
                  style={{ borderRadius: '0.5rem' }}
                />
              </div>
            ) : (
              <div style={{ marginBottom: '1rem', padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>No logo uploaded</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              style={{ display: 'none' }}
              id="logo-upload"
            />
            <Button variant="secondary" type="button" onClick={() => document.getElementById('logo-upload')?.click()}>
              Upload Logo
            </Button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}
    </div>
    </>
  );
};

export default OrganizationSetup;
