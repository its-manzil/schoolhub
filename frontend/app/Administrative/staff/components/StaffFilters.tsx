"use client";

interface StaffFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
  selectedRole: string;
  onRoleChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  departments: string[];
  roles: string[];
  statuses: string[];
}

export default function StaffFilters({
  search,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  departments,
  roles,
  statuses
}: StaffFiltersProps) {
  return (
    <div className="staff-filters">
      <div className="filter-group">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="filter-search"
        />
      </div>
      <div className="filter-group">
        <select
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <select
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Roles</option>
          {roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          {statuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
