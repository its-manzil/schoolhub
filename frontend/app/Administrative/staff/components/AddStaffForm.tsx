"use client";

import { useState, useEffect } from "react";
import { toast } from 'sonner';

interface StaffFormData {
  fullName: string;
  gender: "Male" | "Female" | "Other";
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  department: string;
  role: string;
  joiningDate: string;
  qualification: string;
  status: "Active" | "On Leave" | "Resigned" | "Inactive";
}

interface AddStaffFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const DEPARTMENTS = [
  "Academic",
  "Teaching",
  "Library",
  "Health",
  "Finance",
  "Administration",
  "Front Office",
  "Transport",
  "Co-curricular",
  "Exams",
  "Support",
  "Residential"
];

const ROLES_BY_DEPARTMENT: Record<string, string[]> = {
  Academic: ["Principal", "Vice-Principal", "Academic Coordinator"],
  Teaching: ["Teacher", "Substitute Teacher", "Teaching Assistant"],
  Library: ["Librarian", "Library Assistant"],
  Health: ["Nurse", "Counselor"],
  Finance: ["Accountant", "Cashier"],
  Administration: ["Admin", "System Admin", "Clerk"],
  "Front Office": ["Receptionist", "PRO"],
  Transport: ["Driver", "Transport Manager"],
  "Co-curricular": ["Sports Coach", "Activity Coordinator"],
  Exams: ["Exam Coordinator", "Invigilator"],
  Support: ["Helper", "Security", "Cleaner"],
  Residential: ["Warden", "Housekeeper"]
};

export default function AddStaffForm({ onSuccess, onCancel }: AddStaffFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [formData, setFormData] = useState<StaffFormData>({
    fullName: "",
    gender: "Male",
    phone: "",
    email: "",
    address: "",
    emergencyContact: "",
    department: "",
    role: "",
    joiningDate: "",
    qualification: "",
    status: "Active"
  });

  useEffect(() => {
    if (formData.department) {
      const roles = ROLES_BY_DEPARTMENT[formData.department] || [];
      setAvailableRoles(roles);
      setFormData(prev => ({ ...prev, role: "" }));
    } else {
      setAvailableRoles([]);
    }
  }, [formData.department]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (!/^[A-Z]/.test(formData.fullName.trim())) {
      newErrors.fullName = "Full name must start with a capital letter";
    } else if (/[0-9]/.test(formData.fullName)) {
      newErrors.fullName = "Full name cannot contain numbers";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^(97|98)[0-9]{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Phone number must be 10 digits starting with 97 or 98";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.department && !DEPARTMENTS.includes(formData.department)) {
      newErrors.department = "Please select a valid department";
    }

    if (formData.role && formData.department && availableRoles.length > 0 && !availableRoles.includes(formData.role)) {
      newErrors.role = "Please select a valid role for this department";
    }

    if (formData.qualification.trim()) {
      if (!/^[A-Z]/.test(formData.qualification.trim())) {
        newErrors.qualification = "Qualification must start with a capital letter";
      } else if (/[0-9]/.test(formData.qualification)) {
        newErrors.qualification = "Qualification cannot contain numbers";
      }
    }

    if (formData.address.trim()) {
      if (!/^[A-Z]/.test(formData.address.trim())) {
        newErrors.address = "Address must start with a capital letter";
      } else if (/[0-9]/.test(formData.address)) {
        newErrors.address = "Address cannot contain numbers";
      }
    }

    if (formData.emergencyContact.trim()) {
      if (formData.emergencyContact.replace(/\s/g, '') !== formData.phone.replace(/\s/g, '')) {
        newErrors.emergencyContact = "Emergency contact must be the same as phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("Staff member added successfully!");
        onSuccess();
      } else if (response.status === 401) {
        toast.error("Authentication required - please login");
      } else {
        const responseData = await response.json().catch(() => ({}));
        toast.error(`Failed to add staff. ${responseData.message || responseData.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error("Error adding staff:", error);
      toast.error("Error adding staff. Please check your connection.");
    }
  };

  return (
    <div className="card">
      <h2>Add New Staff</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className={errors.fullName ? 'input-error' : ''}
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>
          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className={errors.phone ? 'input-error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value as "Male" | "Female" | "Other"})}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              className={errors.department ? 'input-error' : ''}
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.department && <span className="error-message">{errors.department}</span>}
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              disabled={!formData.department}
              className={errors.role ? 'input-error' : ''}
            >
              <option value="">
                {formData.department ? "Select Role" : "Select Department First"}
              </option>
              {availableRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            {errors.role && <span className="error-message">{errors.role}</span>}
          </div>
          <div className="form-group">
            <label>Joining Date</label>
            <input
              type="date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Qualification</label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) => setFormData({...formData, qualification: e.target.value})}
              className={errors.qualification ? 'input-error' : ''}
            />
            {errors.qualification && <span className="error-message">{errors.qualification}</span>}
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className={errors.address ? 'input-error' : ''}
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>
          <div className="form-group">
            <label>Emergency Contact</label>
            <input
              type="tel"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
              className={errors.emergencyContact ? 'input-error' : ''}
            />
            {errors.emergencyContact && <span className="error-message">{errors.emergencyContact}</span>}
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Save Staff</button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
