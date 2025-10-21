"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faPhone, 
  faEnvelope, 
  faLock,
  faEye,
  faEyeSlash,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import './create-account.css';

interface SuperAdminData {
  username: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function CreateSuperAdmin() {
  const [formData, setFormData] = useState<SuperAdminData>({
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    const { username, phone, email, password, confirmPassword } = formData;

    if (!username || !phone || !email || !password || !confirmPassword) {
      showMessage('All fields are required', 'error');
      return false;
    }

    if (username.length < 3) {
      showMessage('Username must be at least 3 characters long', 'error');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage('Please enter a valid email address', 'error');
      return false;
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      showMessage('Please enter a valid phone number (10-15 digits)', 'error');
      return false;
    }

    if (password.length < 6) {
      showMessage('Password must be at least 6 characters long', 'error');
      return false;
    }

    if (password !== confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:2056/api/auth/create-superadmin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          phone: formData.phone,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        showMessage('SuperAdmin account created successfully!', 'success');
        
        // Reset form
        setFormData({
          username: '',
          phone: '',
          email: '',
          password: '',
          confirmPassword: ''
        });

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push('/SuperAdmin/AdminLogin');
        }, 2000);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Create account error:', error);
      showMessage(error instanceof Error ? error.message : 'Failed to create account', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-account-page">
      <div className="create-account-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="account-card"
        >
          {/* Header */}
          <div className="account-header">
            <div className="logo">
              <FontAwesomeIcon icon={faShieldAlt} className="logo-icon" />
            </div>
            <h1 className="page-title">Create SuperAdmin Account</h1>
            <p className="page-subtitle">Setup your administrator account for SchoolHub</p>
          </div>

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

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="account-form">
            {/* Username Field */}
            <div className="form-group">
              <label className="form-label">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your username"
                disabled={isLoading}
                minLength={3}
                required
              />
              {formData.username && formData.username.length < 3 && (
                <div className="error-text">Username must be at least 3 characters</div>
              )}
            </div>

            {/* Phone Field */}
            <div className="form-group">
              <label className="form-label">
                <FontAwesomeIcon icon={faPhone} className="input-icon" />
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your phone number"
                disabled={isLoading}
                pattern="[0-9]{10,15}"
                required
              />
              {formData.phone && !/^[0-9]{10,15}$/.test(formData.phone) && (
                <div className="error-text">Enter a valid phone number (10-15 digits)</div>
              )}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">
                <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email address"
                disabled={isLoading}
                required
              />
              {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                <div className="error-text">Enter a valid email address</div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                Password *
              </label>
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {formData.password && formData.password.length < 6 && (
                <div className="error-text">Password must be at least 6 characters</div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label className="form-label">
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                Confirm Password *
              </label>
              <div className="password-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="error-text">Passwords do not match</div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faShieldAlt} />
                  Create SuperAdmin Account
                </>
              )}
            </button>

            {/* Login Link */}
            <div className="login-link">
              <p>
                Already have an account?{' '}
                <a href="/SuperAdmin/AdminLogin" className="link">
                  Sign in here
                </a>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}