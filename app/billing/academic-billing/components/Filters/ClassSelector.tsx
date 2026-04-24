'use client';

import React from 'react';
import './ClassSelector.css';

interface ClassSelectorProps {
  selectedClass: string;
  onChange: (className: string) => void;
}

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

export default function ClassSelector({
  selectedClass,
  onChange
}: ClassSelectorProps) {
  return (
    <div className="class-selector">
      <label className="filter-label" htmlFor="class-select">
        Class <span className="required">*</span>
      </label>
      <select
        id="class-select"
        className="filter-select"
        value={selectedClass}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select Class</option>
        {STATIC_CLASSES.map((className) => (
          <option key={className} value={className}>
            {className}
          </option>
        ))}
      </select>
    </div>
  );
}
