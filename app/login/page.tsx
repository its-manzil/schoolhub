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
      case 'superadmin': router.push('/SuperAdmin/Dashboard'); break;
      case 'schooladmin': router.push('/SchoolAdmin/Dashboard'); break;
      case 'academic': router.push('/Academic'); break;
      case 'Principal': router.push('/Principal/Dashboard'); break;
      case 'accountant': router.push('/Accounting'); break;
      case 'billing': router.push('/billing/dashboard'); break;
      case 'teacher': router.push('/Teacher/Dashboard'); break;
      case 'student': router.push('/Student/Dashboard'); break;
      case 'parent': router.push('/Parent/Dashboard'); break;
      case 'administrative': router.push('/Administrative'); break;
      default: router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        const user = JSON.parse(userData);
        redirectToDashboard(user.role);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [redirectToDashboard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!identifier.trim() || !password.trim()) {
      setError('Please enter both username and password');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:2056/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
          remember: rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        redirectToDashboard(data.user.role);
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          setError('Unable to connect to the server. Please ensure the backend server is running on port 2056.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Network error. Please check if the server is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(v => !v);

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setError('Please contact your system administrator to reset your password.');
  };

  const handleContactAdmin = (e: React.MouseEvent) => {
    e.preventDefault();
    setError('Please contact the system administrator for account creation.');
  };

  return (
    <div className="lg-wrapper">
      <div className="lg-container">

        {/* ══════════════════ LEFT PANEL ══════════════════ */}
        <div className="lg-left">

          {/* Decorative blobs */}
          <div className="lg-blob lg-blob-tl" />
          <div className="lg-blob lg-blob-tr" />
          <div className="lg-blob lg-blob-bl" />
          <div className="lg-blob lg-blob-br" />

          {/* Logo */}
          <div className="lg-logo">
            <Image
              src="/schoolhub_logo_green.png"
              alt="Schoolhub"
              width={34}
              height={34}
              className="lg-logo-img"
            />
            <span className="lg-logo-text">Schoolhub</span>
          </div>

          {/* Illustration + copy */}
          <div className="lg-left-center">
            <div className="lg-illus-wrap">
              <Image
                src="/Login_side.png"
                alt="School ERP illustration"
                width={280}
                height={220}
                className="lg-illus"
                priority
              />
            </div>
            <h2 className="lg-left-heading">Manage your school smarter</h2>
            <p className="lg-left-sub">
              Attendance, grades, and communication<br />all in one place.
            </p>
          </div>

          {/* Role pills */}
          <div className="lg-roles">
            {['Students', 'Teachers', 'Parents', 'Admin'].map((r) => (
              <span key={r} className="lg-role-pill">{r}</span>
            ))}
          </div>
        </div>

        {/* ══════════════════ RIGHT PANEL ══════════════════ */}
        <div className="lg-right">
          <div className="lg-form-box">

            {/* Header */}
            <div className="lg-form-header">
              <h1 className="lg-form-title">Login</h1>
              <br />
              <p className="lg-form-subtitle">Enter your credentials to access your account</p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="lg-error-banner">
                <svg className="lg-err-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form className="lg-form" onSubmit={handleSubmit} noValidate>

              {/* ── Username field ── */}
              <div className="lg-field">
                <label className="lg-label" htmlFor="lg-identifier">username</label>
                <div className="lg-input-wrap">
                  <span className="lg-icon" aria-hidden="true">
                    {/* Phone icon */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    id="lg-identifier"
                    type="text"
                    className="lg-input"
                    placeholder="0000_admin"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* ── Password field ── */}
              <div className="lg-field">
                <label className="lg-label" htmlFor="lg-password">Password</label>
                <div className="lg-input-wrap">
                  <span className="lg-icon" aria-hidden="true">
                    {/* Lock icon */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="lg-password"
                    type={showPassword ? 'text' : 'password'}
                    className="lg-input lg-input-pw"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="lg-eye"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <br />

              {/* ── Remember me + Forgot ── */}
              <div className="lg-options-row">
                <label className="lg-check-label">
                  <input
                    type="checkbox"
                    className="lg-check-native"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span className="lg-checkmark" />
                  <span className="lg-check-text">Remember me</span>
                </label>
                <a href="#" className="lg-forgot" onClick={handleForgotPassword}>
                  Forgot password?
                </a>
              </div>
              <br />

              {/* ── Submit ── */}
              <button
                type="submit"
                className="lg-submit-btn"
                disabled={isLoading}
              >
                {isLoading
                  ? <span className="lg-spin" />
                  : 'Login'
                }
              </button>

              {/* ── Contact admin ── */}
              <p className="lg-contact-row">
                Don&apos;t have a account?{' '}
                <a href="#" className="lg-contact-link" onClick={handleContactAdmin}>
                  Contact administrator
                </a>
              </p>

            </form>

            {/* ── Powered by ── */}
            <div className="lg-powered">
              <span className="lg-powered-label">powered by</span>
              <div className="lg-powered-logos">
                <Image
                  src="/Logo_nepsof.png"
                  alt="NepSof logo"
                  width={26}
                  height={26}
                  className="lg-nepsof-icon"
                />
                <Image
                  src="/name.png"
                  alt="NepSof"
                  width={76}
                  height={20}
                  className="lg-nepsof-name"
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}