'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import './students.css'
import { useRouter } from 'next/navigation'
import SchoolAdminNavbar from '../Components/SchoolAdminNavbar'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { QRCodeSVG } from 'qrcode.react'
import { 
  FaSchool, 
  FaEye, 
  FaEyeSlash,
  FaPrint,
  FaDownload,
  FaEdit,
  FaTrash,
  FaUserCircle,
  FaIdCard,
  FaFilter,
  FaPlus
} from 'react-icons/fa'
import { PiSignature } from 'react-icons/pi'

interface Student {
  _id: string
  studentId: string
  name: string
  gender: 'male' | 'female' | 'other'
  dateOfBirth: string
  phone: string
  email: string
  address: string
  fatherName: string
  motherName: string
  fatherPhone: string
  motherPhone: string
  className: string
  section: string
  rollNumber: number
  bloodGroup?: string
  emergencyContact: string
  profilePicture?: string
  schoolId: number
  admissionDate: string
  admissionYear: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface SchoolInfo {
  _id: string
  schoolId: number
  name: string
  address: string
  contactEmail: string
  contactPhone: string
  principalName: string
  logo?: string
  principalSignature?: string
  establishedYear: number
  subscription: {
    expiryDate: string
  }
}

interface StudentFormData {
  name: string
  gender: 'male' | 'female' | 'other'
  dateOfBirth: string
  phone: string
  email: string
  address: string
  fatherName: string
  motherName: string
  fatherPhone: string
  motherPhone: string
  className: string
  section: string
  rollNumber: string
  bloodGroup: string
  emergencyContact: string
  admissionDate: string
  password: string
  rePassword: string
}

const CLASS_OPTIONS = [
  { value: 'N', label: 'Nursery' },
  { value: 'LKG', label: 'LKG' },
  { value: 'UKG', label: 'UKG' },
  { value: '01', label: 'Class 1' },
  { value: '02', label: 'Class 2' },
  { value: '03', label: 'Class 3' },
  { value: '04', label: 'Class 4' },
  { value: '05', label: 'Class 5' },
  { value: '06', label: 'Class 6' },
  { value: '07', label: 'Class 7' },
  { value: '08', label: 'Class 8' },
  { value: '09', label: 'Class 9' },
  { value: '10', label: 'Class 10' },
  { value: '11', label: 'Class 11' },
  { value: '12', label: 'Class 12' }
]

const SECTION_OPTIONS = ['A', 'B', 'C', 'D', 'E']
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

export default function Students() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showIdCard, setShowIdCard] = useState(false)
  const [showBulkIdCards, setShowBulkIdCards] = useState(false)
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [isClient, setIsClient] = useState(false)
  const [isSchoolAdmin, setIsSchoolAdmin] = useState(false)
  const [schoolId, setSchoolId] = useState<number | null>(null)
  const [idCardStudent, setIdCardStudent] = useState<Student | null>(null)
  const [editStudentData, setEditStudentData] = useState<StudentFormData | null>(null)
  const [editStudentId, setEditStudentId] = useState<string | null>(null)
  const router = useRouter()
  const idCardRef = useRef<HTMLDivElement>(null)
  const bulkIdCardsRef = useRef<HTMLDivElement>(null)

  // Authentication check
  useEffect(() => {
    setIsClient(true);
    
    const checkAuthentication = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!token || !userData) {
          router.push('/Login');
          return;
        }

        const user = JSON.parse(userData);
        if (user.role !== 'schooladmin') {
          router.push('/Login');
          return;
        }

        setIsSchoolAdmin(true);
        
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

  // Fetch school info
  useEffect(() => {
    const fetchSchoolInfo = async () => {
      if (!schoolId) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`http://localhost:2056/api/schools/school/${schoolId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSchoolInfo(data.data);
          }
        }
      } catch (err) {
        console.error('Error fetching school info:', err);
      }
    };

    fetchSchoolInfo();
  }, [schoolId]);

  // Fetch students function
  const fetchStudents = useCallback(async () => {
    if (!isSchoolAdmin || !schoolId) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:2056/api/students', {
        headers: {
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
        throw new Error(`Failed to fetch students: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const sortedStudents = data.data.sort((a: Student, b: Student) => 
          a.name.localeCompare(b.name)
        );
        setStudents(sortedStudents);
        setFilteredStudents(sortedStudents);
      } else {
        setError(data.message || 'Failed to load students');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err instanceof Error ? err.message : 'Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isSchoolAdmin, schoolId, router]);

  // Fetch students when authenticated and schoolId is available
  useEffect(() => {
    if (isSchoolAdmin && !authLoading && schoolId) {
      fetchStudents();
    }
  }, [isSchoolAdmin, authLoading, schoolId, fetchStudents]);

  // Filter students by class
  useEffect(() => {
    if (selectedClass === 'all') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => student.className === selectedClass);
      setFilteredStudents(filtered);
    }
  }, [selectedClass, students]);

  const handleDetailsClick = async (student: Student) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:2056/api/students/${student._id}`, {
        headers: {
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
        throw new Error('Failed to fetch student details');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSelectedStudent(data.data);
      } else {
        setError(data.message || 'Failed to load student details');
      }
    } catch (err) {
      console.error('Error fetching student details:', err);
      setError('Failed to load student details');
    }
  }

  const handleCloseDetails = () => {
    setSelectedStudent(null);
  }

  const handleAddStudent = () => {
    setShowAddForm(true);
  }

  const handleCloseAddForm = () => {
    setShowAddForm(false);
  }

  const handleEditStudent = (student: Student) => {
    setEditStudentData({
      name: student.name,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth.split('T')[0],
      phone: student.phone,
      email: student.email || '',
      address: student.address,
      fatherName: student.fatherName,
      motherName: student.motherName,
      fatherPhone: student.fatherPhone,
      motherPhone: student.motherPhone || '',
      className: student.className,
      section: student.section,
      rollNumber: student.rollNumber.toString(),
      bloodGroup: student.bloodGroup || '',
      emergencyContact: student.emergencyContact,
      admissionDate: student.admissionDate.split('T')[0],
      password: '',
      rePassword: ''
    });
    setEditStudentId(student._id);
    setShowEditForm(true);
  }

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setEditStudentData(null);
    setEditStudentId(null);
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:2056/api/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete student');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Student deleted successfully');
        fetchStudents();
      } else {
        setError(data.message || 'Failed to delete student');
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      setError('Failed to delete student');
    }
  }

  const handleShowIdCard = (student: Student) => {
    setIdCardStudent(student);
    setShowIdCard(true);
  }

  const handleCloseIdCard = () => {
    setShowIdCard(false);
    setIdCardStudent(null);
  }

  const handleShowBulkIdCards = () => {
    setShowBulkIdCards(true);
  }

  const handleCloseBulkIdCards = () => {
    setShowBulkIdCards(false);
  }

  const handleDownloadIdCard = async () => {
    if (!idCardRef.current) return;
    
    try {
      const canvas = await html2canvas(idCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [86, 54]
      } as any);
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ID_Card_${idCardStudent?.studentId}.pdf`);
    } catch (err) {
      console.error('Error generating ID card:', err);
      setError('Failed to download ID card');
    }
  }

  const handlePrintIdCard = () => {
    const printContent = document.getElementById('id-card-print');
    if (!printContent) return;
    
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  }

  const handlePrintAllIdCards = async () => {
    if (!bulkIdCardsRef.current) return;
    
    try {
      const canvas = await html2canvas(bulkIdCardsRef.current, {
        scale: 1,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm'
      } as any);
      
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('All_Student_ID_Cards.pdf');
    } catch (err) {
      console.error('Error generating bulk ID cards:', err);
      setError('Failed to download all ID cards');
    }
  }

  const getDefaultProfilePic = (name: string = 'Student', gender: string = 'male') => {
    const bgColor = gender === 'female' ? 'ec4899' : '4f46e5';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=fff&size=128`;
  }

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  const getClassName = (classCode: string) => {
    const classOption = CLASS_OPTIONS.find(c => c.value === classCode);
    return classOption ? classOption.label : classCode;
  }

  const calculateValidUntil = () => {
    if (!schoolInfo?.subscription?.expiryDate) {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      return nextYear.toLocaleDateString();
    }
    
    return new Date(schoolInfo.subscription.expiryDate).toLocaleDateString();
  }

  // Show loading state during auth check
  if (authLoading || !isClient) {
    return (
      <div className="students-loading-container">
        <div className="students-loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isSchoolAdmin) {
    return null;
  }

  return (
    <>
      <SchoolAdminNavbar/>
      <div className="students-container">
        <div className="students-header">
          <h1>Students Management</h1>
          <div className="students-header-controls">
            <div className="students-class-filter">
              <FaFilter />
              <label>Filter by Class:</label>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="students-class-select"
              >
                <option value="all">All Classes</option>
                {CLASS_OPTIONS.map(cls => (
                  <option key={cls.value} value={cls.value}>
                    {cls.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="students-action-buttons">
              <button className="students-bulk-print-btn" onClick={handleShowBulkIdCards}>
                <FaPrint /> Print All ID Cards
              </button>
              <button className="students-add-btn" onClick={handleAddStudent}>
                <FaPlus /> Add New Student
              </button>
            </div>
          </div>
        </div>

        {error && <div className="students-error-message">{error}</div>}
        {success && <div className="students-success-message">{success}</div>}

        {loading && <div className="students-loading">Loading students...</div>}

        {!loading && !error && filteredStudents.length === 0 && (
          <div className="students-no-students">
            <FaUserCircle size={48} />
            <p>No students found. {selectedClass !== 'all' ? `No students in ${getClassName(selectedClass)}` : 'Add your first student!'}</p>
          </div>
        )}

        <div className="students-grid">
          {filteredStudents.map((student, index) => (
            <div key={student._id} className="students-card">
              <div className="students-card-header">
                <div className="students-photo-container">
                  <Image 
                    src={student.profilePicture || getDefaultProfilePic(student.name, student.gender)} 
                    alt={student.name}
                    width={80}
                    height={80}
                    className="students-photo"
                  />
                </div>
                <div className="students-card-info">
                  <div className="students-name">
                    <strong>{student.name}</strong>
                  </div>
                  <div className="students-class">
                    {getClassName(student.className)} - {student.section}
                  </div>
                  <div className="students-id">
                    ID: {student.studentId}
                  </div>
                </div>
              </div>
              <div className="students-card-actions">
                <button 
                  className="students-details-btn"
                  onClick={() => handleDetailsClick(student)}
                >
                  Details
                </button>
                <button 
                  className="students-idcard-btn"
                  onClick={() => handleShowIdCard(student)}
                >
                  <FaIdCard /> ID Card
                </button>
                <div className="students-edit-delete-buttons">
                  <button 
                    className="students-edit-btn"
                    onClick={() => handleEditStudent(student)}
                    title="Edit Student"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="students-delete-btn"
                    onClick={() => handleDeleteStudent(student._id)}
                    title="Delete Student"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Student Details Modal */}
        {selectedStudent && (
          <div className="students-modal-overlay" onClick={handleCloseDetails}>
            <div className="students-modal-content students-details-modal" onClick={(e) => e.stopPropagation()}>
              <button className="students-close-btn" onClick={handleCloseDetails}>×</button>
              <h2>Student Details</h2>
              <div className="students-details-content">
                <div className="students-details-left">
                  <div className="students-details-photo-container">
                    <Image 
                      src={selectedStudent.profilePicture || getDefaultProfilePic(selectedStudent.name, selectedStudent.gender)} 
                      alt={selectedStudent.name}
                      width={200}
                      height={200}
                      className="students-details-photo"
                    />
                  </div>
                  <div className="students-id-card-info">
                    <div className="students-id-number">
                      <strong>Student ID:</strong> {selectedStudent.studentId}
                    </div>
                    <button 
                      className="students-view-idcard-btn"
                      onClick={() => {
                        handleCloseDetails();
                        handleShowIdCard(selectedStudent);
                      }}
                    >
                      <FaIdCard /> View ID Card
                    </button>
                  </div>
                </div>
                <div className="students-details-right">
                  <div className="students-details-grid">
                    <div className="students-detail-item">
                      <strong>Name:</strong> {selectedStudent.name}
                    </div>
                    <div className="students-detail-item">
                      <strong>Gender:</strong> {selectedStudent.gender.charAt(0).toUpperCase() + selectedStudent.gender.slice(1)}
                    </div>
                    <div className="students-detail-item">
                      <strong>Date of Birth:</strong> {new Date(selectedStudent.dateOfBirth).toLocaleDateString()}
                    </div>
                    <div className="students-detail-item">
                      <strong>Age:</strong> {calculateAge(selectedStudent.dateOfBirth)} years
                    </div>
                    <div className="students-detail-item">
                      <strong>Phone:</strong> {selectedStudent.phone}
                    </div>
                    <div className="students-detail-item">
                      <strong>Email:</strong> {selectedStudent.email || 'N/A'}
                    </div>
                    <div className="students-detail-item">
                      <strong>Address:</strong> {selectedStudent.address}
                    </div>
                    <div className="students-detail-item">
                      <strong>Class:</strong> {getClassName(selectedStudent.className)} - {selectedStudent.section}
                    </div>
                    <div className="students-detail-item">
                      <strong>Roll Number:</strong> {selectedStudent.rollNumber}
                    </div>
                    <div className="students-detail-item">
                      <strong>Blood Group:</strong> {selectedStudent.bloodGroup || 'N/A'}
                    </div>
                    <div className="students-detail-item">
                      <strong>Father&apos;s Name:</strong> {selectedStudent.fatherName}
                    </div>
                    <div className="students-detail-item">
                      <strong>Father&apos;s Phone:</strong> {selectedStudent.fatherPhone}
                    </div>
                    <div className="students-detail-item">
                      <strong>Mother&apos;s Name:</strong> {selectedStudent.motherName}
                    </div>
                    <div className="students-detail-item">
                      <strong>Mother&apos;s Phone:</strong> {selectedStudent.motherPhone}
                    </div>
                    <div className="students-detail-item">
                      <strong>Emergency Contact:</strong> {selectedStudent.emergencyContact}
                    </div>
                    <div className="students-detail-item">
                      <strong>Admission Date:</strong> {new Date(selectedStudent.admissionDate).toLocaleDateString()}
                    </div>
                    <div className="students-detail-item">
                      <strong>Status:</strong> 
                      <span className={`students-status-badge ${selectedStudent.isActive ? 'active' : 'inactive'}`}>
                        {selectedStudent.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Student Form Modal */}
        {showAddForm && schoolId && (
          <AddStudentForm 
            onClose={handleCloseAddForm}
            refetchStudents={fetchStudents}
            schoolId={schoolId}
            setSuccess={setSuccess}
            setError={setError}
          />
        )}

        {/* Edit Student Form Modal */}
        {showEditForm && editStudentData && editStudentId && (
          <EditStudentForm 
            onClose={handleCloseEditForm}
            refetchStudents={fetchStudents}
            studentId={editStudentId}
            initialData={editStudentData}
            setSuccess={setSuccess}
            setError={setError}
          />
        )}

        {/* Single ID Card Modal */}
        {showIdCard && idCardStudent && (
          <div className="students-modal-overlay students-idcard-overlay" onClick={handleCloseIdCard}>
            <div className="students-modal-content students-idcard-modal" onClick={(e) => e.stopPropagation()}>
              <button className="students-close-btn" onClick={handleCloseIdCard}>×</button>
              <h2>Student ID Card</h2>
              <div className="students-idcard-container">
                <div className="students-idcard-actions-top">
                  <button className="students-print-btn" onClick={handlePrintIdCard}>
                    <FaPrint /> Print ID Card
                  </button>
                  <button className="students-download-btn" onClick={handleDownloadIdCard}>
                    <FaDownload /> Download PDF
                  </button>
                </div>
                
                <div className="students-idcard-wrapper">
                  {/* Printable ID Card */}
                  <div id="id-card-print" style={{ display: 'none' }}>
                    <StudentIDCard 
                      student={idCardStudent}
                      schoolInfo={schoolInfo}
                      getDefaultProfilePic={getDefaultProfilePic}
                      getClassName={getClassName}
                      calculateValidUntil={calculateValidUntil}
                    />
                  </div>
                  
                  {/* Preview ID Card */}
                  <div className="students-idcard-preview" ref={idCardRef}>
                    <StudentIDCard 
                      student={idCardStudent}
                      schoolInfo={schoolInfo}
                      getDefaultProfilePic={getDefaultProfilePic}
                      getClassName={getClassName}
                      calculateValidUntil={calculateValidUntil}
                    />
                  </div>
                </div>
                
                <div className="students-idcard-instructions">
                  <h4>Instructions:</h4>
                  <ul>
                    <li>Click &quot;Print ID Card&quot; to print directly</li>
                    <li>Click &quot;Download PDF&quot; to save as PDF file</li>
                    <li>Ensure ID card is printed on quality card stock</li>
                    <li>Recommended print size: 86mm × 54mm (standard ID card)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk ID Cards Modal */}
        {showBulkIdCards && (
          <div className="students-modal-overlay students-bulk-idcard-overlay" onClick={handleCloseBulkIdCards}>
            <div className="students-modal-content students-bulk-idcard-modal" onClick={(e) => e.stopPropagation()}>
              <button className="students-close-btn" onClick={handleCloseBulkIdCards}>×</button>
              <h2>Print All Student ID Cards</h2>
              <div className="students-bulk-idcard-container">
                <div className="students-bulk-actions">
                  <button className="students-bulk-print-all-btn" onClick={handlePrintAllIdCards}>
                    <FaPrint /> Print All ID Cards
                  </button>
                  <div className="students-bulk-stats">
                    <p>Total Students: {filteredStudents.length}</p>
                    <p>Selected Class: {selectedClass === 'all' ? 'All Classes' : getClassName(selectedClass)}</p>
                  </div>
                </div>
                
                <div className="students-bulk-idcards-wrapper" ref={bulkIdCardsRef}>
                  {filteredStudents.map((student, index) => (
                    <div key={student._id} className="students-bulk-idcard-item">
                      <StudentIDCard 
                        student={student}
                        schoolInfo={schoolInfo}
                        getDefaultProfilePic={getDefaultProfilePic}
                        getClassName={getClassName}
                        calculateValidUntil={calculateValidUntil}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="students-bulk-instructions">
                  <h4>Bulk Printing Instructions:</h4>
                  <ul>
                    <li>Click &quot;Print All ID Cards&quot; to generate PDF with all ID cards</li>
                    <li>Each ID card will be on a separate page</li>
                    <li>Use card stock paper for best results</li>
                    <li>Print multiple copies if needed for different purposes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// Student ID Card Component
interface StudentIDCardProps {
  student: Student
  schoolInfo: SchoolInfo | null
  getDefaultProfilePic: (name: string, gender: string) => string
  getClassName: (classCode: string) => string
  calculateValidUntil: () => string
}

function StudentIDCard({ student, schoolInfo, getDefaultProfilePic, getClassName, calculateValidUntil }: StudentIDCardProps) {
  return (
    <div className="students-idcard-design">
      {/* Card Header */}
      <div className="students-idcard-header">
        <div className="students-idcard-school-info">
          <div className="students-idcard-logo">
            {schoolInfo?.logo ? (
              <Image 
                src={schoolInfo.logo} 
                alt="School Logo" 
                width={60}
                height={60}
                className="students-idcard-logo-img"
              />
            ) : (
              <div className="students-idcard-logo-placeholder">
                <FaSchool size={40} />
              </div>
            )}
          </div>
          <div className="students-idcard-school-details">
            <h3>{schoolInfo?.name || 'School Name'}</h3>
            <p>Official Student Identity Card</p>
          </div>
        </div>
        <div className="students-idcard-type">
          <span>STUDENT CARD</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="students-idcard-body">
        {/* Student Photo */}
        <div className="students-idcard-photo-section">
          <div className="students-idcard-photo-frame">
            <Image 
              src={student.profilePicture || getDefaultProfilePic(student.name, student.gender)} 
              alt={student.name}
              width={120}
              height={150}
              className="students-idcard-photo"
            />
            <div className="students-idcard-photo-label">PHOTO</div>
          </div>
          <div className="students-idcard-student-id">
            <strong>ID:</strong> {student.studentId}
          </div>
        </div>

        {/* Student Details */}
        <div className="students-idcard-details-section">
          <div className="students-idcard-name-bar">
            <h4>{student.name}</h4>
          </div>
          
          <div className="students-idcard-details-grid">
            <div className="students-idcard-detail-row">
              <span className="students-idcard-label">Roll No:</span>
              <span className="students-idcard-value">{student.rollNumber}</span>
            </div>
            <div className="students-idcard-detail-row">
              <span className="students-idcard-label">Class:</span>
              <span className="students-idcard-value">{getClassName(student.className)} - {student.section}</span>
            </div>
            <div className="students-idcard-detail-row">
              <span className="students-idcard-label">Gender:</span>
              <span className="students-idcard-value">{student.gender.charAt(0).toUpperCase() + student.gender.slice(1)}</span>
            </div>
            <div className="students-idcard-detail-row">
              <span className="students-idcard-label">Date of Birth:</span>
              <span className="students-idcard-value">{new Date(student.dateOfBirth).toLocaleDateString()}</span>
            </div>
            <div className="students-idcard-detail-row">
              <span className="students-idcard-label">Blood Group:</span>
              <span className="students-idcard-value">{student.bloodGroup || 'N/A'}</span>
            </div>
            <div className="students-idcard-detail-row">
              <span className="students-idcard-label">Valid Until:</span>
              <span className="students-idcard-value">{calculateValidUntil()}</span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="students-idcard-qr-section">
          <div className="students-idcard-qr-container">
            <QRCodeSVG 
              value={student.studentId}
              size={80}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#8b0000"
            />
            <div className="students-idcard-qr-label">
              SCAN TO VERIFY
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="students-idcard-footer">
        <div className="students-idcard-signatures">
          <div className="students-idcard-student-signature">
            <div className="students-idcard-signature-line"></div>
            <p>Student Signature</p>
          </div>
          <div className="students-idcard-principal-signature">
            {schoolInfo?.principalSignature ? (
              <Image 
                src={schoolInfo.principalSignature} 
                alt="Principal Signature" 
                width={80}
                height={40}
                className="students-idcard-principal-signature-img"
              />
            ) : (
              <div className="students-idcard-signature-placeholder">
                <PiSignature size={30} />
              </div>
            )}
            <p>{schoolInfo?.principalName || 'Principal'}</p>
            <p>School Principal</p>
          </div>
        </div>
        
        <div className="students-idcard-security-notice">
          <p>This card is property of {schoolInfo?.name || 'School'}. If found, please return to school office.</p>
        </div>
      </div>
    </div>
  )
}

// Add Student Form Component
interface AddStudentFormProps {
  onClose: () => void
  refetchStudents: () => void
  schoolId: number
  setSuccess: (message: string) => void
  setError: (message: string) => void
}

function AddStudentForm({ onClose, refetchStudents, schoolId, setSuccess, setError }: AddStudentFormProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    gender: 'male',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
    fatherName: '',
    motherName: '',
    fatherPhone: '',
    motherPhone: '',
    className: '01',
    section: 'A',
    rollNumber: '',
    bloodGroup: '',
    emergencyContact: '',
    admissionDate: new Date().toISOString().split('T')[0],
    password: 'Student@123',
    rePassword: 'Student@123'
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const compressImageTo100KB = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        // Use document.createElement instead of new Image()
        const img = document.createElement('img');
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Start with original dimensions
          let width = img.width;
          let height = img.height;
          
          // Calculate target dimensions (max 300px)
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
          
          // Draw image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress with decreasing quality until under 100KB
          const compressWithQuality = (quality: number): string => {
            return canvas.toDataURL('image/jpeg', quality);
          };
          
          let compressedDataUrl = compressWithQuality(0.8); // Start with 80% quality
          let size = Math.round((compressedDataUrl.length - 822) * 3 / 4); // Approx size in bytes
          
          // If still too large, reduce quality further
          let quality = 0.8;
          while (size > 100 * 1024 && quality > 0.1) {
            quality -= 0.1;
            compressedDataUrl = compressWithQuality(quality);
            size = Math.round((compressedDataUrl.length - 822) * 3 / 4);
          }
          
          // If still too large, reduce dimensions
          if (size > 100 * 1024) {
            width = Math.round(width * 0.8);
            height = Math.round(height * 0.8);
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            compressedDataUrl = compressWithQuality(0.7);
          }
          
          console.log('Compressed image size:', Math.round(size/1024), 'KB');
          resolve(compressedDataUrl);
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 500 * 1024) { // Warn if > 500KB
        if (!confirm('Image is large (>500KB). It will be compressed to under 100KB. Continue?')) {
          return;
        }
      }
      setProfilePicture(file);
      setFormError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    // Validation
    if (formData.password !== formData.rePassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    if (!formData.dateOfBirth) {
      setFormError('Date of Birth is required');
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
          compressedImage = await compressImageTo100KB(profilePicture);
        } catch (compressError) {
          console.error('Image compression error:', compressError);
          setFormError('Failed to compress image. Please try with a smaller image.');
          setLoading(false);
          return;
        }
      }

      const studentData = {
        ...formData,
        schoolId,
        rollNumber: parseInt(formData.rollNumber) || 1,
        profilePicture: compressedImage
      };

      const response = await fetch('http://localhost:2056/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(studentData)
      });

      const result = await response.json();

      if (result.success) {
        setFormSuccess('Student added successfully!');
        setSuccess('Student added successfully!');
        
        // Reset form
        setFormData({
          name: '',
          gender: 'male',
          dateOfBirth: '',
          phone: '',
          email: '',
          address: '',
          fatherName: '',
          motherName: '',
          fatherPhone: '',
          motherPhone: '',
          className: '01',
          section: 'A',
          rollNumber: '',
          bloodGroup: '',
          emergencyContact: '',
          admissionDate: new Date().toISOString().split('T')[0],
          password: 'Student@123',
          rePassword: 'Student@123'
        });
        setProfilePicture(null);
        
        setTimeout(() => {
          refetchStudents();
        }, 1500);
        
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setFormError(result.message || 'Failed to add student');
        setError(result.message || 'Failed to add student');
      }
    } catch (err) {
      console.error('Error adding student:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add student. Please try again.';
      setFormError(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="students-modal-overlay" onClick={onClose}>
      <div className="students-modal-content students-add-form" onClick={(e) => e.stopPropagation()}>
        <button className="students-close-btn" onClick={onClose}>×</button>
        <h2>Add New Student</h2>
        
        {formError && <div className="students-form-error">{formError}</div>}
        {formSuccess && <div className="students-form-success">{formSuccess}</div>}
        
        <form onSubmit={handleSubmit}>
          {schoolId && (
            <div className="students-form-info">
              <p><strong>School ID:</strong> {schoolId}</p>
            </div>
          )}
          
          <div className="students-form-section">
            <h3>Personal Information</h3>
            <div className="students-form-row">
              <div className="students-form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter student&apos;s full name"
                  disabled={loading}
                />
              </div>
              
              <div className="students-form-group">
                <label>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="students-form-row">
              <div className="students-form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="students-form-group">
                <label>Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="students-form-row">
              <div className="students-form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Student&apos;s phone number"
                  disabled={loading}
                />
              </div>
              
              <div className="students-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Student&apos;s email address"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="students-form-group">
              <label>Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="Enter complete address"
                rows={3}
                disabled={loading}
              />
            </div>
          </div>

          <div className="students-form-section">
            <h3>Parent Information</h3>
            <div className="students-form-row">
              <div className="students-form-group">
                <label>Father&apos;s Name *</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter father&apos;s name"
                  disabled={loading}
                />
              </div>
              
              <div className="students-form-group">
                <label>Father&apos;s Phone *</label>
                <input
                  type="tel"
                  name="fatherPhone"
                  value={formData.fatherPhone}
                  onChange={handleInputChange}
                  required
                  placeholder="Father&apos;s phone number"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="students-form-row">
              <div className="students-form-group">
                <label>Mother&apos;s Name *</label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter mother&apos;s name"
                  disabled={loading}
                />
              </div>
              
              <div className="students-form-group">
                <label>Mother&apos;s Phone</label>
                <input
                  type="tel"
                  name="motherPhone"
                  value={formData.motherPhone}
                  onChange={handleInputChange}
                  placeholder="Mother&apos;s phone number"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="students-form-group">
              <label>Emergency Contact *</label>
              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                required
                placeholder="Emergency contact number"
                disabled={loading}
              />
            </div>
          </div>

          <div className="students-form-section">
            <h3>Academic Information</h3>
            <div className="students-form-row">
              <div className="students-form-group">
                <label>Class *</label>
                <select
                  name="className"
                  value={formData.className}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  {CLASS_OPTIONS.map(cls => (
                    <option key={cls.value} value={cls.value}>
                      {cls.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="students-form-group">
                <label>Section *</label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  {SECTION_OPTIONS.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="students-form-row">
              <div className="students-form-group">
                <label>Roll Number *</label>
                <input
                  type="number"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  required
                  min="1"
                  placeholder="Enter roll number"
                  disabled={loading}
                />
              </div>
              
              <div className="students-form-group">
                <label>Admission Date</label>
                <input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="students-form-section">
            <h3>Profile & Login</h3>
            <div className="students-form-group">
              <label>Upload Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
              />
              <small>Image will be compressed to under 100KB automatically</small>
            </div>

            <div className="students-form-row">
              <div className="students-form-group students-password-group">
                <label>Password *</label>
                <div className="students-password-input">
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
                    className="students-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              
              <div className="students-form-group students-password-group">
                <label>Re-enter Password *</label>
                <div className="students-password-input">
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
                    className="students-eye-btn"
                    onClick={() => setShowRePassword(!showRePassword)}
                    disabled={loading}
                  >
                    {showRePassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="students-form-actions">
            <button 
              type="button" 
              className="students-cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="students-submit-btn"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Student Form Component
interface EditStudentFormProps {
  onClose: () => void
  refetchStudents: () => void
  studentId: string
  initialData: StudentFormData
  setSuccess: (message: string) => void
  setError: (message: string) => void
}

function EditStudentForm({ onClose, refetchStudents, studentId, initialData, setSuccess, setError }: EditStudentFormProps) {
  const [formData, setFormData] = useState<StudentFormData>(initialData);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const compressImageTo100KB = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        // Use document.createElement instead of new Image()
        const img = document.createElement('img');
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
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
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressWithQuality = (quality: number): string => {
            return canvas.toDataURL('image/jpeg', quality);
          };
          
          let compressedDataUrl = compressWithQuality(0.8);
          let size = Math.round((compressedDataUrl.length - 822) * 3 / 4);
          
          let quality = 0.8;
          while (size > 100 * 1024 && quality > 0.1) {
            quality -= 0.1;
            compressedDataUrl = compressWithQuality(quality);
            size = Math.round((compressedDataUrl.length - 822) * 3 / 4);
          }
          
          resolve(compressedDataUrl);
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 500 * 1024) {
        if (!confirm('Image is large (>500KB). It will be compressed to under 100KB. Continue?')) {
          return;
        }
      }
      setProfilePicture(file);
      setFormError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    if (!formData.dateOfBirth) {
      setFormError('Date of Birth is required');
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
          compressedImage = await compressImageTo100KB(profilePicture);
        } catch (compressError) {
          console.error('Image compression error:', compressError);
          setFormError('Failed to compress image. Please try with a smaller image.');
          setLoading(false);
          return;
        }
      }

      const updateData: { [key: string]: any } = {
        ...formData,
        rollNumber: parseInt(formData.rollNumber) || 1
      };

      if (compressedImage) {
        updateData.profilePicture = compressedImage;
      }

      // Remove password fields if empty (don't update password)
      if (!formData.password) {
        delete updateData.password;
        delete updateData.rePassword;
      }

      const response = await fetch(`http://localhost:2056/api/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (result.success) {
        setFormSuccess('Student updated successfully!');
        setSuccess('Student updated successfully!');
        
        setTimeout(() => {
          refetchStudents();
        }, 1500);
        
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setFormError(result.message || 'Failed to update student');
        setError(result.message || 'Failed to update student');
      }
    } catch (err) {
      console.error('Error updating student:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update student. Please try again.';
      setFormError(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="students-modal-overlay" onClick={onClose}>
      <div className="students-modal-content students-edit-form" onClick={(e) => e.stopPropagation()}>
        <button className="students-close-btn" onClick={onClose}>×</button>
        <h2>Edit Student</h2>
        
        {formError && <div className="students-form-error">{formError}</div>}
        {formSuccess && <div className="students-form-success">{formSuccess}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="students-form-section">
            <h3>Personal Information</h3>
            <div className="students-form-row">
              <div className="students-form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="students-form-group">
                <label>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="students-form-row">
              <div className="students-form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="students-form-group">
                <label>Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="students-form-row">
              <div className="students-form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="students-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="students-form-group">
              <label>Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
                disabled={loading}
              />
            </div>
          </div>

          <div className="students-form-section">
            <h3>Parent Information</h3>
            <div className="students-form-row">
              <div className="students-form-group">
                <label>Father&apos;s Name *</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="students-form-group">
                <label>Father&apos;s Phone *</label>
                <input
                  type="tel"
                  name="fatherPhone"
                  value={formData.fatherPhone}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="students-form-row">
              <div className="students-form-group">
                <label>Mother&apos;s Name *</label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="students-form-group">
                <label>Mother&apos;s Phone</label>
                <input
                  type="tel"
                  name="motherPhone"
                  value={formData.motherPhone}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="students-form-group">
              <label>Emergency Contact *</label>
              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="students-form-section">
            <h3>Academic Information</h3>
            <div className="students-form-row">
              <div className="students-form-group">
                <label>Class *</label>
                <select
                  name="className"
                  value={formData.className}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  {CLASS_OPTIONS.map(cls => (
                    <option key={cls.value} value={cls.value}>
                      {cls.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="students-form-group">
                <label>Section *</label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  {SECTION_OPTIONS.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="students-form-row">
              <div className="students-form-group">
                <label>Roll Number *</label>
                <input
                  type="number"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  required
                  min="1"
                  disabled={loading}
                />
              </div>
              
              <div className="students-form-group">
                <label>Admission Date</label>
                <input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="students-form-section">
            <h3>Update Profile Picture</h3>
            <div className="students-form-group">
              <label>Upload New Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
              />
              <small>Image will be compressed to under 100KB automatically</small>
            </div>
          </div>

          <div className="students-form-actions">
            <button 
              type="button" 
              className="students-cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="students-submit-btn"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}