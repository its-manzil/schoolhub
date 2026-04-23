'use client';

import React from 'react';
import './inventory-bill-filters.css';

const STATIC_CLASSES = [
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12'
];

const STATIC_SECTIONS = ['A', 'B', 'C', 'D', 'E'];

interface InventoryBillFiltersProps {
  academicYear: string;
  onAcademicYearChange: (value: string) => void;
  className: string;
  onClassChange: (value: string) => void;
  section: string;
  onSectionChange: (value: string) => void;
  status: 'all' | 'paid' | 'pending';
  onStatusChange: (value: 'all' | 'paid' | 'pending') => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  academicYears: string[];
}

export default function InventoryBillFilters({
  academicYear,
  onAcademicYearChange,
  className,
  onClassChange,
  section,
  onSectionChange,
  status,
  onStatusChange,
  searchTerm,
  onSearchChange,
  academicYears
}: InventoryBillFiltersProps) {
  return (
    <div className="inventory-bill-filters">
      <div className="filters-row">
        {/* Academic Year */}
        <div className="filter-group">
          <label className="filter-label">Academic Year</label>
          <select
            className="filter-select"
            value={academicYear}
            onChange={(e) => onAcademicYearChange(e.target.value)}
          >
            <option key="all-years" value="all">All Academic Years</option>
            {academicYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Class */}
        <div className="filter-group">
          <label className="filter-label">Class</label>
          <select
            className="filter-select"
            value={className}
            onChange={(e) => onClassChange(e.target.value)}
          >
            <option key="all-classes" value="all">All Classes</option>
            {STATIC_CLASSES.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        {/* Section */}
        <div className="filter-group">
          <label className="filter-label">Section</label>
          <select
            className="filter-select"
            value={section}
            onChange={(e) => onSectionChange(e.target.value)}
          >
            <option key="all-sections" value="all">All Sections</option>
            {STATIC_SECTIONS.map((sec) => (
              <option key={sec} value={sec}>
                Section {sec}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select
            className="filter-select"
            value={status}
            onChange={(e) => onStatusChange(e.target.value as 'all' | 'paid' | 'pending')}
          >
            <option key="all-status" value="all">All Status</option>
            <option key="paid" value="paid">Paid</option>
            <option key="pending" value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="filters-row">
        {/* Search */}
        <div className="filter-group search-group">
          <label className="filter-label">Search</label>
          <div className="search-input-wrapper">
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search by Invoice ID, Student Name, or Student ID..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
