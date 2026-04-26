"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/app/Components/skeleton";
import Modal from "@/app/Administrative/components/Modal";
import { Toaster, toast } from 'sonner';
import "@/app/Administrative/staff/staff.css";
import Layout from "../components/AdmLayout";

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
  status: "Active" | "On Leave" | "Resigned";
  photo?: string;
}

interface StaffApiResponse {
  _id: string;
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
  status: "Active" | "On Leave" | "Resigned";
  photo?: string;
}


export default function StaffPage() {
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "Male" as "Male" | "Female" | "Other",
    phone: "",
    email: "",
    address: "",
    emergencyContact: "",
    department: "",
    role: "",
    joiningDate: "",
    qualification: "",
    status: "Active" as "Active" | "On Leave" | "Resigned"
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:2056/api/staff", {
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        // Handle new response format with success/data structure
        if (result.success && result.data) {
          // Map _id to id for frontend compatibility
          const formattedStaff = result.data.map((item: StaffApiResponse) => ({
            ...item,
            id: item._id
          }));
          setStaff(formattedStaff);
        } else {
          setStaff([]);
        }
      } else if (response.status === 401) {
        console.error("Authentication required - please login");
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Full Name validation - must start with capital letter and no numbers
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (!/^[A-Z]/.test(formData.fullName.trim())) {
      newErrors.fullName = "Full name must start with a capital letter";
    } else if (/[0-9]/.test(formData.fullName)) {
      newErrors.fullName = "Full name cannot contain numbers";
    }
    
    // Phone validation - must be 10 digits and start with 97 or 98
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^(97|98)[0-9]{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Phone number must be 10 digits starting with 97 or 98";
    }
    
    // Email validation - must be valid email format
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Department validation - must start with capital letter and no numbers (if provided)
    if (formData.department.trim()) {
      if (!/^[A-Z]/.test(formData.department.trim())) {
        newErrors.department = "Department must start with a capital letter";
      } else if (/[0-9]/.test(formData.department)) {
        newErrors.department = "Department cannot contain numbers";
      }
    }
    
    // Role validation - must start with capital letter and no numbers (if provided)
    if (formData.role.trim()) {
      if (!/^[A-Z]/.test(formData.role.trim())) {
        newErrors.role = "Role must start with a capital letter";
      } else if (/[0-9]/.test(formData.role)) {
        newErrors.role = "Role cannot contain numbers";
      }
    }
    
    // Qualification validation - must start with capital letter and no numbers (if provided)
    if (formData.qualification.trim()) {
      if (!/^[A-Z]/.test(formData.qualification.trim())) {
        newErrors.qualification = "Qualification must start with a capital letter";
      } else if (/[0-9]/.test(formData.qualification)) {
        newErrors.qualification = "Qualification cannot contain numbers";
      }
    }
    
    // Address validation - must start with capital letter and no numbers (if provided)
    if (formData.address.trim()) {
      if (!/^[A-Z]/.test(formData.address.trim())) {
        newErrors.address = "Address must start with a capital letter";
      } else if (/[0-9]/.test(formData.address)) {
        newErrors.address = "Address cannot contain numbers";
      }
    }
    
    // Emergency Contact validation - must match phone number if provided
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
      console.log("Submitting staff data:", formData);
      const response = await fetch("http://localhost:2056/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      console.log("Response status:", response.status);
      const responseData = await response.json().catch(() => ({}));
      console.log("Response data:", responseData);
      
      if (response.ok) {
        setShowAddForm(false);
        setFormData({
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
        fetchStaff();
        toast.success("Staff member added successfully!");
      } else if (response.status === 401) {
        console.error("Authentication required - please login");
        toast.error("Authentication required - please login");
      } else {
        console.error("Error adding staff:", response.status, responseData);
        toast.error(`Failed to add staff. Status: ${response.status}. ${responseData.message || responseData.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error("Error adding staff:", error);
      toast.error("Error adding staff. Please check your connection.");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    
    try {
      const response = await fetch(`http://localhost:2056/api/staff/${selectedStaff.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setShowEditModal(false);
        fetchStaff();
      } else if (response.status === 401) {
        console.error("Authentication required - please login");
      }
    } catch (error) {
      console.error("Error updating staff:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
    
    try {
      const response = await fetch(`http://localhost:2056/api/staff/${id}`, {
        method: "DELETE",
        credentials: 'include'
      });
      if (response.ok) {
        fetchStaff();
      } else if (response.status === 401) {
        console.error("Authentication required - please login");
      }
    } catch (error) {
      console.error("Error deleting staff:", error);
    }
  };

  const openProfile = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setShowProfileModal(true);
  };

  const openEdit = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setFormData({
      fullName: staffMember.fullName,
      gender: staffMember.gender,
      phone: staffMember.phone,
      email: staffMember.email,
      address: staffMember.address,
      emergencyContact: staffMember.emergencyContact,
      department: staffMember.department,
      role: staffMember.role,
      joiningDate: staffMember.joiningDate,
      qualification: staffMember.qualification,
      status: staffMember.status
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "#10b981";
      case "On Leave": return "#f59e0b";
      case "Resigned": return "#ef4444";
      default: return "#6b7280";
    }
  };

  return (
    <Layout>
    <Toaster position="top-right" />
    <div className="staff-container">
      
      <div className="header">
        <h1>Staff Management</h1>
        <button className="btn btn-primary" onClick={() => { setShowAddForm(true); setErrors({}); }}>
          Add Staff
        </button>
      </div>

      {showAddForm && (
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
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className={errors.department ? 'input-error' : ''}
                />
                {errors.department && <span className="error-message">{errors.department}</span>}
              </div>
              <div className="form-group">
                <label>Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className={errors.role ? 'input-error' : ''}
                />
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
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

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
        ) : staff.length === 0 ? (
          <div className="empty-state">
            <p>No staff found</p>
          </div>
        ) : (
          <table>
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
              {staff.map((member) => (
                <tr key={member.id}>
                  <td>{member.id}</td>
                  <td>
                    <a className="name-link" onClick={() => openProfile(member)}>
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
                        onClick={() => openEdit(member)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-delete" 
                        onClick={() => handleDelete(member.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        title="Staff Profile"
      >
        {selectedStaff && (
          <div className="profile-grid">
            <div className="profile-field">
              <span className="profile-label">Full Name</span>
              <span className="profile-value">{selectedStaff.fullName}</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Gender</span>
              <span className="profile-value">{selectedStaff.gender}</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Phone</span>
              <span className="profile-value">{selectedStaff.phone}</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Email</span>
              <span className="profile-value">{selectedStaff.email}</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Department</span>
              <span className="profile-value">{selectedStaff.department}</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Role</span>
              <span className="profile-value">{selectedStaff.role}</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Joining Date</span>
              <span className="profile-value">{selectedStaff.joiningDate}</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Qualification</span>
              <span className="profile-value">{selectedStaff.qualification}</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Status</span>
              <span className="profile-value">{selectedStaff.status}</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Address</span>
              <span className="profile-value">{selectedStaff.address}</span>
            </div>
            <div className="profile-field" style={{gridColumn: 'span 2'}}>
              <span className="profile-label">Emergency Contact</span>
              <span className="profile-value">{selectedStaff.emergencyContact}</span>
            </div>
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        title="Edit Staff"
      >
        <form onSubmit={handleEdit}>
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
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as "Active" | "On Leave" | "Resigned"})}
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Resigned">Resigned</option>
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
            <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
    </Layout>
  );
}