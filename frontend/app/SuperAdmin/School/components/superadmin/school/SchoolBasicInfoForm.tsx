'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSchool, faMapMarkerAlt, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { SchoolFormData } from '../../../types';
import '../../../styles/superadmin/school/school-basic-info.css';

interface SchoolBasicInfoFormProps {
  formData: SchoolFormData;
  onChange: (field: keyof SchoolFormData, value: string) => void;
  errors?: Record<string, string>;
}

export default function SchoolBasicInfoForm({ formData, onChange, errors = {} }: SchoolBasicInfoFormProps) {
  return (
    <div className="school-basic-info-container">
      <div className="school-basic-info-header">
        <h3 className="school-basic-info-title">School Information</h3>
        <p className="school-basic-info-description">
          Enter the basic details of the school you want to add.
        </p>
      </div>

      <div className="school-basic-info-form">
        {/* School Name */}
        <div className="school-basic-info-field full-width">
          <label className="school-basic-info-label">
            <FontAwesomeIcon icon={faSchool} />
            School Name <span className="required">*</span>
          </label>
          <input
            type="text"
            className={`school-basic-info-input ${errors.name ? 'error' : ''}`}
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="e.g., Kathmandu International School"
          />
          {errors.name && (
            <span className="school-basic-info-error">{errors.name}</span>
          )}
        </div>

        {/* Address */}
        <div className="school-basic-info-field full-width">
          <label className="school-basic-info-label">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            Address <span className="required">*</span>
          </label>
          <textarea
            className={`school-basic-info-textarea ${errors.address ? 'error' : ''}`}
            value={formData.address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="Enter complete school address"
            rows={3}
          />
          {errors.address && (
            <span className="school-basic-info-error">{errors.address}</span>
          )}
        </div>

        <div className="school-basic-info-row">
          {/* Contact Email */}
          <div className="school-basic-info-field">
            <label className="school-basic-info-label">
              <FontAwesomeIcon icon={faEnvelope} />
              Contact Email <span className="required">*</span>
            </label>
            <input
              type="email"
              className={`school-basic-info-input ${errors.contactEmail ? 'error' : ''}`}
              value={formData.contactEmail}
              onChange={(e) => onChange('contactEmail', e.target.value)}
              placeholder="school@example.com"
            />
            {errors.contactEmail && (
              <span className="school-basic-info-error">{errors.contactEmail}</span>
            )}
          </div>

          {/* Contact Phone */}
          <div className="school-basic-info-field">
            <label className="school-basic-info-label">
              <FontAwesomeIcon icon={faPhone} />
              Contact Phone <span className="required">*</span>
            </label>
            <input
              type="tel"
              className={`school-basic-info-input ${errors.contactPhone ? 'error' : ''}`}
              value={formData.contactPhone}
              onChange={(e) => onChange('contactPhone', e.target.value)}
              placeholder="+977-XXXXXXXXXX"
            />
            {errors.contactPhone && (
              <span className="school-basic-info-error">{errors.contactPhone}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
