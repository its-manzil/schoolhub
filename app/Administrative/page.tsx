"use client";

import React, { useState, useEffect } from 'react';
import './organization-setup.css';
import AdmLayout from "./components/AdmLayout";

interface SchoolData {
    schoolId: number;
    name: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    establishedYear?: string;
    principalName?: string;
    totalStudents?: number;
    totalTeachers?: number;
    pan?: string;
    vat?: string;
    panVat?: string;
    logo?: string;
    website?: string;
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

export default function Administrative() {
    // School data state (read-only)
    const [school, setSchool] = useState<SchoolData | null>(null);
    const [schoolLoading, setSchoolLoading] = useState(true);

    // Admin contacts state (editable)
    const [adminContact, setAdminContact] = useState<AdminContact | null>(null);
    const [adminForm, setAdminForm] = useState({
        adminPhone: "",
        adminEmail: ""
    });
    const [contactLoading, setContactLoading] = useState(true);
    const [savingContact, setSavingContact] = useState(false);

    // Get schoolId from localStorage user data
    const getSchoolId = (): number | null => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                return user.schoolId || 1001; // Default to 1001 if not found
            }
        } catch (error) {
            console.error('Error getting schoolId:', error);
        }
        return 1001; // Default schoolId
    };

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    };

    // Load school data (read-only)
    useEffect(() => {
        const fetchSchoolData = async () => {
            try {
                const schoolId = getSchoolId();
                if (!schoolId) return;

                const response = await fetch(`/api/schools/school/${schoolId}`, {
                    headers: getAuthHeaders()
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        setSchool(result.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching school data:', error);
            } finally {
                setSchoolLoading(false);
            }
        };

        fetchSchoolData();
    }, []);

    // Load admin contacts from schools table
    useEffect(() => {
        const fetchAdminContacts = async () => {
            try {
                const schoolId = getSchoolId();
                if (!schoolId) return;

                const response = await fetch(`/api/admin-contacts/${schoolId}`, {
                    headers: getAuthHeaders()
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        setAdminContact(result.data);
                        setAdminForm({
                            adminPhone: result.data.adminPhone || "",
                            adminEmail: result.data.adminEmail || ""
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching admin contacts:', error);
            } finally {
                setContactLoading(false);
            }
        };

        fetchAdminContacts();
    }, []);

    // Handle admin form changes
    const handleAdminFormChange = (field: string, value: string) => {
        setAdminForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Save admin contacts (insert only - append mode)
    const saveAdminContacts = async () => {
        try {
            setSavingContact(true);
            const schoolId = getSchoolId();
            if (!schoolId) return;

            const response = await fetch(`/api/admin-contacts/${schoolId}`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(adminForm)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setAdminContact(result.data);
                    alert("Admin contact saved successfully");
                }
            } else {
                const error = await response.json();
                alert(error.message || "Failed to save admin contact");
            }
        } catch (error) {
            console.error('Error saving admin contact:', error);
            alert("Failed to save admin contact");
        } finally {
            setSavingContact(false);
        }
    };

    // Helper function to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    // Helper function to render info value
    const renderInfoValue = (value: string | number | undefined, fallback = 'N/A') => {
        return <div className="info-value view-item">{value || fallback}</div>;
    };

    return (
        <AdmLayout>
            <div className="org-setup-main" id="mainWrapper">
                <h1 className="header" style={{ fontSize: '24px', color: '#1a2530', fontWeight: '600', marginBottom: '20px' }}>Organizational Setup</h1>

                {/* SECTION 1: SCHOOL PROFILE (READ ONLY) */}
                <div className="org-setup-card">
                    <div className="card-title-row">
                        <div className="card-title">🏫 School Information (Read Only)</div>
                        <div style={{ fontSize: '12px', color: '#718096', fontStyle: 'italic' }}>
                            System-controlled data
                        </div>
                    </div>

                    {schoolLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #e2e8f0', borderTopColor: '#00d2c4', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <p style={{ marginTop: '10px', color: '#718096' }}>Loading school data...</p>
                        </div>
                    ) : school ? (
                        <>
                            <div className="form-row" style={{ alignItems: 'center' }}>
                                <div className="form-group upload-container locked">
                                    <label>School Logo</label>
                                    {school.logo ? (
                                        <img 
                                            src={`data:image/jpeg;base64,${school.logo}`} 
                                            alt="School Logo" 
                                            style={{ width: '150px', height: '120px', objectFit: 'contain', borderRadius: '8px' }} 
                                        />
                                    ) : (
                                        <div className="info-value view-item" style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            🏫 No Logo
                                        </div>
                                    )}
                                </div>

                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div className="form-group locked">
                                        <label>School Name</label>
                                        {renderInfoValue(school.name)}
                                    </div>

                                    <div className="form-group locked">
                                        <label>Registered Address</label>
                                        {renderInfoValue(school.address)}
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group locked">
                                    <label>Contact Email</label>
                                    {renderInfoValue(school.contactEmail)}
                                </div>
                                <div className="form-group locked">
                                    <label>Contact Phone</label>
                                    {renderInfoValue(school.contactPhone)}
                                </div>
                                <div className="form-group locked">
                                    <label>Website</label>
                                    {renderInfoValue(school.website)}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group locked">
                                    <label>Established Year</label>
                                    {renderInfoValue(school.establishedYear)}
                                </div>
                                <div className="form-group locked">
                                    <label>Principal Name</label>
                                    {renderInfoValue(school.principalName)}
                                </div>
                                <div className="form-group locked">
                                    <label>School ID</label>
                                    {renderInfoValue(school.schoolId)}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group locked">
                                    <label>Total Students</label>
                                    {renderInfoValue(school.totalStudents, '0')}
                                </div>
                                <div className="form-group locked">
                                    <label>Total Teachers</label>
                                    {renderInfoValue(school.totalTeachers, '0')}
                                </div>
                                <div className="form-group locked">
                                    <label>PAN/VAT</label>
                                    {renderInfoValue(school.panVat || school.pan || school.vat)}
                                </div>
                            </div>

                            {school.subscription && (
                                <div className="form-row">
                                    <div className="form-group locked">
                                        <label>Subscription Status</label>
                                        <div className="info-value view-item" style={{
                                            color: school.subscription.isActive ? '#059669' : '#dc2626',
                                            fontWeight: '600'
                                        }}>
                                            {school.subscription.isActive ? '✅ Active' : '❌ Inactive'}
                                        </div>
                                    </div>
                                    <div className="form-group locked">
                                        <label>Subscription Years</label>
                                        {renderInfoValue(school.subscription.years)}
                                    </div>
                                    <div className="form-group locked">
                                        <label>Expiry Date</label>
                                        {renderInfoValue(formatDate(school.subscription.expiryDate))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                            Failed to load school data
                        </div>
                    )}
                </div>

                {/* SECTION 2: ADMINISTRATIVE CONTACTS (EDITABLE) */}
                <div className="org-setup-card">
                    <div className="card-title-row">
                        <div className="card-title">📞 Administrative Contacts (Editable)</div>
                        <div style={{ fontSize: '12px', color: '#718096', fontStyle: 'italic' }}>
                            Latest record is active
                        </div>
                    </div>

                    {contactLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #e2e8f0', borderTopColor: '#00d2c4', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <p style={{ marginTop: '10px', color: '#718096' }}>Loading admin contacts...</p>
                        </div>
                    ) : (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Admin Phone</label>
                                    <input
                                        type="text"
                                        value={adminForm.adminPhone}
                                        onChange={(e) => handleAdminFormChange('adminPhone', e.target.value)}
                                        placeholder="Enter admin phone number"
                                        style={{
                                            padding: '12px 16px',
                                            border: '1px solid #cbd5e0',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            outline: 'none',
                                            backgroundColor: '#f8fafc',
                                            transition: 'border-color 0.2s, box-shadow 0.2s',
                                            width: '100%'
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Admin Email</label>
                                    <input
                                        type="email"
                                        value={adminForm.adminEmail}
                                        onChange={(e) => handleAdminFormChange('adminEmail', e.target.value)}
                                        placeholder="Enter admin email address"
                                        style={{
                                            padding: '12px 16px',
                                            border: '1px solid #cbd5e0',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            outline: 'none',
                                            backgroundColor: '#f8fafc',
                                            transition: 'border-color 0.2s, box-shadow 0.2s',
                                            width: '100%'
                                        }}
                                    />
                                </div>
                            </div>

                            {adminContact && (
                                <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f0fff4', borderRadius: '8px', border: '1px solid #9ae6b4' }}>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#22543d' }}>
                                        <strong>Last saved:</strong> {new Date(adminContact.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    className="org-btn submit-btn"
                                    onClick={saveAdminContacts}
                                    disabled={savingContact}
                                    style={{
                                        opacity: savingContact ? 0.7 : 1,
                                        cursor: savingContact ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {savingContact ? 'Saving...' : 'Save Admin Contacts'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </AdmLayout>
    );
}
