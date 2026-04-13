"use client";

import { useState } from 'react';
import { Users, Calendar, AlertTriangle, CalendarDays, Search, Grid, List, Plus } from 'lucide-react';
import Layout from "../Components/Layout";
import AddStudentModal from './AddStudentModal';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'grid' | 'table'>('grid');
  const [filters, setFilters] = useState({
    class: 'all',
    section: 'all',
    status: 'all'
  });
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data for summary cards
  const summaryData = [
    {
      title: "Total Students",
      value: "1000",
      icon: <Users size={32} />,
      color: "var(--primary-green)"
    },
    {
      title: "Present Today",
      value: "89%",
      icon: <Calendar size={32} />,
      color: "var(--primary-green)"
    },
    {
      title: "Low Attendance",
      value: "25",
      icon: <AlertTriangle size={32} />,
      color: "var(--accent-red)"
    },
    {
      title: "Upcoming Events",
      value: "4",
      icon: <CalendarDays size={32} />,
      color: "var(--accent-yellow)"
    }
  ];

  // Mock student data
  const mockStudents = [
    { id: 1, name: "Ashes Pokhrel", class: "Class 1A", rollNo: "2", initials: "AP" },
    { id: 2, name: "Sita Sharma", class: "Class 1A", rollNo: "3", initials: "SS" },
    { id: 3, name: "Ramesh Thapa", class: "Class 1B", rollNo: "1", initials: "RT" },
    { id: 4, name: "Gita Kumari", class: "Class 2A", rollNo: "5", initials: "GK" },
    { id: 5, name: "Bikram Gurung", class: "Class 2A", rollNo: "6", initials: "BG" },
    { id: 6, name: "Anita Singh", class: "Class 2B", rollNo: "2", initials: "AS" },
  ];

  const handleAddStudent = (studentData: unknown) => {
    console.log('Adding student:', studentData);
    // Here you would typically make an API call to add the student
  };

  return (
    <Layout>
      <div className="student-dashboard">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Student management</h1>
          <p className="page-subtitle">Manage enrollments, profiles, and track student performance.</p>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          {summaryData.map((card, index) => (
            <div key={index} className="summary-card">
              <div className="card-icon" style={{ color: card.color }}>
                {card.icon}
              </div>
              <div className="card-content">
                <h3 className="card-title">{card.title}</h3>
                <p className="card-value">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary add-student-btn"
          >
            <Plus size={20} />
            Add Student
          </button>
          <button className="btn-secondary">
            View Records
          </button>
          <button className="btn-secondary">
            Generate ID Cards
          </button>
        </div>

        {/* Filter and Search Section */}
        <div className="filter-section">
          <div className="filter-left">
            <div className="search-container">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search students"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-dropdowns">
              <select 
                value={filters.class} 
                onChange={(e) => setFilters({...filters, class: e.target.value})}
                className="filter-dropdown"
              >
                <option value="all">All classes</option>
                <option value="1">Class 1</option>
                <option value="2">Class 2</option>
                <option value="3">Class 3</option>
              </select>
              <select 
                value={filters.section} 
                onChange={(e) => setFilters({...filters, section: e.target.value})}
                className="filter-dropdown"
              >
                <option value="all">Section: All</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
              <select 
                value={filters.status} 
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="filter-dropdown"
              >
                <option value="all">Status: All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="filter-right">
            <span className="results-text">Showing results</span>
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewType === 'grid' ? 'active' : ''}`}
                onClick={() => setViewType('grid')}
              >
                <Grid size={18} />
              </button>
              <button 
                className={`view-btn ${viewType === 'table' ? 'active' : ''}`}
                onClick={() => setViewType('table')}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Student Display */}
        <div className="student-display">
          {viewType === 'grid' ? (
            <div className="student-grid">
              {mockStudents.map((student) => (
                <div key={student.id} className="student-card">
                  <div className="student-avatar">
                    {student.initials}
                  </div>
                  <h4 className="student-name">{student.name}</h4>
                  <div className="student-info">
                    <span className="info-badge">{student.class}</span>
                    <span className="info-badge">Roll no {student.rollNo}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="student-table-container">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockStudents.map((student) => (
                    <tr key={student.id}>
                      <td>STU00{student.id}</td>
                      <td>{student.name}</td>
                      <td>{student.class}</td>
                      <td>{student.class.slice(-1)}</td>
                      <td><span className="status-badge active">Active</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn edit">Edit</button>
                          <button className="action-btn delete">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Student Modal */}
        <AddStudentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddStudent}
        />
      </div>
    </Layout>
  );
}
