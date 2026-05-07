'use client';

import React, { useState, useEffect } from 'react';
import './SubjectFormModal.css';
import { Subject, SubjectRecord, CLASS_OPTIONS } from '../types';
import { toast } from 'sonner';

interface SubjectFormModalProps {
  initialData?: SubjectRecord | null;
  onSave: (payload: { className: string; academicYear: string; subjects: Subject[] }) => void;
  isLoading: boolean;
}

const SubjectFormModal: React.FC<SubjectFormModalProps> = ({ initialData, onSave, isLoading }) => {
  const [academicYear, setAcademicYear] = useState(initialData?.academicYear || '');
  const [className, setClassName] = useState(initialData?.className || 'Class 1');
  const [subjects, setSubjects] = useState<Subject[]>(initialData?.subjects || [
    { name: '', type: 'Primary', creditHours: undefined, description: '' }
  ]);

  const years = Array.from({ length: 15 }, (_, i) => `${2080 + i}-${2081 + i}`);

  useEffect(() => {
    if (initialData) {
      setAcademicYear(initialData.academicYear);
      setClassName(initialData.className);
      setSubjects(initialData.subjects);
    }
  }, [initialData]);

  const addSubject = () => {
    setSubjects([...subjects, { name: '', type: 'Primary', creditHours: undefined, description: '' }]);
  };

  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const updateSubject = <K extends keyof Subject>(index: number, field: K, value: Subject[K]) => {
    const newSubjects = [...subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setSubjects(newSubjects);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!academicYear) {
      toast.error('Academic year is required');
      return;
    }

    const invalid = subjects.some(s => !s.name.trim());
    if (invalid) {
      toast.error('All subjects must have a name');
      return;
    }

    const invalidCredit = subjects.some(s => s.creditHours && (s.creditHours < 1 || s.creditHours > 10));
    if (invalidCredit) {
      toast.error('Credit hours must be between 1 and 10');
      return;
    }

    onSave({ className, academicYear, subjects });
  };

  return (
    <form className="subject-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <div className="form-group">
          <label>Academic Year (BS)</label>
          <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
            <option value="">Select Year</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Class</label>
          <select value={className} onChange={(e) => setClassName(e.target.value)}>
            {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="subjects-list-editor">
        {subjects.map((sub, idx) => (
          <div key={idx} className="subject-item-row">
            <input 
              type="text" 
              placeholder="Subject Name" 
              value={sub.name} 
              onChange={(e) => updateSubject(idx, 'name', e.target.value)}
            />
            <select value={sub.type} onChange={(e) => updateSubject(idx, 'type', e.target.value as Subject['type'])}>
              <option value="Primary">Primary</option>
              <option value="Minor">Minor</option>
              <option value="Optional">Optional</option>
            </select>
            <input 
              type="number" 
              placeholder="Credits" 
              value={sub.creditHours || ''} 
              onChange={(e) => updateSubject(idx, 'creditHours', parseInt(e.target.value))}
              min="1"
              max="10"
            />
            <button type="button" onClick={() => removeSubject(idx)} className="btn-remove">×</button>
          </div>
        ))}
        <button type="button" onClick={addSubject} className="btn-add-subject">+ Add Subject</button>
      </div>

      <div className="form-footer">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Record'}
        </button>
      </div>
    </form>
  );
};

export default SubjectFormModal;
