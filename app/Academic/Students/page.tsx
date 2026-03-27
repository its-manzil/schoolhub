'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import '../academic.css';
import './students.css';
import {
  Users, Search, Filter, Plus, Printer,
  Grid, List, AlertCircle, Clock, Trash2, Edit, ChevronDown, X
} from 'lucide-react';
import AcademicNavbar from '../components/AcademicNavbar';
import StudentGrid from './components/StudentGrid';
import StudentTable from './components/StudentTable';
import StudentSidePanel from './components/StudentSidePanel';
import AddStudentForm from './components/AddStudentForm';
import EditStudentForm from './components/EditStudentForm';
import { Student, SchoolInfo, CLASS_OPTIONS, StudentFormData } from './types';

export default function StudentsPage() {
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [viewType, setViewType] = useState<'grid' | 'table'>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedStudentForPanel, setSelectedStudentForPanel] = useState<Student | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editStudentData, setEditStudentData] = useState<{ id: string, data: StudentFormData } | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    class: 'all',
    section: 'all',
    status: 'all'
  });

  useEffect(() => {
    setIsClient(true);
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (!token || !userData) return router.push('/Login');

        const user = JSON.parse(userData);
        if (user.role !== 'schooladmin' && user.role !== 'academic') return router.push('/Login');

        setIsAdmin(true);
        if (user.schoolId) setSchoolId(user.schoolId);
      } catch {
        router.push('/Login');
      }
    };
    initAuth();
  }, [router]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch('http://localhost:2056/api/schools/my-school', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => data.success && setSchoolInfo(data.data))
      .catch(() => { });
  }, [isAdmin]);

  const fetchStudents = useCallback(async () => {
    if (!isAdmin || !schoolId) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:2056/api/students', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.status === 401) return router.push('/Login');
      const data = await res.json();
      if (data.success) {
        setStudents(data.data.sort((a: Student, b: Student) => a.name.localeCompare(b.name)));
      }
    } catch {
      setErrorMsg('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, schoolId, router]);

  useEffect(() => {
    if (isAdmin && schoolId) fetchStudents();
  }, [isAdmin, schoolId, fetchStudents]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const q = searchQuery.toLowerCase();
      const matchSearch = student.name.toLowerCase().includes(q)
        || student.studentId.toLowerCase().includes(q)
        || student.rollNumber.toString().includes(q)
        || student.fatherName.toLowerCase().includes(q);

      const matchClass = filters.class === 'all' || student.className === filters.class;
      const matchSection = filters.section === 'all' || student.section === filters.section;
      const matchStatus = filters.status === 'all' || (filters.status === 'active' ? student.isActive : !student.isActive);

      return matchSearch && matchClass && matchSection && matchStatus;
    });
  }, [students, searchQuery, filters]);

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredStudents.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredStudents.map(s => s._id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleEdit = (student: Student) => {
    setSelectedStudentForPanel(null);
    setEditStudentData({
      id: student._id,
      data: {
        name: student.name,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth.split('T')[0],
        phone: student.phone,
        email: student.email || '',
        address: student.address,
        fatherName: student.fatherName,
        motherName: student.motherName,
        fatherPhone: student.fatherPhone,
        motherPhone: student.motherPhone || '',
        className: student.className,
        section: student.section,
        rollNumber: student.rollNumber.toString(),
        bloodGroup: student.bloodGroup || '',
        emergencyContact: student.emergencyContact,
        admissionDate: student.admissionDate.split('T')[0]
      }
    });
  };

  const handleDeleteMany = async () => {
    if (!confirm(`Delete ${selectedIds.size} selected student(s)?`)) return;
    try {
      const token = localStorage.getItem('token');
      for (const id of Array.from(selectedIds)) {
        await fetch(`http://localhost:2056/api/students/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      setSuccessMsg(`Deleted ${selectedIds.size} student(s) successfully`);
      setSelectedIds(new Set());
      fetchStudents();
    } catch {
      setErrorMsg('Error deleting students');
    }
  };

  if (!isClient || !isAdmin) return <div className="stdd-page-wrapper" />;

  return (
    <div className="stdd-page-wrapper">
      <AcademicNavbar />

      <main className="stdd-main-content">

        {/* Header Section */}
        <div className="stdd-header-area">
          <div>
            <h1 className="stdd-title-h1">Student Management</h1>
            <p className="stdd-title-sub">Manage enrollments, profiles, and track student performance.</p>
          </div>
          <div className="stdd-header-actions">
            <button className="stdd-btn stdd-btn-outline">
              <Printer size={18} /> Print Bulk ID
            </button>
            <button onClick={() => setShowAddForm(true)} className="stdd-btn stdd-btn-primary">
              <Plus size={18} /> Add Student
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {successMsg && (
          <div className="stdd-alert-global stdd-alert-global-success">
            <div className="stdd-dot" style={{ width: 8, height: 8, background: 'currentColor' }} />
            {successMsg}
            <button onClick={() => setSuccessMsg('')} className="stdd-batch-close" style={{ marginLeft: 'auto' }}><X size={16} /></button>
          </div>
        )}
        {errorMsg && (
          <div className="stdd-alert-global stdd-alert-global-error">
            <AlertCircle size={18} />
            {errorMsg}
            <button onClick={() => setErrorMsg('')} className="stdd-batch-close" style={{ marginLeft: 'auto' }}><X size={16} /></button>
          </div>
        )}

        {/* Context Bar */}
        <div className="stdd-context-grid">
          <ContextCard icon={<Users size={24} />} title="Total Students" value={filteredStudents.length.toString()} bgClass="stdd-bg-primary-light" />
          <ContextCard icon={<div className="stdd-dot" style={{ width: 12, height: 12, background: 'currentColor' }} />} title="Present Today" value="92%" bgClass="stdd-bg-success-light" />
          <ContextCard icon={<AlertCircle size={24} />} title="Low Attendance" value="14" bgClass="stdd-bg-warning-light" />
          <ContextCard icon={<Clock size={24} />} title="Upcoming Exams" value="2" bgClass="stdd-bg-danger-light" />
        </div>

        {/* Filters and View Toggles */}
        <div className="stdd-filters-bar">
          <div className="stdd-filter-group">
            {/* Search */}
            <div className="stdd-search-box">
              <Search size={16} className="stdd-icon-left" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="stdd-search-input"
              />
            </div>

            {/* Class Filter */}
            <div className="stdd-select-box">
              <Filter className="stdd-icon-left" size={14} />
              <select
                value={filters.class}
                onChange={e => setFilters({ ...filters, class: e.target.value })}
              >
                <option value="all">All Classes</option>
                {CLASS_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <ChevronDown size={14} className="stdd-icon-right" />
            </div>

            {/* Status Filter */}
            <div className="stdd-select-box">
              <select
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
                style={{ paddingLeft: '1rem' }}
              >
                <option value="all">Status: All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown size={14} className="stdd-icon-right" />
            </div>
          </div>

          <div className="stdd-view-toggles">
            <span className="stdd-results-text">
              Showing <span>{filteredStudents.length}</span> results
            </span>
            <div className="stdd-toggle-group">
              <button
                onClick={() => setViewType('grid')}
                className={`stdd-toggle-btn ${viewType === 'grid' ? 'active' : ''}`}
                title="Grid View"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewType('table')}
                className={`stdd-toggle-btn ${viewType === 'table' ? 'active' : ''}`}
                title="Table View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="stdd-content-area">
          {loading ? (
            <div className="stdd-loader-wrap">
              <div className="stdd-loader-spinner"></div>
            </div>
          ) : viewType === 'grid' ? (
            <StudentGrid
              students={filteredStudents}
              schoolInfo={schoolInfo}
              selectedIds={selectedIds}
              onToggleSelection={toggleSelection}
              onStudentClick={setSelectedStudentForPanel}
            />
          ) : (
            <StudentTable
              students={filteredStudents}
              schoolInfo={schoolInfo}
              selectedIds={selectedIds}
              onToggleSelection={toggleSelection}
              onToggleAll={toggleAll}
              onStudentClick={setSelectedStudentForPanel}
            />
          )}

          {/* Empty State */}
          {!loading && filteredStudents.length === 0 && (
            <div className="stdd-empty-state">
              <div className="stdd-empty-icon">
                <Search size={28} />
              </div>
              <h3 className="stdd-empty-title">No students found</h3>
              <p className="stdd-empty-sub">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>

      </main>

      {/* Floating Batch Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="stdd-floating-action-bar">
          <div className="stdd-batch-info">
            <span className="stdd-batch-count">{selectedIds.size}</span>
            <span className="stdd-batch-text">Selected</span>
          </div>
          <div className="stdd-batch-divider" />
          <div className="stdd-batch-actions">
            <button className="stdd-batch-btn">Action</button>
            <button className="stdd-batch-btn">Export</button>
            <button onClick={handleDeleteMany} className="stdd-batch-btn stdd-batch-btn-danger">
              <Trash2 size={16} /> Delete
            </button>
            <button onClick={clearSelection} className="stdd-batch-close">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Side Panel & Modals */}
      {selectedStudentForPanel && (
        <StudentSidePanel
          student={selectedStudentForPanel}
          schoolInfo={schoolInfo}
          onClose={() => setSelectedStudentForPanel(null)}
          onEdit={handleEdit}
          onShowIdCard={() => { alert('ID Card to be integrated back') }}
        />
      )}

      {showAddForm && schoolId && (
        <AddStudentForm
          schoolId={schoolId}
          onClose={() => setShowAddForm(false)}
          refetchStudents={fetchStudents}
          setSuccess={setSuccessMsg}
          setError={setErrorMsg}
        />
      )}

      {editStudentData && (
        <EditStudentForm
          studentId={editStudentData.id}
          initialData={editStudentData.data}
          onClose={() => setEditStudentData(null)}
          refetchStudents={fetchStudents}
          setSuccess={setSuccessMsg}
          setError={setErrorMsg}
        />
      )}

    </div>
  );
}

function ContextCard({ icon, title, value, bgClass }: { icon: React.ReactNode, title: string, value: string, bgClass: string }) {
  return (
    <div className="stdd-context-card">
      <div className={`stdd-context-icon ${bgClass}`}>
        {icon}
      </div>
      <div className="stdd-context-info">
        <span className="stdd-context-title">{title}</span>
        <span className="stdd-context-value">{value}</span>
      </div>
    </div>
  );
}
