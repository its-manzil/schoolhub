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

const classes = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export default function ConfigurationPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      alert('Exam(s) created successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create exam');
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
      alert('Exam updated successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;

    try {
      await deleteExam(examId);
      await loadExams();
      alert('Exam deleted successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete exam');
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
          <h2 className="form-title" style={{ marginBottom: 0 }}>
            <Layers size={22} color="#6b7280" />
            Configured Exams ({exams.length})
          </h2>
        </div>
        <div className="academic-table-wrapper">
          <table className="academic-table">
            <thead>
              <tr>
                <th>Exam Name</th>
                <th>Year</th>
                <th>Class</th>
                <th>Start Date (BS)</th>
                <th>End Date (BS)</th>
                <th>Result Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No exams configured yet. Create your first exam above.
                  </td>
                </tr>
              ) : (
                exams.map((exam) => (
                  <tr key={exam._id}>
                    <td style={{ fontWeight: 600 }}>{exam.name}</td>
                    <td>{exam.academicYear}</td>
                    <td>
                      <span style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                        {exam.className}
                      </span>
                    </td>
                    <td>{exam.startDate ? formatBSDateWithMonth(toBS(exam.startDate)) : '-'}</td>
                    <td>{exam.endDate ? formatBSDateWithMonth(toBS(exam.endDate)) : '-'}</td>
                    <td>{exam.resultType || 'GPA'}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon edit" title="Edit" onClick={() => handleEditClick(exam)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn-icon delete" title="Delete" onClick={() => exam._id && handleDeleteExam(exam._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

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
