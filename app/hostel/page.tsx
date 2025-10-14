"use client";
import { useMemo, useState } from "react";
import Protected from "../components/Protected";
import { add, list, remove } from "../lib/db";
import type { HostelRoom } from "../lib/types";

export default function HostelPage() {
  const initial = useMemo(()=> list("hostel") as HostelRoom[], []);
  const [items, setItems] = useState<HostelRoom[]>(initial);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState<number>(2);

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || capacity<=0) return;
    const created = add("hostel", { name, capacity, occupants: [] });
    setItems(prev=>[...prev, created as HostelRoom]);
    setName(""); setCapacity(2);
  };

  const onDelete = (id: string) => {
    remove("hostel", id);
    setItems(prev=>prev.filter(r=>r.id!==id));
  };

  return (
    <Protected roles={["SUPER_ADMIN","ADMIN_INVENTORY"]}>
      <div style={{padding:20}}>
        <h1>Hostel</h1>
        <form onSubmit={onAdd} style={{display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:8, alignItems:"end", marginTop:12}}>
          <label>Room<input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Room name/number"/></label>
          <label>Capacity<input type="number" value={capacity} onChange={(e)=>setCapacity(parseInt(e.target.value||"0"))} /></label>
          <button type="submit">Add</button>
        </form>
        <table style={{width:"100%", marginTop:16, borderCollapse:"collapse"}}>
          <thead><tr><th align="left">Room</th><th align="left">Capacity</th><th align="left">Occupants</th><th></th></tr></thead>
          <tbody>
            {items.map(r=> (
              <tr key={r.id} style={{borderTop:"1px solid #eee"}}>
                <td>{r.name}</td>
                <td>{r.capacity}</td>
                <td>{r.occupants.length}</td>
                <td><button onClick={()=>onDelete(r.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Protected>
  );
}
