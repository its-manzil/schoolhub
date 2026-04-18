'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Printer, 
  Download, 
  AlertTriangle,
  CalendarDays,
  FileSpreadsheet
} from 'lucide-react';
import './routine.css';

export default function RoutinePage() {
  const [rows, setRows] = useState([{ id: 1, subject: '', date: '' }]);
  const [showAlert, setShowAlert] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState({ year: '', exam: '', class: '' });

  const addRow = () => {
    setRows([...rows, { id: Date.now(), subject: '', date: '' }]);
  };

  const removeRow = (id: number) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const handleSave = () => {
    // Check for duplicate dates
    const dates = rows.map(r => r.date).filter(d => d !== '');
    const hasDuplicate = new Set(dates).size !== dates.length;
    
    if (hasDuplicate) {
      setShowAlert(true);
    } else {
      // Normal save logic
      alert('Routine saved for ' + activeRoadmap.class);
    }
  };

  const mockDates = [
    { date: '2081-05-10', day: 'Sunday' },
    { date: '2081-05-11', day: 'Monday' },
    { date: '2081-05-12', day: 'Tuesday' },
    { date: '2081-05-13', day: 'Wednesday' },
    { date: '2081-05-14', day: 'Thursday' },
    { date: '2081-05-15', day: 'Friday' },
  ];

  const mockClasses = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];

  return (
    <div className="routine-container">
      {/* Roadmap Dropdowns */}
      <section className="roadmap-section">
        <div className="roadmap-group">
          <label>Academic Year</label>
          <select 
            value={activeRoadmap.year} 
            onChange={(e) => setActiveRoadmap({...activeRoadmap, year: e.target.value})}
          >
            <option value="">Select Year</option>
            <option value="2081">2081 BS</option>
            <option value="2080">2080 BS</option>
          </select>
        </div>
        <div className="roadmap-group">
          <label>Exam Name</label>
          <select 
            value={activeRoadmap.exam}
            onChange={(e) => setActiveRoadmap({...activeRoadmap, exam: e.target.value})}
          >
            <option value="">Select Exam</option>
            <option value="mid">First Mid-Term</option>
            <option value="final">Final Exam</option>
          </select>
        </div>
        <div className="roadmap-group">
          <label>Class</label>
          <select 
            value={activeRoadmap.class}
            onChange={(e) => setActiveRoadmap({...activeRoadmap, class: e.target.value})}
          >
            <option value="">Select Class</option>
            <option value="1">Class 1</option>
            <option value="2">Class 2</option>
            <option value="3">Class 3</option>
            <option value="10">Class 10</option>
          </select>
        </div>
      </section>

      {/* Routine Entry Form */}
      {activeRoadmap.class && (
        <section className="routine-form-section">
          <div className="card-header">
            <h2 className="form-title">
              <CalendarDays size={22} color="#10b981" />
              Configure Routine for {activeRoadmap.class}
            </h2>
          </div>
          
          <div className="routine-rows-container">
            <div className="routine-row" style={{ marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.8rem', color: '#6b7280' }}>
              <span>Subject</span>
              <span>Exam Date (BS)</span>
              <span></span>
            </div>
            
            {rows.map((row) => (
              <div key={row.id} className="routine-row">
                <input 
                  type="text" 
                  placeholder="e.g. Mathematics" 
                  value={row.subject}
                  onChange={(e) => {
                    const newRows = rows.map(r => r.id === row.id ? {...r, subject: e.target.value} : r);
                    setRows(newRows);
                  }}
                />
                <input 
                  type="date" 
                  value={row.date}
                  onChange={(e) => {
                    const newRows = rows.map(r => r.id === row.id ? {...r, date: e.target.value} : r);
                    setRows(newRows);
                  }}
                />
                <button className="btn-icon delete" onClick={() => removeRow(row.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button className="btn-add-row" onClick={addRow}>
            <Plus size={18} /> Add Subject Row
          </button>

          <div className="routine-actions">
            <button className="btn-create" style={{ background: '#6b7280' }} onClick={() => setRows([{ id: 1, subject: '', date: '' }])}>Reset</button>
            <button className="btn-create" onClick={handleSave}>
              <Save size={18} style={{ marginRight: '8px' }} />
              Save Routine
            </button>
          </div>
        </section>
      )}

      {/* Routine Preview (Excel Style) */}
      <section className="preview-section">
        <div className="preview-header">
          <h2 className="form-title" style={{ marginBottom: 0 }}>
            <FileSpreadsheet size={22} color="#6b7280" />
            Routine Preview & Roadmap
          </h2>
          <div className="print-actions">
            <button className="btn-print" title="Download PDF">
              <Download size={18} />
              PDF
            </button>
            <button className="btn-print primary" title="Print Routine" onClick={() => window.print()}>
              <Printer size={18} />
              Print
            </button>
          </div>
        </div>

        <div className="academic-table-wrapper" style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <table className="routine-excel-table">
            <thead>
              <tr>
                <th className="class-col">Class</th>
                {mockDates.map((d, i) => (
                  <th key={i}>
                    {d.day}
                    <span className="date-header">{d.date}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockClasses.map((cls, idx) => (
                <tr key={idx}>
                  <td className="class-col">{cls}</td>
                  {mockDates.map((_, i) => (
                    <td key={i} className="subject-cell">
                      {idx === 0 && i === 0 ? 'Mathematics' : idx === 0 && i === 1 ? 'English' : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Duplicate Date Alert */}
      {showAlert && (
        <div className="alert-overlay">
          <div className="alert-container">
            <div className="alert-icon">
              <AlertTriangle size={32} />
            </div>
            <h3 className="alert-title">Schedule Conflict</h3>
            <p className="alert-msg">
              Two subjects are scheduled for the same date. Would you like to merge these exams for the same day?
            </p>
            <div className="alert-actions">
              <button className="alert-btn" onClick={() => setShowAlert(false)}>Cancel</button>
              <button className="alert-btn primary" onClick={() => setShowAlert(false)}>Merge & Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
