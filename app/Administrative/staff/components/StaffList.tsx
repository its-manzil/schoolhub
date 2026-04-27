"use client";

import { Skeleton } from "@/app/Components/skeleton";
import StaffFilters from "./StaffFilters";

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

interface StaffListProps {
  staff: Staff[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
  selectedRole: string;
  onRoleChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onViewProfile: (staff: Staff) => void;
  onEdit: (staff: Staff) => void;
  onMarkAsLeft: (id: string) => void;
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

const ALL_ROLES = [
  "Principal", "Vice-Principal", "Academic Coordinator",
  "Teacher", "Substitute Teacher", "Teaching Assistant",
  "Librarian", "Library Assistant",
  "Nurse", "Counselor",
  "Accountant", "Cashier",
  "Admin", "System Admin", "Clerk",
  "Receptionist", "PRO",
  "Driver", "Transport Manager",
  "Sports Coach", "Activity Coordinator",
  "Exam Coordinator", "Invigilator",
  "Helper", "Security", "Cleaner",
  "Warden", "Housekeeper"
];

const STATUSES = ["Active", "On Leave", "Resigned", "Inactive"];

export default function StaffList({
  staff,
  loading,
  search,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  onViewProfile,
  onEdit,
  onMarkAsLeft
}: StaffListProps) {
  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      member.fullName.toLowerCase().includes(search.toLowerCase()) ||
      member.phone.includes(search);
    const matchesDepartment = selectedDepartment ? member.department === selectedDepartment : true;
    const matchesRole = selectedRole ? member.role === selectedRole : true;
    const matchesStatus = selectedStatus ? member.status === selectedStatus : true;
    
    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "#10b981";
      case "On Leave": return "#f59e0b";
      case "Resigned": return "#ef4444";
      case "Inactive": return "#6b7280";
      default: return "#6b7280";
    }
  };

  return (
    <div className="staff-list-container">
      <StaffFilters
        search={search}
        onSearchChange={onSearchChange}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={onDepartmentChange}
        selectedRole={selectedRole}
        onRoleChange={onRoleChange}
        selectedStatus={selectedStatus}
        onStatusChange={onStatusChange}
        departments={DEPARTMENTS}
        roles={ALL_ROLES}
        statuses={STATUSES}
      />

      <div className="table-container">
        {loading ? (
          <div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-row">
                <Skeleton className="skeleton-cell" style={{width: '60px'}} />
                <Skeleton className="skeleton-cell" style={{width: '120px'}} />
                <Skeleton className="skeleton-cell" style={{width: '140px'}} />
                <Skeleton className="skeleton-cell" style={{width: '100px'}} />
                <Skeleton className="skeleton-cell" style={{width: '60px'}} />
                <Skeleton className="skeleton-cell" style={{width: '80px'}} />
              </div>
            ))}
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="empty-state">
            <p>No staff found</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Department / Role</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((member) => (
                <tr key={member.id} className={member.status === "Resigned" ? "resigned-row" : ""}>
                  <td>
                    <a className="name-link" onClick={() => onViewProfile(member)}>
                      {member.fullName}
                    </a>
                  </td>
                  <td>{member.department} / {member.role}</td>
                  <td>{member.phone}</td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{backgroundColor: getStatusColor(member.status)}}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button 
                        className="btn btn-sm btn-edit" 
                        onClick={() => onEdit(member)}
                        disabled={member.status === "Resigned"}
                        title={member.status === "Resigned" ? "Resigned staff cannot be edited" : "Edit"}
                      >
                        Edit
                      </button>
                      {member.status !== "Resigned" ? (
                        <button 
                          className="btn btn-sm btn-mark-left" 
                          onClick={() => onMarkAsLeft(member.id)}
                        >
                          Mark as Left
                        </button>
                      ) : (
                        <span className="resigned-badge">Resigned</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
