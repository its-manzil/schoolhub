'use client';

import React, { useState } from 'react';
import './SubjectTable.css';
import { SubjectRecord } from '../types';

interface SubjectTableProps {
  records: SubjectRecord[];
  onEdit: (record: SubjectRecord) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const SubjectTable: React.FC<SubjectTableProps> = ({ records, onEdit, onDelete, isLoading }) => {
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  if (isLoading) return <div className="loading">Loading subjects...</div>;
  if (records.length === 0) return <div className="empty-state">No subjects added for this criteria.</div>;

  return (
    <div className="subject-table-container">
      <h2 className="section-title">Current Subjects List</h2>
      <div className="subject-records-list">
        {records.map((record) => (
          <div key={record._id} className="record-card">
            <div className="record-summary" onClick={() => setExpandedRecord(expandedRecord === record._id ? null : (record._id || null))}>
              <div className="summary-main">
                <span className="class-badge">{record.className}</span>
                <span className="year-text">{record.academicYear}</span>
                <span className="count-text">{record.subjects.length} Subjects</span>
              </div>
              <div className="summary-actions">
                 <span className="expand-icon">{expandedRecord === record._id ? '▲' : '▼'}</span>
                 <button 
                   className="btn-edit" 
                   onClick={(e) => {
                     e.stopPropagation();
                     onEdit(record);
                   }}
                 >
                   Edit
                 </button>
                 <button 
                   className="btn-delete" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (record._id) onDelete(record._id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            {expandedRecord === record._id && (
              <div className="record-details">
                <table className="mini-subjects-table">
                  <thead>
                    <tr>
                      <th>Subject Name</th>
                      <th>Type</th>
                      <th>Credit Hours</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.subjects.map((sub, idx) => (
                      <tr key={idx}>
                        <td>{sub.name}</td>
                        <td><span className={`type-badge ${sub.type.toLowerCase()}`}>{sub.type}</span></td>
                        <td>{sub.creditHours || '-'}</td>
                        <td>{sub.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectTable;
