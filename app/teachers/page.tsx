"use client";
import { useMemo, useState } from "react";
import Protected from "../components/Protected";
import { add, list, remove } from "../lib/db";
import type { Teacher } from "../lib/types";

export default function TeachersPage() {
  const initial = useMemo(() => list("teachers") as Teacher[], []);
  const [items, setItems] = useState<Teacher[]>(initial);
  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState("");

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const created = add("teachers", { name, subjects: subjects.split(",").map(s=>s.trim()).filter(Boolean) });
    setItems((prev)=>[...prev, created as Teacher]);
    setName("");
    setSubjects("");
  };

  const onDelete = (id: string) => {
    remove("teachers", id);
    setItems((prev)=>prev.filter(t=>t.id!==id));
  };

  return (
    <Protected roles={["SUPER_ADMIN","ADMIN_ACADEMIC"]}>
      <div style={{padding:20}}>
        <h1>Teachers</h1>
        <form onSubmit={onAdd} style={{display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:8, alignItems:"end", marginTop:12}}>
          <label>Name<input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Full name"/></label>
          <label>Subjects<input value={subjects} onChange={(e)=>setSubjects(e.target.value)} placeholder="Comma separated"/></label>
          <button type="submit">Add</button>
        </form>
        <table style={{width:"100%", marginTop:16, borderCollapse:"collapse"}}>
          <thead><tr><th align="left">Name</th><th align="left">Subjects</th><th></th></tr></thead>
          <tbody>
            {items.map(t=> (
              <tr key={t.id} style={{borderTop:"1px solid #eee"}}>
                <td>{t.name}</td>
                <td>{t.subjects.join(", ")}</td>
                <td><button onClick={()=>onDelete(t.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Protected>
  );
}
