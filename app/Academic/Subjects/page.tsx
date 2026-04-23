'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSubjects } from '../../modules/academic/subjects/hooks/useSubjects';
import SubjectsTable from '../../modules/academic/subjects/components/SubjectsTable';
import SubjectFormModal from '../../modules/academic/subjects/components/SubjectFormModal';
import ClassYearSelector from '../../modules/academic/subjects/components/ClassYearSelector';
import ImportModal from '../../modules/academic/subjects/components/ImportModal';
import RoutineBuilderModal from '../../modules/academic/routine/components/RoutineBuilderModal';
import SchoolScheduleConfig from '../../modules/academic/routine/components/SchoolScheduleConfig';
import Modal from './components/Modal';
import './subjects.css';
import { SubjectRecord, Subject } from '../../modules/academic/subjects/types';
import { Toaster, toast } from 'sonner';
import AcademicNavbar from '../components/AcademicNavbar';

export default function AcademicSubjectsPage() {
  const {
    subjects: subjectsRecords,
    isLoading: isLoadingSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    fetchSubjects,
    importSubjects
  } = useSubjects();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRoutineBuilderOpen, setIsRoutineBuilderOpen] = useState(false);
  const [isScheduleConfigOpen, setIsScheduleConfigOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SubjectRecord | null>(null);

  const [routineYear, setRoutineYear] = useState('2081-2082');
  const [routineClass, setRoutineClass] = useState('Class 1');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRoutine = useCallback(async () => {
    // Keep existing fetchRoutine logic or migrate to routineService later
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const params = new URLSearchParams({
        academicYear: routineYear,
        className: routineClass
      });

      const response = await fetch(`/Academic/Subjects/api/routine?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await response.json();
    } catch (error) {
      console.error('Fetch routine error:', error);
      toast.error('Failed to load routine');
    }
  }, [routineYear, routineClass]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleSaveSubjects = async (payload: { className: string; academicYear: string; subjects: Subject[] }) => {
    let success;
    if (editingRecord?._id) {
      success = await updateSubject(editingRecord._id, payload);
    } else {
      success = await createSubject(payload);
    }
    if (success) {
      setIsModalOpen(false);
      setEditingRecord(null);
    }
  };

  const handleImport = async (sourceClass: string, sourceYear: string) => {
    const success = await importSubjects(sourceClass, sourceYear, routineClass, routineYear);
    if (success) setIsImportModalOpen(false);
  };

  return (
    <div className="subjects-page">
      <AcademicNavbar />
      <Toaster position="top-right" />
      <main className="main-content">
        <header className="page-header">
          <h1 className="page-title"> Subjects & Routine</h1>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => setIsScheduleConfigOpen(true)}>
              School Schedule
            </button>
            <button className="btn-primary" onClick={() => setIsRoutineBuilderOpen(true)}>
              Create Class Routine
            </button>
          </div>
        </header>

        <div className="content-container">
          {/* Section 1: Subject Management */}
          <section className="section-container card">
             <div className="subjects-header">
               <h2 className="section-title">&quot;Manage Subjects &quot;</h2>
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

             <ClassYearSelector 
               academicYear={routineYear}
               setAcademicYear={setRoutineYear}
               className={routineClass}
               setClassName={setRoutineClass}
               onImport={() => setIsImportModalOpen(true)}
               onFetch={fetchSubjects}
             />
            
            <Modal 
              isOpen={isModalOpen} 
              onClose={() => {
                setIsModalOpen(false);
                setEditingRecord(null);
              }} 
              title={editingRecord ? "Edit Subjects" : "Add Subjects"}
            >
              <SubjectFormModal 
                initialData={editingRecord}
                onSave={handleSaveSubjects} 
                isLoading={isLoadingSubjects} 
              />
            </Modal>

            <Modal
              isOpen={isImportModalOpen}
              onClose={() => setIsImportModalOpen(false)}
              title="Import Subjects"
            >
              <ImportModal 
                onImport={handleImport}
                onClose={() => setIsImportModalOpen(false)}
              />
            </Modal>

            <Modal
              isOpen={isRoutineBuilderOpen}
              onClose={() => setIsRoutineBuilderOpen(false)}
              title="Advanced Routine Builder"
            >
              <RoutineBuilderModal
                initialClassName={routineClass}
                initialAcademicYear={routineYear}
                subjectsRecords={subjectsRecords}
                onClose={() => setIsRoutineBuilderOpen(false)}
                onSaveSuccess={fetchRoutine}
              />
            </Modal>

            <Modal
              isOpen={isScheduleConfigOpen}
              onClose={() => setIsScheduleConfigOpen(false)}
              title="Configure Global School Schedule"
            >
              <SchoolScheduleConfig 
                onClose={() => setIsScheduleConfigOpen(false)}
              />
            </Modal>
            
            <SubjectsTable 
              records={subjectsRecords.filter(r => 
                r.className.toLowerCase().includes(searchTerm.toLowerCase()) || 
                r.academicYear.includes(searchTerm)
              )} 
              onEdit={(record) => {
                setEditingRecord(record);
                setIsModalOpen(true);
              }}
              onDelete={deleteSubject} 
              isLoading={isLoadingSubjects} 
            />
          </section>

          {/* Section 2: Legacy Routine View (Optional - kept for backward compatibility) */}
          <section className="section-container card">
             <h2 className="section-title">👉 &quot;Existing Class Routine View&quot;</h2>
             {/* ... you can keep RoutineHeader/Table here if you want dual view or remove ... */}
          </section>
        </div>
      </main>
    </div>
  );
}
