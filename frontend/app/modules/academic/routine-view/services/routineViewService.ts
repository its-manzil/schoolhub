import { RoutineData, RoutinePeriod } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056';

export const routineViewService = {
  async fetchRoutine(
    className: string,
    academicYear: string
  ): Promise<{ success: boolean; data: RoutineData | null; message?: string }> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, data: null, message: 'Not authenticated' };
      }

      const params = new URLSearchParams();
      params.set('className', className);
      if (academicYear?.trim()) {
        params.set('academicYear', academicYear.trim());
      }

      console.log('[RoutineView] Fetching routine:', { className, academicYear, url: `/Academic/Subjects/api/routine?${params.toString()}` });

      // Use the same API as Subjects page
      // Fetch from Next.js API route (class_routines collection)
      const response = await fetch(
        `/Academic/Subjects/api/routine?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      console.log('[RoutineView] API response:', data);

      if (!response.ok || !data.success) {
        return {
          success: false,
          data: null,
          message: data.message || 'Failed to fetch routine'
        };
      }

      if (!data.data) {
        console.log('[RoutineView] No routine data found');
        return {
          success: true,
          data: { periods: [] },
          message: 'No routine data available'
        };
      }

      // Transform class_routines format to RoutineData format
      const rawData = data.data;
      const periods = rawData.periods || [];

      console.log('[RoutineView] Raw data:', { periods, breaks: rawData.breaks, holidays: rawData.holidays });

      // Convert from Subjects format to RoutineView format
      const transformedPeriods: RoutinePeriod[] = [];
      
      // First, add breaks from school_schedules if available
      if (rawData.breaks && Array.isArray(rawData.breaks)) {
        for (const breakItem of rawData.breaks) {
          const startTime = breakItem.start || '';
          const endTime = breakItem.end || '';
          const breakName = breakItem.name || 'Break';
          const isLunch = breakName.toLowerCase().includes('lunch');
          
          // Add break for each day (except holidays) - saturday is not a school day
          const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
          for (const day of days) {
            // Check if this day is a holiday
            const dayKey = day.charAt(0).toUpperCase() + day.slice(1); // "sunday" -> "Sunday"
            const isHoliday = rawData.holidays?.[dayKey] === true;
            
            if (!isHoliday) {
              transformedPeriods.push({
                day,
                startTime,
                endTime,
                type: 'break',
                breakType: isLunch ? 'lunch' : 'short'
              });
            }
          }
        }
      }

      // Then add subject periods from class_routines
      for (const p of periods) {
        const startTime = p.startTime || '';
        const endTime = p.endTime || '';
        
        // Try to get subject assignments from various possible locations
        let assignments: Record<string, string> = {};
        
        if (p.schedule && Object.keys(p.schedule).length > 0) {
          assignments = p.schedule;
        } else if (p.daySpecificAssignments && Object.keys(p.daySpecificAssignments).length > 0) {
          assignments = p.daySpecificAssignments;
        } else if (p.subjects && Array.isArray(p.subjects) && p.subjects.length > 0) {
          const subjectName = p.subjects[0]?.name || p.subjects[0]?.subjectName || 'Unknown';
          assignments = {
            Sunday: subjectName,
            Monday: subjectName,
            Tuesday: subjectName,
            Wednesday: subjectName,
            Thursday: subjectName,
            Friday: subjectName,
            Saturday: subjectName
          };
        }
        
        // Convert each day assignment to a period entry
        for (const [day, subjectName] of Object.entries(assignments)) {
          if (subjectName && subjectName !== 'N/A' && subjectName !== '-') {
            transformedPeriods.push({
              day: day.toLowerCase() as RoutinePeriod['day'],
              startTime,
              endTime,
              type: 'subject',
              subjectName: subjectName as string,
              subjectType: (p.subjectType?.toLowerCase() || 'primary') as 'primary' | 'minor' | 'optional'
            });
          }
        }
      }

      console.log('[RoutineView] Transformed periods:', transformedPeriods);

      return {
        success: true,
        data: {
          academicYearBs: rawData.academicYear,
          effectiveFromBs: rawData.updatedAt,
          periods: transformedPeriods
        }
      };
    } catch (err) {
      console.error('[RoutineView] Error fetching routine:', err);
      return {
        success: false,
        data: null,
        message: 'Failed to fetch routine'
      };
    }
  },

  async fetchTeachers(): Promise<{ success: boolean; data: Array<{ _id: string; name: string; teacherId?: string }>; message?: string }> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, data: [], message: 'Not authenticated' };
      }

      // Fetch from Express backend
      const response = await fetch(`${API_BASE}/api/teachers`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          data: [],
          message: data.message || 'Failed to fetch teachers'
        };
      }

      const list = Array.isArray(data.data) ? data.data : [];
      list.sort((a: { name?: string }, b: { name?: string }) =>
        (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
      );

      return { success: true, data: list };
    } catch {
      return {
        success: false,
        data: [],
        message: 'Failed to fetch teachers'
      };
    }
  }
};
