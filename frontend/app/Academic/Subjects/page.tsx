'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSubjects } from '../../modules/academic/subjects/hooks/useSubjects';
import SubjectFormModal from '../../modules/academic/subjects/components/SubjectFormModal';
import ImportModal from '../../modules/academic/subjects/components/ImportModal';
import { routineService } from '../../modules/academic/routine/services/routineService';
import Modal from './components/Modal';
import './subjects.css';
import { SubjectRecord, Subject, CLASS_OPTIONS } from '../../modules/academic/subjects/types';
import { Toaster, toast } from 'sonner';
import AcademicNavbar from '../components/AcademicNavbar';

type TabType = 'subjects' | 'configureSubjects' | 'editSubjects';



// Configure Subjects Form with dropdown for academic year
interface ConfigureSubjectsFormProps {
  onSave: (payload: { className: string; academicYear: string; subjects: Subject[] }) => void;
  isLoading: boolean;
  availableYears: string[];
}

const ConfigureSubjectsForm: React.FC<ConfigureSubjectsFormProps> = ({ onSave, isLoading, availableYears }) => {
  const [academicYear, setAcademicYear] = useState(availableYears[0] || '');
  const [className, setClassName] = useState('Class 1');
  const [subjects, setSubjects] = useState<Subject[]>([
    { name: '', type: 'Primary', creditHours: undefined, description: '' }
  ]);

  // Update academic year when availableYears changes
  useEffect(() => {
    if (availableYears.length > 0 && !academicYear) {
      setAcademicYear(availableYears[0]);
    }
  }, [availableYears, academicYear]);

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
    // Reset form after successful save
    setAcademicYear('');
    setClassName('Class 1');
    setSubjects([{ name: '', type: 'Primary', creditHours: undefined, description: '' }]);
  };

  return (
    <form className="subject-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <div className="form-group">
          <label>Academic Year (BS)</label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="academic-year-select"
            required
          >
            <option value="">Select academic year</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {availableYears.length === 0 && (
            <span className="hint-text">No academic years available. Please configure a schedule first.</span>
          )}
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


// Edit Subjects Form Component
interface EditSubjectsFormProps {
  availableYears: string[];
}

const EditSubjectsForm: React.FC<EditSubjectsFormProps> = ({ availableYears }) => {
  const [selectedYear, setSelectedYear] = useState(availableYears[0] || '');
  const [selectedClass, setSelectedClass] = useState('Class 1');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);

  const fetchSubjectsForEdit = useCallback(async () => {
    if (!selectedYear || !selectedClass) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/academic/subjects?className=${encodeURIComponent(selectedClass)}&academicYear=${encodeURIComponent(selectedYear)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const record = data.data[0];
        setSubjects(record.subjects || []);
        setRecordId(record._id);
      } else {
        setSubjects([]);
        setRecordId(null);
        toast.info('No subjects found for this class and year');
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      toast.error('Failed to load subjects');
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedClass]);

  useEffect(() => {
    if (selectedYear && selectedClass) {
      fetchSubjectsForEdit();
    }
  }, [selectedYear, selectedClass, fetchSubjectsForEdit]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYear || !recordId) {
      toast.error('No existing record to update');
      return;
    }

    const invalid = subjects.some(s => !s.name.trim());
    if (invalid) {
      toast.error('All subjects must have a name');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/academic/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          className: selectedClass,
          academicYear: selectedYear,
          subjects
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Subjects updated successfully');
      } else {
        toast.error(data.message || 'Failed to update subjects');
      }
    } catch (err) {
      console.error('Failed to save subjects:', err);
      toast.error('Failed to save subjects');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="subject-form" onSubmit={handleSave}>
      <div className="form-header">
        <div className="form-group">
          <label>Academic Year (BS)</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="academic-year-select"
          >
            <option value="">Select academic year</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Class</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button
          type="button"
          onClick={fetchSubjectsForEdit}
          className="btn-secondary"
          disabled={isLoading}
          style={{ height: 'fit-content', marginTop: 'auto' }}
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {isLoading ? (
        <div className="loading-state">Loading subjects...</div>
      ) : recordId ? (
        <>
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
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Update Subjects'}
            </button>
          </div>
        </>
      ) : selectedYear ? (
        <div className="empty-state">
          <p>No subjects configured for {selectedClass} in {selectedYear}</p>
          <p>Please use &quot;Configure Subjects&quot; tab to add subjects first.</p>
        </div>
      ) : (
        <div className="empty-state">
          <p>Select an academic year and class to edit subjects</p>
        </div>
      )}
    </form>
  );
};



// Subjects Grouped by Class Component
interface SubjectsByClassProps {
  subjectsRecords: SubjectRecord[];
  isLoading: boolean;
  onEdit: (record: SubjectRecord) => void;
  onDelete: (id: string) => void;
}

const SubjectsByClass: React.FC<SubjectsByClassProps> = ({ subjectsRecords, isLoading, onEdit, onDelete }) => {
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Get available years from records
  const availableYears = Array.from(new Set(subjectsRecords.map(r => r.academicYear))).sort();

  // Set default year if not set and years are available
  useEffect(() => {
    if (availableYears.length > 0 && !selectedYear) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  // Filter records by selected year
  const filteredRecords = selectedYear
    ? subjectsRecords.filter(r => r.academicYear === selectedYear)
    : subjectsRecords;

  // Group by class
  const groupedByClass = filteredRecords.reduce((acc, record) => {
    if (!acc[record.className]) {
      acc[record.className] = [];
    }
    acc[record.className].push(record);
    return acc;
  }, {} as Record<string, SubjectRecord[]>);

  // Get sorted class names
  const classNames = Object.keys(groupedByClass).sort((a, b) => {
    const aIndex = CLASS_OPTIONS.indexOf(a);
    const bIndex = CLASS_OPTIONS.indexOf(b);
    return aIndex - bIndex;
  });

  // Find max subjects count for row alignment
  const maxSubjectsCount = Math.max(
    0,
    ...Object.values(groupedByClass).map(records =>
      Math.max(...records.map(r => r.subjects.length))
    )
  );

  if (isLoading) return <div className="loading">Loading subjects...</div>;

  return (
    <div className="subjects-by-class">
      <div className="academic-year-filter">
        <label>Academic Year</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="academic-year-select"
        >
          <option value="">All Years</option>
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {classNames.length === 0 ? (
        <div className="empty-state">No subjects found for the selected academic year.</div>
      ) : (
        <div className="subjects-table-container">
          <table className="subjects-grouped-table">
            <thead>
              <tr>
                {classNames.map(className => (
                  <th key={className} className="class-header">{className}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxSubjectsCount }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {classNames.map(className => {
                    const records = groupedByClass[className];
                    const allSubjects = records.flatMap(r => r.subjects);
                    const subject = allSubjects[rowIndex];
                    const record = records.find(r => r.subjects.includes(subject));

                    return (
                      <td key={className} className="subject-cell">
                        {subject ? (
                          <div className="subject-item">
                            <span className="subject-name">{subject.name}</span>
                            <span className={`subject-type-badge ${subject.type.toLowerCase()}`}>
                              {subject.type}
                            </span>
                            {record?._id && rowIndex === 0 && (
                              <div className="subject-actions">
                                <button
                                  className="btn-edit-mini"
                                  onClick={() => onEdit(record)}
                                  title="Edit"
                                >
                                  ✎
                                </button>
                                <button
                                  className="btn-delete-mini"
                                  onClick={() => record._id && onDelete(record._id)}
                                  title="Delete"
                                >
                                  ×
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="empty-cell">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default function AcademicSubjectsPage() {
  const {
    subjects: subjectsRecords,
    isLoading: isLoadingSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    fetchSubjects,
    importSubjects
  } = useSubjects();

  const [activeTab, setActiveTab] = useState<TabType>('subjects');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SubjectRecord | null>(null);
  
  // State for academic years from school_schedules
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  const [routineYear] = useState('2081-2082');
  const [routineClass] = useState('Class 1');

  // Fetch academic years from school_schedules
  const fetchAcademicYears = useCallback(async () => {
    try {
      const res = await routineService.fetchAcademicYearsFromSchedules();
      if (res.success) {
        setAvailableYears(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch academic years:', err);
    }
  }, []);

  // Fetch subjects and academic years on mount
  useEffect(() => {
    fetchSubjects();
    fetchAcademicYears();
  }, [fetchSubjects, fetchAcademicYears]);

  const handleSaveSubjects = async (payload: { className: string; academicYear: string; subjects: Subject[] }) => {
    let success;
    if (editingRecord?._id) {
      success = await updateSubject(editingRecord._id, payload);
    } else {
      success = await createSubject(payload);
    }
    if (success) {
      setIsModalOpen(false);
      setEditingRecord(null);
    }
  };

  const handleConfigureSubjectsSave = async (payload: { className: string; academicYear: string; subjects: Subject[] }) => {
    const success = await createSubject(payload);
    if (success) {
      // Stay on configure subjects tab, but could also switch to subjects tab
      toast.success('Subjects saved successfully');
    }
  };

  const handleImport = async (sourceClass: string, sourceYear: string) => {
    const success = await importSubjects(sourceClass, sourceYear, routineClass, routineYear);
    if (success) setIsImportModalOpen(false);
  };


  const handleEditFromSubjectsTab = (record: SubjectRecord) => {
    setEditingRecord(record);
    setActiveTab('configureSubjects');
  };

  const tabs = [
    { id: 'subjects' as TabType, label: 'Subjects' },
    { id: 'configureSubjects' as TabType, label: 'Configure Subjects' },
    { id: 'editSubjects' as TabType, label: 'Edit Subjects' },
  ];

  return (
    <div className="subjects-page">
      <AcademicNavbar />
      <Toaster position="top-right" />
      <main className="main-content">
        <header className="page-header">
          <h1 className="page-title">Subjects</h1>
        </header>

        {/* Mini Navbar */}
        <div className="mini-navbar-container">
          <div className="tab-switcher">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="content-container">
          {/* Tab 1: Subjects */}
          {activeTab === 'subjects' && (
            <section className="section-container card">
              <div className="subjects-header">
                <h2 className="section-title">Subjects by Class</h2>
                <div className="header-controls">
                  <button className="btn-primary" onClick={() => setIsImportModalOpen(true)}>
                    Import Subjects
                  </button>
                </div>
              </div>

              <SubjectsByClass
                subjectsRecords={subjectsRecords}
                isLoading={isLoadingSubjects}
                onEdit={handleEditFromSubjectsTab}
                onDelete={deleteSubject}
              />
            </section>
          )}


          {/* Tab 3: Configure Subjects */}
          {activeTab === 'configureSubjects' && (
            <section className="section-container card">
              <div className="subjects-header">
                <h2 className="section-title">
                  {editingRecord ? 'Edit Subjects' : 'Configure Subjects'}
                </h2>
                {editingRecord && (
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setEditingRecord(null);
                    }}
                  >
                    Add New
                  </button>
                )}
              </div>
              <ConfigureSubjectsForm
                onSave={editingRecord ? handleSaveSubjects : handleConfigureSubjectsSave}
                isLoading={isLoadingSubjects}
                availableYears={availableYears}
              />
            </section>
          )}


          {/* Tab 5: Edit Subjects */}
          {activeTab === 'editSubjects' && (
            <section className="section-container card">
              <div className="subjects-header">
                <h2 className="section-title">Edit Subjects</h2>
              </div>
              <EditSubjectsForm availableYears={availableYears} />
            </section>
          )}

        </div>
      </main>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Subjects"
      >
        <ImportModal
          onImport={handleImport}
          onClose={() => setIsImportModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal for inline editing */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        title={editingRecord ? "Edit Subjects" : "Add Subjects"}
      >
        <SubjectFormModal
          initialData={editingRecord}
          onSave={handleSaveSubjects}
          isLoading={isLoadingSubjects}
        />
      </Modal>
    </div>
  );
}

