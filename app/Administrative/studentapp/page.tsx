"use client";

import { useState } from "react";
import Layout from "../components/AdmLayout";

export default function StudentAppPage() {
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; date: string }[]>([]);

  const handleDownload = (file: string) => {
    alert(`Starting download for ${file}...`);
    // Mocking download by creating a temporary link
    const link = document.createElement('a');
    link.href = '#';
    link.setAttribute('download', file);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles(prev => [{ name: file.name, date: new Date().toLocaleDateString() }, ...prev]);
      alert(`File "${file.name}" uploaded successfully!`);
    }
  };

  return (
    <Layout>
      <div style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "white", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "25px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }}>
        <div>
          <h2 style={{ fontSize: "22px", marginBottom: "5px" }}>Welcome back, John!</h2>
          <p style={{ fontSize: "14px", opacity: 0.9 }}>Grade 10 - Section A | Roll No: 1001</p>
        </div>
        <div style={{ backgroundColor: "rgba(255, 255, 255, 0.2)", padding: "8px 15px", borderRadius: "20px", fontSize: "14px", fontWeight: "600" }}>
          ⚡ 2 Tasks Due This Week
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "25px" }}>
        <div>
          <div className="card">
            <div className="card-title">My Schedule Today</div>

            <div style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #edf2f7" }}>
              <div style={{ width: "80px", fontSize: "13px", fontWeight: "600", color: "#718096" }}>09:00 AM</div>
              <div style={{ flex: 1, fontSize: "14px", color: "#2d3748", fontWeight: "600" }}>Advanced Mathematics</div>
              <div style={{ fontSize: "12px", color: "#718096", fontStyle: "italic" }}>Room 102</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", padding: "12px", borderBottom: "none", backgroundColor: "#ebf8ff", borderRadius: "8px", margin: "5px 0" }}>
              <div style={{ width: "80px", fontSize: "13px", fontWeight: "600", color: "#2b6cb0" }}>10:00 AM</div>
              <div style={{ flex: 1, fontSize: "14px", color: "#2d3748", fontWeight: "600" }}>
                Physics{" "}
                <span style={{ fontSize: "11px", background: "#bee3f8", padding: "2px 6px", borderRadius: "10px", color: "#2b6cb0" }}>
                  Ongoing
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "#718096", fontStyle: "italic" }}>Lab 2</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "none" }}>
              <div style={{ width: "80px", fontSize: "13px", fontWeight: "600", color: "#718096" }}>11:30 AM</div>
              <div style={{ flex: 1, fontSize: "14px", color: "#2d3748", fontWeight: "600" }}>English Literature</div>
              <div style={{ fontSize: "12px", color: "#718096", fontStyle: "italic" }}>Room 105</div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Submit Assignment / Attachment</div>
            <div 
              className="file-upload-btn" 
              style={{ width: '100%', textAlign: 'center', padding: '30px', borderStyle: 'dashed' }}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input 
                type="file" 
                id="file-input" 
                style={{ display: 'none' }} 
                onChange={handleFileUpload}
              />
              <p style={{ fontSize: '16px', fontWeight: 600 }}>Click to select or drag and drop files</p>
              <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '5px' }}>PDF, DOCX, or Images (Max 10MB)</p>
            </div>

            {uploadedFiles.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Recent Uploads</p>
                {uploadedFiles.map((f, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", backgroundColor: "#f7fafc", borderRadius: "6px", marginBottom: "10px", fontSize: "14px" }}>
                    <span>✅ {f.name}</span>
                    <span style={{ fontSize: '12px', color: '#a0aec0' }}>{f.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title">My Assignments</div>

            <div style={{ borderLeft: "4px solid #f59e0b", backgroundColor: "#fffbeb", padding: "12px", borderRadius: "4px", marginBottom: "12px" }}>
              <p style={{ fontWeight: 600, fontSize: "14px", color: "#2d3748", marginBottom: "4px" }}>Math: Complete Exercise 4B</p>
              <p style={{ fontSize: "13px", color: "#4a5568" }}>
                Solve all geometry proofs from page 84.
              </p>
              <div style={{ fontSize: "12px", color: "#d97706", fontWeight: "600" }}>Due: Tomorrow</div>
            </div>

            <div style={{ borderLeft: "4px solid #cbd5e1", backgroundColor: "#f8fafc", padding: "12px", borderRadius: "4px", marginBottom: "12px" }}>
              <p style={{ fontWeight: 600, fontSize: "14px", color: "#718096", marginBottom: "4px" }}>
                Physics: Read Chapter 3 (Upcoming)
              </p>
              <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>
                Due: Friday
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-title">Study Materials</div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", backgroundColor: "#f7fafc", borderRadius: "6px", marginBottom: "10px", fontSize: "14px" }}>
              <span>📄 Math_Ch4_Formulas.pdf</span>
              <button style={{ background: "none", border: "none", color: "#2563eb", fontWeight: "600", cursor: "pointer" }} onClick={() => handleDownload("Math_Ch4_Formulas.pdf")}>Download</button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", backgroundColor: "#f7fafc", borderRadius: "6px", marginBottom: "10px", fontSize: "14px" }}>
              <span>📄 Physics_Lab_Safety.pdf</span>
              <button style={{ background: "none", border: "none", color: "#2563eb", fontWeight: "600", cursor: "pointer" }} onClick={() => handleDownload("Physics_Lab_Safety.pdf")}>Download</button>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Daily Reminder</div>
            <p style={{ fontSize: "14px", color: "#4a5568", lineHeight: "1.5" }}>
              Don&apos;t forget that the annual science fair registrations close this
              Friday. See your class teacher for details!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
