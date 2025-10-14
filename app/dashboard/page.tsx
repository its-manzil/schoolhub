"use client";
import Protected from "../components/Protected";
import { useAuth } from "../context/AuthContext";
import { list } from "../lib/db";
import type { FeeInvoice } from "../lib/types";

export default function Dashboard() {
  const { user } = useAuth();
  const students = list("students");
  const teachers = list("teachers");
  const classes = list("classes");
  const fees = list("fees") as FeeInvoice[];

  return (
    <Protected>
      <div style={{padding:20}}>
        <h1>Dashboard</h1>
        <p>Welcome, {user?.name}. Role: {user?.role}</p>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:12, marginTop:16}}>
          <Card title="Students" value={students.length} href="/students" />
          <Card title="Teachers" value={teachers.length} href="/teachers" />
          <Card title="Classes" value={classes.length} href="/classes" />
          <Card title="Due Invoices" value={fees.filter((f)=>f.status==='DUE').length} href="/fees" />
        </div>
      </div>
    </Protected>
  );
}

function Card({ title, value, href }: { title: string; value: number; href: string }) {
  return (
    <a href={href} style={{border:"1px solid #eee", padding:16, borderRadius:8, display:"block"}}>
      <div style={{fontSize:12, color:"#666"}}>{title}</div>
      <div style={{fontSize:28, fontWeight:700}}>{value}</div>
    </a>
  );
}
