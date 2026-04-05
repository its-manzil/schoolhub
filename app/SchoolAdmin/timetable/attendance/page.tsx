"use client";

import { useState, useEffect } from "react";
import Layout from "../../Components/Layout";

interface AttendanceRecord {
  id: number;
  name: string;
  status: string;
  note: string;
}

export default function AttendancePage() {
  const [students, setStudents] = useState<AttendanceRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [classSelect, setClassSelect] = useState("Grade 10 - A");
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Mock data for different classes
  const mockStudents: Record<string, AttendanceRecord[]> = {
    "Grade 10 - A": [
      { id: 1001, name: "John Doe", status: "Present", note: "" },
      { id: 1002, name: "Jane Smith", status: "Present", note: "" },
      { id: 1003, name: "Alex Turner", status: "Absent", note: "Medical Leave" },
    ],
    "Grade 10 - B": [
      { id: 1005, name: "Alice Johnson", status: "Present", note: "" },
      { id: 1006, name: "Bob Wilson", status: "Present", note: "" },
    ],
    "Grade 9 - A": [
      { id: 1008, name: "Charlie Brown", status: "Present", note: "" },
      { id: 1009, name: "Daisy Miller", status: "Present", note: "" },
    ]
  };

  const handleStatusChange = (id: number, status: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleNoteChange = (id: number, note: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, note } : s));
  };

  const handleSave = () => {
    alert(`Attendance for ${classSelect} on ${date} saved successfully!\nTotal Present: ${students.filter(s => s.status === 'Present').length}`);
    console.log("Saving attendance:", students);
  };

  const handleLoad = () => {
    setStudents(mockStudents[classSelect] || []);
    setIsLoaded(true);
    alert(`Student list loaded for ${classSelect}`);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="admin-page-subtitle">Today&apos;s Attendance</div>
          <div className="admin-page-title" style={{ color: "#2563eb", marginTop: "10px" }}>
            {isLoaded ? `${((students.filter(s => s.status === 'Present').length / students.length) * 100 || 0).toFixed(1)}%` : "---"}
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="admin-page-subtitle">Present Students</div>
          <div className="admin-page-title" style={{ marginTop: "10px" }}>{isLoaded ? students.filter(s => s.status === 'Present').length : "---"}</div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="admin-page-subtitle">Absent Students</div>
          <div className="admin-page-title" style={{ color: "#e53e3e", marginTop: "10px" }}>
            {isLoaded ? students.filter(s => s.status === 'Absent').length : "---"}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Mark Bulk Attendance</div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="att-class">Select Class</label>
            <select id="att-class" value={classSelect} onChange={(e) => {
              setClassSelect(e.target.value);
              setIsLoaded(false);
            }}>
              <option>Grade 10 - A</option>
              <option>Grade 10 - B</option>
              <option>Grade 9 - A</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="att-date">Date</label>
            <input
              type="date"
              id="att-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ justifyContent: "flex-end" }}>
            <button className="submit-btn" style={{ width: "fit-content" }} onClick={handleLoad}>
              Load Student List
            </button>
          </div>
        </div>
      </div>

      {isLoaded ? (
        <div className="table-wrapper">
          <div className="table-title">Roll Call: {classSelect}</div>
          <table>
            <thead>
              <tr>
                <th>Roll No.</th>
                <th>Student Name</th>
                <th>Status</th>
                <th>Remarks / Notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>
                    <div style={{ display: "flex", gap: "15px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                        <input
                          type="radio"
                          name={`att-${student.id}`}
                          checked={student.status === "Present"}
                          onChange={() => handleStatusChange(student.id, "Present")}
                        /> P
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                        <input
                          type="radio"
                          name={`att-${student.id}`}
                          checked={student.status === "Absent"}
                          onChange={() => handleStatusChange(student.id, "Absent")}
                        /> A
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                        <input
                          type="radio"
                          name={`att-${student.id}`}
                          checked={student.status === "Late"}
                          onChange={() => handleStatusChange(student.id, "Late")}
                        /> L
                      </label>
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Add note..."
                      value={student.note}
                      onChange={(e) => handleNoteChange(student.id, e.target.value)}
                      style={{
                        border: "1px solid #edf2f7",
                        padding: "5px",
                        borderRadius: "4px",
                        width: '100%'
                      }}
                    />
                  </td>
                  <td>
                    <span className={`badge badge-${student.status.toLowerCase()}`}>
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="action-row">
            <button className="submit-btn" onClick={handleSave}>Save Daily Attendance</button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
          Please select a class and click &quot;Load Student List&quot; to begin marking attendance.
        </div>
      )}
    </Layout>
  );
}
