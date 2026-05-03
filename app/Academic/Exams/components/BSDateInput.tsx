'use client';

import React, { useState, useCallback } from 'react';
import { parseBSDate, isValidBSDate, isWithinBSRange, BS_DATE_RANGE, NEPALI_MONTHS } from '@/app/utils/dateConverter';
import './BSDateInput.css';

interface BSDateInputProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  showPicker?: boolean;
  className?: string;
}

export default function BSDateInput({
  value,
  onChange,
  placeholder = 'YYYY-MM-DD',
  label,
  disabled = false,
  showPicker = true,
  className = ''
}: BSDateInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-format input: 20830127 -> 2083-01-27
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/[^0-9-]/g, '');

    // Auto-insert hyphens
    if (input.length > 4 && input[4] !== '-') {
      input = input.slice(0, 4) + '-' + input.slice(4);
    }
    if (input.length > 7 && input[7] !== '-') {
      input = input.slice(0, 7) + '-' + input.slice(7);
    }

    // Limit length
    if (input.length > 10) {
      input = input.slice(0, 10);
    }

    // Validate
    let validationError: string | null = null;
    if (input.length === 10) {
      try {
        const parsed = parseBSDate(input);

        // Check if within supported range (2000-2090 BS)
        if (!isWithinBSRange(parsed.year, parsed.month, parsed.day)) {
          validationError = `Date must be between ${BS_DATE_RANGE.MIN_YEAR}-${String(BS_DATE_RANGE.MIN_MONTH).padStart(2, '0')}-${String(BS_DATE_RANGE.MIN_DAY).padStart(2, '0')} and ${BS_DATE_RANGE.MAX_YEAR}-${String(BS_DATE_RANGE.MAX_MONTH).padStart(2, '0')}-${String(BS_DATE_RANGE.MAX_DAY).padStart(2, '0')} BS`;
        } else if (!isValidBSDate(parsed)) {
          // Check if month is valid
          if (parsed.month < 1 || parsed.month > 12) {
            validationError = 'Month must be between 1 and 12';
          } else if (parsed.day < 1 || parsed.day > 32) {
            validationError = 'Day must be between 1 and 32';
          } else {
            // Day is invalid for this specific month/year
            validationError = `Invalid day ${parsed.day} for ${NEPALI_MONTHS[parsed.month - 1]} ${parsed.year}`;
          }
        }
      } catch {
        validationError = 'Invalid format (YYYY-MM-DD)';
      }
    }

    setError(validationError);
    onChange(input, !validationError && input.length === 10);
  }, [onChange]);

  const handleDropdownSelect = (year: number, month: number, day: number) => {
    const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    setError(null);
    onChange(dateString, true);
    setShowDropdown(false);
  };

  // Generate year options (valid BS range: 2000-2090)
  const currentYear = 2081;
  const years = Array.from(
    { length: BS_DATE_RANGE.MAX_YEAR - BS_DATE_RANGE.MIN_YEAR + 1 },
    (_, i) => (BS_DATE_RANGE.MIN_YEAR + i).toString()
  );

  // Parse current value
  const parsedValue = value.length === 10 ? parseBSDate(value) : null;

  return (
    <div className={`bs-date-input-wrapper ${className}`}>
      {label && <label className="bs-date-label">{label}</label>}

      <div className={`bs-date-input-container ${isFocused ? 'focused' : ''} ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}>
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            if (showPicker) setShowDropdown(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            // Delay hiding dropdown to allow clicks
            setTimeout(() => setShowDropdown(false), 200);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="bs-date-input"
          maxLength={10}
        />

        {showPicker && (
          <button
            type="button"
            className="bs-date-picker-btn"
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={disabled}
            tabIndex={-1}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
        )}

        {showDropdown && showPicker && (
          <div className="bs-date-dropdown">
            <div className="bs-date-dropdown-header">
              <span>Select Date</span>
              <button
                type="button"
                className="bs-date-close-btn"
                onClick={() => setShowDropdown(false)}
              >
                ×
              </button>
            </div>

            <div className="bs-date-dropdown-content">
              <div className="bs-date-field">
                <label>Year</label>
                <select
                  value={parsedValue?.year || ''}
                  onChange={(e) => {
                    const year = parseInt(e.target.value);
                    const month = parsedValue?.month || 1;
                    const day = parsedValue?.day || 1;
                    handleDropdownSelect(year, month, day);
                  }}
                >
                  <option value="">Select</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="bs-date-field">
                <label>Month</label>
                <select
                  value={parsedValue?.month || ''}
                  onChange={(e) => {
                    const year = parsedValue?.year || currentYear;
                    const month = parseInt(e.target.value);
                    const day = parsedValue?.day || 1;
                    handleDropdownSelect(year, month, day);
                  }}
                >
                  <option value="">Select</option>
                  {NEPALI_MONTHS.map((month, index) => (
                    <option key={month} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>

              <div className="bs-date-field">
                <label>Day</label>
                <select
                  value={parsedValue?.day || ''}
                  onChange={(e) => {
                    const year = parsedValue?.year || currentYear;
                    const month = parsedValue?.month || 1;
                    const day = parseInt(e.target.value);
                    handleDropdownSelect(year, month, day);
                  }}
                >
                  <option value="">Select</option>
                  {Array.from({ length: 32 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <span className="bs-date-error">{error}</span>}
      {value.length === 10 && !error && (
        <span className="bs-date-valid">✓ Valid BS date</span>
      )}
    </div>
  );
}
