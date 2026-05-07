import { ClassRoutine, SchoolSchedule } from '../types';

// ❌ Removed BASE_URL - not needed, all are Next.js API routes

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

export const routineService = {
  async fetchSchoolSchedule(academicYear?: string): Promise<{ success: boolean; data: SchoolSchedule | null; message?: string }> {
    const params = academicYear ? `?academicYear=${encodeURIComponent(academicYear)}` : '';
    const response = await fetch(`/api/academic/school-schedule${params}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async fetchAcademicYearsFromSchedules(): Promise<{ success: boolean; data: string[]; message?: string }> {
    const response = await fetch(`/api/academic/school-schedule`, {
      headers: getAuthHeaders()
    });
    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      const years: string[] = result.data
        .map((schedule: SchoolSchedule) => {
          // Handle both single schedule object and array of schedules
          if (schedule.academicYear) {
            return schedule.academicYear;
          } else if (Array.isArray(schedule) && schedule.length > 0) {
            return schedule[0].academicYear;
          }
          return null;
        })
        .filter((year: string | null | undefined): year is string => Boolean(year));
      return { success: true, data: [...new Set(years)].sort() };
    }
    return { success: true, data: [] };
  },

  async saveSchoolSchedule(payload: SchoolSchedule): Promise<{ success: boolean; message: string }> {
    const headers = getAuthHeaders();
    console.log('RoutineService - Payload:', payload);
    console.log('RoutineService - Headers:', headers);
    
    const response = await fetch(`/api/academic/school-schedule`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log('RoutineService - Response:', result);
    return result;
  },

  // ✅ Fixed - removed BASE_URL, using relative paths
  async fetchRoutine(className: string, academicYear: string): Promise<{ success: boolean; data: ClassRoutine | null; message?: string }> {
    const params = new URLSearchParams({ className, academicYear });
    const response = await fetch(`/Academic/Subjects/api/routine?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async createRoutine(payload: ClassRoutine): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`/Academic/Subjects/api/routine`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return response.json();
  },

  async updateRoutine(id: string, payload: ClassRoutine): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`/Academic/Subjects/api/routine/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return response.json();
  }
};