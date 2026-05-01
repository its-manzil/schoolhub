import { ClassRoutine, SchoolSchedule } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

export const routineService = {
  async fetchSchoolSchedule(academicYear?: string): Promise<{ success: boolean; data: SchoolSchedule | null; message?: string }> {
    const params = academicYear ? `?academicYear=${encodeURIComponent(academicYear)}` : '';
    const response = await fetch(`${BASE_URL}/Academic/Subjects/api/school-schedule${params}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async fetchAcademicYearsFromSchedules(): Promise<{ success: boolean; data: string[]; message?: string }> {
    const response = await fetch(`${BASE_URL}/Academic/Subjects/api/school-schedule`, {
      headers: getAuthHeaders()
    });
    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      // Extract unique academic years from schedules
      const years: string[] = result.data
        .map((schedule: { academicYear?: string }) => schedule.academicYear)
        .filter((year: string | undefined): year is string => Boolean(year));
      return { success: true, data: [...new Set(years)].sort() };
    }
    return { success: true, data: [] };
  },

  async saveSchoolSchedule(payload: SchoolSchedule): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${BASE_URL}/Academic/Subjects/api/school-schedule`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return response.json();
  },

  async fetchRoutine(className: string, academicYear: string): Promise<{ success: boolean; data: ClassRoutine | null; message?: string }> {
    const params = new URLSearchParams({ className, academicYear });
    const response = await fetch(`${BASE_URL}/Academic/Subjects/api/routine?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async createRoutine(payload: ClassRoutine): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${BASE_URL}/Academic/Subjects/api/routine`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return response.json();
  },

  async updateRoutine(id: string, payload: ClassRoutine): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${BASE_URL}/Academic/Subjects/api/routine/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return response.json();
  }
};
