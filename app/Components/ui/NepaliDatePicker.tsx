"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  BSDate, 
  NEPALI_MONTHS, 
  getCurrentBSDate, 
  formatBSDate, 
  parseBSDate, 
  isValidBSDate 
} from '../../utils/dateConverter';
import styles from './NepaliDatePicker.module.css';

interface NepaliDatePickerProps {
  value?: string; // BS date string in format "YYYY-MM-DD"
  onChange?: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
}

export default function NepaliDatePicker({
  value,
  onChange,
  placeholder = "Select Nepali Date",
  disabled = false,
  className = "",
  label,
  error
}: NepaliDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<BSDate | null>(null);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [currentYear, setCurrentYear] = useState(0);
  const [inputValue, setInputValue] = useState("");

  // Initialize with current BS date or provided value
  useEffect(() => {
    if (value) {
      try {
        const parsed = parseBSDate(value);
        if (isValidBSDate(parsed)) {
          setSelectedDate(parsed);
          setCurrentMonth(parsed.month - 1);
          setCurrentYear(parsed.year);
          setInputValue(value);
        }
      } catch {
        console.error('Invalid date format:', value);
      }
    } else {
      const current = getCurrentBSDate();
      setSelectedDate(current);
      setCurrentMonth(current.month - 1);
      setCurrentYear(current.year);
    }
  }, [value]);

  // Get days in month (simplified - real implementation would have proper BS calendar data)
  const getDaysInMonth = (year: number, month: number): number => {
    // Simplified BS month lengths
    const monthLengths = [31, 32, 31, 32, 31, 30, 30, 30, 30, 30, 30, 30];
    return monthLengths[month] || 30;
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const days = [];
    
    // Start from day 1
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  // Handle date selection
  const handleDateSelect = (day: number) => {
    const newDate: BSDate = {
      year: currentYear,
      month: currentMonth + 1,
      day
    };
    
    setSelectedDate(newDate);
    const dateString = formatBSDate(newDate);
    setInputValue(dateString);
    setIsOpen(false);
    
    if (onChange) {
      onChange(dateString);
    }
  };

  // Handle month navigation
  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Handle manual input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Validate format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      try {
        const parsed = parseBSDate(value);
        if (isValidBSDate(parsed)) {
          setSelectedDate(parsed);
          setCurrentMonth(parsed.month - 1);
          setCurrentYear(parsed.year);
          if (onChange) {
            onChange(value);
          }
        }
      } catch {
        // Invalid date
      }
    }
  };

  const isToday = (day: number) => {
    const today = getCurrentBSDate();
    return (
      day === today.day &&
      currentMonth === today.month - 1 &&
      currentYear === today.year
    );
  };

  const isSelected = (day: number) => {
    return (
      selectedDate &&
      day === selectedDate.day &&
      currentMonth === selectedDate.month - 1 &&
      currentYear === selectedDate.year
    );
  };

  return (
    <div className={`${styles.datePicker} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={styles.dateInput}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={styles.calendarButton}
        >
          <Calendar size={18} />
        </button>
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
      {isOpen && !disabled && (
        <div className={styles.calendarPopup}>
          <div className={styles.calendarHeader}>
            <button
              onClick={handlePreviousMonth}
              className={styles.navButton}
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className={styles.monthYear}>
              <div className={styles.monthName}>
                {NEPALI_MONTHS[currentMonth]}
              </div>
              <div className={styles.year}>
                {currentYear}
              </div>
            </div>
            
            <button
              onClick={handleNextMonth}
              className={styles.navButton}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className={styles.weekdays}>
            {['सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि', 'आइत'].map((day, index) => (
              <div key={index} className={styles.weekday}>
                {day}
              </div>
            ))}
          </div>

          <div className={styles.daysGrid}>
            {generateCalendarDays().map((day) => (
              <button
                key={day}
                onClick={() => handleDateSelect(day)}
                className={`${styles.dayButton} ${
                  isSelected(day) ? styles.selected : ''
                } ${isToday(day) ? styles.today : ''}`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className={styles.footer}>
            <button
              onClick={() => {
                const today = getCurrentBSDate();
                handleDateSelect(today.day);
              }}
              className={styles.todayButton}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
