'use client';

import React, { useState } from 'react';
import SuperAdminNavbar from '../components/SuperAdminNavbar';

const SettingsPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }

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
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage(data.message);
      }
    } catch {
      setMessage('Failed to change password');
    }
  };

  return (
    <div>
      <SuperAdminNavbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <form onSubmit={handleSubmit} className="max-w-md">
          <div className="mb-4 relative">
            <label className="block text-gray-700">Current Password</label>
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
              <svg
                className="h-6 text-gray-700 cursor-pointer"
                fill="none"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {showCurrentPassword ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a10.05 10.05 0 011.9-3.875M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v.75m12 1.5l-3.75-3.75M12 15.75l-3.75-3.75M12 15.75V3"
                  />
                )}
              </svg>
            </div>
          </div>
          <div className="mb-4 relative">
            <label className="block text-gray-700">New Password</label>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
              <svg
                className="h-6 text-gray-700 cursor-pointer"
                fill="none"
                onClick={() => setShowNewPassword(!showNewPassword)}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {showNewPassword ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a10.05 10.05 0 011.9-3.875M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v.75m12 1.5l-3.75-3.75M12 15.75l-3.75-3.75M12 15.75V3"
                  />
                )}
              </svg>
            </div>
          </div>
          <div className="mb-4 relative">
            <label className="block text-gray-700">Confirm New Password</label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
              <svg
                className="h-6 text-gray-700 cursor-pointer"
                fill="none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {showConfirmPassword ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a10.05 10.05 0 011.9-3.875M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v.75m12 1.5l-3.75-3.75M12 15.75l-3.75-3.75M12 15.75V3"
                  />
                )}
              </svg>
            </div>
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Change Password
          </button>
        </form>
        {message && <p className="mt-4 text-red-500">{message}</p>}
      </div>
    </div>
  );
};

export default SettingsPage;
