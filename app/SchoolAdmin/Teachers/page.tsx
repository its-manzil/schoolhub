'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import './teachers.css'
import { useRouter } from 'next/navigation'
import Layout from '../Components/Layout'

interface Teacher {
  _id: string
  teacherId: string
  name: string
  phone: string
  email: string
  address: string
  subjects: string[]
  teachingClass: string
  salary: number
  joiningDate: string
  profilePicture?: string
  schoolId: number
  isActive: boolean
}

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isSchoolAdmin, setIsSchoolAdmin] = useState(false)
  const [schoolId, setSchoolId] = useState<number | null>(null)
  const router = useRouter()

  // Authentication check
  useEffect(() => {
    setIsClient(true);
    
    const checkAuthentication = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!token || !userData) {
          console.log('No token or user data found, redirecting to login...');
          router.push('/Login');
          return;
        }

        const user = JSON.parse(userData);
        if (user.role !== 'schooladmin') {
          console.log('User is not a school admin, redirecting to login...');
          router.push('/Login');
          return;
        }

        console.log('User authenticated as school admin:', user.email);
        setIsSchoolAdmin(true);
        
        // Get schoolId from user data if available
        if (user.schoolId) {
          setSchoolId(user.schoolId);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/Login');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuthentication();
  }, [router]);

  // Fetch user data to get schoolId if not already available
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isSchoolAdmin || authLoading || schoolId) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const userResponse = await fetch('http://localhost:2056/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        
        if (userData.success && userData.user?.schoolId) {
          setSchoolId(userData.user.schoolId);
          console.log('School ID fetched from user data:', userData.user.schoolId);
        } else {
          throw new Error('School admin not properly assigned to a school');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch school information');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isSchoolAdmin, authLoading, schoolId]);

  // Fetch teachers function
  const fetchTeachers = useCallback(async () => {
    if (!isSchoolAdmin || !schoolId) return;
    
    try {
      console.log('Fetching teachers for school ID:', schoolId);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:2056/api/teachers', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Teachers response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/Login');
          throw new Error('Session expired. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. Only school administrators can view teachers.');
        }
        throw new Error(`Failed to fetch teachers: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Teachers data:', data);
      
      if (data.success) {
        setTeachers(data.data || []);
      } else {
        setError(data.message || 'Failed to load teachers');
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load teachers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isSchoolAdmin, schoolId, router]);

  // Fetch teachers when authenticated and schoolId is available
  useEffect(() => {
    if (isSchoolAdmin && !authLoading && schoolId) {
      fetchTeachers();
    }
  }, [isSchoolAdmin, authLoading, schoolId, fetchTeachers]);

  const handleDetailsClick = async (teacher: Teacher) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:2056/api/teachers/${teacher._id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/Login');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to fetch teacher details');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSelectedTeacher(data.data);
      } else {
        setError(data.message || 'Failed to load teacher details');
      }
    } catch (err) {
      console.error('Error fetching teacher details:', err);
      setError('Failed to load teacher details');
    }
  }

  const handleCloseDetails = () => {
    setSelectedTeacher(null);
  }

  const handleAddTeacher = () => {
    setShowAddForm(true);
  }

  const handleCloseAddForm = () => {
    setShowAddForm(false);
  }

  const getDefaultProfilePic = (name: string = 'Teacher') => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&size=128`;
  }

  // Show loading state during auth check
  if (authLoading || !isClient) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Don't render anything if not authenticated (router will redirect)
  if (!isSchoolAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <Layout>
      <div className="teachers-container">

        <div className="teachers-header">
          <h1>Teachers Management</h1>
          <button className="add-teacher-btn" onClick={handleAddTeacher}>
            + Add New Teacher To School
          </button>
        </div>
        {/* ... existing content ... */}
      </div>
    </Layout>
  );
}
