'use client';

import React, { useState } from 'react';
import { 
  PlusCircle, 
  Settings2, 
  Trash2, 
  Edit, 
  X,
  Calendar,
  Layers
} from 'lucide-react';
import './configuration.css';

export default function ConfigurationPage() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const classes = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  const mockExams = [
    { id: 1, name: 'First Mid-Term 2081', type: 'Mid-Term', year: '2081', classes: 'Nursery - 12', resultType: 'GPA' },
    { id: 2, name: 'Final Exam 2080', type: 'Final', year: '2080', classes: '1 - 10', resultType: 'Percentage' },
  ];

  return (
    <div className="config-container">
      {/* Create Exam Form */}
      <section className="config-form-section">
        <h2 className="form-title">
          <PlusCircle size={24} color="#10b981" />
          Create New Exam
        </h2>
        <form className="config-form">
          <div className="form-group">
            <label>Academic Year (BS)</label>
            <input type="text" placeholder="e.g. 2081" />
          </div>
          <div className="form-group">
            <label>Exam Type</label>
            <select>
              <option>Select Exam Type</option>
              <option>First Mid-Term</option>
              <option>First Terminal</option>
              <option>Second Mid-Term</option>
              <option>Second Terminal</option>
              <option>Final Examination</option>
            </select>
          </div>
          <div className="form-group">
            <label>Start Date (BS)</label>
            <input type="date" />
          </div>
          <div className="form-group">
            <label>End Date (BS)</label>
            <input type="date" />
          </div>
          <div className="form-group">
            <label>Result Type</label>
            <select>
              <option>GPA</option>
              <option>Percentage</option>
            </select>
          </div>
          <div className="form-group">
            <label>GPA Calculation System</label>
            <select>
              <option>Normal Calculation</option>
              <option>Credit Hour Based</option>
            </select>
          </div>
          
          <div className="form-group full-width">
            <label>Select Classes</label>
            <div className="class-selection-container">
              <div className="class-selection-header">
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Available Classes</span>
                <label className="checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={selectAll} 
                    onChange={(e) => setSelectAll(e.target.checked)} 
                  />
                  Select All
                </label>
              </div>
              <div className="class-grid">
                {classes.map((cls) => (
                  <label key={cls} className="checkbox-item">
                    <input type="checkbox" checked={selectAll} onChange={() => {}} />
                    {cls}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions full-width">
            <button type="button" className="btn-create">Create Exam</button>
          </div>
        </form>
      </section>

      {/* Created Exams List */}
      <section className="exams-list-section">
        <div className="card-header">
          <h2 className="form-title" style={{ marginBottom: 0 }}>
            <Layers size={22} color="#6b7280" />
            Configured Exams
          </h2>
        </div>
        <div className="academic-table-wrapper">
          <table className="academic-table">
            <thead>
              <tr>
                <th>Exam Name</th>
                <th>Year</th>
                <th>Classes</th>
                <th>Result Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockExams.map((exam) => (
                <tr key={exam.id}>
                  <td style={{ fontWeight: 600 }}>{exam.name}</td>
                  <td>{exam.year}</td>
                  <td>
                    <span style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                      {exam.classes}
                    </span>
                  </td>
                  <td>{exam.resultType}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon edit" title="Edit" onClick={() => setShowEditModal(true)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon delete" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit Modal Popup */}
      {showEditModal && (
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
                <input type="text" defaultValue="2081" />
              </div>
              <div className="form-group">
                <label>Exam Type</label>
                <input type="text" defaultValue="First Mid-Term" />
              </div>
              {/* Other fields simplified for modal */}
              <div className="form-actions full-width">
                <button 
                  type="button" 
                  className="btn-create" 
                  style={{ background: '#2563eb' }}
                  onClick={() => setShowEditModal(false)}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
