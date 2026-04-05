import React from 'react';
import Image from 'next/image';
import {
  X, Mail, Phone, MapPin, Calendar, Activity,
  Award, FileText, UserCheck, FileEdit
} from 'lucide-react';
import { Student, SchoolInfo, getDefaultProfilePic, getClassName, calculateAge } from '../types';
import { formatStudentIdDisplay } from '../../components/StudentId';

interface StudentSidePanelProps {
  student: Student;
  schoolInfo: SchoolInfo | null;
  onClose: () => void;
  onEdit: (student: Student) => void;
  onShowIdCard: (student: Student) => void;
}

export default function StudentSidePanel({
  student,
  schoolInfo,
  onClose,
  onEdit,
  onShowIdCard
}: StudentSidePanelProps) {
  return (
    <>
      <div className="stdd-overlay" onClick={onClose} />

      <div className="stdd-side-panel">
        <div className="stdd-panel-header-bg">
          <button onClick={onClose} className="stdd-panel-close-btn">
            <X size={18} />
          </button>
        </div>

        <div className="stdd-panel-profile">
          <div className="stdd-panel-profile-top">
            <div className="stdd-panel-avatar-container">
              <Image
                src={student.profilePicture || getDefaultProfilePic(student.name, student.gender)}
                alt={student.name}
                width={100}
                height={100}
                className="stdd-panel-avatar"
              />
              <div className={`stdd-panel-status-badge ${student.isActive ? 'active' : 'inactive'}`}>
                {student.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>

            <div className="stdd-panel-actions">
              <button
                onClick={() => onShowIdCard(student)}
                className="stdd-panel-btn stdd-panel-btn-primary"
                title="View ID Card"
              >
                <UserCheck size={18} />
              </button>
              <button
                onClick={() => onEdit(student)}
                className="stdd-panel-btn"
                title="Edit Student"
              >
                <FileEdit size={18} />
              </button>
            </div>
          </div>

          <div>
            <h2 className="stdd-panel-name">{student.name}</h2>
            <div className="stdd-panel-tags">
              <span className="stdd-panel-tag stdd-panel-tag-highlight">
                Class {getClassName(student.className)} - {student.section}
              </span>
              <span className="stdd-panel-tag">
                <FileText size={12} />
                Roll: {student.rollNumber}
              </span>
              <span className="stdd-panel-tag">
                ID: {formatStudentIdDisplay(student, schoolInfo)}
              </span>
            </div>
          </div>
        </div>

        <div className="stdd-panel-content">

          <div className="stdd-panel-stats-grid">
            <div className="stdd-panel-stat">
              <div className="stdd-panel-stat-header">
                <Activity size={14} /> Attendance
              </div>
              <div className="stdd-panel-stat-val">92%</div>
              <div className="stdd-panel-stat-sub">Good standing</div>
            </div>
            <div className="stdd-panel-stat">
              <div className="stdd-panel-stat-header" style={{ color: 'var(--stdd-primary)' }}>
                <Award size={14} /> Academics
              </div>
              <div className="stdd-panel-stat-val">A-</div>
              <div className="stdd-panel-stat-sub" style={{ color: 'var(--stdd-text-muted)' }}>Last term average</div>
            </div>
          </div>

          <div className="stdd-panel-section">
            <h3 className="stdd-panel-section-title">Personal Details</h3>
            <div className="stdd-panel-info-list">
              <DetailRow icon={<Mail size={16} />} label="Email" value={student.email || 'N/A'} />
              <DetailRow icon={<Phone size={16} />} label="Phone" value={student.phone || 'N/A'} />
              <DetailRow 
                icon={<Calendar size={16} />} 
                label="DOB" 
                value={student.dateOfBirth ? `${new Date(student.dateOfBirth).toLocaleDateString()} (${calculateAge(student.dateOfBirth)} yrs)` : 'N/A'} 
              />
              <DetailRow icon={<MapPin size={16} />} label="Address" value={student.address || 'N/A'} />
            </div>
          </div>

          <div className="stdd-panel-section">
            <h3 className="stdd-panel-section-title">Family & Contact</h3>
            <div style={{ paddingTop: '0.5rem' }}>
              <div className="stdd-panel-family-block">
                <div className="stdd-panel-family-label">Father</div>
                <div className="stdd-panel-family-name">{student.fatherName || 'N/A'}</div>
                <div className="stdd-panel-family-contact">
                  <Phone size={12} /> {student.fatherPhone || 'N/A'}
                </div>
              </div>
              <div className="stdd-panel-family-block">
                <div className="stdd-panel-family-label">Mother</div>
                <div className="stdd-panel-family-name">{student.motherName || 'N/A'}</div>
                <div className="stdd-panel-family-contact">
                  <Phone size={12} /> {student.motherPhone || 'N/A'}
                </div>
              </div>

              <div className="stdd-panel-emergency">
                <div className="stdd-panel-emergency-label">Emergency Contact</div>
                <div className="stdd-panel-emergency-val">
                  <Phone size={14} /> {student.emergencyContact || 'N/A'}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="stdd-panel-info-row">
      <div className="stdd-panel-info-icon">{icon}</div>
      <div className="stdd-panel-info-text">
        <div className="stdd-panel-info-label">{label}</div>
        <div className="stdd-panel-info-val">{value}</div>
      </div>
    </div>
  );
}
