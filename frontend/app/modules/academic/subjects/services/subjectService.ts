import { Subject, SubjectRecord } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

export const subjectService = {
  async fetchSubjects(): Promise<{ success: boolean; data: SubjectRecord[]; message?: string }> {
    const response = await fetch(`${BASE_URL}/Academic/Subjects/api/subjects`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async createSubject(payload: { className: string; academicYear: string; subjects: Subject[] }): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${BASE_URL}/Academic/Subjects/api/subjects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return response.json();
  },

  async updateSubject(id: string, payload: { className: string; academicYear: string; subjects: Subject[] }): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${BASE_URL}/Academic/Subjects/api/subjects/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return response.json();
  },

  async deleteSubject(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${BASE_URL}/Academic/Subjects/api/subjects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async importSubjects(sourceClass: string, sourceYear: string, targetClass: string, targetYear: string): Promise<{ success: boolean; message: string }> {
    // Assuming there's an import endpoint or reusing create/update
    const params = new URLSearchParams({ className: sourceClass, academicYear: sourceYear });
    const getResponse = await fetch(`${BASE_URL}/Academic/Subjects/api/subjects?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    const getData = await getResponse.json();
    
    if (getData.success && getData.data.length > 0) {
      const subjects = getData.data[0].subjects;
      return this.createSubject({ className: targetClass, academicYear: targetYear, subjects });
    }
    
    return { success: false, message: 'Source subjects not found' };
  }
};
