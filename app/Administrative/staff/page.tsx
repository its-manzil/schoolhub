"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/app/Components/skeleton";
import Modal from "@/app/Administrative/components/Modal";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:2056/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
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
      } else if (response.status === 401) {
        console.error("Authentication required - please login");
      }
    } catch (error) {
      console.error("Error adding staff:", error);
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
    <div className="staff-container">
      
      <div className="header">
        <h1>Staff Management</h1>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
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
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
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
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Emergency Contact</label>
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                />
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