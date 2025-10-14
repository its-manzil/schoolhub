"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function SuperAdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) return;
    // Mock-only: separate super admin login
    login(userId, "SUPER_ADMIN");
    router.replace("/dashboard");
  };

  return (
    <div style={{maxWidth:420, margin:"40px auto", padding:20}}>
      <h1>Super Admin Login</h1>
      <p>Enter global admin credentials.</p>
      <form onSubmit={onSubmit} style={{display:"grid", gap:10}}>
        <label>
          User ID or Username
          <input value={userId} onChange={(e)=>setUserId(e.target.value)} placeholder="e.g. superadmin" />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••" />
        </label>
        <button type="submit" className="primary">Login</button>
      </form>
    </div>
  );
}
