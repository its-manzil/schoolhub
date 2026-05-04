'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSchool, faArrowRight, faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';

import SchoolBasicInfoForm from './SchoolBasicInfoForm';
import TrialToggleSection from './TrialToggleSection';
import SubscriptionSection from './SubscriptionSection';
import PricingSummary from './PricingSummary';
import AdminCredentialsSection from './AdminCredentialsSection';
import SuccessCredentialsView from './SuccessCredentialsView';

import { SchoolFormData, AdminCredentials } from '../../../types';
import { generatePassword } from '../../../lib/utils';

import '../../../styles/superadmin/school/add-school-modal.css';

interface PricingConfig {
  yearly: number;
}

interface AddSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SchoolFormData) => Promise<{ success: boolean; adminAccount?: AdminCredentials }>;
  isSubmitting: boolean;
}

const initialFormData: SchoolFormData = {
  name: '',
  address: '',
  contactEmail: '',
  contactPhone: '',
  subscriptionYears: 1,
  adminPassword: '',
  isTrial: false,
  trialEndsAt: null,
  subscriptionEndsAt: null,
  status: 'active'
};

export default function AddSchoolModal({ isOpen, onClose, onSubmit, isSubmitting }: AddSchoolModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SchoolFormData>(initialFormData);
  const [pricing, setPricing] = useState<PricingConfig>({ yearly: 20000 });
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [credentials, setCredentials] = useState<AdminCredentials | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch pricing when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPricing();
    }
  }, [isOpen]);

  const fetchPricing = async () => {
    setIsLoadingPricing(true);
    try {
      const response = await fetch('http://localhost:2056/api/schools/pricing/public');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.rates) {
          setPricing({ yearly: data.data.rates.yearly || 20000 });
        }
      }
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
    } finally {
      setIsLoadingPricing(false);
    }
  };

  const handleChange = useCallback((field: keyof SchoolFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleTrialToggle = useCallback((isTrial: boolean) => {
    setFormData(prev => ({
      ...prev,
      isTrial,
      status: isTrial ? 'trial' : 'active',
      trialEndsAt: isTrial ? calculateTrialEndDate() : null
    }));
  }, []);

  const calculateTrialEndDate = (): string => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString();
  };

  const calculateSubscriptionEndDate = (years: number): string => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + years);
    return date.toISOString();
  };

  const handleGeneratePassword = useCallback(() => {
    const password = generatePassword(formData.name || 'School');
    handleChange('adminPassword', password);
  }, [formData.name, handleChange]);

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'School name is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.isTrial && !formData.subscriptionYears) {
      newErrors.subscription = 'Please select a subscription plan';
    }
    if (!formData.adminPassword.trim()) {
      newErrors.adminPassword = 'Admin password is required';
    } else if (formData.adminPassword.length < 6) {
      newErrors.adminPassword = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    // Prepare final data with calculated dates
    const finalData: SchoolFormData = {
      ...formData,
      subscriptionEndsAt: formData.isTrial
        ? null
        : calculateSubscriptionEndDate(formData.subscriptionYears),
      trialEndsAt: formData.isTrial ? calculateTrialEndDate() : null,
      status: formData.isTrial ? 'trial' : 'active'
    };

    const result = await onSubmit(finalData);

    if (result.success && result.adminAccount) {
      setCredentials(result.adminAccount);
      setShowSuccess(true);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData(initialFormData);
    setErrors({});
    setCredentials(null);
    setShowSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="add-school-modal-overlay" onClick={handleClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="add-school-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="add-school-modal-header">
          <div className="add-school-modal-title-section">
            <div className="add-school-modal-icon primary">
              <FontAwesomeIcon icon={faSchool} />
            </div>
            <div>
              <h2 className="add-school-modal-title">
                {showSuccess ? 'Success!' : 'Add New School'}
              </h2>
              <p className="add-school-modal-subtitle">
                {showSuccess ? 'School created successfully' : `Step ${step} of 2`}
              </p>
            </div>
          </div>
          <button className="add-school-modal-close-btn" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Progress Bar (only show during form steps) */}
        {!showSuccess && (
          <div className="add-school-progress-bar">
            <div className="add-school-progress-step">
              <div className={`add-school-step-number ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                {step > 1 ? <FontAwesomeIcon icon={faPlus} /> : 1}
              </div>
              <span className={`add-school-step-label ${step < 1 ? 'inactive' : ''}`}>School Info</span>
            </div>
            <div className={`add-school-progress-line ${step > 1 ? 'completed' : ''}`}></div>
            <div className="add-school-progress-step">
              <div className={`add-school-step-number ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                {step > 2 ? <FontAwesomeIcon icon={faPlus} /> : 2}
              </div>
              <span className={`add-school-step-label ${step < 2 ? 'inactive' : ''}`}>Subscription</span>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="add-school-modal-body">
          <AnimatePresence mode="wait">
            {showSuccess && credentials ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <SuccessCredentialsView
                  credentials={credentials}
                  schoolName={formData.name}
                  onClose={handleClose}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`step-${step}`}
                initial={{ opacity: 0, x: step === 1 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: step === 1 ? 20 : -20 }}
                transition={{ duration: 0.2 }}
                className="add-school-step-content"
              >
                {step === 1 && (
                  <SchoolBasicInfoForm
                    formData={formData}
                    onChange={handleChange}
                    errors={errors}
                  />
                )}

                {step === 2 && (
                  <>
                    <TrialToggleSection
                      isTrial={formData.isTrial || false}
                      onToggle={handleTrialToggle}
                    />

                    {!formData.isTrial && (
                      <SubscriptionSection
                        selectedYears={formData.subscriptionYears}
                        onSelect={(years) => handleChange('subscriptionYears', years)}
                        pricing={pricing}
                        isLoading={isLoadingPricing}
                      />
                    )}

                    <PricingSummary
                      isTrial={formData.isTrial || false}
                      subscriptionYears={formData.subscriptionYears}
                      pricing={pricing}
                    />

                    <AdminCredentialsSection
                      formData={formData}
                      onChange={handleChange}
                      onGeneratePassword={handleGeneratePassword}
                      schoolName={formData.name}
                    />

                    {errors.subscription && (
                      <div className="add-school-field-error" style={{ marginTop: '12px' }}>
                        {errors.subscription}
                      </div>
                    )}
                    {errors.adminPassword && (
                      <div className="add-school-field-error" style={{ marginTop: '8px' }}>
                        {errors.adminPassword}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer (only show during form steps) */}
        {!showSuccess && (
          <div className="add-school-modal-footer">
            <div className="add-school-footer-actions">
              {step > 1 && (
                <button
                  className="add-school-btn add-school-btn-secondary"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Back
                </button>
              )}
            </div>

            <button
              className={`add-school-btn ${step === 1 ? 'add-school-btn-primary' : 'add-school-btn-success'}`}
              onClick={handleNext}
              disabled={isSubmitting || isLoadingPricing}
            >
              {isSubmitting ? (
                <>
                  <div className="add-school-spinner"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={step === 1 ? faArrowRight : faPlus} />
                  {step === 1 ? 'Next Step' : 'Create School'}
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
