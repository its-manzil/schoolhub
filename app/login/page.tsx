"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import './login.css';

export default function Login() {
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const router = useRouter();

  const redirectToDashboard = useCallback((role: string) => {
    switch (role) {
      case 'superadmin':
        router.push('/SuperAdmin/Dashboard');
        break;
      case 'schooladmin':
        router.push('/SchoolAdmin/Dashboard');
        break;
      case 'academic':
        router.push('/Academic');
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
  }, [router]);

  // Check if user is already logged in
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        const user = JSON.parse(userData);
        redirectToDashboard(user.role);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [redirectToDashboard]);

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
        credentials: 'include',
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
        if (error.message.includes('Failed to fetch')) {
          setError('Unable to connect to the server. Please ensure the backend server is running on port 2056.');
        } else {
          setError(error.message);
        }
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

<<<<<<< HEAD
  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="login-header">
          <div className="logo-wrapper">
            <Image 
              src="/Schoolhub logo.png" 
              alt="Schoolhub Logo" 
              width={120}
              height={120}
              className="brand-logo-img" 
            />
          </div>
          <p className="login-subtitle">Checking authentication...</p>
        </div>
      </div>
    );
  }

=======
>>>>>>> b454352 (ui on administrative session)
  return (
    <div className="login-page-wrapper">
      <div className="container">
        {/* Left Panel: Text Content */}
        <div className="left-panel">
          <div className="logo-wrapper">
            <Image 
              src="/Schoolhub logo.png" 
              alt="Schoolhub Logo" 
              width={120}
              height={120}
              className="brand-logo-img" 
            />
          </div>

          <div className="tagline-wrapper">
            <div className="brand-tagline">
              <span>Streamlining</span>
              <span>success</span>
              <span>for</span>
              <span>every</span>
              <span>school.</span>
            </div>
          </div>
        </div>

        {/* Middle Panel: Single Focused Image in the Header Box */}
        <div className="middle-panel">
          <div className="collage-box">
            <Image
              src="/middle.png"
              alt="School Hub Dashboard Preview"
              width={400}
              height={300}
              className="middle-focused-img"
            />
          </div>
        </div>

        {/* Right Panel: Login Form */}
        <div className="right-panel">
          <div className="login-wrapper">
            <div className="login-header">
              <h1 className="login-title">Login School</h1>
              <p className="login-subtitle">Sign in to your account</p>
            </div>

            {error && (
              <div className="error-message" style={{ color: '#852B2B', marginBottom: '10px', fontSize: '14px', textAlign: 'center' }}>
                <span>{error}</span>
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  id="identifier"
                  className="input-field"
                  placeholder="Enter your username or email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="input-group">
                <div className="password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="input-field"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-submit"
                disabled={isLoading}
                style={{
                  opacity: isLoading ? 0.8 : 1,
                }}
              >
                {isLoading ? 'Signing in...' : 'Log In'}
              </button>

              <div className="form-actions">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-label">Remember me</span>
                </label>
                <a href="#" className="forgot-password" onClick={handleForgotPassword}>Forgot password?</a>
              </div>

              <div className="signup-prompt">
                <span>Don&apos;t have an account?</span>
                <a href="#" className="signup-link" onClick={handleContactAdmin}>Contact to administrator</a>
              </div>
            </form>

            <div className="footer-logo-container">
              <Image 
                src="/Logo_nepsof.png" 
                alt="Secondary Logo" 
                width={100}
                height={40}
                className="footer-logo-img" 
              />
              <Image 
                src="/name.png" 
                alt="Brand Name" 
                width={120}
                height={40}
                className="footer-logo-img" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
