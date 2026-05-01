'use client';

import React, { useState, useEffect } from 'react';
import { Search, Users, CheckCircle2, Circle } from 'lucide-react';
import './StudentSelector.css';

interface Student {
  studentId: string;
  name: string;
  rollNumber?: string;
  className: string;
  section?: string;
}

interface StudentSelectorProps {
  selectedStudents: string[];
  onChange: (studentIds: string[]) => void;
  schoolId: number;
  className: string;
}

export default function StudentSelector({ 
  selectedStudents, 
  onChange, 
  schoolId, 
  className 
}: StudentSelectorProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!className) {
        setStudents([]);
        return;
      }
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:2056/api/students?schoolId=${schoolId}&className=${className}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
          setStudents(result.data);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [className, schoolId]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStudent = (id: string) => {
    if (selectedStudents.includes(id)) {
      onChange(selectedStudents.filter(sid => sid !== id));
    } else {
      onChange([...selectedStudents, id]);
    }
  };

  const selectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      onChange([]);
    } else {
      onChange(filteredStudents.map(s => s.studentId));
    }
  };

  return (
    <div className="billing-card student-selector-container">
      <div className="card-header-alt">
        <div className="header-info">
          <Users size={18} className="text-primary" />
          <h3 className="card-title-sm">Select Students</h3>
          <span className="count-badge">{selectedStudents.length} selected</span>
        </div>
        <button className="btn-text" onClick={selectAll} disabled={filteredStudents.length === 0}>
          {selectedStudents.length === filteredStudents.length && filteredStudents.length > 0 ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      
      <div className="search-box">
        <Search size={16} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search by name or ID..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="student-list-container">
        {loading ? (
          <div className="list-loading">Loading students...</div>
        ) : filteredStudents.length > 0 ? (
          <div className="student-list">
            {filteredStudents.map((student) => {
              const isSelected = selectedStudents.includes(student.studentId);
              return (
                <div 
                  key={student.studentId} 
                  className={`student-row-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleStudent(student.studentId)}
                >
                  <div className="checkbox-wrapper">
                    {isSelected ? <CheckCircle2 size={20} className="text-primary" /> : <Circle size={20} className="text-muted" />}
                  </div>
                  <div className="student-info">
                    <span className="student-name">{student.name}</span>
                    <span className="student-id">{student.studentId}</span>
                  </div>
                  {student.rollNumber && (
                    <div className="student-roll">Roll: {student.rollNumber}</div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="list-empty">
            {className ? 'No students found in this class.' : 'Please select a class first.'}
          </div>
        )}
      </div>
    </div>
  );
}
