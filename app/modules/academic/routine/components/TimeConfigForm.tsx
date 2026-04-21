'use client';

import React, { useState } from 'react';
import './TimeConfigForm.css';
import { CLASS_OPTIONS } from '../../subjects/types';

interface TimeConfigFormProps {
  academicYear: string;
  className: string;
  onGenerate: () => void;
  onAcademicYearChange: (year: string) => void;
  onClassChange: (cls: string) => void;
}

const TimeConfigForm: React.FC<TimeConfigFormProps> = ({
  academicYear,
  className,
  onGenerate,
  onAcademicYearChange,
  onClassChange
}) => {
  const years = Array.from({ length: 15 }, (_, i) => `${2080 + i}-${2081 + i}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  return (
    <form className="time-config-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Academic Year (BS)</label>
          <select value={academicYear} onChange={(e) => onAcademicYearChange(e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Class</label>
          <select value={className} onChange={(e) => onClassChange(e.target.value)}>
            {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="generate-actions">
        <button type="submit" className="btn-primary">Generate Periods</button>
      </div>
    </form>
  );
};

export default TimeConfigForm;
