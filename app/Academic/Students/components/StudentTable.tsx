import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { Student, SchoolInfo, getDefaultProfilePic, getClassName } from '../types';
import { formatStudentIdDisplay } from '../../components/StudentId';

interface StudentTableProps {
  students: Student[];
  schoolInfo: SchoolInfo | null;
  selectedIds: Set<string>;
  onToggleSelection: (studentId: string) => void;
  onToggleAll: () => void;
  onStudentClick: (student: Student) => void;
}

export default function StudentTable({
  students,
  schoolInfo,
  selectedIds,
  onToggleSelection,
  onToggleAll,
  onStudentClick
}: StudentTableProps) {

  const allSelected = students.length > 0 && selectedIds.size === students.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < students.length;

  return (
    <div className="stdd-table-container">
      <table className="stdd-table">
        <thead>
          <tr>
            <th className="stdd-text-center" style={{ width: '60px' }}>
              <div
                style={{ display: 'inline-flex', cursor: 'pointer' }}
                onClick={onToggleAll}
              >
                <div className={`stdd-checkbox ${allSelected ? 'checked' : someSelected ? 'indeterminate' : ''}`}>
                  <Check className="stdd-checkbox-icon" strokeWidth={3} />
                </div>
              </div>
            </th>
            <th>Student</th>
            <th>Class & Roll</th>
            <th>Parent Contact</th>
            <th>Status</th>
            <th className="stdd-text-right">Added On</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const isSelected = selectedIds.has(student._id);

            return (
              <tr
                key={student._id}
                className={isSelected ? 'selected' : ''}
                onClick={() => onStudentClick(student)}
              >
                <td className="stdd-text-center">
                  <div
                    style={{ display: 'inline-flex', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelection(student._id);
                    }}
                  >
                    <div className={`stdd-checkbox ${isSelected ? 'checked' : ''}`}>
                      <Check className="stdd-checkbox-icon" strokeWidth={3} />
                    </div>
                  </div>
                </td>
                <td>
                  <div className="stdd-td-profile">
                    <Image
                      src={student.profilePicture || getDefaultProfilePic(student.name, student.gender)}
                      alt={student.name}
                      width={40}
                      height={40}
                      className="stdd-td-avatar"
                    />
                    <div className="stdd-td-info-wrap">
                      <div className="stdd-td-name">{student.name}</div>
                      <div className="stdd-td-sub">ID: {formatStudentIdDisplay(student, schoolInfo)}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="stdd-td-val">{student.className ? getClassName(student.className) : 'N/A'}-{student.section || 'N/A'}</div>
                  <div className="stdd-td-val-sub">Roll: {student.rollNumber || 'N/A'}</div>
                </td>
                <td>
                  <div className="stdd-td-val">{student.fatherName || 'N/A'}</div>
                  <div className="stdd-td-val-sub">{student.fatherPhone || 'N/A'}</div>
                </td>
                <td>
                  <span className={`stdd-badge ${student.isActive ? 'stdd-badge-success' : 'stdd-badge-danger'}`}>
                    <div className="stdd-dot" />
                    {student.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="stdd-text-right stdd-td-val-sub">
                  {new Date(student.createdAt).toLocaleDateString()}
                </td>
              </tr>
            );
          })}

          {students.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ color: 'var(--stdd-text-muted)', fontWeight: 600 }}>No students found</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
