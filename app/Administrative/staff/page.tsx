"use client";

import { useState, useEffect } from "react";
import { Toaster, toast } from 'sonner';
import "@/app/Administrative/staff/staff.css";
import Layout from "../components/AdmLayout";
import { useBasePath } from "../components/useBasePath";
import StaffTabs from "./components/StaffTabs";
import AddStaffForm from "./components/AddStaffForm";
import StaffList from "./components/StaffList";
import EditStaffModal from "./components/EditStaffModal";
import StaffProfileModal from "./components/StaffProfileModal";

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
  status: "Active" | "On Leave" | "Resigned" | "Inactive";
  photo?: string;
}

export default function StaffPage() {
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [activeTab, setActiveTab] = useState<"add" | "list">("list");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

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
        if (result.success && result.data) {
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

  const handleAddSuccess = () => {
    setActiveTab("list");
    fetchStaff();
  };

  const handleMarkAsLeft = async (id: string) => {
    if (!confirm("Are you sure you want to mark this staff member as left? This will set their status to 'Resigned'.")) return;

    try {
      const response = await fetch(`http://localhost:2056/api/staff/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ status: "Resigned" })
      });

      if (response.ok) {
        toast.success("Staff member marked as resigned");
        fetchStaff();
      } else if (response.status === 401) {
        toast.error("Authentication required - please login");
      } else {
        const responseData = await response.json().catch(() => ({}));
        toast.error(`Failed to update staff. ${responseData.message || responseData.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error("Error marking staff as left:", error);
      toast.error("Error updating staff. Please check your connection.");
    }
  };

  const openProfile = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setShowProfileModal(true);
  };

  const openEdit = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setShowEditModal(true);
  };

  const basePath = useBasePath();

  return (
    <Layout basePath={basePath}>
      <Toaster position="top-right" />
      <div className="staff-container">
        <div className="header">
          <h1>Staff Management</h1>
          <StaffTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {activeTab === "add" && (
          <AddStaffForm
            onSuccess={handleAddSuccess}
            onCancel={() => setActiveTab("list")}
          />
        )}

        {activeTab === "list" && (
          <StaffList
            staff={staff}
            loading={loading}
            search={search}
            onSearchChange={setSearch}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            onViewProfile={openProfile}
            onEdit={openEdit}
            onMarkAsLeft={handleMarkAsLeft}
          />
        )}

        <StaffProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          staff={selectedStaff}
        />

        <EditStaffModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          staff={selectedStaff}
          onSuccess={fetchStaff}
        />
      </div>
    </Layout>
  );
}