"use client";
import { useMemo, useState } from "react";
import Protected from "../components/Protected";
import { add, list, remove, update } from "../lib/db";
import type { InventoryItem } from "../lib/types";

export default function InventoryPage() {
  const initial = useMemo(()=> list("inventory") as InventoryItem[], []);
  const [items, setItems] = useState<InventoryItem[]>(initial);
  const [name, setName] = useState("");
  const [qty, setQty] = useState<number>(1);
  const [type, setType] = useState<"FIXED"|"CURRENT">("CURRENT");

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || qty<=0) return;
    const created = add("inventory", { name, qty, type });
    setItems(prev=>[...prev, created as InventoryItem]);
    setName(""); setQty(1); setType("CURRENT");
  };

  const onDelete = (id: string) => {
    remove("inventory", id);
    setItems(prev=>prev.filter(i=>i.id!==id));
  };

  const adjust = (id: string, delta: number) => {
    const item = items.find(i=>i.id===id);
    if (!item) return;
    const upd = update("inventory", id, { qty: Math.max(0, item.qty + delta) }) as InventoryItem | null;
    if (upd) setItems(prev=>prev.map(i=> i.id===id? upd: i));
  };

  return (
    <Protected roles={["SUPER_ADMIN","ADMIN_INVENTORY"]}>
      <div style={{padding:20}}>
        <h1>Inventory</h1>
        <form onSubmit={onAdd} style={{display:"grid", gridTemplateColumns:"1fr 120px 150px auto", gap:8, alignItems:"end", marginTop:12}}>
          <label>Name<input value={name} onChange={(e)=>setName(e.target.value)} /></label>
          <label>Qty<input type="number" value={qty} onChange={(e)=>setQty(parseInt(e.target.value||"0"))} /></label>
          <label>Type<select value={type} onChange={(e)=>setType(e.target.value as any)}>
            <option value="CURRENT">CURRENT</option>
            <option value="FIXED">FIXED</option>
          </select></label>
          <button type="submit">Add</button>
        </form>
        <table style={{width:"100%", marginTop:16, borderCollapse:"collapse"}}>
          <thead><tr><th align="left">Name</th><th align="left">Qty</th><th align="left">Type</th><th></th></tr></thead>
          <tbody>
            {items.map(i=> (
              <tr key={i.id} style={{borderTop:"1px solid #eee"}}>
                <td>{i.name}</td>
                <td>{i.qty}</td>
                <td>{i.type}</td>
                <td style={{display:"flex", gap:6}}>
                  <button onClick={()=>adjust(i.id, 1)}>+1</button>
                  <button onClick={()=>adjust(i.id, -1)}>-1</button>
                  <button onClick={()=>onDelete(i.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Protected>
  );
}
