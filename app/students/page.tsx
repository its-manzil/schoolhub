"use client";
import { useMemo, useState } from "react";
import Protected from "../components/Protected";
import { add, list, remove } from "../lib/db";
import type { Student, ClassRoom } from "../lib/types";

export default function StudentsPage() {
  const initial = useMemo(() => list("students") as Student[], []);
  const classes = useMemo(() => list("classes") as ClassRoom[], []);
  const [items, setItems] = useState<Student[]>(initial);
  const [name, setName] = useState("");
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [guardian, setGuardian] = useState("");

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !classId) return;
    const created = add("students", { name, classId, guardian });
    setItems((prev) => [...prev, created as Student]);
    setName("");
    setGuardian("");
  };

  const onDelete = (id: string) => {
    remove("students", id);
    setItems((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <Protected roles={["SUPER_ADMIN"]}>
      <div style={{padding:20}}>
        <h1>Students</h1>
        <form onSubmit={onAdd} style={{display:"grid", gridTemplateColumns:"1fr 200px 1fr auto", gap:8, alignItems:"end", marginTop:12}}>
          <label> Name<input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Full name"/></label>
          <label> Class<select value={classId} onChange={(e)=>setClassId(e.target.value)}>
            {classes.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></label>
          <label> Guardian<input value={guardian} onChange={(e)=>setGuardian(e.target.value)} placeholder="Guardian name"/></label>
          <button type="submit" style={{padding:"8px 12px"}}>Add</button>
        </form>
        <table style={{width:"100%", marginTop:16, borderCollapse:"collapse"}}>
          <thead><tr><th align="left">Name</th><th align="left">Class</th><th align="left">Guardian</th><th></th></tr></thead>
          <tbody>
            {items.map(s=> {
              const cls = classes.find(c=>c.id===s.classId);
              return (
                <tr key={s.id} style={{borderTop:"1px solid #eee"}}>
                  <td>{s.name}</td>
                  <td>{cls?.name || s.classId}</td>
                  <td>{s.guardian || "-"}</td>
                  <td><button onClick={()=>onDelete(s.id)} style={{padding:"4px 8px"}}>Delete</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Protected>
  );
}
