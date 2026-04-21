'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SchoolAdminNavbar from '../../Components/SchoolAdminNavbar';
import SubjectForm from './components/SubjectForm';
import SubjectTable from './components/SubjectTable';
import RoutineHeader from './components/RoutineHeader';
import RoutineTable from './components/RoutineTable';
import Modal from './components/Modal';
import './subjects.css';
import { Subject, SubjectRecord, ClassRoutine } from './types';
import { Toaster, toast } from 'sonner';

export default function SchoolAdminAcademicSubjectsPage() {
  const [subjectsRecords, setSubjectsRecords] = useState<SubjectRecord[]>([]);
  const [currentRoutine, setCurrentRoutine] = useState<ClassRoutine | null>(null);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isLoadingRoutine, setIsLoadingRoutine] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SubjectRecord | null>(null);

  const [routineYear, setRoutineYear] = useState('2081-2082');
  const [routineClass, setRoutineClass] = useState('Class 1');
  const [searchTerm, setSearchTerm] = useState('');

  // ... rest same

  const fetchSubjects = useCallback(async () => {
    try {
      setIsLoadingSubjects(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/SchoolAdmin/Academics/Subjects/api/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSubjectsRecords(data.data);
      }
    } catch (error) {
      console.error('Fetch subjects error:', error);
      toast.error('Failed to load subjects');
    } finally {
      setIsLoadingSubjects(false);
    }
  }, []);

  const fetchRoutine = useCallback(async () => {
    try {
      setIsLoadingRoutine(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const params = new URLSearchParams({
        academicYear: routineYear,
        className: routineClass
      });

      const response = await fetch(`/SchoolAdmin/Academics/Subjects/api/routine?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCurrentRoutine(data.data);
      } else {
        setCurrentRoutine(null);
      }
    } catch (error) {
      console.error('Fetch routine error:', error);
      toast.error('Failed to load routine');
    } finally {
      setIsLoadingRoutine(false);
    }
  }, [routineYear, routineClass]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleSaveSubjects = async (payload: { className: string; academicYear: string; subjects: Subject[] }) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      let response;
      if (editingRecord?._id) {
        response = await fetch(`/SchoolAdmin/Academics/Subjects/api/subjects/${editingRecord._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('/SchoolAdmin/Academics/Subjects/api/subjects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        fetchSubjects();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Save subjects error:', error);
      toast.error('Failed to save subjects');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubjectRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject record?')) return;

    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/SchoolAdmin/Academics/Subjects/api/subjects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Subject record deleted');
        fetchSubjects();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Delete subjects error:', error);
      toast.error('Failed to delete subject record');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSubjectRecord = (record: SubjectRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleSaveRoutine = async (routineData: Partial<ClassRoutine>) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const payload = {
        ...routineData,
        academicYear: routineYear,
        className: routineClass
      };

      let response;
      if (currentRoutine?._id) {
        response = await fetch(`/SchoolAdmin/Academics/Subjects/api/routine/${currentRoutine._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('/SchoolAdmin/Academics/Subjects/api/routine', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        fetchRoutine();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Save routine error:', error);
      toast.error('Failed to save routine');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="subjects-page">
      <SchoolAdminNavbar />
      <Toaster position="top-right" />
      <main className="main-content">
        <header className="page-header">
          <h1 className="page-title">Academics: Subjects & Routine</h1>
        </header>

        <div className="content-container">
          {/* Section 1: Subject Management */}
          <section className="section-container card">
             <div className="subjects-header">
               <h2 className="section-title">👉 &quot;Add Subjects to School (Current Academic Year)&quot;</h2>
               <div className="header-controls">
                 <input 
                   type="text" 
                   placeholder="Search subjects..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="search-input"
                 />
                 <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Add New Record</button>
               </div>
             </div>
            
            <Modal 
              isOpen={isModalOpen} 
              onClose={() => {
                setIsModalOpen(false);
                setEditingRecord(null);
              }} 
              title={editingRecord ? "Edit Subjects" : "Add Subjects to School"}
            >
              <SubjectForm 
                initialSelection={editingRecord}
                onSave={(data) => {
                  handleSaveSubjects(data);
                  setIsModalOpen(false);
                  setEditingRecord(null);
                }} 
                isLoading={isSaving} 
              />
            </Modal>
            
            <SubjectTable 
              records={subjectsRecords.filter(r => 
                r.className.toLowerCase().includes(searchTerm.toLowerCase()) || 
                r.academicYear.includes(searchTerm)
              )} 
              onEdit={handleEditSubjectRecord}
              onDelete={handleDeleteSubjectRecord} 
              isLoading={isLoadingSubjects} 
            />
          </section>

          {/* Section 2: Class Routine */}
          <section className="section-container card">
             <h2 className="section-title">👉 &quot;Create Class Routine&quot;</h2>
             <RoutineHeader 
              academicYear={routineYear} 
              setAcademicYear={setRoutineYear}
              className={routineClass}
              setClassName={setRoutineClass}
              onFetch={fetchRoutine}
            />
            <RoutineTable 
              initialData={currentRoutine} 
              onSave={handleSaveRoutine} 
              isLoading={isSaving || isLoadingRoutine} 
              academicYear={routineYear}
              className={routineClass}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
