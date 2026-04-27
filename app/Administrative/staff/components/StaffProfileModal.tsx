"use client";

import Modal from "@/app/Administrative/components/Modal";

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

interface StaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
}

export default function StaffProfileModal({ isOpen, onClose, staff }: StaffProfileModalProps) {
  if (!staff) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Staff Profile">
      <div className="profile-grid">
        <div className="profile-field">
          <span className="profile-label">Full Name</span>
          <span className="profile-value">{staff.fullName}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">Gender</span>
          <span className="profile-value">{staff.gender}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">Phone</span>
          <span className="profile-value">{staff.phone}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">Email</span>
          <span className="profile-value">{staff.email}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">Department</span>
          <span className="profile-value">{staff.department}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">Role</span>
          <span className="profile-value">{staff.role}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">Joining Date</span>
          <span className="profile-value">{staff.joiningDate}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">Qualification</span>
          <span className="profile-value">{staff.qualification}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">Status</span>
          <span className="profile-value">{staff.status}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">Address</span>
          <span className="profile-value">{staff.address}</span>
        </div>
        <div className="profile-field" style={{gridColumn: 'span 2'}}>
          <span className="profile-label">Emergency Contact</span>
          <span className="profile-value">{staff.emergencyContact}</span>
        </div>
      </div>
    </Modal>
  );
}
