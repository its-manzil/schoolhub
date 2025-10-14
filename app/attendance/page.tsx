"use client";
import { useMemo, useState } from "react";
import Protected from "../components/Protected";
import { add, list } from "../lib/db";
import type { Attendance, Student, ClassRoom } from "../lib/types";

export default function AttendancePage() {
  const classes = useMemo(()=> list("classes") as ClassRoom[], []);
  const students = useMemo(()=> list("students") as Student[], []);
  const [classId, setClassId] = useState<string>(classes[0]?.id ?? "");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));
  const filtered = students.filter(s=>s.classId===classId);
  const [present, setPresent] = useState<Record<string, boolean>>(() => Object.fromEntries(filtered.map(s=>[s.id, true])));

  const onSave = () => {
    const entries = filtered.map(s=> ({ studentId: s.id, present: !!present[s.id] }));
    const att: Partial<Attendance> = {
      id: `${date}-${classId}`,
      date,
      classId,
      entries,
    } as Attendance;
    add("attendance", att);
    alert("Attendance saved");
  };

  return (
    <Protected roles={["SUPER_ADMIN","ADMIN_ACADEMIC","TEACHER"]}>
      <div style={{padding:20}}>
        <h1>Attendance</h1>
        <div style={{display:"flex", gap:8, marginTop:12}}>
          <label>Date<input type="date" value={date} onChange={(e)=>setDate(e.target.value)}/></label>
          <label>Class<select value={classId} onChange={(e)=>setClassId(e.target.value)}>
            {classes.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></label>
          <button onClick={onSave}>Save</button>
        </div>
        <div style={{marginTop:16}}>
          {filtered.map(s=> (
            <label key={s.id} style={{display:"flex", alignItems:"center", gap:8}}>
              <input type="checkbox" checked={!!present[s.id]} onChange={(e)=>setPresent(prev=>({...prev, [s.id]: e.target.checked}))} />
              {s.name}
            </label>
          ))}
        </div>
      </div>
    </Protected>
  );
}
