'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  Printer, 
  Save, 
  X,
  FileSpreadsheet,
  Trophy,
  Download
} from 'lucide-react';
import './result.css';

export default function ResultPage() {
  const [showResult, setShowResult] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const mockResults = [
    { id: 1, roll: '1', name: 'Aarav Sharma', cgpa: '3.92', rank: '1' },
    { id: 2, roll: '2', name: 'Ishita Gupta', cgpa: '3.85', rank: '2' },
    { id: 3, roll: '3', name: 'Kabir Verma', cgpa: '3.70', rank: '4' },
    { id: 4, roll: '4', name: 'Meera Rai', cgpa: '3.78', rank: '3' },
    { id: 5, roll: '5', name: 'Siddharth Singh', cgpa: '3.55', rank: '5' },
  ];

  const handlePreview = (student: any) => {
    setSelectedStudent(student);
    setShowResult(true);
  };

  const filteredResults = mockResults.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll.includes(searchTerm)
  );

  return (
    <div className="result-container">
      {/* Dropdown Roadmap */}
      <section className="dropdown-roadmap">
        <div className="dropdown-group">
          <label>Academic Year</label>
          <select><option>2081 BS</option></select>
        </div>
        <div className="dropdown-group">
          <label>Exam Type</label>
          <select><option>First Mid-Term</option></select>
        </div>
        <div className="dropdown-group">
          <label>Class</label>
          <select><option>Class 10</option></select>
        </div>
      </section>

      {/* Result List Section */}
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
            <button className="btn-bulk">
              <Save size={18} /> Bulk Save Results
            </button>
            <button className="btn-bulk primary">
              <Printer size={18} /> Bulk Print Marksheets
            </button>
          </div>
        </div>

        <div className="academic-table-wrapper">
          <table className="academic-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Roll No</th>
                <th>Student Name</th>
                <th style={{ textAlign: 'center' }}>CGPA</th>
                <th style={{ textAlign: 'center' }}>Rank</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((res) => (
                <tr key={res.id}>
                  <td>{res.roll}</td>
                  <td style={{ fontWeight: 600 }}>{res.name}</td>
                  <td style={{ textAlign: 'center' }}><span className="cgpa-badge">{res.cgpa}</span></td>
                  <td style={{ textAlign: 'center' }}><span className="rank-badge-result">#{res.rank}</span></td>
                  <td>
                    <div className="action-icons">
                      <button className="icon-btn view" title="Preview Result" onClick={() => handlePreview(res)}>
                        <Eye size={16} />
                      </button>
                      <button className="icon-btn print" title="Print Marksheet">
                        <Printer size={16} />
                      </button>
                      <button className="icon-btn download" title="Save Result">
                        <Save size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Result Preview Modal */}
      {showResult && selectedStudent && (
        <div className="preview-modal-overlay">
          <div className="result-preview-modal">
            <X className="close-modal" onClick={() => setShowResult(false)} />
            <div className="marksheet-header">
              <h2 style={{ margin: 0 }}>SIDDHA ADARBHUT BIDHYALA</h2>
              <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>Kathmandu, Nepal | Estd: 2050</p>
              <h3 style={{ margin: '1rem 0 0', textDecoration: 'underline' }}>PROGRESS REPORT</h3>
              <p style={{ fontWeight: 700 }}>First Terminal Examination - 2081</p>
            </div>

            <div className="student-info-grid" style={{ marginBottom: '2rem' }}>
              <div className="info-item"><label>Name:</label><span>{selectedStudent.name}</span></div>
              <div className="info-item"><label>Roll No:</label><span>{selectedStudent.roll}</span></div>
              <div className="info-item"><label>Class:</label><span>10</span></div>
              <div className="info-item"><label>Section:</label><span>A</span></div>
            </div>

            <table className="marksheet-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Subjects</th>
                  <th>Full Marks</th>
                  <th>Obtained (TH)</th>
                  <th>Obtained (PR)</th>
                  <th>Total</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ textAlign: 'left' }}>Mathematics</td><td>100</td><td>72</td><td>-</td><td>72</td><td>A</td></tr>
                <tr><td style={{ textAlign: 'left' }}>Science</td><td>100</td><td>65</td><td>23</td><td>88</td><td>A+</td></tr>
                <tr><td style={{ textAlign: 'left' }}>English</td><td>100</td><td>68</td><td>20</td><td>88</td><td>A+</td></tr>
              </tbody>
            </table>

            <div className="result-summary-footer">
              <div className="summary-item"><label>Total CGPA</label><span>{selectedStudent.cgpa}</span></div>
              <div className="summary-item"><label>Grade</label><span>A+</span></div>
              <div className="summary-item"><label>Class Rank</label><span>{selectedStudent.rank}</span></div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
              <button className="btn-bulk primary" style={{ flex: 1, justifyContent: 'center' }}>
                <Printer size={18} /> Print Marksheet
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
