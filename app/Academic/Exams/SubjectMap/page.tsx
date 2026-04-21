'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Edit, 
  X, 
  LayoutGrid,
  FileSpreadsheet,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';
import './mapping.css';
import { 
  getExams, 
  getAcademicYears,
  updateSubjectMappings,
  SubjectMapping,
  Exam 
} from '../lib/examService';
import { toBS, formatBSDateWithMonth } from '@/app/utils/dateConverter';

interface SubjectWithId extends SubjectMapping {
  id: string;
}

const defaultSubjects = [
  'Mathematics',
  'Science',
  'English',
  'Social Studies',
  'Nepali',
  'Computer Science',
  'Physical Education',
  'Moral Science',
];

export default function SubjectMappingPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectWithId | null>(null);
  const [subjects, setSubjects] = useState<SubjectWithId[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  
  const [filters, setFilters] = useState({
    year: '',
    exam: '',
    class: ''
  });

  // Load exams and years on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [examsData, yearsData] = await Promise.all([
        getExams(),
        getAcademicYears()
      ]);
      setExams(examsData);
      setYears(yearsData);
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  // Load subjects when class is selected
  useEffect(() => {
    if (filters.year && filters.exam && filters.class) {
      loadSubjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadSubjects = () => {
    setLoading(true);
    
    // Find selected exam
    const exam = exams.find(e => 
      e.academicYear === filters.year &&
      e.term === filters.exam &&
      e.className === filters.class
    );
    setSelectedExam(exam || null);
    
    // Load existing mappings or create default ones
    if (exam?.subjectMappings && exam.subjectMappings.length > 0) {
      const mappedSubjects = exam.subjectMappings.map((m, idx) => ({
        ...m,
        id: `subject-${idx}`,
      }));
      setSubjects(mappedSubjects);
    } else {
      // Create default subjects with default values
      const defaultMappings: SubjectWithId[] = defaultSubjects.map((name, idx) => ({
        id: `subject-${idx}`,
        subject: name,
        fullMarks: 100,
        passMarks: 40,
        theoryFM: 75,
        theoryPM: 30,
        practicalFM: 25,
        practicalPM: 10,
        creditHour: 4,
      }));
      setSubjects(defaultMappings);
    }
    
    setLoading(false);
  };

  const handleSubjectChange = (id: string, field: keyof SubjectMapping, value: number) => {
    setSubjects(prev => prev.map(sub => 
      sub.id === id ? { ...sub, [field]: value } : sub
    ));
  };

  const handleEditClick = (subject: SubjectWithId) => {
    setSelectedSubject(subject);
    setIsEditModalOpen(true);
  };

  const handleSaveMappings = async () => {
    if (!selectedExam?._id) {
      alert('Please select an exam first');
      return;
    }

    setIsSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mappings: SubjectMapping[] = subjects.map(({ id, ...rest }) => rest);
      await updateSubjectMappings(selectedExam._id, mappings);
      alert('Subject mappings saved successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save mappings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSubject = () => {
    if (!selectedSubject) return;
    
    setSubjects(prev => prev.map(sub => 
      sub.id === selectedSubject.id ? selectedSubject : sub
    ));
    setIsEditModalOpen(false);
    setSelectedSubject(null);
  };

  const handleAddSubject = () => {
    const newSubject: SubjectWithId = {
      id: `subject-${Date.now()}`,
      subject: 'New Subject',
      fullMarks: 100,
      passMarks: 40,
      theoryFM: 75,
      theoryPM: 30,
      practicalFM: 25,
      practicalPM: 10,
      creditHour: 4,
    };
    setSubjects([...subjects, newSubject]);
  };

  const handleDeleteSubject = (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    setSubjects(prev => prev.filter(sub => sub.id !== id));
  };

  // Get unique exam types for the selected year
  const examTypes = [...new Set(
    exams
      .filter(e => e.academicYear === filters.year)
      .map(e => e.term)
  )];

  // Get unique classes for the selected year and exam
  const availableClasses = [...new Set(
    exams
      .filter(e => e.academicYear === filters.year && e.term === filters.exam)
      .map(e => e.className)
  )];

  return (
    <div className="mapping-container">
      {/* Dropdown Roadmap */}
      <section className="dropdown-roadmap">
        <div className="dropdown-group">
          <label>Academic Year</label>
          <select 
            value={filters.year}
            onChange={(e) => setFilters({ year: e.target.value, exam: '', class: '' })}
          >
            <option value="">Select Year</option>
            {years.map(year => (
              <option key={year} value={year}>{year} BS</option>
            ))}
          </select>
        </div>
        <div className="dropdown-group">
          <label>Exam Type</label>
          <select 
            value={filters.exam}
            onChange={(e) => setFilters({ ...filters, exam: e.target.value, class: '' })}
            disabled={!filters.year}
          >
            <option value="">Select Exam</option>
            {examTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="dropdown-group">
          <label>Class</label>
          <select 
            value={filters.class}
            onChange={(e) => setFilters({ ...filters, class: e.target.value })}
            disabled={!filters.exam}
          >
            <option value="">Select Class</option>
            {availableClasses.map(cls => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>
        </div>
      </section>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', color: '#6b7280' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
          Loading...
        </div>
      ) : filters.class ? (
        <>
          {/* Mapping Table Section */}
          <section className="mapping-table-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileSpreadsheet size={20} color="#10b981" />
                  Map Subject Marks & Credits
                </h3>
                {selectedExam?.startDate && (
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    Exam Period: {formatBSDateWithMonth(toBS(selectedExam.startDate))} - {selectedExam.endDate ? formatBSDateWithMonth(toBS(selectedExam.endDate)) : 'TBD'}
                  </span>
                )}
              </div>
              <button className="btn-bulk" onClick={handleAddSubject}>
                <Plus size={18} /> Add Subject
              </button>
            </div>
            <div className="academic-table-wrapper">
              <table className="mapping-table academic-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Subject</th>
                    <th>Full Marks</th>
                    <th>Pass Marks</th>
                    <th>Theory FM</th>
                    <th>Theory PM</th>
                    <th>Practical FM</th>
                    <th>Practical PM</th>
                    <th>Credit Hour</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((sub) => (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 600, textAlign: 'left' }}>{sub.subject}</td>
                      <td><input type="number" value={sub.fullMarks} onChange={(e) => handleSubjectChange(sub.id, 'fullMarks', parseInt(e.target.value) || 0)} /></td>
                      <td><input type="number" value={sub.passMarks} onChange={(e) => handleSubjectChange(sub.id, 'passMarks', parseInt(e.target.value) || 0)} /></td>
                      <td><input type="number" value={sub.theoryFM} onChange={(e) => handleSubjectChange(sub.id, 'theoryFM', parseInt(e.target.value) || 0)} /></td>
                      <td><input type="number" value={sub.theoryPM} onChange={(e) => handleSubjectChange(sub.id, 'theoryPM', parseInt(e.target.value) || 0)} /></td>
                      <td><input type="number" value={sub.practicalFM} onChange={(e) => handleSubjectChange(sub.id, 'practicalFM', parseInt(e.target.value) || 0)} /></td>
                      <td><input type="number" value={sub.practicalPM} onChange={(e) => handleSubjectChange(sub.id, 'practicalPM', parseInt(e.target.value) || 0)} /></td>
                      <td><input type="number" value={sub.creditHour} onChange={(e) => handleSubjectChange(sub.id, 'creditHour', parseInt(e.target.value) || 0)} /></td>
                      <td>
                        <button className="btn-icon delete" onClick={() => handleDeleteSubject(sub.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mapping-actions">
              <button 
                className="btn-bulk primary"
                onClick={handleSaveMappings}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Subject Mapping
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Saved Mappings Summary */}
          <section>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LayoutGrid size={20} color="#6b7280" />
              Configured Mappings
            </h3>
            <div className="mapping-cards-grid">
              {subjects.map((sub) => (
                <div key={sub.id} className="mapping-summary-card" onClick={() => handleEditClick(sub)}>
                  <div className="card-subject-title">
                    {sub.subject}
                    <Edit size={14} color="#9ca3af" />
                  </div>
                  <div className="mapping-stats-mini">
                    <div className="stat-row"><span>FM:</span><span>{sub.fullMarks}</span></div>
                    <div className="stat-row"><span>PM:</span><span>{sub.passMarks}</span></div>
                    <div className="stat-row"><span>Theory:</span><span>{sub.theoryFM}/{sub.theoryPM}</span></div>
                    <div className="stat-row"><span>Practical:</span><span>{sub.practicalFM}</span></div>
                    <div className="stat-row"><span>Credit:</span><span>{sub.creditHour}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
          Select year, exam, and class to configure subject mappings
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedSubject && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0 }}>Edit {selectedSubject.subject} Mapping</h3>
              <X className="close-modal" onClick={() => setIsEditModalOpen(false)} style={{ position: 'static' }} />
            </div>
            
            <div className="modal-grid">
              <div className="dropdown-group">
                <label>Subject Name</label>
                <input 
                  type="text" 
                  value={selectedSubject.subject}
                  onChange={(e) => setSelectedSubject({...selectedSubject, subject: e.target.value})}
                  style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} 
                />
              </div>
              <div className="dropdown-group">
                <label>Full Marks</label>
                <input 
                  type="number" 
                  value={selectedSubject.fullMarks}
                  onChange={(e) => setSelectedSubject({...selectedSubject, fullMarks: parseInt(e.target.value) || 0})}
                  style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} 
                />
              </div>
              <div className="dropdown-group">
                <label>Pass Marks</label>
                <input 
                  type="number" 
                  value={selectedSubject.passMarks}
                  onChange={(e) => setSelectedSubject({...selectedSubject, passMarks: parseInt(e.target.value) || 0})}
                  style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} 
                />
              </div>
              <div className="dropdown-group">
                <label>Theory Full Marks</label>
                <input 
                  type="number" 
                  value={selectedSubject.theoryFM}
                  onChange={(e) => setSelectedSubject({...selectedSubject, theoryFM: parseInt(e.target.value) || 0})}
                  style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} 
                />
              </div>
              <div className="dropdown-group">
                <label>Theory Pass Marks</label>
                <input 
                  type="number" 
                  value={selectedSubject.theoryPM}
                  onChange={(e) => setSelectedSubject({...selectedSubject, theoryPM: parseInt(e.target.value) || 0})}
                  style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} 
                />
              </div>
              <div className="dropdown-group">
                <label>Practical Full Marks</label>
                <input 
                  type="number" 
                  value={selectedSubject.practicalFM}
                  onChange={(e) => setSelectedSubject({...selectedSubject, practicalFM: parseInt(e.target.value) || 0})}
                  style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} 
                />
              </div>
              <div className="dropdown-group">
                <label>Practical Pass Marks</label>
                <input 
                  type="number" 
                  value={selectedSubject.practicalPM}
                  onChange={(e) => setSelectedSubject({...selectedSubject, practicalPM: parseInt(e.target.value) || 0})}
                  style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} 
                />
              </div>
              <div className="dropdown-group">
                <label>Credit Hour</label>
                <input 
                  type="number" 
                  value={selectedSubject.creditHour}
                  onChange={(e) => setSelectedSubject({...selectedSubject, creditHour: parseInt(e.target.value) || 0})}
                  style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
              <button 
                className="btn-bulk primary" 
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleUpdateSubject}
              >
                <Save size={18} /> Update Mapping
              </button>
              <button 
                className="btn-bulk" 
                style={{ flex: 1, justifyContent: 'center' }} 
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
