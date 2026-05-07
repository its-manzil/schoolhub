import React from 'react';
import Image from 'next/image';
import { MoreVertical, Check } from 'lucide-react';
import { Student, SchoolInfo, getDefaultProfilePic, getClassName } from '../types';
import { formatStudentIdDisplay } from '../../components/StudentId';
import "./StudentGrid.css";
interface StudentGridProps {
  students: Student[];
  schoolInfo: SchoolInfo | null;
  selectedIds: Set<string>;
  onToggleSelection: (studentId: string) => void;
  onStudentClick: (student: Student) => void;
}

export default function StudentGrid({
  students,
  schoolInfo,
  selectedIds,
  onToggleSelection,
  onStudentClick
}: StudentGridProps) {

  return (
    <div className="stdd-grid-layout">
      {students.map((student) => {
        const isSelected = selectedIds.has(student._id);

        return (
          <div
            key={student._id}
            className={`stdd-grid-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onStudentClick(student)}
          >
            {/* Top actions */}
            <div className="stdd-card-top-actions">
              <div
                className="stdd-checkbox-wrap"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelection(student._id);
                }}
              >
                <div className={`stdd-checkbox ${isSelected ? 'checked' : ''}`}>
                  <Check className="stdd-checkbox-icon" strokeWidth={3} />
                </div>
              </div>
              <button
                className="stdd-card-more-btn"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={16} />
              </button>
            </div>

            {/* Profile body */}
            <div className="stdd-card-profile">
              <div className="stdd-avatar-wrap">
                <Image
                  src={student.profilePicture || getDefaultProfilePic(student.name, student.gender)}
                  alt={student.name}
                  width={80}
                  height={80}
                  className="stdd-avatar-img"
                />
              </div>

              <h3 className="stdd-student-name">{student.name}</h3>
              <p className="stdd-student-id">ID: {formatStudentIdDisplay(student, schoolInfo)}</p>

              <div className="stdd-card-stats">
                <div className="stdd-card-stat">
                  <span className="stdd-stat-label">Class</span>
                  <span className="stdd-stat-value">{student.className ? getClassName(student.className) : 'N/A'}-{student.section || 'N/A'}</span>
                </div>
                <div className="stdd-card-stat">
                  <span className="stdd-stat-label">Roll</span>
                  <span className="stdd-stat-value">{student.rollNumber || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="stdd-card-footer">
              <span className="stdd-footer-label">Attendance</span>
              <div className="stdd-footer-status">
                <div className="stdd-dot" />
                Good
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
