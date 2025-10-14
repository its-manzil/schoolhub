"use client";
import { useMemo, useState } from "react";
import Protected from "../components/Protected";
import { add, list, remove } from "../lib/db";
import type { Notice, Role } from "../lib/types";

const audiences: (Role|"ALL")[] = ["ALL","SUPER_ADMIN","ADMIN_FINANCE","ADMIN_ACADEMIC","ADMIN_INVENTORY","TEACHER","STUDENT","PARENT"];

export default function NoticesPage() {
  const initial = useMemo(()=> (list("notices") as Notice[]) ?? [], []);
  const [items, setItems] = useState<Notice[]>(initial);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<(Role|"ALL")[]>(["ALL"]);

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    const m = message.trim();
    if (!t) return;
    const created = add("notices", { title: t, message: m, audience, date: new Date().toISOString() });
    setItems(prev=>[...prev, created as Notice]);
    setTitle(""); setMessage(""); setAudience(["ALL"]);
  };

  const onDelete = (id: string) => {
    remove("notices", id);
    setItems(prev=>prev.filter(n=>n.id!==id));
  };

  const toggleAudience = (val: Role|"ALL") => {
    setAudience(prev => prev.includes(val) ? prev.filter(x=>x!==val) : [...prev, val]);
  };

  return (
    <Protected>
      <div style={{padding:20}}>
        <h1>Notices</h1>
        <form onSubmit={onAdd} style={{display:"grid", gap:8, marginTop:12}}>
          <label>Title<input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Notice title" /></label>
          <label>Message<textarea value={message} onChange={(e)=>setMessage(e.target.value)} rows={4} placeholder="Write the announcement..." /></label>
          <div>
            <div style={{fontSize:12, color:"#666", marginBottom:6}}>Audience</div>
            <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
              {audiences.map(a=> (
                <label key={a} style={{display:"flex", alignItems:"center", gap:6}}>
                  <input type="checkbox" checked={audience.includes(a)} onChange={()=>toggleAudience(a)} />
                  {a}
                </label>
              ))}
            </div>
          </div>
          <div style={{display:"flex", gap:8}}>
            <button type="submit">Publish</button>
            <button type="button" onClick={()=>{setTitle(""); setMessage(""); setAudience(["ALL"]);}}>Clear</button>
          </div>
        </form>
        <div style={{marginTop:16, display:"grid", gap:12, gridTemplateColumns:"1fr", alignItems:"start"}}>
          {items.map(n=> (
            <article key={n.id} style={{border:"1px solid #eee", borderRadius:12, padding:12}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:8}}>
                <strong style={{fontSize:16}}>{n.title}</strong>
                <button onClick={()=>onDelete(n.id)}>Delete</button>
              </div>
              <div style={{fontSize:12, color:"#666", marginTop:4}}>{new Date(n.date).toLocaleString()}</div>
              {n.message && <p style={{marginTop:8}}>{n.message}</p>}
              <div style={{fontSize:12, color:"#666", marginTop:8}}>Audience: {n.audience.join(", ")}</div>
            </article>
          ))}
        </div>
      </div>
    </Protected>
  );
}
