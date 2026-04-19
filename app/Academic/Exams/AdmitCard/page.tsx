'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Printer, 
  Download, 
  Eye, 
  X,
  CreditCard,
  FileText
} from 'lucide-react';
import './admit-card.css';

export default function AdmitCardPage() {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const mockStudents = [
    { id: 1, roll: '1', name: 'Ashes Pokhrel', class: '10', symbol: '20811001' },
    { id: 2, roll: '2', name: 'Manzil Timsina', class: '10', symbol: '20811002' },
    { id: 3, roll: '3', name: 'Anti Nabin', class: '10', symbol: '20811003' },
    { id: 4, roll: '4', name: 'Meera Rai', class: '10', symbol: '20811004' },
    { id: 5, roll: '5', name: 'Siddharth Shrestha', class: '10', symbol: '20811005' },
  ];

  const handleView = (student: any) => {
    setSelectedStudent(student);
    setShowPreview(true);
  };

  const filteredStudents = mockStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll.includes(searchTerm)
  );

  return (
    <div className="admit-card-container">
      {/* Dropdown Roadmap */}
      <section className="dropdown-roadmap">
        <div className="dropdown-group">
          <label>Academic Year</label>
          <select>
            <option>Select Year</option>
            <option value="2081">2081 BS</option>
            <option value="2080">2080 BS</option>
          </select>
        </div>
        <div className="dropdown-group">
          <label>Exam Type</label>
          <select>
            <option>Select Exam</option>
            <option value="mid">First Mid-Term</option>
            <option value="final">Final Examination</option>
          </select>
        </div>
        <div className="dropdown-group">
          <label>Class</label>
          <select>
            <option>Select Class</option>
            <option value="1">Class 1</option>
            <option value="10">Class 10</option>
          </select>
        </div>
      </section>

      {/* Student List Section */}
      <section className="student-list-section">
        <div className="list-header">
          <div className="search-bar-container">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or roll no..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bulk-actions">
            <button className="btn-bulk">
              <CreditCard size={18} />
              Bulk ID Card
            </button>
            <button className="btn-bulk primary">
              <Printer size={18} />
              Bulk Print Admit Cards
            </button>
          </div>
        </div>

        <div className="academic-table-wrapper">
          <table className="academic-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Roll No</th>
                <th>Student Name</th>
                <th>Symbol Number</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No students found</td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.roll}</td>
                    <td style={{ fontWeight: 600 }}>{student.name}</td>
                    <td><code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{student.symbol}</code></td>
                    <td>
                      <div className="action-icons">
                        <button className="icon-btn view" title="View Preview" onClick={() => handleView(student)}>
                          <Eye size={16} />
                        </button>
                        <button className="icon-btn print" title="Print Admit Card">
                          <Printer size={16} />
                        </button>
                        <button className="icon-btn download" title="Download PDF">
                          <Download size={16} />
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

      {/* Preview Modal */}
      {showPreview && selectedStudent && (
        <div className="preview-modal-overlay">
          <div className="preview-modal">
            <X className="close-modal" onClick={() => setShowPreview(false)} />
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="#10b981" />
              Admit Card Preview
            </h3>
            
            <div className="admit-card-demo">
              <div className="school-header">
                <h4 style={{ margin: 0 }}>SIDDHA ADARBHUT BIDHYALA</h4>
                <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>Kathmandu, Nepal | First Terminal Exam 2081</p>
                <div style={{ marginTop: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>ADMIT CARD</div>
              </div>

              <div className="student-info-grid">
                <div className="info-item"><label>Name:</label><span>{selectedStudent.name}</span></div>
                <div className="info-item"><label>Roll No:</label><span>{selectedStudent.roll}</span></div>
                <div className="info-item"><label>Class:</label><span>{selectedStudent.class}</span></div>
                <div className="info-item"><label>Symbol No:</label><span>{selectedStudent.symbol}</span></div>
              </div>

              <div style={{ marginTop: '1.5rem', borderTop: '1px dashed #e5e7eb', paddingTop: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
                <p>Note: Please bring this admit card to the examination hall. Use of electronic devices is strictly prohibited.</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                  <span>____________________<br/>Student Signature</span>
                  <span>____________________<br/>Principal Signature</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn-bulk primary" style={{ flex: 1, justifyContent: 'center' }}>
                <Printer size={18} /> Print Now
              </button>
              <button className="btn-bulk" style={{ flex: 1, justifyContent: 'center' }}>
                <Download size={18} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
