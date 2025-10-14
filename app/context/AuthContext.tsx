"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Role, User } from "../lib/types";
import { isBrowser } from "../lib/storage";
import { seedIfEmpty } from "../lib/db";

interface AuthContextValue {
  user: User | null;
  login: (name: string, role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_KEY = "schoolhub-auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    seedIfEmpty();
    if (!isBrowser) return;
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const login = (name: string, role: Role) => {
    const u: User = { id: crypto.randomUUID?.() || String(Date.now()), name, role };
    setUser(u);
    localStorage.setItem(AUTH_KEY, JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
