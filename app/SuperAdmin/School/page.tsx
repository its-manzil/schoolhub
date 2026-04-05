"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faTrash, 
  faEdit, 
  faSchool, 
  faCalendarAlt,
  faRupeeSign,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faUserShield,
  faCopy,
  faEye,
  faEyeSlash,
  faInfoCircle,
  faSave,
  faSearch,
  faUserGraduate
} from '@fortawesome/free-solid-svg-icons';
import './school.css';
import SuperAdminNavbar from '../components/SuperAdminNavbar';
import StudentImportSection from './components/StudentImportSection';

interface School {
  _id: string;
  schoolId: number;
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  subscription: {
    years: number;
    amount: number;
    subscribedDate: string;
    expiryDate: string;
    isActive: boolean;
    remainingDays: number;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SchoolFormData {
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  subscriptionYears: number;
  adminPassword: string;
}

interface AdminCredentials {
  username: string;
  password: string;
  email: string;
  note?: string;
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [showImportSection, setShowImportSection] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newSchool, setNewSchool] = useState<SchoolFormData>({
    name: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    subscriptionYears: 1,
    adminPassword: ''
  });

  const [editSchool, setEditSchool] = useState<SchoolFormData>({
    name: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    subscriptionYears: 1,
    adminPassword: ''
  });

  const showMessage = useCallback((text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }, []);

  // Fetch schools
  const fetchSchools = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('Please login first', 'error');
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
          showMessage('Session expired. Please login again.', 'error');
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
      showMessage('Failed to load schools. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  // Add new school
  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('Please login first', 'error');
        return;
      }

      const response = await fetch('http://localhost:2056/api/schools', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSchool)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        showMessage('School added successfully with admin account!', 'success');
        setShowAddForm(false);
        
        // Show admin credentials
        if (data.data.adminAccount) {
          setAdminCredentials(data.data.adminAccount);
          setShowCredentials(true);
        }
        
        setNewSchool({
          name: '',
          address: '',
          contactEmail: '',
          contactPhone: '',
          subscriptionYears: 1,
          adminPassword: ''
        });
        fetchSchools(); // Refresh the list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error adding school:', error);
      showMessage(error instanceof Error ? error.message : 'Failed to add school', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit school - load data
  const handleEditSchool = async (school: School) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('Please login first', 'error');
        return;
      }

      const response = await fetch(`http://localhost:2056/api/schools/${school._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        setEditingSchool(school);
        setEditSchool({
          name: data.data.name,
          address: data.data.address,
          contactEmail: data.data.contactEmail,
          contactPhone: data.data.contactPhone,
          subscriptionYears: data.data.subscription.years,
          adminPassword: '' // Don't show existing password for security
        });
        setShowEditForm(true);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error loading school for edit:', error);
      showMessage(error instanceof Error ? error.message : 'Failed to load school data', 'error');
    }
  };

  // Update school
  const handleUpdateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('Please login first', 'error');
        return;
      }

      const response = await fetch(`http://localhost:2056/api/schools/${editingSchool._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editSchool)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        showMessage('School updated successfully!', 'success');
        setShowEditForm(false);
        setEditingSchool(null);
        fetchSchools(); // Refresh the list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating school:', error);
      showMessage(error instanceof Error ? error.message : 'Failed to update school', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete school
  const handleDeleteSchool = async (schoolId: string) => {
    if (!confirm('Are you sure you want to delete this school? This will also remove the associated admin account. This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('Please login first', 'error');
        return;
      }

      console.log('Deleting school with ID:', schoolId);

      const response = await fetch(`http://localhost:2056/api/schools/${schoolId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        showMessage('School deleted successfully!', 'success');
        // Remove from local state immediately
        setSchools(prev => prev.filter(school => school._id !== schoolId));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error deleting school:', error);
      showMessage(error instanceof Error ? error.message : 'Failed to delete school', 'error');
    }
  };

  // Copy credentials to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showMessage('Copied to clipboard!', 'success');
    } catch (err) {
      console.error('Copy to clipboard error:', err);
      showMessage('Failed to copy to clipboard', 'error');
    }
  };

  // Generate suggested password
  const generatePassword = () => {
    const schoolNamePart = newSchool.name.split(' ')[0]?.toLowerCase() || 'school';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generatedPassword = `${schoolNamePart}${randomNum}`;
    setNewSchool(prev => ({ ...prev, adminPassword: generatedPassword }));
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate subscription amount
  const calculateAmount = (years: number) => {
    return years * 30000;
  };

  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    school.schoolId.toString().includes(searchQuery)
  );

  if (isLoading) {
    return (
      <div className="schools-loading">
        <div className="loading-spinner"></div>
        <p>Loading schools...</p>
      </div>
    );
  }

  return (
    <><SuperAdminNavbar/>
    <div className="schools-page">
      <div className="schools-container">
        {/* Header */}
        <div className="schools-header">
          <div className="header-content">
            <h1 className="page-title">
              <FontAwesomeIcon icon={faSchool} className="title-icon" />
              Schools Management
            </h1>
            <p className="page-subtitle">Manage all registered schools and their subscriptions</p>
          </div>
          <div className="header-actions">
            <button
              className="add-school-btn secondary"
              onClick={() => setShowImportSection(!showImportSection)}
            >
              <FontAwesomeIcon icon={faUserGraduate} />
              {showImportSection ? 'View Schools' : 'Add student details'}
            </button>
            <button
              className="add-school-btn"
              onClick={() => setShowAddForm(true)}
            >
              <FontAwesomeIcon icon={faPlus} />
              Add New School
            </button>
          </div>
        </div>

        {/* Search Bar (Only display when not importing) */}
        {!showImportSection && (
          <div className="schools-search-bar">
            <div className="search-input-wrapper">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Search schools by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`message ${message.type}`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Main Content Area */}
        {showImportSection ? (
          <StudentImportSection 
            onClose={() => setShowImportSection(false)}
            schools={schools}
          />
        ) : (
          <div className="schools-grid">
            {filteredSchools.length === 0 ? (
              <div className="empty-state">
                <FontAwesomeIcon icon={faSchool} className="empty-icon" />
                <h3>No Schools Found</h3>
                <p>{searchQuery ? "No schools match your search." : "Get started by adding your first school to the system."}</p>
                {!searchQuery && (
                  <button
                    className="add-school-btn primary"
                    onClick={() => setShowAddForm(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add First School
                  </button>
                )}
              </div>
            ) : (
              filteredSchools.map((school) => (
                <motion.div
                  key={school._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="school-card"
                >
                  <div className="school-header">
                    <div className="school-id">ID: {school.schoolId}</div>
                    <div className={`status-badge ${school.subscription.isActive ? 'active' : 'expired'}`}>
                      <FontAwesomeIcon 
                        icon={school.subscription.isActive ? faCheckCircle : faTimesCircle} 
                      />
                      {school.subscription.isActive ? 'Active' : 'Expired'}
                    </div>
                  </div>

                  <div className="school-info">
                    <h3 className="school-name">{school.name}</h3>
                    <p className="school-address">{school.address}</p>
                    
                    <div className="contact-info">
                      <div className="contact-item">
                        <strong>Email:</strong> {school.contactEmail}
                      </div>
                      <div className="contact-item">
                        <strong>Phone:</strong> {school.contactPhone}
                      </div>
                    </div>
                  </div>

                  <div className="subscription-info">
                    <h4>Subscription Details</h4>
                    <div className="subscription-grid">
                      <div className="subscription-item">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>{school.subscription.years} Year(s)</span>
                      </div>
                      <div className="subscription-item">
                        <FontAwesomeIcon icon={faRupeeSign} />
                        <span>Rs.{school.subscription.amount.toLocaleString()}</span>
                      </div>
                      <div className="subscription-item">
                        <strong>Subscribed:</strong>
                        <span>{formatDate(school.subscription.subscribedDate)}</span>
                      </div>
                      <div className="subscription-item">
                        <strong>Expires:</strong>
                        <span>{formatDate(school.subscription.expiryDate)}</span>
                      </div>
                    </div>

                    <div className="remaining-days">
                      {school.subscription.remainingDays > 30 ? (
                        <div className="days-remaining good">
                          <FontAwesomeIcon icon={faCheckCircle} />
                          {school.subscription.remainingDays} days remaining
                        </div>
                      ) : school.subscription.remainingDays > 0 ? (
                        <div className="days-remaining warning">
                          <FontAwesomeIcon icon={faExclamationTriangle} />
                          {school.subscription.remainingDays} days remaining
                        </div>
                      ) : (
                        <div className="days-remaining expired">
                          <FontAwesomeIcon icon={faTimesCircle} />
                          Subscription expired
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="admin-info">
                    <div className="admin-badge">
                      <FontAwesomeIcon icon={faUserShield} />
                      Admin: {school.schoolId}_admin
                    </div>
                  </div>

                  <div className="school-actions">
                    <button 
                      className="action-btn edit"
                      onClick={() => handleEditSchool(school)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      Edit
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteSchool(school._id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Add School Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => !isSubmitting && setShowAddForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Add New School</h2>
                </div>

                <form onSubmit={handleAddSchool} className="school-form">
                  <div className="form-group">
                    <label>School Name *</label>
                    <input
                      type="text"
                      value={newSchool.name}
                      onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                      required
                      placeholder="Enter school name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Address *</label>
                    <textarea
                      value={newSchool.address}
                      onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                      required
                      placeholder="Enter complete address"
                      rows={3}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact Email *</label>
                      <input
                        type="email"
                        value={newSchool.contactEmail}
                        onChange={(e) => setNewSchool({ ...newSchool, contactEmail: e.target.value })}
                        required
                        placeholder="Enter contact email"
                      />
                    </div>

                    <div className="form-group">
                      <label>Contact Phone *</label>
                      <input
                        type="tel"
                        value={newSchool.contactPhone}
                        onChange={(e) => setNewSchool({ ...newSchool, contactPhone: e.target.value })}
                        required
                        placeholder="Enter contact phone"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Subscription Period *</label>
                    <div className="subscription-selector">
                      <select
                        value={newSchool.subscriptionYears}
                        onChange={(e) => setNewSchool({ ...newSchool, subscriptionYears: parseInt(e.target.value) })}
                        required
                      >
                        <option value={1}>1 Year (Rs.30,000)</option>
                        <option value={2}>2 Years (Rs.60,000)</option>
                        <option value={3}>3 Years (Rs.90,000)</option>
                      </select>
                      <div className="amount-display">
                        Total: Rs.{calculateAmount(newSchool.subscriptionYears).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Admin Password Section */}
                  <div className="form-group">
                    <label>Admin Password</label>
                    <div className="password-input-container">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newSchool.adminPassword}
                        onChange={(e) => setNewSchool({ ...newSchool, adminPassword: e.target.value })}
                        placeholder="Leave empty for auto-generated password"
                        className="password-input"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                    <div className="password-actions">
                      <button
                        type="button"
                        className="generate-password-btn"
                        onClick={generatePassword}
                      >
                        Generate Strong Password
                      </button>
                      <span className="password-note">
                        {newSchool.adminPassword ? 'Using custom password' : 'Will auto-generate: admin{schoolId}'}
                      </span>
                    </div>
                  </div>

                  <div className="admin-note">
                    <FontAwesomeIcon icon={faUserShield} />
                    <span>Admin username will be: [schoolId]_admin</span>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowAddForm(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Adding...' : 'Add School'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit School Modal */}
        <AnimatePresence>
          {showEditForm && editingSchool && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => !isSubmitting && setShowEditForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Edit School</h2>
                  <p>School ID: {editingSchool.schoolId}</p>
                </div>

                <form onSubmit={handleUpdateSchool} className="school-form">
                  <div className="form-group">
                    <label>School Name *</label>
                    <input
                      type="text"
                      value={editSchool.name}
                      onChange={(e) => setEditSchool({ ...editSchool, name: e.target.value })}
                      required
                      placeholder="Enter school name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Address *</label>
                    <textarea
                      value={editSchool.address}
                      onChange={(e) => setEditSchool({ ...editSchool, address: e.target.value })}
                      required
                      placeholder="Enter complete address"
                      rows={3}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact Email *</label>
                      <input
                        type="email"
                        value={editSchool.contactEmail}
                        onChange={(e) => setEditSchool({ ...editSchool, contactEmail: e.target.value })}
                        required
                        placeholder="Enter contact email"
                      />
                    </div>

                    <div className="form-group">
                      <label>Contact Phone *</label>
                      <input
                        type="tel"
                        value={editSchool.contactPhone}
                        onChange={(e) => setEditSchool({ ...editSchool, contactPhone: e.target.value })}
                        required
                        placeholder="Enter contact phone"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Update Subscription Period *</label>
                    <div className="subscription-selector">
                      <select
                        value={editSchool.subscriptionYears}
                        onChange={(e) => setEditSchool({ ...editSchool, subscriptionYears: parseInt(e.target.value) })}
                        required
                      >
                        <option value={1}>1 Year (Rs.30,000)</option>
                        <option value={2}>2 Years (Rs.60,000)</option>
                        <option value={3}>3 Years (Rs.90,000)</option>
                      </select>
                      <div className="amount-display">
                        Total: Rs.{calculateAmount(editSchool.subscriptionYears).toLocaleString()}
                      </div>
                    </div>
                    <div className="subscription-note">
                      <FontAwesomeIcon icon={faInfoCircle} />
                      <span>Updating subscription will reset the start date to today</span>
                    </div>
                  </div>

                  <div className="admin-info-edit">
                    <FontAwesomeIcon icon={faUserShield} />
                    <span>Admin username: {editingSchool.schoolId}_admin</span>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingSchool(null);
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={isSubmitting}
                    >
                      <FontAwesomeIcon icon={faSave} />
                      {isSubmitting ? 'Updating...' : 'Update School'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin Credentials Modal */}
        <AnimatePresence>
          {showCredentials && adminCredentials && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setShowCredentials(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="modal-content credentials-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Admin Account Created</h2>
                  <p>Save these credentials securely</p>
                </div>

                <div className="credentials-container">
                  <div className="credential-item">
                    <label>Username:</label>
                    <div className="credential-value">
                      <span>{adminCredentials.username}</span>
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard(adminCredentials.username)}
                      >
                        <FontAwesomeIcon icon={faCopy} />
                      </button>
                    </div>
                  </div>

                  <div className="credential-item">
                    <label>Password:</label>
                    <div className="credential-value">
                      <span>{adminCredentials.password}</span>
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard(adminCredentials.password)}
                      >
                        <FontAwesomeIcon icon={faCopy} />
                      </button>
                    </div>
                  </div>

                  <div className="credential-item">
                    <label>Email:</label>
                    <div className="credential-value">
                      <span>{adminCredentials.email}</span>
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard(adminCredentials.email)}
                      >
                        <FontAwesomeIcon icon={faCopy} />
                      </button>
                    </div>
                  </div>

                  {adminCredentials.note && (
                    <div className="credential-note">
                      <FontAwesomeIcon icon={faInfoCircle} />
                      {adminCredentials.note}
                    </div>
                  )}
                </div>

                <div className="credentials-warning">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <span>These credentials will not be shown again. Please save them securely.</span>
                </div>

                <div className="form-actions">
                  <button
                    className="btn-primary"
                    onClick={() => setShowCredentials(false)}
                  >
                    I&apos;ve Saved the Credentials
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
}
