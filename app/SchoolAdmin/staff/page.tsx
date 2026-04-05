"use client";

import { useState, useEffect } from "react";
import Modal from "../Components/Modal";
import { useLocalStorage } from "../Components/useLocalStorage";
import Layout from "../Components/Layout";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: string;
  bloodGroup: string;
  address: string;
  gender: string;
  joiningDate: string;
  qualification: string;
  emergencyContact: string;
}

export default function StaffPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [staff, setStaff] = useLocalStorage<StaffMember[]>("sh_staff", [
    { 
      id: "STF001", 
      name: "Robert Downey", 
      email: "robert@schoolhub.com", 
      phone: "123-456-7890", 
      department: "Science", 
      role: "HOD", 
      status: "Active",
      bloodGroup: "O+",
      address: "123 Malibu Point, CA",
      gender: "Male",
      joiningDate: "2020-01-15",
      qualification: "Ph.D. in Nuclear Physics",
      emergencyContact: "Pepper Potts (987-654-3210)"
    },
    { 
      id: "STF002", 
      name: "Scarlett Johansson", 
      email: "scarlett@schoolhub.com", 
      phone: "123-456-7891", 
      department: "Mathematics", 
      role: "Teacher", 
      status: "On Leave",
      bloodGroup: "A-",
      address: "456 Red Room Blvd, NY",
      gender: "Female",
      joiningDate: "2021-03-10",
      qualification: "M.Sc. in Mathematics",
      emergencyContact: "Natasha Romanoff (987-654-3211)"
    },
    { 
      id: "STF003", 
      name: "Chris Evans", 
      email: "chris@schoolhub.com", 
      phone: "123-456-7892", 
      department: "English", 
      role: "Teacher", 
      status: "Active",
      bloodGroup: "B+",
      address: "789 Brooklyn St, NY",
      gender: "Male",
      joiningDate: "2019-08-22",
      qualification: "MA in English Literature",
      emergencyContact: "Bucky Barnes (987-654-3212)"
    },
  ]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Mathematics",
    role: "Teacher",
    bloodGroup: "O+",
    address: "",
    gender: "Male",
    joiningDate: "",
    qualification: "",
    emergencyContact: ""
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [viewingMember, setViewingMember] = useState<StaffMember | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingMember) {
      setEditingMember({ ...editingMember, [name]: value });
    }
  };

  const handleAddStaff = () => {
    if (!formData.name || !formData.email) {
      alert("Please fill in required fields (Name and Email)");
      return;
    }
    const newMember: StaffMember = {
      id: `STF${Math.floor(100 + Math.random() * 900)}`,
      ...formData,
      status: "Active"
    };
    setStaff(prev => [newMember, ...prev]);
    setFormData({ 
      name: "", email: "", phone: "", department: "Mathematics", role: "Teacher",
      bloodGroup: "O+", address: "", gender: "Male", joiningDate: "", qualification: "", emergencyContact: ""
    });
    alert("Staff member added successfully!");
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
  };

  const handleUpdateStaff = () => {
    if (editingMember) {
      setStaff(prev => prev.map(s => s.id === editingMember.id ? editingMember : s));
      setIsEditModalOpen(false);
      setEditingMember(null);
      alert("Staff member updated successfully!");
    }
  };

  if (!hasMounted) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="card">
        <div className="card-title">Register New Staff / Teacher</div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" name="name" placeholder="Full name..." value={formData.name} onChange={handleInputChange} />
          </div>
          <div className="form-group" style={{ flex: 2 }}>
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" name="email" placeholder="email@school.com" value={formData.email} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input type="text" id="phone" name="phone" placeholder="Contact number" value={formData.phone} onChange={handleInputChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="bloodGroup">Blood Group</label>
            <select id="bloodGroup" name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange}>
              <option>O+</option><option>O-</option><option>A+</option><option>A-</option>
              <option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="joiningDate">Joining Date</label>
            <input type="date" id="joiningDate" name="joiningDate" value={formData.joiningDate} onChange={handleInputChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <select id="department" name="department" value={formData.department} onChange={handleInputChange}>
              <option>Mathematics</option><option>Science</option><option>English</option>
              <option>Social Studies</option><option>Arts</option><option>Administration</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={formData.role} onChange={handleInputChange}>
              <option>Teacher</option><option>HOD</option><option>Coordinator</option><option>Support Staff</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 2 }}>
            <label htmlFor="qualification">Qualification</label>
            <input type="text" id="qualification" name="qualification" placeholder="Degree, Certifications..." value={formData.qualification} onChange={handleInputChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label htmlFor="address">Permanent Address</label>
            <input type="text" id="address" name="address" placeholder="Full address..." value={formData.address} onChange={handleInputChange} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="emergencyContact">Emergency Contact</label>
            <input type="text" id="emergencyContact" name="emergencyContact" placeholder="Name (Phone)" value={formData.emergencyContact} onChange={handleInputChange} />
          </div>
        </div>

        <div className="action-row">
          <button className="submit-btn" onClick={handleAddStaff}>Add Staff Member</button>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-title">Staff Directory</div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Dept / Role</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(member => (
              <tr key={member.id}>
                <td>{member.id}</td>
                <td style={{ fontWeight: '600', color: '#2563eb', cursor: 'pointer' }} onClick={() => handleProfileClick(member)}>{member.name}</td>
                <td>{member.department} ({member.role})</td>
                <td>{member.phone}</td>
                <td>
                  <span className={`badge badge-${member.status.replace(' ', '-').toLowerCase()}`}>
                    {member.status}
                  </span>
                </td>
                <td>
                  <button className="btn-action btn-edit" onClick={() => handleEditClick(member)}>Edit</button>
                  <button className="btn-action btn-delete" onClick={() => handleDelete(member.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Profile View Modal */}
      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Staff Profile Details">
        {viewingMember && (
          <div className="profile-view-content">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="view-group">
                <label style={{ fontWeight: '700', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Full Name</label>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{viewingMember.name}</p>
              </div>
              <div className="view-group">
                <label style={{ fontWeight: '700', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Staff ID</label>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{viewingMember.id}</p>
              </div>
              <div className="view-group">
                <label style={{ fontWeight: '700', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Email</label>
                <p style={{ fontSize: '14px', color: '#334155' }}>{viewingMember.email}</p>
              </div>
              <div className="view-group">
                <label style={{ fontWeight: '700', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Phone</label>
                <p style={{ fontSize: '14px', color: '#334155' }}>{viewingMember.phone}</p>
              </div>
              <div className="view-group">
                <label style={{ fontWeight: '700', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Gender</label>
                <p style={{ fontSize: '14px', color: '#334155' }}>{viewingMember.gender}</p>
              </div>
              <div className="view-group">
                <label style={{ fontWeight: '700', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Blood Group</label>
                <p style={{ fontSize: '14px', color: '#ef4444', fontWeight: '700' }}>{viewingMember.bloodGroup}</p>
              </div>
              <div className="view-group">
                <label style={{ fontWeight: '700', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Department</label>
                <p style={{ fontSize: '14px', color: '#334155' }}>{viewingMember.department}</p>
              </div>
              <div className="view-group">
                <label style={{ fontWeight: '700', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Role</label>
                <p style={{ fontSize: '14px', color: '#334155' }}>{viewingMember.role}</p>
              </div>
              <div className="view-group">
                <label style={{ fontWeight: '700', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Joining Date</label>
                <p style={{ fontSize: '14px', color: '#334155' }}>{viewingMember.joiningDate}</p>
              </div>
              <div className="view-group">
                <label style={{ fontWeight: '700', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Qualification</label>
                <p style={{ fontSize: '14px', color: '#334155' }}>{viewingMember.qualification}</p>
              </div>
              <div className="view-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: '700', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Address</label>
                <p style={{ fontSize: '14px', color: '#334155' }}>{viewingMember.address}</p>
              </div>
              <div className="view-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: '700', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Emergency Contact</label>
                <p style={{ fontSize: '14px', color: '#334155' }}>{viewingMember.emergencyContact}</p>
              </div>
            </div>
            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="cancel-btn" onClick={() => setIsProfileModalOpen(false)}>Close Profile</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Staff Member">
        {editingMember && (
          <>
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label>Full Name</label>
                <input type="text" name="name" value={editingMember.name} onChange={handleEditInputChange} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" name="phone" value={editingMember.phone} onChange={handleEditInputChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <select name="department" value={editingMember.department} onChange={handleEditInputChange}>
                  <option>Mathematics</option><option>Science</option><option>English</option>
                  <option>Social Studies</option><option>Arts</option><option>Administration</option>
                </select>
              </div>
              <div className="form-group">
                <label>Role</label>
                <select name="role" value={editingMember.role} onChange={handleEditInputChange}>
                  <option>Teacher</option><option>HOD</option><option>Coordinator</option><option>Support Staff</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={editingMember.status} onChange={handleEditInputChange}>
                  <option>Active</option><option>On Leave</option><option>Resigned</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Blood Group</label>
                <select name="bloodGroup" value={editingMember.bloodGroup} onChange={handleEditInputChange}>
                  <option>O+</option><option>O-</option><option>A+</option><option>A-</option>
                  <option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 2 }}>
                <label>Qualification</label>
                <input type="text" name="qualification" value={editingMember.qualification} onChange={handleEditInputChange} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>Address</label>
              <input type="text" name="address" value={editingMember.address} onChange={handleEditInputChange} />
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button className="submit-btn" onClick={handleUpdateStaff}>Update Staff</button>
            </div>
          </>
        )}
      </Modal>
    </Layout>
  );
}
