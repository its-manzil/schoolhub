'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import './teachers.css'
import { useRouter } from 'next/navigation'
import SchoolAdminNavbar from '../Components/SchoolAdminNavbar'

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
        <div className="teachers-header">
          <h1>Teachers Management</h1>
          <button className="add-teacher-btn" onClick={handleAddTeacher}>
            + Add New Teacher To School
          </button>
        </div>

        {loading && <div className="loading">Loading teachers...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && teachers.length === 0 && (
          <div className="no-teachers">
            <p>No teachers found. Add your first teacher!</p>
          </div>
        )}

        <div className="teachers-grid">
          {teachers.map((teacher) => (
            <div key={teacher._id} className="teacher-card">
              <div className="card-header">
                <div className="teacher-photo-container">
                  <Image 
                    src={teacher.profilePicture || getDefaultProfilePic(teacher.name)} 
                    alt={teacher.name}
                    width={80}
                    height={80}
                    className="teacher-photo"
                  />
                </div>
                <div className="teacher-info">
                  <div className="teacher-name">
                    <strong>Name:</strong> {teacher.name}
                  </div>
                  <div className="teacher-phone">
                    <strong>Contact No:</strong> {teacher.phone}
                  </div>
                </div>
              </div>
              <button 
                className="details-btn"
                onClick={() => handleDetailsClick(teacher)}
              >
                Details
              </button>
            </div>
          ))}
        </div>

        {/* Teacher Details Modal */}
        {selectedTeacher && (
          <div className="modal-overlay" onClick={handleCloseDetails}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={handleCloseDetails}>×</button>
              <h2>Teacher Details</h2>
              <div className="teacher-details">
                <div className="details-left">
                  <div className="details-photo-container">
                    <Image 
                      src={selectedTeacher.profilePicture || getDefaultProfilePic(selectedTeacher.name)} 
                      alt={selectedTeacher.name}
                      width={200}
                      height={200}
                      className="details-photo"
                    />
                  </div>
                </div>
                <div className="details-right">
                  <div className="detail-item">
                    <strong>ID:</strong> {selectedTeacher.teacherId}
                  </div>
                  <div className="detail-item">
                    <strong>Teacher Name:</strong> {selectedTeacher.name}
                  </div>
                  <div className="detail-item">
                    <strong>Phone Number:</strong> {selectedTeacher.phone}
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong> {selectedTeacher.email}
                  </div>
                  <div className="detail-item">
                    <strong>Address:</strong> {selectedTeacher.address || 'N/A'}
                  </div>
                  <div className="detail-item">
                    <strong>Teaching Subjects:</strong> {selectedTeacher.subjects?.join(', ') || 'N/A'}
                  </div>
                  <div className="detail-item">
                    <strong>Teaching Class:</strong> {selectedTeacher.teachingClass || 'N/A'}
                  </div>
                  <div className="detail-item">
                    <strong>Salary:</strong> ${selectedTeacher.salary?.toLocaleString() || '0'}
                  </div>
                  <div className="detail-item">
                    <strong>Joining Date:</strong> {selectedTeacher.joiningDate ? new Date(selectedTeacher.joiningDate).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong> {selectedTeacher.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Teacher Form Modal */}
        {showAddForm && (
          <AddTeacherForm 
            onClose={handleCloseAddForm}
            refetchTeachers={fetchTeachers}
            schoolId={schoolId}
          />
        )}
      </div>
    </>
  )
}

// Add Teacher Form Component
interface AddTeacherFormProps {
  onClose: () => void
  refetchTeachers: () => void
  schoolId: number | null
}

function AddTeacherForm({ onClose, refetchTeachers, schoolId }: AddTeacherFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    subjects: '',
    teachingClass: '',
    salary: '',
    joiningDate: new Date().toISOString().split('T')[0],
    password: 'Teacher@123',
    rePassword: 'Teacher@123'
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!schoolId) {
      setError('School information not available. Please try again later.');
    }
  }, [schoolId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit (changed from 100kb)
        setError('File size should be less than 5MB');
        return;
      }
      setProfilePicture(file);
      setError('');
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Calculate new dimensions (max 300px width/height)
          let width = img.width;
          let height = img.height;
          const maxSize = 300;
          
          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!schoolId) {
      setError('School information not available. Please refresh the page and try again.');
      return;
    }
    
    // Validation
    if (formData.password !== formData.rePassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      let compressedImage = null;
      if (profilePicture) {
        try {
          compressedImage = await compressImage(profilePicture);
        } catch (compressError) {
          console.error('Image compression error:', compressError);
          // Continue without image if compression fails
        }
      }

      const teacherData = {
        ...formData,
        schoolId, // Using schoolId from props
        subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s),
        salary: parseFloat(formData.salary) || 0,
        profilePicture: compressedImage
      };

      console.log('Submitting teacher data:', { ...teacherData, password: '***' });

      const response = await fetch('http://localhost:2056/api/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(teacherData)
      });

      const result = await response.json();
      console.log('Add teacher response:', result);

      if (result.success) {
        setSuccess('Teacher added successfully! Credentials sent to the teacher.');
        setFormData({
          name: '',
          phone: '',
          email: '',
          address: '',
          subjects: '',
          teachingClass: '',
          salary: '',
          joiningDate: new Date().toISOString().split('T')[0],
          password: 'Teacher@123',
          rePassword: 'Teacher@123'
        });
        setProfilePicture(null);
        
        // Wait a bit and then refetch teachers
        setTimeout(() => {
          refetchTeachers();
        }, 1500);
        
        // Close form after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(result.message || 'Failed to add teacher');
      }
    } catch (err) {
      console.error('Error adding teacher:', err);
      setError(err instanceof Error ? err.message : 'Failed to add teacher. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-teacher-form" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Add New Teacher</h2>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          {schoolId && (
            <div className="form-info">
              <p><strong>School ID:</strong> {schoolId}</p>
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label>Teacher Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter full name"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Teacher Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="Enter phone number"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Teacher Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter email address"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Salary ($)</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="Enter salary amount"
                min="0"
                step="0.01"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Teacher Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter full address"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Teaching Subjects (comma-separated)</label>
              <input
                type="text"
                name="subjects"
                value={formData.subjects}
                onChange={handleInputChange}
                placeholder="e.g., Mathematics, Physics, Chemistry"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Teaching Class</label>
              <input
                type="text"
                name="teachingClass"
                value={formData.teachingClass}
                onChange={handleInputChange}
                placeholder="e.g., Grade 10-A"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Joining Date</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Upload Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
              />
              <small>Max 5MB, will be compressed automatically</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group password-group">
              <label>Password *</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            
            <div className="form-group password-group">
              <label>Re-enter Password *</label>
              <div className="password-input">
                <input
                  type={showRePassword ? "text" : "password"}
                  name="rePassword"
                  value={formData.rePassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Re-enter password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowRePassword(!showRePassword)}
                  disabled={loading}
                >
                  {showRePassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading || !schoolId}
            >
              {loading ? 'Adding...' : 'Add Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}