import React, { useState } from 'react';
import { X } from 'lucide-react';
import { StudentFormData, CLASS_OPTIONS, SECTION_OPTIONS, BLOOD_GROUPS } from '../types';

interface AddStudentFormProps {
  onClose: () => void;
  refetchStudents: () => void;
  schoolId: number;
  setSuccess: (message: string) => void;
}

export default function AddStudentForm({ onClose, refetchStudents, schoolId, setSuccess }: AddStudentFormProps) {
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
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const compressImageTo100KB = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          let quality = 0.9;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);

          // Target ~133KB base64 string length which corresponds to ~100KB binary size
          while (dataUrl.length > 133000 && quality > 0.1) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to process image'));
      };
      reader.onerror = () => reject(new Error('Failed to read image'));
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (formData.password !== formData.rePassword) {
      setFormError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');

      let compressedImage = null;
      if (profilePicture) {
        compressedImage = await compressImageTo100KB(profilePicture);
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
        setSuccess('Student added successfully!');
        refetchStudents();
        onClose();
      } else {
        setFormError(result.message || 'Failed to add student');
      }
    } catch (err) {
      if (err instanceof Error) {
        setFormError(err.message || 'Failed to add student. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stdd-modal-overlay">
      <div className="stdd-modal-card">

        {/* Header */}
        <div className="stdd-modal-header">
          <div>
            <h2 className="stdd-modal-title">Add New Student</h2>
            <p className="stdd-modal-sub">Fill in the primary details to register a new student to the system.</p>
          </div>
          <button onClick={onClose} className="stdd-modal-close">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="stdd-modal-body">
          {formError && (
            <div className="stdd-form-alert stdd-form-error">
              {formError}
            </div>
          )}

          <form id="add-student-form" onSubmit={handleSubmit} className="stdd-form">

            {/* Section 1: Personal Info */}
            <div className="stdd-form-section">
              <h3 className="stdd-form-section-title">Personal Details</h3>
              <div className="stdd-form-grid">
                <div className="stdd-input-group">
                  <label>Full Name <span>*</span></label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} className="stdd-form-control" placeholder="E.g. John Doe" />
                </div>
                <div className="stdd-input-group">
                  <label>Gender <span>*</span></label>
                  <select required name="gender" value={formData.gender} onChange={handleInputChange} className="stdd-form-control">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="stdd-input-group">
                  <label>Date of Birth <span>*</span></label>
                  <input type="text" required name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="stdd-form-control" placeholder="YYYY-MM-DD (B.S.)" />
                </div>
                <div className="stdd-input-group">
                  <label>Student Phone <span>*</span></label>
                  <input type="tel" required name="phone" value={formData.phone} onChange={handleInputChange} className="stdd-form-control" placeholder="Primary contact" />
                </div>
                <div className="stdd-input-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="stdd-form-control" placeholder="Optional email" />
                </div>
                <div className="stdd-input-group">
                  <label>Blood Group</label>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="stdd-form-control">
                    <option value="">Select Group</option>
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="stdd-input-group">
                  <label>Address <span>*</span></label>
                  <input required name="address" value={formData.address} onChange={handleInputChange} className="stdd-form-control" placeholder="Current residential address" />
                </div>
                <div className="stdd-input-group">
                  <label>Profile Picture</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="stdd-form-file" />
                </div>
              </div>
            </div>

            {/* Section 2: Contact Info */}
            <div className="stdd-form-section">
              <h3 className="stdd-form-section-title">Family & Contact</h3>
              <div className="stdd-form-grid">
                <div className="stdd-input-group">
                  <label>Father&apos;s Name <span>*</span></label>
                  <input required name="fatherName" value={formData.fatherName} onChange={handleInputChange} className="stdd-form-control" />
                </div>
                <div className="stdd-input-group">
                  <label>Father&apos;s Phone <span>*</span></label>
                  <input type="tel" required name="fatherPhone" value={formData.fatherPhone} onChange={handleInputChange} className="stdd-form-control" />
                </div>
                <div className="stdd-input-group">
                  <label>Mother&apos;s Name <span>*</span></label>
                  <input required name="motherName" value={formData.motherName} onChange={handleInputChange} className="stdd-form-control" />
                </div>
                <div className="stdd-input-group">
                  <label>Mother&apos;s Phone <span>*</span></label>
                  <input type="tel" required name="motherPhone" value={formData.motherPhone} onChange={handleInputChange} className="stdd-form-control" />
                </div>
                <div className="stdd-input-group">
                  <label>Emergency Contact <span>*</span></label>
                  <input type="tel" required name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} className="stdd-form-control" />
                </div>
              </div>
            </div>

            {/* Section 3: Academic */}
            <div className="stdd-form-section">
              <h3 className="stdd-form-section-title">Academic Enrolment</h3>
              <div className="stdd-form-grid">
                <div className="stdd-input-group">
                  <label>Class <span>*</span></label>
                  <select required name="className" value={formData.className} onChange={handleInputChange} className="stdd-form-control">
                    {CLASS_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="stdd-input-group">
                  <label>Section <span>*</span></label>
                  <select required name="section" value={formData.section} onChange={handleInputChange} className="stdd-form-control">
                    {SECTION_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="stdd-input-group">
                  <label>Roll No <span>*</span></label>
                  <input type="number" required name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} className="stdd-form-control" />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="stdd-modal-footer">
          <button type="button" onClick={onClose} className="stdd-btn stdd-btn-outline">
            Cancel
          </button>
          <button type="submit" form="add-student-form" disabled={loading} className={`stdd-btn stdd-btn-primary ${loading ? 'stdd-btn-disabled' : ''}`}>
            {loading ? <span className="stdd-loader"></span> : null}
            {loading ? 'Registering...' : 'Register Student'}
          </button>
        </div>

      </div>
    </div>
  );
}
