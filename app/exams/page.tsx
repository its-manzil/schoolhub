"use client";
import { useMemo, useState } from "react";
import Protected from "../components/Protected";
import { add, list, remove } from "../lib/db";
import type { Exam, ClassRoom } from "../lib/types";

export default function ExamsPage() {
  const initial = useMemo(()=> list("exams") as Exam[], []);
  const classes = useMemo(()=> list("classes") as ClassRoom[], []);
  const [items, setItems] = useState<Exam[]>(initial);
  const [name, setName] = useState("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [classId, setClassId] = useState<string>(classes[0]?.id ?? "");

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !classId) return;
    const created = add("exams", { name, date, classId });
    setItems(prev=>[...prev, created as Exam]);
    setName("");
  };

  const onDelete = (id: string) => {
    remove("exams", id);
    setItems(prev=>prev.filter(x=>x.id!==id));
  };

  return (
    <Protected roles={["SUPER_ADMIN","ADMIN_ACADEMIC","TEACHER"]}>
      <div style={{padding:20}}>
        <h1>Exams</h1>
        <form onSubmit={onAdd} style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:8, alignItems:"end", marginTop:12}}>
          <label>Name<input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Exam name"/></label>
          <label>Date<input type="date" value={date} onChange={(e)=>setDate(e.target.value)} /></label>
          <label>Class<select value={classId} onChange={(e)=>setClassId(e.target.value)}>
            {classes.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></label>
          <button type="submit">Add</button>
        </form>
        <table style={{width:"100%", marginTop:16, borderCollapse:"collapse"}}>
          <thead><tr><th align="left">Name</th><th align="left">Date</th><th align="left">Class</th><th></th></tr></thead>
          <tbody>
            {items.map(x=> {
              const cls = classes.find(c=>c.id===x.classId);
              return (
                <tr key={x.id} style={{borderTop:"1px solid #eee"}}>
                  <td>{x.name}</td>
                  <td>{x.date}</td>
                  <td>{cls?.name || x.classId}</td>
                  <td><button onClick={()=>onDelete(x.id)}>Delete</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Protected>
  );
}
