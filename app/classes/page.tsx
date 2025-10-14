"use client";
import { useMemo, useState } from "react";
import Protected from "../components/Protected";
import { add, list, remove } from "../lib/db";
import type { ClassRoom, Teacher } from "../lib/types";

export default function ClassesPage() {
  const initial = useMemo(()=> list("classes") as ClassRoom[], []);
  const teachers = useMemo(()=> list("teachers") as Teacher[], []);
  const [items, setItems] = useState<ClassRoom[]>(initial);
  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState<string>(teachers[0]?.id ?? "");

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const created = add("classes", { name, teacherId, subjectIds: [] });
    setItems(prev=>[...prev, created as ClassRoom]);
    setName("");
  };

  const onDelete = (id: string) => {
    remove("classes", id);
    setItems(prev=>prev.filter(c=>c.id!==id));
  };

  return (
    <Protected roles={["SUPER_ADMIN","ADMIN_ACADEMIC","TEACHER"]}>
      <div style={{padding:20}}>
        <h1>Classes</h1>
        <form onSubmit={onAdd} style={{display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:8, alignItems:"end", marginTop:12}}>
          <label>Name<input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Class name"/></label>
          <label>Class Teacher<select value={teacherId} onChange={(e)=>setTeacherId(e.target.value)}>
            {teachers.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
          </select></label>
          <button type="submit">Add</button>
        </form>
        <table style={{width:"100%", marginTop:16, borderCollapse:"collapse"}}>
          <thead><tr><th align="left">Name</th><th align="left">Class Teacher</th><th></th></tr></thead>
          <tbody>
            {items.map(c=> {
              const teacher = teachers.find(t=>t.id===c.teacherId);
              return (
                <tr key={c.id} style={{borderTop:"1px solid #eee"}}>
                  <td>{c.name}</td>
                  <td>{teacher?.name || "-"}</td>
                  <td><button onClick={()=>onDelete(c.id)}>Delete</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Protected>
  );
}
