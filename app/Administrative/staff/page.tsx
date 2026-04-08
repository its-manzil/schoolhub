"use client";

import { useState, useEffect } from "react";
import Layout from "../components/AdmLayout";
import "./staffs.css";

// Types
interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: "Active" | "On Leave" | "Resigned";
  bloodGroup: string;
  address: string;
  gender: string;
  joiningDate: string;
  qualification: string;
  emergencyContact: string;
  profilePhoto?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

// Constants
const DEPARTMENTS = [
  "Mathematics",
  "Science", 
  "English",
  "Social Studies",
  "Arts",
  "Administration",
  "Physical Education",
  "Computer Science"
];

const ROLES = [
  "Teacher",
  "HOD",
  "Coordinator", 
  "Support Staff",
  "Librarian",
  "Lab Assistant"
];

const BLOOD_GROUPS = [
  "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"
];

const GENDERS = ["Male", "Female", "Other"];

// Reusable Components
const Badge: React.FC<{ 
  children: React.ReactNode; 
  variant: "success" | "warning" | "danger" | "secondary" 
}> = ({ children, variant }) => (
  <span className={`badge badge-${variant}`}>
    {children}
  </span>
);

const FormRow: React.FC<{ children: React.ReactNode; single?: boolean }> = ({ 
  children, 
  single = false 
}) => (
  <div className={`form-row ${single ? "single" : ""}`}>
    {children}
  </div>
);

const FormGroup: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required = false, error, children }) => (
  <div className="form-group">
    <label className={required ? "required" : ""}>
      {label}
    </label>
    {children}
    {error && <div className="form-error">{error}</div>}
  </div>
);

const FileUpload: React.FC<{
  label: string;
  value?: string;
  onChange: (file: File | null) => void;
}> = ({ label, value, onChange }) => {
  const [fileName, setFileName] = useState(value || "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onChange(file);
    } else {
      setFileName("");
      onChange(null);
    }
  };

  return (
    <div className="file-upload">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      <div className={`file-upload-label ${fileName ? "has-file" : ""}`}>
        {fileName ? `Selected: ${fileName}` : label}
      </div>
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="staff-management">
    <div className="skeleton skeleton-text large" style={{ width: "300px", marginBottom: "2rem" }} />
    <div className="staff-content">
      <div className="staff-form-card">
        <div className="skeleton skeleton-text" style={{ width: "200px", marginBottom: "1rem" }} />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton skeleton-text" style={{ marginBottom: "0.75rem" }} />
        ))}
      </div>
      <div className="staff-table-card">
        <div className="skeleton skeleton-text" style={{ width: "250px", marginBottom: "1rem" }} />
        <div className="table-wrapper">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton skeleton-text" style={{ height: "60px", marginBottom: "0.5rem" }} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Main Component
export default function StaffPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: DEPARTMENTS[0],
    role: ROLES[0],
    bloodGroup: BLOOD_GROUPS[0],
    address: "",
    gender: GENDERS[0],
    joiningDate: "",
    qualification: "",
    emergencyContact: "",
    profilePhoto: null as File | null
  });

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [viewingMember, setViewingMember] = useState<StaffMember | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "documents" | "attendance">("profile");

  // Table states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "On Leave" | "Resigned">("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"name" | "joiningDate">("name");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form validation
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    
    if (formData.phone && !/^[+]?[\d\s\-\(\)]+$/.test(formData.phone)) {
      errors.phone = "Invalid phone format";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddStaff = () => {
    if (!validateForm()) return;
    
    const newMember: StaffMember = {
      id: `STF${String(Math.floor(Math.random() * 9000) + 1000)}`,
      ...formData,
      status: "Active",
      profilePhoto: formData.profilePhoto?.name
    };
    
    setStaff(prev => [newMember, ...prev]);
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: DEPARTMENTS[0],
      role: ROLES[0],
      bloodGroup: BLOOD_GROUPS[0],
      address: "",
      gender: GENDERS[0],
      joiningDate: "",
      qualification: "",
      emergencyContact: "",
      profilePhoto: null
    });
    
    alert("Staff member added successfully!");
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingMember) {
      setEditingMember({ ...editingMember, [name]: value });
    }
  };

  const handleUpdateStaff = () => {
    if (editingMember) {
      setStaff(prev => prev.map(s => s.id === editingMember.id ? editingMember : s));
      setIsEditModalOpen(false);
      setEditingMember(null);
      alert("Staff member updated successfully!");
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      setStaff(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleEditClick = (member: StaffMember) => {
    setEditingMember(member);
    setIsEditModalOpen(true);
  };

  const handleProfileClick = (member: StaffMember) => {
    setViewingMember(member);
    setIsProfileModalOpen(true);
    setActiveTab("profile");
  };

  // Table filtering and sorting
  const filteredStaff = staff
    .filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || member.status === statusFilter;
      const matchesDepartment = departmentFilter === "All" || member.department === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else {
        return new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime();
      }
    });

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: StaffMember["status"]) => {
    const variants = {
      "Active": "success" as const,
      "On Leave": "warning" as const,
      "Resigned": "danger" as const
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  if (isLoading) {
    return <Layout><LoadingSkeleton /></Layout>;
  }

  return (
    <Layout>
      <div className="staff-management">
        <div className="staff-header">
          <h1 className="staff-title">Staff Management</h1>
          <p className="staff-subtitle">Manage staff registration, profiles, and records</p>
        </div>

        <div className="staff-content">
          {/* Registration Form */}
          <div className="staff-form-card">
            <div className="form-header">
              <h2 className="form-title">Staff Registration</h2>
              <p className="form-subtitle">Add new staff members to the system</p>
            </div>

            <FormRow>
              <FormGroup label="Full Name" required error={formErrors.name}>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup label="Email Address" required error={formErrors.email}>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="email@school.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup label="Phone Number" error={formErrors.phone}>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup label="Gender">
                <select
                  name="gender"
                  className="form-select"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  {GENDERS.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </FormGroup>
              <FormGroup label="Blood Group">
                <select
                  name="bloodGroup"
                  className="form-select"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                >
                  {BLOOD_GROUPS.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </FormGroup>
              <FormGroup label="Joining Date">
                <input
                  type="date"
                  name="joiningDate"
                  className="form-input"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup label="Department">
                <select
                  name="department"
                  className="form-select"
                  value={formData.department}
                  onChange={handleInputChange}
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </FormGroup>
              <FormGroup label="Role">
                <select
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </FormGroup>
              <FormGroup label="Qualification">
                <input
                  type="text"
                  name="qualification"
                  className="form-input"
                  placeholder="Degree, Certifications..."
                  value={formData.qualification}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </FormRow>

            <FormRow single>
              <FormGroup label="Address">
                <textarea
                  name="address"
                  className="form-textarea"
                  placeholder="Full permanent address..."
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup label="Emergency Contact">
                <input
                  type="text"
                  name="emergencyContact"
                  className="form-input"
                  placeholder="Name (Phone Number)"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup label="Profile Photo">
                <FileUpload
                  label="Choose profile photo"
                  value={formData.profilePhoto?.name}
                  onChange={(file) => setFormData(prev => ({ ...prev, profilePhoto: file }))}
                />
              </FormGroup>
            </FormRow>

            <button className="btn btn-primary btn-block" onClick={handleAddStaff}>
              Add Staff Member
            </button>
          </div>

          {/* Staff Table */}
          <div className="staff-table-card">
            <div className="table-header">
              <h2 className="table-title">Staff Directory</h2>
              <div className="table-controls">
                <div className="search-box">
                  <span className="search-icon">Search</span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by name, email, ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "All" | "Active" | "On Leave" | "Resigned")}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Resigned">Resigned</option>
                </select>
                <select
                  className="filter-select"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="All">All Departments</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <select
                  className="filter-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "name" | "joiningDate")}
                >
                  <option value="name">Sort by Name</option>
                  <option value="joiningDate">Sort by Joining Date</option>
                </select>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Department / Role</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStaff.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center">
                        No staff members found
                      </td>
                    </tr>
                  ) : (
                    paginatedStaff.map(member => (
                      <tr key={member.id}>
                        <td>{member.id}</td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleProfileClick(member)}
                          >
                            {member.name}
                          </button>
                        </td>
                        <td>{member.department} ({member.role})</td>
                        <td>{member.phone || "N/A"}</td>
                        <td>{getStatusBadge(member.status)}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleEditClick(member)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(member.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    className={`pagination-btn ${currentPage === i + 1 ? "active" : ""}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  Next
                </button>
                
                <span className="pagination-info">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredStaff.length)} of {filteredStaff.length} staff
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Modal */}
        {isProfileModalOpen && viewingMember && (
          <div className="modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Staff Profile</h3>
                <button
                  className="modal-close"
                  onClick={() => setIsProfileModalOpen(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="profile-tabs">
                  <button
                    className={`profile-tab ${activeTab === "profile" ? "active" : ""}`}
                    onClick={() => setActiveTab("profile")}
                  >
                    Profile
                  </button>
                  <button
                    className={`profile-tab ${activeTab === "documents" ? "active" : ""}`}
                    onClick={() => setActiveTab("documents")}
                  >
                    Documents
                  </button>
                  <button
                    className={`profile-tab ${activeTab === "attendance" ? "active" : ""}`}
                    onClick={() => setActiveTab("attendance")}
                  >
                    Attendance
                  </button>
                </div>

                {activeTab === "profile" && (
                  <div className="profile-tab-content active">
                    <div className="profile-info">
                      <div className="profile-info-row">
                        <span className="profile-info-label">Staff ID</span>
                        <span className="profile-info-value">{viewingMember.id}</span>
                      </div>
                      <div className="profile-info-row">
                        <span className="profile-info-label">Full Name</span>
                        <span className="profile-info-value">{viewingMember.name}</span>
                      </div>
                      <div className="profile-info-row">
                        <span className="profile-info-label">Email</span>
                        <span className="profile-info-value">{viewingMember.email}</span>
                      </div>
                      <div className="profile-info-row">
                        <span className="profile-info-label">Phone</span>
                        <span className="profile-info-value">{viewingMember.phone || "N/A"}</span>
                      </div>
                      <div className="profile-info-row">
                        <span className="profile-info-label">Gender</span>
                        <span className="profile-info-value">{viewingMember.gender}</span>
                      </div>
                      <div className="profile-info-row">
                        <span className="profile-info-label">Blood Group</span>
                        <span className="profile-info-value">{viewingMember.bloodGroup}</span>
                      </div>
                      <div className="profile-info-row">
                        <span className="profile-info-label">Department</span>
                        <span className="profile-info-value">{viewingMember.department}</span>
                      </div>
                      <div className="profile-info-row">
                        <span className="profile-info-label">Role</span>
                        <span className="profile-info-value">{viewingMember.role}</span>
                      </div>
                      <div className="profile-info-row">
                        <span className="profile-info-label">Status</span>
                        <span className="profile-info-value">{getStatusBadge(viewingMember.status)}</span>
                      </div>
                      <div className="profile-info-row">
                        <span className="profile-info-label">Joining Date</span>
                        <span className="profile-info-value">{viewingMember.joiningDate || "N/A"}</span>
                      </div>
                      <div className="profile-info-row">
                        <span className="profile-info-label">Qualification</span>
                        <span className="profile-info-value">{viewingMember.qualification || "N/A"}</span>
                      </div>
                      <div className="profile-info-row">
                        <span className="profile-info-label">Address</span>
                        <span className="profile-info-value">{viewingMember.address || "N/A"}</span>
                      </div>
                      <div className="profile-info-row">
                        <span className="profile-info-label">Emergency Contact</span>
                        <span className="profile-info-value">{viewingMember.emergencyContact || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "documents" && (
                  <div className="profile-tab-content active">
                    <div className="text-center">
                      <div className="skeleton skeleton-text large" style={{ margin: "2rem auto" }} />
                      <p className="text-muted">Document management coming soon...</p>
                    </div>
                  </div>
                )}

                {activeTab === "attendance" && (
                  <div className="profile-tab-content active">
                    <div className="text-center">
                      <div className="skeleton skeleton-text large" style={{ margin: "2rem auto" }} />
                      <p className="text-muted">Attendance tracking coming soon...</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsProfileModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && editingMember && (
          <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Edit Staff Member</h3>
                <button
                  className="modal-close"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <FormRow>
                  <FormGroup label="Full Name">
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={editingMember.name}
                      onChange={handleEditInputChange}
                    />
                  </FormGroup>
                  <FormGroup label="Phone">
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      value={editingMember.phone}
                      onChange={handleEditInputChange}
                    />
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup label="Department">
                    <select
                      name="department"
                      className="form-select"
                      value={editingMember.department}
                      onChange={handleEditInputChange}
                    >
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </FormGroup>
                  <FormGroup label="Role">
                    <select
                      name="role"
                      className="form-select"
                      value={editingMember.role}
                      onChange={handleEditInputChange}
                    >
                      {ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </FormGroup>
                  <FormGroup label="Status">
                    <select
                      name="status"
                      className="form-select"
                      value={editingMember.status}
                      onChange={handleEditInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Resigned">Resigned</option>
                    </select>
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup label="Blood Group">
                    <select
                      name="bloodGroup"
                      className="form-select"
                      value={editingMember.bloodGroup}
                      onChange={handleEditInputChange}
                    >
                      {BLOOD_GROUPS.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </FormGroup>
                  <FormGroup label="Qualification">
                    <input
                      type="text"
                      name="qualification"
                      className="form-input"
                      value={editingMember.qualification}
                      onChange={handleEditInputChange}
                    />
                  </FormGroup>
                </FormRow>

                <FormRow single>
                  <FormGroup label="Address">
                    <textarea
                      name="address"
                      className="form-textarea"
                      value={editingMember.address}
                      onChange={handleEditInputChange}
                    />
                  </FormGroup>
                </FormRow>

                <FormGroup label="Emergency Contact">
                  <input
                    type="text"
                    name="emergencyContact"
                    className="form-input"
                    value={editingMember.emergencyContact}
                    onChange={handleEditInputChange}
                  />
                </FormGroup>
              </div>
              
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleUpdateStaff}
                >
                  Update Staff
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
