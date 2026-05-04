'use client';

import React, { useState, useEffect } from 'react';
import SuperAdminNavbar from '../components/SuperAdminNavbar';

type MessageType = 'success' | 'error' | '';

interface PricingConfig {
  yearly: number;
}

const SettingsPage = () => {
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pricing configuration state (yearly only for now)
  const [pricing, setPricing] = useState<PricingConfig>({
    yearly: 20000
  });
  const [originalPricing, setOriginalPricing] = useState<PricingConfig>({
    yearly: 20000
  });
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [isPricingSaving, setIsPricingSaving] = useState(false);
  const [pricingMessage, setPricingMessage] = useState('');
  const [pricingMessageType, setPricingMessageType] = useState<MessageType>('');

  // Fetch pricing on mount
  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    setIsPricingLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:2056/api/superadmin/settings/pricing', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const newPricing = {
            yearly: data.data.rates.yearly || 20000
          };
          setPricing(newPricing);
          setOriginalPricing(newPricing);
        }
      }
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
    } finally {
      setIsPricingLoading(false);
    }
  };

  const handlePricingChange = (field: keyof PricingConfig, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (numValue >= 0) {
      setPricing(prev => ({ ...prev, [field]: numValue }));
    }
    clearPricingMessage();
  };

  const clearPricingMessage = () => {
    if (pricingMessage) {
      setPricingMessage('');
      setPricingMessageType('');
    }
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPricingSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:2056/api/superadmin/settings/pricing', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          monthly: 0,
          yearly: pricing.yearly,
          perStudent: 0,
          currency: 'NPR'
        })
      });

      const data = await response.json();

      if (data.success) {
        setPricingMessage('Pricing configuration saved successfully');
        setPricingMessageType('success');
        setOriginalPricing(pricing);
      } else {
        setPricingMessage(data.message || 'Failed to save pricing');
        setPricingMessageType('error');
      }
    } catch {
      setPricingMessage('Failed to save pricing configuration');
      setPricingMessageType('error');
    } finally {
      setIsPricingSaving(false);
    }
  };

  const hasPricingChanges = 
    pricing.yearly !== originalPricing.yearly;

  const clearMessage = () => {
    if (message) {
      setMessage('');
      setMessageType('');
    }
  };

  const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPassword(e.target.value);
    clearMessage();
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    clearMessage();
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    clearMessage();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      setMessageType('error');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('New password must be at least 6 characters');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/superadmin/settings/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage('Password updated successfully');
        setMessageType('success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage(data.message || 'Failed to change password');
        setMessageType('error');
      }
    } catch {
      setMessage('Failed to change password');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMessageStyles = () => {
    switch (messageType) {
      case 'success':
        return 'bg-green-100 border border-green-300 text-green-700';
      case 'error':
        return 'bg-red-100 border border-red-300 text-red-700';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminNavbar />
      <div className="max-w-2xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account security and preferences</p>
        </div>

        {/* School Pricing Configuration */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-200">
            School Pricing Setup
          </h2>

          <form onSubmit={handleSavePricing}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Yearly Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yearly Package Rate (NPR)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">Rs.</span>
                  <input
                    type="number"
                    value={pricing.yearly}
                    onChange={(e) => handlePricingChange('yearly', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                    min="0"
                    step="1"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Per year subscription</p>
              </div>
            </div>

            {/* Pricing Preview */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Pricing Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">1 Year:</span>
                  <span className="font-semibold text-gray-900">Rs. {pricing.yearly.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">2 Years:</span>
                  <span className="font-semibold text-gray-900">Rs. {(pricing.yearly * 2).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">3 Years:</span>
                  <span className="font-semibold text-gray-900">Rs. {(pricing.yearly * 3).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={isPricingSaving || !hasPricingChanges}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPricingSaving ? 'Saving...' : 'Save Pricing Configuration'}
              </button>
              {hasPricingChanges && (
                <span className="text-sm text-amber-600">You have unsaved changes</span>
              )}
            </div>
          </form>

          {/* Pricing Message Alert */}
          {pricingMessage && (
            <div className={`mt-6 p-4 rounded-lg ${
              pricingMessageType === 'success' 
                ? 'bg-green-100 border border-green-300 text-green-700' 
                : 'bg-red-100 border border-red-300 text-red-700'
            }`}>
              <div className="flex items-center">
                {pricingMessageType === 'success' && (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {pricingMessageType === 'error' && (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="font-medium">{pricingMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-xl shadow-md p-8">
          {/* Section Title */}
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-200">
            Change Password
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Current Password */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={handleCurrentPasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showCurrentPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a10.05 10.05 0 011.9-3.875M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v.75m12 1.5l-3.75-3.75M12 15.75l-3.75-3.75M12 15.75V3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Enter new password (min 6 characters)"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showNewPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a10.05 10.05 0 011.9-3.875M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v.75m12 1.5l-3.75-3.75M12 15.75l-3.75-3.75M12 15.75V3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a10.05 10.05 0 011.9-3.875M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v.75m12 1.5l-3.75-3.75M12 15.75l-3.75-3.75M12 15.75V3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>

          {/* Message Alert */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg ${getMessageStyles()}`}>
              <div className="flex items-center">
                {messageType === 'success' && (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {messageType === 'error' && (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
