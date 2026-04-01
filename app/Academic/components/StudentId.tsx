"use client";

import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import "./StudentId.css";

export interface StudentIdStudent {
  name: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  className: string;
  section: string;
  rollNumber?: number | string;
  bloodGroup?: string;
  studentId: string;
  profilePicture?: string;
}

export interface StudentIdSchoolInfo {
  name?: string;
  tagline?: string;
  address?: string;
  phone?: string;
  logo?: string;
  principalName?: string;
  principalSignature?: string;
  subscription?: {
    expiryDate?: string;
  };
}

export interface StudentIdProps {
  student: StudentIdStudent;
  schoolInfo: StudentIdSchoolInfo | null;
  getDefaultProfilePic: (name: string, gender: string) => string;
  getClassName: (classCode: string) => string;
  calculateValidUntil: () => string;
}

export function getSchoolCodeFromName(name?: string | null) {
  if (!name) return "SCH";
  const parts = name.trim().split(/\s+/);
  const initials = parts.map((part) => part[0]?.toUpperCase() || "").join("");
  return initials.slice(0, 3) || "SCH";
}

export function formatStudentIdDisplay(
  student: StudentIdStudent,
  schoolInfo: StudentIdSchoolInfo | null
) {
  const schoolCode = getSchoolCodeFromName(schoolInfo?.name || null);
  const year = new Date().getFullYear().toString();
  const rawRoll = (student.rollNumber ?? student.studentId) as unknown as string;
  const numericRoll = parseInt(String(rawRoll).replace(/\D/g, ""), 10);
  const rollPart = Number.isNaN(numericRoll)
    ? "000"
    : numericRoll.toString().padStart(3, "0");
  return `${schoolCode}-${year}-${rollPart}`;
}

export default function StudentId({
  student,
  schoolInfo,
  getDefaultProfilePic,
  getClassName,
  calculateValidUntil,
}: StudentIdProps) {
  const formattedId = formatStudentIdDisplay(student, schoolInfo);
  const formattedClassName = `${student.className ? getClassName(student.className) : 'N/A'} ${student.section || 'A'}`;
  const formattedDOB = student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : 'N/A';

  return (
    <div className="id-card">
      <header className="id-header">
        <div className="logo-container">
          {schoolInfo?.logo ? (
            <Image
              src={
                schoolInfo.logo.startsWith("data:")
                  ? schoolInfo.logo
                  : `data:image/jpeg;base64,${schoolInfo.logo}`
              }
              alt="School Logo"
              width={36}
              height={36}
              className="school-logo"
            />
          ) : (
            <div className="logo-placeholder">
              {getSchoolCodeFromName(schoolInfo?.name || null)}
            </div>
          )}
        </div>
        <div className="school-info">
          <div className="school-name">{schoolInfo?.name || "School Name"}</div>
          <div className="school-tagline">{schoolInfo?.tagline || "Official Student Identity Card"}</div>
        </div>
      </header>
      
      <main className="id-body">
        {/* Left: Photo | Right: QR Code - 3px gap */}
        <div className="main-content">
          <div className="photo-section">
            <div className="photo-frame">
              <Image
                src={
                  student.profilePicture ||
                  getDefaultProfilePic(student.name, student.gender)
                }
                alt={student.name}
                width={90}
                height={90}
                className="student-photo"
              />
            </div>
            <div className="photo-label">PHOTO</div>
          </div>
          
          <div className="qr-section">
            <div className="qr-container">
              <QRCodeSVG
                value={formattedId}
                size={86}
                level="H"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            
            {/* Student ID - Same font/style as Photo label */}
            <div className="student-id-text">
              {formattedId}
            </div>
          </div>
        </div>
        
        {/* REMOVED Orange separator line */}
        
        {/* Student Details - SINGLE COLUMN - HALF font size */}
        <div className="details-section">
          <div className="details-header">
            <span className="details-header-text">STUDENT DETAILS</span>
          </div>
          <dl className="details-list">
            <div className="details-row">
              <dt>Name:</dt>
              <dd>{student.name}</dd>
            </div>
            <div className="details-row">
              <dt>Class:</dt>
              <dd>{formattedClassName}</dd>
            </div>
            <div className="details-row">
              <dt>Roll No:</dt>
              <dd>{student.rollNumber || "N/A"}</dd>
            </div>
            <div className="details-row">
              <dt>DOB:</dt>
              <dd>{formattedDOB}</dd>
            </div>
            <div className="details-row">
              <dt>Gender:</dt>
              <dd>
                {student.gender.charAt(0).toUpperCase() +
                  student.gender.slice(1)}
              </dd>
            </div>
            <div className="details-row">
              <dt>Valid Upto:</dt>
              <dd>{calculateValidUntil()}</dd>
            </div>
            <div className="details-row">
              <dt>Contact:</dt>
              <dd>{student.phone}</dd>
            </div>
          </dl>
        </div>
        
        {/* Empty space for layout */}
        <div className="empty-space"></div>
      </main>
      
      <footer className="id-footer">
        <div className="signature-section">
          <div className="signature-container">
            {schoolInfo?.principalSignature ? (
              <Image
                src={
                  schoolInfo.principalSignature.startsWith("data:")
                    ? schoolInfo.principalSignature
                    : `data:image/jpeg;base64,${schoolInfo.principalSignature}`
                }
                alt="Principal Signature"
                width={90}
                height={35}
                className="principal-signature"
              />
            ) : (
              <div className="signature-line"></div>
            )}
          </div>
          <div className="signature-info">
            <div className="principal-name">{schoolInfo?.principalName || "Principal Name"}</div>
            <div className="principal-title">Principal</div>
          </div>
        </div>
        
        <div className="contact-section">
          <div className="contact-label">For inquiry:</div>
          <div className="contact-phone">{schoolInfo?.phone || "+977-xxxxxxxxxx"}</div>
        </div>
      </footer>
      
      <div className="inspiration-quote">
        &quot;Education is the passport to the future&quot;
      </div>
    </div>
  );
}