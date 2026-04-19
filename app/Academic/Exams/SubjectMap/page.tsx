'use client';

import React, { useState } from 'react';
import { 
  Save, 
  Edit, 
  X, 
  FileCheck,
  LayoutGrid,
  FileSpreadsheet
} from 'lucide-react';
import './mapping.css';

export default function SubjectMappingPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  const mockSubjects = [
    { id: 1, name: 'Mathematics', fm: 100, pm: 40, theoryFM: 75, theoryPM: 30, practicalFM: 25, creditHour: 4 },
    { id: 2, name: 'Science', fm: 100, pm: 40, theoryFM: 75, theoryPM: 30, practicalFM: 25, creditHour: 4 },
    { id: 3, name: 'English', fm: 100, pm: 40, theoryFM: 75, theoryPM: 30, practicalFM: 25, creditHour: 4 },
    { id: 4, name: 'Social Studies', fm: 100, pm: 40, theoryFM: 75, theoryPM: 30, practicalFM: 25, creditHour: 4 },
  ];

  const handleEditClick = (subject: any) => {
    setSelectedSubject(subject);
    setIsEditModalOpen(true);
  };

  return (
    <div className="mapping-container">
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

      {/* Mapping Table Section */}
      <section className="mapping-table-section">
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileSpreadsheet size={20} color="#10b981" />
          Map Subject Marks & Credits
        </h3>
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
                <th>Credit Hour</th>
              </tr>
            </thead>
            <tbody>
              {mockSubjects.map((sub) => (
                <tr key={sub.id}>
                  <td style={{ fontWeight: 600, textAlign: 'left' }}>{sub.name}</td>
                  <td><input type="number" defaultValue={sub.fm} /></td>
                  <td><input type="number" defaultValue={sub.pm} /></td>
                  <td><input type="number" defaultValue={sub.theoryFM} /></td>
                  <td><input type="number" defaultValue={sub.theoryPM} /></td>
                  <td><input type="number" defaultValue={sub.practicalFM} /></td>
                  <td><input type="number" defaultValue={sub.creditHour} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mapping-actions">
          <button className="btn-bulk primary">
            <Save size={18} />
            Save Subject Mapping
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
          {mockSubjects.map((sub) => (
            <div key={sub.id} className="mapping-summary-card" onClick={() => handleEditClick(sub)}>
              <div className="card-subject-title">
                {sub.name}
                <Edit size={14} color="#9ca3af" />
              </div>
              <div className="mapping-stats-mini">
                <div className="stat-row"><span>FM:</span><span>{sub.fm}</span></div>
                <div className="stat-row"><span>PM:</span><span>{sub.pm}</span></div>
                <div className="stat-row"><span>Theory:</span><span>{sub.theoryFM}/{sub.theoryPM}</span></div>
                <div className="stat-row"><span>Practical:</span><span>{sub.practicalFM}</span></div>
                <div className="stat-row"><span>Credit:</span><span>{sub.creditHour}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Edit Modal */}
      {isEditModalOpen && selectedSubject && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0 }}>Edit {selectedSubject.name} Mapping</h3>
              <X className="close-modal" onClick={() => setIsEditModalOpen(false)} style={{ position: 'static' }} />
            </div>
            
            <div className="modal-grid">
              <div className="dropdown-group">
                <label>Full Marks</label>
                <input type="number" defaultValue={selectedSubject.fm} style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
              </div>
              <div className="dropdown-group">
                <label>Pass Marks</label>
                <input type="number" defaultValue={selectedSubject.pm} style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
              </div>
              <div className="dropdown-group">
                <label>Theory Full Marks</label>
                <input type="number" defaultValue={selectedSubject.theoryFM} style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
              </div>
              <div className="dropdown-group">
                <label>Theory Pass Marks</label>
                <input type="number" defaultValue={selectedSubject.theoryPM} style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
              </div>
              <div className="dropdown-group">
                <label>Practical Full Marks</label>
                <input type="number" defaultValue={selectedSubject.practicalFM} style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
              </div>
              <div className="dropdown-group">
                <label>Credit Hour</label>
                <input type="number" defaultValue={selectedSubject.creditHour} style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
              <button className="btn-bulk primary" style={{ flex: 1, justifyContent: 'center' }}>
                <Save size={18} /> Update Mapping
              </button>
              <button className="btn-bulk" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
