"use client";

import { useState, useEffect } from "react";
import Modal from "@/app/Administrative/components/Modal";
import { toast } from 'sonner';

interface Staff {
  id: string;
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
  photo?: string;
}

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

interface EditStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onSuccess: () => void;
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

export default function EditStaffModal({ isOpen, onClose, staff, onSuccess }: EditStaffModalProps) {
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
    if (staff) {
      setFormData({
        fullName: staff.fullName,
        gender: staff.gender,
        phone: staff.phone,
        email: staff.email,
        address: staff.address,
        emergencyContact: staff.emergencyContact,
        department: staff.department,
        role: staff.role,
        joiningDate: staff.joiningDate,
        qualification: staff.qualification,
        status: staff.status
      });
      
      if (staff.department && ROLES_BY_DEPARTMENT[staff.department]) {
        setAvailableRoles(ROLES_BY_DEPARTMENT[staff.department]);
      }
    }
  }, [staff]);

  useEffect(() => {
    if (formData.department) {
      const roles = ROLES_BY_DEPARTMENT[formData.department] || [];
      setAvailableRoles(roles);
      // Only reset role if current role is not in new department's roles
      if (formData.role && !roles.includes(formData.role)) {
        setFormData(prev => ({ ...prev, role: "" }));
      }
    } else {
      setAvailableRoles([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2056'}/api/staff/${staff.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("Staff member updated successfully!");
        onSuccess();
        onClose();
      } else if (response.status === 401) {
        toast.error("Authentication required - please login");
      } else {
        const responseData = await response.json().catch(() => ({}));
        toast.error(`Failed to update staff. ${responseData.message || responseData.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error("Error updating staff:", error);
      toast.error("Error updating staff. Please check your connection.");
    }
  };

  if (!staff) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Staff">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              disabled={!formData.department}
            >
              <option value="">
                {formData.department ? "Select Role" : "Select Department First"}
              </option>
              {availableRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as "Active" | "On Leave" | "Resigned" | "Inactive"})}
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Resigned">Resigned</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="form-group">
            <label>Qualification</label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) => setFormData({...formData, qualification: e.target.value})}
            />
          </div>
          <div className="form-group" style={{gridColumn: 'span 2'}}>
            <label>Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Update Staff</button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
