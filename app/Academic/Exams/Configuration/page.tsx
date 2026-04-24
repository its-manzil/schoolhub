'use client';

import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Trash2,
  Edit,
  X,
  Layers,
  Loader2
} from 'lucide-react';
import './configuration.css';
import {
  getExams,
  createExam,
  updateExam,
  deleteExam,
  Exam
} from '../lib/examService';
import { toBS, formatBSDateWithMonth } from '@/app/utils/dateConverter';
import { useToast } from '../../../context/ToastContext';

const classes = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export default function ConfigurationPage() {
  const { showToast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showERPToast = (message: string, type: 'success' | 'error' = 'success') => {
    showToast(message, type);
  };

  // Form state
  const [formData, setFormData] = useState({
    academicYear: '',
    examType: '',
    startDate: '',
    endDate: '',
    resultType: 'GPA',
    gpaCalculationSystem: 'Normal',
  });

  // Fetch exams on mount
  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExams();
      setExams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedClasses([...classes]);
    } else {
      setSelectedClasses([]);
    }
  };

  const handleClassToggle = (cls: string) => {
    setSelectedClasses(prev => {
      const newSelection = prev.includes(cls)
        ? prev.filter(c => c !== cls)
        : [...prev, cls];
      setSelectAll(newSelection.length === classes.length);
      return newSelection;
    });
  };

  const handleCreateExam = async () => {
    if (!formData.academicYear || !formData.examType || selectedClasses.length === 0) {
      alert('Please fill in all required fields and select at least one class');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create an exam for each selected class
      for (const className of selectedClasses) {
        const examName = `${formData.examType} ${formData.academicYear}`;
        await createExam({
          name: examName,
          term: formData.examType,
          academicYear: formData.academicYear,
          className: className,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          resultType: formData.resultType as 'GPA' | 'Percentage',
          gpaCalculationSystem: formData.gpaCalculationSystem as 'Normal' | 'Credit Hour Based',
          routine: [],
          marks: [],
          subjectMappings: [],
        });
      }

      // Reset form
      setFormData({
        academicYear: '',
        examType: '',
        startDate: '',
        endDate: '',
        resultType: 'GPA',
        gpaCalculationSystem: 'Normal',
      });
      setSelectedClasses([]);
      setSelectAll(false);

      // Reload exams
      await loadExams();
      showERPToast('Exam(s) created successfully!', 'success');
    } catch (err) {
      showERPToast(err instanceof Error ? err.message : 'Failed to create exam', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (exam: Exam) => {
    setSelectedExam(exam);
    setFormData({
      academicYear: exam.academicYear,
      examType: exam.term,
      startDate: exam.startDate || '',
      endDate: exam.endDate || '',
      resultType: exam.resultType || 'GPA',
      gpaCalculationSystem: exam.gpaCalculationSystem || 'Normal',
    });
    setShowEditModal(true);
  };

  const handleUpdateExam = async () => {
    if (!selectedExam?._id) return;

    setIsSubmitting(true);
    try {
      await updateExam(selectedExam._id, {
        academicYear: formData.academicYear,
        term: formData.examType,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        resultType: formData.resultType as 'GPA' | 'Percentage',
        gpaCalculationSystem: formData.gpaCalculationSystem as 'Normal' | 'Credit Hour Based',
      });

      setShowEditModal(false);
      setSelectedExam(null);
      await loadExams();
      showERPToast('Exam updated successfully!', 'success');
    } catch (err) {
      showERPToast(err instanceof Error ? err.message : 'Failed to update exam', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedExams = exams.reduce((acc: Record<string, Exam[]>, exam) => {
    const key = `${exam.academicYear}-${exam.term}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(exam);
    return acc;
  }, {});

  const examGroups = Object.values(groupedExams);

  const handleDeleteExamGroup = async (group: Exam[]) => {
    if (!confirm(`Are you sure you want to delete this exam group (${group[0].term} ${group[0].academicYear})? This will delete the configuration for all ${group.length} classes.`)) return;

    try {
      setIsSubmitting(true);
      for (const exam of group) {
        if (exam._id) await deleteExam(exam._id);
      }
      await loadExams();
      showERPToast('Exam group deleted successfully!', 'success');
    } catch (err) {
      showERPToast(err instanceof Error ? err.message : 'Failed to delete exam group', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="config-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
          <Loader2 size={24} className="spin" />
          Loading exams...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="config-container">
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
          <p>Error loading exams: {error}</p>
          <button className="btn-create" onClick={loadExams} style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="config-container">
      {/* Create Exam Form */}
      <section className="config-form-section">
        <h2 className="form-title">
          <PlusCircle size={24} color="#10b981" />
          Create New Exam
        </h2>
        <div className="config-form">
          <div className="form-group">
            <label>Academic Year (BS) *</label>
            <input 
              type="text" 
              placeholder="e.g. 2081" 
              value={formData.academicYear}
              onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Exam Type *</label>
            <select 
              value={formData.examType}
              onChange={(e) => setFormData({...formData, examType: e.target.value})}
            >
              <option value="">Select Exam Type</option>
              <option>First Mid-Term</option>
              <option>First Terminal</option>
              <option>Second Mid-Term</option>
              <option>Second Terminal</option>
              <option>Final Examination</option>
            </select>
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input 
              type="date" 
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            />
            {formData.startDate && (
              <span style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
                BS: {formatBSDateWithMonth(toBS(formData.startDate))}
              </span>
            )}
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input 
              type="date" 
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
            />
            {formData.endDate && (
              <span style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
                BS: {formatBSDateWithMonth(toBS(formData.endDate))}
              </span>
            )}
          </div>
          <div className="form-group">
            <label>Result Type</label>
            <select 
              value={formData.resultType}
              onChange={(e) => setFormData({...formData, resultType: e.target.value})}
            >
              <option value="GPA">GPA</option>
              <option value="Percentage">Percentage</option>
            </select>
          </div>
          <div className="form-group">
            <label>GPA Calculation System</label>
            <select 
              value={formData.gpaCalculationSystem}
              onChange={(e) => setFormData({...formData, gpaCalculationSystem: e.target.value})}
            >
              <option value="Normal">Normal Calculation</option>
              <option value="Credit Hour Based">Credit Hour Based</option>
            </select>
          </div>
          
          <div className="form-group full-width">
            <label>Select Classes *</label>
            <div className="class-selection-container">
              <div className="class-selection-header">
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Available Classes</span>
                <label className="checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={selectAll} 
                    onChange={(e) => handleSelectAll(e.target.checked)} 
                  />
                  Select All
                </label>
              </div>
              <div className="class-grid">
                {classes.map((cls) => (
                  <label key={cls} className="checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={selectedClasses.includes(cls)} 
                      onChange={() => handleClassToggle(cls)} 
                    />
                    {cls}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions full-width">
            <button 
              type="button" 
              className="btn-create"
              onClick={handleCreateExam}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                  Creating...
                </>
              ) : (
                'Create Exam'
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Created Exams List */}
      <section className="exams-list-section">
        <div className="card-header">
          <h2 className="form-title" style={{ marginBottom: '1.5rem' }}>
            <Layers size={22} color="#6b7280" />
            Configured Exams ({examGroups.length})
          </h2>
        </div>
        
        <div className="exam-card-grid">
          {examGroups.length === 0 ? (
            <div className="empty-state">
              No exams configured yet. Create your first exam above.
            </div>
          ) : (
            examGroups.map((group) => {
              const baseExam = group[0];
              const classesList = group.map(e => e.className).sort((a, b) => {
                const indexA = classes.indexOf(a);
                const indexB = classes.indexOf(b);
                return indexA - indexB;
              });

              return (
                <div key={`${baseExam.academicYear}-${baseExam.term}`} className="exam-config-card">
                  <div className="exam-card-main">
                    <div className="exam-card-info">
                      <h3 className="exam-card-name">{baseExam.term}</h3>
                      <div className="exam-card-year">{baseExam.academicYear} BS</div>
                    </div>
                    <div className="exam-card-actions">
                      <button className="btn-icon edit" title="Edit first class config" onClick={() => handleEditClick(baseExam)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon delete" title="Delete all classes" onClick={() => handleDeleteExamGroup(group)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="exam-card-details">
                    <div className="detail-row">
                      <span className="detail-label">Classes ({group.length}):</span>
                      <div className="class-tags">
                        {classesList.map(cls => (
                          <span key={cls} className="class-tag">{cls}</span>
                        ))}
                      </div>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Schedule:</span>
                      <span className="detail-value">
                        {baseExam.startDate ? formatBSDateWithMonth(toBS(baseExam.startDate)) : 'N/A'} 
                        {' - '} 
                        {baseExam.endDate ? formatBSDateWithMonth(toBS(baseExam.endDate)) : 'N/A'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">System:</span>
                      <span className="detail-value">{baseExam.resultType} ({baseExam.gpaCalculationSystem})</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Created Exams List section ... */}



      {/* Edit Modal Popup */}
      {showEditModal && selectedExam && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Edit Exam Configuration</h3>
              <button className="btn-close" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="config-form" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="form-group">
                <label>Academic Year</label>
                <input 
                  type="text" 
                  value={formData.academicYear}
                  onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Exam Type</label>
                <input 
                  type="text" 
                  value={formData.examType}
                  onChange={(e) => setFormData({...formData, examType: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
                {formData.startDate && (
                  <span style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
                    BS: {formatBSDateWithMonth(toBS(formData.startDate))}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input 
                  type="date" 
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
                {formData.endDate && (
                  <span style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
                    BS: {formatBSDateWithMonth(toBS(formData.endDate))}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label>Result Type</label>
                <select 
                  value={formData.resultType}
                  onChange={(e) => setFormData({...formData, resultType: e.target.value})}
                >
                  <option value="GPA">GPA</option>
                  <option value="Percentage">Percentage</option>
                </select>
              </div>
              <div className="form-group">
                <label>GPA Calculation</label>
                <select 
                  value={formData.gpaCalculationSystem}
                  onChange={(e) => setFormData({...formData, gpaCalculationSystem: e.target.value})}
                >
                  <option value="Normal">Normal</option>
                  <option value="Credit Hour Based">Credit Hour Based</option>
                </select>
              </div>
              <div className="form-actions full-width">
                <button 
                  type="button" 
                  className="btn-create" 
                  style={{ background: '#2563eb' }}
                  onClick={handleUpdateExam}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
