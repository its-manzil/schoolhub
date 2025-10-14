"use client";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  return (
    <div style={{padding:40}}>
      <h1>SchoolHub ERP</h1>
      <p>Centralized School Management System.</p>
      <div style={{marginTop:16}}>
        {user ? (
          <Link href="/dashboard" style={{padding:"8px 12px", background:"#fff", color:"#111", borderRadius:6, border:"1px solid #e5e7eb"}}>Go to Dashboard</Link>
        ) : (
          <Link href="/login" style={{padding:"8px 12px", background:"#fff", color:"#111", borderRadius:6, border:"1px solid #e5e7eb"}}>Login</Link>
        )}
      </div>
    </div>
  );
}
