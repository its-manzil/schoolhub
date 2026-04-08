"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import './organization-setup.css';
import AdmLayout from "./components/AdmLayout";

export default function Administrative() {
    const [editMode, setEditMode] = useState(false);
    const [pSignPreview, setPSignPreview] = useState<string | null>(null);
    const [cSignPreview, setCSignPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        contact: "+1 (555) 019-2834",
        website: "https://www.yourschool.com",
        pan: "ABCDE1234F",
        vat: "987654321",
        pName: "Dr. Robert Downey",
        cName: "Scarlett Johansson",
        establishedYear: "2010"
    });

    const toggleEdit = () => {
        setEditMode(!editMode);
    };

    const handlePSignSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => setPSignPreview(e.target?.result as string);
                reader.readAsDataURL(file);
            }
        }
    };

    const handleCSignSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => setCSignPreview(e.target?.result as string);
                reader.readAsDataURL(file);
            }
        }
    };

    // Mapping for specific field names that don't follow the 'in' prefix rule perfectly
    const handleFieldChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const saveData = () => {
        toggleEdit();
        alert('Organization data saved successfully!');
    };

    return (
        <AdmLayout>
            <div className={`org-setup-main ${editMode ? 'edit-mode' : ''}`} id="mainWrapper">
                <h1 className="header" style={{ fontSize: '24px', color: '#1a2530', fontWeight: '600', marginBottom: '20px' }}>Organizational Setup</h1>
                
                <div className="org-setup-card">
                    <div className="card-title-row">
                        <div className="card-title">Organization Overview</div>
                        <div>
                            {!editMode ? (
                                <button className="org-btn edit-btn" id="toggleEditBtn" onClick={toggleEdit}>Edit Overview</button>
                            ) : (
                                <>
                                    <button className="org-btn" style={{ backgroundColor: '#e53e3e', color: '#fff', boxShadow: '0 4px 12px rgba(229, 62, 62, 0.2)', marginRight: '10px' }} onClick={toggleEdit}>Cancel Edit</button>
                                    <button className="org-btn submit-btn" onClick={saveData}>Save Overview</button>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="form-row" style={{ alignItems: 'center' }}>
                        <div 
                            className="form-group upload-container locked"
                        >
                            <label>Company Logo</label>
                            <div className="info-value view-item">
                                {"Logo On File"}
                            </div>
                            <div className="upload-box edit-item" style={{ display: editMode ? 'flex' : 'none' }}>
                                Logo Locked
                            </div>
                        </div>
                        
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="form-group locked">
                                <label>School/Company Name</label>
                                <div className="info-value view-item">Bright Future Academy</div>
                                <input className="edit-item" style={{ display: editMode ? 'block' : 'none' }} type="text" value="Bright Future Academy" readOnly />
                            </div>
                            
                            <div className="form-group locked">
                                <label>Registered Address</label>
                                <div className="info-value view-item">123 Education Way, Sector 4</div>
                                <input className="edit-item" style={{ display: editMode ? 'block' : 'none' }} type="text" value="123 Education Way, Sector 4" readOnly />
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>School Contact Number</label>
                            {!editMode ? (
                                <div className="info-value view-item" id="lblContact">{formData.contact}</div>
                            ) : (
                                <input className="edit-item" type="text" id="inContact" value={formData.contact} onChange={(e) => handleFieldChange('contact', e.target.value)} />
                            )}
                        </div>
                        <div className="form-group">
                            <label>Website & URLs</label>
                            {!editMode ? (
                                <div className="info-value view-item" id="lblWeb">{formData.website}</div>
                            ) : (
                                <input className="edit-item" type="url" id="inWeb" value={formData.website} onChange={(e) => handleFieldChange('website', e.target.value)} />
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group locked">
                            <label>Established Year</label>
                            <div className="info-value view-item">{formData.establishedYear}</div>
                            <input className="edit-item" style={{ display: editMode ? 'block' : 'none' }} type="text" value={formData.establishedYear} readOnly />
                        </div>
                        <div className="form-group">
                            <label>PAN (Permanent Account Number)</label>
                            {!editMode ? (
                                <div className="info-value view-item" id="lblPan">{formData.pan}</div>
                            ) : (
                                <input className="edit-item" type="text" id="inPan" value={formData.pan} onChange={(e) => handleFieldChange('pan', e.target.value)} />
                            )}
                        </div>
                        <div className="form-group">
                            <label>VAT Number</label>
                            {!editMode ? (
                                <div className="info-value view-item" id="lblVat">{formData.vat}</div>
                            ) : (
                                <input className="edit-item" type="text" id="inVat" value={formData.vat} onChange={(e) => handleFieldChange('vat', e.target.value)} />
                            )}
                        </div>
                    </div>

                    <div className="combined-signatures-row">
                        
                        <div className="signature-block">
                            <div className="upload-group">
                                <div className="form-group">
                                    <label>Principal Sign</label>
                                    {!editMode ? (
                                        <div className="info-value view-item">
                                            {pSignPreview ? (
                                                <Image src={pSignPreview} alt="Principal Signature" width={100} height={40} style={{ objectFit: 'contain' }} />
                                            ) : (
                                                "✍️ Not Uploaded"
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <label htmlFor="princ-sign" className="upload-box edit-item">
                                                {pSignPreview ? (
                                                    <Image src={pSignPreview} alt="Principal Signature Preview" width={100} height={100} style={{ objectFit: 'contain' }} />
                                                ) : (
                                                    "📤 Click Upload"
                                                )}
                                            </label>
                                            <input type="file" id="princ-sign" accept="image/*" style={{ display: 'none' }} onChange={handlePSignSelect} />
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="name-group">
                                <div className="form-group">
                                    <label>Principal Name</label>
                                    {!editMode ? (
                                        <div className="info-value view-item" id="lblPName">{formData.pName}</div>
                                    ) : (
                                        <input className="edit-item" type="text" id="inPName" value={formData.pName} onChange={(e) => handleFieldChange('pName', e.target.value)} />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="signature-block">
                            <div className="upload-group">
                                <div className="form-group">
                                    <label>Coordinator Sign</label>
                                    {!editMode ? (
                                        <div className="info-value view-item">
                                            {cSignPreview ? (
                                                <Image src={cSignPreview} alt="Coordinator Signature" width={100} height={40} style={{ objectFit: 'contain' }} />
                                            ) : (
                                                "✍️ Not Uploaded"
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <label htmlFor="coord-sign" className="upload-box edit-item">
                                                {cSignPreview ? (
                                                    <Image src={cSignPreview} alt="Coordinator Signature Preview" width={100} height={100} style={{ objectFit: 'contain' }} />
                                                ) : (
                                                    "📤 Click Upload"
                                                )}
                                            </label>
                                            <input type="file" id="coord-sign" accept="image/*" style={{ display: 'none' }} onChange={handleCSignSelect} />
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="name-group">
                                <div className="form-group">
                                    <label>Coordinator Name</label>
                                    {!editMode ? (
                                        <div className="info-value view-item" id="lblCName">{formData.cName}</div>
                                    ) : (
                                        <input className="edit-item" type="text" id="inCName" value={formData.cName} onChange={(e) => handleFieldChange('cName', e.target.value)} />
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AdmLayout>
    );
}
