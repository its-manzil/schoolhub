"use client";

import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import './login.css';

export default function Login() {
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        const user = JSON.parse(userData);
        redirectToDashboard(user.role);
      } else {
        setIsCheckingAuth(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Clear invalid storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsCheckingAuth(false);
    }
  };

  const redirectToDashboard = (role: string) => {
    switch (role) {
      case 'superadmin':
        router.push('/SuperAdmin/Dashboard');
        break;
      case 'schooladmin':
        router.push('/SchoolAdmin/Dashboard');
        break;
      case 'Principal':
        router.push('/Principal/Dashboard');
        break;
      case 'accountant':
        router.push('/Accountant/Dashboard');
        break;
      case 'teacher':
        router.push('/Teacher/Dashboard');
        break;
      case 'student':
        router.push('/Student/Dashboard');
        break;
      case 'parent':
        router.push('/Parent/Dashboard');
        break;
      default:
        router.push('/Login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter both username and password');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:2056/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
          remember: rememberMe
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('Login successful:', data.user);
        
        // Redirect based on user role
        redirectToDashboard(data.user.role);
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Network error. Please check if the server is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setError('Please contact your system administrator to reset your password.');
  };

  const handleContactAdmin = (e: React.MouseEvent) => {
    e.preventDefault();
    setError('Please contact the system administrator for account creation.');
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="login-container">
        <div className="login-background">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
        <div className="login-card">
          <div className="auth-checking">
            <div className="loading-spinner-large"></div>
            <p>Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <div className="logo-icon">🏫</div>
          </div>
          <h1 className="login-title">Welcome to SchoolHub</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {error && (
          <div className="error-message">
            <FaExclamationTriangle className="error-icon" />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="identifier" className="form-label">
              Username, Email or Phone
            </label>
            <div className="input-container">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="form-input"
                placeholder="Enter your username, email, or phone"
                required
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-container">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input password-input"
                placeholder="Enter your password"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="checkbox-input"
                disabled={isLoading}
              />
              <span className="checkmark">
                <FaCheck className="check-icon" />
              </span>
              <span className="checkbox-label">Remember me</span>
            </label>
            
            <a href="#" className="forgot-password" onClick={handleForgotPassword}>
              Forgot password?
            </a>
          </div>

          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="button-loading">
                <div className="loading-spinner"></div>
                Signing In...
              </div>
            ) : (
              <>
                <span className="button-text">Sign In</span>
                <div className="button-shine"></div>
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don&apos;t have an account?{' '}
            <a href="#" className="signup-link" onClick={handleContactAdmin}>
              Contact administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}