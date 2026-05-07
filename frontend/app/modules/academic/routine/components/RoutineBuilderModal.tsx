'use client';

import React, { useState, useEffect } from 'react';
import './RoutineBuilderModal.css';
import { useRoutineBuilder } from '../hooks/useRoutineBuilder';
import TimeConfigForm from './TimeConfigForm';
import WeeklyGrid from './WeeklyGrid';
import { Period } from '../types';
import { SubjectRecord } from '../../subjects/types';
import { toast } from 'sonner';

interface RoutineBuilderModalProps {
  initialClassName?: string;
  initialAcademicYear?: string;
  subjectsRecords: SubjectRecord[];
  onClose: () => void;
  onSaveSuccess?: () => void;
}

const RoutineBuilderModal: React.FC<RoutineBuilderModalProps> = ({
  initialClassName = 'Class 1',
  initialAcademicYear = '2081-2082',
  subjectsRecords,
  onClose,
  onSaveSuccess
}) => {
  const [className, setClassName] = useState(initialClassName);
  const [academicYear, setAcademicYear] = useState(initialAcademicYear);
  
  const availableSubjects = subjectsRecords.find(
    r => r.className === className && r.academicYear === academicYear
  )?.subjects || [];
  
  const {
    periods,
    setPeriods,
    holidays,
    setHolidays,
    generateTimeSlots,
    saveRoutine,
    isLoading,
    error
  } = useRoutineBuilder(className, academicYear);

  const [step, setStep] = useState(1);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      resetState();
      onClose();
    }, 100);
  };

  const resetState = () => {
    setStep(1);
    setPeriods([]);
    setHolidays({
      Sunday: false, Monday: false, Tuesday: false, Wednesday: false,
      Thursday: false, Friday: false, Saturday: false
    });
    setIsClosing(false);
  };

  const handleHolidayToggle = (day: string) => {
    setHolidays((prev: Record<string, boolean>) => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleSave = async () => {
    const success = await saveRoutine();
    if (success && onSaveSuccess) {
      onSaveSuccess();
      handleClose();
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className={`routine-builder-modal ${isClosing ? 'closing' : ''}`}>
      <div className="modal-header">
        <h3>Create Class Routine</h3>
        <button onClick={handleClose} className="close-btn" type="button">&times;</button>
      </div>

      <div className="modal-body">
        {step === 1 && (
          <TimeConfigForm
            academicYear={academicYear}
            className={className}
            onGenerate={() => {
              generateTimeSlots();
              setStep(2);
            }}
            onAcademicYearChange={setAcademicYear}
            onClassChange={setClassName}
          />
        )}

        {step === 2 && (
          <div className="builder-step-2">
            <div className="step-info">
              <span><strong>Class:</strong> {className}</span>
              <span><strong>Year:</strong> {academicYear}</span>
            </div>

            <WeeklyGrid
              periods={periods}
              holidays={holidays}
              availableSubjects={availableSubjects}
              onUpdatePeriod={(idx: number, updated: Period) => {
                const next = [...periods];
                next[idx] = updated;
                setPeriods(next);
              }}
              onHolidayToggle={handleHolidayToggle}
            />

            <div className="step-actions">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary"
                disabled={isLoading}
              >
                Back to Config
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="btn-primary"
                disabled={isLoading || periods.length === 0}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-small"></span>
                    Saving...
                  </>
                ) : (
                  'Save Routine'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutineBuilderModal;
