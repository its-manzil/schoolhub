'use client';

import React, { useState } from 'react';
import { 
  Search, 
  X, 
  Save, 
  ClipboardCheck,
  User,
  Edit3
} from 'lucide-react';
import './marks.css';

export default function MarksEntryPage() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const mockStudents = [
    { id: 1, roll: '1', name: 'Ashes Pokhrel', status: 'completed' },
    { id: 2, roll: '2', name: 'Manzil Timsina', status: 'pending' },
    { id: 3, roll: '3', name: 'Anti Nabin', status: 'completed' },
    { id: 4, roll: '4', name: 'Meera Rai', status: 'pending' },
    { id: 5, roll: '5', name: 'Siddharth Shrestha', status: 'pending' },
  ];

  const mockSubjects = [
    { id: 1, name: 'Mathematics', theory: 0, practical: 0 },
    { id: 2, name: 'Science', theory: 0, practical: 0 },
    { id: 3, name: 'English', theory: 0, practical: 0 },
    { id: 4, name: 'Social Studies', theory: 0, practical: 0 },
  ];

  const handleOpenPanel = (student: any) => {
    setSelectedStudent(student);
    setIsPanelOpen(true);
  };

  const filteredStudents = mockStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll.includes(searchTerm)
  );

  return (
    <div className="marks-container">
      {/* Dropdown Roadmap */}
      <section className="dropdown-roadmap">
        <div className="dropdown-group">
          <label>Academic Year</label>
          <select>
            <option>Select Year</option>
            <option value="2081">2081 BS</option>
          </select>
        </div>
        <div className="dropdown-group">
          <label>Exam Type</label>
          <select>
            <option>Select Exam</option>
            <option value="mid">First Mid-Term</option>
          </select>
        </div>
        <div className="dropdown-group">
          <label>Class</label>
          <select>
            <option>Select Class</option>
            <option value="10">Class 10</option>
          </select>
        </div>
      </section>

      {/* Student Table Section */}
      <section className="student-list-section">
        <div className="list-header">
          <div className="search-bar-container">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search by student name or roll..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bulk-actions">
            <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardCheck size={16} />
              Status Summary: {mockStudents.filter(s => s.status === 'completed').length}/{mockStudents.length} Entered
            </span>
          </div>
        </div>

        <div className="academic-table-wrapper">
          <table className="academic-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Roll No</th>
                <th>Student Name</th>
                <th style={{ textAlign: 'center' }}>Entry Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.roll}</td>
                  <td style={{ fontWeight: 600 }}>{student.name}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`marks-status-badge ${student.status}`}>
                      {student.status === 'completed' ? '✓ Entered' : '○ Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="action-icons">
                      <button className="icon-btn view" title="Enter Marks" onClick={() => handleOpenPanel(student)}>
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Marks Entry Panel */}
      {isPanelOpen && selectedStudent && (
        <>
          <div className="panel-overlay" onClick={() => setIsPanelOpen(false)} />
          <div className="marks-entry-panel">
            <div className="panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '50%' }}>
                  <User size={24} color="#2563eb" />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{selectedStudent.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Roll No: {selectedStudent.roll} • Class 10</p>
                </div>
              </div>
              <X className="close-modal" onClick={() => setIsPanelOpen(false)} style={{ position: 'static' }} />
            </div>

            <div className="subjects-entry-list">
              {mockSubjects.map((sub) => (
                <div key={sub.id} className="subject-mark-group">
                  <label>{sub.name}</label>
                  <div className="mark-inputs-row">
                    <div className="mark-input-field">
                      <span>Theory</span>
                      <input type="number" placeholder="Enter theory marks" />
                    </div>
                    <div className="mark-input-field">
                      <span>Practical</span>
                      <input type="number" placeholder="Enter practical marks" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button className="btn-bulk primary" style={{ flex: 1, justifyContent: 'center' }}>
                <Save size={18} /> Save & Update Marks
              </button>
              <button className="btn-bulk" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsPanelOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
