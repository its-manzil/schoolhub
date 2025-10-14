"use client";
import { useMemo, useState } from "react";
import Protected from "../components/Protected";
import { add, list, remove, update } from "../lib/db";
import type { FeeInvoice, Student } from "../lib/types";

export default function FeesPage() {
  const initial = useMemo(()=> list("fees") as FeeInvoice[], []);
  const students = useMemo(()=> list("students") as Student[], []);
  const [items, setItems] = useState<FeeInvoice[]>(initial);
  const [studentId, setStudentId] = useState<string>(students[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number>(0);

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !title || amount<=0) return;
    const created = add("fees", { studentId, title, amount, status: "DUE" });
    setItems(prev=>[...prev, created as FeeInvoice]);
    setTitle("");
    setAmount(0);
  };

  const onDelete = (id: string) => {
    remove("fees", id);
    setItems(prev=>prev.filter(f=>f.id!==id));
  };

  const markPaid = (id: string) => {
    const upd = update("fees", id, { status: "PAID" }) as FeeInvoice | null;
    if (upd) setItems(prev=>prev.map(f=> f.id===id? upd: f));
  };

  return (
    <Protected roles={["SUPER_ADMIN","ADMIN_FINANCE","PARENT"]}>
      <div style={{padding:20}}>
        <h1>Fees</h1>
        <form onSubmit={onAdd} style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:8, alignItems:"end", marginTop:12}}>
          <label>Student<select value={studentId} onChange={(e)=>setStudentId(e.target.value)}>{students.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label>Title<input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Fee title"/></label>
          <label>Amount<input type="number" value={amount} onChange={(e)=>setAmount(parseFloat(e.target.value||"0"))} /></label>
          <button type="submit">Add</button>
        </form>
        <table style={{width:"100%", marginTop:16, borderCollapse:"collapse"}}>
          <thead><tr><th align="left">Student</th><th align="left">Title</th><th align="left">Amount</th><th align="left">Status</th><th></th></tr></thead>
          <tbody>
            {items.map(inv=> {
              const st = students.find(s=>s.id===inv.studentId);
              return (
                <tr key={inv.id} style={{borderTop:"1px solid #eee"}}>
                  <td>{st?.name || inv.studentId}</td>
                  <td>{inv.title}</td>
                  <td>Rs. {inv.amount}</td>
                  <td>{inv.status}</td>
                  <td style={{display:"flex", gap:6}}>
                    {inv.status!=="PAID" && <button onClick={()=>markPaid(inv.id)}>Mark Paid</button>}
                    <button onClick={()=>onDelete(inv.id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Protected>
  );
}
