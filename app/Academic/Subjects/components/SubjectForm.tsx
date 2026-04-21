'use client';

import React, { useState, useEffect, useCallback } from 'react';
import './SubjectForm.css';
import { Subject, SubjectRecord, CLASS_OPTIONS } from '../types';
import { getCurrentBSDate } from '../../../../utils/dateConverter';
import { toast } from 'sonner';

interface SubjectFormProps {
  onSave: (data: { className: string; academicYear: string; subjects: Subject[] }) => void;
  isLoading: boolean;
  initialSelection?: SubjectRecord | null;
}

const SubjectForm: React.FC<SubjectFormProps> = ({ onSave, isLoading, initialSelection }) => {
  const currentBS = getCurrentBSDate();
  const currentYearStr = `${currentBS.year}-${currentBS.year + 1}`;
  
  const [academicYear, setAcademicYear] = useState(initialSelection?.academicYear || currentYearStr);
  const [className, setClassName] = useState(initialSelection?.className || 'Class 1');
  const [subjects, setSubjects] = useState<Subject[]>(initialSelection?.subjects || [
    { name: '', type: 'Primary', creditHours: undefined, description: '' }
  ]);
  const [cache, setCache] = useState<Record<string, Subject[]>>({});

  useEffect(() => {
    if (initialSelection) {
      setAcademicYear(initialSelection.academicYear);
      setClassName(initialSelection.className);
      setSubjects(initialSelection.subjects);
    }
  }, [initialSelection]);

  // Generate a range of years (e.g., 2080-2095)
  const years = Array.from({ length: 15 }, (_, i) => `${2080 + i}-${2081 + i}`);

  const fetchExistingSubjects = useCallback(async () => {
    const cacheKey = `${className}-${academicYear}`;
    if (cache[cacheKey]) {
      setSubjects(cache[cacheKey]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const params = new URLSearchParams({ className, academicYear });
      const response = await fetch(`/Academic/Subjects/api/subjects?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        const fetchedSubjects = data.data[0].subjects;
        setSubjects(fetchedSubjects);
        setCache(prev => ({ ...prev, [cacheKey]: fetchedSubjects }));
      } else {
        const emptySubjects: Subject[] = [{ name: '', type: 'Primary', creditHours: undefined, description: '' }];
        setSubjects(emptySubjects);
        setCache(prev => ({ ...prev, [cacheKey]: emptySubjects }));
      }
    } catch (error) {
      console.error('Fetch existing subjects error:', error);
    }
  }, [className, academicYear, cache]);

  useEffect(() => {
    fetchExistingSubjects();
  }, [fetchExistingSubjects]);

  const addSubject = () => {
    setSubjects([...subjects, { name: '', type: 'Primary', creditHours: undefined, description: '' }]);
  };

  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const updateSubject = (index: number, field: keyof Subject, value: string | number | undefined) => {
    const newSubjects = [...subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value } as Subject;
    setSubjects(newSubjects);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const invalidSubjects = subjects.filter(s => !s.name.trim());
    if (invalidSubjects.length > 0) {
      toast.error('All subjects must have a name');
      return;
    }

    // Duplicate check
    const names = subjects.map(s => s.name.trim().toLowerCase());
    const hasDuplicates = names.some((name, index) => names.indexOf(name) !== index);
    if (hasDuplicates) {
      toast.error('Subject names must be unique within a class');
      return;
    }

    onSave({ className, academicYear, subjects });
  };

  return (
    <div className="subject-form-container">
      <h2 className="section-title">Add Subjects to School (Current Academic Year)</h2>
      <form onSubmit={handleSubmit} className="subject-form">
        <div className="form-header">
          <div className="form-group">
            <label>Academic Year (BS)</label>
            <select 
              value={academicYear} 
              onChange={(e) => setAcademicYear(e.target.value)}
              required
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Class</label>
            <select 
              value={className} 
              onChange={(e) => setClassName(e.target.value)}
              required
            >
              {CLASS_OPTIONS.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="subjects-list">
          <div className="list-header">
            <span>Subject Name</span>
            <span>Type</span>
            <span>Credit Hours</span>
            <span>Description</span>
            <span>Action</span>
          </div>
          {subjects.map((subject, index) => (
            <div key={index} className="subject-row">
              <input 
                type="text" 
                placeholder="Subject Name" 
                value={subject.name}
                onChange={(e) => updateSubject(index, 'name', e.target.value)}
                required
              />
              <select 
                value={subject.type}
                onChange={(e) => updateSubject(index, 'type', e.target.value)}
              >
                <option value="Primary">Primary</option>
                <option value="Minor">Minor</option>
                <option value="Optional">Optional</option>
              </select>
              <input 
                type="number" 
                placeholder="Credit Hours" 
                value={subject.creditHours || ''}
                onChange={(e) => updateSubject(index, 'creditHours', e.target.value ? parseInt(e.target.value) : undefined)}
              />
              <input 
                type="text" 
                placeholder="Description" 
                value={subject.description || ''}
                onChange={(e) => updateSubject(index, 'description', e.target.value)}
              />
              <button 
                type="button" 
                className="btn-remove" 
                onClick={() => removeSubject(index)}
                disabled={subjects.length <= 1}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={addSubject}>
            + Add Another Subject
          </button>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Subjects'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubjectForm;
