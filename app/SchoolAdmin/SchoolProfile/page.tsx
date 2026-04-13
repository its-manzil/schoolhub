"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaSchool, 
  FaCalendarAlt,
  FaEdit, 
  FaSave, 
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaUserTie,
  FaSync,
  FaImage,
  FaSignature,
  FaTrash,
  FaUpload
} from 'react-icons/fa';
import './schoolProfile.css';
import SchoolAdminNavbar from '../Components/SchoolAdminNavbar';

interface School {
  _id: string;
  schoolId: number;
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  principalName: string;
  establishedYear: number;
  totalStudents: number;
  totalTeachers: number;
  subscription: {
    years: number;
    amount: number;
    subscribedDate: string;
    expiryDate: string;
    isActive: boolean;
    remainingDays: number;
    totalPaid: number;
    history: SubscriptionHistory[];
  };
  logo?: string; // Base64 string for logo
  principalSignature?: string; // Base64 string for signature
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionHistory {
  years: number;
  amount: number;
  subscribedDate: string;
  expiryDate: string;
  paymentDate: string;
  transactionId: string;
}

interface SchoolFormData {
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  principalName: string;
  establishedYear: number;
  totalStudents: number;
  totalTeachers: number;
}

export default function SchoolProfile() {
  const router = useRouter();
  const [school, setSchool] = useState<School | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionYears, setSubscriptionYears] = useState(1);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const signatureFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<SchoolFormData>({
    name: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    principalName: '',
    establishedYear: new Date().getFullYear(),
    totalStudents: 0,
    totalTeachers: 0
  });

  const checkAuthentication = useCallback(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/Login');
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user.role !== 'schooladmin') {
        router.push('/Login');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      router.push('/Login');
    }
  }, [router]);

  const fetchSchoolData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/Login');
        return;
      }

      const schoolResponse = await fetch('http://localhost:2056/api/schools/my-school', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!schoolResponse.ok) {
        throw new Error('Failed to fetch school data');
      }

      const schoolData = await schoolResponse.json();
      
      if (schoolData.success) {
        setSchool(schoolData.data);
        setFormData({
          name: schoolData.data.name || '',
          address: schoolData.data.address || '',
          contactEmail: schoolData.data.contactEmail || '',
          contactPhone: schoolData.data.contactPhone || '',
          principalName: schoolData.data.principalName || '',
          establishedYear: schoolData.data.establishedYear || new Date().getFullYear(),
          totalStudents: schoolData.data.totalStudents || 0,
          totalTeachers: schoolData.data.totalTeachers || 0
        });
        
        if (schoolData.data.logo) {
          setLogoPreview(`data:image/jpeg;base64,${schoolData.data.logo}`);
        }
        if (schoolData.data.principalSignature) {
          setSignaturePreview(`data:image/jpeg;base64,${schoolData.data.principalSignature}`);
        }
      } else {
        throw new Error(schoolData.message || 'Failed to load school data');
      }

    } catch (error) {
      console.error('Error fetching school data:', error);
      showMessage(
        error instanceof Error ? error.message : 'Failed to load school data',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuthentication();
    fetchSchoolData();
  }, [checkAuthentication, fetchSchoolData]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // Compress image to under 100KB
  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          let width = img.width;
          let height = img.height;
          let quality = 0.9;
          let base64: string;

          // Calculate new dimensions if image is too large
          const maxDimension = 800;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw image with new dimensions
          ctx?.drawImage(img, 0, 0, width, height);

          // Reduce quality until under 100KB
          const compressIteration = () => {
            base64 = canvas.toDataURL('image/jpeg', quality);
            const base64Length = base64.length - 'data:image/jpeg;base64,'.length;
            const sizeInBytes = 4 * Math.ceil(base64Length / 3) * 0.5624896334383812;
            const sizeInKB = sizeInBytes / 1024;

            if (sizeInKB > 100 && quality > 0.1) {
              quality -= 0.1;
              compressIteration();
            } else {
              // Extract base64 data part (remove data:image/jpeg;base64,)
              const base64Data = base64.split(',')[1];
              resolve(base64Data);
            }
          };

          compressIteration();
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      showMessage('Please upload an image file', 'error');
      return;
    }

    // Check file size (before compression)
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showMessage('Image size should be less than 5MB', 'error');
      return;
    }

    try {
      setUploadingLogo(true);
      
      // Compress image
      const compressedBase64 = await compressImage(file);
      
      // Upload to server
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:2056/api/schools/upload-logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logo: compressedBase64 }),
      });

      const data = await response.json();

      if (data.success) {
        setLogoPreview(`data:image/jpeg;base64,${compressedBase64}`);
        setSchool(prev => prev ? { ...prev, logo: compressedBase64 } : null);
        showMessage('School logo uploaded successfully!', 'success');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      showMessage(error instanceof Error ? error.message : 'Failed to upload logo', 'error');
    } finally {
      setUploadingLogo(false);
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = '';
      }
    }
  };

  const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      showMessage('Please upload an image file', 'error');
      return;
    }

    // Check file size (before compression)
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showMessage('Image size should be less than 5MB', 'error');
      return;
    }

    try {
      setUploadingSignature(true);
      
      // Compress image
      const compressedBase64 = await compressImage(file);
      
      // Upload to server
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:2056/api/schools/upload-signature', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ principalSignature: compressedBase64 }),
      });

      const data = await response.json();

      if (data.success) {
        setSignaturePreview(`data:image/jpeg;base64,${compressedBase64}`);
        setSchool(prev => prev ? { ...prev, principalSignature: compressedBase64 } : null);
        showMessage('Principal signature uploaded successfully!', 'success');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
      showMessage(error instanceof Error ? error.message : 'Failed to upload signature', 'error');
    } finally {
      setUploadingSignature(false);
      if (signatureFileInputRef.current) {
        signatureFileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:2056/api/schools/remove-logo', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setLogoPreview(null);
        setSchool(prev => prev ? { ...prev, logo: undefined } : null);
        showMessage('School logo removed successfully!', 'success');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error removing logo:', error);
      showMessage(error instanceof Error ? error.message : 'Failed to remove logo', 'error');
    }
  };

  const handleRemoveSignature = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:2056/api/schools/remove-signature', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSignaturePreview(null);
        setSchool(prev => prev ? { ...prev, principalSignature: undefined } : null);
        showMessage('Principal signature removed successfully!', 'success');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error removing signature:', error);
      showMessage(error instanceof Error ? error.message : 'Failed to remove signature', 'error');
    }
  };

  const handleEditToggle = () => {
    if (isEditing && school) {
      // Reset form data when canceling edit
      setFormData({
        name: school.name || '',
        address: school.address || '',
        contactEmail: school.contactEmail || '',
        contactPhone: school.contactPhone || '',
        principalName: school.principalName || '',
        establishedYear: school.establishedYear || new Date().getFullYear(),
        totalStudents: school.totalStudents || 0,
        totalTeachers: school.totalTeachers || 0
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSubmit = async () => {
    if (!school) return;
    
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      // Use school admin specific endpoint
      const response = await fetch(`http://localhost:2056/api/schools/admin/update-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSchool(data.data);
        setIsEditing(false);
        showMessage('School details updated successfully!', 'success');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating school:', error);
      showMessage(error instanceof Error ? error.message : 'Failed to update school details', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSubscription = async () => {
    if (!school) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:2056/api/schools/admin/add-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          years: subscriptionYears,
          advanceSubscription: true
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSchool(data.data);
        setShowSubscriptionModal(false);
        setSubscriptionYears(1);
        showMessage('Subscription added successfully!', 'success');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error adding subscription:', error);
      showMessage(error instanceof Error ? error.message : 'Failed to add subscription', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveClick = async () => {
    await handleSubmit();
  };

  const handleSubscriptionClick = async () => {
    await handleAddSubscription();
  };

  const calculateSubscriptionAmount = (years: number) => {
    return years * 30000;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleNumberInput = (value: string, field: keyof SchoolFormData) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  const handleYearInput = (value: string) => {
    const year = parseInt(value) || new Date().getFullYear();
    const currentYear = new Date().getFullYear();
    const validYear = Math.max(1900, Math.min(year, currentYear));
    setFormData(prev => ({ ...prev, establishedYear: validYear }));
  };

  if (isLoading) {
    return (
      <div className="school-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading school profile...</p>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="school-profile-error">
        <FaExclamationTriangle className="error-icon" />
        <h3>Unable to Load School Data</h3>
        <p>We couldnt load your school information. Please try again.</p>
        <div className="error-actions">
          <button 
            onClick={fetchSchoolData} 
            className="retry-btn"
          >
            <FaSync />
            Try Again
          </button>
          <button 
            onClick={() => router.push('/SchoolAdmin/Dashboard')} 
            className="dashboard-btn"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SchoolAdminNavbar/>
      <div className="school-profile-container">
        {/* Header Section */}
        <div className="profile-header">
          <div className="header-content">
            <div className="school-basic-info">
              <div className="school-avatar">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="School Logo" 
                    className="school-logo-preview"
                  />
                ) : (
                  <FaSchool className="school-icon" />
                )}
              </div>
              <div className="school-title">
                <h1>{school.name}</h1>
                <p>School ID: {school.schoolId}</p>
              </div>
            </div>
            <div className="header-actions">
              {!isEditing ? (
                <button onClick={handleEditToggle} className="edit-btn">
                  <FaEdit />
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button onClick={handleEditToggle} className="cancel-btn">
                    <FaTimes />
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveClick}
                    className="save-btn"
                    disabled={isSubmitting}
                  >
                    <FaSave />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
              <button 
                onClick={() => setShowSubscriptionModal(true)}
                className="subscription-btn"
              >
                <FaCalendarAlt />
                Add Subscription
              </button>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            {message.text}
          </div>
        )}

        {/* Image Upload Section */}
        <div className="image-upload-section">
          <div className="upload-card">
            <h3>
              <FaImage />
              School Logo
            </h3>
            <div className="upload-area">
              {logoPreview ? (
                <div className="image-preview-container">
                  <img 
                    src={logoPreview} 
                    alt="School Logo Preview" 
                    className="image-preview"
                  />
                  <div className="image-actions">
                    <button 
                      onClick={() => logoFileInputRef.current?.click()}
                      className="replace-btn"
                      disabled={uploadingLogo}
                    >
                      <FaUpload />
                      {uploadingLogo ? 'Uploading...' : 'Replace'}
                    </button>
                    <button 
                      onClick={handleRemoveLogo}
                      className="remove-btn"
                    >
                      <FaTrash />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <FaImage className="placeholder-icon" />
                  <p>No logo uploaded</p>
                  <button 
                    onClick={() => logoFileInputRef.current?.click()}
                    className="upload-btn"
                    disabled={uploadingLogo}
                  >
                    <FaUpload />
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  </button>
                </div>
              )}
              <input
                type="file"
                ref={logoFileInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
            <p className="upload-note">Max size: 5MB, will be compressed to 100KB</p>
          </div>

          <div className="upload-card">
            <h3>
              <FaSignature />
              Principal Signature
            </h3>
            <div className="upload-area">
              {signaturePreview ? (
                <div className="image-preview-container">
                  <img 
                    src={signaturePreview} 
                    alt="Principal Signature Preview" 
                    className="image-preview"
                  />
                  <div className="image-actions">
                    <button 
                      onClick={() => signatureFileInputRef.current?.click()}
                      className="replace-btn"
                      disabled={uploadingSignature}
                    >
                      <FaUpload />
                      {uploadingSignature ? 'Uploading...' : 'Replace'}
                    </button>
                    <button 
                      onClick={handleRemoveSignature}
                      className="remove-btn"
                    >
                      <FaTrash />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <FaSignature className="placeholder-icon" />
                  <p>No signature uploaded</p>
                  <button 
                    onClick={() => signatureFileInputRef.current?.click()}
                    className="upload-btn"
                    disabled={uploadingSignature}
                  >
                    <FaUpload />
                    {uploadingSignature ? 'Uploading...' : 'Upload Signature'}
                  </button>
                </div>
              )}
              <input
                type="file"
                ref={signatureFileInputRef}
                onChange={handleSignatureUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
            <p className="upload-note">Max size: 5MB, will be compressed to 100KB</p>
          </div>
        </div>

        {/* Subscription Summary Card */}
        <div className="subscription-summary-card">
          <div className="subscription-status">
            <div className="status-indicator">
              <div className={`status-badge ${school.subscription.isActive ? 'active' : 'expired'}`}>
                {school.subscription.isActive ? 'Active' : 'Expired'}
              </div>
              <div className="remaining-days">
                {school.subscription.remainingDays > 0 
                  ? `${school.subscription.remainingDays} days remaining`
                  : 'Subscription expired'
                }
              </div>
            </div>
            <div className="subscription-amount">
              <div className="amount-label">Total Paid</div>
              <div className="amount-value">{formatCurrency(school.subscription.totalPaid || school.subscription.amount)}</div>
            </div>
          </div>
          
          <div className="subscription-details">
            <div className="detail-item">
              <FaCalendarAlt />
              <span>Current Plan: {school.subscription.years} Year(s)</span>
            </div>
            <div className="detail-item">
              <FaCalendarAlt />
              <span>Subscribed: {formatDate(school.subscription.subscribedDate)}</span>
            </div>
            <div className="detail-item">
              <FaCalendarAlt />
              <span>Expires: {formatDate(school.subscription.expiryDate)}</span>
            </div>
          </div>
        </div>

        <div className="profile-content">
          {/* School Details Form/Card */}
          <div className="details-card">
            <h2>School Information</h2>
            {isEditing ? (
              <form onSubmit={(e) => e.preventDefault()} className="edit-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>School Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Email</label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Principal Name</label>
                    <input
                      type="text"
                      value={formData.principalName}
                      onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Established Year</label>
                    <input
                      type="number"
                      value={formData.establishedYear.toString()}
                      onChange={(e) => handleYearInput(e.target.value)}
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div className="form-group">
                    <label>Total Students</label>
                    <input
                      type="number"
                      value={formData.totalStudents.toString()}
                      onChange={(e) => handleNumberInput(e.target.value, 'totalStudents')}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Total Teachers</label>
                    <input
                      type="number"
                      value={formData.totalTeachers.toString()}
                      onChange={(e) => handleNumberInput(e.target.value, 'totalTeachers')}
                      min="0"
                    />
                  </div>
                </div>
              </form>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <FaSchool />
                  <div>
                    <label>School Name</label>
                    <span>{school.name}</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <FaMapMarkerAlt />
                  <div>
                    <label>Address</label>
                    <span>{school.address}</span>
                  </div>
                </div>

                <div className="info-item">
                  <FaEnvelope />
                  <div>
                    <label>Contact Email</label>
                    <span>{school.contactEmail}</span>
                  </div>
                </div>

                <div className="info-item">
                  <FaPhone />
                  <div>
                    <label>Contact Phone</label>
                    <span>{school.contactPhone}</span>
                  </div>
                </div>

                <div className="info-item">
                  <FaUserTie />
                  <div>
                    <label>Principal Name</label>
                    <span>{school.principalName || 'Not specified'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <FaCalendarAlt />
                  <div>
                    <label>Established Year</label>
                    <span>{school.establishedYear || 'Not specified'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <FaSchool />
                  <div>
                    <label>Total Students</label>
                    <span>{(school.totalStudents || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="info-item">
                  <FaUserTie />
                  <div>
                    <label>Total Teachers</label>
                    <span>{(school.totalTeachers || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Subscription History */}
          <div className="subscription-history-card">
            <h2>Subscription History</h2>
            {school.subscription.history && school.subscription.history.length > 0 ? (
              <div className="history-list">
                {school.subscription.history.map((subscription, index) => (
                  <div key={index} className="history-item">
                    <div className="history-main">
                      <span className="years">{subscription.years} Year Plan</span>
                      <span className="amount">{formatCurrency(subscription.amount)}</span>
                    </div>
                    <div className="history-dates">
                      <span>Paid: {formatDate(subscription.paymentDate)}</span>
                      <span>Expired: {formatDate(subscription.expiryDate)}</span>
                      {subscription.transactionId && (
                        <span>TXN: {subscription.transactionId}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-history">
                <FaInfoCircle />
                <p>No subscription history available</p>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Modal */}
        {showSubscriptionModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Add Subscription</h2>
                <button 
                  onClick={() => setShowSubscriptionModal(false)}
                  className="close-btn"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body">
                <div className="current-subscription-info">
                  <h4>Current Subscription</h4>
                  <p>Remaining Days: <strong>{school.subscription.remainingDays} days</strong></p>
                  <p>Expiry Date: <strong>{formatDate(school.subscription.expiryDate)}</strong></p>
                </div>

                <div className="subscription-options">
                  <label>Select Subscription Period</label>
                  <div className="subscription-plans">
                    {[1, 2, 3].map((years) => (
                      <div
                        key={years}
                        className={`plan-option ${subscriptionYears === years ? 'selected' : ''}`}
                        onClick={() => setSubscriptionYears(years)}
                      >
                        <div className="plan-years">{years} Year{years > 1 ? 's' : ''}</div>
                        <div className="plan-amount">{formatCurrency(calculateSubscriptionAmount(years))}</div>
                        <div className="plan-savings">
                          {years > 1 && `Save ${formatCurrency(30000 - calculateSubscriptionAmount(years)/years)}/year`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="subscription-summary">
                  <h4>Subscription Summary</h4>
                  <div className="summary-item">
                    <span>New Subscription:</span>
                    <span>{subscriptionYears} Year{subscriptionYears > 1 ? 's' : ''}</span>
                  </div>
                  <div className="summary-item">
                    <span>Amount:</span>
                    <span>{formatCurrency(calculateSubscriptionAmount(subscriptionYears))}</span>
                  </div>
                  <div className="summary-item total">
                    <span>Total Payable:</span>
                    <span>{formatCurrency(calculateSubscriptionAmount(subscriptionYears))}</span>
                  </div>
                  <div className="subscription-note">
                    <FaInfoCircle />
                    <span>New subscription will be added to your remaining {school.subscription.remainingDays} days</span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubscriptionClick}
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
