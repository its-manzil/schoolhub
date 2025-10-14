"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../lib/types";

const roles: Role[] = [
  "ADMIN_FINANCE",
  "ADMIN_ACADEMIC",
  "ADMIN_INVENTORY",
  "TEACHER",
  "STUDENT",
  "PARENT",
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(roles[0]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) return;
    // Mock auth: accept any non-empty credentials
    login(userId, role);
    router.replace("/dashboard");
  };

  return (
    <div style={{maxWidth:420, margin:"40px auto", padding:20}}>
      <h1>Login</h1>
      <p>Please enter your credentials and select your role.</p>
      <form onSubmit={onSubmit} style={{display:"grid", gap:10}}>
        <label>
          User ID or Username
          <input value={userId} onChange={(e)=>setUserId(e.target.value)} placeholder="e.g. user123" />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••" />
        </label>
        <label>
          Role
          <select value={role} onChange={(e)=>setRole(e.target.value as Role)}>
            {roles.map(r=> <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <button type="submit">Login</button>
      </form>
      <div style={{marginTop:12, fontSize:14}}>
        Super Admin? <a href="/superadmin/login" style={{textDecoration:"underline"}}>Login here</a>
      </div>
    </div>
  );
}
