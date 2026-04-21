import { useState, useCallback } from 'react';
import { Subject, SubjectRecord } from '../types';
import { subjectService } from '../services/subjectService';
import { toast } from 'sonner';

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await subjectService.fetchSubjects();
      if (result.success) {
        setSubjects(result.data);
      } else {
        setError(result.message || 'Failed to fetch subjects');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSubject = async (payload: { className: string; academicYear: string; subjects: Subject[] }) => {
    setIsLoading(true);
    try {
      const result = await subjectService.createSubject(payload);
      if (result.success) {
        toast.success(result.message);
        await fetchSubjects();
        return true;
      } else {
        toast.error(result.message);
        return false;
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to create subject record');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubject = async (id: string, payload: { className: string; academicYear: string; subjects: Subject[] }) => {
    setIsLoading(true);
    try {
      const result = await subjectService.updateSubject(id, payload);
      if (result.success) {
        toast.success(result.message);
        await fetchSubjects();
        return true;
      } else {
        toast.error(result.message);
        return false;
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update subject record');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    setIsLoading(true);
    try {
      const result = await subjectService.deleteSubject(id);
      if (result.success) {
        toast.success(result.message);
        await fetchSubjects();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete subject record');
    } finally {
      setIsLoading(false);
    }
  };

  const importSubjects = async (sourceClass: string, sourceYear: string, targetClass: string, targetYear: string) => {
    setIsLoading(true);
    try {
      const result = await subjectService.importSubjects(sourceClass, sourceYear, targetClass, targetYear);
      if (result.success) {
        toast.success(result.message);
        await fetchSubjects();
        return true;
      } else {
        toast.error(result.message);
        return false;
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to import subjects');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subjects,
    isLoading,
    error,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    importSubjects
  };
};
